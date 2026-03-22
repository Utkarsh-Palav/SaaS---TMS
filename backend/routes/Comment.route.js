import express from "express";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";

const router = express.Router();

router.post(
  "/:taskId",
  verifyToken,
  authorizePermission("create:comment"),
  addComment
);
router.put(
  "/:commentId",
  verifyToken,
  authorizePermission("update:comment"),
  updateComment
);
router.delete(
  "/:commentId",
  verifyToken,
  authorizePermission("delete:comment"),
  deleteComment
);

export default router;
