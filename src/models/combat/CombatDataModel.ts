import { COMBAT_PHASE_VALUES } from "@/config/options";
import type { CombatPhaseValue } from "@/config/options";
import type { ParentOf } from "@/models/documents";

type CombatDocument = foundry.documents.Combat;

export class CombatDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<CombatDocument>;

  declare phase: CombatPhaseValue;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      phase: new fields.StringField({
        choices: COMBAT_PHASE_VALUES,
        initial: COMBAT_PHASE_VALUES[0],
      }),
    };
  }
}
