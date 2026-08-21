import type { Option } from "@/config/options";
import type { ActorType, ItemType } from "@/models/documents";

/** Foundry change types offered by the modifiers table; the `custom` type is deliberately omitted. */
export const EFFECT_CHANGE_TYPE_OPTIONS = [
  { value: "add", labelKey: "ROBOTECH.Effect.ChangeType.Add" },
  { value: "subtract", labelKey: "ROBOTECH.Effect.ChangeType.Subtract" },
  { value: "upgrade", labelKey: "ROBOTECH.Effect.ChangeType.Upgrade" },
  { value: "downgrade", labelKey: "ROBOTECH.Effect.ChangeType.Downgrade" },
  { value: "multiply", labelKey: "ROBOTECH.Effect.ChangeType.Multiply" },
  { value: "override", labelKey: "ROBOTECH.Effect.ChangeType.Override" },
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
      { value: "system.armor", labelKey: "ROBOTECH.Character.Armor" },
      { value: "system.speed", labelKey: "ROBOTECH.Character.Speed" },
      //{ value: "system.burnout", labelKey: "ROBOTECH.Character.Burnout" },
      //{ value: "system.level", labelKey: "ROBOTECH.Character.Level" },
      //{ value: "system.buildPoints", labelKey: "ROBOTECH.Character.BuildPoints" },
      { value: "system.vitalsSettings.brawl", labelKey: "ROBOTECH.Wounds.Brawl" },
      { value: "system.vitalsSettings.critical", labelKey: "ROBOTECH.Wounds.Critical" },
      { value: "system.vitalsSettings.isMechaWounds", labelKey: "ROBOTECH.Wounds.MechaClassWounds" },
      { value: "system.vitalsSettings.isTriumvirateWounds", labelKey: "ROBOTECH.Wounds.Triumvirate" },
    ],
  },
  {
    labelKey: "TYPES.Actor.vessel",
    options: [
      //{ value: "system.armor.value", labelKey: "ROBOTECH.Vessel.Armor" },
      { value: "system.armor.max", labelKey: "ROBOTECH.Vessel.Armor" },
      //{ value: "system.structure.value", labelKey: "ROBOTECH.Vessel.Structure" },
      { value: "system.structure.max", labelKey: "ROBOTECH.Vessel.Structure" },
      //{ value: "system.systems.sensors", labelKey: "ROBOTECH.Vessel.Sensors" },
      //{ value: "system.systems.targeting", labelKey: "ROBOTECH.Vessel.Targeting" },
      //{ value: "system.systems.thrusters", labelKey: "ROBOTECH.Vessel.Thrusters" },
      //{ value: "system.systems.engines", labelKey: "ROBOTECH.Vessel.Engines" },
      { value: "system.hardwarePoints", labelKey: "ROBOTECH.Vessel.HardwarePoints" },
      { value: "system.crew", labelKey: "ROBOTECH.Vessel.Crew" },
      { value: "system.speedModes.general.ground", labelKey: "ROBOTECH.Vessel.GroundUnits" },
      { value: "system.speedModes.general.planetary", labelKey: "ROBOTECH.Vessel.PlanetaryUnits" },
      { value: "system.speedModes.general.space", labelKey: "ROBOTECH.Vessel.SpaceUnits" },
    ],
  },
] as const satisfies readonly EffectAttributeGroup[];

/** Actor subtypes whose sheets expose an Effects tab. */
export const EFFECT_ACTOR_TYPES = ["character", "vessel"] as const satisfies readonly ActorType[];

/** Item subtypes whose sheets expose an Effects tab; their effects transfer to the owning actor. */
export const EFFECT_ITEM_TYPES = [
  "career",
  "race",
  "talent",
  "gear",
  "equipment_suite",
  "weapon",
  "feature",
  "upgrade",
] as const satisfies readonly ItemType[];

export function actorHasEffects(actorType: ActorType): boolean {
  return EFFECT_ACTOR_TYPES.some((type) => type === actorType);
}

export function itemHasEffects(itemType: ItemType): boolean {
  return EFFECT_ITEM_TYPES.some((type) => type === itemType);
}
