import { forwardRef } from "react";

export const MenuButton = forwardRef<
  HTMLButtonElement,
  { isOpen: boolean; onClick: () => void }
>(function MenuButton({ isOpen, onClick }, ref) {
  return (
    <button
      aria-controls="mobile-navigation"
      aria-expanded={isOpen}
      aria-label={`${isOpen ? "Close" : "Open"} navigation`}
      className="inline-flex size-10 items-center justify-center border-border bg-surface p-0 lg:hidden"
      onClick={onClick}
      ref={ref}
      type="button"
    >
      <span aria-hidden="true" className="text-xl">☰</span>
    </button>
  );
});
