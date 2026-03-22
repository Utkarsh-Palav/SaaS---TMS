import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getGoogleAuthUrl, handleGoogleCallback, disconnectGoogle } from "../controllers/integration.controller.js";

const router = express.Router();

router.get("/google/auth", verifyToken, getGoogleAuthUrl);
router.get("/google/callback", handleGoogleCallback);
router.delete("/google/disconnect", verifyToken, disconnectGoogle);

export default router;
