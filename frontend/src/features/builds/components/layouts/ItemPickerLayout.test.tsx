import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { ItemPickerLayout } from "./ItemPickerLayout";

function renderLayout(onClose: () => void) {
  return render(
    <ItemPickerLayout
      headingId="test-picker-heading"
      onClose={onClose}
      onSearchChange={vi.fn()}
      searchLabel="Search items"
      searchPlaceholder="Search…"
      searchValue=""
      subtitle="For test slot"
      title="Select item"
    >
      <button type="button">Item content</button>
    </ItemPickerLayout>,
  );
}

describe("ItemPickerLayout", () => {
  it("closes through Escape and the free overlay area", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderLayout(onClose);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("does not close when picker content is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderLayout(onClose);

    await user.click(screen.getByRole("button", { name: "Item content" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("focuses search and keeps forward and backward tabbing inside", async () => {
    const user = userEvent.setup();
    renderLayout(vi.fn());

    const search = screen.getByRole("searchbox", { name: "Search items" });
    const close = screen.getByRole("button", { name: "Close" });
    const item = screen.getByRole("button", { name: "Item content" });
    expect(search).toHaveFocus();

    item.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(item).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = renderLayout(vi.fn());

    await expectNoAccessibilityViolations(container);
  });
});
