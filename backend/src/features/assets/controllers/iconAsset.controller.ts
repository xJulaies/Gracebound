import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findIconAssetById } from "../repositories/iconAsset.repository";

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

export const getIconAsset: RequestHandler = async (request, response) => {
  const iconId = response.locals.iconId as number;
  const asset = await findIconAssetById(iconId, settings.SUPPORTED_GAME_VERSION);
  if (!asset) throw createError(404, "Icon not found");

  response.set({
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": asset.mimeType,
    "Content-Length": asset.size.toString(),
    ETag: `"${asset.checksum}"`,
  });
  if (request.fresh) return response.status(304).end();
  return response.status(200).send(asset.data);
};
