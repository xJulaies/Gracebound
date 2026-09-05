import { Router } from "express";
import { getArmor, listArmor } from "../controllers/armor.controller";
import { validateArmorId, validateArmorQuery } from "../middleware/validateArmorRequest";

export function createArmorRouter() {
  const router = Router();
  router.get("/armor", validateArmorQuery, listArmor);
  router.get("/armor/:armorId", validateArmorId, getArmor);
  return router;
}
