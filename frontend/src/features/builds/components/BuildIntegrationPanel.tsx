import type { Build } from "../types/build.types";
import {
  useOwnedBuildsQuery,
  usePublicBuildsQuery,
} from "../hooks/useBuildQueries";

interface BuildListProps {
  builds: Build[];
  emptyMessage: string;
}

function BuildList({ builds, emptyMessage }: BuildListProps) {
  if (builds.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <ul>
      {builds.map((build) => (
        <li key={build.id}>
          {build.name} · Level {build.level} · {build.visibility}
        </li>
      ))}
    </ul>
  );
}

export function BuildIntegrationPanel() {
  const publicBuilds = usePublicBuildsQuery();
  const ownedBuilds = useOwnedBuildsQuery();

  return (
    <section aria-labelledby="build-integration-heading">
      <h2 id="build-integration-heading">Build API</h2>

      <article>
        <h3>Public builds</h3>
        {publicBuilds.isPending && <p>Loading public builds…</p>}
        {publicBuilds.isError && <p role="alert">Public builds unavailable.</p>}
        {publicBuilds.data && (
          <BuildList
            builds={publicBuilds.data.data}
            emptyMessage="No public builds found."
          />
        )}
      </article>

      <article>
        <h3>My builds</h3>
        {!ownedBuilds.isAuthLoaded && <p>Loading authentication…</p>}
        {ownedBuilds.isAuthLoaded && !ownedBuilds.isSignedIn && (
          <p>Sign in to verify the protected build endpoint.</p>
        )}
        {ownedBuilds.query.isPending && ownedBuilds.isSignedIn && (
          <p>Loading your builds…</p>
        )}
        {ownedBuilds.query.isError && ownedBuilds.isSignedIn && (
          <p role="alert">Your builds are unavailable.</p>
        )}
        {ownedBuilds.query.data && ownedBuilds.isSignedIn && (
          <BuildList
            builds={ownedBuilds.query.data.data}
            emptyMessage="No owned builds found."
          />
        )}
      </article>
    </section>
  );
}
