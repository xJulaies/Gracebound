import type { DamageTypes } from "../../../features/damage/domain/damage.types";
import {
  ATTRIBUTE_NAMES,
  type Attributes,
  type ScalingCurve,
  type WeaponDataSet,
} from "../../../features/weapons/domain/weapon.types";
import type {
  AttackElementCorrectRow,
  CalcCorrectGraphRow,
  ReinforceWeaponRow,
  WeaponParamRow,
} from "../schemas/weaponParam.schema";

const DAMAGE_TYPES = ["physical", "magic", "fire", "lightning", "holy"] as const;
const SOURCE_DAMAGE_TYPES = ["Physics", "Magic", "Fire", "Thunder", "Dark"] as const;
const SOURCE_ATTRIBUTES = ["Strength", "Dexterity", "Magic", "Faith", "Luck"] as const;

export interface RegulationWeaponTables {
  weapons: WeaponParamRow[];
  reinforcements: ReinforceWeaponRow[];
  corrections: AttackElementCorrectRow[];
  graphs: CalcCorrectGraphRow[];
}

export function mapRegulationWeapon(
  sourceId: number,
  gameVersion: string,
  tables: RegulationWeaponTables,
): WeaponDataSet {
  const weapon = findById(tables.weapons, sourceId, "EquipParamWeapon");
  const correction = findById(
    tables.corrections,
    weapon.attackElementCorrectId,
    "AttackElementCorrectParam",
  );
  const reinforcementRows = tables.reinforcements
    .filter((row) => row.ID >= weapon.reinforceTypeId && row.ID <= weapon.reinforceTypeId + 25)
    .filter((row) => row.Name.startsWith(`${reinforcementNamePrefix(tables.reinforcements, weapon.reinforceTypeId)} +`));

  if (reinforcementRows.length === 0) {
    throw new Error(`Unknown ReinforceParamWeapon ${weapon.reinforceTypeId}`);
  }

  const scalingCurves: Record<string, ScalingCurve> = {};
  const corrections = {} as WeaponDataSet["weapons"][string]["corrections"];

  for (let damageIndex = 0; damageIndex < DAMAGE_TYPES.length; damageIndex += 1) {
    const damageType = DAMAGE_TYPES[damageIndex]!;
    const sourceDamageType = SOURCE_DAMAGE_TYPES[damageIndex]!;
    const graphId = weapon[`correctType_${sourceDamageType}`];
    const graph = findById(tables.graphs, graphId, "CalcCorrectGraph");
    const curveId = regulationId(graphId);
    scalingCurves[curveId] ??= mapScalingCurve(graph);
    corrections[damageType] = [];

    for (let attributeIndex = 0; attributeIndex < ATTRIBUTE_NAMES.length; attributeIndex += 1) {
      const attribute = ATTRIBUTE_NAMES[attributeIndex]!;
      const sourceAttribute = SOURCE_ATTRIBUTES[attributeIndex]!;
      if (numberField(correction, `is${sourceAttribute}Correct_by${sourceDamageType}`) !== 1) continue;

      const override = numberField(correction, `overwrite${sourceAttribute}CorrectRate_by${sourceDamageType}`);
      corrections[damageType].push({
        attribute,
        curveId,
        influenceRatio:
          numberField(correction, `Influence${sourceAttribute}CorrectRate_by${sourceDamageType}`) / 100,
        ...(override === -1 ? {} : { scalingOverride: override / 100 }),
      });
    }
  }

  const id = slugify(weapon.Name);
  const reinforcementId = regulationId(weapon.reinforceTypeId);

  return {
    weapons: {
      [id]: {
        id,
        sourceId: weapon.ID,
        name: weapon.Name,
        gameVersion,
        maxUpgradeLevel: reinforcementRows.length - 1,
        reinforcementId,
        requirements: mapAttributes(weapon, "proper", 1),
        baseAttack: mapDamageTypes(weapon, "attackBase", 1),
        baseScaling: mapAttributes(weapon, "correct", 0.01),
        corrections,
      },
    },
    reinforcements: {
      [reinforcementId]: reinforcementRows.map((row, level) => ({
        level,
        attackMultiplier: mapReinforcementDamage(row),
        scalingMultiplier: mapReinforcementScaling(row),
      })),
    },
    scalingCurves,
  };
}

export function mapScalingCurve(row: CalcCorrectGraphRow): ScalingCurve {
  const values = [0, 0];

  for (let stage = 0; stage < 4; stage += 1) {
    const left = numberField(row, `stageMaxVal${stage}`);
    const right = numberField(row, `stageMaxVal${stage + 1}`);
    const min = numberField(row, `stageMaxGrowVal${stage}`);
    const max = numberField(row, `stageMaxGrowVal${stage + 1}`);
    const adjustment = numberField(row, `adjPt_maxGrowVal${stage}`);

    for (let attribute = left + 1; attribute <= right; attribute += 1) {
      const ratio = (attribute - left) / (right - left);
      const growth = adjustment > 0
        ? ratio ** adjustment
        : 1 - (1 - ratio) ** Math.abs(adjustment);
      values.push((min + (max - min) * growth) / 100);
    }
  }

  while (values.length < 151) values.push(values[values.length - 1]!);
  return { id: regulationId(row.ID), values };
}

function findById<T extends { ID: number }>(rows: T[], id: number, table: string): T {
  const row = rows.find((candidate) => candidate.ID === id);
  if (!row) throw new Error(`Unknown ${table} ${id}`);
  return row;
}

function numberField(row: Record<string, number | string>, key: string): number {
  const value = row[key];
  if (typeof value !== "number") throw new Error(`Missing numeric field ${key}`);
  return value;
}

function reinforcementNamePrefix(rows: ReinforceWeaponRow[], id: number): string {
  return findById(rows, id, "ReinforceParamWeapon").Name.replace(/ \+0$/, "");
}

function mapAttributes(row: WeaponParamRow, prefix: "proper" | "correct", multiplier: number): Attributes {
  return {
    strength: row[`${prefix}Strength`] * multiplier,
    dexterity: row[`${prefix}Agility`] * multiplier,
    intelligence: row[`${prefix}Magic`] * multiplier,
    faith: row[`${prefix}Faith`] * multiplier,
    arcane: row[prefix === "proper" ? "properLuck" : "correctLuck"] * multiplier,
  };
}

function mapDamageTypes(row: WeaponParamRow, prefix: "attackBase", divisor: number): DamageTypes {
  return {
    physical: row[`${prefix}Physics`] / divisor,
    magic: row[`${prefix}Magic`] / divisor,
    fire: row[`${prefix}Fire`] / divisor,
    lightning: row[`${prefix}Thunder`] / divisor,
    holy: row[`${prefix}Dark`] / divisor,
  };
}

function mapReinforcementDamage(row: ReinforceWeaponRow): DamageTypes {
  return { physical: row.physicsAtkRate, magic: row.magicAtkRate, fire: row.fireAtkRate, lightning: row.thunderAtkRate, holy: row.darkAtkRate };
}

function mapReinforcementScaling(row: ReinforceWeaponRow): Attributes {
  return { strength: row.correctStrengthRate, dexterity: row.correctAgilityRate, intelligence: row.correctMagicRate, faith: row.correctFaithRate, arcane: row.correctLuckRate };
}

function regulationId(id: number): string { return `regulation-${id}`; }
function slugify(value: string): string { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
