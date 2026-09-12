import React, { useState } from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import { cn } from "@/utils/cn";

export type InputSize = TextSize;
export type InputWidth = "auto" | "full" | "small" | "medium" | "large";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "className" | "size"> {
  ref?: React.Ref<HTMLInputElement>;
  size?: InputSize;
  value?: string | number;
  width?: InputWidth;
}

const SIZE_PAD: Record<InputSize, string> = {
  large: "px-3 py-1",
  medium: "px-2.5 py-1",
  small: "px-2 py-0.5",
};

const WIDTH_CLASS: Record<InputWidth, string> = {
  auto: "",
  full: "w-full",
  large: "w-44",
  medium: "w-32",
  small: "w-12",
};

export const Input = React.memo(
  ({
    type = "text",
    value,
    size = "medium",
    width = "auto",
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    spellCheck = false,
    ref,
    ...props
  }: InputProps): React.JSX.Element => {
    const [draft, setDraft] = useState<string | null>(null);
    const displayValue = draft ?? value ?? "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(e.target.value);
      if (type === "checkbox" || type === "radio") {
        onChange?.(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type !== "checkbox" && type !== "radio" && draft !== null && onChange && draft !== String(value ?? "")) {
        onChange(e);
      }
      setDraft(null);
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.key === "Enter" && type !== "checkbox" && type !== "radio") {
        (e.target as HTMLInputElement).blur();
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        spellCheck={spellCheck}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-rt-input text-rt-foreground! placeholder:text-rt-muted border border-rt-border focus:border-rt-primary! focus:outline-none",
          typoClass(type === "number" ? "mono" : "label", size),
          SIZE_PAD[size],
          WIDTH_CLASS[width],
          width === "full" && "min-w-0 flex-1",
          type === "number" && "text-center"
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
