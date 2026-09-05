import { useRef } from "react";
import { ArmorStatsGrid } from "../../../armor/components/molecules/ArmorStatsGrid";
import { TalismanDetailsContent } from "../../../talismans/components/molecules/TalismanDetailsContent";
import { WeaponDetailsContent } from "../../../weapons/components/molecules/WeaponDetailsContent";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import type { EquipmentCatalogItem } from "../../types/equipmentCatalog.types";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";

export function EquipmentDetailsDialog({
  item,
  onClose,
}: {
  item: EquipmentCatalogItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: closeButtonRef, onClose });

  return (
    <div className="fixed inset-0 z-50 bg-background/75" role="presentation">
      <button
        aria-label="Close equipment details"
        className="absolute inset-0 cursor-default rounded-none border-0 bg-transparent"
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={`${item.name} details dialog`}
        aria-modal="true"
        className="relative z-10 flex h-full w-full justify-center lg:items-center lg:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <ItemDetailsPreview
          description={item.description ?? item.summary}
          closeButtonRef={closeButtonRef}
          iconUrl={item.iconUrl}
          onClose={onClose}
          subtitle={item.metadata.join(" · ")}
          title={item.name}
        >
          <EquipmentDetailsContent item={item} />
        </ItemDetailsPreview>
      </div>
    </div>
  );
}

function EquipmentDetailsContent({ item }: { item: EquipmentCatalogItem }) {
  switch (item.category) {
    case "armaments":
      return <WeaponDetailsContent weapon={item.source} />;
    case "armor":
      return <ArmorStatsGrid armor={item.source} />;
    case "talismans":
      return <TalismanDetailsContent talisman={item.source} />;
  }
}
