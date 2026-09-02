import { cn } from "@/utils";

export type TextVariant = "title" | "label" | "mono" | "copy";
export type TextSize = "small" | "medium" | "large";

export const TYPO_VARIANT: Record<TextVariant, string> = {
  copy: "typo-copy",
  label: "typo-label",
  mono: "typo-mono",
  title: "typo-title",
};

export const TYPO_SIZE: Record<TextSize, string> = {
  large: "typo-large",
  medium: "typo-medium",
  small: "typo-small",
};

export function typoClass(variant: TextVariant, size: TextSize = "medium"): string {
  return cn(TYPO_VARIANT[variant], TYPO_SIZE[size]);
}
