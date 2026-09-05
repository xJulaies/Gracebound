import { useCallback, useState } from "react";
import type { EquipmentCatalogGroup } from "../../types/equipmentCatalog.types";
import type { EquipmentCatalogItem } from "../../types/equipmentCatalog.types";
import { EquipmentCatalogCard } from "../molecules/EquipmentCatalogCard";
import { EquipmentCatalogLoadMore } from "../molecules/EquipmentCatalogLoadMore";
import { EquipmentDetailsDialog } from "./EquipmentDetailsDialog";

export function EquipmentCatalogResults({
  groups,
}: {
  groups: EquipmentCatalogGroup[];
}) {
  const [selectedItem, setSelectedItem] = useState<EquipmentCatalogItem | null>(null);
  const closeDetails = useCallback(() => setSelectedItem(null), []);

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <section aria-labelledby={`${group.category}-results-heading`} key={group.category}>
          <h2 className="mb-4 text-2xl" id={`${group.category}-results-heading`}>
            {group.label}
          </h2>
          {group.isPending && <p aria-live="polite">Loading {group.label.toLowerCase()}…</p>}
          {group.isError && (
            <p role="alert">
              {group.label} {group.category === "armor" ? "is" : "are"} currently unavailable.
            </p>
          )}
          {!group.isPending && !group.isError && group.items.length === 0 && (
            <p>No {group.label.toLowerCase()} match your search.</p>
          )}
          {!group.isPending && !group.isError && group.items.length > 0 && (
            <>
              <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <li className="min-w-0" key={`${item.category}-${item.id}`}>
                    <EquipmentCatalogCard item={item} onOpen={setSelectedItem} />
                  </li>
                ))}
              </ul>
              <EquipmentCatalogLoadMore
                hasNextPage={group.hasNextPage}
                isFetching={group.isFetchingNextPage}
                label={group.label}
                onLoadMore={group.loadMore}
              />
            </>
          )}
        </section>
      ))}
      {selectedItem && (
        <EquipmentDetailsDialog item={selectedItem} onClose={closeDetails} />
      )}
    </div>
  );
}
