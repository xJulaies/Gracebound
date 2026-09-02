import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapCrystalTearResponse } from "../mappers/crystalTear.mapper";
import { findAllCrystalTears, findCrystalTearById } from "../repositories/crystalTear.repository";
export const listCrystalTears: RequestHandler = async (_request, response) => {
  const tears = await findAllCrystalTears(settings.SUPPORTED_GAME_VERSION);
  response.status(200).json(createAnswer(200, "Crystal Tears found", tears.map(mapCrystalTearResponse)));
};
export const getCrystalTear: RequestHandler = async (_request, response) => {
  const tear = await findCrystalTearById(response.locals.crystalTearId as string, settings.SUPPORTED_GAME_VERSION);
  if (!tear) throw createError(404, "Crystal Tear not found");
  response.status(200).json(createAnswer(200, "Crystal Tear found", [mapCrystalTearResponse(tear)]));
};
