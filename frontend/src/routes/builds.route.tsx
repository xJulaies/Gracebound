import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const buildsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds",
  component: lazyRouteComponent(
    () => import("../features/builds/pages/BuildsPage"),
    "BuildsPage",
  ),
});
