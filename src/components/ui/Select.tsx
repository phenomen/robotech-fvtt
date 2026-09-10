import React from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import { cn } from "@/utils/cn";

export type SelectWidth = "auto" | "full" | "small" | "medium" | "large";
export type SelectTone = "default" | "danger";
export type SelectSize = TextSize;

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className" | "size"> {
  width?: SelectWidth;
  tone?: SelectTone;
  size?: SelectSize;
}

const WIDTH_CLASS: Record<SelectWidth, string> = {
  auto: "",
  full: "w-full",
  large: "w-44",
  medium: "w-32",
  small: "w-10",
};

const TONE_CLASS: Record<SelectTone, string> = {
  danger: "border-rt-danger text-rt-danger! focus:border-rt-danger!",
  default: "border-rt-border text-rt-foreground! focus:border-rt-primary!",
};

export const Select = React.memo(
  ({ width = "auto", tone = "default", size = "medium", children, ...props }: SelectProps): React.JSX.Element => (
    <select
      className={cn(
        typoClass("label", size),
        "bg-rt-input h-8 cursor-pointer border px-2.5 py-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_optgroup]:bg-rt-secondary [&_optgroup]:text-rt-muted [&_option]:bg-rt-secondary [&_option]:text-rt-secondary-foreground",
        TONE_CLASS[tone],
        WIDTH_CLASS[width],
        width === "full" && "min-w-0 flex-1"
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
