import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { settings } from "./config/settings";
import { createAnswer } from "./lib/ErrorHandling/createAnswer";
import type { TCreateError } from "./types/error.types";

export const app = express();

app.use(
  cors({
    origin: settings.BASE_URL ?? "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  return res.status(200).json(createAnswer(200, "API is healthy", []));
});

app.use((_req: Request, res: Response) => {
  return res.status(404).json(createAnswer(404, "Route not found", []));
});

app.use(
  (err: TCreateError, _req: Request, res: Response, _next: NextFunction) => {
    return res
      .status(err.status ?? 500)
      .json(createAnswer(err.status ?? 500, err.message || "Server Error", []));
  },
);
