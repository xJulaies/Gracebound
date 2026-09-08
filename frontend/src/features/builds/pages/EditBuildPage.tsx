import { Link } from "@tanstack/react-router";
import { SignInButton } from "@clerk/react";
import { ApiError } from "../../../shared/api/apiClient";
import { BuildEditorWorkspace } from "../components/organisms/BuildEditorWorkspace";
import { useOwnedBuildEditorQuery } from "../hooks/useBuildQueries";

export function EditBuildPage({ buildId }: { buildId: string }) {
  const { isAuthLoaded, isSignedIn, buildQuery, editorQuery } = useOwnedBuildEditorQuery(buildId);

  if (!isAuthLoaded) {
    return <EditBuildMessage message="Restoring your Tarnished Record…" />;
  }

  if (!isSignedIn) {
    return (
      <main className="app-shell">
        <section className="build-editor-access">
          <h1 className="mb-3 text-3xl sm:text-4xl">Sign in to edit this build</h1>
          <p className="mb-6 text-foreground-muted">Only the owner can open this Tarnished Record for editing.</p>
          <SignInButton mode="modal">
            <button className="build-primary-action" type="button">Sign in with Clerk</button>
          </SignInButton>
        </section>
      </main>
    );
  }


  if (buildQuery.isPending || (!buildQuery.isError && editorQuery.isPending)) {
    return <EditBuildMessage message="Restoring your Tarnished Record…" />;
  }

  const error = buildQuery.error ?? editorQuery.error;
  if (error || !editorQuery.data) {
    const unavailable = error instanceof ApiError && error.status === 404;
    return (
      <main className="app-shell">
        <section className="build-editor-access">
          <h1 className="mb-3 text-3xl sm:text-4xl">
            {unavailable ? "Tarnished Record not found" : "Build could not be restored"}
          </h1>
          <p className="mb-6 text-foreground-muted">
            {unavailable
              ? "This record does not exist or belongs to another account."
              : error instanceof Error ? error.message : "Please try again."}
          </p>
          <Link className="build-secondary-action" to="/my-builds">Back to Tarnished Records</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="mb-8 pt-6 text-center">
        <h1 className="mb-3 text-3xl sm:text-4xl">Edit Tarnished Record</h1>
        <p className="mx-auto mb-0 max-w-2xl text-foreground-muted">
          Continue shaping {editorQuery.data.draft.name}.
        </p>
      </header>
      <BuildEditorWorkspace
        initialBuildId={buildId}
        initialState={editorQuery.data}
      />
    </main>
  );
}

function EditBuildMessage({ message }: { message: string }) {
  return (
    <main className="app-shell">
      <section aria-live="polite" className="build-editor-access">
        <p className="mb-0 text-foreground-muted">{message}</p>
      </section>
    </main>
  );
}
