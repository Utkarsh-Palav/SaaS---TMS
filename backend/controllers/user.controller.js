import User from "../models/user.model.js";
import { sendWelcomeEmail } from "../utils/sendGrid.mail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Department from "../models/department.model.js";
import Role from "../models/Role.model.js";
import ActivityLog from "../models/activityLog.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

/** Roles available in the create-employee form (Boss is not assignable here). */
export const listAssignableRolesForEmployee = async (req, res) => {
  try {
    const roles = await Role.find({ name: { $ne: "Boss" } })
      .select("name")
      .sort({ name: 1 })
      .lean();
    res.json(roles);
  } catch (error) {
    console.error("listAssignableRolesForEmployee:", error);
    res.status(500).json({ message: "Failed to load roles" });
  }
};

export const getAllEmployeesAndStats = async (req, res) => {
  // 1. Calculate the date one year ago
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const organizationId = req.user.organizationId;

  try {
    // --- A. Fetch the Current Employee List ---
    const currentEmployees = await User.find({
      organizationId: organizationId,
    })
      .select("-password -otp -otpExpires") // Include createdAt for new hire calculations on frontend
      .populate({
        path: "departmentId",
        select: "name",
      });

    // --- B. Calculate Current Total Count ---
    const currentEmployeeCount = currentEmployees.length;

    // --- C. Calculate Last Year's Count (Approximation) ---
    // This query attempts to count employees that were 'active' one year ago.
    // It counts users created up to one year ago AND whose 'status' (if you have one)
    // was not set to 'Terminated'/'Resigned' BEFORE the oneYearAgo mark.
    // For simplicity, we'll only use 'createdAt' for now, but a 'status' field is recommended.

    // This is a simple approximation: count everyone created up to one year ago.
    const lastYearCount = await User.countDocuments({
      organizationId: organizationId,
      createdAt: { $lt: oneYearAgo },
      // You SHOULD ideally filter by a status field here if you have one:
      // status: { $ne: 'Terminated' }
    });

    // 4. Send the list and the statistics in a single response object
    res.status(200).json({
      employees: currentEmployees,
      stats: {
        currentCount: currentEmployeeCount,
        lastYearCount: lastYearCount,
      },
    });
  } catch (error) {
    console.error("Error fetching employees and stats:", error);
    // Better to check if the error is from Mongoose or a logic error
    res
      .status(500)
      .json({ message: "Internal server error during data retrieval." });
  }
};

