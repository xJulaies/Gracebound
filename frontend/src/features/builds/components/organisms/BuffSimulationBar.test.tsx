import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Spell } from "../../../spells/types/spell.types";
import { BuffSimulationBar } from "./BuffSimulationBar";

describe("BuffSimulationBar", () => {
  it("shows stackable general buffs and explains a missing weapon target", async () => {
    const onToggle = vi.fn();
    const aura = buff("golden-vow", "Golden Vow", "aura");
    const weapon = buff("scholars-armament", "Scholar's Armament", "weapon");
    render(<BuffSimulationBar
      activeIds={[aura.id]}
      activeSkillBuffSlotId={null}
      activeWeaponBuff={null}
      catalyst={null}
      currentStats={stats}
      onToggle={onToggle}
      onToggleWeaponBuff={vi.fn()}
      onToggleSkillBuff={vi.fn()}
      spells={[aura, weapon]}
      target={null}
      targetSlotId={null}
    />);

    const auraButton = screen.getByRole("button", { name: /Golden Vow/ });
    expect(auraButton).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(auraButton);
    expect(onToggle).toHaveBeenCalledWith(aura);
    expect(screen.getByRole("button", { name: /Scholar's Armament/ })).toBeDisabled();
    expect(screen.getByText("Select the target armament")).toBeInTheDocument();
  });

  it("activates a weapon buff for a compatible target and catalyst", async () => {
    const onToggleWeaponBuff = vi.fn();
    const weaponBuff = buff("scholars-armament", "Scholar's Armament", "weapon");
    const target = equippedWeapon("longsword", [], true);
    const catalyst = equippedWeapon("academy-staff", ["sorcery"], false);
    render(<BuffSimulationBar
      activeIds={[]}
      activeSkillBuffSlotId={null}
      activeWeaponBuff={null}
      catalyst={catalyst}
      currentStats={stats}
      onToggle={vi.fn()}
      onToggleWeaponBuff={onToggleWeaponBuff}
      onToggleSkillBuff={vi.fn()}
      spells={[weaponBuff]}
      target={target}
      targetSlotId="right-hand-1"
    />);

    await userEvent.click(screen.getByRole("button", { name: /Scholar's Armament/ }));
    expect(onToggleWeaponBuff).toHaveBeenCalledWith(weaponBuff);
  });

  it("activates the supported buff of the focused Ash of War", async () => {
    const onToggleSkillBuff = vi.fn();
    render(<BuffSimulationBar
      activeIds={[]}
      activeSkillBuffSlotId={null}
      activeWeaponBuff={null}
      catalyst={null}
      currentStats={stats}
      onToggle={vi.fn()}
      onToggleSkillBuff={onToggleSkillBuff}
      onToggleWeaponBuff={vi.fn()}
      spells={[]}
      target={equippedWeapon("longsword", [], true, true)}
      targetSlotId="right-hand-1"
    />);

    await userEvent.click(screen.getByRole("button", { name: "Activate Cragblade" }));
    expect(onToggleSkillBuff).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Replaces an active spell weapon buff/)).toBeInTheDocument();
  });
});

const stats = {
  vigor: 40, mind: 25, endurance: 30, strength: 40,
  dexterity: 30, intelligence: 60, faith: 20, arcane: 10,
};

function equippedWeapon(
  id: string,
  castingTypes: string[],
  canApplyWeaponBuff: boolean,
  withSkillBuff = false,
) {
  return {
    weapon: {
      id, name: id, castingTypes,
      requirements: { strength: 0, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
      variants: [{ id: `${id}-standard`, affinity: "standard", maxUpgradeLevel: 25, canApplyWeaponBuff }],
      attacks: [], skills: [],
    },
    variantId: `${id}-standard`, upgradeLevel: 0,
    ashOfWarId: withSkillBuff ? "cragblade" : null,
    ashOfWar: withSkillBuff ? {
      id: "cragblade", name: "Cragblade", iconUrl: "/cragblade.webp",
      buffEffect: { durationSeconds: 60, consumption: "duration" },
    } : null,
  } as never;
}

function buff(id: string, name: string, slot: "aura" | "body" | "weapon") {
  return {
    id, name, iconUrl: "/buff.webp",
    type: "sorcery",
    requirements: { intelligence: 12, faith: 0, arcane: 0 },
    buffEffect: { slot, durationSeconds: 60 },
  } as Spell;
}
