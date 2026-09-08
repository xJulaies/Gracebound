import { createRoute } from "@tanstack/react-router";
import { MyBuildsPage } from "../features/builds/pages/MyBuildsPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const myBuildsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/my-builds",
  component: MyBuildsPage,
});
