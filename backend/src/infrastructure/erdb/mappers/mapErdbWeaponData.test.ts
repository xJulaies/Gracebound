import { describe, expect, it } from "vitest";
import { weaponFixtures } from "../../../features/weapons/data/weapon.fixtures";
import { erdbWeaponImportSchema } from "../schemas/erdb.schema";
import { mapErdbWeaponData } from "./mapErdbWeaponData";

const attributes = [
  "strength",
  "dexterity",
  "intelligence",
  "faith",
  "arcane",
] as const;

const damageTypes = [
  "physical",
  "magic",
  "fire",
  "lightning",
  "holy",
] as const;

function createAttributeRecord<T>(value: T) {
  return Object.fromEntries(attributes.map((attribute) => [attribute, value]));
}

function createDamageTypeRecord<T>(factory: () => T) {
  return Object.fromEntries(damageTypes.map((type) => [type, factory()]));
}

function createImportInput() {
  const reinforcement = weaponFixtures.reinforcements["erdb-2200"];

  if (!reinforcement) {
    throw new Error("Missing test reinforcement");
  }

  const correction = createDamageTypeRecord(() =>
    createAttributeRecord(false),
  );
  correction.physical.strength = true;
  correction.physical.dexterity = true;
  correction.magic.intelligence = true;
  correction.fire.faith = true;
  correction.lightning.dexterity = true;
  correction.holy.faith = true;

  return {
    gameVersion: "1.10.0",
    armaments: {
      Moonveil: {
        id: 9060000,
        name: "Moonveil",
        description: "Removed by the import schema",
        requirements: {
          strength: 12,
          dexterity: 18,
          intelligence: 23,
        },
        affinity: {
          Standard: {
            reinforcement_id: 2200,
            correction_attack_id: 10000,
            correction_calc_id: {
              physical: 0,
              magic: 4,
              fire: 0,
              lightning: 0,
              holy: 0,
            },
            damage: { physical: 73, magic: 87 },
            scaling: {
              strength: 0.12,
              dexterity: 0.5,
              intelligence: 0.6,
            },
          },
        },
      },
      "Grafted Blade Greatsword": {
        id: 4100000,
        name: "Grafted Blade Greatsword",
        requirements: { strength: 40, dexterity: 14 },
        affinity: {
          Standard: {
            reinforcement_id: 2200,
            correction_attack_id: 10000,
            correction_calc_id: {
              physical: 0,
              magic: 0,
              fire: 0,
              lightning: 0,
              holy: 0,
            },
            damage: { physical: 162 },
            scaling: { strength: 0.63, dexterity: 0.19 },
          },
        },
      },
    },
    reinforcements: {
      "2200": reinforcement.map((level) => ({
        level: level.level,
        damage: level.attackMultiplier,
        scaling: level.scalingMultiplier,
      })),
    },
    correctionAttacks: {
      "10000": {
        correction,
        override: createDamageTypeRecord(() => ({})),
        ratio: createDamageTypeRecord(() => createAttributeRecord(1)),
      },
    },
    correctionGraphs: {
      "0": weaponFixtures.scalingCurves["erdb-0"]?.values,
      "4": weaponFixtures.scalingCurves["erdb-4"]?.values,
    },
  };
}

describe("ERDB weapon import mapping", () => {
  it("maps validated ERDB data to the existing weapon domain model", () => {
    const parsed = erdbWeaponImportSchema.parse(createImportInput());
    const mapped = mapErdbWeaponData(parsed);

    expect(mapped).toEqual(weaponFixtures);
    expect(parsed.armaments.Moonveil).not.toHaveProperty("description");
  });

  it("rejects incomplete external armament data", () => {
    const input = createImportInput();
    const moonveil = input.armaments.Moonveil;

    if (!moonveil) {
      throw new Error("Missing Moonveil test data");
    }

    const invalidAffinity = { ...moonveil.affinity.Standard } as Partial<
      typeof moonveil.affinity.Standard
    >;
    delete invalidAffinity.reinforcement_id;
    moonveil.affinity.Standard = invalidAffinity as typeof moonveil.affinity.Standard;

    expect(() => erdbWeaponImportSchema.parse(input)).toThrow();
  });

  it("rejects incomplete reinforcement multipliers", () => {
    const input = createImportInput();
    const firstLevel = input.reinforcements["2200"]?.[0];

    if (!firstLevel) {
      throw new Error("Missing reinforcement test data");
    }

    const incompleteDamage = { ...firstLevel.damage } as Partial<
      typeof firstLevel.damage
    >;
    delete incompleteDamage.magic;
    firstLevel.damage = incompleteDamage as typeof firstLevel.damage;

    expect(() => erdbWeaponImportSchema.parse(input)).toThrow();
  });

  it("rejects references to missing ERDB calculation tables", () => {
    const parsed = erdbWeaponImportSchema.parse(createImportInput());
    delete parsed.reinforcements["2200"];

    expect(() => mapErdbWeaponData(parsed)).toThrow(
      "Unknown reinforcement 2200 for Moonveil",
    );
  });
});
