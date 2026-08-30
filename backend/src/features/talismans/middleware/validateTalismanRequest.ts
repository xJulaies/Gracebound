import type { RequestHandler } from "express";
import { z } from "zod";
import { createAnswer } from "../../../shared/http/createAnswer";

const talismanIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const validateTalismanId: RequestHandler = (request, response, next) => {
  const result = talismanIdSchema.safeParse(request.params.talismanId);
  if (!result.success) {
    response.status(400).json(createAnswer(400, "Invalid talisman ID", []));
    return;
  }
  response.locals.talismanId = result.data;
  next();
};
