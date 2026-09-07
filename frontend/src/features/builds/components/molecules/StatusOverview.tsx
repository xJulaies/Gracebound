import type { BuildStatsPreview } from "../../types/build.types";
import { BuildStat } from "../atoms/BuildStat";

export function StatusOverview({ preview }: { preview: BuildStatsPreview }) {
  return (
    <dl aria-label="Character overview" className="mb-5 grid grid-cols-2 gap-2">
      <BuildStat label="Level" value={preview.characterLevel} />
      <BuildStat label="Load" value={formatLabel(preview.equipmentLoad.category)} />
      <BuildStat label="HP" value={preview.resources.maxHp} />
      <BuildStat label="FP" value={preview.resources.maxFp} />
      <BuildStat label="Stamina" value={preview.resources.maxStamina} />
      <BuildStat label="Poise" value={preview.armorStats.poise} />
    </dl>
  );
}

function formatLabel(value: string) {
  return value[0]?.toUpperCase() + value.slice(1);
}
