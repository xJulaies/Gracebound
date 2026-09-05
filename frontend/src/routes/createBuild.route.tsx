import { createRoute } from "@tanstack/react-router";
import { CreateBuildPage } from "../features/builds/pages/CreateBuildPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const createBuildRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds/new",
  component: CreateBuildPage,
});
