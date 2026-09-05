import { createRoute } from "@tanstack/react-router";
import { SpellsPage } from "../features/spells/pages/SpellsPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const spellsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/spells",
  component: SpellsPage,
});
