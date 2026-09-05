import { API_URL } from "../../../../shared/config/environment";

export type UiAssetId =
  | "slot-base"
  | "left-weapon-slot"
  | "right-weapon-slot"
  | "talisman-slot"
  | "armor-category"
  | "equipment-category"
  | "crystal-tear-category";

export function UiAssetImage({
  assetId,
  alt = "",
  className = "",
}: {
  assetId: UiAssetId;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      alt={alt}
      aria-hidden={alt.length === 0}
      className={className}
      draggable={false}
      src={`${API_URL}/assets/ui/${assetId}`}
    />
  );
}
