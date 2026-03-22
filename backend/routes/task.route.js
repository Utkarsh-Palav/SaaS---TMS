import express from "express";
const router = express.Router();

import {
  addEmployeeToTask,
  addMilestones,
  assignTaskToTeam,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  removeEmployeeFromTask,
  updateMilestone,
  updateTaskStatus,
  updateTitleAndDesc,
} from "../controllers/task.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";

router.post(
  "/create",
  verifyToken,
  authorizePermission("create:task"),
  createTask
);
router.delete(
  "/:taskId",
  verifyToken,
  authorizePermission("delete:task"),
  deleteTask
);
router.put(
  "/:taskId/employees/add",
  verifyToken,
  authorizePermission("update:task"),
  addEmployeeToTask
);
router.put(
  "/:taskId/employees/remove/:employeeId",
  verifyToken,
  authorizePermission("update:task"),
  removeEmployeeFromTask
);
router.patch(
  "/:taskId/status",
  verifyToken,
  authorizePermission("update:task"),
  updateTaskStatus
);
router.post(
  "/:taskId/milestone",
  verifyToken,
  authorizePermission("update:task"),
  addMilestones
);
router.patch(
  "/:taskId/milestone",
  verifyToken,
  authorizePermission("update:task"),
  updateMilestone
);
router.post(
  "/:taskId/assign-team",
  verifyToken,
  authorizePermission("update:task"),
  assignTaskToTeam
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("update:task"),
  updateTitleAndDesc
);

router.get(
  "/getTask",
  verifyToken,
  authorizePermission("read:task"),
  getTasks
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("read:task"),
  getTaskById
);

export default router;
