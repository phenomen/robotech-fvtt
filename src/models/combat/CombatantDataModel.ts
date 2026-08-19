import { SLOT_PHASE_VALUES, type SlotPhaseValue } from "@/config/choices";
import type { ParentOf } from "@/models/documents";

type CombatantDocument = foundry.documents.Combatant;

export const ACTION_SLOT_COUNT = 2;

export interface ActionSlot {
  action: string;
  phase: SlotPhaseValue | "";
  heightened: boolean;
  used: boolean;
}

export class CombatantDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<CombatantDocument>;

  declare slots: ActionSlot[];
  declare pool: number;
  declare sort: number | null;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      slots: new fields.ArrayField(actionSlotField(), { initial: emptySlots }),
      pool: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      sort: new fields.NumberField({ integer: true, nullable: true, initial: null }),
    };
  }
}

function actionSlotField() {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    action: new fields.StringField({ initial: "", blank: true }),
    phase: new fields.StringField({ initial: "", blank: true, choices: ["", ...SLOT_PHASE_VALUES] }),
    heightened: new fields.BooleanField({ initial: false }),
    used: new fields.BooleanField({ initial: false }),
  });
}

export function emptySlot(): ActionSlot {
  return { action: "", phase: "", heightened: false, used: false };
}

export function emptySlots(): ActionSlot[] {
  return Array.from({ length: ACTION_SLOT_COUNT }, () => emptySlot());
}
