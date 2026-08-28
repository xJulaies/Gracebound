import { createRoute } from "@tanstack/react-router";
import { DamageCalculatorPage } from "../features/damage-calculator/pages/DamageCalculatorPage";
import { rootRoute } from "./root.route";

export const damageCalculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/damage-calculator",
  component: DamageCalculatorPage,
});
