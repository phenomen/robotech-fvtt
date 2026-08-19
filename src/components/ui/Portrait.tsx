import { type JSX } from "react";

import { cn } from "@/utils";

export type PortraitSize = "small" | "medium" | "large";

const SIZE_CLASS: Record<PortraitSize, string> = {
  small: "size-8",
  medium: "size-12",
  large: "size-26",
};

export interface PortraitProps {
  src: string;
  alt: string;
  title?: string;
  size?: PortraitSize;
  onClick?: () => void;
}

export function Portrait({ src, alt, title, size = "medium", onClick }: PortraitProps): JSX.Element {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      onClick={onClick}
      className={cn(
        "bg-rt-secondary shrink-0 object-cover border",
        SIZE_CLASS[size],
        onClick && "cursor-pointer hover:border-rt-primary",
      )}
    />
  );
}
