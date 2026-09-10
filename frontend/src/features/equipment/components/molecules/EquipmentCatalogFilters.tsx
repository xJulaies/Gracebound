import type {
  EquipmentCatalogSearch,
  EquipmentFilterKey,
} from "../../types/equipmentCatalog.types";
import { WEAPON_TYPE_ORDER } from "../../../weapons/domain/weaponTypes";
import { ResponsiveSelect } from "../../../../shared/ui/molecules/ResponsiveSelect";

const affinities = [
  "standard", "heavy", "keen", "quality", "fire", "flame-art",
  "lightning", "sacred", "magic", "cold", "poison", "blood", "occult",
] as const;

interface EquipmentCatalogFiltersProps {
  filters: EquipmentCatalogSearch;
  onChange: (key: EquipmentFilterKey, value: string | undefined) => void;
}

export function EquipmentCatalogFilters({
  filters,
  onChange,
}: EquipmentCatalogFiltersProps) {
  if (filters.category === "all") return null;

  return (
    <fieldset className="m-0 flex min-w-0 flex-wrap items-end gap-3 border-0 p-0">
      <legend className="sr-only">Equipment filters</legend>
      {filters.category === "armaments" && (
        <>
          <FilterSelect
            label="Weapon type"
            onChange={(value) => onChange("weaponType", value)}
            options={WEAPON_TYPE_ORDER}
            value={filters.weaponType}
          />
          <FilterSelect
            label="Affinity"
            onChange={(value) => onChange("affinity", value)}
            options={affinities}
            value={filters.affinity}
          />
        </>
      )}
      {filters.category === "armor" && (
        <FilterSelect
          label="Armor slot"
          onChange={(value) => onChange("armorSlot", value)}
          options={["head", "body", "arms", "legs"]}
          value={filters.armorSlot}
        />
      )}
      {filters.category === "talismans" && (
        <FilterSelect
          label="Calculation support"
          onChange={(value) => onChange("talismanStatus", value)}
          options={["supported", "catalog-only"]}
          value={filters.talismanStatus}
        />
      )}
    </fieldset>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string | undefined) => void;
  options: readonly string[];
  value?: string;
}) {
  return (
    <div className="min-w-44">
      <ResponsiveSelect
        emptyLabel="All"
        label={label}
        onChange={(nextValue) => onChange(nextValue || undefined)}
        options={options.map((option) => ({ value: option, label: formatLabel(option) }))}
        value={value ?? ""}
      />
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
