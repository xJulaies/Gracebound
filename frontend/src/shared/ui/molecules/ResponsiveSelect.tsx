import { useEffect, useRef } from "react";

export interface ResponsiveSelectOption {
  value: string;
  label: string;
  compactLabel?: string;
}

export function ResponsiveSelect({ emptyLabel, label, onChange, options, value }: {
  emptyLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly ResponsiveSelectOption[];
  value: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.compactLabel ?? selected?.label ?? emptyLabel;

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) detailsRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-sm text-foreground-muted">{label}</span>
      <details
        className="relative min-w-0"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            detailsRef.current?.removeAttribute("open");
            detailsRef.current?.querySelector("summary")?.focus();
          }
        }}
        ref={detailsRef}
      >
        <summary
          aria-label={`${label}: ${selectedLabel}`}
          className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-panel border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          role="button"
        >
          <OptionLabel option={selected} fallback={emptyLabel} />
          <span aria-hidden="true" className="shrink-0 text-accent">▾</span>
        </summary>
        <div className="fixed inset-x-4 top-20 z-50 grid max-h-[calc(100dvh-6rem)] min-w-0 gap-1 overflow-y-auto rounded-panel border border-border bg-surface-elevated p-2 shadow-2xl md:absolute md:inset-x-0 md:top-full md:mt-1 md:max-h-[min(24rem,60dvh)]">
          <SelectOptionButton
            active={value === ""}
            label={emptyLabel}
            onSelect={() => onChange("")}
          />
          {options.map((option) => (
            <SelectOptionButton
              active={option.value === value}
              key={option.value}
              label={<OptionLabel option={option} />}
              onSelect={() => onChange(option.value)}
            />
          ))}
        </div>
      </details>
    </div>
  );

  function SelectOptionButton({ active, label: optionLabel, onSelect }: {
    active: boolean;
    label: React.ReactNode;
    onSelect: () => void;
  }) {
    return (
      <button
        aria-pressed={active}
        className="min-h-11 w-full whitespace-normal border-0 bg-background/40 px-3 py-2 text-left text-sm leading-5 hover:bg-background"
        onClick={() => {
          onSelect();
          detailsRef.current?.removeAttribute("open");
          detailsRef.current?.querySelector("summary")?.focus();
        }}
        type="button"
      >
        {optionLabel}
      </button>
    );
  }
}

function OptionLabel({ fallback, option }: {
  fallback?: string;
  option?: ResponsiveSelectOption;
}) {
  if (!option) return <span className="min-w-0 truncate">{fallback}</span>;
  return (
    <span className="min-w-0">
      <span className={option.compactLabel ? "md:hidden" : undefined}>{option.compactLabel ?? option.label}</span>
      {option.compactLabel && <span className="hidden md:inline">{option.label}</span>}
    </span>
  );
}
