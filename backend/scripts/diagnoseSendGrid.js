/**
 * Lists Sender Identities in your SendGrid account for this API key.
 * Run: node scripts/diagnoseSendGrid.js
 *
 * If your FROM address never appears here as verified=true, SendGrid will reject sends.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const key = process.env.SENDGRID_API_KEY?.trim();
const want = process.env.SENDER_EMAIL?.trim();

async function main() {
  if (!key) {
    console.error("Set SENDGRID_API_KEY in backend/.env");
    process.exit(1);
  }

  const profileRes = await fetch("https://api.sendgrid.com/v3/user/profile", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const profileText = await profileRes.text();
  if (!profileRes.ok) {
    console.error("API key invalid for SendGrid (profile):", profileRes.status, profileText);
    process.exit(1);
  }
  let profile;
  try {
    profile = JSON.parse(profileText);
  } catch {
    console.error("Bad profile response:", profileText.slice(0, 200));
    process.exit(1);
  }
  console.log(
    "\nThis API key belongs to SendGrid user id:",
    profile.userid ?? profile.user_id ?? "unknown"
  );
  console.log(
    "Log into the SAME Twilio/SendGrid account in the browser when checking Sender Authentication.\n"
  );

  const res = await fetch("https://api.sendgrid.com/v3/verified_senders", {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Non-JSON response:", text.slice(0, 500));
    process.exit(1);
  }

  if (!res.ok) {
    console.error("Could not list verified senders via API:", res.status, data);
    console.error(
      "\n403 here is common if the API key only has “Mail Send” and no Sender Verification read scope."
    );
    console.error(
      "Fix: SendGrid → Settings → API Keys → create a key with “Full Access” (or add scopes), or verify the sender in the dashboard for user id above.\n"
    );
    console.error(
      "Manual check: https://app.sendgrid.com/settings/sender_auth — ensure",
      want || "(your SENDER_EMAIL)",
      "shows as Verified.\n"
    );
    process.exit(1);
  }

  const results = data.results || data.senders || data || [];
  const list = Array.isArray(results) ? results : [];

  console.log("\n--- Verified senders for THIS API key’s account ---\n");
  if (list.length === 0) {
    console.log("No sender identities returned. Add & verify Single Sender in:");
    console.log("https://app.sendgrid.com/settings/sender_auth/senders/new\n");
  } else {
    for (const s of list) {
      const email = s.from_email || s.from?.email || s.email;
      const ok = s.verified === true || s.verified === "true";
      const line = `${ok ? "✓" : "✗"} ${email || JSON.stringify(s)}  (verified: ${s.verified})`;
      console.log(line);
    }
    console.log("");
  }

  if (want) {
    const match = list.find((s) => {
      const e = (s.from_email || s.from?.email || s.email || "").toLowerCase();
      return e === want.toLowerCase();
    });
    if (!match) {
      console.log(`⚠ No sender identity found for SENDER_EMAIL="${want}".`);
      console.log(
        "   SendGrid only allows FROM addresses that appear here as verified.\n"
      );
    } else if (match.verified !== true && match.verified !== "true") {
      console.log(`⚠ "${want}" exists but is NOT verified yet — finish the email link.\n`);
    } else {
      console.log(`✓ "${want}" is verified for this API key. If mail still fails, check API key restrictions in SendGrid.\n`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
