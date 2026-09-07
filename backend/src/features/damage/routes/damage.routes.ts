import { Router, type RequestHandler } from "express";
import { calculateDamage } from "../controllers/damage.controller";
import { validateDamageRequest } from "../middleware/validateDamageRequest";

export function createDamageRouter(calculationRateLimiter: RequestHandler) {
  const router = Router();

  router.post(
    "/damage/calculate",
    calculationRateLimiter,
    validateDamageRequest,
    calculateDamage,
  );

  return router;
}
