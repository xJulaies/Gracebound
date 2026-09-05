import { bossesRoute } from "./bosses.route";
import { buildsRoute } from "./builds.route";
import { createBuildRoute } from "./createBuild.route";
import { damageCalculatorRoute } from "./damageCalculator.route";
import { indexRoute } from "./index.route";
import { publicLayoutRoute } from "./publicLayout.route";
import { rootRoute } from "./root.route";
import { weaponsRoute } from "./weapons.route";
import { equipmentRoute } from "./equipment.route";
import { spellsRoute } from "./spells.route";

const publicRouteTree = publicLayoutRoute.addChildren([
  indexRoute,
  equipmentRoute,
  weaponsRoute,
  spellsRoute,
  bossesRoute,
  buildsRoute,
  createBuildRoute,
  damageCalculatorRoute,
]);

export const routeTree = rootRoute.addChildren([publicRouteTree]);
