import { BossModel } from "../models/boss.model";
import type { BossListQuery } from "../schemas/boss.schema";

export async function findBossCatalogPage(
  gameVersion: string,
  { page, limit, search, region, locationType, rank, progression,
    rewardsGreatRune, rewardsRemembrance }: BossListQuery,
) {
  const filter = {
    gameVersion,
    ...(search && { name: { $regex: escapeRegex(search), $options: "i" } }),
    ...(region && { "encounters.region": region }),
    ...(locationType && { "encounters.locationType": locationType }),
    ...(rank && { rank }),
    ...(progression && { progression }),
    ...(rewardsGreatRune !== undefined && { rewardsGreatRune }),
    ...(rewardsRemembrance !== undefined && { rewardsRemembrance }),
  };

  const query = BossModel.find(filter).sort({ name: 1, id: 1 });

  if (page !== undefined || limit !== undefined) {
    const resolvedPage = page ?? 1;
    const resolvedLimit = limit ?? 50;
    query.skip((resolvedPage - 1) * resolvedLimit).limit(resolvedLimit);
  }

  const [bosses, total] = await Promise.all([
    query.lean().exec(),
    BossModel.countDocuments(filter).exec(),
  ]);

  return { bosses, total };
}

export function findBossById(bossId: string, gameVersion: string) {
  return BossModel.findOne({ id: bossId, gameVersion }).lean().exec();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
