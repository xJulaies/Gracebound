import { createRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../features/legal/pages/PrivacyPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const privacyRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/privacy",
  component: PrivacyPage,
});
