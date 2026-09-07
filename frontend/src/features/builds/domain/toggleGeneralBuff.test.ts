import { describe, expect, it } from "vitest";
import type { Spell } from "../../spells/types/spell.types";
import { toggleGeneralBuff } from "./toggleGeneralBuff";

describe("toggleGeneralBuff", () => {
  it("stacks aura and body buffs but replaces a buff in the same slot", () => {
    const aura = buff("golden-vow", "aura");
    const body = buff("flame-grant-me-strength", "body");
    const secondBody = buff("howl-of-shabriri", "body");
    const selected = [aura, body, secondBody];

    expect(toggleGeneralBuff([aura.id], body, selected)).toEqual([aura.id, body.id]);
    expect(toggleGeneralBuff([aura.id, body.id], secondBody, selected)).toEqual([aura.id, secondBody.id]);
    expect(toggleGeneralBuff([aura.id, body.id], aura, selected)).toEqual([body.id]);
  });
});

function buff(id: string, slot: "aura" | "body") {
  return { id, buffEffect: { slot, durationSeconds: 60 } } as Spell;
}
