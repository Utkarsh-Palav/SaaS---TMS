/**
 * Sends one test email via SendGrid using credentials from backend/.env
 *
 * Usage (from backend folder):
 *   node scripts/testSendEmail.js
 *   TEST_EMAIL=other@example.com node scripts/testSendEmail.js
 *
 * Requires: SENDGRID_API_KEY, SENDER_EMAIL (verified sender in SendGrid)
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sgMail from "@sendgrid/mail";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const DEFAULT_TO = "webdevutkarsh@gmail.com";

const to = (process.env.TEST_EMAIL || DEFAULT_TO).trim();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
const SENDER_EMAIL = process.env.SENDER_EMAIL?.trim();

async function main() {
  if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
    console.error("Missing SENDGRID_API_KEY or SENDER_EMAIL in backend/.env");
    process.exit(1);
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const subject = `[Taskify] Email test ${new Date().toISOString()}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #2563eb; margin-top: 0;">SendGrid test</h1>
      <p>If you received this, outbound email from your backend is working.</p>
      <p style="color: #64748b; font-size: 14px;">Sent at ${new Date().toLocaleString()}</p>
    </div>
  `;

  // SendGrid matches the verified Single Sender / domain against this exact address.
  const from = {
    email: SENDER_EMAIL,
    name: process.env.SENDER_NAME?.trim() || "Taskify",
  };

  console.log("--- SendGrid diagnostics ---");
  console.log("FROM email (must match verified Sender Identity exactly):", from.email);
  console.log("FROM length (should be only the email, no spaces):", from.email.length);
  console.log("TO:", to);
  console.log(
    "Tip: Verifying the recipient does not authorize the sender. Verify the same address as SENDER_EMAIL in SendGrid → Settings → Sender Authentication."
  );
  console.log("----------------------------");

  try {
    const [response] = await sgMail.send({
      to,
      from,
      subject,
      html,
      text: `SendGrid test — ${new Date().toISOString()}`,
    });

    console.log("Success. Status:", response.statusCode);
    console.log("Check the inbox (and spam) for:", to);
    process.exit(0);
  } catch (err) {
    console.error("Send failed.");
    const body = err?.response?.body;
    if (body) {
      console.error(JSON.stringify(body, null, 2));
    } else {
      console.error(err?.message || err);
    }
    process.exit(1);
  }
}

main();
