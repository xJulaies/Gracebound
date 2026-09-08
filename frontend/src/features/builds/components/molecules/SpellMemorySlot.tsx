import { EquipmentSlotFrame } from "../atoms/EquipmentSlotFrame";
import { UiAssetImage } from "../atoms/UiAssetImage";
import type { Spell } from "../../../spells/types/spell.types";
import { EquippedItemPreview } from "./EquippedItemPreview";
import { useId, useRef, useState } from "react";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { getUnmetAttributeRequirements } from "../../../../shared/domain/attributeRequirements";

export function SpellMemorySlot({
  index,
  isActive = false,
  onSelect,
  spell,
  currentStats = null,
}: {
  index: number;
  isActive?: boolean;
  onSelect?: (index: number) => void;
  spell?: Spell;
  currentStats?: CharacterStats | null;
}) {
  const previewId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const missingRequirements = spell && currentStats
    ? getUnmetAttributeRequirements(spell.requirements, currentStats)
    : [];
  const label = `Spell slot ${index}`;
  const accessibleLabel = spell
    ? `${label}: ${spell.name}. Select spell`
    : `${label}: Empty. Select spell`;

  return (
    <button
      aria-describedby={spell && isPreviewVisible ? previewId : undefined}
      aria-label={accessibleLabel}
      aria-current={isActive ? "true" : undefined}
      className={`group relative flex min-w-0 flex-col items-center gap-1 rounded-panel border bg-transparent p-0.5 transition-colors ${
        isActive ? "border-accent shadow-lg shadow-accent/15" : "border-transparent"
      }`}
      onClick={() => onSelect?.(index)}
      onBlur={() => setIsPreviewVisible(false)}
      onFocus={() => setIsPreviewVisible(true)}
      onMouseEnter={() => setIsPreviewVisible(true)}
      onMouseLeave={() => setIsPreviewVisible(false)}
      ref={buttonRef}
      type="button"
    >
      <EquipmentSlotFrame>
        {spell ? (
          <img alt="" aria-hidden="true" className="size-full object-contain" src={spell.iconUrl} />
        ) : (
          <UiAssetImage
            assetId="slot-base"
            className="size-full object-contain opacity-55"
          />
        )}
      </EquipmentSlotFrame>
      <span className="max-w-full text-balance break-words text-center text-[0.6875rem] leading-4 text-foreground-muted group-hover:text-foreground">
        {spell?.name ?? label}
      </span>
      {spell && (
        <EquippedItemPreview
          anchorRef={buttonRef}
          category={spell.type === "sorcery" ? "Sorcery" : "Incantation"}
          iconUrl={spell.iconUrl}
          id={previewId}
          lines={[
            `${spell.fpCost} FP · ${spell.slotsRequired} ${spell.slotsRequired === 1 ? "memory slot" : "memory slots"}`,
            spell.summary ?? "Open the spell picker for full details.",
            ...missingRequirements.map(({ attribute, current, required }) =>
              `Requires ${formatAttribute(attribute)} ${required} · current ${current}`),
          ]}
          name={spell.name}
          visible={isPreviewVisible}
        />
      )}
    </button>
  );
}

function formatAttribute(attribute: keyof CharacterStats) {
  return attribute[0].toUpperCase() + attribute.slice(1);
}
