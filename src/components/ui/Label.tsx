import { memo } from "react";
import type { JSX, LabelHTMLAttributes } from "react";

import { Icon } from "@/components/ui/Icon";
import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import type { IconTone } from "@/types/ui";
import { cn } from "@/utils/cn";

export type LabelSize = TextSize;

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> {
  icon?: string;
  iconTone?: IconTone;
  size?: LabelSize;
}

export const Label = memo(
  ({ icon, iconTone, size = "medium", children, htmlFor, ...props }: LabelProps): JSX.Element => {
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
  }
);
Label.displayName = "Label";
