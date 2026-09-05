import { createRoute, Navigate } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

export const weaponsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/weapons",
  component: function LegacyWeaponsRedirect() {
    return (
      <Navigate
        replace
        search={{ category: "armaments", search: "" }}
        to="/equipment"
      />
    );
  },
});
