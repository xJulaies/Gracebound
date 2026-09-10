import type { WeaponImportReport } from "../../../features/weapons/domain/weaponCatalog.types";

const EXPECTED_WEAPON_COUNTS: Record<
  string,
  { canonicalWeapons: number; calculationVariants: number }
> = {
  "1.17.0": { canonicalWeapons: 487, calculationVariants: 3343 },
};

export function validateWeaponCatalogVersion(
  gameVersion: string,
  report: Pick<
    WeaponImportReport,
    "canonicalWeapons" | "calculationVariants"
  >,
) {
  const expected = EXPECTED_WEAPON_COUNTS[gameVersion];
  if (!expected) return;

  if (
    report.canonicalWeapons !== expected.canonicalWeapons ||
    report.calculationVariants !== expected.calculationVariants
  ) {
    throw new Error(
      `Incomplete weapon catalog for ${gameVersion}: expected ${expected.canonicalWeapons} weapons and ${expected.calculationVariants} variants, mapped ${report.canonicalWeapons} weapons and ${report.calculationVariants} variants`,
    );
  }
}
