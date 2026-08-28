import { WEAPON_AFFINITIES } from "../../../features/weapons/domain/weaponCatalog.types";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";

const WEAPON_NAMES_BY_VERSION: Record<string, Record<number, string>> = {
  "1.17.0": {
    3560000: "Leontiel's Greatsword",
    8530000: "Hefty Scimitar",
    13510000: "Golden Order Flail",
    31540000: "Silver Grooved Shield",
    62520000: "Ritual Thrusting Shield",
    64530000: "Reverse-Bladed Sword",
    66530000: "Reed Great Katana",
    67530000: "Idus Sword",
  },
};

const AFFINITY_PREFIXES = [
  "",
  "Heavy",
  "Keen",
  "Quality",
  "Fire",
  "Flame Art",
  "Lightning",
  "Sacred",
  "Magic",
  "Cold",
  "Poison",
  "Blood",
  "Occult",
] as const satisfies readonly string[];

export function addRegulationWeaponNames(
  gameVersion: string,
  rows: WeaponParamRow[],
): WeaponParamRow[] {
  const names = WEAPON_NAMES_BY_VERSION[gameVersion];
  if (!names) return rows;

  return rows.map((row) => {
    if (row.Name.trim().length > 0) return row;

    const canonicalName = names[row.originEquipWep];
    if (!canonicalName) return row;

    const affinityIndex = (row.ID - row.originEquipWep) / 100;
    if (!Number.isInteger(affinityIndex) || !WEAPON_AFFINITIES[affinityIndex]) {
      return row;
    }

    const prefix = AFFINITY_PREFIXES[affinityIndex];
    return {
      ...row,
      Name: prefix ? `${prefix} ${canonicalName}` : canonicalName,
    };
  });
}
