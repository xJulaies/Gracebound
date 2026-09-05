import { createRoute } from "@tanstack/react-router";
import { SpellsPage } from "../features/spells/pages/SpellsPage";
import { parseSpellCatalogSearch } from "../features/spells/domain/parseSpellCatalogSearch";
import { publicLayoutRoute } from "./publicLayout.route";

export const spellsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/spells",
  validateSearch: parseSpellCatalogSearch,
  component: function SpellsRoute() {
    const filters = spellsRoute.useSearch();
    const navigate = spellsRoute.useNavigate();

    return (
      <SpellsPage
        filters={filters}
        onSchoolChange={(school) => void navigate({
          search: (current) => ({ ...current, school }),
        })}
        onSearchChange={(search) => void navigate({
          replace: true,
          search: (current) => ({ ...current, search }),
        })}
        onTypeChange={(type) => void navigate({
          search: (current) => ({ ...current, type, school: undefined }),
        })}
      />
    );
  },
});
