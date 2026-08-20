import { cloneElement, useId, type JSX, type ReactElement, type ReactNode } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { type IconTone } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { cn } from "@/utils";

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

export function Field({
  label,
  icon,
  iconTone,
  title,
  orientation = "vertical",
  grow = false,
  children,
}: FieldProps): JSX.Element {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const center = orientation === "vertical" && isCenteredControl(children);

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical"
          ? cn("flex-col gap-1", center ? "items-center" : "items-start")
          : "flex-row items-center justify-between gap-2",
        grow && "min-w-0 flex-1",
      )}
    >
      <Label htmlFor={id} icon={icon} iconTone={iconTone} title={title}>
        {label}
      </Label>
      {cloneElement(children, { id })}
    </div>
  );
}
