import { createRoute } from "@tanstack/react-router";
import { PublicLayout } from "../app/layouts/public/PublicLayout";
import { rootRoute } from "./root.route";

export const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});
