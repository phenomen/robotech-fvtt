import { PLOT_EVENT_PHASE_VALUES } from "@/config/options";
import type { PlotEventPhaseValue } from "@/config/options";
import { ActorDataModel } from "@/models/actors/ActorDataModel";

export interface PlotEventRounds {
  risingAction: number;
  climax: number;
  conclusion: number;
}

export class PlotEventDataModel extends ActorDataModel {
  declare eventLevel: number;
  declare rounds: PlotEventRounds;
  declare activePhase: PlotEventPhaseValue | "";
  declare conflictUuids: string[];

  static override defineSchema() {
    const fields = foundry.data.fields;
    const roundField = () => new fields.NumberField({ initial: 0, integer: true, min: 0 });
    return {
      ...super.defineSchema(),
      activePhase: new fields.StringField({
        blank: true,
        choices: PLOT_EVENT_PHASE_VALUES,
        initial: "",
        required: true,
      }),
      conflictUuids: new fields.ArrayField(new fields.StringField({ initial: "" }), {
        initial: [],
      }),
      eventLevel: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      rounds: new fields.SchemaField({
        climax: roundField(),
        conclusion: roundField(),
        risingAction: roundField(),
      }),
    };
  }
}
