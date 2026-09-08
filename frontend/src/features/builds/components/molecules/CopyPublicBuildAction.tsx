import { SignInButton, useAuth } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import type { Build } from "../../types/build.types";
import { useDuplicateBuildMutation } from "../../hooks/useBuildRecordActions";

export function CopyPublicBuildAction({ build }: { build: Build }) {
  const { isLoaded, isSignedIn } = useAuth();
  const duplicate = useDuplicateBuildMutation();
  const navigate = useNavigate();

  if (!isLoaded) {
    return <p aria-live="polite" className="mb-0 text-sm text-foreground-muted">Checking account…</p>;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="build-primary-action" type="button">Sign in to copy</button>
      </SignInButton>
    );
  }

  return (
    <div>
      <button
        className="build-primary-action"
        disabled={duplicate.isPending}
        onClick={() => duplicate.mutate(build, {
          onSuccess: () => void navigate({ to: "/my-builds" }),
        })}
        type="button"
      >
        {duplicate.isPending ? "Copying…" : "Copy to Tarnished Records"}
      </button>
      {duplicate.isError && <p className="mt-2 mb-0 text-sm text-danger" role="alert">The build could not be copied.</p>}
    </div>
  );
}
