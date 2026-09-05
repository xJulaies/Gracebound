import { EquipmentSlotFrame } from "../atoms/EquipmentSlotFrame";
import { UiAssetImage, type UiAssetId } from "../atoms/UiAssetImage";
import { EditingBadge } from "../atoms/EditingBadge";

export interface EquipmentSlotProps {
  id: string;
  label: string;
  emptyAssetId: UiAssetId;
  item?: { name: string; iconUrl: string; secondaryIconUrl?: string } | null;
  isActive?: boolean;
  onSelect?: (id: string) => void;
}

export function EquipmentSlot({
  id,
  label,
  emptyAssetId,
  item,
  isActive = false,
  onSelect,
}: EquipmentSlotProps) {
  const accessibleLabel = item
    ? `${label}: ${item.name}. Change selection`
    : `${label}: Empty. Select item`;

  return (
    <button
      aria-label={accessibleLabel}
      aria-current={isActive ? "true" : undefined}
      className={`group relative flex min-w-0 flex-col items-center gap-2 rounded-panel border bg-transparent p-1 transition-colors ${
        isActive ? "border-accent shadow-lg shadow-accent/15" : "border-transparent"
      }`}
      onClick={() => onSelect?.(id)}
      type="button"
    >
      {isActive && <EditingBadge />}
      <EquipmentSlotFrame>
        {item ? (
          <span className="relative size-full">
            <img
              alt=""
              aria-hidden="true"
              className="size-full object-contain transition-transform duration-200 group-hover:scale-105"
              src={item.iconUrl}
            />
            {item.secondaryIconUrl && (
              <img
                alt=""
                aria-hidden="true"
                className="absolute -right-1 -bottom-1 size-[38%] object-contain drop-shadow-md"
                src={item.secondaryIconUrl}
              />
            )}
          </span>
        ) : (
          <UiAssetImage
            assetId={emptyAssetId}
            className="size-full object-contain opacity-55 transition-opacity duration-200 group-hover:opacity-85"
          />
        )}
      </EquipmentSlotFrame>
      <span className="max-w-full text-balance break-words text-center text-xs leading-5 text-foreground-muted group-hover:text-foreground">
        {item?.name ?? label}
      </span>
    </button>
  );
}
