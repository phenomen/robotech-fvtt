import type { EffectChangeType } from "@/config/effects";

/**
 * One row of `effect.system.changes`, matching Foundry's `ActiveEffectTypeDataModel` schema.
 * `value` is backed by an `AnyField`, so the sheet stores it as the raw string the user typed and
 * Foundry casts it to the target field's type when the change is applied.
 */
export interface EffectChange {
  key: string;
  type: EffectChangeType;
  value: string;
  phase: string;
  priority: number | null;
}
