import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import RecentActivity from "../models/recentActivity.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizePermission("read:recentActivity"),
  async (req, res) => {
    try {
      const activites = await RecentActivity.find({
        organizationId: req.user.organizationId,
      })
        .populate("user", "firstName, middleName, lastName")
        .sort({ createdAt: -1 })
        .limit(50);

      res.json(activites);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
