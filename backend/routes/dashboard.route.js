import express from "express";
import {
  getDashboardAnalytics,
  getMonthyCompletionTrend,
  getOrganizationReport,
  getUpcomingDeadlines,
} from "../controllers/dashboard.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";

const router = express.Router();

router.get(
  "/overview-data1",
  verifyToken,
  authorizePermission("read:dashboard"),
  getDashboardAnalytics
);
router.get(
  "/overview-data2",
  verifyToken,
  authorizePermission("read:dashboard"),
  getMonthyCompletionTrend
);
router.get(
  "/overview-data3",
  verifyToken,
  authorizePermission("read:dashboard"),
  getUpcomingDeadlines
);
router.get(
  "/report-data",
  verifyToken,
  authorizePermission("read:dashboard"),
  getOrganizationReport
);

export default router;
