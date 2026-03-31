import { google } from "googleapis";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const backendBase =
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";

const createOauthState = (userId, provider) =>
  jwt.sign(
    { userId: String(userId), provider, purpose: "integration_oauth" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

const verifyOauthState = (state, provider) => {
  const decoded = jwt.verify(state, process.env.JWT_SECRET);
  if (
    decoded?.purpose !== "integration_oauth" ||
    decoded?.provider !== provider ||
    !decoded?.userId
  ) {
    throw new Error("Invalid OAuth state");
  }
  return decoded.userId;
};

const redirectWithResult = (res, result) => {
  res.redirect(`${frontendBase}/settings?${result}`);
};

const sendWebhookMessage = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Webhook failed: ${response.status} ${message}`);
  }
};

export const getIntegrationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "googleTokens slackOAuth githubOAuth"
    );
    return res.status(200).json({
      google: { connected: Boolean(user?.googleTokens) },
      slack: { connected: Boolean(user?.slackOAuth?.accessToken) },
      github: { connected: Boolean(user?.githubOAuth?.accessToken) },
      zoom: { connected: false, available: false },
      teams: { connected: false, available: false },
    });
  } catch (error) {
    console.error("getIntegrationStatus error:", error);
    return res.status(500).json({ message: "Failed to fetch integration status." });
  }
};

export const getGoogleAuthUrl = (req, res) => {
  try {
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const state = createOauthState(req.user._id, "google");
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
      include_granted_scopes: true,
      prompt: "consent",
      state,
    });

    res.status(200).json({ url: authorizationUrl });
  } catch (error) {
    console.error("getGoogleAuthUrl error:", error);
    res.status(500).json({ message: "Failed to start Google OAuth." });
  }
};

export const handleGoogleCallback = async (req, res) => {
  try {
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { code, state } = req.query;
    if (!code || !state) {
      return redirectWithResult(res, "error=google_oauth_failed");
    }

    const userId = verifyOauthState(state, "google");
    const { tokens } = await oauth2Client.getToken(code);

    await User.findByIdAndUpdate(userId, { $set: { googleTokens: tokens } });
    return redirectWithResult(res, "success=google_connected");
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return redirectWithResult(res, "error=google_oauth_failed");
  }
};

export const disconnectGoogle = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { googleTokens: null } });
    res.status(200).json({ message: "Google Calendar disconnected successfully." });
  } catch (error) {
    console.error("disconnectGoogle error:", error);
    res.status(500).json({ message: "Failed to disconnect Google Calendar." });
  }
};

export const getSlackAuthUrl = (req, res) => {
  try {
    if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET) {
      return res
        .status(500)
        .json({ message: "Slack OAuth is not configured on the server." });
    }

    const redirectUri =
      process.env.SLACK_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/slack/callback`;
    const state = createOauthState(req.user._id, "slack");

    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      scope: "incoming-webhook,chat:write",
      redirect_uri: redirectUri,
      state,
    });

    return res.status(200).json({
      url: `https://slack.com/oauth/v2/authorize?${params.toString()}`,
    });
  } catch (error) {
    console.error("getSlackAuthUrl error:", error);
    return res.status(500).json({ message: "Failed to start Slack OAuth." });
  }
};

export const handleSlackCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return redirectWithResult(res, "error=slack_oauth_failed");
    }

    const userId = verifyOauthState(state, "slack");
    const redirectUri =
      process.env.SLACK_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/slack/callback`;

    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.ok) {
      console.error("Slack OAuth token exchange failed:", tokenData);
      return redirectWithResult(res, "error=slack_oauth_failed");
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        slackOAuth: {
          accessToken: tokenData.access_token || null,
          scope: tokenData.scope || null,
          botUserId: tokenData.bot_user_id || null,
          appId: tokenData.app_id || null,
          team: tokenData.team || null,
          incomingWebhook: tokenData.incoming_webhook || null,
          connectedAt: new Date(),
        },
      },
    });

    return redirectWithResult(res, "success=slack_connected");
  } catch (error) {
    console.error("Slack OAuth callback error:", error);
    return redirectWithResult(res, "error=slack_oauth_failed");
  }
};

export const disconnectSlack = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { slackOAuth: null } });
    return res.status(200).json({ message: "Slack disconnected successfully." });
  } catch (error) {
    console.error("disconnectSlack error:", error);
    return res.status(500).json({ message: "Failed to disconnect Slack." });
  }
};

export const testSlack = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "slackOAuth firstName lastName"
    );
    const incomingWebhookUrl = user?.slackOAuth?.incomingWebhook?.url;

    if (!incomingWebhookUrl) {
      return res.status(400).json({
        message:
          "Slack test requires incoming webhook access. Please reconnect Slack with required permissions.",
      });
    }

    const actor =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "A user";

    await sendWebhookMessage(incomingWebhookUrl, {
      text: `Taskify: Slack OAuth integration test from ${actor}.`,
    });

    return res.status(200).json({ message: "Slack test message sent." });
  } catch (error) {
    console.error("testSlack error:", error);
    return res.status(500).json({ message: "Failed to send Slack test message." });
  }
};

export const getGitHubAuthUrl = (req, res) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res
        .status(500)
        .json({ message: "GitHub OAuth is not configured on the server." });
    }

    const redirectUri =
      process.env.GITHUB_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/github/callback`;
    const state = createOauthState(req.user._id, "github");

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
      state,
    });

    return res.status(200).json({
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  } catch (error) {
    console.error("getGitHubAuthUrl error:", error);
    return res.status(500).json({ message: "Failed to start GitHub OAuth." });
  }
};

export const handleGitHubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return redirectWithResult(res, "error=github_oauth_failed");
    }

    const userId = verifyOauthState(state, "github");
    const redirectUri =
      process.env.GITHUB_REDIRECT_URI ||
      `${backendBase}/api/v1/integrations/github/callback`;

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("GitHub OAuth token exchange failed:", tokenData);
      return redirectWithResult(res, "error=github_oauth_failed");
    }

    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "taskify",
      },
    });
    const profile = await profileRes.json();

    await User.findByIdAndUpdate(userId, {
      $set: {
        githubOAuth: {
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type || "bearer",
          scope: tokenData.scope || null,
          profile: {
            id: profile?.id ?? null,
            login: profile?.login ?? null,
            name: profile?.name ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            htmlUrl: profile?.html_url ?? null,
          },
          connectedAt: new Date(),
        },
      },
    });

    return redirectWithResult(res, "success=github_connected");
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return redirectWithResult(res, "error=github_oauth_failed");
  }
};

export const disconnectGitHub = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { githubOAuth: null } });
    return res.status(200).json({ message: "GitHub disconnected successfully." });
  } catch (error) {
    console.error("disconnectGitHub error:", error);
    return res.status(500).json({ message: "Failed to disconnect GitHub." });
  }
};

export const testGitHub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("githubOAuth");
    const accessToken = user?.githubOAuth?.accessToken;
    if (!accessToken) {
      return res.status(400).json({ message: "GitHub is not connected." });
    }

    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "taskify",
      },
    });

    if (!profileRes.ok) {
      return res.status(400).json({ message: "GitHub token test failed." });
    }

    return res.status(200).json({ message: "GitHub connection is healthy." });
  } catch (error) {
    console.error("testGitHub error:", error);
    return res.status(500).json({ message: "Failed to test GitHub connection." });
  }
};
