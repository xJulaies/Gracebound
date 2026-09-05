import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../../test/accessibility";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";

vi.mock("../atoms/DrawerBackdrop", () => ({
  DrawerBackdrop: ({ onClick }: { onClick: () => void }) => (
    <button aria-label="Close backdrop" onClick={onClick} type="button" />
  ),
}));
vi.mock("../molecules/BrandLink", () => ({
  BrandLink: () => <a href="/">Gracebound</a>,
}));
vi.mock("../molecules/MainNavigation", () => ({
  MainNavigation: () => <a href="/equipment">Equipment</a>,
}));
vi.mock("../../../../../features/auth/components/AuthControls", () => ({
  AuthControls: () => <button type="button">Sign in</button>,
}));

describe("MobileNavigationDrawer", () => {
  it("contains focus and restores it to the menu trigger", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);

    const opener = screen.getByRole("button", { name: "Open navigation" });
    await user.click(opener);
    const close = screen.getByRole("button", { name: "Close navigation" });
    const first = screen.getByRole("link", { name: "Gracebound" });
    const last = screen.getByRole("button", { name: "Sign in" });
    expect(close).toHaveFocus();

    last.focus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(<DrawerHarness />);

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    await expectNoAccessibilityViolations(container);
  });
});

function DrawerHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">Open navigation</button>
      {isOpen && (
        <MobileNavigationDrawer onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
