import { describe, expect, it, vi } from "vitest";
import type { ErdbWeaponImport } from "../schemas/erdb.schema";
import {
  loadErdbWeaponData,
  type ErdbFetch,
} from "./loadErdbWeaponData";

const attributes = {
  strength: 0,
  dexterity: 0,
  intelligence: 0,
  faith: 0,
  arcane: 0,
};

const damage = {
  physical: 1,
  magic: 1,
  fire: 1,
  lightning: 1,
  holy: 1,
};

function createRawErdbData(): ErdbWeaponImport {
  const attributeFlags = {
    strength: false,
    dexterity: false,
    intelligence: false,
    faith: false,
    arcane: false,
  };
  const damageTypeAttributes = {
    physical: attributeFlags,
    magic: attributeFlags,
    fire: attributeFlags,
    lightning: attributeFlags,
    holy: attributeFlags,
  };
  const damageTypeRatios = {
    physical: attributes,
    magic: attributes,
    fire: attributes,
    lightning: attributes,
    holy: attributes,
  };

  return {
    gameVersion: "1.10.0",
    armaments: {
      Moonveil: {
        id: 9060000,
        name: "Moonveil",
        requirements: { strength: 12, dexterity: 18, intelligence: 23 },
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
            damage: { physical: 73, magic: 87 },
            scaling: { dexterity: 0.5, intelligence: 0.6 },
          },
        },
      },
    },
    reinforcements: {
      "2200": [{ level: 0, damage, scaling: attributes }],
    },
    correctionAttacks: {
      "10000": {
        correction: damageTypeAttributes,
        override: {
          physical: {},
          magic: {},
          fire: {},
          lightning: {},
          holy: {},
        },
        ratio: damageTypeRatios,
      },
    },
    correctionGraphs: {
      "0": Array.from({ length: 151 }, () => 0),
    },
  };
}

describe("loadErdbWeaponData", () => {
  it("loads and validates all raw tables for a game version", async () => {
    const rawData = createRawErdbData();
    const tables: Record<string, unknown> = {
      armaments: rawData.armaments,
      reinforcements: rawData.reinforcements,
      "correction-attack": rawData.correctionAttacks,
      "correction-graph": rawData.correctionGraphs,
    };
    const fetchErdb = vi.fn<ErdbFetch>(async (url) => {
      const urlSegments = url.split("/");
      const table = urlSegments[urlSegments.length - 2] ?? "";

      return {
        ok: true,
        status: 200,
        json: async () => tables[table],
      };
    });

    const result = await loadErdbWeaponData(
      "http://127.0.0.1:8107/v1/",
      "1.10.0",
      fetchErdb,
    );

    expect(result).toEqual(rawData);
    expect(fetchErdb).toHaveBeenCalledTimes(4);
    expect(fetchErdb).toHaveBeenCalledWith(
      "http://127.0.0.1:8107/v1/1.10.0/armaments/",
    );
  });

  it("rejects malformed ERDB responses", async () => {
    const fetchErdb: ErdbFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await expect(
      loadErdbWeaponData(
        "http://127.0.0.1:8107/v1",
        "1.10.0",
        fetchErdb,
      ),
    ).rejects.toThrow();
  });

  it("reports the failed ERDB table without exposing its response", async () => {
    const fetchErdb: ErdbFetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({ secret: "must not be logged" }),
    });

    await expect(
      loadErdbWeaponData(
        "http://127.0.0.1:8107/v1",
        "1.10.0",
        fetchErdb,
      ),
    ).rejects.toThrow("ERDB armaments request failed with 503");
  });
});
