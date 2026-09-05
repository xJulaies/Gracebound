import { createRoute } from "@tanstack/react-router";
import { HomePage } from "../features/home/components/HomePage";
import { publicLayoutRoute } from "./publicLayout.route";

export const indexRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});
