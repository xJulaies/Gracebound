import { EquipmentSlot } from "../molecules/EquipmentSlot";
import type { EquippedWeapon } from "../../types/editor.types";
import { getEquippedWeaponDisplayName } from "../../domain/getEquippedWeaponDisplayName";
import type { Armor } from "../../../armor/types/armor.types";
import type { Talisman } from "../../../talismans/types/talisman.types";
import type { GreatRune } from "../../../great-runes/types/greatRune.types";
import type { CrystalTear } from "../../../crystal-tears/types/crystalTear.types";
import { SpellMemorySlot } from "../molecules/SpellMemorySlot";
import type { Spell } from "../../../spells/types/spell.types";
import { MemoryStoneControl } from "../molecules/MemoryStoneControl";
import { EffectActivationControl } from "../molecules/EffectActivationControl";
import { getPhysickSimulationStatus } from "../../../crystal-tears/domain/describeCrystalTearEffects";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { getUnmetAttributeRequirements } from "../../../../shared/domain/attributeRequirements";

interface EquipmentLoadoutProps {
  onSelectSlot?: (slotId: string) => void;
  selectedWeapons?: Record<string, EquippedWeapon>;
  activeSlotId?: string | null;
  selectedArmor?: Record<string, Armor>;
  selectedTalismans?: Record<string, Talisman>;
  selectedGreatRune?: GreatRune | null;
  selectedCrystalTears?: Record<string, CrystalTear>;
  selectedSpells?: Record<number, Spell>;
  availableSpellSlots?: number;
  memoryStoneCount?: number;
  minimumMemoryStoneCount?: number;
  onChangeMemoryStoneCount?: (count: number) => void;
  activeCatalystSlotId?: string | null;
  isGreatRuneActive?: boolean;
  isPhysickActive?: boolean;
  onChangeGreatRuneActive?: (active: boolean) => void;
  onChangePhysickActive?: (active: boolean) => void;
  currentStats?: CharacterStats | null;
}

const rightHandSlots = ["right-hand-1", "right-hand-2", "right-hand-3"];
const leftHandSlots = ["left-hand-1", "left-hand-2", "left-hand-3"];
const armorSlots = [
  ["armor-head", "Head"],
  ["armor-body", "Body"],
  ["armor-arms", "Arms"],
  ["armor-legs", "Legs"],
] as const;
const talismanSlots = ["talisman-1", "talisman-2", "talisman-3", "talisman-4"];
const spellSlots = Array.from({ length: 12 }, (_, index) => index + 1);

