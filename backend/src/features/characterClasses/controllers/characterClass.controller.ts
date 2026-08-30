import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createAnswer } from "../../../shared/http/createAnswer";
import { findAllCharacterClasses } from "../repositories/characterClass.repository";

export const listCharacterClasses: RequestHandler = async (_request, response) => {
  const classes = await findAllCharacterClasses(settings.SUPPORTED_GAME_VERSION);
  response.status(200).json(createAnswer(200, "Character classes found", classes.map((entry) => ({
    id: entry.id,
    name: entry.name,
    level: entry.level,
    stats: entry.stats,
    gameVersion: entry.gameVersion,
  }))));
};
