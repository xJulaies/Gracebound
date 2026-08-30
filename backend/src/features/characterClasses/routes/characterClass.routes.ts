import { Router } from "express";
import { listCharacterClasses } from "../controllers/characterClass.controller";

export function createCharacterClassRouter() {
  const router = Router();
  router.get("/character-classes", listCharacterClasses);
  return router;
}
