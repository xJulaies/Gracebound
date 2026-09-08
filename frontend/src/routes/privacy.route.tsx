import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const privacyRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/privacy",
  component: lazyRouteComponent(
    () => import("../features/legal/pages/PrivacyPage"),
    "PrivacyPage",
  ),
});
