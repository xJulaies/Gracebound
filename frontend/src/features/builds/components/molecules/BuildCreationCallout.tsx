import { SignInButton, useAuth } from "@clerk/react";
import { Link } from "@tanstack/react-router";

export function BuildCreationCallout() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <section
      aria-labelledby="build-creation-heading"
      className="build-creation-callout"
    >
      <div className="max-w-2xl">
        <h1 className="mb-3 text-3xl sm:text-4xl" id="build-creation-heading">
          Create your own build
        </h1>
        <p className="mb-0 leading-7 text-foreground-muted">
          Choose a starting class, shape your attributes, and prepare equipment
          for the challenges ahead.
        </p>
      </div>

      {!isLoaded && (
        <p className="mb-0 text-foreground-muted" role="status">Loading account…</p>
      )}

      {isLoaded && !isSignedIn && (
        <SignInButton mode="modal">
          <button className="build-primary-action" type="button">
            Sign in to start building
          </button>
        </SignInButton>
      )}

      {isLoaded && isSignedIn && (
        <Link className="build-primary-action" to="/builds/new">
          Start building
        </Link>
      )}
    </section>
  );
}
