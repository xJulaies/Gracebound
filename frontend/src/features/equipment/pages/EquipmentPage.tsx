import type {
  EquipmentCatalogSearch,
  EquipmentCategory,
  EquipmentFilterKey,
} from "../types/equipmentCatalog.types";
import { EquipmentCatalogHeader } from "../components/organisms/EquipmentCatalogHeader";
import { EquipmentCatalogResults } from "../components/organisms/EquipmentCatalogResults";
import { useEquipmentCatalogQueries } from "../hooks/useEquipmentCatalogQueries";

interface EquipmentPageProps {
  filters: EquipmentCatalogSearch;
  onCategoryChange: (category: EquipmentCategory) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (key: EquipmentFilterKey, value: string | undefined) => void;
}

export function EquipmentPage({
  filters,
  onCategoryChange,
  onSearchChange,
  onFilterChange,
}: EquipmentPageProps) {
  const groups = useEquipmentCatalogQueries(filters);

  return (
    <main>
      <EquipmentCatalogHeader
        filters={filters}
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />
      <EquipmentCatalogResults groups={groups} />
    </main>
  );
}
