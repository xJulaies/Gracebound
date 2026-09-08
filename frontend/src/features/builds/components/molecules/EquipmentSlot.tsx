import { EquipmentSlotFrame } from "../atoms/EquipmentSlotFrame";
import { UiAssetImage, type UiAssetId } from "../atoms/UiAssetImage";
import { EquippedItemPreview } from "./EquippedItemPreview";
import { useId, useRef, useState } from "react";

export interface EquipmentSlotProps {
  id: string;
  label: string;
  emptyAssetId: UiAssetId;
  item?: {
    name: string;
    iconUrl: string;
    secondaryIconUrl?: string;
    previewCategory?: string;
    previewLines?: string[];
  } | null;
  isActive?: boolean;
  onSelect?: (id: string) => void;
  occupiedActionLabel?: string;
  statusBadge?: string;
}

export function EquipmentSlot({
  id,
  label,
  emptyAssetId,
  item,
  isActive = false,
  onSelect,
  occupiedActionLabel = "Change selection",
  statusBadge,
}: EquipmentSlotProps) {
  const previewId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const selectionLabel = item
    ? `${label}: ${item.name}. ${occupiedActionLabel}`
    : `${label}: Empty. Select item`;
  const accessibleLabel = statusBadge
    ? `${selectionLabel}. ${statusBadge} active`
    : selectionLabel;

  return (
    <button
      aria-describedby={item && isPreviewVisible ? previewId : undefined}
      aria-label={accessibleLabel}
      aria-current={isActive ? "true" : undefined}
      className={`group relative flex min-w-0 flex-col items-center gap-2 rounded-panel border bg-transparent p-1 transition-colors ${
        isActive ? "border-accent shadow-lg shadow-accent/15" : "border-transparent"
      }`}
      onClick={() => onSelect?.(id)}
      onBlur={() => setIsPreviewVisible(false)}
      onFocus={() => setIsPreviewVisible(true)}
      onMouseEnter={() => setIsPreviewVisible(true)}
      onMouseLeave={() => setIsPreviewVisible(false)}
      ref={buttonRef}
      type="button"
    >
      {statusBadge && (
        <span className="absolute top-1 left-1 z-20 rounded-full border border-accent bg-background/90 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-accent">
          {statusBadge}
        </span>
      )}
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
      {item && (
        <EquippedItemPreview
          anchorRef={buttonRef}
          category={item.previewCategory ?? label}
          iconUrl={item.iconUrl}
          id={previewId}
          lines={item.previewLines ?? []}
          name={item.name}
          visible={isPreviewVisible}
        />
      )}
    </button>
  );
}
