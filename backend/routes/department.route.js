import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import {
  changeDepartmentManager,
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartmentWithDetails,
  getSingleDepartmentWithDetails,
} from "../controllers/department.controller.js";

router.get("/", verifyToken, authorizePermission("read:department"), getDepartment);
router.get(
  "/details",
  verifyToken,
  authorizePermission("read:department"),
  getDepartmentWithDetails
);
router.get(
  "/details/:id",
  verifyToken,
  authorizePermission("read:department"),
  getSingleDepartmentWithDetails
);
router.post(
  "/",
  verifyToken,
  authorizePermission("create:department"),
  createDepartment
);
router.put(
  "/manager/change",
  verifyToken,
  authorizePermission("update:department"),
  changeDepartmentManager
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("delete:department"),
  deleteDepartment
);

export default router;
