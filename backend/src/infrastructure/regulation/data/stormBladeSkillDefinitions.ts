import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

const weaponClasses = [
  ["dagger", 20],
  ["straight-sword", 23],
  ["greatsword", 25],
  ["curved-sword", 28],
  ["curved-greatsword", 40],
  ["katana", 29],
  ["thrusting-sword", 27],
  ["heavy-thrusting-sword", 39],
  ["light-greatsword", 60],
  ["great-katana", 61],
] as const;

export const stormBladeSkillDefinitions = weaponClasses.map(
  ([weaponType, motionCategoryId]) => ({
    weaponType,
    motionCategoryId,
    definition: {
      id: "storm-blade",
      swordArtId: 210,
      behaviorVariationId: 0,
      attacks: [
        stormBladeAttack("storm-blade-1", "Storm Blade", 407, "useMagicPoint_L2"),
        stormBladeAttack("storm-blade-2", "Storm Blade (Follow-up 1)", 408, "useMagicPoint_R2"),
        stormBladeAttack("storm-blade-3", "Storm Blade (Follow-up 2)", 409, "useMagicPoint_R2"),
      ],
    } satisfies RegulationWeaponSkillDefinition,
  }),
);

function stormBladeAttack(
  id: string,
  name: string,
  weaponBehaviorJudgeId: number,
  fpCostField: "useMagicPoint_L2" | "useMagicPoint_R2",
) {
  return {
    id,
    name,
    fpCostField,
    components: [
      {
        kind: "weapon-hit" as const,
        sourceBehaviorId: 300000000 + weaponBehaviorJudgeId,
        behaviorJudgeId: weaponBehaviorJudgeId,
      },
      {
        kind: "projectile" as const,
        sourceBehaviorId: 300000410,
        behaviorJudgeId: 410,
      },
    ],
  };
}
