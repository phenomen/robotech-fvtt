import { createElement } from "react";
import type { JSX, ReactNode } from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize, TextVariant } from "@/components/ui/typo";
import { cn } from "@/utils/cn";

export type { TextSize, TextVariant } from "@/components/ui/typo";

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
  amber: "text-rt-custom-amber",
  blue: "text-rt-custom-blue",
  danger: "text-rt-danger",
  foreground: "text-rt-foreground",
  green: "text-rt-custom-green",
  inherit: "text-inherit",
  muted: "text-rt-muted",
  primary: "text-rt-primary",
  secondary: "text-rt-secondary-foreground",
  teal: "text-rt-custom-teal",
};

const ALIGN_CLASS: Record<TextAlign, string> = {
  center: "text-center",
  end: "text-right",
  start: "text-left",
};

const WIDTH_CLASS: Record<TextWidth, string> = {
  full: "block w-full",
  num: "inline-block w-12",
};

function defaultTag(variant: TextVariant): TextTag {
  if (variant === "title") {
    return "h3";
  }
  if (variant === "copy") {
    return "p";
  }
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
  const tag = as ?? defaultTag(variant);
  return createElement(
    tag === "subtle" ? "span" : tag,
    {
      className: cn(
        "m-0",
        typoClass(variant, size),
        COLOR_CLASS[color],
        align ? ALIGN_CLASS[align] : undefined,
        width ? WIDTH_CLASS[width] : undefined,
        truncate && "min-w-0 truncate"
      ),
      ...(tag === "label" ? { htmlFor } : {}),
      title,
    },
    children
  );
}
