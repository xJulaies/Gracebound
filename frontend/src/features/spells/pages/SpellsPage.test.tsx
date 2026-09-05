import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpellsPage } from "./SpellsPage";

vi.mock("../hooks/useSpellsQuery", () => ({
  useInfiniteSpellsQuery: () => ({
    data: undefined,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isPending: true,
  }),
}));

describe("SpellsPage", () => {
  it("provides the spell catalog foundation", () => {
    render(
      <SpellsPage
        filters={{ type: "all", search: "" }}
        onSchoolChange={vi.fn()}
        onSearchChange={vi.fn()}
        onTypeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Spells" }))
      .toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search spells" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading spells");
  });
});
