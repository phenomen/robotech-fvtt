import { type JSX, type ReactNode } from "react";

import { SPACE_GAP, SPACE_PAD, type Space } from "@/components/ui/space";
import { cn } from "@/utils";

export type StackDirection = "row" | "column";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps {
  direction?: StackDirection;
  gap?: Space;
  pad?: Space;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  grow?: boolean;
  shrink?: boolean;
  children?: ReactNode;
}

const DIRECTION_CLASS: Record<StackDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};

const ALIGN_CLASS: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const JUSTIFY_CLASS: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export function Stack({
  direction = "column",
  gap = 3,
  pad,
  align,
  justify,
  wrap = false,
  grow = false,
  shrink = false,
  children,
}: StackProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex min-w-0",
        DIRECTION_CLASS[direction],
        SPACE_GAP[gap],
        pad !== undefined ? SPACE_PAD[pad] : undefined,
        align ? ALIGN_CLASS[align] : undefined,
        justify ? JUSTIFY_CLASS[justify] : undefined,
        wrap && "flex-wrap",
        grow && "min-h-0 min-w-0 flex-1",
        shrink && "shrink-0",
      )}
    >
      {children}
    </div>
  );
}
