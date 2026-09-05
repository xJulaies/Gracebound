import { useAshesOfWarQuery } from "../../../ashes-of-war/hooks/useAshesOfWarQuery";
import type { AshOfWar } from "../../../ashes-of-war/types/ashOfWar.types";

interface AshOfWarFieldProps {
  affinity: string;
  value: string | null;
  weaponType: string;
  onChange: (ashOfWar: AshOfWar | null) => void;
}

export function AshOfWarField({
  affinity,
  value,
  weaponType,
  onChange,
}: AshOfWarFieldProps) {
  const ashesQuery = useAshesOfWarQuery({ affinity, weaponType });

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-3 p-0 text-base font-heading text-foreground">
        Ash of War
      </legend>
      {ashesQuery.isPending && <span aria-live="polite">Loading compatible Ashes…</span>}
      {ashesQuery.isError && (
        <span className="text-danger" role="alert">Compatible Ashes are unavailable.</span>
      )}
      {ashesQuery.data && (
        <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          <button
            aria-pressed={value === null}
            className={selectionClass(value === null)}
            onClick={() => onChange(null)}
            type="button"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-panel border border-border bg-background text-xl text-foreground-muted">
              —
            </span>
            <span>No Ash of War</span>
          </button>
          {ashesQuery.data.data.map((ashOfWar) => (
            <button
              aria-pressed={value === ashOfWar.id}
              className={selectionClass(value === ashOfWar.id)}
              key={ashOfWar.id}
              onClick={() => onChange(ashOfWar)}
              type="button"
            >
              <img
                alt=""
                aria-hidden="true"
                className="size-12 shrink-0 object-contain"
                src={ashOfWar.iconUrl}
              />
              <span className="min-w-0">
                <strong className="block truncate text-foreground">{ashOfWar.name}</strong>
                <span className="block text-xs text-foreground-muted">
                  {ashOfWar.calculationStatus === "supported"
                    ? "Damage supported"
                    : "Catalog only"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {ashesQuery.data?.data.length === 0 && (
        <p className="mt-3 mb-0 text-sm text-foreground-muted">
          No compatible Ashes found for this affinity.
        </p>
      )}
    </fieldset>
  );
}

function selectionClass(active: boolean) {
  return `flex min-w-0 items-center gap-3 rounded-panel border p-3 text-left transition-colors ${
    active
      ? "border-accent bg-accent/10"
      : "border-border bg-surface hover:border-accent"
  }`;
}
