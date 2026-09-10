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
  validateOwnedBuildListQuery,
  validatePublicBuildListQuery,
  validateSavedBuildDamage,
  validateUpdateBuild,
} from "../middleware/validateBuildRequest";
import { calculateSelectedBuildStats } from "../controllers/buildStats.controller";
import { validateBuildStatsRequest } from "../middleware/validateBuildStatsRequest";
import {
  createBuildListRateLimiter,
  createBuildMutationRateLimiter,
} from "../../../shared/middleware/rateLimiters";

export function createBuildRouter(
  getAuthenticatedUserId: GetAuthenticatedUserId,
  calculationRateLimiter: RequestHandler,
) {
  const router = Router();
  const publicBuildListRateLimiter = createBuildListRateLimiter();
  const ownedBuildListRateLimiter = createBuildListRateLimiter();
  const buildMutationRateLimiter = createBuildMutationRateLimiter();

  router.post(
    "/builds/calculate-stats",
    calculationRateLimiter,
    validateBuildStatsRequest,
    calculateSelectedBuildStats,
  );
  router.get(
    "/builds",
    publicBuildListRateLimiter,
    validatePublicBuildListQuery,
    listPublicBuilds,
  );
  router.get("/builds/:buildId", validateBuildId, getPublicBuild);

  router.use("/me/builds", requireAuthenticatedUser(getAuthenticatedUserId));
  router.get(
    "/me/builds",
    ownedBuildListRateLimiter,
    validateOwnedBuildListQuery,
    listOwnedBuilds,
  );
  router.post(
    "/me/builds",
    buildMutationRateLimiter,
    validateCreateBuild,
    createOwnedBuild,
  );
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
    buildMutationRateLimiter,
    validateBuildId,
    validateUpdateBuild,
    updateOwnedBuild,
  );
  router.delete(
    "/me/builds/:buildId",
    buildMutationRateLimiter,
    validateBuildId,
    deleteOwnedBuild,
  );

  return router;
}