export function EquipmentLoadout({
  activeSlotId,
  onSelectSlot,
  selectedArmor = {},
  selectedTalismans = {},
  selectedGreatRune = null,
  selectedCrystalTears = {},
  selectedSpells = {},
  availableSpellSlots = 2,
  memoryStoneCount = 0,
  minimumMemoryStoneCount = 0,
  onChangeMemoryStoneCount,
  selectedWeapons = {},
  activeCatalystSlotId = null,
  isGreatRuneActive = false,
  isPhysickActive = false,
  onChangeGreatRuneActive,
  onChangePhysickActive,
  currentStats = null,
}: EquipmentLoadoutProps) {
  const physickStatus = getPhysickSimulationStatus(Object.values(selectedCrystalTears));
  return (
    <section aria-labelledby="equipment-loadout-heading" className="build-loadout">
      <header className="mb-6">
        <h2 className="mb-2 text-2xl sm:text-3xl" id="equipment-loadout-heading">
          Equipment
        </h2>
        <p className="mb-0 text-sm leading-6 text-foreground-muted">
          Select a slot to browse and configure your equipment.
        </p>
      </header>

      <div className="grid gap-7 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-start">
        <div className="grid gap-7">
          <SlotGroup heading="Left hand">
            {leftHandSlots.map((id, index) => (
              <EquipmentSlot
                emptyAssetId="left-weapon-slot"
                id={id}
                item={toSlotItem(selectedWeapons[id], currentStats)}
                isActive={activeSlotId === id}
                key={id}
                label={`Left hand ${index + 1}`}
                onSelect={onSelectSlot}
                occupiedActionLabel="Select armament"
                statusBadge={activeCatalystSlotId === id ? "Catalyst" : undefined}
              />
            ))}
          </SlotGroup>
          <SlotGroup heading="Great Rune">
            <EquipmentSlot
              emptyAssetId="equipment-category"
              id="great-rune"
              isActive={activeSlotId === "great-rune"}
              item={toGreatRuneSlotItem(selectedGreatRune)}
              label="Great Rune"
              onSelect={onSelectSlot}
            />
            {onChangeGreatRuneActive && (
              <EffectActivationControl
                active={isGreatRuneActive}
                disabled={!selectedGreatRune?.effects}
                label="Great Rune"
                message={selectedGreatRune && !selectedGreatRune.effects
                  ? "This Great Rune is catalogued but not calculable."
                  : undefined}
                onChange={onChangeGreatRuneActive}
              />
            )}
          </SlotGroup>
          <SlotGroup heading="Wondrous Physick">
            {["crystal-tear-1", "crystal-tear-2"].map((id, index) => (
              <EquipmentSlot
                emptyAssetId="crystal-tear-category"
                id={id}
                isActive={activeSlotId === id}
                item={toCrystalTearSlotItem(selectedCrystalTears[id])}
                key={id}
                label={`Crystal Tear ${index + 1}`}
                onSelect={onSelectSlot}
              />
            ))}
            {onChangePhysickActive && (
              <EffectActivationControl
                active={isPhysickActive}
                disabled={!physickStatus.canActivate}
                label="Wondrous Physick"
                message={physickStatus.message}
                onChange={onChangePhysickActive}
              />
            )}
          </SlotGroup>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
          <SlotGroup heading="Armor">
            {armorSlots.map(([id, label]) => (
              <EquipmentSlot
                emptyAssetId="armor-category"
                id={id}
                isActive={activeSlotId === id}
                item={toArmorSlotItem(selectedArmor[id])}
                key={id}
                label={label}
                onSelect={onSelectSlot}
              />
            ))}
          </SlotGroup>
          <SlotGroup heading="Talismans">
            {talismanSlots.map((id, index) => (
              <EquipmentSlot
                emptyAssetId="talisman-slot"
                id={id}
                isActive={activeSlotId === id}
                item={toTalismanSlotItem(selectedTalismans[id])}
                key={id}
                label={`Talisman ${index + 1}`}
                onSelect={onSelectSlot}
              />
            ))}
          </SlotGroup>
        </div>

        <div className="grid gap-7">
          <SlotGroup heading="Right hand">
            {rightHandSlots.map((id, index) => (
              <EquipmentSlot
                emptyAssetId="right-weapon-slot"
                id={id}
                item={toSlotItem(selectedWeapons[id], currentStats)}
                isActive={activeSlotId === id}
                key={id}
                label={`Right hand ${index + 1}`}
                onSelect={onSelectSlot}
                occupiedActionLabel="Select armament"
                statusBadge={activeCatalystSlotId === id ? "Catalyst" : undefined}
              />
            ))}
          </SlotGroup>
          <SlotGroup heading="Spells" layout="compact">
            {onChangeMemoryStoneCount && (
              <div className="col-span-3">
                <MemoryStoneControl
                  count={memoryStoneCount}
                  minimumCount={minimumMemoryStoneCount}
                  onChange={onChangeMemoryStoneCount}
                />
              </div>
            )}
            {getVisibleSpellSlots(spellSlots, availableSpellSlots, selectedSpells).map((index) => (
              <SpellMemorySlot
                index={index}
                isActive={activeSlotId === `spell-${index}`}
                key={index}
                onSelect={() => onSelectSlot?.(`spell-${index}`)}
                spell={selectedSpells[index]}
                currentStats={currentStats}
              />
            ))}
          </SlotGroup>
        </div>
      </div>
    </section>
  );
}

