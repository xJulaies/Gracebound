import { describe, expect, it } from "vitest";
import { moonveilSkillDefinition } from "../data/moonveilSkillDefinition";
import { squareOffSkillDefinition } from "../data/squareOffSkillDefinition";
import { flameOfTheRedmanesSkillDefinition } from "../data/flameOfTheRedmanesSkillDefinition";
import { standardAshOfWarSkillDefinitions } from "../data/standardAshOfWarSkillDefinitions";
import { wildStrikesSkillDefinitions } from "../data/wildStrikesSkillDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { AttackParamRow, BehaviorParamRow } from "../schemas/weaponAttackParam.schema";
import type { BulletParamRow, FinalDamageRateRow, SwordArtsParamRow } from "../schemas/weaponSkillParam.schema";
import { mapRegulationWeaponSkill } from "./mapRegulationWeaponSkill";

describe("mapRegulationWeaponSkill", () => {
  it("maps both Transient Moonlight variants as projectile and weapon-hit components", () => {
    const skill = mapRegulationWeaponSkill(moonveil, moonveilSkillDefinition, tables);

    expect(skill).toMatchObject({
      id: "transient-moonlight",
      name: "Transient Moonlight",
      sourceSwordArtId: 1178,
      attacks: [
        {
          fpCost: 15,
          components: [
            { kind: "projectile", sourceBulletId: 2950, addedDamage: damage(0, 140), finalDamageRates: rates(0.65) },
            { kind: "weapon-hit", motionValues: allDamage(50), finalDamageRates: rates(0.8) },
          ],
        },
        {
          fpCost: 20,
          components: [
            { kind: "projectile", sourceBulletId: 2955, addedDamage: damage(0, 155), finalDamageRates: rates(0.65) },
            { kind: "weapon-hit", motionValues: allDamage(55), finalDamageRates: rates(0.8) },
          ],
        },
      ],
    });
  });

  it("maps Square Off as pure weapon-hit attacks", () => {
    const skill = mapRegulationWeaponSkill(moonveil, squareOffSkillDefinition, {
      ...tables,
      behaviors: [
        { ...behavior(300000700, 700, 0, 300000700), variationId: 0 },
        { ...behavior(300000705, 705, 0, 300000705), variationId: 0 },
      ],
      attacks: [
        attack(300000700, 200, 0, 0, 0, 10000),
        attack(300000705, 240, 0, 0, 0, 10000),
      ],
      swordArts: [{ ID: 115, Name: "Square Off", useMagicPoint_L1: -1, useMagicPoint_L2: 0, useMagicPoint_R1: 6, useMagicPoint_R2: 8 }],
    });

    expect(skill.attacks).toMatchObject([
      { id: "square-off-light", fpCost: 6, components: [{ kind: "weapon-hit", motionValues: allDamage(200) }] },
      { id: "square-off-heavy", fpCost: 8, components: [{ kind: "weapon-hit", motionValues: allDamage(240) }] },
    ]);
  });

  it("maps Flame of the Redmanes as a pure projectile attack", () => {
    const skill = mapRegulationWeaponSkill(moonveil, flameOfTheRedmanesSkillDefinition, {
      ...tables,
      behaviors: [{ ...behavior(300000140, 140, 1, 2570), variationId: 0 }],
      attacks: [{ ...attack(30020930, 0, 0, 3, 1, 10000), atkFire: 180 }],
      bullets: [{ ID: 2570, Name: "Flame of the Redmanes", atkId_Bullet: 30020930, intervalCreateBulletId: -1 }],
      swordArts: [{ ID: 505, Name: "Flame of the Redmanes", useMagicPoint_L1: -1, useMagicPoint_L2: 14, useMagicPoint_R1: -1, useMagicPoint_R2: -1 }],
    });

    expect(skill.attacks).toMatchObject([
      {
        id: "flame-of-the-redmanes",
        fpCost: 14,
        components: [
          { kind: "projectile", sourceBulletId: 2570, addedDamage: { fire: 180 } },
        ],
      },
    ]);
  });

  it("maps the verified standard Ashes of War from their 1.17 attack rows", () => {
    const standardTables = {
      ...tables,
      behaviors: [
        { ...behavior(300000270, 270, 0, 301701900), variationId: 0 },
        { ...behavior(300000271, 271, 0, 301701901), variationId: 0 },
        { ...behavior(300000272, 272, 0, 301701902), variationId: 0 },
        { ...behavior(300000273, 273, 0, 301701903), variationId: 0 },
        { ...behavior(300000274, 274, 0, 301701904), variationId: 0 },
        { ...behavior(300000275, 275, 0, 301701905), variationId: 0 },
        { ...behavior(300000000, 0, 0, 300300820), variationId: 0 },
        { ...behavior(300000010, 10, 0, 300000010), variationId: 0 },
        { ...behavior(300000012, 12, 0, 300000050), variationId: 0 },
        { ...behavior(300000290, 290, 0, 300000290), variationId: 0 },
        { ...behavior(300000890, 890, 0, 300000891), variationId: 0 },
        { ...behavior(300000891, 891, 0, 300000892), variationId: 0 },
        { ...behavior(300000150, 150, 0, 301700910), variationId: 0 },
        { ...behavior(300000560, 560, 0, 300000560), variationId: 0 },
        { ...behavior(300000565, 565, 0, 300000565), variationId: 0 },
      ],
      attacks: [
        attack(301701900, 35, 0, 2, 0, 10000),
        attack(301701901, 35, 0, 2, 0, 10000),
        attack(301701902, 35, 0, 2, 0, 10000),
        attack(301701903, 35, 0, 2, 0, 10000),
        attack(301701904, 145, 0, 2, 0, 10000),
        attack(301701905, 145, 0, 2, 0, 10000),
        attack(300300820, 240, 0, 0, 0, 10000),
        attack(300000010, 187, 0, 1, 0, 10000),
        attack(300000050, 212, 0, 1, 0, 10000),
        attack(300000290, 215, 0, 0, 0, 10000),
        attack(300000891, 92, 0, 0, 0, 10000),
        attack(300000892, 112, 0, 0, 0, 10000),
        attack(301700910, 220, 0, 1, 0, 10000),
        attack(300000560, 190, 0, 253, 0, 10000),
        attack(300000565, 245, 0, 253, 0, 10000),
      ],
      swordArts: [
        swordArt(105, "Charge Forth", 16, -1),
        swordArt(100, "Lion's Claw", 20, -1),
        swordArt(101, "Impaling Thrust", 9, -1),
        swordArt(102, "Piercing Fang", 16, -1),
        swordArt(106, "Stamp (Upward Cut)", 5, 8),
        swordArt(107, "Stamp (Sweep)", 5, 8),
        swordArt(116, "Giant Hunt", 16, -1),
        swordArt(114, "Unsheathe", 0, 15, 10),
      ],
    };

    const skills = standardAshOfWarSkillDefinitions.map(({ definition }) =>
      mapRegulationWeaponSkill(moonveil, definition, standardTables),
    );

    expect(skills.map(({ id }) => id)).toEqual([
      "charge-forth",
      "lions-claw",
      "impaling-thrust",
      "piercing-fang",
      "stamp-upward-cut",
      "stamp-sweep",
      "giant-hunt",
      "unsheathe",
    ]);
    expect(skills.flatMap(({ attacks: skillAttacks }) => skillAttacks)).toMatchObject([
      {
        fpCost: 16,
        components: [35, 35, 35, 35, 145].map((value) => ({ motionValues: allDamage(value) })),
      },
      {
        fpCost: 16,
        components: [35, 145].map((value) => ({ motionValues: allDamage(value) })),
      },
      { fpCost: 20, components: [{ motionValues: allDamage(240) }] },
      { fpCost: 9, components: [{ motionValues: allDamage(187) }] },
      { fpCost: 16, components: [{ motionValues: allDamage(212) }] },
      { fpCost: 8, components: [{ motionValues: allDamage(215) }] },
      {
        fpCost: 8,
        components: [
          { motionValues: allDamage(92) },
          { motionValues: allDamage(112) },
        ],
      },
      { fpCost: 16, components: [{ motionValues: allDamage(220) }] },
      { fpCost: 10, components: [{ motionValues: allDamage(190) }] },
      { fpCost: 15, components: [{ motionValues: allDamage(245) }] },
    ]);
  });

  it("maps weapon-class-specific Wild Strikes motion values", () => {
    const standard = wildStrikesSkillDefinitions.find(({ weaponType }) => weaponType === "greatsword")!;
    const curvedSword = wildStrikesSkillDefinitions.find(({ weaponType }) => weaponType === "curved-sword")!;
    const wildStrikesTables = {
      ...tables,
      behaviors: [
        ...wildStrikeBehaviors(0, 301401800),
        ...wildStrikeBehaviors(700, 301400800),
      ],
      attacks: [
        ...wildStrikeAttacks(301401800, [107, 114, 45, 154, 44, 203]),
        ...wildStrikeAttacks(301400800, [126, 119, 52, 183, 52, 243]),
      ],
      swordArts: [swordArt(110, "Wild Strikes", 2, 15, 10)],
    };

    const standardSkill = mapRegulationWeaponSkill(moonveil, standard.definition, wildStrikesTables);
    const curvedSkill = mapRegulationWeaponSkill(moonveil, curvedSword.definition, wildStrikesTables);

    expect(standardSkill.attacks[0]?.components[0]?.motionValues).toEqual(allDamage(107));
    expect(curvedSkill.attacks[0]?.components[0]?.motionValues).toEqual(allDamage(126));
    expect(standardSkill.attacks[2]).toMatchObject({
      fpCost: 10,
      components: [
        { motionValues: allDamage(45) },
        { motionValues: allDamage(154) },
      ],
    });
  });
});

