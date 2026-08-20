import React, { useState, useEffect, useRef } from "react";

import { typoClass, type TextSize } from "@/components/ui/typo";
import { cn } from "@/utils";

export type InputSize = TextSize;
export type InputWidth = "auto" | "full" | "small" | "medium" | "large";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "className" | "size"> {
  value?: string | number;
  size?: InputSize;
  width?: InputWidth;
}

const SIZE_PAD: Record<InputSize, string> = {
  small: "px-2 py-0.5",
  medium: "px-2.5 py-1",
  large: "px-3 py-1",
};

const WIDTH_CLASS: Record<InputWidth, string> = {
  auto: "",
  full: "w-full",
  small: "w-12",
  medium: "w-32",
  large: "w-44",
};

export const Input = React.memo(function Input({
  type = "text",
  value,
  size = "medium",
  width = "auto",
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  spellCheck = false,
  ...props
}: InputProps): React.JSX.Element {
  const [localValue, setLocalValue] = useState<string | number>(value ?? "");
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value ?? "");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (type === "checkbox" || type === "radio") {
      onChange?.(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    onBlur?.(e);
    if (type !== "checkbox" && type !== "radio" && onChange && String(localValue) !== String(value ?? "")) {
      onChange(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === "Enter" && type !== "checkbox" && type !== "radio") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type={type}
      spellCheck={spellCheck}
      value={localValue}
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
        type === "number" && "text-center",
      )}
      {...props}
    />
  );
});
