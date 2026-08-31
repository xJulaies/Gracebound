import { weaponFixtures } from "../../features/weapons/data/weapon.fixtures";
import type { WeaponCatalogDataSet } from "../../features/weapons/domain/weaponCatalog.types";
import type { WeaponAttackProfile } from "../../features/weapons/domain/weaponAttack.types";
import type { WeaponSkillProfile } from "../../features/weapons/domain/weaponSkill.types";

export const REGULATION_TEST_GAME_VERSION = "1.17.0";
export const REGULATION_TEST_SOURCE_HASH = "a".repeat(64);

export function createRegulationWeaponCatalogFixture(): WeaponCatalogDataSet {
  const calculationData = structuredClone(weaponFixtures);

  calculationData.reinforcements = renameKeys(
    calculationData.reinforcements,
    regulationId,
  );
  calculationData.scalingCurves = Object.fromEntries(
    Object.entries(calculationData.scalingCurves).map(([id, curve]) => {
      const mappedId = regulationId(id);
      return [mappedId, { ...curve, id: mappedId }];
    }),
  );

  Object.values(calculationData.weapons).forEach((weapon) => {
    weapon.gameVersion = REGULATION_TEST_GAME_VERSION;
    weapon.reinforcementId = regulationId(weapon.reinforcementId);

    Object.values(weapon.corrections)
      .flat()
      .forEach((correction) => {
        correction.curveId = regulationId(correction.curveId);
      });
  });

  const moonveil = calculationData.weapons.moonveil!;
  calculationData.weapons.longsword = {
    ...structuredClone(moonveil),
    id: "longsword",
    sourceId: 1000000,
    name: "Longsword",
  };
  calculationData.weapons["serpentbone-blade"] = {
    ...structuredClone(moonveil),
    id: "serpentbone-blade",
    sourceId: 9080000,
    name: "Serpentbone Blade",
  };

  return {
    catalog: {
      moonveil: catalogWeapon("moonveil", 9060000, "Moonveil", [moonveilAttack, moonveilChargedAttack]),
      longsword: catalogWeapon("longsword", 1000000, "Longsword", longswordAttack),
      "serpentbone-blade": catalogWeapon(
        "serpentbone-blade",
        9080000,
        "Serpentbone Blade",
        serpentboneAttack,
      ),
      "grafted-blade-greatsword": catalogWeapon(
        "grafted-blade-greatsword",
        4100000,
        "Grafted Blade Greatsword",
      ),
    },
    calculationData,
    report: {
      sourceRows: 4,
      canonicalWeapons: 4,
      calculationVariants: 4,
      validatedCalculations: 4,
      excludedRows: 0,
      affinityCounts: {
        standard: 4,
        heavy: 0,
        keen: 0,
        quality: 0,
        fire: 0,
        "flame-art": 0,
        lightning: 0,
        sacred: 0,
        magic: 0,
        cold: 0,
        poison: 0,
        blood: 0,
        occult: 0,
      },
    },
  };
}

function regulationId(id: string): string {
  return id.replace(/^erdb-/, "regulation-");
}

function renameKeys<T>(
  values: Record<string, T>,
  mapKey: (key: string) => string,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [mapKey(key), value]),
  );
}

function catalogWeapon(
  id: string,
  sourceId: number,
  name: string,
  attack?: WeaponAttackProfile | WeaponAttackProfile[],
) {
  return {
    id,
    sourceId,
    name,
    categoryId: 3,
    weaponTypeId: 13,
    weaponType:
      id === "longsword"
        ? "straight-sword"
        : id === "grafted-blade-greatsword"
          ? "colossal-sword"
          : "katana",
    weight: 6.5,
    iconId: sourceId,
    swordArtId: 1178,
    canChangeAffinity: false,
    castingTypes: id === "moonveil" ? ["sorcery" as const] : [],
    variants: [{ id, sourceId, affinity: "standard" as const }],
    attacks: attack ? (Array.isArray(attack) ? attack : [attack]) : [],
    skills: id === "moonveil" ? [moonveilSkill] : [],
  };
}

const moonveilAttack: WeaponAttackProfile = {
  id: "katana-1h-heavy-1",
  name: "One-handed heavy attack 1",
  behaviorVariationId: 900,
  behaviorJudgeId: 100,
  sourceBehaviorId: 100900100,
  sourceAttackId: 900100,
  motionValues: {
    physical: 125,
    magic: 125,
    fire: 125,
    lightning: 125,
    holy: 125,
  },
  physicalAttackType: "slash",
};

const moonveilChargedAttack: WeaponAttackProfile = {
  ...moonveilAttack,
  id: "katana-1h-charged-heavy-1",
  name: "One-handed charged heavy attack 1",
  behaviorJudgeId: 105,
  sourceBehaviorId: 100900105,
  sourceAttackId: 900105,
  motionValues: damageTypes(160),
};

const longswordAttack: WeaponAttackProfile = {
  ...moonveilAttack,
  id: "straight-sword-1h-light-1",
  name: "One-handed light attack 1",
  behaviorVariationId: 200,
  behaviorJudgeId: 0,
  sourceBehaviorId: 100200000,
  sourceAttackId: 200000,
  motionValues: {
    physical: 100,
    magic: 100,
    fire: 100,
    lightning: 100,
    holy: 100,
  },
};

const serpentboneAttack: WeaponAttackProfile = {
  ...moonveilAttack,
  behaviorVariationId: 901,
  sourceBehaviorId: 100901100,
  sourceAttackId: 901100,
  motionValues: {
    physical: 50,
    magic: 50,
    fire: 50,
    lightning: 50,
    holy: 50,
  },
};

const moonveilSkill: WeaponSkillProfile = {
  id: "transient-moonlight",
  name: "Transient Moonlight",
  sourceSwordArtId: 1178,
  attacks: [
    {
      id: "transient-moonlight-light",
      name: "Transient Moonlight (Light)",
      fpCost: 15,
      components: [
        {
          kind: "projectile",
          sourceBehaviorId: 300905900,
          sourceBulletId: 2950,
          sourceAttackId: 303400100,
          physicalAttackType: "pierce",
          motionValues: damageTypes(0),
          addedDamage: { ...damageTypes(0), magic: 140 },
          finalDamageRates: damageTypes(0.65),
        },
        {
          kind: "weapon-hit",
          sourceBehaviorId: 300905901,
          sourceAttackId: 303400101,
          physicalAttackType: "slash",
          motionValues: damageTypes(50),
          addedDamage: damageTypes(0),
          finalDamageRates: damageTypes(0.8),
        },
      ],
    },
  ],
};

function damageTypes(value: number) {
  return {
    physical: value,
    magic: value,
    fire: value,
    lightning: value,
    holy: value,
  };
}
