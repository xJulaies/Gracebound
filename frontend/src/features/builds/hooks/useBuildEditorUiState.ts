import { useState } from "react";
import type { BuildEditorFocus, WeaponEditorSlotId } from "../types/editor.types";
import type { BuildEditorTab } from "../components/molecules/BuildEditorTabs";

export function useBuildEditorUiState() {
  const [activeWeaponSlotId, setActiveWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [activeArmorSlotId, setActiveArmorSlotId] = useState<string | null>(null);
  const [activeTalismanSlotId, setActiveTalismanSlotId] = useState<string | null>(null);
  const [isGreatRunePickerOpen, setIsGreatRunePickerOpen] = useState(false);
  const [activeCrystalTearSlotId, setActiveCrystalTearSlotId] = useState<string | null>(null);
  const [activeSpellSlot, setActiveSpellSlot] = useState<number | null>(null);
  const [configuredWeaponSlotId, setConfiguredWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [editorFocus, setEditorFocus] = useState<BuildEditorFocus | null>(null);
  const [isGreatRuneActive, setIsGreatRuneActive] = useState(false);
  const [isPhysickActive, setIsPhysickActive] = useState(false);
  const [activeSkillBuffSlotId, setActiveSkillBuffSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [activeTab, setActiveTab] = useState<BuildEditorTab>("equipment");

  return {
    activeWeaponSlotId, setActiveWeaponSlotId,
    activeArmorSlotId, setActiveArmorSlotId,
    activeTalismanSlotId, setActiveTalismanSlotId,
    isGreatRunePickerOpen, setIsGreatRunePickerOpen,
    activeCrystalTearSlotId, setActiveCrystalTearSlotId,
    activeSpellSlot, setActiveSpellSlot,
    configuredWeaponSlotId, setConfiguredWeaponSlotId,
    editorFocus, setEditorFocus,
    isGreatRuneActive, setIsGreatRuneActive,
    isPhysickActive, setIsPhysickActive,
    activeSkillBuffSlotId, setActiveSkillBuffSlotId,
    activeTab, setActiveTab,
  };
}
