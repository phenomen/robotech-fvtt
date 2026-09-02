import React from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import { GRADATION } from "@/config";
import type { GradationKey } from "@/config";
import { cn } from "@/utils";

export type ButtonType = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = TextSize | "icon" | "tracker";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonType;
  size?: ButtonSize;
  full?: boolean;
  align?: "start" | "center";
  gradation?: GradationKey;
  children?: React.ReactNode;
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  icon: "size-7! min-h-0! p-0! shrink-0 aspect-square",
  large: "h-8! min-h-0! px-4! py-1.5!",
  medium: "h-auto! min-h-0! px-3! py-1!",
  small: "h-auto! min-h-0! px-2! py-0.5!",
  tracker: "size-8! min-h-0! p-0! shrink-0 aspect-square",
};

const BUTTON_TYPO: Record<ButtonSize, TextSize> = {
  icon: "medium",
  large: "large",
  medium: "medium",
  small: "small",
  tracker: "medium",
};

const VARIANT_CLASS: Record<ButtonType, string> = {
  danger:
    "bg-transparent text-rt-danger border-rt-danger/50! hover:bg-rt-danger hover:text-rt-danger-foreground hover:border-rt-danger! focus:border-rt-danger! focus:outline-none! active:bg-rt-input",
  ghost: "bg-transparent text-rt-foreground hover:text-rt-primary border-none! shadow-none! p-0!",
  outline:
    "bg-transparent text-rt-foreground border-rt-border! hover:bg-rt-secondary hover:text-rt-secondary-foreground hover:border-rt-primary! focus:border-rt-primary! focus:outline-none! active:bg-rt-input",
  primary:
    "bg-rt-primary text-rt-primary-foreground border-rt-primary! hover:bg-rt-primary/80 hover:text-rt-primary-foreground hover:border-rt-primary! focus:border-rt-primary! focus:outline-none! active:bg-rt-input",
  secondary:
    "bg-rt-secondary text-rt-secondary-foreground border-rt-border! hover:bg-rt-input hover:text-rt-foreground hover:border-rt-primary! focus:border-rt-primary! focus:outline-none! active:bg-rt-input",
};

function buttonToneClass(buttonType: ButtonType, gradation?: GradationKey): string {
  if (!gradation) {
    return VARIANT_CLASS[buttonType];
  }
  if (buttonType === "primary") {
    return GRADATION[gradation].buttonClass;
  }
  return GRADATION[gradation].buttonIdleClass;
}

export const Button = React.memo(
  ({
    variant,
    size = "medium",
    full = false,
    align = "center",
    gradation,
    children,
    ...props
  }: ButtonProps): React.JSX.Element => {
    const buttonType = variant ?? "secondary";
    const toneClass = buttonToneClass(buttonType, gradation);

    return (
      <button
        type="button"
        className={cn(
          typoClass("mono", BUTTON_TYPO[size]),
          "flex cursor-pointer items-center gap-1! border font-rt-mono tracking-wider! outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          align === "start" ? "justify-start" : "justify-center",
          buttonType !== "ghost" && "uppercase",
          SIZE_CLASS[size],
          toneClass,
          full && "w-full"
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
