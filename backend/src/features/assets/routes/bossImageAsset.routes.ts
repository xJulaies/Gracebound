import { Router } from "express";
import { getBossImageAsset } from "../controllers/bossImageAsset.controller";
import { validateBossImageId } from "../middleware/validateBossImageAssetRequest";

export function createBossImageAssetRouter() {
  const router = Router();
  router.get("/assets/bosses/:bossId", validateBossImageId, getBossImageAsset);
  return router;
}
