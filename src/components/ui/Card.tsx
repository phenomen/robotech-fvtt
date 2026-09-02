import React from "react";

import { SPACE_GAP, SPACE_PAD } from "@/components/ui/space";
import type { Space } from "@/components/ui/space";
import { typoClass } from "@/components/ui/typo";
import { cn } from "@/utils";

export type CardDirection = "column" | "row";
export type CardTone = "default" | "primary" | "secondary" | "danger" | "positive";

const TONE_FILL: Record<CardTone, string> = {
  danger: "color-mix(in srgb, var(--rt-danger) 15%, var(--rt-background))",
  default: "",
  positive: "color-mix(in srgb, var(--rt-gradation-good) 15%, var(--rt-background))",
  primary: "color-mix(in srgb, var(--rt-primary) 15%, var(--rt-background))",
  secondary: "var(--rt-secondary)",
};

export interface CardProps {
  children?: React.ReactNode;
  pad?: Space;
  gap?: Space;
  direction?: CardDirection;
  align?: "start" | "center" | "between";
  grow?: boolean;
  bordered?: boolean;
  tone?: CardTone;
}

export const Card = React.memo(
  ({
    children,
    pad = 3,
    gap = 3,
    direction = "column",
    align = "start",
    bordered = false,
    grow = false,
    tone = "default",
  }: CardProps): React.JSX.Element => (
    <div
      className={cn(
        "relative flex border border-transparent",
        direction === "column" ? "flex-col" : "flex-row",
        align === "center" && "items-center",
        align === "between" && "items-center justify-between",
        bordered && "border-rt-border",
        SPACE_PAD[pad],
        SPACE_GAP[gap],
        grow && "h-full min-h-0 w-full"
      )}
      style={{ backgroundColor: TONE_FILL[tone] }}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const CardHeader = React.memo(({ children }: { children?: React.ReactNode }): React.JSX.Element => (
  <div className="flex h-9 min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden">{children}</div>
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.memo(({ children }: { children?: React.ReactNode }): React.JSX.Element => (
  <h3
    className={cn(
      typoClass("mono"),
      "text-rt-primary border-rt-primary m-0 min-w-0 truncate border-l-2 pl-2 tracking-wider! uppercase"
    )}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";
