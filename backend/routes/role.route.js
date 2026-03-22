import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import requireBoss from "../middlewares/requireBoss.js";
import {
  createRole,
  deleteRole,
  getRoleById,
  listRoles,
  updateRole,
} from "../controllers/role.controller.js";
import { listPermissions } from "../controllers/permission.controller.js";

const router = express.Router();

router.use(verifyToken, requireBoss);

router.get("/permissions", listPermissions);
router.get("/", listRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
