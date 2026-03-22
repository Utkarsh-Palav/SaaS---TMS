import mongoose from "mongoose";
import dotenv from "dotenv";
import Permission from "../models/Permission.model.js";
import Role from "../models/Role.model.js";
import { allCrudPermissionNames } from "../config/permissions.constants.js";

dotenv.config();

const BOSS_ROLE_NAME = "Boss";

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const names = allCrudPermissionNames();
  const permissionIds = [];

  for (const name of names) {
    const doc = await Permission.findOneAndUpdate(
      { name },
      { name, description: `Allows ${name}` },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    permissionIds.push(doc._id);
  }

  const bossRole = await Role.findOneAndUpdate(
    { name: BOSS_ROLE_NAME },
    { name: BOSS_ROLE_NAME, permissions: permissionIds },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(
    `Seeded ${names.length} permissions and assigned all to "${BOSS_ROLE_NAME}" (${bossRole._id}).`
  );

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
