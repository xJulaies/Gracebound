import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInfiniteArmorQuery } from "../../armor/hooks/useArmorQuery";
import { useInfiniteTalismansQuery } from "../../talismans/hooks/useTalismansQuery";
import { useInfiniteWeaponsQuery } from "../../weapons/hooks/useWeaponsQuery";
import { useEquipmentCatalogQueries } from "./useEquipmentCatalogQueries";

vi.mock("../../armor/hooks/useArmorQuery", () => ({ useInfiniteArmorQuery: vi.fn() }));
vi.mock("../../talismans/hooks/useTalismansQuery", () => ({ useInfiniteTalismansQuery: vi.fn() }));
vi.mock("../../weapons/hooks/useWeaponsQuery", () => ({ useInfiniteWeaponsQuery: vi.fn() }));

const idleQuery = {
  data: undefined,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isError: false,
  isFetchingNextPage: false,
  isPending: false,
};

describe("useEquipmentCatalogQueries", () => {
  it("only enables the selected category and forwards its search", () => {
    vi.mocked(useInfiniteWeaponsQuery).mockReturnValue(
      idleQuery as unknown as ReturnType<typeof useInfiniteWeaponsQuery>,
    );
    vi.mocked(useInfiniteArmorQuery).mockReturnValue(
      idleQuery as unknown as ReturnType<typeof useInfiniteArmorQuery>,
    );
    vi.mocked(useInfiniteTalismansQuery).mockReturnValue(
      idleQuery as unknown as ReturnType<typeof useInfiniteTalismansQuery>,
    );

    const { result } = renderHook(() => useEquipmentCatalogQueries({
      category: "armor",
      search: "knight",
    }));

    expect(useInfiniteWeaponsQuery).toHaveBeenCalledWith(
      { limit: 24, search: "knight" },
      false,
    );
    expect(useInfiniteArmorQuery).toHaveBeenCalledWith(
      { limit: 24, search: "knight" },
      true,
    );
    expect(useInfiniteTalismansQuery).toHaveBeenCalledWith(
      { limit: 24, search: "knight" },
      false,
    );
    expect(result.current.map(({ category }) => category)).toEqual(["armor"]);
  });
});
