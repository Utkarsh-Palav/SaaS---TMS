import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import { getDeptDetailDashboard } from "../controllers/departmentPage.controller.js";

const router = express.Router();

router.get(
  "/:id/deptdetails-page",
  verifyToken,
  authorizePermission("read:department"),
  getDeptDetailDashboard
);

export default router;
