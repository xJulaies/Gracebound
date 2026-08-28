import { createRoute } from "@tanstack/react-router";
import { BuildsPage } from "../features/builds/pages/BuildsPage";
import { rootRoute } from "./root.route";

export const buildsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds",
  component: BuildsPage,
});
