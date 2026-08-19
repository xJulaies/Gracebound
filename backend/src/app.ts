import cors from "cors";
import express, { type Request, type Response } from "express";
import { settings } from "./config/settings";
import { createAnswer } from "./shared/http/createAnswer";
import { errorHandler } from "./shared/middleware/errorHandler";
import { notFoundHandler } from "./shared/middleware/notFoundHandler";

export const app = express();

app.use(
  cors({
    origin: settings.CORS_ORIGIN,
  }),
);
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  return res.status(200).json(createAnswer(200, "API is healthy", []));
});

app.use(notFoundHandler);
app.use(errorHandler);
