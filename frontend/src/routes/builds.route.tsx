import { createRoute } from "@tanstack/react-router";
import { BuildsPage } from "../features/builds/pages/BuildsPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const buildsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds",
  component: BuildsPage,
});
