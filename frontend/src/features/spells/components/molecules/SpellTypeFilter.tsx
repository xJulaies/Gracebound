import { SPELL_TYPES, type SpellTypeFilter as SpellType } from "../../types/spell.types";

const labels: Record<SpellType, string> = {
  all: "All",
  sorcery: "Sorceries",
  incantation: "Incantations",
};

export function SpellTypeFilter({
  activeType,
  onChange,
}: {
  activeType: SpellType;
  onChange: (type: SpellType) => void;
}) {
  return (
    <div aria-label="Spell types" className="flex gap-2 overflow-x-auto pb-1" role="group">
      {SPELL_TYPES.map((type) => (
        <button
          aria-pressed={activeType === type}
          className="build-secondary-action"
          key={type}
          onClick={() => onChange(type)}
          type="button"
        >
          {labels[type]}
        </button>
      ))}
    </div>
  );
}
