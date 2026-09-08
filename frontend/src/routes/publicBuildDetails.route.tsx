import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

const PublicBuildDetailsPage = lazyRouteComponent(
  () => import("../features/builds/pages/PublicBuildDetailsPage"),
  "PublicBuildDetailsPage",
);

export const publicBuildDetailsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds/$buildId",
  component: function PublicBuildDetailsRoute() {
    const { buildId } = publicBuildDetailsRoute.useParams();
    return <PublicBuildDetailsPage buildId={buildId} />;
  },
});
