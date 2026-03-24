import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import {
  cancelMeeting,
  createMeeting,
  deleteMeeting,
  getMeetingById,
  getMeetings,
  updateMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", authorizePermission("create:meeting"), createMeeting);
router.get("/", authorizePermission("read:meeting"), getMeetings);
router.get("/:id", authorizePermission("read:meeting"), getMeetingById);
router.put("/:id", updateMeeting);
router.patch("/:id/cancel", cancelMeeting);
router.delete("/:id", deleteMeeting);

export default router;
