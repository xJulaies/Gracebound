import { getArmorPiece } from "../../armor/api/armor.api";
import { getAshOfWar } from "../../ashes-of-war/api/ashesOfWar.api";
import { getCharacterClasses } from "../../character-classes/api/characterClasses.api";
import { getCrystalTears } from "../../crystal-tears/api/crystalTears.api";
import { getGreatRunes } from "../../great-runes/api/greatRunes.api";
import { getSpell } from "../../spells/api/spells.api";
import type { Spell } from "../../spells/types/spell.types";
import { getTalisman } from "../../talismans/api/talismans.api";
import { getWeapon } from "../../weapons/api/weapons.api";
import type { Build, WeaponSelection, WeaponSlotId } from "../types/build.types";
import type {
  ArmorEditorSlotId,
  BuildEditorInitialState,
  EquippedWeapon,
  WeaponEditorSlotId,
} from "../types/editor.types";
import { toBuildEditorDraft } from "./buildDraft";

const weaponSlots: Array<[WeaponSlotId, WeaponEditorSlotId]> = [
  ["rightHand1", "right-hand-1"],
  ["rightHand2", "right-hand-2"],
  ["rightHand3", "right-hand-3"],
  ["leftHand1", "left-hand-1"],
  ["leftHand2", "left-hand-2"],
  ["leftHand3", "left-hand-3"],
];

const armorSlots: Array<[
  keyof Build["equipment"]["armor"],
  ArmorEditorSlotId,
]> = [
  ["headId", "armor-head"],
  ["chestId", "armor-body"],
  ["armsId", "armor-arms"],
  ["legsId", "armor-legs"],
];

export async function hydrateBuildEditor(build: Build): Promise<BuildEditorInitialState> {
  if (!build.characterClassId) {
    throw new Error("This build has no character class and cannot be edited yet.");
  }

  const weaponEntries = weaponSlots.flatMap(([apiSlot, editorSlot]) => {
    const selection = build.equipment.weaponSlots[apiSlot];
    return selection ? [{ editorSlot, selection }] : [];
  });
  const armorEntries = armorSlots.flatMap(([apiSlot, editorSlot]) => {
    const armorId = build.equipment.armor[apiSlot];
    return armorId ? [{ editorSlot, armorId }] : [];
  });

  const [classes, weapons, armor, talismans, greatRunes, tears, spells] = await Promise.all([
    getCharacterClasses(),
    Promise.all(weaponEntries.map(({ selection }) => hydrateWeapon(selection))),
    Promise.all(armorEntries.map(({ armorId }) => getOne(getArmorPiece(armorId), "armor"))),
    Promise.all(build.equipment.talismanIds.map((id) => getOne(getTalisman(id), "talisman"))),
    getGreatRunes(),
    getCrystalTears(),
    Promise.all(build.spellIds.map((id) => getOne(getSpell(id), "spell"))),
  ]);

  const selectedClass = classes.data.find(({ id }) => id === build.characterClassId);
  if (!selectedClass) throw new Error("The saved character class is unavailable.");

  const selectedWeapons = Object.fromEntries(
    weaponEntries.map(({ editorSlot }, index) => [editorSlot, weapons[index]]),
  );
  const activeCatalystSlotId = findCatalystSlot(build, selectedWeapons);
  const weaponBuffTarget = weaponSlots
    .map(([, editorSlot]) => editorSlot)
    .find((slotId) => slotId !== activeCatalystSlotId && selectedWeapons[slotId])
    ?? activeCatalystSlotId;

  return {
    draft: toBuildEditorDraft(build),
    selectedClass,
    selectedWeapons,
    selectedArmor: Object.fromEntries(
      armorEntries.map(({ editorSlot }, index) => [editorSlot, armor[index]]),
    ),
    selectedTalismans: Object.fromEntries(
      talismans.map((talisman, index) => [`talisman-${index + 1}`, talisman]),
    ),
    selectedGreatRune: build.equipment.greatRuneId
      ? findRequired(greatRunes.data, build.equipment.greatRuneId, "Great Rune")
      : null,
    selectedCrystalTears: Object.fromEntries(build.equipment.crystalTearIds.map((id, index) => [
      `crystal-tear-${index + 1}`,
      findRequired(tears.data, id, "Crystal Tear"),
    ])),
    selectedSpells: indexSpellsByMemorySlot(spells),
    activeCatalystSlotId,
    activeWeaponBuff: build.equipment.weaponBuff && activeCatalystSlotId && weaponBuffTarget
      ? {
          spellId: build.equipment.weaponBuff.spellId,
          catalystSlotId: activeCatalystSlotId,
          targetSlotId: weaponBuffTarget,
        }
      : null,
  };
}

async function hydrateWeapon(selection: WeaponSelection): Promise<EquippedWeapon> {
  const [weapon, ashOfWar] = await Promise.all([
    getOne(getWeapon(selection.weaponId), "armament"),
    selection.ashOfWarId
      ? getOne(getAshOfWar(selection.ashOfWarId), "Ash of War")
      : null,
  ]);
  if (!weapon.variants.some(({ id }) => id === selection.variantId)) {
    throw new Error("The saved armament affinity is unavailable.");
  }
  return {
    weapon,
    variantId: selection.variantId,
    upgradeLevel: selection.upgradeLevel,
    ashOfWarId: selection.ashOfWarId,
    ashOfWar: ashOfWar ? {
      id: ashOfWar.id,
      name: ashOfWar.name,
      iconUrl: ashOfWar.iconUrl,
      buffEffect: ashOfWar.buffEffect,
    } : null,
  };
}

function findCatalystSlot(
  build: Build,
  selectedWeapons: Record<string, EquippedWeapon>,
): WeaponEditorSlotId | null {
  const catalyst = build.equipment.catalyst;
  if (!catalyst) return null;
  return weaponSlots.map(([, editorSlot]) => editorSlot).find((slotId) => {
    const weapon = selectedWeapons[slotId];
    return weapon?.weapon.id === catalyst.weaponId
      && weapon.variantId === catalyst.variantId
      && weapon.upgradeLevel === catalyst.upgradeLevel;
  }) ?? null;
}

function indexSpellsByMemorySlot(spells: Spell[]) {
  let slot = 1;
  return Object.fromEntries(spells.map((spell) => {
    const entry = [slot, spell] as const;
    slot += spell.slotsRequired;
    return entry;
  }));
}

async function getOne<T>(request: Promise<{ data: T[] }>, label: string): Promise<T> {
  const item = (await request).data[0];
  if (!item) throw new Error(`The saved ${label} is unavailable.`);
  return item;
}

function findRequired<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`The saved ${label} is unavailable.`);
  return item;
}
