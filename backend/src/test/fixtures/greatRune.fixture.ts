import type { GreatRuneRecord } from "../../features/greatRunes/models/greatRune.model";
import {
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "./regulationWeaponCatalog.fixture";

export function createGreatRuneRecordFixture(
  id: "godricks-great-rune" | "rykards-great-rune",
): GreatRuneRecord {
  const supported = id === "godricks-great-rune";
  return {
    id,
    sourceGoodsId: supported ? 191 : 194,
    sourceEffectId: supported ? 600 : 630,
    name: supported ? "Godrick's Great Rune" : "Rykard's Great Rune",
    iconId: supported ? 3201 : 3203,
    activation: "rune-arc",
    calculationStatus: supported ? "supported" : "catalog-only",
    effects: supported ? {
      attributeBonuses: {
        vigor: 5,
        mind: 5,
        endurance: 5,
        strength: 5,
        dexterity: 5,
        intelligence: 5,
        faith: 5,
        arcane: 5,
      },
      resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1 },
    } : null,
    limitations: supported ? [] : ["Requires authoritative combat state."],
    source: "REGULATION",
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
    importedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}
