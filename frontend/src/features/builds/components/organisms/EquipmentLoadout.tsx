import { EquipmentSlot } from "../molecules/EquipmentSlot";
import type { Weapon } from "../../../weapons/types/weapon.types";
import type { EquippedWeapon } from "../../types/editor.types";
import { getEquippedWeaponDisplayName } from "../../domain/getEquippedWeaponDisplayName";
import type { Armor } from "../../../armor/types/armor.types";
import type { Talisman } from "../../../talismans/types/talisman.types";

interface EquipmentLoadoutProps {
  onSelectSlot?: (slotId: string) => void;
  selectedWeapons?: Record<string, EquippedWeapon>;
  activeSlotId?: string | null;
  selectedArmor?: Record<string, Armor>;
  selectedTalismans?: Record<string, Talisman>;
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

export function EquipmentLoadout({
  activeSlotId,
  onSelectSlot,
  selectedArmor = {},
  selectedTalismans = {},
  selectedWeapons = {},
}: EquipmentLoadoutProps) {
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
        <SlotGroup heading="Left hand">
          {leftHandSlots.map((id, index) => (
            <EquipmentSlot
              emptyAssetId="left-weapon-slot"
              id={id}
              item={toSlotItem(selectedWeapons[id])}
              isActive={activeSlotId === id}
              key={id}
              label={`Left hand ${index + 1}`}
              onSelect={onSelectSlot}
            />
          ))}
        </SlotGroup>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
          <SlotGroup heading="Armor">
            {armorSlots.map(([id, label]) => (
              <EquipmentSlot
                emptyAssetId="armor-category"
                id={id}
                isActive={activeSlotId === id}
                item={selectedArmor[id]}
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
                item={selectedTalismans[id]}
                key={id}
                label={`Talisman ${index + 1}`}
                onSelect={onSelectSlot}
              />
            ))}
          </SlotGroup>
        </div>

        <SlotGroup heading="Right hand">
          {rightHandSlots.map((id, index) => (
            <EquipmentSlot
              emptyAssetId="right-weapon-slot"
              id={id}
              item={toSlotItem(selectedWeapons[id])}
              isActive={activeSlotId === id}
              key={id}
              label={`Right hand ${index + 1}`}
              onSelect={onSelectSlot}
            />
          ))}
        </SlotGroup>
      </div>
    </section>
  );
}

function toSlotItem(selection?: EquippedWeapon):
  | Pick<Weapon, "iconUrl"> & { name: string; secondaryIconUrl?: string }
  | undefined {
  if (!selection) return undefined;
  return {
    iconUrl: selection.weapon.iconUrl,
    name: getEquippedWeaponDisplayName(selection),
    ...(selection.ashOfWar && { secondaryIconUrl: selection.ashOfWar.iconUrl }),
  };
}

function SlotGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 rounded-panel border border-border bg-background/35 p-4">
      <legend className="px-2 font-heading text-sm text-accent">{heading}</legend>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-2">{children}</div>
    </fieldset>
  );
}
