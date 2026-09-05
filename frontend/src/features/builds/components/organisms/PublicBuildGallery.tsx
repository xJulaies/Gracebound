import { usePublicBuildsQuery } from "../../hooks/useBuildQueries";
import { PublicBuildCard } from "../molecules/PublicBuildCard";

export function PublicBuildGallery() {
  const buildsQuery = usePublicBuildsQuery();

  return (
    <section aria-labelledby="public-builds-heading" className="build-gallery">
      <div className="mb-6 max-w-2xl">
        <h2 className="mb-2 text-2xl sm:text-3xl" id="public-builds-heading">
          Explore public builds
        </h2>
        <p className="mb-0 text-foreground-muted">
          Discover approaches shared by other Tarnished.
        </p>
      </div>

      {buildsQuery.isPending && <BuildGallerySkeleton />}

      {buildsQuery.isError && (
        <div role="alert">
          <p>Public builds are currently unavailable.</p>
          <button onClick={() => void buildsQuery.refetch()} type="button">
            Try again
          </button>
        </div>
      )}

      {buildsQuery.data?.data.length === 0 && (
        <p className="rounded-panel border border-border bg-background/45 p-5 text-foreground-muted">
          No public builds have been shared yet.
        </p>
      )}

      {buildsQuery.data && buildsQuery.data.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buildsQuery.data.data.map((build) => (
            <PublicBuildCard build={build} key={build.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function BuildGallerySkeleton() {
  return (
    <div aria-label="Loading public builds" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status">
      {[0, 1, 2].map((item) => (
        <div
          aria-hidden="true"
          className="min-h-56 animate-pulse rounded-panel border border-border bg-background/45"
          key={item}
        />
      ))}
    </div>
  );
}
