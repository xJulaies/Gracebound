import { createRoute } from "@tanstack/react-router";
import { BossesPage } from "../features/bosses/pages/BossesPage";
import { parseBossCatalogSearch } from "../features/bosses/domain/parseBossCatalogSearch";
import { publicLayoutRoute } from "./publicLayout.route";

export const bossesRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bosses",
  validateSearch: parseBossCatalogSearch,
  component: function BossesRoute() {
    const filters = bossesRoute.useSearch();
    const navigate = bossesRoute.useNavigate();

    return (
      <BossesPage
        filters={filters}
        onFilterChange={(key, value) => void navigate({
          search: (current) => ({ ...current, [key]: value }),
        })}
        onSearchChange={(search) => void navigate({
          replace: true,
          search: (current) => ({ ...current, search }),
        })}
      />
    );
  },
});
