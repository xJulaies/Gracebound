import { createRoute } from "@tanstack/react-router";
import { ImprintPage } from "../features/legal/pages/ImprintPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const imprintRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/imprint",
  component: ImprintPage,
});
