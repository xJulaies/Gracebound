import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({ className = "", ...props }: ActionButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-panel border border-accent bg-accent px-4 py-3 font-heading text-sm text-background shadow-md transition-[background-color,color,box-shadow,transform] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-foreground-muted disabled:shadow-none ${className}`}
      {...props}
    />
  );
}
