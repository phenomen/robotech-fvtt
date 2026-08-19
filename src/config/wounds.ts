export const MAX_BRAWL_WOUNDS = 20;
export const MAX_CRITICAL_WOUNDS = 10;
export const STRESS_BOX_COUNT = 5;
export const MENTAL_BREAK_THRESHOLD = 5;

const BASE_WOUNDS = { brawl: 3, critical: 1 };
const TRIUMVIRATE_WOUNDS = { brawl: 6, critical: 3 };

/** Wound counts a character starts from before the per-actor overrides are applied. */
export function woundBaselines(isTriumvirate: boolean): { brawl: number; critical: number } {
  return isTriumvirate ? TRIUMVIRATE_WOUNDS : BASE_WOUNDS;
}
