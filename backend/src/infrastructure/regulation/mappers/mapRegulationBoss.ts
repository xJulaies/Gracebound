import { calculateScaledBossHealth } from "../../../features/bosses/domain/calculateScaledBossHealth";
import type {
  BossAbsorption,
  BossData,
} from "../../../features/bosses/domain/boss.types";
import type { DamageTypes } from "../../../features/damage/domain/damage.types";
import type { NpcParamRow } from "../schemas/npcParam.schema";
import type { SpEffectParamRow } from "../schemas/spEffectParam.schema";

export interface RegulationBossDefinition {
  id: string;
  name: string;
  npcParamId: number;
}

export function mapRegulationBoss(
  definition: RegulationBossDefinition,
  npcRows: NpcParamRow[],
  effectRows: SpEffectParamRow[],
): BossData {
  const npc = npcRows.find((row) => row.ID === definition.npcParamId);

  if (!npc) {
    throw new Error(`Unknown NpcParam ${definition.npcParamId}`);
  }

  const healthScalingEffect = effectRows.find(
    (row) => row.ID === npc.spEffectID3,
  );

  if (!healthScalingEffect) {
    throw new Error(
      `Unknown SpEffectParam ${npc.spEffectID3} for ${definition.name}`,
    );
  }

  if (npc.def_slash !== 0 || npc.def_blow !== 0 || npc.def_thrust !== 0) {
    throw new Error(`Unsupported physical defense modifiers for ${definition.name}`);
  }

  return {
    id: definition.id,
    name: definition.name,
    health: calculateScaledBossHealth(npc.hp, healthScalingEffect.maxHpRate),
    defense: mapDefense(npc, healthScalingEffect),
    absorption: mapAbsorption(npc),
    sourceNpcId: npc.ID,
    healthScalingEffectId: healthScalingEffect.ID,
  };
}

export function mapRegulationBosses(
  definitions: readonly RegulationBossDefinition[],
  npcRows: NpcParamRow[],
  effectRows: SpEffectParamRow[],
): BossData[] {
  return definitions.map((definition) =>
    mapRegulationBoss(definition, npcRows, effectRows),
  );
}

function mapDefense(
  npc: NpcParamRow,
  effect: SpEffectParamRow,
): DamageTypes {
  return {
    physical: Math.floor(npc.def_phys * effect.physicsDiffenceRate),
    magic: Math.floor(npc.def_mag * effect.magicDiffenceRate),
    fire: Math.floor(npc.def_fire * effect.fireDiffenceRate),
    lightning: Math.floor(npc.def_thunder * effect.thunderDiffenceRate),
    holy: Math.floor(npc.def_dark * effect.darkDiffenceRate),
  };
}

function mapAbsorption(npc: NpcParamRow): BossAbsorption {
  return {
    physical: {
      standard: damageRateToAbsorption(npc.neutralDamageCutRate),
      slash: damageRateToAbsorption(npc.slashDamageCutRate),
      strike: damageRateToAbsorption(npc.blowDamageCutRate),
      pierce: damageRateToAbsorption(npc.thrustDamageCutRate),
    },
    magic: damageRateToAbsorption(npc.magicDamageCutRate),
    fire: damageRateToAbsorption(npc.fireDamageCutRate),
    lightning: damageRateToAbsorption(npc.thunderDamageCutRate),
    holy: damageRateToAbsorption(npc.darkDamageCutRate),
  };
}

function damageRateToAbsorption(damageRate: number): number {
  return Math.round((1 - damageRate) * 1000) / 10;
}
