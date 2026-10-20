import type { JSX, ReactNode } from "react";

import { SPACE_GAP, SPACE_PAD } from "@/components/ui/space";
import type { Space } from "@/components/ui/space";
import { cn } from "@/utils/cn";

export type StackDirection = "row" | "column";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";
export type StackMinHeight = "input";

export interface StackProps {
  direction?: StackDirection;
  gap?: Space;
  pad?: Space;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  grow?: boolean;
  shrink?: boolean;
  minHeight?: StackMinHeight;
  children?: ReactNode;
}

const MIN_HEIGHT_CLASS: Record<StackMinHeight, string> = {
    input: "min-h-8",
  },
  DIRECTION_CLASS: Record<StackDirection, string> = {
    column: "flex-col",
    row: "flex-row",
  },
  ALIGN_CLASS: Record<StackAlign, string> = {
    center: "items-center",
    end: "items-end",
    start: "items-start",
    stretch: "items-stretch",
  },
  JUSTIFY_CLASS: Record<StackJustify, string> = {
    between: "justify-between",
    center: "justify-center",
    end: "justify-end",
    start: "justify-start",
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
  minHeight,
  children,
}: StackProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex min-w-0",
        DIRECTION_CLASS[direction],
        SPACE_GAP[gap],
        pad === undefined ? undefined : SPACE_PAD[pad],
        align ? ALIGN_CLASS[align] : undefined,
        justify ? JUSTIFY_CLASS[justify] : undefined,
        wrap && "flex-wrap",
        grow && "min-h-0 min-w-0 flex-1",
        shrink && "shrink-0",
        minHeight ? MIN_HEIGHT_CLASS[minHeight] : undefined
      )}
    >
      {children}
    </div>
  );
}
