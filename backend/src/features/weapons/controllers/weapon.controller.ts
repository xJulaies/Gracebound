import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapWeaponResponse } from "../mappers/weapon.mapper";
import {
  findWeaponCatalogById,
  findWeaponCatalogPage,
} from "../repositories/weapon.repository";
import type { WeaponListQuery } from "../schemas/weapon.schema";

export const listWeapons: RequestHandler = async (_request, response) => {
  const query = response.locals.weaponListQuery as WeaponListQuery;
  const result = await findWeaponCatalogPage({
    ...query,
    gameVersion: settings.SUPPORTED_GAME_VERSION,
  });

  response.set("X-Total-Count", result.total.toString());
  response
    .status(200)
    .json(
      createAnswer(200, "Weapons found", result.weapons.map(mapWeaponResponse)),
    );
};

export const getWeapon: RequestHandler = async (_request, response) => {
  const weaponId = response.locals.weaponId as string;
  const weapon = await findWeaponCatalogById(
    weaponId,
    settings.SUPPORTED_GAME_VERSION,
  );

  if (!weapon) {
    throw createError(404, "Weapon not found");
  }

  response
    .status(200)
    .json(createAnswer(200, "Weapon found", [mapWeaponResponse(weapon)]));
};
