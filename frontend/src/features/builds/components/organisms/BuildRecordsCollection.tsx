import { useState } from "react";
import { ApiError } from "../../../../shared/api/apiClient";
import {
  useDeleteBuildMutation,
  useDuplicateBuildMutation,
} from "../../hooks/useBuildRecordActions";
import { useOwnedBuildsQuery } from "../../hooks/useBuildQueries";
import type { Build } from "../../types/build.types";
import {
  BuildRecordFilter,
  type BuildRecordVisibility,
} from "../molecules/BuildRecordFilter";
import { BuildRecordCard } from "../molecules/BuildRecordCard";
import { DeleteBuildDialog } from "./DeleteBuildDialog";

export function BuildRecordsCollection() {
  const { query } = useOwnedBuildsQuery();
  const duplicateBuild = useDuplicateBuildMutation();
  const deleteBuild = useDeleteBuildMutation();
  const [visibility, setVisibility] = useState<BuildRecordVisibility>("all");
  const [pendingDeletion, setPendingDeletion] = useState<Build | null>(null);
  const builds = query.data?.data ?? [];
  const visibleBuilds = visibility === "all"
    ? builds
    : builds.filter((build) => build.visibility === visibility);
  const actionError = duplicateBuild.error ?? deleteBuild.error;

  return (
    <section aria-labelledby="records-collection-heading" className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mb-2 text-2xl" id="records-collection-heading">Recorded builds</h2>
          <p className="mb-0 text-sm text-foreground-muted">
            Private records remain yours alone. Public records appear in the community archive.
          </p>
        </div>
        <BuildRecordFilter onChange={setVisibility} value={visibility} />
      </div>

      {query.isPending && <BuildRecordsSkeleton />}
      {query.isError && (
        <div className="build-record-message" role="alert">
          <p>Your records could not be recovered.</p>
          <button className="build-secondary-action" onClick={() => void query.refetch()} type="button">
            Try again
          </button>
        </div>
      )}
      {actionError && (
        <p className="build-record-message text-danger" role="alert">
          {actionError instanceof ApiError ? actionError.message : "The record could not be changed."}
        </p>
      )}
      {query.data && builds.length === 0 && (
        <p className="build-record-message">No records yet. Forge your first build to begin this archive.</p>
      )}
      {query.data && builds.length > 0 && visibleBuilds.length === 0 && (
        <p className="build-record-message">No {visibility} builds match this archive view.</p>
      )}
      {visibleBuilds.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleBuilds.map((build) => (
            <BuildRecordCard
              build={build}
              isDeleting={deleteBuild.isPending && deleteBuild.variables === build.id}
              isDuplicating={duplicateBuild.isPending && duplicateBuild.variables?.id === build.id}
              key={build.id}
              onDelete={() => setPendingDeletion(build)}
              onDuplicate={() => duplicateBuild.mutate(build)}
            />
          ))}
        </div>
      )}

      {pendingDeletion && (
        <DeleteBuildDialog
          buildName={pendingDeletion.name}
          isDeleting={deleteBuild.isPending}
          onCancel={() => {
            if (!deleteBuild.isPending) setPendingDeletion(null);
          }}
          onConfirm={() => deleteBuild.mutate(pendingDeletion.id, {
            onSuccess: () => setPendingDeletion(null),
          })}
        />
      )}
    </section>
  );
}

function BuildRecordsSkeleton() {
  return (
    <div aria-label="Loading your build records" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status">
      {[0, 1, 2].map((item) => (
        <div aria-hidden="true" className="min-h-72 animate-pulse rounded-panel border border-border bg-surface" key={item} />
      ))}
    </div>
  );
}
