import { CatalogLoadMore } from "../../../../shared/ui/molecules/CatalogLoadMore";
import type { Boss } from "../../types/boss.types";
import { BossCatalogCard } from "../molecules/BossCatalogCard";

export function BossCatalogResults({ bosses, hasNextPage, isError,
  isFetchingNextPage, isPending, onLoadMore }: {
  bosses: Boss[];
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onLoadMore: () => void;
}) {
  if (isPending) return <p role="status">Loading bosses…</p>;
  if (isError) return <p role="alert">Bosses are currently unavailable.</p>;
  if (bosses.length === 0) return <p>No bosses match your search.</p>;

  return (
    <section
      aria-labelledby="boss-results-heading"
      className="mt-0 border-0 bg-transparent p-0"
    >
      <h2 className="mb-4 text-2xl" id="boss-results-heading">Results</h2>
      <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
        {bosses.map((boss) => <li key={boss.id}><BossCatalogCard boss={boss} /></li>)}
      </ul>
      <CatalogLoadMore
        hasNextPage={hasNextPage}
        isFetching={isFetchingNextPage}
        label="bosses"
        onLoadMore={onLoadMore}
      />
    </section>
  );
}
