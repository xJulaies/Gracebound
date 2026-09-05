import { Router } from "express";
import { getUiAsset } from "../controllers/uiAsset.controller";
import { validateUiAssetId } from "../middleware/validateUiAssetRequest";

export function createUiAssetRouter() {
  const router = Router();
  router.get("/assets/ui/:assetId", validateUiAssetId, getUiAsset);
  return router;
}
