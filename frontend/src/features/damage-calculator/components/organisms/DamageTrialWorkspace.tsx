import { SignInButton } from "@clerk/react";
import { useState } from "react";
import { ApiError } from "../../../../shared/api/apiClient";
import { useOwnedBuildsQuery } from "../../../builds/hooks/useBuildQueries";
import type { Boss } from "../../../bosses/types/boss.types";
import { DamageTrialEncounter } from "./DamageTrialEncounter";
import { DamageTrialBuildSelector } from "./DamageTrialBuildSelector";
import { DamageTrialBossSelector } from "./DamageTrialBossSelector";
import { CatalogLoadMore } from "../../../../shared/ui/molecules/CatalogLoadMore";

export function DamageTrialWorkspace() {
  const { isAuthLoaded, isSignedIn, query } = useOwnedBuildsQuery();
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [mobileStage, setMobileStage] = useState<"build" | "target" | "attack">("build");
  const builds = query.data?.pages.flatMap((page) => page.data) ?? [];
  const selectedBuild = builds.find(({ id }) => id === selectedBuildId) ?? null;

  if (!isAuthLoaded) {
    return <p className="build-record-message" role="status">Preparing the trial grounds…</p>;
  }

  if (!isSignedIn) {
    return (
      <section className="damage-trial-state text-center" aria-labelledby="damage-trial-sign-in-heading">
        <h2 className="mb-3 text-2xl" id="damage-trial-sign-in-heading">Bring forth a recorded build</h2>
        <p className="mx-auto mb-6 max-w-2xl text-foreground-muted">
          Sign in to load one of your saved builds into the damage trial.
        </p>
        <SignInButton mode="modal">
          <button className="build-primary-action" type="button">Sign in to choose a build</button>
        </SignInButton>
      </section>
    );
  }

  if (query.isPending) {
    return <DamageTrialBuildSkeleton />;
  }

  if (query.isError) {
    const message = query.error instanceof ApiError
      ? query.error.message
      : "Your saved builds could not be recovered.";

    return (
      <div className="damage-trial-state" role="alert">
        <p>{message}</p>
        <button className="build-secondary-action" onClick={() => void query.refetch()} type="button">
          Try again
        </button>
      </div>
    );
  }

  if (builds.length === 0) {
    return (
      <p className="damage-trial-state">
        No saved builds are ready for testing. Forge and save a build first.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6">
      <nav aria-label="Damage trial steps" className="damage-trial-mobile-tabs">
        <MobileStageButton active={mobileStage === "build"} label="Build" onClick={() => setMobileStage("build")} />
        <MobileStageButton active={mobileStage === "target"} disabled={!selectedBuild} label="Target" onClick={() => setMobileStage("target")} />
        <MobileStageButton active={mobileStage === "attack"} disabled={!selectedBuild || !selectedBoss} label="Attack" onClick={() => setMobileStage("attack")} />
      </nav>
      <div className="damage-trial-stage" data-mobile-active={mobileStage === "build"}>
        <DamageTrialBuildSelector
          builds={builds}
          onSelect={(buildId) => {
            setSelectedBuildId(buildId);
            setSelectedBoss(null);
            setMobileStage("target");
          }}
          selectedBuildId={selectedBuildId}
        />
        <CatalogLoadMore
          hasNextPage={Boolean(query.hasNextPage)}
          isFetching={query.isFetchingNextPage}
          label="saved builds"
          onLoadMore={() => void query.fetchNextPage()}
        />
      </div>
      {selectedBuildId && (
        <div className="damage-trial-stage" data-mobile-active={mobileStage === "target"}>
          <DamageTrialBossSelector
            onSelect={(boss) => {
              setSelectedBoss(boss);
              if (boss) setMobileStage("attack");
            }}
            selectedBoss={selectedBoss}
          />
        </div>
      )}
      {selectedBuild && selectedBoss && (
        <div className="damage-trial-stage" data-mobile-active={mobileStage === "attack"}>
          <DamageTrialEncounter
            boss={selectedBoss}
            build={selectedBuild}
            key={`${selectedBuild.id}:${selectedBoss.id}`}
          />
        </div>
      )}
    </div>
  );
}

function MobileStageButton({ active, disabled = false, label, onClick }: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button aria-current={active ? "step" : undefined} disabled={disabled} onClick={onClick} type="button">
      {label}
    </button>
  );
}

function DamageTrialBuildSkeleton() {
  return (
    <div aria-label="Loading your saved builds" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status">
      {[0, 1, 2].map((item) => (
        <div aria-hidden="true" className="min-h-64 animate-pulse rounded-panel border border-border bg-surface" key={item} />
      ))}
    </div>
  );
}
