import type { AshOfWarRecord } from "../models/ashOfWar.model";

export function mapAshOfWarResponse(record: AshOfWarRecord) {
  const attacks = [
    ...(record.skill?.attacks ?? []),
    ...record.skillVariants.flatMap(({ skill }) => skill.attacks),
  ].filter(
    (attack, index, all) => all.findIndex(({ id }) => id === attack.id) === index,
  );

  return {
    id: record.id,
    name: record.name,
    iconId: record.iconId,
    compatibleWeaponTypes: [...record.compatibleWeaponTypes],
    compatibleAffinities: [...record.compatibleAffinities],
    calculationStatus: record.calculationStatus,
    attacks: attacks.map(({ id, name, fpCost }) => ({ id, name, fpCost })),
    gameVersion: record.gameVersion,
  };
}
