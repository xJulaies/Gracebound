import type { RegulationWeaponAttackDefinition } from "../mappers/mapRegulationWeaponAttacks";

interface AttackTemplate {
  suffix: string;
  name: string;
  behaviorJudgeId: number;
  chainPosition?: number;
}

export interface MeleeWeaponClassDefinition {
  motionCategoryId: number;
  slug: string;
  name: string;
  behaviorVariationId: number;
  lightChainLength: number;
}

const attackTemplates: AttackTemplate[] = [
  { suffix: "1h-light-1", name: "One-handed light attack 1", behaviorJudgeId: 0, chainPosition: 1 },
  { suffix: "1h-light-2", name: "One-handed light attack 2", behaviorJudgeId: 10, chainPosition: 2 },
  { suffix: "1h-light-3", name: "One-handed light attack 3", behaviorJudgeId: 20, chainPosition: 3 },
  { suffix: "1h-light-4", name: "One-handed light attack 4", behaviorJudgeId: 30, chainPosition: 4 },
  { suffix: "1h-light-5", name: "One-handed light attack 5", behaviorJudgeId: 40, chainPosition: 5 },
  { suffix: "1h-heavy-1", name: "One-handed heavy attack 1", behaviorJudgeId: 100 },
  { suffix: "1h-charged-heavy-1", name: "One-handed charged heavy attack 1", behaviorJudgeId: 105 },
  { suffix: "1h-heavy-2", name: "One-handed heavy attack 2", behaviorJudgeId: 110 },
  { suffix: "1h-charged-heavy-2", name: "One-handed charged heavy attack 2", behaviorJudgeId: 115 },
  { suffix: "1h-running-light", name: "One-handed running light attack", behaviorJudgeId: 120 },
  { suffix: "1h-running-heavy", name: "One-handed running heavy attack", behaviorJudgeId: 125 },
  { suffix: "1h-rolling-light", name: "One-handed rolling light attack", behaviorJudgeId: 130 },
  { suffix: "1h-backstep-light", name: "One-handed backstep light attack", behaviorJudgeId: 140 },
  { suffix: "1h-guard-counter", name: "One-handed guard counter", behaviorJudgeId: 180 },
  { suffix: "2h-light-1", name: "Two-handed light attack 1", behaviorJudgeId: 200, chainPosition: 1 },
  { suffix: "2h-light-2", name: "Two-handed light attack 2", behaviorJudgeId: 210, chainPosition: 2 },
  { suffix: "2h-light-3", name: "Two-handed light attack 3", behaviorJudgeId: 220, chainPosition: 3 },
  { suffix: "2h-light-4", name: "Two-handed light attack 4", behaviorJudgeId: 230, chainPosition: 4 },
  { suffix: "2h-light-5", name: "Two-handed light attack 5", behaviorJudgeId: 240, chainPosition: 5 },
  { suffix: "2h-heavy-1", name: "Two-handed heavy attack 1", behaviorJudgeId: 300 },
  { suffix: "2h-charged-heavy-1", name: "Two-handed charged heavy attack 1", behaviorJudgeId: 305 },
  { suffix: "2h-heavy-2", name: "Two-handed heavy attack 2", behaviorJudgeId: 310 },
  { suffix: "2h-charged-heavy-2", name: "Two-handed charged heavy attack 2", behaviorJudgeId: 315 },
  { suffix: "2h-running-light", name: "Two-handed running light attack", behaviorJudgeId: 320 },
  { suffix: "2h-running-heavy", name: "Two-handed running heavy attack", behaviorJudgeId: 325 },
  { suffix: "2h-rolling-light", name: "Two-handed rolling light attack", behaviorJudgeId: 330 },
  { suffix: "2h-backstep-light", name: "Two-handed backstep light attack", behaviorJudgeId: 340 },
  { suffix: "2h-guard-counter", name: "Two-handed guard counter", behaviorJudgeId: 380 },
  { suffix: "offhand-light-1", name: "Offhand light attack 1", behaviorJudgeId: 400, chainPosition: 1 },
  { suffix: "offhand-light-2", name: "Offhand light attack 2", behaviorJudgeId: 410, chainPosition: 2 },
  { suffix: "offhand-light-3", name: "Offhand light attack 3", behaviorJudgeId: 420, chainPosition: 3 },
  { suffix: "offhand-light-4", name: "Offhand light attack 4", behaviorJudgeId: 430, chainPosition: 4 },
  { suffix: "offhand-light-5", name: "Offhand light attack 5", behaviorJudgeId: 440, chainPosition: 5 },
];

