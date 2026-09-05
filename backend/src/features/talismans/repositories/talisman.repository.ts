import { TalismanModel } from "../models/talisman.model";

export interface TalismanCatalogQuery {
  search?: string;
  calculationStatus?: "catalog-only" | "supported";
  page?: number;
  limit?: number;
}

export async function findAllTalismans(
  gameVersion: string,
  filters: TalismanCatalogQuery = {},
) {
  const filter = {
    gameVersion,
    ...(filters.search && {
      name: { $regex: escapeRegex(filters.search), $options: "i" },
    }),
    ...(filters.calculationStatus && {
      calculationStatus: filters.calculationStatus,
    }),
  };
  const query = TalismanModel.find(filter).sort({ name: 1, id: 1 });

  if (filters.page !== undefined || filters.limit !== undefined) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    query.skip((page - 1) * limit).limit(limit);
  }

  const [talismans, total] = await Promise.all([
    query.lean().exec(),
    TalismanModel.countDocuments(filter).exec(),
  ]);

  return { talismans, total };
}

export function findTalismanById(id: string, gameVersion: string) {
  return TalismanModel.findOne({ id, gameVersion }).lean().exec();
}

export function findTalismansByIds(ids: string[], gameVersion: string) {
  return TalismanModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
