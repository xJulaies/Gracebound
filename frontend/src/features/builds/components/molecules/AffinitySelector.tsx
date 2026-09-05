import type { WeaponVariant } from "../../../weapons/types/weapon.types";
import { AffinityChip } from "../atoms/AffinityChip";

interface AffinitySelectorProps {
  selectedVariantId: string;
  variants: WeaponVariant[];
  onChange: (variantId: string) => void;
}

export function AffinitySelector({
  selectedVariantId,
  variants,
  onChange,
}: AffinitySelectorProps) {
  return (
    <div>
      <h4 className="mb-2 text-base">Affinity</h4>
      <div aria-label="Armament affinity" className="flex flex-wrap gap-2" role="group">
        {variants.map((variant) => (
          <AffinityChip
            active={variant.id === selectedVariantId}
            key={variant.id}
            onClick={() => onChange(variant.id)}
          >
            {formatAffinity(variant.affinity)}
          </AffinityChip>
        ))}
      </div>
    </div>
  );
}

function formatAffinity(affinity: string) {
  return affinity
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
