import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapBossResponse } from "../mappers/boss.mapper";
import { findBossById, findBossCatalogPage } from "../repositories/boss.repository";
import type { BossListQuery } from "../schemas/boss.schema";

export const listBosses: RequestHandler = async (_request, response) => {
  const result = await findBossCatalogPage(
    settings.SUPPORTED_GAME_VERSION,
    response.locals.bossListQuery as BossListQuery,
  );

  response.set("X-Total-Count", result.total.toString());
  response
    .status(200)
    .json(createAnswer(200, "Bosses found", result.bosses.map(mapBossResponse)));
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
