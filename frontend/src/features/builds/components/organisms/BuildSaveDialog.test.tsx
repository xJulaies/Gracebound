import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { BuildSaveDialog } from "./BuildSaveDialog";

function renderDialog(overrides: Partial<Parameters<typeof BuildSaveDialog>[0]> = {}) {
  const props = {
    canSaveAsNew: false,
    initialMetadata: { name: "Untitled build", description: "", visibility: "private" as const },
    isSaving: false,
    errorMessage: null,
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  const result = render(<BuildSaveDialog {...props} />);
  return { ...result, props };
}

describe("BuildSaveDialog", () => {
  it("normalizes metadata and saves a public build", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    const name = screen.getByRole("textbox", { name: "Build name" });
    await user.clear(name);
    await user.type(name, "  Moonveil Mage  ");
    await user.type(screen.getByRole("textbox", { name: "Description" }), "  Intelligence build  ");
    await user.click(screen.getByRole("radio", { name: /Public/ }));
    await user.click(screen.getByRole("button", { name: "Save build" }));

    expect(props.onSave).toHaveBeenCalledWith({
      name: "Moonveil Mage",
      description: "Intelligence build",
      visibility: "public",
    }, "save");
  });

  it("keeps focus in the dialog when the name is empty", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog({
      initialMetadata: { name: "", description: "", visibility: "private" },
    });

    await user.click(screen.getByRole("button", { name: "Save build" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Give this build a name");
    expect(screen.getByRole("textbox", { name: "Build name" })).toHaveFocus();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it("offers save as new only after an initial build exists", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog({ canSaveAsNew: true });

    await user.click(screen.getByRole("button", { name: "Save as new" }));

    expect(props.onSave).toHaveBeenCalledWith(props.initialMetadata, "save-as-new");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { baseElement } = renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(dialog.parentElement).toHaveClass("overflow-y-auto");
    await expectNoAccessibilityViolations(baseElement);
  });
});
