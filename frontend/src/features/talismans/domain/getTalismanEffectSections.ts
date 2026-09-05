export interface TalismanEffectEntry {
  label: string;
  value: string;
}

export interface TalismanEffectSection {
  title: string;
  entries: TalismanEffectEntry[];
}

const DAMAGE_TYPES = ["physical", "magic", "fire", "lightning", "holy"] as const;

const SECTION_LABELS: Record<string, string> = {
  attributeBonuses: "Attributes",
  chargedAttackDamageMultipliers: "Charged attacks",
  conditionalAttackDamageMultipliers: "Conditional attacks",
  eventRecoveryEffect: "Recovery triggers",
  guardEffects: "Guarding",
  hpConditionedDamageEffect: "HP condition",
  incomingDamageMultipliers: "Damage taken",
  miscellaneousEffects: "Utility",
  outgoingDamageMultipliers: "Damage",
  recoveryEffects: "Recovery",
  resourceMultipliers: "Resources",
  skillDamageMultipliers: "Skills",
  specialDefenseEffects: "Special defense",
  specializedAttackEffects: "Special attacks",
  spellDamageMultipliers: "Spells",
  statusResistanceBonuses: "Resistances",
  successiveAttackEffect: "Successive attacks",
  triggeredDamageEffect: "Triggered damage",
  utilityEffects: "Utility effects",
};

const FIELD_LABELS: Record<string, string> = {
  accumulatorThreshold: "Required hits",
  arcane: "Arcane",
  bleed: "Bleed resistance",
  castingSpeedVirtualDexterity: "Virtual Dexterity for casting",
  deathBlight: "Death Blight resistance",
  dexterity: "Dexterity",
  endurance: "Endurance",
  faith: "Faith",
  fallDamageMultiplier: "Fall damage",
  flatFpRecovery: "FP restored",
  flatHpRecovery: "HP restored",
  fpFlaskRecoveryMultiplier: "FP flask recovery",
  frost: "Frost resistance",
  hpFlaskRecoveryMultiplier: "HP flask recovery",
  hpRecoveryPerSecond: "HP recovery per second",
  incantation: "Incantation damage",
  intelligence: "Intelligence",
  itemDiscoveryRateBonus: "Item discovery",
  madness: "Madness resistance",
  maxEquipLoad: "Maximum equip load",
  maxFp: "Maximum FP",
  maxHp: "Maximum HP",
  maxHpRecoveryPercent: "Maximum HP restored",
  maxStamina: "Maximum stamina",
  memorySlotBonus: "Memory slots",
  mind: "Mind",
  poison: "Poison resistance",
  preventsRuneLoss: "Prevents rune loss",
  rot: "Scarlet Rot resistance",
  runeAcquisitionMultiplier: "Runes acquired",
  silentMovement: "Silent movement",
  skillFpCostMultiplier: "Skill FP cost",
  sleep: "Sleep resistance",
  sorcery: "Sorcery damage",
  spellEffectDurationMultiplier: "Spell effect duration",
  spellFpCostMultiplier: "Spell FP cost",
  staminaCostMultiplier: "Guard stamina cost",
  staminaDamageMultiplier: "Guard stamina damage",
  staminaRecoverySpeedBonus: "Stamina recovery speed",
  strength: "Strength",
  vigor: "Vigor",
};

export function getTalismanEffectSections(
  effects: Record<string, unknown> | null,
): TalismanEffectSection[] {
  if (!effects) return [];

  return Object.entries(effects).flatMap(([sectionKey, value]) => {
    if (!isRecord(value)) return [];
    const entries = collectEntries(value, "", sectionKey.endsWith("Multipliers"));
    return entries.length > 0
      ? [{ title: SECTION_LABELS[sectionKey] ?? humanize(sectionKey), entries }]
      : [];
  });
}

function collectEntries(
  value: Record<string, unknown>,
  prefix = "",
  multiplierContext = false,
): TalismanEffectEntry[] {
  const combinedDamage = combineDamageMultipliers(value, prefix);
  if (combinedDamage) return [combinedDamage];

  return Object.entries(value).flatMap(([key, fieldValue]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(fieldValue)) {
      return fieldValue.flatMap((entry, index) =>
        isRecord(entry) ? collectEntries(entry, `Stage ${index + 1}`, multiplierContext) : [],
      );
    }
    if (isRecord(fieldValue)) {
      return collectEntries(fieldValue, path, multiplierContext || key.endsWith("Multipliers"));
    }
    if (!isMeaningful(key, fieldValue, multiplierContext)) return [];
    return [{
      label: labelFor(path, key),
      value: formatValue(key, fieldValue, multiplierContext),
    }];
  });
}

function combineDamageMultipliers(
  value: Record<string, unknown>,
  prefix: string,
): TalismanEffectEntry | null {
  if (!DAMAGE_TYPES.every((damageType) => typeof value[damageType] === "number")) {
    return null;
  }
  const multipliers = DAMAGE_TYPES.map((damageType) => value[damageType] as number);
  if (!multipliers.every((multiplier) => multiplier === multipliers[0])) return null;
  if (multipliers[0] === 1) return null;
  return {
    label: formatDamageLabel(prefix),
    value: formatMultiplier(multipliers[0]!),
  };
}

function formatDamageLabel(prefix: string) {
  const context = prefix.replace(/\.?damageMultipliers$/i, "");
  return context ? `${humanize(context)} — all damage` : "All damage";
}

function isMeaningful(key: string, value: unknown, multiplierContext: boolean) {
  if (value === null || value === false || value === "" || value === undefined) return false;
  if (typeof value === "number") {
    return multiplierContext || isMultiplier(key) ? value !== 1 : value !== 0;
  }
  return true;
}

function formatValue(key: string, value: unknown, multiplierContext: boolean) {
  if (typeof value === "boolean") return "Active";
  if (typeof value === "string") return humanize(value);
  if (typeof value !== "number") return String(value);
  if (multiplierContext || isMultiplier(key)) return formatMultiplier(value);
  if (key.endsWith("Percent")) return `${formatNumber(value)}%`;
  if (key.endsWith("Seconds")) return `${formatNumber(value)} s`;
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

function formatMultiplier(value: number) {
  const percentage = (value - 1) * 100;
  return `${percentage > 0 ? "+" : ""}${formatNumber(percentage)}%`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function labelFor(path: string, key: string) {
  const prefix = path.includes(".") ? path.split(".").slice(0, -1).join(" — ") : "";
  const label = FIELD_LABELS[key] ?? humanize(key);
  return prefix.startsWith("Stage ") ? `${prefix} — ${label}` : label;
}

function isMultiplier(key: string) {
  return key.endsWith("Multiplier") || key.endsWith("Rate");
}

function humanize(value: string) {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replaceAll(".", " — ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
