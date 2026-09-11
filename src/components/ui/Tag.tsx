import React from "react";

import { typoClass } from "@/components/ui/typo";
import type { TextSize } from "@/components/ui/typo";
import type { TagColor } from "@/types/ui";
import { cn } from "@/utils/cn";

export type { TagColor } from "@/types/ui";

export type TagSize = TextSize;

export interface TagProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  color?: TagColor;
  size?: TagSize;
  title?: string;
}

const colorStyles: Record<TagColor, string> = {
  amber: "bg-rt-custom-amber/15 text-rt-custom-amber border-rt-custom-amber/50",
  blue: "bg-rt-custom-blue/15 text-rt-custom-blue border-rt-custom-blue/50",
  default: "bg-rt-secondary text-rt-secondary-foreground border-rt-border",
  green: "bg-rt-custom-green/15 text-rt-custom-green border-rt-custom-green/50",
  pink: "bg-rt-custom-pink/15 text-rt-custom-pink border-rt-custom-pink/50",
  primary: "bg-rt-primary/15 text-rt-primary border-rt-primary/50",
  purple: "bg-rt-custom-purple/15 text-rt-custom-purple border-rt-custom-purple/50",
  red: "bg-rt-custom-red/15 text-rt-custom-red border-rt-custom-red/50",
  teal: "bg-rt-custom-teal/15 text-rt-custom-teal border-rt-custom-teal/50",
};

const SIZE_PAD: Record<TagSize, string> = {
  large: "px-2.5 py-1",
  medium: "px-2 py-1",
  small: "px-1.5 py-0.5",
};

export const Tag = React.memo(
  ({ label, children, color = "amber", size = "small", title }: TagProps): React.JSX.Element | null => {
    const content = label ?? children;
    if (!content) {
      return null;
    }

    return (
      <span
        title={title}
        className={cn(
          "inline-flex w-fit items-center border font-rt-mono",
          typoClass("label", size),
          colorStyles[color] ?? colorStyles.amber,
          SIZE_PAD[size] ?? SIZE_PAD.small
        )}
      >
        {content}
      </span>
    );
  }
);
Tag.displayName = "Tag";
