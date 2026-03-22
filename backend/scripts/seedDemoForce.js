/**
 * Windows-friendly: sets SEED_FORCE=1 then runs the same seed as seedDemoData.js.
 * Usage: node scripts/seedDemoForce.js boss@email.com
 *    or: npm run seed:demo:force -- boss@email.com
 */
process.env.SEED_FORCE = "1";
await import("./seedDemoData.js");
