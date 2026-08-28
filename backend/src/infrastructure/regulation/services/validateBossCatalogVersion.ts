import type { BossData } from "../../../features/bosses/domain/boss.types";

const EXPECTED_BOSS_PROFILES_BY_VERSION: Readonly<Record<string, number>> = {
  "1.17.0": 177,
};

export function validateBossCatalogVersion(
  bosses: BossData[],
  gameVersion: string,
): void {
  const expectedCount = EXPECTED_BOSS_PROFILES_BY_VERSION[gameVersion];

  if (expectedCount === undefined) {
    throw new Error(`Unsupported boss catalog version ${gameVersion}`);
  }

  if (bosses.length !== expectedCount) {
    throw new Error(
      `Incomplete boss catalog for ${gameVersion}: expected ${expectedCount}, received ${bosses.length}`,
    );
  }

  if (new Set(bosses.map(({ id }) => id)).size !== bosses.length) {
    throw new Error(`Boss catalog for ${gameVersion} contains duplicate IDs`);
  }
}
