import { useState } from "react";
import { CharacterClassCarousel } from "../../../character-classes/components/organisms/CharacterClassCarousel";
import type { CharacterClass } from "../../../character-classes/types/characterClass.types";
import type { Weapon } from "../../../weapons/types/weapon.types";
import type {
  EquippedWeapon,
  WeaponEditorFocus,
  WeaponEditorSlotId,
} from "../../types/editor.types";
import type { Armor, ArmorSlot } from "../../../armor/types/armor.types";
import { ArmorPicker } from "./ArmorPicker";
import { EquipmentLoadout } from "./EquipmentLoadout";
import { WeaponInspector } from "./WeaponInspector";
import { WeaponPicker } from "./WeaponPicker";
import type { Talisman } from "../../../talismans/types/talisman.types";
import { TalismanPicker } from "./TalismanPicker";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { useBuildStatsPreviewQuery } from "../../hooks/useBuildStatsPreviewQuery";
import { CharacterAttributePanel } from "./CharacterAttributePanel";
import { CalculatedStatsPanel } from "./CalculatedStatsPanel";
import {
  BuildEditorTabs,
  type BuildEditorTab,
} from "../molecules/BuildEditorTabs";

const weaponSlotLabels: Record<WeaponEditorSlotId, string> = {
  "left-hand-1": "Left hand 1",
  "left-hand-2": "Left hand 2",
  "left-hand-3": "Left hand 3",
  "right-hand-1": "Right hand 1",
  "right-hand-2": "Right hand 2",
  "right-hand-3": "Right hand 3",
};

const armorSlots: Record<string, { label: string; slot: ArmorSlot }> = {
  "armor-head": { label: "Head", slot: "head" },
  "armor-body": { label: "Body", slot: "body" },
  "armor-arms": { label: "Arms", slot: "arms" },
  "armor-legs": { label: "Legs", slot: "legs" },
};

const talismanSlotLabels: Record<string, string> = {
  "talisman-1": "Talisman 1",
  "talisman-2": "Talisman 2",
  "talisman-3": "Talisman 3",
  "talisman-4": "Talisman 4",
};

