import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useAshesOfWarQuery } from "../../../ashes-of-war/hooks/useAshesOfWarQuery";
import { AshOfWarField } from "./AshOfWarField";

vi.mock("../../../ashes-of-war/hooks/useAshesOfWarQuery", () => ({
  useAshesOfWarQuery: vi.fn(),
}));

describe("AshOfWarField", () => {
  it("offers compatible Ashes and returns the selected ID", async () => {
    vi.mocked(useAshesOfWarQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status: 200,
        message: "Ashes of War found",
        data: [{
          id: "square-off",
          name: "Square Off",
          summary: null,
          description: null,
          iconId: 1,
          iconUrl: "http://localhost:3000/api/assets/icons/1",
          compatibleWeaponTypes: ["straight-sword"],
          compatibleAffinities: ["standard"],
          calculationStatus: "supported",
          attacks: [],
          gameVersion: "1.17.0",
        }],
      },
    } as unknown as ReturnType<typeof useAshesOfWarQuery>);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AshOfWarField
        affinity="standard"
        onChange={onChange}
        value={null}
        weaponType="straight-sword"
      />,
    );

    await user.click(screen.getByRole("button", { name: /Square Off/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      id: "square-off",
      iconUrl: "http://localhost:3000/api/assets/icons/1",
    }));
    expect(useAshesOfWarQuery).toHaveBeenCalledWith({
      affinity: "standard",
      weaponType: "straight-sword",
    });
  });
});
