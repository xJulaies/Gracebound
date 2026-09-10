import type {
  Attributes,
  WeaponDataSet,
} from "../domain/weapon.types";

const noAttributes: Attributes = {
  strength: 0,
  dexterity: 0,
  intelligence: 0,
  faith: 0,
  arcane: 0,
};

const somberReinforcement = [
  [1, 1],
  [1.145, 1.08],
  [1.29, 1.16],
  [1.435, 1.24],
  [1.58, 1.32],
  [1.725, 1.4],
  [1.87, 1.48],
  [2.015, 1.56],
  [2.16, 1.64],
  [2.305, 1.72],
  [2.45, 1.8],
].map(([attackMultiplier, scalingMultiplier], level) => ({
  level,
  attackMultiplier: {
    physical: attackMultiplier,
    magic: attackMultiplier,
    fire: attackMultiplier,
    lightning: attackMultiplier,
    holy: attackMultiplier,
  },
  scalingMultiplier: {
    strength: scalingMultiplier,
    dexterity: scalingMultiplier,
    intelligence: scalingMultiplier,
    faith: scalingMultiplier,
    arcane: scalingMultiplier,
  },
}));

function createCurveValues(
  stages: Array<{
    attribute: number;
    correction: number;
    adjustmentToNext: number;
  }>,
) {
  return Array.from({ length: 151 }, (_, attribute) => {
    const firstStage = stages[0];
    const lastStage = stages[stages.length - 1];

    if (!firstStage || !lastStage || attribute <= firstStage.attribute) {
      return firstStage?.correction ?? 0;
    }

    if (attribute >= lastStage.attribute) {
      return lastStage.correction;
    }

    const leftIndex = stages.findIndex(
      (stage, index) =>
        attribute >= stage.attribute &&
        attribute < (stages[index + 1]?.attribute ?? Infinity),
    );
    const left = stages[leftIndex];
    const right = stages[leftIndex + 1];

    if (!left || !right) {
      throw new Error("Incomplete fixture scaling curve");
    }

    const position =
      (attribute - left.attribute) / (right.attribute - left.attribute);
    const growth =
      left.adjustmentToNext > 0
        ? position ** left.adjustmentToNext
        : 1 - (1 - position) ** Math.abs(left.adjustmentToNext);

    return left.correction + (right.correction - left.correction) * growth;
  });
}

/**
 * Small, read-only Regulation reference dataset for weapon-domain tests.
 */
export const weaponFixtures: WeaponDataSet = {
  weapons: {
    moonveil: {
      id: "moonveil",
      sourceId: 9060000,
      name: "Moonveil",
      gameVersion: "1.17.0",
      maxUpgradeLevel: 10,
      reinforcementId: "regulation-2200",
      requirements: {
        ...noAttributes,
        strength: 12,
        dexterity: 18,
        intelligence: 23,
      },
      baseAttack: {
        physical: 73,
        magic: 87,
        fire: 0,
        lightning: 0,
        holy: 0,
      },
      baseScaling: {
        ...noAttributes,
        strength: 0.12,
        dexterity: 0.5,
        intelligence: 0.6,
      },
      corrections: {
        physical: [
          { attribute: "strength", curveId: "regulation-0", influenceRatio: 1 },
          { attribute: "dexterity", curveId: "regulation-0", influenceRatio: 1 },
        ],
        magic: [
          {
            attribute: "intelligence",
            curveId: "regulation-4",
            influenceRatio: 1,
          },
        ],
        fire: [
          { attribute: "faith", curveId: "regulation-0", influenceRatio: 1 },
        ],
        lightning: [
          { attribute: "dexterity", curveId: "regulation-0", influenceRatio: 1 },
        ],
        holy: [
          { attribute: "faith", curveId: "regulation-0", influenceRatio: 1 },
        ],
      },
    },
    "grafted-blade-greatsword": {
      id: "grafted-blade-greatsword",
      sourceId: 4100000,
      name: "Grafted Blade Greatsword",
      gameVersion: "1.17.0",
      maxUpgradeLevel: 10,
      reinforcementId: "regulation-2200",
      requirements: {
        ...noAttributes,
        strength: 40,
        dexterity: 14,
      },
      baseAttack: {
        physical: 162,
        magic: 0,
        fire: 0,
        lightning: 0,
        holy: 0,
      },
      baseScaling: {
        ...noAttributes,
        strength: 0.63,
        dexterity: 0.19,
      },
      corrections: {
        physical: [
          { attribute: "strength", curveId: "regulation-0", influenceRatio: 1 },
          { attribute: "dexterity", curveId: "regulation-0", influenceRatio: 1 },
        ],
        magic: [
          {
            attribute: "intelligence",
            curveId: "regulation-0",
            influenceRatio: 1,
          },
        ],
        fire: [
          { attribute: "faith", curveId: "regulation-0", influenceRatio: 1 },
        ],
        lightning: [
          { attribute: "dexterity", curveId: "regulation-0", influenceRatio: 1 },
        ],
        holy: [
          { attribute: "faith", curveId: "regulation-0", influenceRatio: 1 },
        ],
      },
    },
  },
  reinforcements: {
    "regulation-2200": somberReinforcement,
  },
  scalingCurves: {
    "regulation-0": {
      id: "regulation-0",
      values: createCurveValues([
        { attribute: 1, correction: 0, adjustmentToNext: 1.2 },
        { attribute: 18, correction: 0.25, adjustmentToNext: -1.2 },
        { attribute: 60, correction: 0.75, adjustmentToNext: 1 },
        { attribute: 80, correction: 0.9, adjustmentToNext: 1 },
        { attribute: 150, correction: 1.1, adjustmentToNext: 1 },
      ]),
    },
    "regulation-4": {
      id: "regulation-4",
      values: createCurveValues([
        { attribute: 1, correction: 0, adjustmentToNext: 1 },
        { attribute: 20, correction: 0.4, adjustmentToNext: 1 },
        { attribute: 50, correction: 0.8, adjustmentToNext: 1 },
        { attribute: 80, correction: 0.95, adjustmentToNext: 1 },
        { attribute: 99, correction: 1, adjustmentToNext: 1 },
      ]),
    },
  },
};
