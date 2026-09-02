import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapGreatRuneResponse } from "../mappers/greatRune.mapper";
import { findAllGreatRunes, findGreatRuneById } from "../repositories/greatRune.repository";

export const listGreatRunes: RequestHandler = async (_request, response) => {
  const runes = await findAllGreatRunes(settings.SUPPORTED_GAME_VERSION);
  response.status(200).json(createAnswer(200, "Great Runes found", runes.map(mapGreatRuneResponse)));
};

export const getGreatRune: RequestHandler = async (_request, response) => {
  const rune = await findGreatRuneById(response.locals.greatRuneId as string, settings.SUPPORTED_GAME_VERSION);
  if (!rune) throw createError(404, "Great Rune not found");
  response.status(200).json(createAnswer(200, "Great Rune found", [mapGreatRuneResponse(rune)]));
};
