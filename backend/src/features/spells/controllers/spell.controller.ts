import type { RequestHandler } from "express";
import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import type { SpellType } from "../domain/spell.types";
import { mapSpellResponse } from "../mappers/spell.mapper";
import { findAllSpells, findSpellById } from "../repositories/spell.repository";

export const listSpells: RequestHandler = async (_request, response) => {
  const query = response.locals.spellQuery as { type?: SpellType };
  const spells = await findAllSpells(settings.SUPPORTED_GAME_VERSION, query.type);
  response.status(200).json(createAnswer(200, "Spells found", spells.map(mapSpellResponse)));
};

export const getSpell: RequestHandler = async (_request, response) => {
  const spell = await findSpellById(response.locals.spellId as string, settings.SUPPORTED_GAME_VERSION);
  if (!spell) throw createError(404, "Spell not found");
  response.status(200).json(createAnswer(200, "Spell found", [mapSpellResponse(spell)]));
};
