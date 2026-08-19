import { type JSX, type ReactNode } from "react";

import { typoClass, type TextSize, type TextVariant } from "@/components/ui/typo";
import { cn } from "@/utils";

export type { TextSize, TextVariant };

export type TextColor =
  | "foreground"
  | "muted"
  | "primary"
  | "secondary"
  | "danger"
  | "green"
  | "amber"
  | "teal"
  | "blue"
  | "inherit";

export type TextAlign = "start" | "center" | "end";
export type TextWidth = "num" | "full";

type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "label" | "strong" | "subtle";

const COLOR_CLASS: Record<TextColor, string> = {
  foreground: "text-rt-foreground",
  muted: "text-rt-muted",
  primary: "text-rt-primary",
  secondary: "text-rt-secondary-foreground",
  danger: "text-rt-danger",
  green: "text-rt-custom-green",
  amber: "text-rt-custom-amber",
  teal: "text-rt-custom-teal",
  blue: "text-rt-custom-blue",
  inherit: "text-inherit",
};

const ALIGN_CLASS: Record<TextAlign, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

const WIDTH_CLASS: Record<TextWidth, string> = {
  num: "inline-block w-12",
  full: "block w-full",
};

function defaultTag(variant: TextVariant): TextTag {
  if (variant === "title") return "h3";
  if (variant === "copy") return "p";
  return "span";
}

export interface TextProps {
  variant: TextVariant;
  size?: TextSize;
  as?: TextTag;
  color?: TextColor;
  align?: TextAlign;
  width?: TextWidth;
  truncate?: boolean;
  htmlFor?: string;
  title?: string;
  children?: ReactNode;
}

export function Text({
  variant,
  size = "medium",
  as,
  color = "foreground",
  align,
  width,
  truncate = false,
  htmlFor,
  title,
  children,
}: TextProps): JSX.Element {
  const Component = as ?? defaultTag(variant);
  return (
    <Component
      {...(Component === "label" ? { htmlFor } : {})}
      title={title}
      className={cn(
        "m-0",
        typoClass(variant, size),
        COLOR_CLASS[color],
        align ? ALIGN_CLASS[align] : undefined,
        width ? WIDTH_CLASS[width] : undefined,
        truncate && "min-w-0 truncate",
      )}
    >
      {children}
    </Component>
  );
}
