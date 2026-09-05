import { createRoute } from "@tanstack/react-router";
import { DamageCalculatorPage } from "../features/damage-calculator/pages/DamageCalculatorPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const damageCalculatorRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/damage-calculator",
  component: DamageCalculatorPage,
});
