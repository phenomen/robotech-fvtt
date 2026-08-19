import React from "react";

import { SPACE_GAP, SPACE_PAD, type Space } from "@/components/ui/space";
import { typoClass } from "@/components/ui/typo";
import { cn } from "@/utils";

export type CardDirection = "column" | "row";
export type CardTone = "default" | "primary" | "secondary" | "danger" | "positive";

const TONE_FILL: Record<CardTone, string> = {
  default: "",
  primary: "color-mix(in srgb, var(--rt-primary) 15%, var(--rt-background))",
  secondary: "var(--rt-secondary)",
  danger: "color-mix(in srgb, var(--rt-danger) 15%, var(--rt-background))",
  positive: "color-mix(in srgb, var(--rt-gradation-good) 15%, var(--rt-background))",
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

export const Card = React.memo(function Card({
  children,
  pad = 3,
  gap = 3,
  direction = "column",
  align = "start",
  bordered = false,
  grow = false,
  tone = "default",
}: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "relative flex border border-transparent",
        direction === "column" ? "flex-col" : "flex-row",
        align === "center" && "items-center",
        align === "between" && "items-center justify-between",
        bordered && "border-rt-border",
        SPACE_PAD[pad],
        SPACE_GAP[gap],
        grow && "h-full min-h-0 w-full",
      )}
      style={{ backgroundColor: TONE_FILL[tone] }}
    >
      {children}
    </div>
  );
});

export const CardHeader = React.memo(function CardHeader({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return <div className="flex h-9 min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden">{children}</div>;
});

export const CardTitle = React.memo(function CardTitle({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <h3
      className={cn(
        typoClass("stat"),
        "text-rt-primary border-rt-primary m-0 min-w-0 truncate border-l-2 pl-2 tracking-wider! uppercase",
      )}
    >
      {children}
    </h3>
  );
});
