import express from "express";
import {
  EmployeeDirectory,
  employeePageAnalytics,
} from "../controllers/employeePage.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";

const router = express.Router();

router.get(
  "/data1",
  verifyToken,
  authorizePermission("read:employee"),
  EmployeeDirectory
);
router.get(
  "/analytics",
  verifyToken,
  authorizePermission("read:employee"),
  employeePageAnalytics
);

export default router;
