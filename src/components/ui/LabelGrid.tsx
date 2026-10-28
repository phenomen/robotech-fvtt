import { useId } from "react";
import type { JSX, ReactNode } from "react";

import { Divider } from "@/components/ui/Divider";
import { SPACE_GAP } from "@/components/ui/space";
import type { Space } from "@/components/ui/space";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils/cn";

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

/** The row's controls form a group named by its label, so each control is announced with it. */
export function LabelRow({ label, children }: LabelRowProps): JSX.Element {
  const labelId = useId();
  return (
    <>
      <div id={labelId} className="min-w-0">
        {typeof label === "string" ? (
          <Text variant="label" truncate>
            {label}
          </Text>
        ) : (
          label
        )}
      </div>
      {/* Foundry's core CSS restyles every <fieldset> (border, legend, padding), so a div carries the role. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div role="group" aria-labelledby={labelId} className="w-full min-w-0">
        {children}
      </div>
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
