import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { publicLayoutRoute } from "./publicLayout.route";

const EditBuildPage = lazyRouteComponent(
  () => import("../features/builds/pages/EditBuildPage"),
  "EditBuildPage",
);

export const editBuildRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/my-builds/$buildId/edit",
  component: function EditBuildRoute() {
    const { buildId } = editBuildRoute.useParams();
    return <EditBuildPage buildId={buildId} />;
  },
});
