import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getSingleEmployee,
  listAssignableRolesForEmployee,
  updateOrganizationalDetails,
  updatePersonalDetails,
} from "../controllers/user.controller.js";

router.get(
  "/all-employee",
  verifyToken,
  authorizePermission("read:employee"),
  getAllEmployees
);
router.get(
  "/role-options",
  verifyToken,
  authorizePermission("create:employee"),
  listAssignableRolesForEmployee
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("read:employee"),
  getSingleEmployee
);
router.post(
  "/",
  verifyToken,
  authorizePermission("create:employee"),
  createEmployee
);
router.put(
  "/org/:id",
  verifyToken,
  authorizePermission("update:employee"),
  updateOrganizationalDetails
);
router.put(
  "/personal/:id",
  verifyToken,
  authorizePermission("update:employee"),
  updatePersonalDetails
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("delete:employee"),
  deleteEmployee
);

export default router;
