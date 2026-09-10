import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DamageTrialLogEntry } from "../../types/damageTrial.types";
import { DamageTrialResultDetails } from "./DamageTrialResultDetails";

describe("DamageTrialResultDetails", () => {
  it("shows mitigation stages, active modifiers, components, and limitations", () => {
    render(<DamageTrialResultDetails entry={entry} />);

    expect(screen.getByText("Attack rating")).toBeInTheDocument();
    expect(screen.getByText("Before mitigation")).toBeInTheDocument();
    expect(screen.getByText("Direct damage")).toBeInTheDocument();
    expect(screen.getByText("Projectile")).toBeInTheDocument();
    expect(screen.getByText("Godrick's Great Rune")).toBeInTheDocument();
    expect(screen.getByText("One occurrence per component is assumed.")).toBeInTheDocument();
  });
});

const entry = {
  id: "entry-1",
  sequence: 1,
  action: {
    kind: "weapon-skill",
    weaponSlotId: "rightHand1",
    skillAttackId: "storm-blade-projectile",
    label: "Storm Blade",
    skillBuffActive: false,
  },
  bossHealthBefore: 4174,
  bossHealthAfter: 3614,
  result: {
    attack: { id: "storm-blade-projectile", name: "Storm Blade", fpCost: 10 },
    attackRating: damage(680),
    offensiveOutput: damage(640),
    damage: damage(560),
    totalDamage: 560,
    specialDamage: [],
    components: [{
      kind: "projectile",
      id: "projectile",
      label: "Projectile",
      sourceAttackId: 1,
      outputUnit: "per-hit",
      offensiveOutput: damage(640),
      damage: damage(560),
    }],
    target: { id: "margit", name: "Margit" },
    accuracy: "estimated",
    limitations: ["One occurrence per component is assumed."],
    buffs: [{ id: "golden-vow", name: "Golden Vow", slot: "aura", durationSeconds: 80 }],
    greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
    crystalTears: [],
    talismans: [{ id: "shard-of-alexander", name: "Shard of Alexander" }],
    weapon: { id: "longsword", name: "Longsword", gameVersion: "1.17.0", upgradeLevel: 25, affinity: "heavy" },
  },
} as DamageTrialLogEntry;

function damage(total: number) {
  return { physical: total, magic: 0, fire: 0, lightning: 0, holy: 0, total };
}
