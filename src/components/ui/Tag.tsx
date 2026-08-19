import React from "react";

import { typoClass, type TextSize } from "@/components/ui/typo";
import { cn } from "@/utils";

export type TagColor = "amber" | "blue" | "red" | "green" | "teal" | "purple" | "pink" | "primary" | "default";

export type TagSize = TextSize;
export type TagVariant = "subtle" | "solid" | "outline";

export interface TagProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  color?: TagColor;
  size?: TagSize;
  variant?: TagVariant;
  title?: string;
}

const colorStyles: Record<TagVariant, Record<TagColor, string>> = {
  subtle: {
    amber: "bg-rt-custom-amber/15 text-rt-custom-amber border-rt-custom-amber/50",
    blue: "bg-rt-custom-blue/15 text-rt-custom-blue border-rt-custom-blue/50",
    red: "bg-rt-custom-red/15 text-rt-custom-red border-rt-custom-red/50",
    green: "bg-rt-custom-green/15 text-rt-custom-green border-rt-custom-green/50",
    teal: "bg-rt-custom-teal/15 text-rt-custom-teal border-rt-custom-teal/50",
    purple: "bg-rt-custom-purple/15 text-rt-custom-purple border-rt-custom-purple/50",
    pink: "bg-rt-custom-pink/15 text-rt-custom-pink border-rt-custom-pink/50",
    primary: "bg-rt-primary/15 text-rt-primary border-rt-primary/50",
    default: "bg-rt-secondary text-rt-secondary-foreground border-rt-border",
  },
  solid: {
    amber: "bg-rt-custom-amber text-rt-primary-foreground border-rt-custom-amber",
    blue: "bg-rt-custom-blue text-rt-primary-foreground border-rt-custom-blue",
    red: "bg-rt-custom-red text-rt-primary-foreground border-rt-custom-red",
    green: "bg-rt-custom-green text-rt-primary-foreground border-rt-custom-green",
    teal: "bg-rt-custom-teal text-rt-primary-foreground border-rt-custom-teal",
    purple: "bg-rt-custom-purple text-rt-primary-foreground border-rt-custom-purple",
    pink: "bg-rt-custom-pink text-rt-primary-foreground border-rt-custom-pink",
    primary: "bg-rt-primary text-rt-primary-foreground border-rt-primary",
    default: "bg-rt-secondary text-rt-secondary-foreground border-rt-border",
  },
  outline: {
    amber: "bg-transparent text-rt-custom-amber border-rt-custom-amber",
    blue: "bg-transparent text-rt-custom-blue border-rt-custom-blue",
    red: "bg-transparent text-rt-custom-red border-rt-custom-red",
    green: "bg-transparent text-rt-custom-green border-rt-custom-green",
    teal: "bg-transparent text-rt-custom-teal border-rt-custom-teal",
    purple: "bg-transparent text-rt-custom-purple border-rt-custom-purple",
    pink: "bg-transparent text-rt-custom-pink border-rt-custom-pink",
    primary: "bg-transparent text-rt-primary border-rt-primary",
    default: "bg-transparent text-rt-foreground border-rt-border",
  },
};

const SIZE_PAD: Record<TagSize, string> = {
  small: "px-1.5 py-0.5",
  medium: "px-2 py-1",
  large: "px-2.5 py-1",
};

export const Tag = React.memo(function Tag({
  label,
  children,
  color = "amber",
  size = "small",
  variant = "subtle",
  title,
}: TagProps): React.JSX.Element {
  const content = label ?? children;
  if (!content) return <></>;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex w-fit items-center border font-rt-mono",
        typoClass("label", size),
        colorStyles[variant]?.[color] ?? colorStyles.subtle.amber,
        SIZE_PAD[size] ?? SIZE_PAD.small,
      )}
    >
      {content}
    </span>
  );
});