export const meleeWeaponClassDefinitions: MeleeWeaponClassDefinition[] = [
  weaponClass(20, "dagger", "Dagger", 100, 5),
  weaponClass(23, "straight-sword", "Straight Sword", 200, 5),
  weaponClass(25, "greatsword", "Greatsword", 300, 4),
  weaponClass(26, "colossal-sword", "Colossal Sword", 400, 3),
  weaponClass(24, "twinblade", "Twinblade", 1000, 5),
  weaponClass(27, "thrusting-sword", "Thrusting Sword", 500, 5),
  weaponClass(39, "heavy-thrusting-sword", "Heavy Thrusting Sword", 600, 5),
  weaponClass(28, "curved-sword", "Curved Sword", 700, 5),
  weaponClass(40, "curved-greatsword", "Curved Greatsword", 800, 4),
  weaponClass(29, "katana", "Katana", 900, 5),
  weaponClass(30, "axe", "Axe", 1400, 5),
  weaponClass(32, "greataxe", "Greataxe", 1500, 4),
  weaponClass(33, "hammer", "Hammer", 1100, 5),
  weaponClass(35, "great-hammer", "Great Hammer", 1200, 4),
  weaponClass(34, "flail", "Flail", 1300, 4),
  weaponClass(36, "spear", "Spear", 1600, 4),
  weaponClass(37, "great-spear", "Great Spear", 1700, 3),
  weaponClass(38, "halberd", "Halberd", 1800, 4),
  weaponClass(50, "reaper", "Reaper", 1900, 4),
  weaponClass(42, "fist", "Fist", 2100, 5),
  weaponClass(22, "claw", "Claw", 2200, 5),
  weaponClass(43, "whip", "Whip", 2000, 4),
  weaponClass(31, "colossal-weapon", "Colossal Weapon", 2300, 3),
  weaponClass(21, "torch", "Torch", 2400, 4),
  weaponClass(55, "hand-to-hand", "Hand-to-Hand", 6300, 5),
  weaponClass(58, "backhand-blade", "Backhand Blade", 6400, 5),
  weaponClass(61, "great-katana", "Great Katana", 6600, 4),
  weaponClass(60, "light-greatsword", "Light Greatsword", 6700, 5),
  weaponClass(62, "beast-claw", "Beast Claw", 6800, 4),
];

export function createMeleeAttackDefinitions(
  weaponClassDefinition: MeleeWeaponClassDefinition,
): RegulationWeaponAttackDefinition[] {
  return attackTemplates
    .filter(({ chainPosition }) => !chainPosition || chainPosition <= weaponClassDefinition.lightChainLength)
    .map(({ suffix, name, behaviorJudgeId }) => ({
      id: `${weaponClassDefinition.slug}-${suffix}`,
      name,
      sourceBehaviorId: 100000000 + weaponClassDefinition.behaviorVariationId * 1000 + behaviorJudgeId,
      behaviorVariationId: weaponClassDefinition.behaviorVariationId,
      behaviorJudgeId,
    }));
}

function weaponClass(
  motionCategoryId: number,
  slug: string,
  name: string,
  behaviorVariationId: number,
  lightChainLength: number,
): MeleeWeaponClassDefinition {
  return { motionCategoryId, slug, name, behaviorVariationId, lightChainLength };
}
