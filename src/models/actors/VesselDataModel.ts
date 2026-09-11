import {
  ARMOR_CLASS_VALUES,
  ROLL_MODIFIER_VALUES,
  SPEED_UNIT_OPTIONS,
  SPEED_UNIT_VALUES,
  VESSEL_MODE_VALUES,
  VESSEL_TYPE_VALUES,
  isChoiceValue,
} from "@/config/options";
import type {
  ArmorClassValue,
  RollModifierValue,
  SpeedUnitValue,
  VesselModeValue,
  VesselTypeValue,
} from "@/config/options";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import { clampGauge, gaugeSchema } from "@/models/actors/gaugeSchema";
import type { Gauge } from "@/models/actors/gaugeSchema";
import { calcEngineSpeed } from "@/utils/vesselUtils";

export interface SpeedUnit {
  selected: SpeedUnitValue;
  game: number;
  ground: number;
  planetary: number;
  space: number;
}

export interface VesselSystems {
  sensors: RollModifierValue;
  targeting: RollModifierValue;
  thrusters: RollModifierValue;
  engines: number;
}

/** Systems whose level is a roll modifier rather than a numeric step. */
export type VesselSystemName = Exclude<keyof VesselSystems, "engines">;

/** Transformable mecha track a speed set per mode; everything else uses the general set. */
export type SpeedModeName = "general" | VesselModeValue;

export class VesselDataModel extends ActorDataModel {
  declare vesselType: VesselTypeValue;
  declare designation: string;
  declare organization: string;
  declare requiredRank: number;
  declare classification: string;
  declare transformable: boolean;
  declare mode: VesselModeValue;
  declare isBasic: boolean;
  declare armorClass: ArmorClassValue;
  declare resistance: number;
  declare structure: Gauge;
  declare armor: Gauge;
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
        game: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        ground: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        planetary: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        selected: new fields.StringField({ choices: SPEED_UNIT_VALUES, initial: "ground" }),
        space: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      });

    const ratingField = () => new fields.StringField({ choices: ROLL_MODIFIER_VALUES, initial: "nominal" });

    return {
      ...super.defineSchema(),
      armor: gaugeSchema(2),
      armorClass: new fields.StringField({
        choices: ARMOR_CLASS_VALUES,
        // "mecha"
        initial: ARMOR_CLASS_VALUES[1],
      }),
      characterUuids: new fields.ArrayField(new fields.StringField({ initial: "" }), {
        initial: [],
      }),
      classification: new fields.StringField({ initial: "" }),
      crew: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      designation: new fields.StringField({ initial: "" }),
      hardwarePoints: new fields.NumberField({ initial: 4, integer: true, min: 0 }),
      isBasic: new fields.BooleanField({ initial: false }),
      mode: new fields.StringField({
        choices: VESSEL_MODE_VALUES,
        // "fighter"
        initial: VESSEL_MODE_VALUES[0],
      }),
      organization: new fields.StringField({ initial: "" }),
      requiredRank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      resistance: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      speedModes: new fields.SchemaField({
        battloid: speedUnitSchema(),
        fighter: speedUnitSchema(),
        general: speedUnitSchema(),
        guardian: speedUnitSchema(),
      }),
      structure: gaugeSchema(2),
      systems: new fields.SchemaField({
        engines: new fields.NumberField({
          initial: 4,
          integer: true,
          max: 4,
          min: 0,
        }),
        sensors: ratingField(),
        targeting: ratingField(),
        thrusters: ratingField(),
      }),
      transformable: new fields.BooleanField({ initial: false }),
      vesselType: new fields.StringField({
        choices: VESSEL_TYPE_VALUES,
        // "mecha"
        initial: VESSEL_TYPE_VALUES[2],
      }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.activeSpeed = this.computeActiveSpeed();
    this.speed = this.activeSpeed.game;
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2]
  ): Promise<boolean | void> {
    clampGauge(this.structure, changes, "system.structure");
    clampGauge(this.armor, changes, "system.armor");
    return await super._preUpdate(changes, options, user);
  }

  get activeSpeedMode(): SpeedModeName {
    const isTransformableMecha = this.vesselType === "mecha" && this.transformable;
    return isTransformableMecha ? this.mode : "general";
  }

  private computeActiveSpeed(): SpeedUnit {
    const base = this.speedModes[this.activeSpeedMode] ?? this.speedModes.general;
    const engineLevel = this.systems.engines;
    const selected = isChoiceValue(SPEED_UNIT_OPTIONS, base.selected) ? base.selected : "ground";
    const selectedSpeed = base[selected] ?? 0;

    return {
      game: calcEngineSpeed(selectedSpeed, engineLevel),
      ground: calcEngineSpeed(base.ground, engineLevel),
      planetary: calcEngineSpeed(base.planetary, engineLevel),
      selected,
      space: calcEngineSpeed(base.space, engineLevel),
    };
  }
}
