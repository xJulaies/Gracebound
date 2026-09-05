import { useCallback, useState } from "react";
import { CatalogLoadMore } from "../../../../shared/ui/molecules/CatalogLoadMore";
import type { Spell } from "../../types/spell.types";
import { SpellCatalogCard } from "../molecules/SpellCatalogCard";
import { SpellDetailsDialog } from "./SpellDetailsDialog";

export function SpellCatalogResults({
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  spells,
}: {
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onLoadMore: () => void;
  spells: Spell[];
}) {
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const closeDetails = useCallback(() => setSelectedSpell(null), []);

  if (isPending) return <p role="status">Loading spells…</p>;
  if (isError) return <p role="alert">Spells are currently unavailable.</p>;
  if (spells.length === 0) return <p>No spells match your search.</p>;

  return (
    <section
      aria-labelledby="spell-results-heading"
      className="mt-0 border-0 bg-transparent p-0"
    >
      <h2 className="mb-4 text-2xl" id="spell-results-heading">Results</h2>
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {spells.map((spell) => (
          <li className="min-w-0" key={spell.id}>
            <SpellCatalogCard onOpen={setSelectedSpell} spell={spell} />
          </li>
        ))}
      </ul>
      <CatalogLoadMore
        hasNextPage={hasNextPage}
        isFetching={isFetchingNextPage}
        label="spells"
        onLoadMore={onLoadMore}
      />
      {selectedSpell && (
        <SpellDetailsDialog onClose={closeDetails} spell={selectedSpell} />
      )}
    </section>
  );
}
