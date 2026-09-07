import type { CrystalTear } from "../types/crystalTear.types";

export function describeCrystalTearEffects(tear: CrystalTear) {
  const effects = tear.effects;
  if (!effects) return ["This effect is catalogued but not supported by the calculator yet."];

  const descriptions: string[] = [];
  addBonuses(descriptions, effects.attributeBonuses, "+", "");
  addMultipliers(descriptions, effects.resourceMultipliers, " maximum");
  addMultipliers(descriptions, effects.outgoingDamageMultipliers, " damage");
  addMultipliers(descriptions, effects.chargedAttackDamageMultipliers, " charged-attack damage");
  addMultipliers(descriptions, effects.incomingDamageMultipliers, " incoming damage");
  addMultipliers(descriptions, effects.fpCostMultipliers, " FP cost");
  if (effects.poiseDamageMultiplier !== 1) descriptions.push(formatMultiplier(effects.poiseDamageMultiplier, " poise damage"));
  if (effects.staminaRecoverySpeedBonus !== 0) descriptions.push(`+${effects.staminaRecoverySpeedBonus} stamina recovery speed`);
  addBonuses(descriptions, effects.statusResistanceBonuses, "+", " resistance");
  if (effects.cleansesStatusBuildup.length > 0) {
    descriptions.push(`Cleanses ${effects.cleansesStatusBuildup.map(formatLabel).join(", ")} buildup`);
  }
  if (effects.recovery.instantMaxHpPercent > 0) descriptions.push(`Restores ${formatPercent(effects.recovery.instantMaxHpPercent)} maximum HP`);
  if (effects.recovery.instantMaxFpPercent > 0) descriptions.push(`Restores ${formatPercent(effects.recovery.instantMaxFpPercent)} maximum FP`);
  if (effects.recovery.hpPerSecond > 0) {
    descriptions.push(`Restores ${effects.recovery.hpPerSecond} HP per second for ${effects.recovery.hpRegenerationDurationSeconds} seconds`);
  }
  return descriptions.length > 0 ? descriptions : ["Supported effect with no persistent status change."];
}

export function getPhysickSimulationStatus(tears: CrystalTear[]) {
  if (tears.length === 0) return { canActivate: false, message: "Select at least one Crystal Tear." };
  const unsupported = tears.filter(({ effects }) => !effects);
  if (unsupported.length > 0) {
    return {
      canActivate: false,
      message: `Not calculable: ${unsupported.map(({ name }) => name).join(", ")}.`,
    };
  }
  const durations = [...new Set(tears.map(({ effects }) => effects!.durationSeconds).filter(Boolean))];
  return {
    canActivate: true,
    message: durations.length > 0
      ? `Verified effects · ${durations.map((duration) => `${duration}s`).join(" / ")}`
      : "Verified instant effects",
  };
}

function addBonuses(
  output: string[],
  values: object,
  prefix: string,
  suffix: string,
) {
  Object.entries(values as Record<string, number>).filter(([, value]) => value !== 0).forEach(([name, value]) => {
    output.push(`${prefix}${value} ${formatLabel(name)}${suffix}`);
  });
}

function addMultipliers(output: string[], values: object, suffix: string) {
  Object.entries(values as Record<string, number>).filter(([, value]) => value !== 1).forEach(([name, value]) => {
    output.push(`${formatLabel(name)}: ${formatMultiplier(value, suffix)}`);
  });
}

function formatMultiplier(value: number, suffix: string) {
  const percentage = Math.round((value - 1) * 10000) / 100;
  return `${percentage >= 0 ? "+" : ""}${percentage}%${suffix}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 10000) / 100}% of`;
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
