import { Router } from "express";
import { getArmor, listArmor } from "../controllers/armor.controller";
import { validateArmorId } from "../middleware/validateArmorRequest";

export function createArmorRouter() {
  const router = Router();
  router.get("/armor", listArmor);
  router.get("/armor/:armorId", validateArmorId, getArmor);
  return router;
}
