import { type JSX, type ReactNode } from "react";

import { Divider } from "@/components/ui/Divider";
import { SPACE_GAP, type Space } from "@/components/ui/space";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";

export interface LabelGridProps {
  children?: ReactNode;
  gap?: Space;
}

export function LabelGrid({ children, gap = 2 }: LabelGridProps): JSX.Element {
  return (
    <div className={cn("grid grid-cols-[max-content_minmax(0,1fr)] items-center", SPACE_GAP[gap])}>{children}</div>
  );
}

export interface LabelRowProps {
  label: ReactNode;
  children?: ReactNode;
}

export function LabelRow({ label, children }: LabelRowProps): JSX.Element {
  return (
    <>
      <div className="min-w-0">
        {typeof label === "string" ? (
          <Text variant="caption" truncate>
            {label}
          </Text>
        ) : (
          label
        )}
      </div>
      <div className="w-full min-w-0">{children}</div>
    </>
  );
}

export function LabelRule(): JSX.Element {
  return (
    <div className="col-span-2">
      <Divider />
    </div>
  );
}
