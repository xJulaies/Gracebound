import type { Spell } from "../../../spells/types/spell.types";
import { ItemPickerResult } from "./ItemPickerResult";

export function SpellPickerItem({
  onPreview,
  onSelect,
  spell,
}: {
  onPreview: (spell: Spell) => void;
  onSelect: (spell: Spell) => void;
  spell: Spell;
}) {
  return (
    <ItemPickerResult
      badge={spell.calculationStatus === "supported"
        ? <span className="mt-1 block text-xs text-accent">Calculation supported</span>
        : undefined}
      iconUrl={spell.iconUrl}
      metadata={`${spell.type === "sorcery" ? "Sorcery" : "Incantation"} · ${spell.fpCost} FP · ${spell.slotsRequired} ${spell.slotsRequired === 1 ? "slot" : "slots"}`}
      onPreview={() => onPreview(spell)}
      onSelect={() => onSelect(spell)}
      title={spell.name}
    />
  );
}
