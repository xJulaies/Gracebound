import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { findAvailableBossImageIds } from "../../assets/repositories/bossImageAsset.repository";
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
  const availableImageIds = await findAvailableBossImageIds(
    collectBossImageIds(result.bosses),
    settings.SUPPORTED_GAME_VERSION,
  );

  response.set("X-Total-Count", result.total.toString());
  response
    .status(200)
    .json(createAnswer(
      200,
      "Bosses found",
      result.bosses.map((boss) => mapBossResponse(boss, availableImageIds)),
    ));
};

export const getBoss: RequestHandler = async (_request, response) => {
  const bossId = response.locals.bossId as string;
  const boss = await findBossById(bossId, settings.SUPPORTED_GAME_VERSION);

  if (!boss) {
    throw createError(404, "Boss not found");
  }

  const availableImageIds = await findAvailableBossImageIds(
    collectBossImageIds([boss]),
    settings.SUPPORTED_GAME_VERSION,
  );

  response
    .status(200)
    .json(createAnswer(200, "Boss found", [
      mapBossResponse(boss, availableImageIds),
    ]));
};

function collectBossImageIds(
  bosses: Array<{ id: string; phases?: Array<{ id: string }> }>,
): string[] {
  return bosses.flatMap((boss) => [
    boss.id,
    ...(boss.phases?.map(({ id }) => id) ?? []),
  ]);
}
