import { Router } from "express";
import { getBoss, listBosses } from "../controllers/boss.controller";
import {
  validateBossId,
  validateBossListQuery,
} from "../middleware/validateBossRequest";

export function createBossRouter() {
  const router = Router();

  router.get("/bosses", validateBossListQuery, listBosses);
  router.get("/bosses/:bossId", validateBossId, getBoss);

  return router;
}
