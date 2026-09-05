import type { Ref } from "react";

interface PickerSearchInputProps {
  inputRef?: Ref<HTMLInputElement>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function PickerSearchInput({
  label,
  placeholder,
  value,
  onChange,
  inputRef,
}: PickerSearchInputProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        className="w-full rounded-panel border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-accent focus:ring-2 focus:ring-focus"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        type="search"
        value={value}
      />
    </label>
  );
}
