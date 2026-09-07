import { useState } from "react";
import { CharacterClassCarousel } from "../../../character-classes/components/organisms/CharacterClassCarousel";
import type { CharacterClass } from "../../../character-classes/types/characterClass.types";
import type { Weapon } from "../../../weapons/types/weapon.types";
import type {
  BuildEditorFocus,
  ActiveWeaponBuff,
  EquippedWeapon,
  WeaponEditorSlotId,
} from "../../types/editor.types";
import type { Armor, ArmorSlot } from "../../../armor/types/armor.types";
import { ArmorPicker } from "./ArmorPicker";
import { EquipmentLoadout } from "./EquipmentLoadout";
import { WeaponInspector } from "./WeaponInspector";
import { WeaponPicker } from "./WeaponPicker";
import type { Talisman } from "../../../talismans/types/talisman.types";
import { TalismanPicker } from "./TalismanPicker";
import type { GreatRune } from "../../../great-runes/types/greatRune.types";
import type { CrystalTear } from "../../../crystal-tears/types/crystalTear.types";
import { GreatRunePicker } from "./GreatRunePicker";
import { CrystalTearPicker } from "./CrystalTearPicker";
import type { Spell } from "../../../spells/types/spell.types";
import { SpellPicker } from "./SpellPicker";
import { useWeaponOffensePreviewQuery } from "../../hooks/useWeaponOffensePreviewQuery";
import { useSpellOffensePreviewQuery } from "../../hooks/useSpellOffensePreviewQuery";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { useBuildStatsPreviewQuery } from "../../hooks/useBuildStatsPreviewQuery";
import { CharacterAttributePanel } from "./CharacterAttributePanel";
import { CalculatedStatsPanel } from "./CalculatedStatsPanel";
import { BuffSimulationBar } from "./BuffSimulationBar";
import { toggleGeneralBuff } from "../../domain/toggleGeneralBuff";
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

const crystalTearSlotLabels: Record<string, string> = {
  "crystal-tear-1": "Crystal Tear 1",
  "crystal-tear-2": "Crystal Tear 2",
};

