import { createHash } from "node:crypto";
import { baseGameBossDefinitions } from "../data/baseGameBossDefinitions";
import { BOSS_PHASE_PROFILE_PROVENANCE } from "../data/bossPhaseProfiles";

const SHA_256_PATTERN = /^[a-f0-9]{64}$/;

export function createBossCatalogSourceHash(
  regulationSourceHash: string,
): string {
  const normalizedRegulationHash = regulationSourceHash.toLowerCase();
  if (!SHA_256_PATTERN.test(normalizedRegulationHash)) {
    throw new Error("Regulation source hash must be a SHA-256 digest");
  }

  return createHash("sha256")
    .update(JSON.stringify({
      regulationSourceHash: normalizedRegulationHash,
      bossDefinitions: baseGameBossDefinitions,
      phaseProfiles: BOSS_PHASE_PROFILE_PROVENANCE,
    }))
    .digest("hex");
}
