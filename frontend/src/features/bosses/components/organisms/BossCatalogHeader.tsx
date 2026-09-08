import type { BossCatalogSearch, BossFilterKey } from "../../types/boss.types";
import { BossCatalogSearchInput } from "../atoms/BossCatalogSearchInput";
import { BossCatalogFilters } from "../molecules/BossCatalogFilters";

export function BossCatalogHeader({ filters, onFilterChange, onSearchChange }: {
  filters: BossCatalogSearch;
  onFilterChange: (key: BossFilterKey, value: BossCatalogSearch[BossFilterKey]) => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <header className="mb-8 pt-6">
      <h1 className="mb-3 text-3xl sm:text-4xl">Bosses</h1>
      <p className="mb-6 max-w-3xl leading-7 text-foreground-muted">
        Find encounters, compare defenses, and prepare your build for the Lands Between.
      </p>
      <div className="grid gap-5 rounded-panel border border-border bg-surface-elevated p-4 sm:p-5">
        <BossCatalogSearchInput onChange={onSearchChange} value={filters.search} />
        <BossCatalogFilters filters={filters} onChange={onFilterChange} />
      </div>
    </header>
  );
}
