import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAshOfWar } from "../../ashes-of-war/api/ashesOfWar.api";
import type { AshOfWar } from "../../ashes-of-war/types/ashOfWar.types";
import { getSpell } from "../../spells/api/spells.api";
import type { Spell } from "../../spells/types/spell.types";
import { getWeapon } from "../../weapons/api/weapons.api";
import type { Weapon } from "../../weapons/types/weapon.types";
import type { Build } from "../../builds/types/build.types";
import { getDamageTrialActionOptions } from "./damageTrialLoadout.api";

vi.mock("../../ashes-of-war/api/ashesOfWar.api", () => ({ getAshOfWar: vi.fn() }));
vi.mock("../../spells/api/spells.api", () => ({ getSpell: vi.fn() }));
vi.mock("../../weapons/api/weapons.api", () => ({ getWeapon: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getWeapon).mockImplementation(async (weaponId) => response(weaponId === "academy-glintstone-staff" ? catalyst : weapon));
  vi.mocked(getAshOfWar).mockResolvedValue(response(ashOfWar));
  vi.mocked(getSpell).mockResolvedValue(response(spell));
});

describe("getDamageTrialActionOptions", () => {
  it("maps persisted slots, selected Ashes of War, and supported spell casts", async () => {
    const options = await getDamageTrialActionOptions(build);

    expect(options).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceName: "Heavy Longsword +25",
        action: expect.objectContaining({
          kind: "weapon-attack",
          weaponSlotId: "rightHand1",
          attackId: "straight-sword-1h-light-1",
        }),
      }),
      expect.objectContaining({
        action: expect.objectContaining({
          kind: "weapon-skill",
          skillAttackId: "storm-blade-projectile",
        }),
      }),
      expect.objectContaining({ action: { kind: "spell", spellId: "comet", label: "Cast", charged: false } }),
      expect.objectContaining({ action: { kind: "spell", spellId: "comet", label: "Charged cast", charged: true } }),
    ]));
  });

  it("does not expose spells without a compatible catalyst", async () => {
    const options = await getDamageTrialActionOptions({
      ...build,
      equipment: { ...build.equipment, catalyst: null },
    });

    expect(options.some(({ group }) => group === "spell")).toBe(false);
  });
});

const weapon = {
  id: "longsword",
  name: "Longsword",
  iconUrl: "/longsword.webp",
  variants: [{ id: "longsword-heavy", affinity: "heavy", maxUpgradeLevel: 25 }],
  attacks: [
    { id: "straight-sword-1h-light-1", name: "Light attack 1" },
    { id: "straight-sword-1h-heavy-1", name: "Heavy attack 1" },
    { id: "straight-sword-1h-charged-heavy-1", name: "Charged heavy attack" },
    { id: "straight-sword-jumping-heavy-1", name: "Jumping heavy attack" },
  ],
  skills: [],
} as unknown as Weapon;

const ashOfWar = {
  id: "storm-blade",
  name: "Storm Blade",
  iconUrl: "/storm-blade.webp",
  attacks: [{ id: "storm-blade-projectile", name: "Storm Blade", fpCost: 10 }],
} as unknown as AshOfWar;

const catalyst = {
  id: "academy-glintstone-staff",
  name: "Academy Glintstone Staff",
  castingTypes: ["sorcery"],
  variants: [{ id: "academy-glintstone-staff", affinity: "standard", maxUpgradeLevel: 25 }],
} as unknown as Weapon;

const spell = {
  id: "comet",
  name: "Comet",
  type: "sorcery",
  iconUrl: "/comet.webp",
  fpCost: 24,
  chargedFpCost: 28,
  calculationStatus: "supported",
  attack: { outputUnit: "per-hit", motionValues: emptyDamage(), additionalComponents: [] },
  chargedAttack: { outputUnit: "per-hit", motionValues: emptyDamage(), additionalComponents: [] },
} as unknown as Spell;

const build = {
  id: "build-1",
  spellIds: ["comet"],
  equipment: {
    catalyst: { weaponId: "academy-glintstone-staff", variantId: "academy-glintstone-staff", upgradeLevel: 25 },
    weaponSlots: {
      rightHand1: { weaponId: "longsword", variantId: "longsword-heavy", upgradeLevel: 25, ashOfWarId: "storm-blade" },
      rightHand2: null,
      rightHand3: null,
      leftHand1: null,
      leftHand2: null,
      leftHand3: null,
    },
  },
} as Build;

function response<T>(item: T) {
  return { status: 200, message: "Found", data: [item] };
}

function emptyDamage() {
  return { physical: 0, magic: 1, fire: 0, lightning: 0, holy: 0 };
}
