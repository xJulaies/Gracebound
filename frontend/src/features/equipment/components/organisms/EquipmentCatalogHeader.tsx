import type {
  EquipmentCatalogSearch,
  EquipmentCategory,
  EquipmentFilterKey,
} from "../../types/equipmentCatalog.types";
import { EquipmentCatalogSearchInput } from "../atoms/EquipmentCatalogSearchInput";
import { EquipmentCatalogFilters } from "../molecules/EquipmentCatalogFilters";
import { EquipmentCategoryFilter } from "../molecules/EquipmentCategoryFilter";

interface EquipmentCatalogHeaderProps {
  filters: EquipmentCatalogSearch;
  onCategoryChange: (category: EquipmentCategory) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (key: EquipmentFilterKey, value: string | undefined) => void;
}

export function EquipmentCatalogHeader({
  filters,
  onCategoryChange,
  onSearchChange,
  onFilterChange,
}: EquipmentCatalogHeaderProps) {
  return (
    <header className="mb-8 pt-6">
      <h1 className="mb-3 text-3xl sm:text-4xl">Equipment</h1>
      <p className="mb-6 max-w-3xl leading-7 text-foreground-muted">
        Browse armaments, armor, and talismans from the current Gracebound game dataset.
      </p>
      <div className="grid gap-4 rounded-panel border border-border bg-surface-elevated p-4 sm:p-5">
        <EquipmentCatalogSearchInput onChange={onSearchChange} value={filters.search} />
        <EquipmentCategoryFilter
          activeCategory={filters.category}
          onChange={onCategoryChange}
        />
        <EquipmentCatalogFilters filters={filters} onChange={onFilterChange} />
      </div>
    </header>
  );
}
