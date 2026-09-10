import type { Option } from "@/config/options";

/** Foundry change types offered by the modifiers table; the `custom` type is deliberately omitted. */
export const EFFECT_CHANGE_TYPE_OPTIONS = [
  { labelKey: "ROBOTECH.Effect.ChangeType.Add", value: "add" },
  { labelKey: "ROBOTECH.Effect.ChangeType.Subtract", value: "subtract" },
  { labelKey: "ROBOTECH.Effect.ChangeType.Upgrade", value: "upgrade" },
  { labelKey: "ROBOTECH.Effect.ChangeType.Downgrade", value: "downgrade" },
  { labelKey: "ROBOTECH.Effect.ChangeType.Multiply", value: "multiply" },
  { labelKey: "ROBOTECH.Effect.ChangeType.Override", value: "override" },
] as const satisfies readonly Option[];
export type EffectChangeType = (typeof EFFECT_CHANGE_TYPE_OPTIONS)[number]["value"];

export const DEFAULT_CHANGE_TYPE: EffectChangeType = "add";

export interface EffectAttributeGroup {
  labelKey: string;
  options: readonly Option[];
}

/**
 * Premade change keys offered by the Attribute column. Fields recomputed by `prepareDerivedData`
 * are excluded because an effect applied to them would be overwritten during preparation.
 */
export const EFFECT_ATTRIBUTE_GROUPS = [
  {
    labelKey: "TYPES.Actor.character",
    options: [
      { labelKey: "ROBOTECH.Character.Armor", value: "system.armor.max" },
      { labelKey: "ROBOTECH.Character.Resistance", value: "system.resistance" },
      { labelKey: "ROBOTECH.Character.Speed", value: "system.speed" },
      //{ value: "system.burnout", labelKey: "ROBOTECH.Character.Burnout" },
      //{ value: "system.level", labelKey: "ROBOTECH.Character.Level" },
      //{ value: "system.buildPoints", labelKey: "ROBOTECH.Character.BuildPoints" },
      { labelKey: "ROBOTECH.Wounds.Brawl", value: "system.vitalsSettings.brawl" },
      { labelKey: "ROBOTECH.Wounds.Critical", value: "system.vitalsSettings.critical" },
      { labelKey: "ROBOTECH.ArmorClass.Title", value: "system.armorClass" },
      { labelKey: "ROBOTECH.Wounds.Triumvirate", value: "system.vitalsSettings.isTriumvirateWounds" },
    ],
  },
  {
    labelKey: "TYPES.Actor.vessel",
    options: [
      //{ value: "system.armor.value", labelKey: "ROBOTECH.Vessel.Armor" },
      { labelKey: "ROBOTECH.ArmorClass.Title", value: "system.armorClass" },
      { labelKey: "ROBOTECH.Vessel.Armor", value: "system.armor.max" },
      { labelKey: "ROBOTECH.Vessel.Resistance", value: "system.resistance" },
      //{ value: "system.structure.value", labelKey: "ROBOTECH.Vessel.Structure" },
      { labelKey: "ROBOTECH.Vessel.Structure", value: "system.structure.max" },
      //{ value: "system.systems.sensors", labelKey: "ROBOTECH.Vessel.Sensors" },
      //{ value: "system.systems.targeting", labelKey: "ROBOTECH.Vessel.Targeting" },
      //{ value: "system.systems.thrusters", labelKey: "ROBOTECH.Vessel.Thrusters" },
      //{ value: "system.systems.engines", labelKey: "ROBOTECH.Vessel.Engines" },
      { labelKey: "ROBOTECH.Vessel.HardwarePoints", value: "system.hardwarePoints" },
      { labelKey: "ROBOTECH.Vessel.Crew", value: "system.crew" },
      { labelKey: "ROBOTECH.Vessel.GroundUnits", value: "system.speedModes.general.ground" },
      { labelKey: "ROBOTECH.Vessel.PlanetaryUnits", value: "system.speedModes.general.planetary" },
      { labelKey: "ROBOTECH.Vessel.SpaceUnits", value: "system.speedModes.general.space" },
    ],
  },
] as const satisfies readonly EffectAttributeGroup[];
