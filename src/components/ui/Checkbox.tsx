import React, { type ChangeEvent, type KeyboardEvent } from "react";

import { typoClass, type TextSize } from "@/components/ui/typo";
import { cn } from "@/utils";

export type CheckboxSize = TextSize;

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  id?: string;
  name?: string;
  variant?: "default" | "danger";
  size?: CheckboxSize;
  title?: string;
}

/** Matches Input height at the same size: label line-height + py-1 + 1px border. */
const SIZE_BOX: Record<CheckboxSize, string> = {
  small: "size-3.5",
  medium: "size-4",
  large: "size-[calc(1.25rem+0.5rem+2px)]",
};

const SIZE_MARK: Record<CheckboxSize, string> = {
  small: typoClass("label", "small"),
  medium: typoClass("label", "medium"),
  large: typoClass("label", "large"),
};

export const Checkbox = React.memo(function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  label,
  id,
  name,
  variant = "default",
  size = "medium",
  title,
}: CheckboxProps): React.JSX.Element {
  const isChecked = checked ?? defaultChecked ?? false;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onCheckedChange?.(event.target.checked);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || disabled) return;
    event.preventDefault();
    onCheckedChange?.(!isChecked);
  };

  const checkedStyles =
    variant === "danger"
      ? "peer-checked:bg-rt-danger peer-checked:border-rt-danger border-rt-danger border-dashed text-rt-danger-foreground"
      : "peer-checked:bg-rt-primary peer-checked:border-rt-primary border-rt-border text-rt-primary-foreground";

  const control = (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", SIZE_BOX[size])}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isChecked}
        disabled={disabled}
        title={title}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={cn(
          "box-border flex size-full items-center justify-center border bg-rt-input leading-none select-none peer-focus-visible:ring-1 peer-focus-visible:ring-rt-border peer-disabled:opacity-50",
          checkedStyles,
        )}
      >
        {isChecked && (
          <span className={cn("text-rt-primary-foreground leading-none select-none", SIZE_MARK[size])}>×</span>
        )}
      </span>
    </span>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      title={title}
      className={cn("flex cursor-pointer items-center gap-2 select-none", disabled && "cursor-not-allowed opacity-50")}
    >
      {control}
      <span className={cn(typoClass("label", size), "text-rt-foreground")}>{label}</span>
    </label>
  );
});
