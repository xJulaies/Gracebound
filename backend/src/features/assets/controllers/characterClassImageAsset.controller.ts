import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findCharacterClassImageAsset } from "../repositories/characterClassImageAsset.repository";

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

export const getCharacterClassImageAsset: RequestHandler = async (request, response) => {
  const classId = response.locals.classId as string;
  const asset = await findCharacterClassImageAsset(
    classId,
    settings.SUPPORTED_GAME_VERSION,
  );
  if (!asset) throw createError(404, "Character class image not found");

  response.set({
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": asset.mimeType,
    "Content-Length": asset.size.toString(),
    ETag: `"${asset.checksum}"`,
  });
  if (request.fresh) return response.status(304).end();
  return response.status(200).send(asset.data);
};
