import { createRoute } from "@tanstack/react-router";
import { EquipmentPage } from "../features/equipment/pages/EquipmentPage";
import { parseEquipmentCatalogSearch } from "../features/equipment/domain/parseEquipmentCatalogSearch";
import { publicLayoutRoute } from "./publicLayout.route";

export const equipmentRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/equipment",
  validateSearch: parseEquipmentCatalogSearch,
  component: function EquipmentRoute() {
    const filters = equipmentRoute.useSearch();
    const navigate = equipmentRoute.useNavigate();

    return (
      <EquipmentPage
        filters={filters}
        onCategoryChange={(category) => void navigate({
          search: (current) => ({ ...current, category }),
        })}
        onSearchChange={(search) => void navigate({
          replace: true,
          search: (current) => ({ ...current, search }),
        })}
        onFilterChange={(key, value) => void navigate({
          search: (current) => ({ ...current, [key]: value }),
        })}
      />
    );
  },
});
