import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapBossResponse } from "../mappers/boss.mapper";
import { findAllBosses, findBossById } from "../repositories/boss.repository";

export const listBosses: RequestHandler = async (_request, response) => {
  const bosses = await findAllBosses(settings.SUPPORTED_GAME_VERSION);

  response
    .status(200)
    .json(createAnswer(200, "Bosses found", bosses.map(mapBossResponse)));
};

export const getBoss: RequestHandler = async (_request, response) => {
  const bossId = response.locals.bossId as string;
  const boss = await findBossById(bossId, settings.SUPPORTED_GAME_VERSION);

  if (!boss) {
    throw createError(404, "Boss not found");
  }

  response
    .status(200)
    .json(createAnswer(200, "Boss found", [mapBossResponse(boss)]));
};
