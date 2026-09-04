import cors from "cors";
import express, { type Request, type Response } from "express";
import { settings } from "./config/settings";
import { createBuildRouter } from "./features/builds/routes/build.routes";
import { createAshOfWarRouter } from "./features/ashesOfWar/routes/ashOfWar.routes";
import { createBossRouter } from "./features/bosses/routes/boss.routes";
import { createDamageRouter } from "./features/damage/routes/damage.routes";
import { createWeaponRouter } from "./features/weapons/routes/weapon.routes";
import { createTalismanRouter } from "./features/talismans/routes/talisman.routes";
import { createCharacterClassRouter } from "./features/characterClasses/routes/characterClass.routes";
import { createArmorRouter } from "./features/armor/routes/armor.routes";
import { createSpellRouter } from "./features/spells/routes/spell.routes";
import { createIconAssetRouter } from "./features/assets/routes/iconAsset.routes";
import { createCharacterClassImageAssetRouter } from "./features/assets/routes/characterClassImageAsset.routes";
import { createBrandingImageAssetRouter } from "./features/assets/routes/brandingImageAsset.routes";
import { createGreatRuneRouter } from "./features/greatRunes/routes/greatRune.routes";
import { createCrystalTearRouter } from "./features/crystalTears/routes/crystalTear.routes";
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
      exposedHeaders: ["X-Total-Count"],
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json(createAnswer(200, "API is healthy", []));
  });

  app.use("/api", createBuildRouter(authentication.getAuthenticatedUserId));
  app.use("/api", createIconAssetRouter());
  app.use("/api", createCharacterClassImageAssetRouter());
  app.use("/api", createBrandingImageAssetRouter());
  app.use("/api", createGreatRuneRouter());
  app.use("/api", createCrystalTearRouter());
  app.use("/api", createCharacterClassRouter());
  app.use("/api", createArmorRouter());
  app.use("/api", createSpellRouter());
  app.use("/api", createAshOfWarRouter());
  app.use("/api", createBossRouter());
  app.use("/api", createDamageRouter());
  app.use("/api", createTalismanRouter());
  app.use("/api", createWeaponRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
