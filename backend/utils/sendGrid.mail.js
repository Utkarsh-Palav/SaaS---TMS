// utils/sendgrid.mail.js
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
const SENDER_EMAIL = process.env.SENDER_EMAIL?.trim();
const SENDER_NAME = process.env.SENDER_NAME?.trim() || "Taskify";
const { CLIENT_URL } = process.env;

if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
  console.warn("⚠️ Missing SendGrid env vars. Set SENDGRID_API_KEY and SENDER_EMAIL.");
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const fromAddress = () => ({ email: SENDER_EMAIL, name: SENDER_NAME });

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalize and validate a single recipient email for SendGrid / SMTP. */
function normalizeTo(to) {
  if (to == null) return null;
  const s = String(to).trim();
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    return null;
  }
  return s;
}

let smtpTransport = null;
function getSmtpTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!host || !user || !pass) return null;
  if (!smtpTransport) {
    const port = Number(process.env.SMTP_PORT) || 587;
    smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return smtpTransport;
}

async function sendViaSmtp({ to, subject, html, text }) {
  const transporter = getSmtpTransport();
  if (!transporter) return null;
  const fromUser = process.env.SMTP_USER?.trim();
  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${fromUser}>`,
      to,
      subject,
      html,
      text: text || String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
    console.log("[SMTP] Delivered to:", to);
    return [{ statusCode: 250 }];
  } catch (err) {
    console.error("[SMTP] Send failed:", err?.message || err);
    return null;
  }
}

/**
 * Sends via SendGrid; on failure optionally retries via SMTP (same .env as Gmail).
 * Logs failures with recipient for debugging (sandbox / unverified recipient / quota).
 */
async function sendMail({ to, subject, html, text }) {
  const toNorm = normalizeTo(to);
  if (!toNorm) {
    console.error("[SendGrid] Invalid or missing recipient address:", to);
    return null;
  }

  if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
    console.warn("[SendGrid] Missing API key or sender — trying SMTP only.");
    return sendViaSmtp({ to: toNorm, subject, html, text });
  }

  const msg = {
    to: toNorm,
    from: fromAddress(),
    subject,
    html,
    text: text || undefined,
  };

  try {
    return await sgMail.send(msg);
  } catch (err) {
    const apiMsg =
      err?.response?.body?.errors?.[0]?.message ||
      err?.message ||
      "Unknown SendGrid error";
    console.error("[SendGrid] Email not sent:", {
      to: toNorm,
      error: apiMsg,
      body: err?.response?.body,
    });

    const smtp = getSmtpTransport();
    if (smtp) {
      console.warn("[SendGrid] Attempting SMTP fallback for:", toNorm);
      return sendViaSmtp({ to: toNorm, subject, html, text });
    }
    return null;
  }
}

/* ----- exported email functions ----- */

export const registrationEmail = async (user, plan, transactionDetails = null) => {
  const isPaid = plan !== "free" && transactionDetails;

  const subject = isPaid
    ? `Payment Receipt - Taskify ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
    : "Welcome to Taskify!";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background:#2563EB;padding:20px;border-radius:8px 8px 0 0;color:#fff;text-align:center;">
        <h1 style="margin:0;">Taskify</h1>
      </div>
      <div style="padding:20px;">
        <h2>Hello ${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)},</h2>
        <p>Thank you for registering your organization <strong>${escapeHtml(user.organizationName)}</strong> with Taskify.</p>
        <p>Your account is now active. You can log in and start setting up your workspace.</p>
        ${isPaid ? `<h3>Payment Receipt</h3>
          <p>Transaction ID: ${escapeHtml(String(transactionDetails.razorpayPaymentId))}</p>
          <p>Amount: ₹${escapeHtml(String(transactionDetails.amount))}</p>` : ""}
        <p style="text-align:center;margin-top:30px;">
          <a href="${escapeHtml(`${(CLIENT_URL || "").replace(/\/$/, "")}/login`)}" style="background:#2563EB;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Go to Dashboard</a>
        </p>
      </div>
      <div style="background:#f4f4f4;color:#777;padding:15px;text-align:center;font-size:12px;">
        &copy; ${new Date().getFullYear()} Taskify. All rights reserved.
      </div>
    </div>
  `;

  return sendMail({ to: user.email, subject, html: htmlContent });
};

export const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
  const subject = "Reset Your Taskify Password";
  const html = `
    <h3>Hello ${escapeHtml(name)},</h3>
    <p>You requested to reset your password. Click the button below:</p>
    <a href="${escapeHtml(resetLink)}" style="padding:10px 20px;background:#facc15;color:#000;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `;
  return sendMail({ to: email, subject, html });
};