export const getAllEmployees = async (req, res) => {
  const { organizationId } = req.user;
  try {
    const allEmployee = await User.find({
      organizationId: organizationId,
    })
      .select("-password -otp -otpExpires -resetToken -resetTokenExpires")
      .populate("departmentId")
      .populate("role", "_id name");
    res.status(200).json(allEmployee);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleEmployee = async (req, res) => {
  const { id } = req.params;

  const userId = new mongoose.Types.ObjectId(id);
  try {
    const user = await User.findById(id)
      .select("-password -resetToken -resetTokenExpires -__v -otp -otpExpires")
      .populate("departmentId")
      .populate("role", "_id name");

    if (!user) return res.status(404).json({ message: "User not found" });

    const activityLog = await ActivityLog.findOne({ userId: id });

    const userRoleName = user.role?.name;

    let taskFilter = {};

    if (userRoleName === "Boss") {
      taskFilter = { createdBy: userId };
    } else if (userRoleName === "Manager") {
      taskFilter = { assignedManager: userId };
    } else if (userRoleName === "Employee") {
      taskFilter = { assignedEmployees: userId };
    }

    let taskDetails = {
      totalAssignedTasks: 0,
      completedTaskCount: 0,
    };

    let taskList = [];

    if (Object.keys(taskFilter).length > 0) {
      const taskCount = await Task.aggregate([
        { $match: taskFilter },
        {
          $group: {
            _id: null,
            totalAssignedTasks: { $sum: 1 },
            completedTaskCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAssignedTasks: 1,
            completedTaskCount: 1,
          },
        },
      ]);

      taskDetails = taskCount.length > 0 ? taskCount[0] : taskDetails;

      taskList = await Task.find(taskFilter)
        .populate("assignedManager", "username email")
        .populate("createdBy", "username email")
        .populate("assignedEmployees", "username email")
        .sort({ deadline: 1, priority: -1 })
        .lean();
    }

    res.status(200).json({ user, activityLog, taskDetails, taskList });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      contactNo,
      roleName,
      jobTitle,
      departmentId,
      city,
      state,
      country,
      bio,
    } = req.body;

    const emailNorm = String(email ?? "").trim();
    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    if (roleName !== "Boss" && !departmentId) {
      return res.status(400).json({
        message: "A department ID is required for Managers and Employees.",
      });
    }

    const existingUser = await User.findOne({
      email: emailNorm,
      organizationId: req.user.organizationId,
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already registered!" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 🔐 Generate and hash reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    const newEmployee = new User({
      firstName,
      middleName,
      lastName,
      email,
      contactNo,
      password: hashedPassword,
      jobTitle,
      role: role._id,
      departmentId,
      organizationId: req.user.organizationId,
      resetToken: hashedResetToken,
      resetTokenExpires,
      city,
      state,
      country,
      bio,
    });

    await newEmployee.save();

    // Department.manager is a single ObjectId in the schema — not an array.
    // $addToSet was incorrectly used before and could store an array, breaking validation.
    if (roleName === "Manager" && departmentId) {
      const employeeRole = await Role.findOne({ name: "Employee" });
      const deptOid = new mongoose.Types.ObjectId(departmentId);
      const orgOid =
        req.user.organizationId instanceof mongoose.Types.ObjectId
          ? req.user.organizationId
          : new mongoose.Types.ObjectId(req.user.organizationId);

      const existing = await Department.collection.findOne({
        _id: deptOid,
        organizationId: orgOid,
      });

      if (!existing) {
        console.warn(
          `Warning: Could not assign manager. Department ${departmentId} not found in org ${req.user.organizationId}.`
        );
      } else {
        const raw = existing.manager;
        const oldIds = Array.isArray(raw) ? raw : raw ? [raw] : [];
        if (employeeRole) {
          for (const oid of oldIds) {
            if (!oid) continue;
            if (oid.toString() === newEmployee._id.toString()) continue;
            const oldUser = await User.findById(oid);
            if (oldUser) {
              oldUser.role = employeeRole._id;
              await oldUser.save();
            }
          }
        }

        await Department.updateOne(
          { _id: deptOid, organizationId: orgOid },
          { $set: { manager: newEmployee._id } }
        );
      }
    }

    const baseUrl = (
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    ).replace(/\/$/, "");
    const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(emailNorm)}&token=${encodeURIComponent(resetToken)}`;

    const username = `${newEmployee.firstName} ${newEmployee.lastName}`;

    const mailResult = await sendWelcomeEmail({
      email: newEmployee.email,
      name: username,
      role: roleName,
      tempPassword,
      resetLink,
    });

    if (!mailResult) {
      console.error(
        `[createEmployee] Welcome email was not delivered (SendGrid + SMTP failed) for ${emailNorm}. Check logs above.`
      );
    }

    const populatedEmployee = await User.findById(newEmployee._id)
      .select("-password -resetToken -resetTokenExpires")
      .populate("departmentId", "name");

    return res.status(201).json(populatedEmployee);
  } catch (error) {
    console.error("Error registering employee:", error);

    // MongoDB Duplicate Key Error (email already exists in ANY org)
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({
        message: "This email is already registered in another organization.",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, middleName, lastName, email, contactNo, bio } = req.body;

    const employee = await User.findOne({
      _id: id,
      organizationId: req.user.organizationId,
    });

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (employee.role === "Boss") {
      return res.status(403).json({ message: "Cannot modify Boss account" });
    }

    employee.firstName = firstName || employee.firstName;
    employee.middleName = middleName || employee.middleName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    employee.contactNo = contactNo || employee.contactNo;
    employee.bio = bio || employee.bio;

    await employee.save();

    return res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrganizationalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, jobTitle, departmentId } = req.body;

    const employee = await User.findOne({
      _id: id,
      organizationId: req.user.organizationId,
    });

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (employee.role === "Boss") {
      return res.status(403).json({ message: "Cannot modify Boss account" });
    }

    employee.role = role || employee.role;
    employee.jobTitle = jobTitle || employee.jobTitle;
    employee.departmentId = departmentId || employee.departmentId;

    await employee.save();

    return res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get("io");

    const employee = await User.findOneAndDelete({
      _id: id,
      organizationId: req.user.organizationId,
    });

    if (!employee)
      return res
        .status(404)
        .json({ message: "Employee not found or unauthorized" });

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};
