import { CharacterClassCarousel } from "../../../character-classes/components/organisms/CharacterClassCarousel";
import { ArmorPicker } from "./ArmorPicker";
import { EquipmentLoadout } from "./EquipmentLoadout";
import { WeaponInspector } from "./WeaponInspector";
import { WeaponPicker } from "./WeaponPicker";
import { TalismanPicker } from "./TalismanPicker";
import { GreatRunePicker } from "./GreatRunePicker";
import { CrystalTearPicker } from "./CrystalTearPicker";
import { SpellPicker } from "./SpellPicker";
import { CharacterAttributePanel } from "./CharacterAttributePanel";
import { CalculatedStatsPanel } from "./CalculatedStatsPanel";
import {
  BuildEditorTabs,
} from "../molecules/BuildEditorTabs";
import { useBuildEditorDraft } from "../../hooks/useBuildEditorDraft";
import { useBuildEditorUiState } from "../../hooks/useBuildEditorUiState";
import { useBuildEditorPreviews } from "../../hooks/useBuildEditorPreviews";
import { useBuildEditorInteractions } from "../../hooks/useBuildEditorInteractions";
import { BuildSaveControls } from "./BuildSaveControls";
import { UnsavedBuildChangesGuard } from "./UnsavedBuildChangesGuard";
import type { BuildEditorInitialState } from "../../types/editor.types";
import { calculateRuneCosts } from "../../domain/calculateRuneCosts";
import {
  armorSlots,
  crystalTearSlotLabels,
  isWeaponSlotId,
  talismanSlotLabels,
  weaponSlotLabels,
} from "../../domain/editorSlotDefinitions";

