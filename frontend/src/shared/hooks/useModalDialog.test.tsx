import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useModalDialog } from "./useModalDialog";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useModalDialog", () => {
  it("contains keyboard focus and restores focus, scrolling, and page position", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 720 });

    render(<ModalHarness />);
    const opener = screen.getByRole("button", { name: "Open dialog" });
    await user.click(opener);

    const first = screen.getByRole("button", { name: "First action" });
    const last = screen.getByRole("button", { name: "Last action" });
    expect(first).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    last.focus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "auto",
      left: 0,
      top: 720,
    });
  });
});

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">Open dialog</button>
      {isOpen && <TestDialog onClose={() => setIsOpen(false)} />}
    </>
  );
}

function TestDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef, onClose });

  return (
    <div aria-label="Test dialog" aria-modal="true" ref={dialogRef} role="dialog" tabIndex={-1}>
      <button ref={initialFocusRef} type="button">First action</button>
      <button type="button">Last action</button>
    </div>
  );
}
