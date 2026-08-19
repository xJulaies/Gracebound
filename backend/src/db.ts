import mongoose from "mongoose";
import { settings } from "./config/settings";
import { createError } from "./lib/ErrorHandling/createError";

export async function connectMongoDB() {
  try {
    if (!settings.MONGODB_URL) {
      throw createError(500, "MONGODB_URL is missing");
    }
    await mongoose.connect(settings.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Connection to MongoDB failed");
    throw error;
  }
}
