import {
  SPEED_UNIT_VALUES,
  SYSTEM_RATING_VALUES,
  VESSEL_MODE_VALUES,
  VESSEL_TYPE_VALUES,
  type SpeedUnitValue,
  type SystemRatingValue,
  type VesselModeValue,
  type VesselTypeValue,
} from "@/config/choices";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import { calcEngineSpeed } from "@/utils/vesselUtils";

export interface SpeedUnit {
  selected: SpeedUnitValue;
  game: number;
  ground: number;
  planetary: number;
  space: number;
}

export interface VesselGauge {
  value: number;
  max: number;
}

export interface VesselSystems {
  sensors: SystemRatingValue;
  targeting: SystemRatingValue;
  thrusters: SystemRatingValue;
  engines: number;
}

/** Systems whose level is expressed as a rating rather than a numeric step. */
export type VesselSystemName = Exclude<keyof VesselSystems, "engines">;

/** Transformable mecha track a speed set per mode; everything else uses the general set. */
export type SpeedModeName = "general" | VesselModeValue;

export class VesselDataModel extends ActorDataModel {
  declare vesselType: VesselTypeValue;
  declare designation: string;
  declare faction: string;
  declare requiredRank: number;
  declare classification: string;
  declare transformable: boolean;
  declare mode: VesselModeValue;
  declare isBasic: boolean;
  declare structure: VesselGauge;
  declare armor: VesselGauge;
  declare systems: VesselSystems;
  declare speedModes: Record<SpeedModeName, SpeedUnit>;
  declare hardwarePoints: number;
  declare crew: number;
  declare characterUuids: string[];

  declare activeSpeed: SpeedUnit;
  declare speed: number;

  static override defineSchema() {
    const fields = foundry.data.fields;

    const speedUnitSchema = () =>
      new fields.SchemaField({
        selected: new fields.StringField({ initial: "ground", choices: SPEED_UNIT_VALUES }),
        game: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        ground: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        planetary: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        space: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      });

    const ratingField = () =>
      new fields.StringField({ initial: SYSTEM_RATING_VALUES[2], choices: SYSTEM_RATING_VALUES });

    return {
      ...super.defineSchema(),
      vesselType: new fields.StringField({
        initial: VESSEL_TYPE_VALUES[2], // "mecha"
        choices: VESSEL_TYPE_VALUES,
      }),
      designation: new fields.StringField({ initial: "" }),
      faction: new fields.StringField({ initial: "" }),
      requiredRank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      classification: new fields.StringField({ initial: "" }),
      transformable: new fields.BooleanField({ initial: false }),
      mode: new fields.StringField({
        initial: VESSEL_MODE_VALUES[0], // "fighter"
        choices: VESSEL_MODE_VALUES,
      }),
      isBasic: new fields.BooleanField({ initial: false }),
      structure: new fields.SchemaField({
        value: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
      }),
      armor: new fields.SchemaField({
        value: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 2, integer: true, min: 0 }),
      }),
      systems: new fields.SchemaField({
        sensors: ratingField(),
        targeting: ratingField(),
        thrusters: ratingField(),
        engines: new fields.NumberField({
          initial: 4,
          integer: true,
          min: 0,
          max: 4,
        }),
      }),
      speedModes: new fields.SchemaField({
        general: speedUnitSchema(),
        fighter: speedUnitSchema(),
        guardian: speedUnitSchema(),
        battloid: speedUnitSchema(),
      }),
      hardwarePoints: new fields.NumberField({ initial: 4, integer: true, min: 0 }),
      crew: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      characterUuids: new fields.ArrayField(new fields.StringField({ initial: "" }), {
        initial: [],
      }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.activeSpeed = this.computeActiveSpeed();
    this.speed = this.activeSpeed.game;
  }

  get activeSpeedMode(): SpeedModeName {
    const isTransformableMecha = this.vesselType === "mecha" && this.transformable;
    return isTransformableMecha ? this.mode : "general";
  }

  private computeActiveSpeed(): SpeedUnit {
    const base = this.speedModes[this.activeSpeedMode];
    const engineLevel = this.systems.engines;

    return {
      selected: base.selected,
      game: calcEngineSpeed(base[base.selected], engineLevel),
      ground: calcEngineSpeed(base.ground, engineLevel),
      planetary: calcEngineSpeed(base.planetary, engineLevel),
      space: calcEngineSpeed(base.space, engineLevel),
    };
  }
}
