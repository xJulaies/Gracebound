import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const damageCalculatorRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/damage-calculator",
  component: lazyRouteComponent(
    () => import("../features/damage-calculator/pages/DamageCalculatorPage"),
    "DamageCalculatorPage",
  ),
});
