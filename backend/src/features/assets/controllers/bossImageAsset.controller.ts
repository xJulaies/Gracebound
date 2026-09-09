import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findBossImageAsset } from "../repositories/bossImageAsset.repository";

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

export const getBossImageAsset: RequestHandler = async (request, response) => {
  const bossId = response.locals.bossImageId as string;
  const asset = await findBossImageAsset(bossId, settings.SUPPORTED_GAME_VERSION);
  if (!asset) throw createError(404, "Boss image not found");

  response.set({
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": asset.mimeType,
    "Content-Length": asset.size.toString(),
    ETag: `"${asset.checksum}"`,
  });
  if (request.fresh) return response.status(304).end();
  return response.status(200).send(asset.data);
};
