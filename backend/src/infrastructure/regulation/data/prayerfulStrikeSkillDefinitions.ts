import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

const weaponClasses = [
  ["axe", 30],
  ["greataxe", 32],
  ["hammer", 33],
  ["great-hammer", 35],
  ["flail", 34],
  ["colossal-weapon", 31],
] as const;

export const prayerfulStrikeSkillDefinitions = weaponClasses.map(
  ([weaponType, motionCategoryId]) => ({
    weaponType,
    motionCategoryId,
    definition: {
      id: "prayerful-strike",
      swordArtId: 208,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "prayerful-strike",
          name: "Prayerful Strike",
          fpCostField: "useMagicPoint_L2" as const,
          components: [
            {
              kind: "weapon-hit" as const,
              sourceBehaviorId: 300000102,
              behaviorJudgeId: 102,
            },
          ],
        },
      ],
    } satisfies RegulationWeaponSkillDefinition,
  }),
);
