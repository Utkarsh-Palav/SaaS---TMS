import mongoose from "mongoose";
import dotenv from "dotenv";
import { startCronJobs } from "../services/cronJobs.js";
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI not found in environment variables.");
    }

    await mongoose.connect(uri, {
      // Atlas connections can fail on some local networks with IPv6-first DNS.
      family: 4,
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ MongoDB Connected");
    startCronJobs();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (
      error?.message?.includes("Could not connect to any servers") ||
      error?.message?.includes("querySrv") ||
      error?.message?.includes("ENOTFOUND")
    ) {
      console.error(
        "Hint: verify Atlas URI uses mongodb+srv://, cluster is active, DB user/password are correct, and DNS can resolve the Atlas host."
      );
    }
    process.exit(1);
  }
};

export default connectDB;