function getVisibleSpellSlots(
  slots: number[],
  availableSlots: number,
  selectedSpells: Record<number, Spell>,
) {
  const available = slots.filter((slot) => slot <= availableSlots);
  const selectedSlotIds = new Set(Object.keys(selectedSpells).map(Number));
  const additionallyConsumedSlots = Object.values(selectedSpells).reduce(
    (total, spell) => total + Math.max(0, spell.slotsRequired - 1),
    0,
  );
  const hiddenEmptySlots = [...available]
    .reverse()
    .filter((slot) => !selectedSlotIds.has(slot))
    .slice(0, additionallyConsumedSlots);
  const hidden = new Set(hiddenEmptySlots);
  return available.filter((slot) => !hidden.has(slot));
}

function toSlotItem(selection?: EquippedWeapon, currentStats?: CharacterStats | null) {
  if (!selection) return undefined;
  return {
    iconUrl: selection.weapon.iconUrl,
    name: getEquippedWeaponDisplayName(selection),
    ...(selection.ashOfWar && { secondaryIconUrl: selection.ashOfWar.iconUrl }),
    previewCategory: formatLabel(selection.weapon.weaponType ?? "Armament"),
    previewLines: [
      `Weight ${selection.weapon.weight}`,
      selection.ashOfWar ? `Ash of War: ${selection.ashOfWar.name}` : "No Ash of War selected",
      ...formatMissingRequirements(selection.weapon.requirements, currentStats),
    ],
  };
}

function formatMissingRequirements(
  requirements: Partial<Record<keyof CharacterStats, number>>,
  currentStats?: CharacterStats | null,
) {
  if (!currentStats) return [];
  return getUnmetAttributeRequirements(requirements, currentStats).map(
    ({ attribute, current, required }) => `Requires ${formatLabel(attribute)} ${required} · current ${current}`,
  );
}

function toArmorSlotItem(armor?: Armor) {
  if (!armor) return undefined;
  return {
    name: armor.name,
    iconUrl: armor.iconUrl,
    previewCategory: `${formatLabel(armor.slot)} armor`,
    previewLines: [`Weight ${armor.weight}`, `Poise ${armor.poise}`],
  };
}

function toTalismanSlotItem(talisman?: Talisman) {
  if (!talisman) return undefined;
  return {
    name: talisman.name,
    iconUrl: talisman.iconUrl,
    previewCategory: "Talisman",
    previewLines: [
      `Weight ${talisman.weight}`,
      talisman.summary ?? (talisman.calculationStatus === "supported" ? "Calculation supported" : "Catalog only"),
    ],
  };
}

function toGreatRuneSlotItem(greatRune: GreatRune | null) {
  if (!greatRune) return undefined;
  return {
    name: greatRune.name,
    iconUrl: greatRune.iconUrl,
    previewCategory: "Great Rune",
    previewLines: [
      greatRune.activation === "rune-arc" ? "Activated with a Rune Arc" : "No combat activation",
      greatRune.summary ?? (greatRune.effects ? "Calculation supported" : "Catalog only"),
    ],
  };
}

function toCrystalTearSlotItem(tear?: CrystalTear) {
  if (!tear) return undefined;
  return {
    name: tear.name,
    iconUrl: tear.iconUrl,
    previewCategory: "Crystal Tear",
    previewLines: [
      tear.effects?.durationSeconds ? `${tear.effects.durationSeconds} second duration` : "Instant or passive effect",
      tear.summary ?? (tear.effects ? "Calculation supported" : "Catalog only"),
    ],
  };
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function SlotGroup({
  heading,
  children,
  layout = "default",
}: {
  heading: string;
  children: React.ReactNode;
  layout?: "default" | "compact";
}) {
  return (
    <fieldset className="m-0 min-w-0 rounded-panel border border-border bg-background/35 p-4">
      <legend className="px-2 font-heading text-sm text-accent">{heading}</legend>
      <div
        className={layout === "compact"
          ? "grid grid-cols-3 gap-2 sm:gap-3"
          : "grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-2"}
        data-slot-layout={layout}
      >
        {children}
      </div>
    </fieldset>
  );
}
