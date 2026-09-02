import { Router } from "express";
import { getCrystalTear, listCrystalTears } from "../controllers/crystalTear.controller";
import { validateCrystalTearId } from "../middleware/validateCrystalTearRequest";

export function createCrystalTearRouter() {
  const router = Router();
  router.get("/crystal-tears", listCrystalTears);
  router.get("/crystal-tears/:crystalTearId", validateCrystalTearId, getCrystalTear);
  return router;
}
