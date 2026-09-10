import type { JSX } from "react";

import { cn } from "@/utils/cn";

export type PortraitSize = "small" | "medium" | "large";

const SIZE_CLASS: Record<PortraitSize, string> = {
  large: "size-26",
  medium: "size-12",
  small: "size-8",
};

export interface PortraitProps {
  src: string;
  alt: string;
  title?: string;
  size?: PortraitSize;
  onClick?: () => void;
}

export function Portrait({ src, alt, title, size = "medium", onClick }: PortraitProps): JSX.Element {
  if (!onClick) {
    return (
      <img
        src={src}
        alt={alt}
        title={title}
        className={cn("bg-rt-secondary shrink-0 object-cover border", SIZE_CLASS[size])}
      />
    );
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "bg-rt-secondary shrink-0 cursor-pointer overflow-hidden border p-0 hover:border-rt-primary",
        SIZE_CLASS[size]
      )}
    >
      <img src={src} alt={alt} className="size-full object-cover" />
    </button>
  );
}
