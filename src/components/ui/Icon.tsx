import React from "react";

import { cn } from "@/utils";

export type IconTone = "default" | "primary" | "muted" | "danger" | "current" | "green" | "teal" | "blue" | "amber";

interface IconProps {
  name: string;
  size?: "small" | "medium" | "large";
  tone?: IconTone;
  title?: string;
}

const SIZE_CLASS = {
  large: "size-6",
  medium: "size-4",
  small: "size-3",
} as const;

const TONE_CLASS = {
  amber: "text-rt-custom-amber",
  blue: "text-rt-custom-blue",
  current: "text-current",
  danger: "text-rt-danger",
  default: "",
  green: "text-rt-custom-green",
  muted: "text-rt-muted",
  primary: "text-rt-primary",
  teal: "text-rt-custom-teal",
} as const;

export const Icon = React.memo(({ name, size = "medium", tone = "default", title }: IconProps): React.JSX.Element => {
  const path = `systems/robotech/assets/icons/${name}.svg`;
  return (
    <span
      title={title}
      className={cn("inline-block shrink-0 bg-current", SIZE_CLASS[size], TONE_CLASS[tone])}
      style={{
        WebkitMaskImage: `url('${path}')`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url('${path}')`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
      }}
    />
  );
});
Icon.displayName = "Icon";
