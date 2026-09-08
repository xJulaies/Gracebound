import { createRoute } from "@tanstack/react-router";
import { PublicBuildDetailsPage } from "../features/builds/pages/PublicBuildDetailsPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const publicBuildDetailsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/builds/$buildId",
  component: function PublicBuildDetailsRoute() {
    const { buildId } = publicBuildDetailsRoute.useParams();
    return <PublicBuildDetailsPage buildId={buildId} />;
  },
});
