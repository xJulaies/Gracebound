import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

const BossDetailsPage = lazyRouteComponent(
  () => import("../features/bosses/pages/BossDetailsPage"),
  "BossDetailsPage",
);

export const bossDetailsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bosses/$bossId",
  component: function BossDetailsRoute() {
    const { bossId } = bossDetailsRoute.useParams();
    return <BossDetailsPage bossId={bossId} />;
  },
});
