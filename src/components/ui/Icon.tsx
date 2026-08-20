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
  small: "size-3",
  medium: "size-4",
  large: "size-6",
} as const;

const TONE_CLASS = {
  default: "",
  primary: "text-rt-primary",
  muted: "text-rt-muted",
  danger: "text-rt-danger",
  current: "text-current",
  green: "text-rt-custom-green",
  teal: "text-rt-custom-teal",
  blue: "text-rt-custom-blue",
  amber: "text-rt-custom-amber",
} as const;

export const Icon = React.memo(function Icon({
  name,
  size = "medium",
  tone = "default",
  title,
}: IconProps): React.JSX.Element {
  const path = `systems/robotech/assets/icons/${name}.svg`;
  return (
    <span
      title={title}
      className={cn("inline-block shrink-0 bg-current", SIZE_CLASS[size], TONE_CLASS[tone])}
      style={{
        maskImage: `url('${path}')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url('${path}')`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
});
