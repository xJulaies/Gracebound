import { bossesRoute } from "./bosses.route";
import { bossDetailsRoute } from "./bossDetails.route";
import { buildsRoute } from "./builds.route";
import { createBuildRoute } from "./createBuild.route";
import { damageCalculatorRoute } from "./damageCalculator.route";
import { indexRoute } from "./index.route";
import { publicLayoutRoute } from "./publicLayout.route";
import { rootRoute } from "./root.route";
import { weaponsRoute } from "./weapons.route";
import { equipmentRoute } from "./equipment.route";
import { spellsRoute } from "./spells.route";
import { myBuildsRoute } from "./myBuilds.route";
import { editBuildRoute } from "./editBuild.route";
import { publicBuildDetailsRoute } from "./publicBuildDetails.route";
import { privacyRoute } from "./privacy.route";
import { imprintRoute } from "./imprint.route";

const publicRouteTree = publicLayoutRoute.addChildren([
  indexRoute,
  equipmentRoute,
  weaponsRoute,
  spellsRoute,
  bossesRoute,
  bossDetailsRoute,
  buildsRoute,
  publicBuildDetailsRoute,
  createBuildRoute,
  myBuildsRoute,
  editBuildRoute,
  damageCalculatorRoute,
  privacyRoute,
  imprintRoute,
]);

export const routeTree = rootRoute.addChildren([publicRouteTree]);
