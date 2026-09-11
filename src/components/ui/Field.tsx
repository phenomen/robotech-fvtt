import { cloneElement, useId } from "react";
import type { JSX, ReactElement, ReactNode } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import type { IconTone } from "@/types/ui";
import { cn } from "@/utils/cn";

export type FieldOrientation = "vertical" | "horizontal";

interface FieldProps {
  label: ReactNode;
  icon?: string;
  iconTone?: IconTone;
  title?: string;
  orientation?: FieldOrientation;
  grow?: boolean;
  children: ReactElement<{ id?: string }>;
}

function isCenteredControl(child: ReactElement): boolean {
  return child.type === NumberInput || child.type === Checkbox;
}

function fieldLayoutClass(orientation: FieldOrientation, center: boolean): string {
  if (orientation !== "vertical") {
    return "flex-row items-center justify-between gap-2";
  }
  return cn("flex-col gap-1", center ? "items-center" : "items-start");
}

export function Field({
  label,
  icon,
  iconTone,
  title,
  orientation = "vertical",
  grow = false,
  children,
}: FieldProps): JSX.Element {
  const generatedId = useId();
  const childId = children.props.id ?? generatedId;
  const center = orientation === "vertical" && isCenteredControl(children);

  return (
    <div className={cn("flex", fieldLayoutClass(orientation, center), grow && "min-w-0 flex-1")}>
      <Label htmlFor={childId} icon={icon} iconTone={iconTone} title={title}>
        {label}
      </Label>
      {/* Field owns the label/control pairing; clone is how the generated id reaches the child. */}
      {/* oxlint-disable-next-line react/no-clone-element */}
      {cloneElement(children, { id: childId })}
    </div>
  );
}
