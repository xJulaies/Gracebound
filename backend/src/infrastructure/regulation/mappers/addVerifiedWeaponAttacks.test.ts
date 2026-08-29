import { describe, expect, it } from "vitest";
import { createRegulationWeaponCatalogFixture } from "../../../test/fixtures/regulationWeaponCatalog.fixture";
import {
  createMeleeAttackDefinitions,
  meleeWeaponClassDefinitions,
} from "../data/meleeWeaponClassDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";
import { addVerifiedWeaponAttacks } from "./addVerifiedWeaponAttacks";

describe("addVerifiedWeaponAttacks", () => {
  it("adds the verified Katana moveset to Moonveil and Uchigatana", () => {
    const dataSet = createRegulationWeaponCatalogFixture();
    dataSet.catalog.moonveil!.attacks = [];
    dataSet.catalog.uchigatana = {
      ...structuredClone(dataSet.catalog.moonveil!),
      id: "uchigatana",
      sourceId: 9000000,
      name: "Uchigatana",
      variants: [{ id: "uchigatana", sourceId: 9000000, affinity: "standard" }],
    };
    dataSet.catalog["serpentbone-blade"] = {
      ...structuredClone(dataSet.catalog.moonveil!),
      id: "serpentbone-blade",
      sourceId: 9080000,
      name: "Serpentbone Blade",
      variants: [{ id: "serpentbone-blade", sourceId: 9080000, affinity: "standard" }],
    };

    const behaviors = katanaAttackDefinitions.map(({ behaviorJudgeId }) => behavior(behaviorJudgeId));
    behaviors.push({
      ...behavior(100),
      ID: 100901100,
      Name: "Serpentbone Blade",
      variationId: 901,
      refId: 901100,
    });
    const attacks = katanaAttackDefinitions.map(({ behaviorJudgeId }) => attack(behaviorJudgeId));
    attacks.push({ ...attack(100), ID: 901100, atkPhysCorrection: 50 });

    const result = addVerifiedWeaponAttacks(
      dataSet,
      [
        weapon(9060000, "Moonveil", 905, 29),
        weapon(9000000, "Uchigatana", 900, 29),
        weapon(9080000, "Serpentbone Blade", 901, 29),
      ],
      behaviors,
      attacks,
    );

    expect(result.catalog.moonveil?.attacks).toHaveLength(33);
    expect(result.catalog.uchigatana?.attacks).toEqual(result.catalog.moonveil?.attacks);
    expect(result.catalog.moonveil?.attacks.map(({ id }) => id)).toContain("katana-1h-light-1");
    expect(result.catalog.moonveil?.attacks.map(({ id }) => id)).toContain("katana-2h-guard-counter");
    expect(result.catalog["serpentbone-blade"]?.attacks.find(({ id }) => id === "katana-1h-heavy-1"))
      .toMatchObject({ behaviorVariationId: 901, sourceAttackId: 901100, motionValues: { physical: 50 } });
    expect(result.catalog["serpentbone-blade"]?.attacks.find(({ id }) => id === "katana-1h-light-1"))
      .toMatchObject({ behaviorVariationId: 900, sourceAttackId: 900000 });
  });

  it("maps the verified Straight Sword moveset independently", () => {
    const dataSet = createRegulationWeaponCatalogFixture();
    dataSet.catalog.longsword = {
      ...structuredClone(dataSet.catalog.moonveil!),
      id: "longsword",
      sourceId: 1000000,
      name: "Longsword",
      variants: [{ id: "longsword", sourceId: 1000000, affinity: "standard" }],
      attacks: [],
    };
    const definitions = definitionsFor("straight-sword");

    const result = addVerifiedWeaponAttacks(
      dataSet,
      [weapon(1000000, "Longsword", 200, 23)],
      definitions.map(({ behaviorJudgeId }) => classBehavior(200, behaviorJudgeId)),
      definitions.map(({ behaviorJudgeId }) => classAttack(200, behaviorJudgeId)),
    );

    expect(result.catalog.longsword?.attacks).toHaveLength(33);
    expect(result.catalog.longsword?.attacks[0]).toMatchObject({
      id: "straight-sword-1h-light-1",
      sourceBehaviorId: 100200000,
      sourceAttackId: 200000,
    });
  });
});

const katanaAttackDefinitions = definitionsFor("katana");

function definitionsFor(slug: string) {
  return createMeleeAttackDefinitions(
    meleeWeaponClassDefinitions.find((definition) => definition.slug === slug)!,
  );
}

function weapon(
  ID: number,
  Name: string,
  behaviorVariationId: number,
  wepmotionCategory: number,
): WeaponParamRow {
  return {
    ID,
    Name,
    originEquipWep: ID,
    wepType: 13,
    behaviorVariationId,
    wepmotionCategory,
    atkAttribute: 0,
    atkAttribute2: 2,
  } as WeaponParamRow;
}

function classBehavior(variationId: number, judgeId: number): BehaviorParamRow {
  return {
    ...behavior(judgeId),
    ID: 100000000 + variationId * 1000 + judgeId,
    variationId,
    refId: variationId * 1000 + judgeId,
  };
}

function classAttack(variationId: number, judgeId: number): AttackParamRow {
  return { ...attack(judgeId), ID: variationId * 1000 + judgeId };
}

function behavior(judgeId: number): BehaviorParamRow {
  return {
    ID: 100900000 + judgeId,
    Name: "Default - Katana",
    variationId: 900,
    behaviorJudgeId: judgeId,
    refType: 0,
    refId: 900000 + judgeId,
  };
}

function attack(judgeId: number): AttackParamRow {
  return {
    ID: 900000 + judgeId,
    Name: "Default - Katana",
    atkPhysCorrection: 100,
    atkMagCorrection: 100,
    atkFireCorrection: 100,
    atkThunCorrection: 100,
    atkDarkCorrection: 100,
    atkPhys: 0,
    atkMag: 0,
    atkFire: 0,
    atkThun: 0,
    atkDark: 0,
    atkAttribute: 253,
    isAddBaseAtk: 0,
    finalDamageRateId: -1,
  };
}
