import { CONFLICT_RECOGNITION_VALUES, CONFLICT_THREAT_VALUES, CONFLICT_TYPE_VALUES } from "@/config/options";
import type { ConflictRecognitionValue, ConflictThreatValue, ConflictTypeValue } from "@/config/options";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import { syncBoxTracker } from "@/utils/trackers";

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
      actorUuids: new fields.ArrayField(new fields.StringField({ initial: "" }), { initial: [] }),
      armor: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      conflictType: new fields.StringField({
        choices: CONFLICT_TYPE_VALUES,
        initial: CONFLICT_TYPE_VALUES[0],
      }),
      plotEventUuid: new fields.StringField({ initial: "" }),
      pool: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      recognition: new fields.StringField({
        choices: CONFLICT_RECOGNITION_VALUES,
        initial: CONFLICT_RECOGNITION_VALUES[4],
      }),
      threat: new fields.StringField({
        choices: CONFLICT_THREAT_VALUES,
        initial: CONFLICT_THREAT_VALUES[0],
      }),
      tracker: new fields.SchemaField({
        max: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
        value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    syncBoxTracker(this.tracker);
  }
}
