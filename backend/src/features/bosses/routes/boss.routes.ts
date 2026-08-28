import { Router } from "express";
import { getBoss, listBosses } from "../controllers/boss.controller";
import { validateBossId } from "../middleware/validateBossRequest";

export function createBossRouter() {
  const router = Router();

  router.get("/bosses", listBosses);
  router.get("/bosses/:bossId", validateBossId, getBoss);

  return router;
}
