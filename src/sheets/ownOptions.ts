import type { AppOptions } from "@/types/application";

/**
 * ApplicationV2 merges `DEFAULT_OPTIONS` down the class chain on its own and concatenates arrays as it
 * goes, so a subclass that spreads `super.DEFAULT_OPTIONS` duplicates inherited entries such as header
 * controls. A subclass declares only its own keys; this types them as the parent's options.
 */
// eslint-disable-next-line typescript/no-unnecessary-type-parameters -- T is the parent class's options type the override must match.
export function ownOptions<T extends object>(options: NonNullable<AppOptions>): T {
  return options as T;
}
