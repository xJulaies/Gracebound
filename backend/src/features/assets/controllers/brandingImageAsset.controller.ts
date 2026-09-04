import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { findBrandingImageAsset } from "../repositories/brandingImageAsset.repository";

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

export const getBrandingImageAsset: RequestHandler = async (request, response) => {
  const assetId = response.locals.assetId as string;
  const asset = await findBrandingImageAsset(assetId);
  if (!asset) throw createError(404, "Branding image not found");

  response.set({
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": asset.mimeType,
    "Content-Length": asset.size.toString(),
    ETag: `"${asset.checksum}"`,
  });
  if (request.fresh) return response.status(304).end();
  return response.status(200).send(asset.data);
};
