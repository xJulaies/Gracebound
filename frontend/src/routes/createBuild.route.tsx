import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const createBuildRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds/new",
  component: lazyRouteComponent(
    () => import("../features/builds/pages/CreateBuildPage"),
    "CreateBuildPage",
  ),
});
