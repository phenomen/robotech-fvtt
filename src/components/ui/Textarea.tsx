import { memo, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, JSX, TextareaHTMLAttributes } from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import { cn } from "@/utils/cn";

export type TextareaSize = TextSize;

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  size?: TextareaSize;
}

function formatValue(val: TextareaProps["value"]): string | number {
  if (typeof val === "number") {
    return val;
  }
  if (Array.isArray(val)) {
    return val.join(",");
  }
  if (typeof val === "string") {
    return val;
  }
  return "";
}

export const Textarea = memo(
  ({ value, size = "medium", onChange, onBlur, onFocus, spellCheck = false, ...props }: TextareaProps): JSX.Element => {
    const safeValue = formatValue(value),
      [localValue, setLocalValue] = useState<string | number>(safeValue),
      isFocusedRef = useRef(false);

    useEffect(() => {
      if (!isFocusedRef.current) {
        setLocalValue(safeValue);
      }
    }, [safeValue]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
      },
      handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
        isFocusedRef.current = true;
        onFocus?.(e);
      },
      handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
        isFocusedRef.current = false;
        onBlur?.(e);
        if (onChange && String(localValue) !== String(safeValue)) {
          onChange(e);
        }
      };

    return (
      <textarea
        spellCheck={spellCheck}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          typoClass("copy", size),
          "font-rt-sans placeholder:font-rt-sans bg-rt-input text-rt-foreground! placeholder:text-rt-muted border-rt-border focus:border-rt-primary! w-full resize-y border p-2 focus:outline-none"
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
