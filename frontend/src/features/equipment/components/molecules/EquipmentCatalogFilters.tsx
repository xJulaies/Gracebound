import type {
  EquipmentCatalogSearch,
  EquipmentFilterKey,
} from "../../types/equipmentCatalog.types";
import { WEAPON_TYPE_ORDER } from "../../../weapons/domain/weaponTypes";

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
    <label className="grid min-w-44 gap-1 text-sm text-foreground-muted">
      {label}
      <select
        className="min-h-11 cursor-pointer rounded-panel border border-border bg-background px-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-focus"
        onChange={(event) => onChange(event.target.value || undefined)}
        value={value ?? ""}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{formatLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
