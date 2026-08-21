import { Router } from "express";
import { calculateDamage } from "../controllers/damage.controller";
import { validateDamageRequest } from "../middleware/validateDamageRequest";

export function createDamageRouter() {
  const router = Router();

  router.post("/damage/calculate", validateDamageRequest, calculateDamage);

  return router;
}