export function BuildEditorWorkspace({
  initialBuildId = null,
  initialState,
}: {
  initialBuildId?: string | null;
  initialState?: BuildEditorInitialState;
} = {}) {
  const editor = useBuildEditorDraft(initialState);
  const {
    draft,
    isDirty,
    markSaved,
    setMetadata,
    characterLevel,
    selectedClass, setSelectedClass,
    stats,
    selectedWeapons,
    selectedArmor,
    selectedTalismans,
    selectedGreatRune,
    selectedCrystalTears,
    selectedSpells,
    memoryStoneCount, setMemoryStoneCount,
    activeCatalystSlotId,
  } = editor;
  const ui = useBuildEditorUiState();
  const {
    activeWeaponSlotId, setActiveWeaponSlotId,
    activeArmorSlotId, setActiveArmorSlotId,
    activeTalismanSlotId, setActiveTalismanSlotId,
    isGreatRunePickerOpen, setIsGreatRunePickerOpen,
    activeCrystalTearSlotId, setActiveCrystalTearSlotId,
    activeSpellSlot, setActiveSpellSlot,
    configuredWeaponSlotId, setConfiguredWeaponSlotId,
    editorFocus,
    isGreatRuneActive, setIsGreatRuneActive,
    isPhysickActive, setIsPhysickActive,
    activeTab, setActiveTab,
  } = ui;
  const interactions = useBuildEditorInteractions(editor, ui);
  const {
    activeCatalyst,
    availableSpellSlots,
    focusedSpell,
    focusedWeapon,
    minimumMemoryStoneCount,
    offenseQuery,
    spellOffenseQuery,
    statsPreview,
    statsQuery,
  } = useBuildEditorPreviews({
    activeCatalystSlotId,
    editorFocus,
    isGreatRuneActive,
    isPhysickActive,
    memoryStoneCount,
    selectedArmor,
    selectedClass,
    selectedCrystalTears,
    selectedGreatRune,
    selectedSpells,
    selectedTalismans,
    selectedWeapons,
    stats,
  });
  const runeCosts = selectedClass
    ? calculateRuneCosts(selectedClass.level, characterLevel)
    : null;

  const configuredWeapon = configuredWeaponSlotId
    ? selectedWeapons[configuredWeaponSlotId]
    : undefined;
  return (
    <section
      aria-label="Build editor"
      className={`build-editor-workspace${selectedClass ? " build-editor-workspace--active" : ""}`}
      id="character-class-builder"
    >
      {selectedClass && stats ? (
        <>
          {draft && (
            <BuildSaveControls
              draft={draft}
              initialBuildId={initialBuildId}
              isDirty={isDirty}
              onMetadataChange={setMetadata}
              onSaved={markSaved}
            />
          )}
          <UnsavedBuildChangesGuard isDirty={isDirty} />
          <BuildEditorTabs activeTab={activeTab} onChange={setActiveTab} />
          <div className="build-editor-grid">
            <div
              aria-label="Leveling"
              className="build-editor-region"
              data-active={activeTab === "character"}
              id="build-editor-character-panel"
              role="region"
            >
              <CharacterAttributePanel
                characterClass={selectedClass}
                characterLevel={characterLevel}
                isUpdatingCosts={statsQuery.isFetching}
                nextLevelRuneCost={runeCosts?.nextLevelRuneCost ?? null}
                onChangeAttribute={interactions.changeAttribute}
                onChangeCharacter={() => setSelectedClass(null)}
                stats={stats}
                totalRuneCost={runeCosts?.totalRuneCost ?? null}
              />
            </div>
            <div
              aria-label="Equipment"
              className="build-editor-region min-w-0"
              data-active={activeTab === "equipment"}
              id="build-editor-equipment-panel"
              role="region"
            >
            <EquipmentLoadout
              activeSlotId={activeWeaponSlotId
                ?? activeArmorSlotId
                ?? activeTalismanSlotId
                ?? (isGreatRunePickerOpen ? "great-rune" : null)
                ?? activeCrystalTearSlotId
                ?? (activeSpellSlot === null ? null : `spell-${activeSpellSlot}`)
                ?? configuredWeaponSlotId
                ?? (editorFocus?.kind === "weapon"
                  ? editorFocus.slotId
                  : editorFocus?.kind === "spell" ? `spell-${editorFocus.slotIndex}` : null)}
              onSelectSlot={interactions.openSlot}
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
          {configuredWeaponSlotId && configuredWeapon && (
            <WeaponInspector
              configuration={configuredWeapon}
                onChange={interactions.updateConfiguredWeapon}
              onChangeWeapon={() => {
                if (isWeaponSlotId(configuredWeaponSlotId)) {
                  setActiveWeaponSlotId(configuredWeaponSlotId);
                }
              }}
              onClose={() => setConfiguredWeaponSlotId(null)}
              onRemove={interactions.removeConfiguredWeapon}
              slotLabel={weaponSlotLabels[configuredWeaponSlotId] ?? "Armament slot"}
            />
          )}
          {activeWeaponSlotId && (
            <WeaponPicker
              onClose={() => setActiveWeaponSlotId(null)}
              onSelect={interactions.selectWeapon}
              slotLabel={weaponSlotLabels[activeWeaponSlotId] ?? "Armament slot"}
            />
          )}
          {activeArmorSlotId && armorSlots[activeArmorSlotId] && (
            <ArmorPicker
              onClose={() => setActiveArmorSlotId(null)}
              onRemove={selectedArmor[activeArmorSlotId] ? interactions.removeArmor : undefined}
              onSelect={interactions.selectArmor}
              slot={armorSlots[activeArmorSlotId].slot}
              slotLabel={armorSlots[activeArmorSlotId].label}
            />
          )}
          {activeTalismanSlotId && (
            <TalismanPicker
              onClose={() => setActiveTalismanSlotId(null)}
              onRemove={selectedTalismans[activeTalismanSlotId] ? interactions.removeTalisman : undefined}
              onSelect={interactions.selectTalisman}
              slotLabel={talismanSlotLabels[activeTalismanSlotId] ?? "Talisman slot"}
            />
          )}
          {isGreatRunePickerOpen && (
            <GreatRunePicker
              onClose={() => setIsGreatRunePickerOpen(false)}
              onRemove={selectedGreatRune ? interactions.removeGreatRune : undefined}
              onSelect={interactions.selectGreatRune}
            />
          )}
          {activeCrystalTearSlotId && (
            <CrystalTearPicker
              excludedIds={Object.entries(selectedCrystalTears)
                .filter(([slotId]) => slotId !== activeCrystalTearSlotId)
                .map(([, crystalTear]) => crystalTear.id)}
              onClose={() => setActiveCrystalTearSlotId(null)}
              onRemove={selectedCrystalTears[activeCrystalTearSlotId]
                ? interactions.removeCrystalTear
                : undefined}
              onSelect={interactions.selectCrystalTear}
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
              onRemove={selectedSpells[activeSpellSlot] ? interactions.removeSpell : undefined}
              onSelect={interactions.selectSpell}
              slotLabel={`Spell slot ${activeSpellSlot}`}
            />
          )}
            </div>
            <div
              aria-label="Status"
              className="build-editor-region build-editor-status-region"
              data-active={activeTab === "status"}
              id="build-editor-status-panel"
              role="region"
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
                onChangeFocusedSpell={editorFocus?.kind === "spell"
                  ? () => setActiveSpellSlot(editorFocus.slotIndex)
                  : undefined}
              />
            </div>
          </div>
        </>
      ) : (
        <CharacterClassCarousel onSelect={interactions.selectCharacterClass} />
      )}
    </section>
  );
}