export function BuildEditorWorkspace() {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [stats, setStats] = useState<CharacterStats | null>(null);
  const [activeWeaponSlotId, setActiveWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [activeArmorSlotId, setActiveArmorSlotId] = useState<string | null>(null);
  const [activeTalismanSlotId, setActiveTalismanSlotId] = useState<string | null>(null);
  const [isGreatRunePickerOpen, setIsGreatRunePickerOpen] = useState(false);
  const [activeCrystalTearSlotId, setActiveCrystalTearSlotId] = useState<string | null>(null);
  const [activeSpellSlot, setActiveSpellSlot] = useState<number | null>(null);
  const [configuredWeaponSlotId, setConfiguredWeaponSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, EquippedWeapon>>({});
  const [selectedArmor, setSelectedArmor] = useState<Record<string, Armor>>({});
  const [selectedTalismans, setSelectedTalismans] = useState<Record<string, Talisman>>({});
  const [selectedGreatRune, setSelectedGreatRune] = useState<GreatRune | null>(null);
  const [selectedCrystalTears, setSelectedCrystalTears] = useState<Record<string, CrystalTear>>({});
  const [selectedSpells, setSelectedSpells] = useState<Record<number, Spell>>({});
  const [memoryStoneCount, setMemoryStoneCount] = useState(0);
  const [editorFocus, setEditorFocus] = useState<BuildEditorFocus | null>(null);
  const [activeCatalystSlotId, setActiveCatalystSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [isGreatRuneActive, setIsGreatRuneActive] = useState(false);
  const [isPhysickActive, setIsPhysickActive] = useState(false);
  const [activeBuffSpellIds, setActiveBuffSpellIds] = useState<string[]>([]);
  const [activeWeaponBuff, setActiveWeaponBuff] = useState<ActiveWeaponBuff | null>(null);
  const [activeSkillBuffSlotId, setActiveSkillBuffSlotId] = useState<WeaponEditorSlotId | null>(null);
  const [activeTab, setActiveTab] = useState<BuildEditorTab>("equipment");
  const statsQuery = useBuildStatsPreviewQuery(
    selectedClass && stats
      ? {
          characterClassId: selectedClass.id,
          stats,
          armorIds: Object.values(selectedArmor).map(({ id }) => id),
          talismanIds: Object.values(selectedTalismans).map(({ id }) => id),
          weaponIds: Object.values(selectedWeapons).map(({ weapon }) => weapon.id),
          greatRuneId: isGreatRuneActive ? selectedGreatRune?.id ?? null : null,
          crystalTearIds: isPhysickActive
            ? Object.values(selectedCrystalTears).map(({ id }) => id)
            : [],
          memoryStoneCount,
          spellIds: Object.values(selectedSpells).map(({ id }) => id),
          catalyst: toCatalystSelection(activeCatalystSlotId
            ? selectedWeapons[activeCatalystSlotId]
            : undefined),
        }
      : null,
  );
  const statsPreview = statsQuery.data?.data[0] ?? null;
  const availableSpellSlots = statsPreview?.memorySlots.availableSlots ?? 2 + memoryStoneCount;
  const selectedSpellEntries = Object.entries(selectedSpells);
  const requiredSpellCapacity = Math.max(
    selectedSpellEntries.reduce((total, [, spell]) => total + spell.slotsRequired, 0),
    ...selectedSpellEntries.map(([slot]) => Number(slot)),
    0,
  );
  const nonStoneSlotBonus = Math.max(0, availableSpellSlots - 2 - memoryStoneCount);
  const minimumMemoryStoneCount = Math.max(0, requiredSpellCapacity - 2 - nonStoneSlotBonus);
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
        if (selectedWeapons[slotId].weapon.castingTypes.length > 0) {
          setActiveCatalystSlotId(slotId);
        }
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
      return;
    }
    if (slotId === "great-rune") {
      setConfiguredWeaponSlotId(null);
      setIsGreatRunePickerOpen(true);
      return;
    }
    if (crystalTearSlotLabels[slotId]) {
      setConfiguredWeaponSlotId(null);
      setActiveCrystalTearSlotId(slotId);
      return;
    }
    const spellSlot = parseSpellSlot(slotId);
    if (spellSlot !== null) {
      setConfiguredWeaponSlotId(null);
      if (selectedSpells[spellSlot]) {
        setEditorFocus({ kind: "spell", slotIndex: spellSlot });
      }
      setActiveSpellSlot(spellSlot);
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
    if (weapon.castingTypes.length > 0) {
      setActiveCatalystSlotId(activeWeaponSlotId);
    }
    setActiveWeaponSlotId(null);
  };

  const configuredWeapon = configuredWeaponSlotId
    ? selectedWeapons[configuredWeaponSlotId]
    : undefined;
  const focusedWeapon = editorFocus?.kind === "weapon"
    ? selectedWeapons[editorFocus.slotId] ?? null
    : null;
  const focusedSpell = editorFocus?.kind === "spell"
    ? selectedSpells[editorFocus.slotIndex] ?? null
    : null;
  const activeCatalyst = activeCatalystSlotId
    ? selectedWeapons[activeCatalystSlotId] ?? null
    : null;
  const focusedWeaponSlotId = editorFocus?.kind === "weapon" ? editorFocus.slotId : null;
  const weaponBuffSelection = toWeaponBuffSelection(
    activeWeaponBuff,
    selectedSpells,
    selectedWeapons,
  );
  const offenseQuery = useWeaponOffensePreviewQuery(
    focusedWeapon,
    stats,
    {
      armorIds: Object.values(selectedArmor).map(({ id }) => id),
      talismanIds: Object.values(selectedTalismans).map(({ id }) => id),
      greatRuneId: isGreatRuneActive ? selectedGreatRune?.id ?? null : null,
      crystalTearIds: isPhysickActive
        ? Object.values(selectedCrystalTears).map(({ id }) => id)
        : [],
      buffSpellIds: activeBuffSpellIds,
      weaponBuff: activeWeaponBuff?.targetSlotId === focusedWeaponSlotId
        ? weaponBuffSelection
        : null,
      skillBuffAshOfWarId: activeSkillBuffSlotId === focusedWeaponSlotId
        ? focusedWeapon?.ashOfWarId ?? null
        : null,
    },
  );
  const spellOffenseQuery = useSpellOffensePreviewQuery(
    focusedSpell,
    activeCatalyst,
    stats,
    {
      talismanIds: Object.values(selectedTalismans).map(({ id }) => id),
      greatRuneId: isGreatRuneActive ? selectedGreatRune?.id ?? null : null,
      crystalTearIds: isPhysickActive
        ? Object.values(selectedCrystalTears).map(({ id }) => id)
        : [],
      buffSpellIds: activeBuffSpellIds,
    },
  );

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
              activeSlotId={activeWeaponSlotId
                ?? activeArmorSlotId
                ?? activeTalismanSlotId
                ?? (isGreatRunePickerOpen ? "great-rune" : null)
                ?? activeCrystalTearSlotId
                ?? (activeSpellSlot === null ? null : `spell-${activeSpellSlot}`)
                ?? configuredWeaponSlotId
                ?? (editorFocus?.kind === "weapon" ? editorFocus.slotId : null)}
              onSelectSlot={openSlot}
              selectedArmor={selectedArmor}
              selectedTalismans={selectedTalismans}
              selectedWeapons={selectedWeapons}
              selectedGreatRune={selectedGreatRune}
              selectedCrystalTears={selectedCrystalTears}
              selectedSpells={selectedSpells}
              availableSpellSlots={availableSpellSlots}
              memoryStoneCount={memoryStoneCount}
              minimumMemoryStoneCount={minimumMemoryStoneCount}
              onChangeMemoryStoneCount={setMemoryStoneCount}
              activeCatalystSlotId={activeCatalystSlotId}
              isGreatRuneActive={isGreatRuneActive}
              isPhysickActive={isPhysickActive}
              onChangeGreatRuneActive={setIsGreatRuneActive}
              onChangePhysickActive={setIsPhysickActive}
              currentStats={statsPreview?.effectiveStats ?? stats}
            />
            <BuffSimulationBar
              activeIds={activeBuffSpellIds}
              activeWeaponBuff={activeWeaponBuff}
              activeSkillBuffSlotId={activeSkillBuffSlotId}
              catalyst={activeCatalyst}
              currentStats={statsPreview?.effectiveStats ?? stats}
              onToggle={(spell) => setActiveBuffSpellIds((current) => toggleGeneralBuff(
                current,
                spell,
                Object.values(selectedSpells),
              ))}
              onToggleWeaponBuff={(spell) => {
                if (!focusedWeaponSlotId || !activeCatalystSlotId) return;
                setActiveWeaponBuff((current) => current?.spellId === spell.id
                  && current.targetSlotId === focusedWeaponSlotId
                  ? null
                  : {
                      spellId: spell.id,
                      targetSlotId: focusedWeaponSlotId,
                      catalystSlotId: activeCatalystSlotId,
                    });
                setActiveSkillBuffSlotId(null);
              }}
              onToggleSkillBuff={(active) => {
                setActiveSkillBuffSlotId(active ? focusedWeaponSlotId : null);
                if (active) setActiveWeaponBuff(null);
              }}
              spells={Object.values(selectedSpells)}
              target={focusedWeapon}
              targetSlotId={focusedWeaponSlotId}
            />
          {configuredWeaponSlotId && configuredWeapon && (
            <WeaponInspector
              configuration={configuredWeapon}
                onChange={(configuration) => {
                  setSelectedWeapons((current) => ({
                    ...current,
                    [configuredWeaponSlotId]: configuration,
                  }));
                  if (configuration.ashOfWarId !== configuredWeapon.ashOfWarId) {
                    setActiveSkillBuffSlotId((current) => current === configuredWeaponSlotId ? null : current);
                  }
                }}
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
                if (editorFocus?.kind === "weapon" && editorFocus.slotId === configuredWeaponSlotId) {
                  const nextSlotId = Object.keys(selectedWeapons)
                    .filter(isWeaponSlotId)
                    .find((slotId) => slotId !== configuredWeaponSlotId);
                  setEditorFocus(nextSlotId ? { kind: "weapon", slotId: nextSlotId } : null);
                }
                if (activeCatalystSlotId === configuredWeaponSlotId) {
                  setActiveCatalystSlotId(null);
                }
                setActiveWeaponBuff((current) => current?.targetSlotId === configuredWeaponSlotId
                  || current?.catalystSlotId === configuredWeaponSlotId ? null : current);
                setActiveSkillBuffSlotId((current) => current === configuredWeaponSlotId ? null : current);
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
          {isGreatRunePickerOpen && (
            <GreatRunePicker
              onClose={() => setIsGreatRunePickerOpen(false)}
              onRemove={selectedGreatRune
                ? () => {
                    setSelectedGreatRune(null);
                    setIsGreatRuneActive(false);
                    setIsGreatRunePickerOpen(false);
                  }
                : undefined}
              onSelect={(greatRune) => {
                setSelectedGreatRune(greatRune);
                setIsGreatRunePickerOpen(false);
              }}
            />
          )}
          {activeCrystalTearSlotId && (
            <CrystalTearPicker
              excludedIds={Object.entries(selectedCrystalTears)
                .filter(([slotId]) => slotId !== activeCrystalTearSlotId)
                .map(([, crystalTear]) => crystalTear.id)}
              onClose={() => setActiveCrystalTearSlotId(null)}
              onRemove={selectedCrystalTears[activeCrystalTearSlotId]
                ? () => {
                    setSelectedCrystalTears((current) => {
                      const next = { ...current };
                      delete next[activeCrystalTearSlotId];
                      return next;
                    });
                    if (Object.keys(selectedCrystalTears).length === 1) {
                      setIsPhysickActive(false);
                    }
                    setActiveCrystalTearSlotId(null);
                  }
                : undefined}
              onSelect={(crystalTear) => {
                setSelectedCrystalTears((current) => ({
                  ...current,
                  [activeCrystalTearSlotId]: crystalTear,
                }));
                if (!crystalTear.effects) setIsPhysickActive(false);
                setActiveCrystalTearSlotId(null);
              }}
              slotLabel={crystalTearSlotLabels[activeCrystalTearSlotId] ?? "Crystal Tear slot"}
            />
          )}
          {activeSpellSlot !== null && (
            <SpellPicker
              availableMemorySlots={availableSpellSlots
                - Object.values(selectedSpells).reduce((total, spell) => total + spell.slotsRequired, 0)
                + (selectedSpells[activeSpellSlot]?.slotsRequired ?? 0)}
              excludedIds={Object.entries(selectedSpells)
                .filter(([slot]) => Number(slot) !== activeSpellSlot)
                .map(([, spell]) => spell.id)}
              onClose={() => setActiveSpellSlot(null)}
              onRemove={selectedSpells[activeSpellSlot]
                ? () => {
                    const removedSpellId = selectedSpells[activeSpellSlot]?.id;
                    setSelectedSpells((current) => {
                      const next = { ...current };
                      delete next[activeSpellSlot];
                      return next;
                    });
                    if (removedSpellId) {
                      setActiveBuffSpellIds((current) => current.filter((id) => id !== removedSpellId));
                      setActiveWeaponBuff((current) => current?.spellId === removedSpellId ? null : current);
                    }
                    setActiveSpellSlot(null);
                  }
                : undefined}
              onSelect={(spell) => {
                const replacedSpellId = selectedSpells[activeSpellSlot]?.id;
                setSelectedSpells((current) => ({ ...current, [activeSpellSlot]: spell }));
                if (replacedSpellId && replacedSpellId !== spell.id) {
                  setActiveBuffSpellIds((current) => current.filter((id) => id !== replacedSpellId));
                  setActiveWeaponBuff((current) => current?.spellId === replacedSpellId ? null : current);
                }
                setEditorFocus({ kind: "spell", slotIndex: activeSpellSlot });
                setActiveSpellSlot(null);
              }}
              slotLabel={`Spell slot ${activeSpellSlot}`}
            />
          )}
            </div>
            <div
              aria-labelledby="build-editor-status-tab"
              className="build-editor-region build-editor-status-region"
              data-active={activeTab === "status"}
              id="build-editor-status-panel"
              role="tabpanel"
            >
              <CalculatedStatsPanel
                focus={editorFocus}
                focusedWeapon={focusedWeapon}
                focusedSpell={focusedSpell}
                activeCatalyst={activeCatalyst}
                isError={statsQuery.isError}
                errorMessage={statsQuery.error instanceof Error ? statsQuery.error.message : undefined}
                isPending={statsQuery.isPending || statsQuery.isFetching}
                preview={statsPreview}
                offensePreview={offenseQuery.data ?? null}
                isOffensePending={offenseQuery.isPending || offenseQuery.isFetching}
                isOffenseError={offenseQuery.isError}
                spellOffensePreview={spellOffenseQuery.data ?? null}
                isSpellOffensePending={spellOffenseQuery.isPending || spellOffenseQuery.isFetching}
                isSpellOffenseError={spellOffenseQuery.isError}
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

function parseSpellSlot(slotId: string): number | null {
  const match = /^spell-(\d{1,2})$/.exec(slotId);
  if (!match) return null;
  const slot = Number(match[1]);
  return slot >= 1 && slot <= 12 ? slot : null;
}

function isWeaponSlotId(slotId: string): slotId is WeaponEditorSlotId {
  return slotId in weaponSlotLabels;
}

function toCatalystSelection(weapon?: EquippedWeapon) {
  if (!weapon || weapon.weapon.castingTypes.length === 0) return null;
  return {
    weaponId: weapon.weapon.id,
    variantId: weapon.variantId,
    upgradeLevel: weapon.upgradeLevel,
  };
}

function toWeaponBuffSelection(
  activeWeaponBuff: ActiveWeaponBuff | null,
  selectedSpells: Record<number, Spell>,
  selectedWeapons: Record<string, EquippedWeapon>,
) {
  if (!activeWeaponBuff) return null;
  const spellExists = Object.values(selectedSpells).some(({ id }) => id === activeWeaponBuff.spellId);
  const catalyst = selectedWeapons[activeWeaponBuff.catalystSlotId];
  if (!spellExists || !catalyst) return null;
  return {
    spellId: activeWeaponBuff.spellId,
    catalystWeaponId: catalyst.weapon.id,
    catalystVariantId: catalyst.variantId,
    upgradeLevel: catalyst.upgradeLevel,
  };
}
