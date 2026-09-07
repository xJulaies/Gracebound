import { Router, type RequestHandler } from "express";
import type { GetAuthenticatedUserId } from "../../../shared/auth/authentication.types";
import { requireAuthenticatedUser } from "../../../shared/middleware/requireAuthenticatedUser";
import {
  createOwnedBuild,
  calculateOwnedBuildDamage,
  deleteOwnedBuild,
  getOwnedBuild,
  getPublicBuild,
  listOwnedBuilds,
  listPublicBuilds,
  updateOwnedBuild,
} from "../controllers/build.controller";
import {
  validateBuildId,
  validateCreateBuild,
  validateSavedBuildDamage,
  validateUpdateBuild,
} from "../middleware/validateBuildRequest";
import { calculateSelectedBuildStats } from "../controllers/buildStats.controller";
import { validateBuildStatsRequest } from "../middleware/validateBuildStatsRequest";

export function createBuildRouter(
  getAuthenticatedUserId: GetAuthenticatedUserId,
  calculationRateLimiter: RequestHandler,
) {
  const router = Router();

  router.post(
    "/builds/calculate-stats",
    calculationRateLimiter,
    validateBuildStatsRequest,
    calculateSelectedBuildStats,
  );
  router.get("/builds", listPublicBuilds);
  router.get("/builds/:buildId", validateBuildId, getPublicBuild);

  router.use("/me/builds", requireAuthenticatedUser(getAuthenticatedUserId));
  router.get("/me/builds", listOwnedBuilds);
  router.post("/me/builds", validateCreateBuild, createOwnedBuild);
  router.get("/me/builds/:buildId", validateBuildId, getOwnedBuild);
  router.post(
    "/me/builds/:buildId/calculate-damage",
    calculationRateLimiter,
    validateBuildId,
    validateSavedBuildDamage,
    calculateOwnedBuildDamage,
  );
  router.patch(
    "/me/builds/:buildId",
    validateBuildId,
    validateUpdateBuild,
    updateOwnedBuild,
  );
  router.delete("/me/builds/:buildId", validateBuildId, deleteOwnedBuild);

  return router;
}
