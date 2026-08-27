import type { DamageTypes } from "../../../features/damage/domain/damage.types";
import type { WeaponSkillProfile } from "../../../features/weapons/domain/weaponSkill.types";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";
import type {
  BulletParamRow,
  FinalDamageRateRow,
  SwordArtsParamRow,
} from "../schemas/weaponSkillParam.schema";
import { resolvePhysicalAttackType } from "./mapRegulationWeaponAttacks";

interface SkillAttackDefinition {
  id: string;
  name: string;
  fpCostField: "useMagicPoint_R1" | "useMagicPoint_R2";
  projectileBehaviorJudgeId: number;
  weaponHitBehaviorJudgeId: number;
}

export interface RegulationWeaponSkillDefinition {
  id: string;
  swordArtId: number;
  behaviorVariationId: number;
  attacks: readonly SkillAttackDefinition[];
}

interface WeaponSkillTables {
  behaviors: BehaviorParamRow[];
  attacks: AttackParamRow[];
  bullets: BulletParamRow[];
  swordArts: SwordArtsParamRow[];
  finalDamageRates: FinalDamageRateRow[];
}

export function mapRegulationWeaponSkill(
  weapon: WeaponParamRow,
  definition: RegulationWeaponSkillDefinition,
  tables: WeaponSkillTables,
): WeaponSkillProfile {
  const swordArt = findOne(tables.swordArts, definition.swordArtId, "SwordArtsParam");

  return {
    id: definition.id,
    name: swordArt.Name,
    sourceSwordArtId: swordArt.ID,
    attacks: definition.attacks.map((attackDefinition) => ({
      id: attackDefinition.id,
      name: attackDefinition.name,
      fpCost: swordArt[attackDefinition.fpCostField],
      components: [
        mapProjectileComponent(weapon, definition.behaviorVariationId, attackDefinition.projectileBehaviorJudgeId, tables),
        mapWeaponHitComponent(weapon, definition.behaviorVariationId, attackDefinition.weaponHitBehaviorJudgeId, tables),
      ],
    })),
  };
}

function mapProjectileComponent(
  weapon: WeaponParamRow,
  variationId: number,
  judgeId: number,
  tables: WeaponSkillTables,
) {
  const behavior = findBehavior(tables.behaviors, variationId, judgeId, 1);
  const bullet = findOne(tables.bullets, behavior.refId, "Bullet");
  const attack = findOne(tables.attacks, bullet.atkId_Bullet, "AtkParam_Pc");

  if (attack.isAddBaseAtk !== 1) {
    throw new Error(`Expected additive projectile attack ${attack.ID}`);
  }

  return {
    kind: "projectile" as const,
    sourceBehaviorId: behavior.ID,
    sourceBulletId: bullet.ID,
    ...mapDamageComponent(weapon, attack, tables.finalDamageRates),
  };
}

function mapWeaponHitComponent(
  weapon: WeaponParamRow,
  variationId: number,
  judgeId: number,
  tables: WeaponSkillTables,
) {
  const behavior = findBehavior(tables.behaviors, variationId, judgeId, 0);
  const attack = findOne(tables.attacks, behavior.refId, "AtkParam_Pc");

  if (attack.isAddBaseAtk !== 0) {
    throw new Error(`Expected weapon-based attack ${attack.ID}`);
  }

  return {
    kind: "weapon-hit" as const,
    sourceBehaviorId: behavior.ID,
    ...mapDamageComponent(weapon, attack, tables.finalDamageRates),
  };
}

function mapDamageComponent(
  weapon: WeaponParamRow,
  attack: AttackParamRow,
  finalDamageRates: FinalDamageRateRow[],
) {
  const rates = findOne(finalDamageRates, attack.finalDamageRateId, "FinalDamageRateParam");
  return {
    sourceAttackId: attack.ID,
    physicalAttackType: resolvePhysicalAttackType(attack.atkAttribute, weapon),
    motionValues: damageTypes(attack, "Correction"),
    addedDamage: damageTypes(attack, ""),
    finalDamageRates: {
      physical: rates.physRate,
      magic: rates.magRate,
      fire: rates.fireRate,
      lightning: rates.thunRate,
      holy: rates.darkRate,
    },
  };
}

function damageTypes(attack: AttackParamRow, suffix: "" | "Correction"): DamageTypes {
  return {
    physical: attack[`atkPhys${suffix}`],
    magic: attack[`atkMag${suffix}`],
    fire: attack[`atkFire${suffix}`],
    lightning: attack[`atkThun${suffix}`],
    holy: attack[`atkDark${suffix}`],
  };
}

function findBehavior(rows: BehaviorParamRow[], variationId: number, judgeId: number, refType: number) {
  const matches = rows.filter((row) => row.variationId === variationId && row.behaviorJudgeId === judgeId && row.refType === refType);
  if (matches.length !== 1) throw new Error(`Expected one behavior ${variationId}:${judgeId}:${refType}, found ${matches.length}`);
  return matches[0]!;
}

function findOne<T extends { ID: number }>(rows: T[], id: number, table: string): T {
  const matches = rows.filter((row) => row.ID === id);
  if (matches.length !== 1) throw new Error(`Expected one ${table} ${id}, found ${matches.length}`);
  return matches[0]!;
}
