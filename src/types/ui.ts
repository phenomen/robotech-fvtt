/**
 * UI vocabulary shared between the presentation layer and non-React game logic (damage, weapons,
 * chat cards). Keeping these unions here lets `utils/` and `config/` describe UI outcomes without
 * importing from `components/`.
 */

export type IconTone = "default" | "primary" | "muted" | "danger" | "current" | "green" | "teal" | "blue" | "amber";

export const TAG_COLOR_VALUES = [
  "amber",
  "blue",
  "red",
  "green",
  "teal",
  "purple",
  "pink",
  "primary",
  "default",
] as const;

export type TagColor = (typeof TAG_COLOR_VALUES)[number];
