import { formatBossLabel } from "../../domain/formatBossLabel";
import {
  BOSS_LOCATION_TYPES,
  BOSS_REGIONS,
  type BossCatalogSearch,
  type BossFilterKey,
  type BossLocationType,
  type BossProgression,
  type BossRank,
  type BossRegion,
} from "../../types/boss.types";

export function BossCatalogFilters({ filters, onChange }: {
  filters: BossCatalogSearch;
  onChange: (key: BossFilterKey, value: BossCatalogSearch[BossFilterKey]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <CatalogSelect
        label="Region"
        onChange={(value) => onChange("region", value as BossRegion || undefined)}
        options={BOSS_REGIONS}
        value={filters.region ?? ""}
      />
      <CatalogSelect
        label="Location type"
        onChange={(value) => onChange(
          "locationType",
          value as BossLocationType || undefined,
        )}
        options={BOSS_LOCATION_TYPES}
        value={filters.locationType ?? ""}
      />
      <CatalogSelect
        label="Boss rank"
        onChange={(value) => onChange("rank", value as BossRank || undefined)}
        options={["major", "minor"]}
        value={filters.rank ?? ""}
      />
      <CatalogSelect
        label="Progression"
        onChange={(value) => onChange(
          "progression",
          value as BossProgression || undefined,
        )}
        options={["required", "route-dependent", "optional"]}
        value={filters.progression ?? ""}
      />
      <RewardFilter
        checked={filters.rewardsGreatRune === true}
        label="Rewards a Great Rune"
        onChange={(checked) => onChange("rewardsGreatRune", checked || undefined)}
      />
      <RewardFilter
        checked={filters.rewardsRemembrance === true}
        label="Rewards a Remembrance"
        onChange={(checked) => onChange("rewardsRemembrance", checked || undefined)}
      />
    </div>
  );
}

function CatalogSelect({ label, onChange, options, value }: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-foreground-muted">
      <span>{label}</span>
      <select
        className="cursor-pointer rounded-panel border border-border bg-background px-3 py-3 text-foreground outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{formatBossLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function RewardFilter({ checked, label, onChange }: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-panel border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors hover:border-accent">
      <input
        checked={checked}
        className="size-4 accent-accent"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}
