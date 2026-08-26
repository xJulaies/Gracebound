import mongoose from "mongoose";
import { settings } from "./config/settings";

export async function connectMongoDB() {
  try {
    await mongoose.connect(settings.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Connection to MongoDB failed");
    throw error;
  }
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
}
