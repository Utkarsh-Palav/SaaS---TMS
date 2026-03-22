import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
} from "../controllers/roomController.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", authorizePermission("read:room"), getAllRooms);
router.get("/:id", authorizePermission("read:room"), getRoomById);
router.post("/", authorizePermission("create:room"), createRoom);
router.put("/:id", authorizePermission("update:room"), updateRoom);
router.delete("/:id", authorizePermission("delete:room"), deleteRoom);

export default router;
