import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapWeaponResponse } from "../mappers/weapon.mapper";
import {
  findWeaponCatalogById,
  findWeaponCatalogPage,
  findWeaponVariantUpgradeLevels,
} from "../repositories/weapon.repository";
import type { WeaponListQuery } from "../schemas/weapon.schema";

export const listWeapons: RequestHandler = async (_request, response) => {
  const query = response.locals.weaponListQuery as WeaponListQuery;
  const result = await findWeaponCatalogPage({
    ...query,
    gameVersion: settings.SUPPORTED_GAME_VERSION,
  });
  const variantData = await loadVariantData(result.weapons);

  response.set("X-Total-Count", result.total.toString());
  response
    .status(200)
    .json(
      createAnswer(
        200,
        "Weapons found",
        result.weapons.map((weapon) => mapWeaponResponse(weapon, variantData)),
      ),
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

  const variantData = await loadVariantData([weapon]);

  response
    .status(200)
    .json(createAnswer(200, "Weapon found", [mapWeaponResponse(weapon, variantData)]));
};

async function loadVariantData(
  weapons: Array<{ variants: Array<{ id: string }> }>,
) {
  const variantIds = weapons.flatMap(({ variants }) => variants.map(({ id }) => id));
  const variants = await findWeaponVariantUpgradeLevels(
    variantIds,
    settings.SUPPORTED_GAME_VERSION,
  );
  return new Map(variants.map(({ id, maxUpgradeLevel, requirements }) => [
    id,
    { maxUpgradeLevel, requirements },
  ]));
}