export const sendWelcomeEmail = async ({
  email,
  name,
  role,
  tempPassword,
  resetLink,
}) => {
  const subject = "Welcome to Taskify - Your Credentials";
  const safeName = escapeHtml(name);
  const safeRole = escapeHtml(role);
  const safeTemp = escapeHtml(tempPassword);
  const safeLink = escapeHtml(resetLink);

  const html = `
    <div style="font-family: Arial, sans-serif;line-height:1.6;">
      <h2>Welcome, ${safeName} 👋</h2>
      <p>You have been registered as a <strong>${safeRole}</strong> in your organization on <strong>Taskify</strong>.</p>
      <p><strong>Temporary Password:</strong> <code>${safeTemp}</code></p>
      <p>Please click the button below to reset your password and activate your account:</p>
      <a href="${safeLink}" style="display:inline-block;padding:10px 20px;background:#facc15;color:#000;text-decoration:none;border-radius:5px;">Set New Password</a>
      <p><strong>This link expires in 15 minutes.</strong></p>
      <p>– The Taskify Team</p>
    </div>
  `;

  const text = [
    `Welcome, ${name}`,
    `You have been registered as ${role} in your organization on Taskify.`,
    `Temporary password: ${tempPassword}`,
    `Set your password: ${resetLink}`,
    `This link expires in 15 minutes.`,
  ].join("\n\n");

  return sendMail({ to: email, subject, html, text });
};

export const sendTaskNotificationEmail = async ({
  title,
  description,
  assignedManagerEmail,
  managerName,
  priority,
  deadline,
}) => {
  const subject = `New Task Assigned: ${title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <div style="background:#4CAF50;color:#fff;padding:20px;text-align:center;">
        <h2 style="margin:0;">🚀 New Task Assigned!</h2>
      </div>
      <div style="padding:20px;">
        <p>Hi <strong>${escapeHtml(managerName)}</strong>,</p>
        <p>A new task has been assigned to you:</p>
        <p><strong>${escapeHtml(title)}</strong></p>
        <p>${escapeHtml(description)}</p>
        <p><strong>Priority:</strong> ${escapeHtml(String(priority))} • <strong>Deadline:</strong> ${escapeHtml(String(deadline))}</p>
        <p style="text-align:center;margin-top:20px;"><a href="${escapeHtml(CLIENT_URL || "http://localhost:5173")}" style="background:#4CAF50;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;">Open Taskify</a></p>
      </div>
    </div>
  `;
  return sendMail({ to: assignedManagerEmail, subject, html });
};

export const sendMeetingNotificationEmail = async ({
  recipientEmail,
  recipientName,
  subjectPrefix = "Meeting Update",
  meetingTitle,
  meetingType,
  startTime,
  endTime,
  description,
  roomName,
  virtualLink,
  meetingDetailsUrl,
  hostName,
}) => {
  const safeRecipient = escapeHtml(recipientName || "there");
  const safeTitle = escapeHtml(meetingTitle || "Meeting");
  const safeType = escapeHtml(meetingType || "N/A");
  const safeDesc = escapeHtml(description || "No agenda provided.");
  const safeRoom = escapeHtml(roomName || "N/A");
  const safeHost = escapeHtml(hostName || "Meeting host");
  const safeStart = escapeHtml(String(startTime || ""));
  const safeEnd = escapeHtml(String(endTime || ""));
  const safeVirtualLink = virtualLink ? escapeHtml(virtualLink) : "";
  const safeDetailsUrl = meetingDetailsUrl ? escapeHtml(meetingDetailsUrl) : "";

  const subject = `${subjectPrefix}: ${meetingTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <div style="background: #2563eb; color: #fff; padding: 16px 20px;">
        <h2 style="margin: 0;">${escapeHtml(subjectPrefix)}</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hi <strong>${safeRecipient}</strong>,</p>
        <p>You have an update for <strong>${safeTitle}</strong>.</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin:14px 0;">
          <p style="margin: 0 0 6px;"><strong>Host:</strong> ${safeHost}</p>
          <p style="margin: 0 0 6px;"><strong>Type:</strong> ${safeType}</p>
          <p style="margin: 0 0 6px;"><strong>Start:</strong> ${safeStart}</p>
          <p style="margin: 0 0 6px;"><strong>End:</strong> ${safeEnd}</p>
          ${roomName ? `<p style="margin: 0 0 6px;"><strong>Room:</strong> ${safeRoom}</p>` : ""}
          ${virtualLink ? `<p style="margin: 0 0 6px;"><strong>Join Link:</strong> <a href="${safeVirtualLink}" target="_blank" rel="noopener noreferrer">${safeVirtualLink}</a></p>` : ""}
          <p style="margin: 0;"><strong>Agenda:</strong> ${safeDesc}</p>
        </div>
        ${
          safeDetailsUrl
            ? `<p style="margin-top:18px;"><a href="${safeDetailsUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;">Open Meeting Details</a></p>`
            : ""
        }
      </div>
    </div>
  `;

  return sendMail({ to: recipientEmail, subject, html });
};

export const sendOTPByEmail = async (email, otp) => {
  const subject = "Taskify Password Reset OTP";
  const html = `
    <div style="font-family: Arial, sans-serif;line-height:1.6;">
      <h3>Taskify Password Reset</h3>
      <p>Your one-time password is:</p>
      <div style="font-size:28px;font-weight:bold;padding:10px;border:1px dashed #ccc;text-align:center;">${escapeHtml(String(otp))}</div>
      <p>This code is valid for 10 minutes.</p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
};
