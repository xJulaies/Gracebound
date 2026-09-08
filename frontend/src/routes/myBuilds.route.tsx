import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const myBuildsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/my-builds",
  component: lazyRouteComponent(
    () => import("../features/builds/pages/MyBuildsPage"),
    "MyBuildsPage",
  ),
});
