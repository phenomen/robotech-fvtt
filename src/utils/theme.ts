import { THEME_OPTIONS, THEME_VALUES } from "@/config";
import type { ThemeValue } from "@/config";

export const DEFAULT_THEME: ThemeValue = "dark";

export function isTheme(value: string): value is ThemeValue {
  return THEME_VALUES.some((theme) => theme === value);
}

/** Applies a theme to the document root; falls back to the stored setting, then the default. */
export function applyTheme(theme?: string): void {
  const stored = game.settings?.get("robotech", "theme");
  const selectedTheme = theme ?? (typeof stored === "string" ? stored : undefined) ?? DEFAULT_THEME;
  const root = document.documentElement;
  if (!root) {
    return;
  }
  root.dataset.theme = isTheme(selectedTheme) ? selectedTheme : DEFAULT_THEME;
}

export function themeChoices(): Record<string, { group?: string; label: string }> {
  return Object.fromEntries(
    THEME_OPTIONS.map(({ value, labelKey, groupKey }) => [value, { group: groupKey, label: labelKey }])
  );
}
