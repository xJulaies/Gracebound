import type { DamageTypes } from "../../../shared/types/game.types";
import type { WeaponSlotId } from "../../builds/types/build.types";

export interface DamageTrialActionOption {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceIconUrl: string;
  sourceDetail: string;
  action: DamageTrialAction;
  sourceName: string;
  iconUrl: string;
  detail: string;
  group: "armament" | "spell";
}

export type DamageTrialAction =
  | {
      kind: "weapon-attack";
      weaponSlotId: WeaponSlotId;
      attackId: string;
      label: string;
      skillBuffActive: boolean;
    }
  | {
      kind: "weapon-skill";
      weaponSlotId: WeaponSlotId;
      skillAttackId: string;
      label: string;
      skillBuffActive: boolean;
    }
  | {
      kind: "spell";
      spellId: string;
      label: string;
      charged: boolean;
    };

export interface DamageTrialEffectsSelection {
  greatRuneActive: boolean;
  wondrousPhysickActive: boolean;
  activeBuffSpellIds: string[];
  weaponBuffActive: boolean;
}

type SavedBuildDamageEffects = DamageTrialEffectsSelection;

export type SavedBuildDamageRequest =
  | SavedBuildDamageEffects & {
      weaponSlotId: WeaponSlotId;
      attackId: string;
      skillBuffActive: boolean;
      bossId: string;
    }
  | SavedBuildDamageEffects & {
      weaponSlotId: WeaponSlotId;
      skillAttackId: string;
      skillBuffActive: boolean;
      bossId: string;
    }
  | SavedBuildDamageEffects & {
      spellId: string;
      charged: boolean;
      bossId: string;
    };

export interface DamageBreakdown extends DamageTypes {
  total: number;
}

export interface DamageTrialComponent {
  kind: string;
  sourceAttackId: number;
  id?: string;
  label?: string;
  outputUnit?: "per-hit" | "per-tick";
  offensiveOutput: DamageBreakdown;
  damage: DamageBreakdown;
}

interface DamageTrialResultBase {
  attack: {
    id: string;
    name: string;
    fpCost: number;
  };
  attackRating: DamageBreakdown;
  offensiveOutput: DamageBreakdown;
  damage: DamageBreakdown;
  components: DamageTrialComponent[];
  target: {
    id: string;
    name: string;
  };
  accuracy: "estimated";
  outputUnit?: "per-hit" | "per-tick" | "per-component";
  limitations: string[];
  buffs: Array<{
    id: string;
    name: string;
    slot: "aura" | "body" | "weapon";
    durationSeconds: number;
  }>;
  greatRune: { id: string; name: string } | null;
  crystalTears: Array<{ id: string; name: string }>;
  talismans: Array<{ id: string; name: string }>;
}

interface WeaponDamageTrialResult extends DamageTrialResultBase {
  weapon: {
    id: string;
    name: string;
    gameVersion: string;
    upgradeLevel: number;
    affinity: string;
  };
}

interface SpellDamageTrialResult extends DamageTrialResultBase {
  spell: {
    id: string;
    name: string;
    type: "sorcery" | "incantation";
    charged: boolean;
  };
  catalyst: {
    weaponId: string;
    variantId: string;
    name: string;
    upgradeLevel: number;
  };
  aggregateAssumption: "one-occurrence-per-component" | null;
}

export type DamageTrialResult = WeaponDamageTrialResult | SpellDamageTrialResult;

export interface DamageTrialLogEntry {
  id: string;
  sequence: number;
  action: DamageTrialAction;
  result: DamageTrialResult;
  bossHealthBefore: number;
  bossHealthAfter: number;
}

export interface DamageTrialSession {
  buildId: string | null;
  bossId: string | null;
  bossMaxHealth: number;
  bossCurrentHealth: number;
  selectedAction: DamageTrialAction | null;
  log: DamageTrialLogEntry[];
}
