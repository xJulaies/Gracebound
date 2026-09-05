import type { SpellSchool, SpellType } from "../domain/spell.types";
import { SpellModel } from "../models/spell.model";

export interface SpellCatalogQuery {
  type?: SpellType;
  school?: SpellSchool;
  search?: string;
  page?: number;
  limit?: number;
}

export async function findAllSpells(
  gameVersion: string,
  filters: SpellCatalogQuery = {},
) {
  const filter = {
    gameVersion,
    ...(filters.type && { type: filters.type }),
    ...(filters.school && { schools: filters.school }),
    ...(filters.search && {
      name: { $regex: escapeRegex(filters.search), $options: "i" },
    }),
  };
  const query = SpellModel.find(filter).sort({ name: 1, id: 1 });

  if (filters.page !== undefined || filters.limit !== undefined) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    query.skip((page - 1) * limit).limit(limit);
  }

  const [spells, total] = await Promise.all([
    query.lean().exec(),
    SpellModel.countDocuments(filter).exec(),
  ]);

  return { spells, total };
}

export function findSpellById(id: string, gameVersion: string) {
  return SpellModel.findOne({ id, gameVersion }).lean().exec();
}

export function findSpellsByIds(ids: string[], gameVersion: string) {
  return SpellModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
