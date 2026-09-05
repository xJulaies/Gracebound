import type { RequestHandler } from "express";
import { z } from "zod";
import { UI_ASSET_IDS } from "../domain/uiAsset.types";
import { createAnswer } from "../../../shared/http/createAnswer";

const assetIdSchema = z.enum(UI_ASSET_IDS);

export const validateUiAssetId: RequestHandler = (request, response, next) => {
  const result = assetIdSchema.safeParse(request.params.assetId);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid UI asset ID", []));
    return;
  }
  response.locals.assetId = result.data;
  next();
};
