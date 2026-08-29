import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

export const flameOfTheRedmanesSkillDefinition = {
  id: "flame-of-the-redmanes",
  swordArtId: 505,
  behaviorVariationId: 0,
  attacks: [
    {
      id: "flame-of-the-redmanes",
      name: "Flame of the Redmanes",
      fpCostField: "useMagicPoint_L2",
      components: [{ kind: "projectile", sourceBehaviorId: 300000140, behaviorJudgeId: 140 }],
    },
  ],
} as const satisfies RegulationWeaponSkillDefinition;
