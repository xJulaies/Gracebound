import type { RequestHandler } from "express";
import { z } from "zod";
import { createError } from "../../../shared/errors/createError";
import { BRANDING_ASSET_IDS } from "../domain/brandingImageAsset.types";

const brandingAssetIdSchema = z.object({
  assetId: z.enum(BRANDING_ASSET_IDS),
});

export const validateBrandingAssetId: RequestHandler = (request, response, next) => {
  const parsed = brandingAssetIdSchema.safeParse(request.params);
  if (!parsed.success) return next(createError(400, "Invalid branding asset ID"));
  response.locals.assetId = parsed.data.assetId;
  next();
};
