import { createRoute } from "@tanstack/react-router";
import { WeaponsPage } from "../features/weapons/pages/WeaponsPage";
import { rootRoute } from "./root.route";

export const weaponsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/weapons",
  component: WeaponsPage,
});
