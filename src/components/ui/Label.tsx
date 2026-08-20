import React from "react";

import { Icon } from "@/components/ui/Icon";
import { typoClass, type TextSize } from "@/components/ui/typo";
import { cn } from "@/utils";

export type LabelSize = TextSize;

export interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "className"> {
  icon?: string;
  iconTone?: "default" | "primary" | "muted" | "danger" | "current" | "green" | "teal" | "blue" | "amber";
  size?: LabelSize;
}

export const Label = React.memo(function Label({
  icon,
  iconTone,
  size = "medium",
  children,
  htmlFor,
  ...props
}: LabelProps): React.JSX.Element {
  const Component = htmlFor ? "label" : "span";
  return (
    <Component
      htmlFor={htmlFor}
      className={cn(typoClass("label", size), "text-rt-secondary-foreground inline-flex items-center gap-1")}
      {...props}
    >
      {icon && <Icon name={icon} tone={iconTone} />}
      {children}
    </Component>
  );
});
