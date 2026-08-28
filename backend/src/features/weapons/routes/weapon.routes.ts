import { Router } from "express";
import { getWeapon, listWeapons } from "../controllers/weapon.controller";
import {
  validateWeaponId,
  validateWeaponListQuery,
} from "../middleware/validateWeaponRequest";

export function createWeaponRouter() {
  const router = Router();

  router.get("/weapons", validateWeaponListQuery, listWeapons);
  router.get("/weapons/:weaponId", validateWeaponId, getWeapon);

  return router;
}
