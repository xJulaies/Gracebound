import { Router } from "express";
import { getAshOfWar, listAshesOfWar } from "../controllers/ashOfWar.controller";
import { validateAshOfWarId, validateAshOfWarQuery } from "../middleware/validateAshOfWarRequest";

export function createAshOfWarRouter() {
  const router = Router();
  router.get("/ashes-of-war", validateAshOfWarQuery, listAshesOfWar);
  router.get("/ashes-of-war/:ashOfWarId", validateAshOfWarId, getAshOfWar);
  return router;
}
