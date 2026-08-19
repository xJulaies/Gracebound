import { config } from "dotenv";

config();

export const settings = {
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
  MONGODB_URL: process.env.MONGODB_URL,
};
