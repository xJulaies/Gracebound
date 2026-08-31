import { describe, expect, it } from "vitest";
import type { MagicParamRow } from "../schemas/magic.schema";
import { mapBaseGameSpells } from "./mapRegulationSpells";

describe("mapBaseGameSpells", () => {
  it("normalizes playable spell selection data", () => {
    expect(mapBaseGameSpells([row(4000, "[Sorcery] Glintstone Pebble")])).toEqual([{
      id: "glintstone-pebble", sourceMagicId: 4000, name: "Glintstone Pebble",
      type: "sorcery", fpCost: 7, slotsRequired: 1,
      requirements: { intelligence: 10, faith: 0, arcane: 0 },
      iconId: 4000, calculationStatus: "catalog-only", attack: null,
    }]);
  });

  it("excludes NPC, unused, duplicate casting, and DLC rows", () => {
    expect(mapBaseGameSpells([
      row(4641, "[Sorcery] Carian Retaliation (Unused 1)"),
      row(8000, "[Incantation] Briars of Sin"),
      row(50_000, "[NPC: Sorcery] Glintstone Pebble"),
      row(2_004_000, "[Sorcery] Glintstone Nail"),
    ])).toEqual([]);
  });

  it("corrects known internal casting-category mismatches", () => {
    expect(mapBaseGameSpells([
      row(5040, "[Sorcery] Death Lightning"),
      row(6500, "[Incantation] Night Maiden's Mist"),
    ]).map(({ name, type }) => ({ name, type }))).toEqual([
      { name: "Death Lightning", type: "incantation" },
      { name: "Night Maiden's Mist", type: "sorcery" },
    ]);
  });

  it("maps the verified Glintstone Pebble projectile attack", () => {
    const magic = { ...row(4000, "[Sorcery] Glintstone Pebble"), refCategory1: 1, refId1: 10400000 };
    const [spell] = mapBaseGameSpells([magic], {
      bullets: [{ ID: 10400000, Name: "Glintstone Pebble", atkId_Bullet: 40000, intervalCreateBulletId: -1 }],
      attacks: [{
        ID: 40000, Name: "Glintstone Pebble",
        atkPhysCorrection: 100, atkMagCorrection: 100, atkFireCorrection: 100,
        atkThunCorrection: 100, atkDarkCorrection: 100,
        atkPhys: 0, atkMag: 152, atkFire: 0, atkThun: 0, atkDark: 0,
        atkAttribute: 3, isAddBaseAtk: 0, finalDamageRateId: 20000,
      }],
      finalDamageRates: [{
        ID: 20000, Name: "", physRate: 1, magRate: 1,
        fireRate: 1, thunRate: 1, darkRate: 1,
      }],
    });

    expect(spell).toMatchObject({
      calculationStatus: "supported",
      attack: {
        sourceBulletId: 10400000,
        sourceAttackId: 40000,
        motionValues: { physical: 0, magic: 152, fire: 0, lightning: 0, holy: 0 },
      },
    });
  });

  it("maps additional verified single-hit glintstone projectiles", () => {
    const spells = mapBaseGameSpells([
      { ...row(4001, "[Sorcery] Great Glintstone Shard"), refCategory1: 1, refId1: 10400100 },
      { ...row(4010, "[Sorcery] Swift Glintstone Shard"), refCategory1: 1, refId1: 10401000 },
    ], {
      bullets: [
        { ID: 10400100, Name: "Great Glintstone Shard", atkId_Bullet: 40010, intervalCreateBulletId: -1 },
        { ID: 10401000, Name: "Swift Glintstone Shard", atkId_Bullet: 40100, intervalCreateBulletId: -1 },
      ],
      attacks: [spellAttack(40010, "Great Glintstone Shard", 211), spellAttack(40100, "Swift Glintstone Shard", 114)],
      finalDamageRates: [unitFinalDamageRate()],
    });

    expect(spells.map(({ id, calculationStatus, attack }) => ({
      id, calculationStatus, magicMotionValue: attack?.motionValues.magic,
    }))).toEqual([
      { id: "great-glintstone-shard", calculationStatus: "supported", magicMotionValue: 211 },
      { id: "swift-glintstone-shard", calculationStatus: "supported", magicMotionValue: 114 },
    ]);
  });
});

function row(ID: number, Name: string): MagicParamRow {
  return { ID, Name, mp: 7, slotLength: 1, requirementIntellect: 10, requirementFaith: 0, requirementLuck: 0, iconId: 4000, refCategory1: 0, refId1: -1 };
}

function spellAttack(ID: number, Name: string, atkMag: number) {
  return {
    ID, Name, atkPhysCorrection: 100, atkMagCorrection: 100,
    atkFireCorrection: 100, atkThunCorrection: 100, atkDarkCorrection: 100,
    atkPhys: 0, atkMag, atkFire: 0, atkThun: 0, atkDark: 0,
    atkAttribute: 3, isAddBaseAtk: 0, finalDamageRateId: 20000,
  };
}

function unitFinalDamageRate() {
  return {
    ID: 20000, Name: "", physRate: 1, magRate: 1,
    fireRate: 1, thunRate: 1, darkRate: 1,
  };
}
