import { createRoute } from "@tanstack/react-router";
import { BossesPage } from "../features/bosses/pages/BossesPage";
import { rootRoute } from "./root.route";

export const bossesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bosses",
  component: BossesPage,
});
