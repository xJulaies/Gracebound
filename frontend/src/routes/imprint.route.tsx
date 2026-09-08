import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const imprintRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/imprint",
  component: lazyRouteComponent(
    () => import("../features/legal/pages/ImprintPage"),
    "ImprintPage",
  ),
});