const moonveil = { ID: 9060000, Name: "Moonveil", atkAttribute: 0, atkAttribute2: 2 } as WeaponParamRow;
const behaviors: BehaviorParamRow[] = [
  behavior(300905900, 900, 1, 2950), behavior(300905901, 901, 0, 303400101),
  behavior(300905905, 905, 1, 2955), behavior(300905906, 906, 0, 303400106),
];
const attacks: AttackParamRow[] = [
  attack(303400100, 0, 140, 3, 1, 10003), attack(303400101, 50, 0, 0, 0, 10000),
  attack(303400105, 0, 155, 3, 1, 10003), attack(303400106, 55, 0, 0, 0, 10000),
];
const bullets: BulletParamRow[] = [
  { ID: 2950, Name: "Transient Moonlight", atkId_Bullet: 303400100, intervalCreateBulletId: 2951 },
  { ID: 2955, Name: "Transient Moonlight", atkId_Bullet: 303400105, intervalCreateBulletId: 2956 },
];
const swordArts: SwordArtsParamRow[] = [{ ID: 1178, Name: "Transient Moonlight", useMagicPoint_L1: -1, useMagicPoint_L2: 0, useMagicPoint_R1: 15, useMagicPoint_R2: 20 }];
const finalDamageRates: FinalDamageRateRow[] = [
  { ID: 10000, Name: "", physRate: 0.8, magRate: 0.8, fireRate: 0.8, thunRate: 0.8, darkRate: 0.8 },
  { ID: 10003, Name: "", physRate: 0.65, magRate: 0.65, fireRate: 0.65, thunRate: 0.65, darkRate: 0.65 },
];
const tables = { behaviors, attacks, bullets, swordArts, finalDamageRates };

