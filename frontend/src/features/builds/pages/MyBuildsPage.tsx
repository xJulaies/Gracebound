import { SignInButton, useAuth, useUser } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { BuildRecordsCollection } from "../components/organisms/BuildRecordsCollection";

export function MyBuildsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <main><p className="build-record-message" role="status">Opening the archive…</p></main>;
  }

  if (!isSignedIn) {
    return (
      <main>
        <section className="tarnished-records-hero text-center" aria-labelledby="records-sign-in-heading">
          <h1 className="mb-3 text-3xl sm:text-4xl" id="records-sign-in-heading">Tarnished Records</h1>
          <p className="mx-auto mb-6 max-w-2xl text-foreground-muted">
            Sign in to recover private builds and manage the records you have shared.
          </p>
          <SignInButton mode="modal">
            <button className="build-primary-action" type="button">Sign in to the archive</button>
          </SignInButton>
        </section>
      </main>
    );
  }

  return (
    <main className="grid gap-8">
      <header className="tarnished-records-hero">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm text-foreground-muted">
              {user?.firstName ? `${user.firstName}’s archive` : "Your personal archive"}
            </p>
            <h1 className="mb-3 text-3xl sm:text-5xl">Tarnished Records</h1>
            <p className="mb-0 max-w-2xl leading-7 text-foreground-muted">
              Return to past creations, preserve private experiments, and choose which builds enter the public record.
            </p>
          </div>
          <Link className="build-primary-action" to="/builds/new">Forge a new build</Link>
        </div>
      </header>
      <BuildRecordsCollection />
    </main>
  );
}
