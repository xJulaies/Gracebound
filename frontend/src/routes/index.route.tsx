import { createRoute } from "@tanstack/react-router";
import { HomePage } from "../features/home/components/HomePage";
import { rootRoute } from "./root.route";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
