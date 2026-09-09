import { SLOT_PHASE_VALUES } from "@/config/options";
import type { SlotPhaseValue } from "@/config/options";
import type { ParentOf } from "@/models/documents";

type CombatantDocument = foundry.documents.Combatant;

export const SKILL_USES_PER_ROUND = 2;
export const SUITE_USES_PER_ROUND = 1;

/** What an action consumed from the round budget. */
export interface ActionUsage {
  skills: number;
  suite: boolean;
  dice?: number;
}

/** Round state already recorded for a combatant. */
export interface RoundUsage {
  skillsUsed: number;
  suiteUsed: boolean;
  diceUsed: number;
  log: ActionLogEntry[];
}

/** A taken action, recorded for display on the tracker card. */
export interface ActionLogEntry {
  action: string;
  phase: SlotPhaseValue | "";
  pushed: boolean;
}

export class CombatantDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<CombatantDocument>;

  declare skillsUsed: number;
  declare suiteUsed: boolean;
  declare diceUsed: number;
  declare log: ActionLogEntry[];
  declare pool: number;
  declare sort: number | null;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      diceUsed: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      log: new fields.ArrayField(actionLogField(), { initial: () => [] }),
      pool: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      skillsUsed: new fields.NumberField({ initial: 0, integer: true, max: SKILL_USES_PER_ROUND, min: 0 }),
      sort: new fields.NumberField({ initial: null, integer: true, nullable: true }),
      suiteUsed: new fields.BooleanField({ initial: false }),
    };
  }
}

function actionLogField() {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    action: new fields.StringField({ blank: true, initial: "" }),
    phase: new fields.StringField({ blank: true, choices: ["", ...SLOT_PHASE_VALUES], initial: "" }),
    pushed: new fields.BooleanField({ initial: false }),
  });
}
