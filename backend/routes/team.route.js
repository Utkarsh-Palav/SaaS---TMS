import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizePermission } from "../middlewares/authorizePermission.js";
import {
  addMemberToTeam,
  createTeam,
  deleteTeam,
  removeMemberFromTeam,
} from "../controllers/team.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", authorizePermission("create:team"), createTeam);
router.delete("/:teamId/delete", authorizePermission("delete:team"), deleteTeam);
router.put(
  "/:teamId/add-members",
  authorizePermission("update:team"),
  addMemberToTeam
);
router.put(
  "/:teamId/remove-members",
  authorizePermission("update:team"),
  removeMemberFromTeam
);

export default router;
