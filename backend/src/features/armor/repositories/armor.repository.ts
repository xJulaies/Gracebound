import { ArmorModel } from "../models/armor.model";

export interface ArmorCatalogQuery {
  slot?: "head" | "body" | "arms" | "legs";
  search?: string;
  page?: number;
  limit?: number;
}

export async function findAllArmor(
  gameVersion: string,
  filters: ArmorCatalogQuery = {},
) {
  const filter = {
    gameVersion,
    ...(filters.slot && { slot: filters.slot }),
    ...(filters.search && {
      name: { $regex: escapeRegex(filters.search), $options: "i" },
    }),
  };
  const query = ArmorModel.find(filter).sort({ name: 1, id: 1 });

  if (filters.page !== undefined || filters.limit !== undefined) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    query.skip((page - 1) * limit).limit(limit);
  }

  const [armor, total] = await Promise.all([
    query.lean().exec(),
    ArmorModel.countDocuments(filter).exec(),
  ]);

  return { armor, total };
}

export function findArmorById(id: string, gameVersion: string) {
  return ArmorModel.findOne({ id, gameVersion }).lean().exec();
}

export function findArmorByIds(ids: string[], gameVersion: string) {
  return ArmorModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
