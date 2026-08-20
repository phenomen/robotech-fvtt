import { cn } from "@/utils";

export type TextVariant = "title" | "label" | "mono" | "copy";
export type TextSize = "small" | "medium" | "large";

export const TYPO_VARIANT: Record<TextVariant, string> = {
  title: "typo-title",
  label: "typo-label",
  mono: "typo-mono",
  copy: "typo-copy",
};

export const TYPO_SIZE: Record<TextSize, string> = {
  small: "typo-small",
  medium: "typo-medium",
  large: "typo-large",
};

export function typoClass(variant: TextVariant, size: TextSize = "medium"): string {
  return cn(TYPO_VARIANT[variant], TYPO_SIZE[size]);
}
