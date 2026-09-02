import type { DamageTypes } from "../../damage/domain/damage.types";

interface GeneralBuffEffect {
  slot: string;
  outgoingDamageMultipliers: DamageTypes;
}

interface GeneralBuffCandidate {
  id: string;
  buffEffect: GeneralBuffEffect | null;
}

export function resolveGeneralBuffSelection<T extends GeneralBuffCandidate>(
  requestedIds: string[],
  availableBuffs: T[],
): T[] {
  if (
    availableBuffs.length !== requestedIds.length ||
    availableBuffs.some(({ buffEffect }) => !buffEffect)
  ) {
    throw new Error("Unsupported buff spell selection");
  }

  const byId = new Map(availableBuffs.map((buff) => [buff.id, buff]));
  const selectedBuffs = requestedIds.map((id) => byId.get(id));
  if (selectedBuffs.some((buff) => !buff)) {
    throw new Error("Unsupported buff spell selection");
  }
  const resolvedBuffs = selectedBuffs as T[];

  if (resolvedBuffs.some(({ buffEffect }) => buffEffect!.slot === "weapon")) {
    throw new Error("Weapon buff spells require a catalyst selection");
  }
  if (resolvedBuffs.some(({ buffEffect }) => !isGeneralBuffSlot(buffEffect!.slot))) {
    throw new Error("Unsupported general buff slot");
  }
  if (new Set(resolvedBuffs.map(({ buffEffect }) => buffEffect!.slot)).size !== resolvedBuffs.length) {
    throw new Error("Only one active buff per slot is allowed");
  }

  return resolvedBuffs;
}

export function applyOutgoingBuffMultipliers(
  baseMultipliers: DamageTypes,
  buffs: GeneralBuffCandidate[],
): DamageTypes {
  return buffs.reduce((total, { buffEffect }) => {
    if (!buffEffect || !isGeneralBuffSlot(buffEffect.slot)) {
      throw new Error("Only aura and body buffs can modify general outgoing damage");
    }
    return multiplyDamageTypes(total, buffEffect.outgoingDamageMultipliers);
  }, baseMultipliers);
}

export function validateWeaponBuffExclusivity(
  hasSpellWeaponBuff: boolean,
  hasSkillWeaponBuff: boolean,
) {
  if (hasSpellWeaponBuff && hasSkillWeaponBuff) {
    throw new Error("Spell and skill weapon buffs cannot be active together");
  }
}

function isGeneralBuffSlot(slot: string): slot is "aura" | "body" {
  return slot === "aura" || slot === "body";
}

function multiplyDamageTypes(left: DamageTypes, right: DamageTypes): DamageTypes {
  return {
    physical: left.physical * right.physical,
    magic: left.magic * right.magic,
    fire: left.fire * right.fire,
    lightning: left.lightning * right.lightning,
    holy: left.holy * right.holy,
  };
}