export function BuildEditorWorkspace() {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [stats, setStats] = useState<CharacterStats | null>(null);
  const [activeWeaponSlotId, setActiveWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [activeArmorSlotId, setActiveArmorSlotId] = useState<string | null>(null);
  const [activeTalismanSlotId, setActiveTalismanSlotId] = useState<string | null>(null);
  const [configuredWeaponSlotId, setConfiguredWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, EquippedWeapon>>({});
  const [selectedArmor, setSelectedArmor] = useState<Record<string, Armor>>({});
  const [selectedTalismans, setSelectedTalismans] = useState<Record<string, Talisman>>({});
  const [editorFocus, setEditorFocus] = useState<WeaponEditorFocus | null>(null);
  const [activeTab, setActiveTab] = useState<BuildEditorTab>("equipment");
  const statsQuery = useBuildStatsPreviewQuery(
    selectedClass && stats
      ? { characterClassId: selectedClass.id, stats }
      : null,
  );
  const statsPreview = statsQuery.data?.data[0] ?? null;
  const characterLevel = selectedClass && stats
    ? selectedClass.level + Object.keys(stats).reduce(
        (total, attribute) => total + stats[attribute as keyof CharacterStats]
          - selectedClass.stats[attribute as keyof CharacterStats],
        0,
      )
    : 0;

  const openSlot = (slotId: string) => {
    if (isWeaponSlotId(slotId)) {
      if (selectedWeapons[slotId]) {
        setEditorFocus({ kind: "weapon", slotId });
      }
      setConfiguredWeaponSlotId(selectedWeapons[slotId] ? slotId : null);
      setActiveWeaponSlotId(slotId);
      return;
    }
    if (armorSlots[slotId]) {
      setConfiguredWeaponSlotId(null);
      setActiveArmorSlotId(slotId);
      return;
    }
    if (talismanSlotLabels[slotId]) {
      setConfiguredWeaponSlotId(null);
      setActiveTalismanSlotId(slotId);
    }
  };

  const selectWeapon = (weapon: Weapon) => {
    if (!activeWeaponSlotId) return;
    const firstVariant = weapon.variants[0];
    if (!firstVariant) return;
    setSelectedWeapons((current) => ({
      ...current,
      [activeWeaponSlotId]: {
        weapon,
        variantId: firstVariant.id,
        upgradeLevel: 0,
        ashOfWarId: null,
        ashOfWar: null,
      },
    }));
    setConfiguredWeaponSlotId(activeWeaponSlotId);
    setEditorFocus({ kind: "weapon", slotId: activeWeaponSlotId });
    setActiveWeaponSlotId(null);
  };

  const configuredWeapon = configuredWeaponSlotId
    ? selectedWeapons[configuredWeaponSlotId]
    : undefined;
  const focusedWeapon = editorFocus
    ? selectedWeapons[editorFocus.slotId] ?? null
    : null;

  const selectCharacterClass = (characterClass: CharacterClass) => {
    setSelectedClass(characterClass);
    setStats({ ...characterClass.stats });
  };

  const changeAttribute = (attribute: keyof CharacterStats, value: number) => {
    setStats((current) => current ? { ...current, [attribute]: value } : current);
  };

  return (
    <section
      aria-label="Build editor"
      className={`build-editor-workspace${selectedClass ? " build-editor-workspace--active" : ""}`}
      id="character-class-builder"
    >
      {selectedClass && stats ? (
        <>
          <BuildEditorTabs activeTab={activeTab} onChange={setActiveTab} />
          <div className="build-editor-grid">
            <div
              aria-labelledby="build-editor-character-tab"
              className="build-editor-region"
              data-active={activeTab === "character"}
              id="build-editor-character-panel"
              role="tabpanel"
            >
              <CharacterAttributePanel
                characterClass={selectedClass}
                characterLevel={characterLevel}
                isUpdatingCosts={statsQuery.isFetching}
                nextLevelRuneCost={statsPreview?.nextLevelRuneCost ?? null}
                onChangeAttribute={changeAttribute}
                onChangeCharacter={() => setSelectedClass(null)}
                stats={stats}
                totalRuneCost={statsPreview?.totalRuneCost ?? null}
              />
            </div>
            <div
              aria-labelledby="build-editor-equipment-tab"
              className="build-editor-region min-w-0"
              data-active={activeTab === "equipment"}
              id="build-editor-equipment-panel"
              role="tabpanel"
            >
            <EquipmentLoadout
              activeSlotId={activeWeaponSlotId ?? activeArmorSlotId ?? activeTalismanSlotId ?? configuredWeaponSlotId ?? editorFocus?.slotId}
              onSelectSlot={openSlot}
              selectedArmor={selectedArmor}
              selectedTalismans={selectedTalismans}
              selectedWeapons={selectedWeapons}
            />
          {configuredWeaponSlotId && configuredWeapon && (
            <WeaponInspector
              configuration={configuredWeapon}
              onChange={(configuration) => setSelectedWeapons((current) => ({
                ...current,
                [configuredWeaponSlotId]: configuration,
              }))}
              onChangeWeapon={() => {
                if (isWeaponSlotId(configuredWeaponSlotId)) {
                  setActiveWeaponSlotId(configuredWeaponSlotId);
                }
              }}
              onClose={() => setConfiguredWeaponSlotId(null)}
              onRemove={() => {
                setSelectedWeapons((current) => {
                  const next = { ...current };
                  delete next[configuredWeaponSlotId];
                  return next;
                });
                if (editorFocus?.slotId === configuredWeaponSlotId) {
                  const nextSlotId = Object.keys(selectedWeapons)
                    .filter(isWeaponSlotId)
                    .find((slotId) => slotId !== configuredWeaponSlotId);
                  setEditorFocus(nextSlotId ? { kind: "weapon", slotId: nextSlotId } : null);
                }
                setConfiguredWeaponSlotId(null);
              }}
              slotLabel={weaponSlotLabels[configuredWeaponSlotId] ?? "Armament slot"}
            />
          )}
          {activeWeaponSlotId && (
            <WeaponPicker
              onClose={() => setActiveWeaponSlotId(null)}
              onSelect={selectWeapon}
              slotLabel={weaponSlotLabels[activeWeaponSlotId] ?? "Armament slot"}
            />
          )}
          {activeArmorSlotId && armorSlots[activeArmorSlotId] && (
            <ArmorPicker
              onClose={() => setActiveArmorSlotId(null)}
              onRemove={selectedArmor[activeArmorSlotId]
                ? () => {
                    setSelectedArmor((current) => {
                      const next = { ...current };
                      delete next[activeArmorSlotId];
                      return next;
                    });
                    setActiveArmorSlotId(null);
                  }
                : undefined}
              onSelect={(armor) => {
                setSelectedArmor((current) => ({
                  ...current,
                  [activeArmorSlotId]: armor,
                }));
                setActiveArmorSlotId(null);
              }}
              slot={armorSlots[activeArmorSlotId].slot}
              slotLabel={armorSlots[activeArmorSlotId].label}
            />
          )}
          {activeTalismanSlotId && (
            <TalismanPicker
              onClose={() => setActiveTalismanSlotId(null)}
              onRemove={selectedTalismans[activeTalismanSlotId]
                ? () => {
                    setSelectedTalismans((current) => {
                      const next = { ...current };
                      delete next[activeTalismanSlotId];
                      return next;
                    });
                    setActiveTalismanSlotId(null);
                  }
                : undefined}
              onSelect={(talisman) => {
                setSelectedTalismans((current) => ({
                  ...current,
                  [activeTalismanSlotId]: talisman,
                }));
                setActiveTalismanSlotId(null);
              }}
              slotLabel={talismanSlotLabels[activeTalismanSlotId] ?? "Talisman slot"}
            />
          )}
            </div>
            <div
              aria-labelledby="build-editor-status-tab"
              className="build-editor-region"
              data-active={activeTab === "status"}
              id="build-editor-status-panel"
              role="tabpanel"
            >
              <CalculatedStatsPanel
                focus={editorFocus}
                focusedWeapon={focusedWeapon}
                isError={statsQuery.isError}
                isPending={statsQuery.isPending || statsQuery.isFetching}
                preview={statsPreview}
              />
            </div>
          </div>
        </>
      ) : (
        <CharacterClassCarousel onSelect={selectCharacterClass} />
      )}
    </section>
  );
}

function isWeaponSlotId(slotId: string): slotId is WeaponEditorSlotId {
  return slotId in weaponSlotLabels;
}
