import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import {
  registrationEmail,
  sendOTPByEmail,
  sendPasswordResetEmail,
} from "../utils/sendGrid.mail.js";
import crypto from "crypto";
import dotenv from "dotenv";
import Role from "../models/Role.model.js";
import ActivityLog from "../models/activityLog.model.js";
import Subscription from "../models/subscription.js";
import Transaction from "../models/transaction.js";
dotenv.config();

export const registerOrg = async (req, res) => {
  try {
    const profileImageUrl = req.file ? req.file.path : undefined;

    const {
      firstName,
      middleName,
      lastName,
      email,
      contactNo,
      password,
      companyName,
      gstin,
      address,
      city,
      state,
      pincode,
      country,
      logoUrl,
      websiteUrl,
      plan,
      planType,
      razorpayPaymentId,
    } = req.body;

    let transactionRecord = null;

    // --- 1. Validate Payment (For Paid Plans Only) ---
    if (plan !== "free") {
      if (!razorpayPaymentId) {
        return res
          .status(400)
          .json({ message: "Payment ID is required for paid plans" });
      }

      console.log("Searching for Transaction ID:", razorpayPaymentId);

      // Find the transaction created by your verify-payment endpoint
      transactionRecord = await Transaction.findOne({
        razorpayPaymentId: razorpayPaymentId, // Ensure this matches your Transaction schema field name
      });

      if (!transactionRecord) {
        console.log("❌ Transaction not found in DB.");
        return res
          .status(400)
          .json({ message: "Transaction record not found." });
      }

      // Optional: Check if already linked to an org (prevents reuse)
      if (transactionRecord.organizationId) {
        return res
          .status(400)
          .json({
            message: "This payment is already registered to an organization.",
          });
      }
    }

    // --- 2. Standard User/Org Validation ---
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const bossRole = await Role.findOne({ name: "Boss" });
    if (!bossRole) {
      return res
        .status(500)
        .json({ message: "Default 'Boss' role not found." });
    }

    // --- 3. Calculate Subscription Expiry ---
    const now = new Date();
    let expiryDate = null;

    // Logic: Free plans might have no expiry, or set to null
    if (plan !== "free") {
      if (planType === "yearly") now.setFullYear(now.getFullYear() + 1);
      else now.setMonth(now.getMonth() + 1);
      expiryDate = now;
    }

    // --- 4. Create Organization ---
    const newOrg = new Organization({
      name: companyName,
      gstin,
      address,
      city,
      state,
      pincode,
      country,
      logoUrl,
      websiteUrl,
      createdBy: null, // Updated later
      plan: plan,
      planType: planType || "monthly",
      subscriptionExpiresAt: expiryDate,
    });

    // --- 5. Create User ---
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      contactNo,
      password: hashedPassword,
      status: "Active",
      role: bossRole._id,
      jobTitle: "Boss",
      organizationId: newOrg._id,
      departmentId: null,
      profileImage: profileImageUrl,
    });

    await newUser.save();
    newOrg.createdBy = newUser._id;
    await newOrg.save();

    // --- 6. ✅ CREATE SUBSCRIPTION (The Scalable Part) ---
    // Every Organization gets a subscription document.
    // This allows fast access checks without querying heavy transaction logs.
    const newSubscription = new Subscription({
      organizationId: newOrg._id,
      planId: plan, // 'free', 'premium', 'enterprise'
      status: "active", // active
      billingCycle: planType, // monthly/yearly
      startDate: new Date(),
      currentPeriodEnd: expiryDate, // Null for free, Date for paid
    });

    await newSubscription.save();

    // --- 7. ✅ LINK TRANSACTION (Paid Only) ---
    // If they paid, we update the orphaned transaction record with the new Org ID.
    if (transactionRecord) {
      transactionRecord.organizationId = newOrg._id;
      // If your Transaction schema has a userId field:
      // transactionRecord.userId = newUser._id;
      await transactionRecord.save();
    }

    // --- 8. Response ---
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, orgId: newOrg._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    const finalUser = await User.findById(newUser._id)
      .select("-password")
      .populate("role", "_id name")
      .populate("organizationId");

    // Email
    let transactionDetails = null;
    if (plan !== "free" && transactionRecord) {
      transactionDetails = {
        razorpayPaymentId: transactionRecord.razorpayPaymentId,
        amount: transactionRecord.amount / 100,
      };
    }

    await registrationEmail(
      {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        organizationName: newOrg.name,
      },
      plan,
      transactionDetails
    );

    res.status(201).json({
      message: "Organization registered successfully",
      user: finalUser,
      token,
    });
  } catch (error) {
    console.error("Error in registerOrg:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate("organizationId", "name country logoUrl")
      .populate("role", "_id name");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationId: user.organizationId._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.status = "Active";
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      organizationId: user.organizationId._id,
      loginTime: new Date(),
    });

    const io = req.app.get("io");
    if (user.organizationId && user.organizationId._id) {
      const orgRoomId = user.organizationId._id.toString();

      io.to(orgRoomId).emit("statusUpdate", {
        userId: user._id.toString(),
        status: "Active",
      });
    }

    const { password: pwd, otp, otpExpires, __v, ...safeUser } = user.toObject();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({ message: "Login successful", user: safeUser, token: token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?._id;

    const lastLog = await ActivityLog.findOne({
      userId: userId,
      logoutTime: null,
    }).sort({ loginTime: -1 });

    if (lastLog) {
      const logoutTime = new Date();
      const loginTime = lastLog.loginTime;
      const durationInSeconds = (logoutTime - loginTime) / 1000;

      lastLog.logoutTime = logoutTime;
      lastLog.durationInSeconds = durationInSeconds;
      await lastLog.save();
    }

    if (userId) {
      const user = await User.findByIdAndUpdate(
        userId,
        { status: "Inactive" },
        { new: true }
      );

      const io = req.app.get("io");
      // organizationId is not populated here — use it directly as an ObjectId
      if (user && user.organizationId) {
        io.to(user.organizationId.toString()).emit("statusUpdate", {
          userId: user._id,
          status: "Inactive",
        });
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/forget-password?token=${resetToken}`;
    await sendPasswordResetEmail({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      resetLink,
    });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const razorpay = async (req, res) => {
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: "INR",
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Failed to create order.",
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (isSignatureValid) {
      // ✅ Save to 'Transaction' Collection
      // Note: organizationId is missing here. registerOrg will find this record
      // by razorpay_payment_id and update it with the Org ID later.
      const newTransaction = new Transaction({
        razorpayPaymentId: razorpay_payment_id, // Ensure field name matches Schema
        amount: amount,
        currency: "INR",
        status: "success",
        // We can store order_id in a metadata field if your schema has it, otherwise ignore
      });

      await newTransaction.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified and Transaction recorded.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature.",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification.",
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "If the email is registered, you will receive an OTP shortly.",
      });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration time (e.g., 10 minutes from now)
    const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;

    // Hash OTP before saving
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.otp = hashedOTP;
    user.otpExpires = tenMinutesFromNow;
    await user.save();

    await sendOTPByEmail(user.email, otp);

    res.status(200).json({
      message: "OTP sent to your email. Please check your inbox.",
      email: user.email,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error. Failed to send OTP." });
  }
};

export const verifyOTPAndAllowPasswordChange = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res
        .status(400)
        .json({ message: "No active OTP found for this user." });
    }

    // 1. Check if the OTP has expired
    if (user.otpExpires < Date.now()) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // 2. Compare the submitted OTP with the stored hashed OTP
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP submitted." });
    }

    // 3. OTP is valid and matched. Clear the OTP fields immediately.
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 4. Issue a temporary, short-lived JWT to authorize the password change
    const resetToken = jwt.sign(
      { id: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" } // Token is valid for 10 minutes
    );

    res.status(200).json({
      message: "OTP verified successfully. You can now set a new password.",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Missing reset token" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(400)
          .json({
            message: "Reset token has expired. Please request a new OTP.",
          });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token purpose" });
    }

    const user = await User.findOne({ _id: decoded.id, email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.otp = null;
    user.otpExpires = null;

    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
