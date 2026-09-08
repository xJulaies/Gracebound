import { useBlocker } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnsavedBuildChangesGuard } from "./UnsavedBuildChangesGuard";

vi.mock("@tanstack/react-router", () => ({ useBlocker: vi.fn() }));

const proceed = vi.fn();
const reset = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useBlocker).mockReturnValue({
    status: "blocked",
    proceed,
    reset,
  } as unknown as ReturnType<typeof useBlocker>);
});

describe("UnsavedBuildChangesGuard", () => {
  it("enables browser protection and lets the user keep editing", async () => {
    const user = userEvent.setup();
    render(<UnsavedBuildChangesGuard isDirty />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(dialog.parentElement).toHaveClass("overflow-y-auto");
    expect(useBlocker).toHaveBeenCalledWith(expect.objectContaining({
      enableBeforeUnload: true,
      withResolver: true,
    }));
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(proceed).not.toHaveBeenCalled();
  });

  it("continues the blocked navigation only after explicit confirmation", async () => {
    const user = userEvent.setup();
    render(<UnsavedBuildChangesGuard isDirty />);

    await user.click(screen.getByRole("button", { name: "Leave without saving" }));
    expect(proceed).toHaveBeenCalledOnce();
  });
});
