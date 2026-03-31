import express from "express";
const router = express.Router();

import {
  login,
  logout,
  paymentVerification,
  razorpay,
  registerOrg,
  resetPassword,
  sendOTP,
  verifyOTPAndAllowPasswordChange,
} from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import User from "../models/user.model.js";
import { upload } from "../config/cloudinary.js";

router.post(
  "/register-org",
  (req, res, next) => {
    upload.single("profileImage")(req, res, (err) => {
      if (err) {
        // This will print the REAL error causing the 500
        console.error("❌ MULTER/CLOUDINARY ERROR:", err);
        return res.status(500).json({
          message: "Image Upload Failed",
          error: err.message,
        });
      }
      next(); // If no error, proceed to registerOrg controller
    });
  },
  registerOrg
);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/forgot-password", sendOTP);
router.post("/verify-otp", verifyOTPAndAllowPasswordChange);
router.post("/reset-password", resetPassword);
router.post("/create-order", razorpay);
router.post("/verify-payment", paymentVerification);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate(
        "organizationId",
        "name country logoUrl plan planType subscriptionExpiresAt websiteUrl city state address pincode gstin createdAt"
      )
      .populate("role", "_id name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const {
      password: pwd,
      otp,
      otpExpires,
      __v,
      slackOAuth,
      githubOAuth,
      ...safeUser
    } = user.toObject();

    res.status(200).json({
      user: {
        ...safeUser,
        hasSlackOAuth: Boolean(slackOAuth?.accessToken),
        hasGithubOAuth: Boolean(githubOAuth?.accessToken),
      },
    });
  } catch (error) {
    console.error("Error fetching user data for /me:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
