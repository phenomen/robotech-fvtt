import React, { useState, useEffect, useRef } from "react";

import { typoClass, type TextSize } from "@/components/ui/typo";
import { cn } from "@/utils";

export type TextareaSize = TextSize;

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  size?: TextareaSize;
}

function formatValue(val: TextareaProps["value"]): string | number {
  if (typeof val === "number") return val;
  if (Array.isArray(val)) return val.join(",");
  if (typeof val === "string") return val;
  return "";
}

export const Textarea = React.memo(function Textarea({
  value,
  size = "medium",
  onChange,
  onBlur,
  onFocus,
  spellCheck = false,
  ...props
}: TextareaProps): React.JSX.Element {
  const safeValue = formatValue(value);
  const [localValue, setLocalValue] = useState<string | number>(safeValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(safeValue);
    }
  }, [safeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    isFocusedRef.current = true;
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
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
        "font-rt-sans placeholder:font-rt-sans bg-rt-input text-rt-foreground! placeholder:text-rt-muted border-rt-border focus:border-rt-primary! w-full resize-y border p-2 focus:outline-none",
      )}
      {...props}
    />
  );
});
