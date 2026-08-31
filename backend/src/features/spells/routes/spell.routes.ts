import { Router } from "express";
import { getSpell, listSpells } from "../controllers/spell.controller";
import { validateSpellId, validateSpellQuery } from "../middleware/validateSpellRequest";

export function createSpellRouter() {
  const router = Router();
  router.get("/spells", validateSpellQuery, listSpells);
  router.get("/spells/:spellId", validateSpellId, getSpell);
  return router;
}
