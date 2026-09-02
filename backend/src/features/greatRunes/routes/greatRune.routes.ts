import { Router } from "express";
import { getGreatRune, listGreatRunes } from "../controllers/greatRune.controller";
import { validateGreatRuneId } from "../middleware/validateGreatRuneRequest";

export function createGreatRuneRouter() {
  const router = Router();
  router.get("/great-runes", listGreatRunes);
  router.get("/great-runes/:greatRuneId", validateGreatRuneId, getGreatRune);
  return router;
}
