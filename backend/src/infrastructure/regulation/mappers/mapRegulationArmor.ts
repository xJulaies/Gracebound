import type { ArmorData, ArmorSlot } from "../../../features/armor/domain/armor.types";
import type { ArmorParamRow } from "../schemas/armor.schema";

const FIRST_DLC_PROTECTOR_ID = 5_000_000;
const PLACEHOLDER_NAMES = new Set(["Head", "Body", "Arms", "Legs"]);
const SLOTS: Record<number, ArmorSlot> = { 0: "head", 1: "body", 2: "arms", 3: "legs" };

export function mapBaseGameArmor(rows: ArmorParamRow[]): ArmorData[] {
  const armor = rows
    .filter((row) => row.ID < FIRST_DLC_PROTECTOR_ID && row.Name.trim() !== "" && SLOTS[row.protectorCategory] && !PLACEHOLDER_NAMES.has(row.Name))
    .map((row) => ({
      id: slugify(row.Name),
      sourceProtectorId: row.ID,
      name: row.Name,
      slot: SLOTS[row.protectorCategory]!,
      iconId: row.iconIdM,
      weight: row.weight,
      poise: round(row.toughnessCorrectRate * 1_000),
      damageNegation: {
        physical: negation(row.neutralDamageCutRate),
        strike: negation(row.blowDamageCutRate),
        slash: negation(row.slashDamageCutRate),
        pierce: negation(row.thrustDamageCutRate),
        magic: negation(row.magicDamageCutRate),
        fire: negation(row.fireDamageCutRate),
        lightning: negation(row.thunderDamageCutRate),
        holy: negation(row.darkDamageCutRate),
      },
      resistances: {
        poison: row.resistPoison,
        rot: row.resistDisease,
        bleed: row.resistBlood,
        frost: row.resistFreeze,
        sleep: row.resistSleep,
        madness: row.resistMadness,
        deathBlight: row.resistCurse,
      },
      sourceEffectIds: [row.residentSpEffectId, row.residentSpEffectId2, row.residentSpEffectId3]
        .filter((id) => id > 0),
    }));
  if (new Set(armor.map(({ id }) => id)).size !== armor.length) throw new Error("Armor catalog contains duplicate IDs");
  return armor;
}

function negation(damageMultiplier: number) {
  return round(1 - damageMultiplier);
}

function round(value: number) {
  return Number(value.toFixed(6));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
