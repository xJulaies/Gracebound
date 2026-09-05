import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapArmorResponse } from "../mappers/armor.mapper";
import {
  findAllArmor,
  findArmorById,
  type ArmorCatalogQuery,
} from "../repositories/armor.repository";

export const listArmor: RequestHandler = async (_request, response) => {
  const result = await findAllArmor(
    settings.SUPPORTED_GAME_VERSION,
    response.locals.armorFilters as ArmorCatalogQuery,
  );
  response.set("X-Total-Count", result.total.toString());
  response.status(200).json(
    createAnswer(200, "Armor found", result.armor.map(mapArmorResponse)),
  );
};

export const getArmor: RequestHandler = async (_request, response) => {
  const armor = await findArmorById(response.locals.armorId as string, settings.SUPPORTED_GAME_VERSION);
  if (!armor) throw createError(404, "Armor not found");
  response.status(200).json(createAnswer(200, "Armor found", [mapArmorResponse(armor)]));
};
