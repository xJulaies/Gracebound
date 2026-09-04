import { Router } from "express";
import { getBrandingImageAsset } from "../controllers/brandingImageAsset.controller";
import { validateBrandingAssetId } from "../middleware/validateBrandingImageAssetRequest";

export function createBrandingImageAssetRouter() {
  const router = Router();
  router.get(
    "/assets/branding/:assetId",
    validateBrandingAssetId,
    getBrandingImageAsset,
  );
  return router;
}
