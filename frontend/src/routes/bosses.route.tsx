import { createRoute } from "@tanstack/react-router";
import { BossesPage } from "../features/bosses/pages/BossesPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const bossesRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bosses",
  component: BossesPage,
});
