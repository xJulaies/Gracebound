import {
  EQUIPMENT_CATEGORIES,
  type EquipmentCategory,
} from "../../types/equipmentCatalog.types";

const labels: Record<EquipmentCategory, string> = {
  all: "All",
  armaments: "Armaments",
  armor: "Armor",
  talismans: "Talismans",
};

interface EquipmentCategoryFilterProps {
  activeCategory: EquipmentCategory;
  onChange: (category: EquipmentCategory) => void;
}

export function EquipmentCategoryFilter({
  activeCategory,
  onChange,
}: EquipmentCategoryFilterProps) {
  return (
    <div
      aria-label="Equipment categories"
      className="flex gap-2 overflow-x-auto pb-1"
      role="group"
    >
      {EQUIPMENT_CATEGORIES.map((category) => (
        <button
          aria-pressed={activeCategory === category}
          className="build-secondary-action"
          key={category}
          onClick={() => onChange(category)}
          type="button"
        >
          {labels[category]}
        </button>
      ))}
    </div>
  );
}
