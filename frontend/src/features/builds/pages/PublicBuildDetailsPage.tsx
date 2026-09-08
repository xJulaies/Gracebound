import { Link } from "@tanstack/react-router";
import { ApiError } from "../../../shared/api/apiClient";
import { CopyPublicBuildAction } from "../components/molecules/CopyPublicBuildAction";
import { PublicBuildDetails } from "../components/organisms/PublicBuildDetails";
import { usePublicBuildEditorQuery } from "../hooks/useBuildQueries";

export function PublicBuildDetailsPage({ buildId }: { buildId: string }) {
  const { buildQuery, editorQuery } = usePublicBuildEditorQuery(buildId);
  const build = buildQuery.data?.data[0];

  if (buildQuery.isPending || (!buildQuery.isError && editorQuery.isPending)) {
    return <BuildDetailsMessage message="Opening the record…" />;
  }

  const error = buildQuery.error ?? editorQuery.error;
  if (error || !build || !editorQuery.data) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <main className="app-shell">
        <section className="build-editor-access">
          <h1 className="mb-3 text-3xl sm:text-4xl">{missing ? "Build not found" : "Build unavailable"}</h1>
          <p className="mb-6 text-foreground-muted">
            {missing ? "This build is private or no longer exists." : "Its saved equipment could not be restored."}
          </p>
          <Link className="build-secondary-action" to="/builds">Back to public builds</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pt-6">
        <Link className="build-secondary-action" to="/builds">Back to builds</Link>
        <CopyPublicBuildAction build={build} />
      </div>
      <PublicBuildDetails build={build} editor={editorQuery.data} />
    </main>
  );
}

function BuildDetailsMessage({ message }: { message: string }) {
  return <main className="app-shell"><section aria-live="polite" className="build-editor-access"><p>{message}</p></section></main>;
}
