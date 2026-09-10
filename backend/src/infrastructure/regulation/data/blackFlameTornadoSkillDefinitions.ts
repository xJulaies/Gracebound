import type { RegulationWeaponSkillDefinition } from "../mappers/mapRegulationWeaponSkill";

const weaponClasses = [
  ["twinblade", 24],
  ["spear", 36],
  ["great-spear", 37],
  ["halberd", 38],
  ["reaper", 50],
] as const;

const initialWeaponSpin = {
  kind: "weapon-hit" as const,
  sourceBehaviorId: 300000305,
  behaviorJudgeId: 305,
};
const tornadoTick = {
  kind: "projectile" as const,
  sourceBehaviorId: 300000300,
  behaviorJudgeId: 300,
};
const finishingWeaponHit = {
  kind: "weapon-hit" as const,
  sourceBehaviorId: 300000306,
  behaviorJudgeId: 306,
};
const finishingVortex = {
  kind: "projectile" as const,
  sourceBehaviorId: 300000301,
  behaviorJudgeId: 301,
};

export const blackFlameTornadoSkillDefinitions = weaponClasses.map(
  ([weaponType, motionCategoryId]) => ({
    weaponType,
    motionCategoryId,
    definition: {
      id: "black-flame-tornado",
      swordArtId: 221,
      behaviorVariationId: 0,
      attacks: [
        {
          id: "black-flame-tornado",
          name: "Black Flame Tornado",
          fpCostField: "useMagicPoint_L2" as const,
          components: [initialWeaponSpin, finishingWeaponHit, finishingVortex],
          targetHealthEffects: [blackFlameDamage(1)],
        },
        {
          id: "black-flame-tornado-fully-charged",
          name: "Black Flame Tornado (Fully Charged)",
          fpCostField: "useMagicPoint_L2" as const,
          components: [
            initialWeaponSpin,
            tornadoTick,
            tornadoTick,
            tornadoTick,
            tornadoTick,
            tornadoTick,
            finishingWeaponHit,
            finishingVortex,
          ],
          targetHealthEffects: [blackFlameDamage(5)],
        },
      ],
    } satisfies RegulationWeaponSkillDefinition,
  }),
);

function blackFlameDamage(applicationCount: number) {
  return {
    id: "black-flame-damage-over-time",
    name: "Black Flame damage over time",
    maximumHealthRate: 0.02,
    flatDamage: 20,
    durationSeconds: 2,
    applicationCount,
  };
}
