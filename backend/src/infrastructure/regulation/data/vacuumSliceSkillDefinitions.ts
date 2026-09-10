import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

const weaponClasses = [
  ["dagger", 20], ["straight-sword", 23], ["greatsword", 25],
  ["colossal-sword", 26], ["curved-sword", 28], ["curved-greatsword", 40],
  ["katana", 29], ["twinblade", 24], ["thrusting-sword", 27],
  ["heavy-thrusting-sword", 39], ["axe", 30], ["greataxe", 32],
  ["light-greatsword", 60], ["great-katana", 61],
] as const;

export const vacuumSliceSkillDefinitions = weaponClasses.map(
  ([weaponType, motionCategoryId]) => ({
    weaponType,
    motionCategoryId,
    definition: {
      id: "vacuum-slice",
      swordArtId: 220,
      behaviorVariationId: 0,
      attacks: [{
        id: "vacuum-slice",
        name: "Vacuum Slice",
        fpCostField: "useMagicPoint_L2",
        components: [
          { kind: "weapon-hit", sourceBehaviorId: 300000417, behaviorJudgeId: 417 },
          { kind: "projectile", sourceBehaviorId: 300000415, behaviorJudgeId: 415 },
        ],
      }],
    } satisfies RegulationWeaponSkillDefinition,
  }),
);
