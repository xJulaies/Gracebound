import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import type { CharacterStats } from "../../../shared/types/game.types";
import { getWeaponOffensePreview } from "../api/damagePreview.api";
import type { EquippedWeapon } from "../types/editor.types";
import { useWeaponOffensePreviewQuery } from "./useWeaponOffensePreviewQuery";

vi.mock("../api/damagePreview.api", () => ({
  getWeaponOffensePreview: vi.fn(),
}));

const weapon = {
  weapon: { attacks: [{ id: "light", name: "Light" }], skills: [] },
} as unknown as EquippedWeapon;
const equipment = {
  armorIds: [], crystalTearIds: [], greatRuneId: null, talismanIds: [],
  buffSpellIds: [], weaponBuff: null, skillBuffAshOfWarId: null,
};
const initialStats: CharacterStats = {
  vigor: 15, mind: 10, endurance: 11, strength: 14,
  dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
};

describe("useWeaponOffensePreviewQuery", () => {
  it("requests only the final state after rapid attribute changes", async () => {
    vi.mocked(getWeaponOffensePreview).mockResolvedValue({ actions: [] });
    const { rerender } = renderHook(
      ({ stats }) => useWeaponOffensePreviewQuery(weapon, stats, equipment, 20),
      {
        initialProps: { stats: initialStats },
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(getWeaponOffensePreview).toHaveBeenCalledTimes(1));
    rerender({ stats: { ...initialStats, strength: 15 } });
    rerender({ stats: { ...initialStats, strength: 16 } });
    expect(getWeaponOffensePreview).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(getWeaponOffensePreview).toHaveBeenCalledTimes(2));
    expect(getWeaponOffensePreview).toHaveBeenLastCalledWith(
      weapon,
      expect.objectContaining({ strength: 16 }),
      equipment,
      expect.any(AbortSignal),
    );
  });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
