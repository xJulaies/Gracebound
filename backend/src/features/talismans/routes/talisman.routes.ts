import { Router } from "express";
import { getTalisman, listTalismans } from "../controllers/talisman.controller";
import {
  validateTalismanId,
  validateTalismanQuery,
} from "../middleware/validateTalismanRequest";

export function createTalismanRouter() {
  const router = Router();
  router.get("/talismans", validateTalismanQuery, listTalismans);
  router.get("/talismans/:talismanId", validateTalismanId, getTalisman);
  return router;
}
