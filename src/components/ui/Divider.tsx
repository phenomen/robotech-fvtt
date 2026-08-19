import { type JSX } from "react";

import { cn } from "@/utils";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal" }: DividerProps): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-rt-border shrink-0", orientation === "horizontal" ? "h-px w-full" : "h-4 w-px self-center")}
    />
  );
}
