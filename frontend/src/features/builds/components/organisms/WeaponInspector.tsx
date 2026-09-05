import type { EquippedWeapon } from "../../types/editor.types";
import { AffinitySelector } from "../molecules/AffinitySelector";
import { AshOfWarField } from "../molecules/AshOfWarField";
import { SelectedWeaponSummary } from "../molecules/SelectedWeaponSummary";
import { UpgradeControl } from "../molecules/UpgradeControl";

interface WeaponInspectorProps {
  configuration: EquippedWeapon;
  slotLabel: string;
  onChange: (configuration: EquippedWeapon) => void;
  onChangeWeapon: () => void;
  onClose: () => void;
  onRemove: () => void;
}

export function WeaponInspector({
  configuration,
  slotLabel,
  onChange,
  onChangeWeapon,
  onClose,
  onRemove,
}: WeaponInspectorProps) {
  const { weapon } = configuration;
  const selectedVariant = weapon.variants.find(
    ({ id }) => id === configuration.variantId,
  ) ?? weapon.variants[0];

  if (!selectedVariant) return null;

  const setVariant = (variantId: string) => {
    const variant = weapon.variants.find(({ id }) => id === variantId);
    if (!variant) return;
    onChange({
      ...configuration,
      variantId,
      upgradeLevel: Math.min(configuration.upgradeLevel, variant.maxUpgradeLevel),
      ashOfWarId: null,
      ashOfWar: null,
    });
  };

  return (
    <section
      aria-labelledby="weapon-inspector-heading"
      className="weapon-inspector mt-6"
    >
      <header className="flex flex-col gap-5 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <SelectedWeaponSummary configuration={configuration} slotLabel={slotLabel} />
        <div className="flex flex-wrap gap-2">
          <button className="build-secondary-action" onClick={onChangeWeapon} type="button">
            Change armament
          </button>
          <button className="build-secondary-action" onClick={onRemove} type="button">
            Remove
          </button>
        </div>
      </header>

      <div className="grid gap-6 pt-6 lg:grid-cols-2">
        <section className="rounded-panel border border-border bg-background/40 p-4">
          <UpgradeControl
            max={selectedVariant.maxUpgradeLevel}
            onChange={(upgradeLevel) => onChange({ ...configuration, upgradeLevel })}
            value={configuration.upgradeLevel}
          />
        </section>

        <section className="rounded-panel border border-border bg-background/40 p-4">
          {weapon.canChangeAffinity ? (
            <AffinitySelector
              onChange={setVariant}
              selectedVariantId={selectedVariant.id}
              variants={weapon.variants}
            />
          ) : (
            <div>
              <h4 className="mb-2 text-base">Affinity</h4>
              <p className="mb-0 text-foreground-muted">
                Fixed: {formatLabel(selectedVariant.affinity)}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-panel border border-border bg-background/40 p-4 lg:col-span-2">
          {weapon.canChangeAffinity && weapon.weaponType ? (
            <AshOfWarField
              affinity={selectedVariant.affinity}
              onChange={(ashOfWar) => onChange({
                ...configuration,
                ashOfWarId: ashOfWar?.id ?? null,
                ashOfWar: ashOfWar
                  ? {
                      id: ashOfWar.id,
                      name: ashOfWar.name,
                      iconUrl: ashOfWar.iconUrl,
                    }
                  : null,
              })}
              value={configuration.ashOfWarId}
              weaponType={weapon.weaponType}
            />
          ) : weapon.canChangeAffinity ? (
            <div>
              <h4 className="mb-2 text-base">Ash of War</h4>
              <p className="mb-0 text-sm text-foreground-muted">
                Unavailable because this armament has no verified type.
              </p>
            </div>
          ) : (
            <div>
              <h4 className="mb-2 text-base">Fixed skill</h4>
              <p className="mb-0 text-foreground">
                {weapon.skills.map(({ name }) => name).join(", ") || "No skill available"}
              </p>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-6 flex justify-end border-t border-border pt-5">
        <button className="build-primary-action" onClick={onClose} type="button">
          Set changes
        </button>
      </footer>
    </section>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
