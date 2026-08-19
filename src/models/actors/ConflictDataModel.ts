import {
  CONFLICT_RECOGNITION_VALUES,
  CONFLICT_THREAT_VALUES,
  CONFLICT_TYPE_VALUES,
  type ConflictRecognitionValue,
  type ConflictThreatValue,
  type ConflictTypeValue,
} from "@/config/choices";
import { ActorDataModel } from "@/models/actors/ActorDataModel";

export interface ConflictTracker {
  max: number;
  value: number;
  states: boolean[];
}

export class ConflictDataModel extends ActorDataModel {
  declare plotEventUuid: string;
  declare conflictType: ConflictTypeValue;
  declare recognition: ConflictRecognitionValue;
  declare threat: ConflictThreatValue;
  declare pool: number;
  declare armor: number;
  declare actorUuids: string[];
  declare tracker: ConflictTracker;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      plotEventUuid: new fields.StringField({ initial: "" }),
      conflictType: new fields.StringField({
        initial: CONFLICT_TYPE_VALUES[0],
        choices: CONFLICT_TYPE_VALUES,
      }),
      recognition: new fields.StringField({
        initial: CONFLICT_RECOGNITION_VALUES[4],
        choices: CONFLICT_RECOGNITION_VALUES,
      }),
      threat: new fields.StringField({
        initial: CONFLICT_THREAT_VALUES[0],
        choices: CONFLICT_THREAT_VALUES,
      }),
      pool: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      armor: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      actorUuids: new fields.ArrayField(new fields.StringField({ initial: "" }), { initial: [] }),
      tracker: new fields.SchemaField({
        max: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
      }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.syncTracker();
  }

  private syncTracker(): void {
    const tracker = this.tracker;
    const max = Math.max(0, tracker.max);
    tracker.max = max;
    const previous = tracker.states;
    if (previous.length !== max) {
      tracker.states = Array.from({ length: max }, (_unused, index) => previous[index] ?? false);
    }
    tracker.value = tracker.states.filter(Boolean).length;
  }
}
