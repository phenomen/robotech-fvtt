import { SLOT_PHASE_VALUES, type SlotPhaseValue } from "@/config/options";
import type { ParentOf } from "@/models/documents";

type CombatantDocument = foundry.documents.Combatant;

export const SKILL_USES_PER_ROUND = 2;
export const SUITE_USES_PER_ROUND = 1;

/** What an action consumed from the round budget. */
export interface ActionUsage {
  skills: number;
  suite: boolean;
}

/** Round state already recorded for a combatant. */
export interface RoundUsage {
  skillsUsed: number;
  suiteUsed: boolean;
  log: ActionLogEntry[];
}

/** A taken action, recorded for display on the tracker card. */
export interface ActionLogEntry {
  action: string;
  phase: SlotPhaseValue | "";
  heightened: boolean;
}

export class CombatantDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<CombatantDocument>;

  declare skillsUsed: number;
  declare suiteUsed: boolean;
  declare log: ActionLogEntry[];
  declare pool: number;
  declare sort: number | null;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      skillsUsed: new fields.NumberField({ initial: 0, integer: true, min: 0, max: SKILL_USES_PER_ROUND }),
      suiteUsed: new fields.BooleanField({ initial: false }),
      log: new fields.ArrayField(actionLogField(), { initial: () => [] }),
      pool: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      sort: new fields.NumberField({ integer: true, nullable: true, initial: null }),
    };
  }
}

function actionLogField() {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    action: new fields.StringField({ initial: "", blank: true }),
    phase: new fields.StringField({ initial: "", blank: true, choices: ["", ...SLOT_PHASE_VALUES] }),
    heightened: new fields.BooleanField({ initial: false }),
  });
}
