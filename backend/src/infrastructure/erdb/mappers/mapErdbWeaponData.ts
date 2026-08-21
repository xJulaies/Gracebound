import type { DamageTypes } from "../../../features/damage/domain/damage.types";
import {
  ATTRIBUTE_NAMES,
  type AttributeName,
  type Attributes,
  type WeaponDataSet,
} from "../../../features/weapons/domain/weapon.types";
import type { ErdbWeaponImport } from "../schemas/erdb.schema";

const DAMAGE_TYPES = [
  "physical",
  "magic",
  "fire",
  "lightning",
  "holy",
] as const satisfies readonly (keyof DamageTypes)[];

export function mapErdbWeaponData(input: ErdbWeaponImport): WeaponDataSet {
  const dataSet: WeaponDataSet = {
    weapons: {},
    reinforcements: {},
    scalingCurves: {},
  };

  for (const armament of Object.values(input.armaments)) {
    const standardAffinity = armament.affinity.Standard;

    if (!standardAffinity) {
      throw new Error(`${armament.name} has no Standard affinity`);
    }

    const reinforcementSourceId = String(
      standardAffinity.reinforcement_id,
    );
    const correctionAttackSourceId = String(
      standardAffinity.correction_attack_id,
    );
    const reinforcement = input.reinforcements[reinforcementSourceId];
    const correctionAttack =
      input.correctionAttacks[correctionAttackSourceId];

    if (!reinforcement) {
      throw new Error(
        `Unknown reinforcement ${reinforcementSourceId} for ${armament.name}`,
      );
    }

    if (!correctionAttack) {
      throw new Error(
        `Unknown correction attack ${correctionAttackSourceId} for ${armament.name}`,
      );
    }

    const reinforcementId = erdbId(reinforcementSourceId);
    dataSet.reinforcements[reinforcementId] ??= reinforcement
      .map((level) => ({
        level: level.level,
        attackMultiplier: fillDamageTypes(level.damage, 1),
        scalingMultiplier: fillAttributes(level.scaling, 1),
      }))
      .sort((left, right) => left.level - right.level);

    const corrections = mapCorrections(
      standardAffinity.correction_calc_id,
      correctionAttack,
      input,
      dataSet,
    );
    const maxUpgradeLevel = Math.max(
      ...dataSet.reinforcements[reinforcementId].map((level) => level.level),
    );
    const id = slugify(armament.name);

    if (dataSet.weapons[id]) {
      throw new Error(`Duplicate normalized weapon ID ${id}`);
    }

    dataSet.weapons[id] = {
      id,
      sourceId: armament.id,
      name: armament.name,
      gameVersion: input.gameVersion,
      maxUpgradeLevel,
      reinforcementId,
      requirements: fillAttributes(armament.requirements, 0),
      baseAttack: fillDamageTypes(standardAffinity.damage, 0),
      baseScaling: fillAttributes(standardAffinity.scaling, 0),
      corrections,
    };
  }

  return dataSet;
}

function mapCorrections(
  curveIds: Record<keyof DamageTypes, number>,
  correctionAttack: ErdbWeaponImport["correctionAttacks"][string],
  input: ErdbWeaponImport,
  dataSet: WeaponDataSet,
) {
  const result = {} as WeaponDataSet["weapons"][string]["corrections"];

  for (const damageType of DAMAGE_TYPES) {
    result[damageType] = [];
    const curveSourceId = String(curveIds[damageType]);
    const curveValues = input.correctionGraphs[curveSourceId];

    if (!curveValues) {
      throw new Error(`Unknown correction graph ${curveSourceId}`);
    }

    const curveId = erdbId(curveSourceId);
    dataSet.scalingCurves[curveId] ??= {
      id: curveId,
      values: [...curveValues],
    };

    for (const attribute of ATTRIBUTE_NAMES) {
      if (!correctionAttack.correction[damageType][attribute]) {
        continue;
      }

      const scalingOverride =
        correctionAttack.override[damageType][attribute];

      result[damageType].push({
        attribute,
        curveId,
        influenceRatio: correctionAttack.ratio[damageType][attribute],
        ...(scalingOverride === undefined ? {} : { scalingOverride }),
      });
    }
  }

  return result;
}

function fillDamageTypes(
  values: Partial<DamageTypes>,
  fallback: number,
): DamageTypes {
  return {
    physical: values.physical ?? fallback,
    magic: values.magic ?? fallback,
    fire: values.fire ?? fallback,
    lightning: values.lightning ?? fallback,
    holy: values.holy ?? fallback,
  };
}

function fillAttributes(
  values: Partial<Record<AttributeName, number>>,
  fallback: number,
): Attributes {
  return {
    strength: values.strength ?? fallback,
    dexterity: values.dexterity ?? fallback,
    intelligence: values.intelligence ?? fallback,
    faith: values.faith ?? fallback,
    arcane: values.arcane ?? fallback,
  };
}

function erdbId(sourceId: string): string {
  return `erdb-${sourceId}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
