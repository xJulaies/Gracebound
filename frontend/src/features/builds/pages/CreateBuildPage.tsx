import { SignInButton, useAuth } from "@clerk/react";
import { BuildEditorWorkspace } from "../components/organisms/BuildEditorWorkspace";

export function CreateBuildPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main className="app-shell">
        <section aria-live="polite">
          <p className="mb-0 text-foreground-muted">Loading account…</p>
        </section>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="app-shell">
        <section
          aria-labelledby="build-sign-in-heading"
          className="build-editor-access"
        >
          <h1 className="mb-3 text-3xl sm:text-4xl" id="build-sign-in-heading">
            Sign in to create a build
          </h1>
          <p className="mb-6 max-w-2xl leading-7 text-foreground-muted">
            Your builds are connected to your Gracebound account so you can
            return to them and decide whether they remain private or become
            publicly visible.
          </p>
          <SignInButton mode="modal">
            <button className="build-primary-action" type="button">
              Sign in with Clerk
            </button>
          </SignInButton>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="mb-8 pt-6 text-center">
        <h1 className="mb-3 text-3xl sm:text-4xl">Start a new build</h1>
        <p className="mx-auto mb-0 max-w-2xl text-foreground-muted">
          Begin with your character&apos;s origin. Attributes and equipment follow
          after the class has been confirmed.
        </p>
      </header>
      <BuildEditorWorkspace />
    </main>
  );
}
