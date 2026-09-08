import type { Armor } from "../../armor/types/armor.types";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { CrystalTear } from "../../crystal-tears/types/crystalTear.types";
import type { GreatRune } from "../../great-runes/types/greatRune.types";
import type { Spell } from "../../spells/types/spell.types";
import type { Talisman } from "../../talismans/types/talisman.types";
import type { Weapon } from "../../weapons/types/weapon.types";
import type { CharacterStats } from "../../../shared/types/game.types";
import {
  armorSlots,
  crystalTearSlotLabels,
  isWeaponSlotId,
  parseSpellSlot,
  talismanSlotLabels,
} from "../domain/editorSlotDefinitions";
import type { EquippedWeapon } from "../types/editor.types";
import type { useBuildEditorDraft } from "./useBuildEditorDraft";
import type { useBuildEditorUiState } from "./useBuildEditorUiState";

type DraftState = ReturnType<typeof useBuildEditorDraft>;
type UiState = ReturnType<typeof useBuildEditorUiState>;

export function useBuildEditorInteractions(editor: DraftState, ui: UiState) {
  const openSlot = (slotId: string) => {
    if (isWeaponSlotId(slotId)) {
      if (editor.selectedWeapons[slotId]) {
        ui.setEditorFocus({ kind: "weapon", slotId });
        if (editor.selectedWeapons[slotId].weapon.castingTypes.length > 0) {
          editor.setActiveCatalystSlotId(slotId);
        }
        ui.setConfiguredWeaponSlotId(slotId);
        return;
      }
      ui.setConfiguredWeaponSlotId(null);
      ui.setActiveWeaponSlotId(slotId);
      return;
    }
    if (armorSlots[slotId]) {
      ui.setConfiguredWeaponSlotId(null);
      ui.setActiveArmorSlotId(slotId);
      return;
    }
    if (talismanSlotLabels[slotId]) {
      ui.setConfiguredWeaponSlotId(null);
      ui.setActiveTalismanSlotId(slotId);
      return;
    }
    if (slotId === "great-rune") {
      ui.setConfiguredWeaponSlotId(null);
      ui.setIsGreatRunePickerOpen(true);
      return;
    }
    if (crystalTearSlotLabels[slotId]) {
      ui.setConfiguredWeaponSlotId(null);
      ui.setActiveCrystalTearSlotId(slotId);
      return;
    }
    const spellSlot = parseSpellSlot(slotId);
    if (spellSlot === null) return;
    ui.setConfiguredWeaponSlotId(null);
    if (editor.selectedSpells[spellSlot]) {
      ui.setEditorFocus({ kind: "spell", slotIndex: spellSlot });
      return;
    }
    ui.setActiveSpellSlot(spellSlot);
  };

  const selectCharacterClass = (characterClass: CharacterClass) => {
    editor.setSelectedClass(characterClass);
    editor.setStats({ ...characterClass.stats });
  };

  const changeAttribute = (attribute: keyof CharacterStats, value: number) => {
    editor.setStats((current) => current ? { ...current, [attribute]: value } : current);
  };

  const selectWeapon = (weapon: Weapon) => {
    const slotId = ui.activeWeaponSlotId;
    const firstVariant = weapon.variants[0];
    if (!slotId || !firstVariant) return;
    editor.setSelectedWeapons((current) => ({
      ...current,
      [slotId]: {
        weapon,
        variantId: firstVariant.id,
        upgradeLevel: 0,
        ashOfWarId: null,
        ashOfWar: null,
      },
    }));
    ui.setConfiguredWeaponSlotId(slotId);
    ui.setEditorFocus({ kind: "weapon", slotId });
    if (weapon.castingTypes.length > 0) editor.setActiveCatalystSlotId(slotId);
    ui.setActiveWeaponSlotId(null);
  };

  const updateConfiguredWeapon = (configuration: EquippedWeapon) => {
    const slotId = ui.configuredWeaponSlotId;
    if (!slotId) return;
    const previousAshOfWarId = editor.selectedWeapons[slotId]?.ashOfWarId;
    editor.setSelectedWeapons((current) => ({ ...current, [slotId]: configuration }));
    if (configuration.ashOfWarId !== previousAshOfWarId) {
      ui.setActiveSkillBuffSlotId((current) => current === slotId ? null : current);
    }
  };

  const removeConfiguredWeapon = () => {
    const slotId = ui.configuredWeaponSlotId;
    if (!slotId) return;
    editor.setSelectedWeapons((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    if (ui.editorFocus?.kind === "weapon" && ui.editorFocus.slotId === slotId) {
      const nextSlotId = Object.keys(editor.selectedWeapons)
        .filter(isWeaponSlotId)
        .find((candidate) => candidate !== slotId);
      ui.setEditorFocus(nextSlotId ? { kind: "weapon", slotId: nextSlotId } : null);
    }
    if (editor.activeCatalystSlotId === slotId) editor.setActiveCatalystSlotId(null);
    editor.setActiveWeaponBuff((current) => current?.targetSlotId === slotId
      || current?.catalystSlotId === slotId ? null : current);
    ui.setActiveSkillBuffSlotId((current) => current === slotId ? null : current);
    ui.setConfiguredWeaponSlotId(null);
  };

  const selectArmor = (armor: Armor) => replaceActiveRecord(
    ui.activeArmorSlotId,
    armor,
    editor.setSelectedArmor,
    ui.setActiveArmorSlotId,
  );
  const removeArmor = () => removeActiveRecord(
    ui.activeArmorSlotId,
    editor.setSelectedArmor,
    ui.setActiveArmorSlotId,
  );
  const selectTalisman = (talisman: Talisman) => replaceActiveRecord(
    ui.activeTalismanSlotId,
    talisman,
    editor.setSelectedTalismans,
    ui.setActiveTalismanSlotId,
  );
  const removeTalisman = () => removeActiveRecord(
    ui.activeTalismanSlotId,
    editor.setSelectedTalismans,
    ui.setActiveTalismanSlotId,
  );

  const selectGreatRune = (greatRune: GreatRune) => {
    editor.setSelectedGreatRune(greatRune);
    ui.setIsGreatRunePickerOpen(false);
  };
  const removeGreatRune = () => {
    editor.setSelectedGreatRune(null);
    ui.setIsGreatRuneActive(false);
    ui.setIsGreatRunePickerOpen(false);
  };

  const selectCrystalTear = (crystalTear: CrystalTear) => {
    replaceActiveRecord(
      ui.activeCrystalTearSlotId,
      crystalTear,
      editor.setSelectedCrystalTears,
      ui.setActiveCrystalTearSlotId,
    );
    if (!crystalTear.effects) ui.setIsPhysickActive(false);
  };
  const removeCrystalTear = () => {
    removeActiveRecord(
      ui.activeCrystalTearSlotId,
      editor.setSelectedCrystalTears,
      ui.setActiveCrystalTearSlotId,
    );
    if (Object.keys(editor.selectedCrystalTears).length === 1) ui.setIsPhysickActive(false);
  };

  const selectSpell = (spell: Spell) => {
    const slot = ui.activeSpellSlot;
    if (slot === null) return;
    const replacedSpellId = editor.selectedSpells[slot]?.id;
    editor.setSelectedSpells((current) => ({ ...current, [slot]: spell }));
    if (replacedSpellId && replacedSpellId !== spell.id) clearSpellBuff(replacedSpellId, editor);
    ui.setEditorFocus({ kind: "spell", slotIndex: slot });
    ui.setActiveSpellSlot(null);
  };
  const removeSpell = () => {
    const slot = ui.activeSpellSlot;
    if (slot === null) return;
    const removedSpellId = editor.selectedSpells[slot]?.id;
    editor.setSelectedSpells((current) => {
      const next = { ...current };
      delete next[slot];
      return next;
    });
    if (removedSpellId) clearSpellBuff(removedSpellId, editor);
    ui.setActiveSpellSlot(null);
  };

  return {
    changeAttribute,
    openSlot,
    removeArmor,
    removeConfiguredWeapon,
    removeCrystalTear,
    removeGreatRune,
    removeSpell,
    removeTalisman,
    selectArmor,
    selectCharacterClass,
    selectCrystalTear,
    selectGreatRune,
    selectSpell,
    selectTalisman,
    selectWeapon,
    updateConfiguredWeapon,
  };
}

function replaceActiveRecord<T>(
  slotId: string | null,
  value: T,
  setRecords: Dispatch<SetStateAction<Record<string, T>>>,
  close: Dispatch<SetStateAction<string | null>>,
) {
  if (!slotId) return;
  setRecords((current) => ({ ...current, [slotId]: value }));
  close(null);
}

function removeActiveRecord<T>(
  slotId: string | null,
  setRecords: Dispatch<SetStateAction<Record<string, T>>>,
  close: Dispatch<SetStateAction<string | null>>,
) {
  if (!slotId) return;
  setRecords((current) => {
    const next = { ...current };
    delete next[slotId];
    return next;
  });
  close(null);
}

function clearSpellBuff(spellId: string, editor: DraftState) {
  editor.setActiveBuffSpellIds((current) => current.filter((id) => id !== spellId));
  editor.setActiveWeaponBuff((current) => current?.spellId === spellId ? null : current);
}
import type { Dispatch, SetStateAction } from "react";
