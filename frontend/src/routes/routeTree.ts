import { bossesRoute } from "./bosses.route";
import { buildsRoute } from "./builds.route";
import { damageCalculatorRoute } from "./damageCalculator.route";
import { indexRoute } from "./index.route";
import { rootRoute } from "./root.route";
import { weaponsRoute } from "./weapons.route";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  weaponsRoute,
  bossesRoute,
  buildsRoute,
  damageCalculatorRoute,
]);
