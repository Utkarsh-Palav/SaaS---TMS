import { google } from "googleapis";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const getGoogleAuthUrl = (req, res) => {
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`}/api/v1/integrations/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    prompt: "consent", // Forces a refresh token on every login for stability
    state: req.user._id.toString(), // Passing user ID securely
  });

  res.status(200).json({ url: authorizationUrl });
};

export const handleGoogleCallback = async (req, res) => {
  try {
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`}/api/v1/integrations/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=oauth_failed`);
    }

    const { tokens } = await oauth2Client.getToken(code);
    const userId = state; // We embedded the ID here

    await User.findByIdAndUpdate(userId, {
      googleTokens: tokens,
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?success=google_connected`);
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=oauth_failed`);
  }
};

export const disconnectGoogle = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      $set: { googleTokens: null }
    });

    res.status(200).json({ message: "Google Calendar disconnected successfully" });
  } catch (error) {
    console.error("Disconnect error:", error);
    res.status(500).json({ message: "Failed to disconnect Google Calendar" });
  }
};
