import { memo, useState } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes, JSX, KeyboardEvent, Ref } from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import { cn } from "@/utils/cn";

export type InputSize = TextSize;
export type InputWidth = "auto" | "full" | "small" | "medium" | "large";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "className" | "size"> {
  ref?: Ref<HTMLInputElement>;
  /**
   * `blur` (default) commits once on blur or Enter, so a document field writes once per edit.
   * `change` commits on every keystroke, for inputs backed by React state such as dialog forms.
   */
  commit?: "blur" | "change";
  size?: InputSize;
  value?: string | number;
  width?: InputWidth;
}

const SIZE_PAD: Record<InputSize, string> = {
    large: "px-3 py-1",
    medium: "px-2.5 py-1",
    small: "px-2 py-0.5",
  },
  WIDTH_CLASS: Record<InputWidth, string> = {
    auto: "",
    full: "w-full",
    large: "w-44",
    medium: "w-32",
    small: "w-12",
  };

export const Input = memo(
  ({
    type = "text",
    commit = "blur",
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
  }: InputProps): JSX.Element => {
    const isToggle = type === "checkbox" || type === "radio",
      commitsOnBlur = commit === "blur" && !isToggle,
      [draft, setDraft] = useState<string | null>(null),
      displayValue = draft ?? value ?? "",
      handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
        if (!commitsOnBlur) {
          onChange?.(e);
        }
      },
      handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        onFocus?.(e);
      },
      handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (commitsOnBlur && draft !== null && onChange && draft !== String(value ?? "")) {
          onChange(e);
        }
        setDraft(null);
        onBlur?.(e);
      },
      handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.key === "Enter" && !isToggle) {
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
          "bg-rt-input text-rt-foreground! placeholder:text-rt-muted border-rt-border focus:border-rt-primary! h-8 border focus:outline-none",
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
