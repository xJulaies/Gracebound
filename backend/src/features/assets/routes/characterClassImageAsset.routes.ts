import { Router } from "express";
import { getCharacterClassImageAsset } from "../controllers/characterClassImageAsset.controller";
import { validateCharacterClassId } from "../middleware/validateIconAssetRequest";

export function createCharacterClassImageAssetRouter() {
  const router = Router();
  router.get(
    "/assets/character-classes/:classId",
    validateCharacterClassId,
    getCharacterClassImageAsset,
  );
  return router;
}
