import type { ReactNode } from "react";
import { UiAssetImage } from "./UiAssetImage";

export function EquipmentSlotFrame({ children }: { children: ReactNode }) {
  return (
    <span className="relative grid aspect-square w-full place-items-center overflow-hidden">
      <UiAssetImage
        assetId="slot-base"
        className="pointer-events-none absolute inset-0 size-full object-contain opacity-90"
      />
      <span className="relative z-10 grid size-[68%] place-items-center">
        {children}
      </span>
    </span>
  );
}
