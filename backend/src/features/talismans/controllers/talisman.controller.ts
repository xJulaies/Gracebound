import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapTalismanResponse } from "../mappers/talisman.mapper";
import { findAllTalismans, findTalismanById } from "../repositories/talisman.repository";

export const listTalismans: RequestHandler = async (_request, response) => {
  const talismans = await findAllTalismans(settings.SUPPORTED_GAME_VERSION);
  response.status(200).json(createAnswer(200, "Talismans found", talismans.map(mapTalismanResponse)));
};

export const getTalisman: RequestHandler = async (_request, response) => {
  const talismanId = response.locals.talismanId as string;
  const talisman = await findTalismanById(talismanId, settings.SUPPORTED_GAME_VERSION);
  if (!talisman) throw createError(404, "Talisman not found");
  response.status(200).json(createAnswer(200, "Talisman found", [mapTalismanResponse(talisman)]));
};
