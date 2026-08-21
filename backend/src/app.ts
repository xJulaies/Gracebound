import cors from "cors";
import express, { type Request, type Response } from "express";
import { settings } from "./config/settings";
import { createBuildRouter } from "./features/builds/routes/build.routes";
import { createDamageRouter } from "./features/damage/routes/damage.routes";
import type { Authentication } from "./shared/auth/authentication.types";
import { createAnswer } from "./shared/http/createAnswer";
import { errorHandler } from "./shared/middleware/errorHandler";
import { notFoundHandler } from "./shared/middleware/notFoundHandler";

export function createApp(authentication: Authentication) {
  const app = express();

  app.use(authentication.authenticationMiddleware);
  app.use(
    cors({
      origin: settings.CORS_ORIGIN,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json(createAnswer(200, "API is healthy", []));
  });

  app.use("/api", createBuildRouter(authentication.getAuthenticatedUserId));
  app.use("/api", createDamageRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
