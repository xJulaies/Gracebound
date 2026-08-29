import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapAshOfWarResponse } from "../mappers/ashOfWar.mapper";
import { findAllAshesOfWar, findAshOfWarById } from "../repositories/ashOfWar.repository";

export const listAshesOfWar: RequestHandler = async (_request, response) => {
  const weaponType = response.locals.ashOfWarWeaponType as string | undefined;
  const ashes = await findAllAshesOfWar(settings.SUPPORTED_GAME_VERSION, weaponType);
  response.status(200).json(createAnswer(200, "Ashes of War found", ashes.map(mapAshOfWarResponse)));
};

export const getAshOfWar: RequestHandler = async (_request, response) => {
  const ashOfWarId = response.locals.ashOfWarId as string;
  const ash = await findAshOfWarById(ashOfWarId, settings.SUPPORTED_GAME_VERSION);
  if (!ash) throw createError(404, "Ash of War not found");
  response.status(200).json(createAnswer(200, "Ash of War found", [mapAshOfWarResponse(ash)]));
};
