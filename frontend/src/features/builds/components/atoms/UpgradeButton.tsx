import type { MouseEvent } from "react";

interface UpgradeButtonProps {
  label: string;
  disabled: boolean;
  children: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function UpgradeButton({
  label,
  disabled,
  children,
  onClick,
}: UpgradeButtonProps) {
  return (
    <button
      aria-label={label}
      className="grid size-11 shrink-0 place-items-center rounded-panel border border-border bg-surface text-xl text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
