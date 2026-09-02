import type { CrystalTearRecord } from "../../features/crystalTears/models/crystalTear.model";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "./regulationWeaponCatalog.fixture";

type TearId = "crimsonspill-crystal-tear" | "crimson-crystal-tear-1" | "crimson-crystal-tear-2" | "cerulean-crystal-tear-1" | "cerulean-crystal-tear-2" | "crimsonburst-crystal-tear" | "greenburst-crystal-tear" | "winged-crystal-tear" | "speckled-hardtear" | "strength-knot-crystal-tear" | "magic-shrouding-cracked-tear" | "spiked-cracked-tear" | "stonebarb-cracked-tear" | "opaline-hardtear" | "cerulean-hidden-tear" | "thorny-cracked-tear";

export function createCrystalTearRecordFixture(id: TearId): CrystalTearRecord {
  const supported = id !== "thorny-cracked-tear";
  const strength = id === "strength-knot-crystal-tear" ? 10 : 0;
  return {
    id, sourceGoodsId: 11000, sourceEffectId: 3500, name: name(id), iconId: 400,
    calculationStatus: supported ? "supported" : "catalog-only",
    effects: supported ? {
      durationSeconds: 180,
      attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
      resourceMultipliers: { maxHp: id === "crimsonspill-crystal-tear" ? 1.1 : 1, maxStamina: 1, maxEquipLoad: id === "winged-crystal-tear" ? 4.5 : 1 },
      outgoingDamageMultipliers: { physical: 1, magic: id === "magic-shrouding-cracked-tear" ? 1.2 : 1, fire: 1, lightning: 1, holy: 1 },
      chargedAttackDamageMultipliers: { physical: id === "spiked-cracked-tear" ? 1.15 : 1, magic: id === "spiked-cracked-tear" ? 1.15 : 1, fire: id === "spiked-cracked-tear" ? 1.15 : 1, lightning: id === "spiked-cracked-tear" ? 1.15 : 1, holy: id === "spiked-cracked-tear" ? 1.15 : 1 },
      incomingDamageMultipliers: { physical: id === "opaline-hardtear" ? 0.85 : 1, magic: id === "opaline-hardtear" ? 0.85 : 1, fire: id === "opaline-hardtear" ? 0.85 : 1, lightning: id === "opaline-hardtear" ? 0.85 : 1, holy: id === "opaline-hardtear" ? 0.85 : 1 },
      fpCostMultipliers: { skill: id === "cerulean-hidden-tear" ? 0 : 1, sorcery: id === "cerulean-hidden-tear" ? 0 : 1, incantation: id === "cerulean-hidden-tear" ? 0 : 1 },
      poiseDamageMultiplier: id === "stonebarb-cracked-tear" ? 1.3 : 1,
      staminaRecoverySpeedBonus: id === "greenburst-crystal-tear" ? 15 : 0,
      statusResistanceBonuses: { poison: id === "speckled-hardtear" ? 90 : 0, rot: id === "speckled-hardtear" ? 90 : 0, bleed: id === "speckled-hardtear" ? 90 : 0, frost: id === "speckled-hardtear" ? 90 : 0, sleep: id === "speckled-hardtear" ? 90 : 0, madness: id === "speckled-hardtear" ? 90 : 0, deathBlight: id === "speckled-hardtear" ? 90 : 0 },
      cleansesStatusBuildup: id === "speckled-hardtear" ? ["poison", "rot", "bleed", "frost", "sleep", "madness", "deathBlight"] : [],
      recovery: {
        instantMaxHpPercent: id.startsWith("crimson-crystal-tear") ? 0.5 : 0,
        instantMaxFpPercent: id.startsWith("cerulean-crystal-tear") ? 0.5 : 0,
        hpPerSecond: id === "crimsonburst-crystal-tear" ? 7 : 0,
        hpRegenerationDurationSeconds: id === "crimsonburst-crystal-tear" ? 180 : 0,
      },
    } : null,
    limitations: supported ? [] : ["Requires combat state."], source: "REGULATION",
    gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH,
    importedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function name(id: TearId) { return id.split("-").map((word) => `${word[0]!.toUpperCase()}${word.slice(1)}`).join(" "); }