function behavior(ID: number, behaviorJudgeId: number, refType: number, refId: number): BehaviorParamRow {
  return { ID, Name: "Transient Moonlight", variationId: 905, behaviorJudgeId, refType, refId };
}

function attack(ID: number, correction: number, magic: number, atkAttribute: number, isAddBaseAtk: 0 | 1, finalDamageRateId: number): AttackParamRow {
  return { ID, Name: "Transient Moonlight", atkPhysCorrection: correction, atkMagCorrection: correction, atkFireCorrection: correction, atkThunCorrection: correction, atkDarkCorrection: correction, atkPhys: 0, atkMag: magic, atkFire: 0, atkThun: 0, atkDark: 0, atkAttribute, isAddBaseAtk, finalDamageRateId };
}

function damage(physical: number, magic: number) {
  return { physical, magic, fire: 0, lightning: 0, holy: 0 };
}

function rates(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function allDamage(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function swordArt(
  ID: number,
  Name: string,
  useMagicPoint_L2: number,
  useMagicPoint_R2: number,
  useMagicPoint_R1 = -1,
): SwordArtsParamRow {
  return {
    ID,
    Name,
    useMagicPoint_L1: -1,
    useMagicPoint_L2,
    useMagicPoint_R1,
    useMagicPoint_R2,
  };
}

function wildStrikeBehaviors(variationId: number, firstAttackId: number): BehaviorParamRow[] {
  const attackIds = [firstAttackId, firstAttackId + 10, firstAttackId + 1, firstAttackId + 2, firstAttackId + 3, firstAttackId + 4];
  const judgeIds = [500, 510, 501, 502, 503, 504];
  return judgeIds.map((judgeId, index) => ({
    ...behavior(300000000 + variationId * 1000 + judgeId, judgeId, 0, attackIds[index]!),
    variationId,
  }));
}

function wildStrikeAttacks(firstAttackId: number, motionValues: number[]): AttackParamRow[] {
  const attackIds = [firstAttackId, firstAttackId + 10, firstAttackId + 1, firstAttackId + 2, firstAttackId + 3, firstAttackId + 4];
  return attackIds.map((id, index) => attack(id, motionValues[index]!, 0, 0, 0, 10000));
}
