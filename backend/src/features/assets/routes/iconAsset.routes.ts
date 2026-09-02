import { Router } from "express";
import { getIconAsset } from "../controllers/iconAsset.controller";
import { validateIconId } from "../middleware/validateIconAssetRequest";

export function createIconAssetRouter() {
  const router = Router();
  router.get("/assets/icons/:iconId", validateIconId, getIconAsset);
  return router;
}
