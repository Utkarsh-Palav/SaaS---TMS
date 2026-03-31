import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  getIntegrationStatus,
  getGoogleAuthUrl,
  handleGoogleCallback,
  disconnectGoogle,
  getSlackAuthUrl,
  handleSlackCallback,
  disconnectSlack,
  testSlack,
  getGitHubAuthUrl,
  handleGitHubCallback,
  disconnectGitHub,
  testGitHub,
} from "../controllers/integration.controller.js";

const router = express.Router();

router.get("/status", verifyToken, getIntegrationStatus);

router.get("/google/auth", verifyToken, getGoogleAuthUrl);
router.get("/google/callback", handleGoogleCallback);
router.delete("/google/disconnect", verifyToken, disconnectGoogle);

router.get("/slack/auth", verifyToken, getSlackAuthUrl);
router.get("/slack/callback", handleSlackCallback);
router.post("/slack/test", verifyToken, testSlack);
router.delete("/slack/disconnect", verifyToken, disconnectSlack);

router.get("/github/auth", verifyToken, getGitHubAuthUrl);
router.get("/github/callback", handleGitHubCallback);
router.post("/github/test", verifyToken, testGitHub);
router.delete("/github/disconnect", verifyToken, disconnectGitHub);

export default router;
