import { createRoute } from "@tanstack/react-router";
import { EditBuildPage } from "../features/builds/pages/EditBuildPage";
import { publicLayoutRoute } from "./publicLayout.route";

export const editBuildRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/my-builds/$buildId/edit",
  component: function EditBuildRoute() {
    const { buildId } = editBuildRoute.useParams();
    return <EditBuildPage buildId={buildId} />;
  },
});
