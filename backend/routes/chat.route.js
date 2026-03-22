import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import {
  accessOrCreateChat,
  fetchUserChat,
  getMessagesForChannel,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizePermission("create:chat"),
  accessOrCreateChat
);
router.get(
  "/",
  verifyToken,
  authorizePermission("read:chat"),
  fetchUserChat
);
router.get(
  "/:channelId",
  verifyToken,
  authorizePermission("read:chat"),
  getMessagesForChannel
);

export default router;
