export const moonveilSkillDefinition = {
  id: "transient-moonlight",
  swordArtId: 1178,
  behaviorVariationId: 905,
  attacks: [
    {
      id: "transient-moonlight-light",
      name: "Transient Moonlight (Light)",
      fpCostField: "useMagicPoint_R1",
      components: [
        { kind: "projectile", sourceBehaviorId: 300905900, behaviorJudgeId: 900 },
        { kind: "weapon-hit", sourceBehaviorId: 300905901, behaviorJudgeId: 901 },
      ],
    },
    {
      id: "transient-moonlight-heavy",
      name: "Transient Moonlight (Heavy)",
      fpCostField: "useMagicPoint_R2",
      components: [
        { kind: "projectile", sourceBehaviorId: 300905905, behaviorJudgeId: 905 },
        { kind: "weapon-hit", sourceBehaviorId: 300905906, behaviorJudgeId: 906 },
      ],
    },
  ],
} as const;
