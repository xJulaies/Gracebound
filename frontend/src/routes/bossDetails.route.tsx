import { createRoute } from "@tanstack/react-router";
import { BossDetailsPage } from "../features/bosses/pages/BossDetailsPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const bossDetailsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bosses/$bossId",
  component: function BossDetailsRoute() {
    const { bossId } = bossDetailsRoute.useParams();
    return <BossDetailsPage bossId={bossId} />;
  },
});
