export interface Option {
  value: string;
  labelKey: string;
}

/** Keeps the literal value types of an option list while staying assignable to a field's `options`. */
function toValues<const T extends readonly Option[]>(options: T): T[number]["value"][] {
  return options.map((option) => option.value);
}

export function isChoiceValue<const T extends readonly Option[]>(
  options: T,
  value: string
): value is T[number]["value"] {
  return options.some((option) => option.value === value);
}

export const WEALTH_OPTIONS = [
  { labelKey: "ROBOTECH.Wealth.Low", value: "low" },
  { labelKey: "ROBOTECH.Wealth.Standard", value: "standard" },
  { labelKey: "ROBOTECH.Wealth.High", value: "high" },
  { labelKey: "ROBOTECH.Wealth.Ultra", value: "ultra" },
] as const satisfies readonly Option[];
export const WEALTH_VALUES = toValues(WEALTH_OPTIONS);
export type WealthValue = (typeof WEALTH_VALUES)[number];

export const VESSEL_TYPE_OPTIONS = [
  { labelKey: "ROBOTECH.Vessel.TypeInfantry", value: "infantry" },
  { labelKey: "ROBOTECH.Vessel.TypeVehicle", value: "vehicle" },
  { labelKey: "ROBOTECH.Vessel.TypeMecha", value: "mecha" },
  { labelKey: "ROBOTECH.Vessel.TypeNaval", value: "naval" },
] as const satisfies readonly Option[];
export const VESSEL_TYPE_VALUES = toValues(VESSEL_TYPE_OPTIONS);
export type VesselTypeValue = (typeof VESSEL_TYPE_VALUES)[number];

export const TALENT_CATEGORY_OPTIONS = [
  { labelKey: "ROBOTECH.Talents.Category.Leadership", value: "leadership" },
  { labelKey: "ROBOTECH.Talents.Category.Piloting", value: "piloting" },
  { labelKey: "ROBOTECH.Talents.Category.Social", value: "social" },
  { labelKey: "ROBOTECH.Talents.Category.Tactical", value: "tactical" },
  { labelKey: "ROBOTECH.Talents.Category.Technical", value: "technical" },
] as const satisfies readonly Option[];
export const TALENT_CATEGORY_VALUES = toValues(TALENT_CATEGORY_OPTIONS);
export type TalentCategoryValue = (typeof TALENT_CATEGORY_VALUES)[number];

export const SPEED_UNIT_OPTIONS = [
  { labelKey: "ROBOTECH.Vessel.GroundUnits", value: "ground" },
  { labelKey: "ROBOTECH.Vessel.PlanetaryUnits", value: "planetary" },
  { labelKey: "ROBOTECH.Vessel.SpaceUnits", value: "space" },
] as const satisfies readonly Option[];
export const SPEED_UNIT_VALUES = toValues(SPEED_UNIT_OPTIONS);
export type SpeedUnitValue = (typeof SPEED_UNIT_VALUES)[number];

export const DAMAGE_TYPE_OPTIONS = [
  { labelKey: "ROBOTECH.Damage.DamageClass.light", value: "light" },
  { labelKey: "ROBOTECH.Damage.DamageClass.mecha", value: "mecha" },
  { labelKey: "ROBOTECH.Damage.DamageClass.naval", value: "naval" },
] as const satisfies readonly Option[];
export const DAMAGE_TYPE_VALUES = toValues(DAMAGE_TYPE_OPTIONS);
export type DamageTypeValue = (typeof DAMAGE_TYPE_VALUES)[number];

export const ARMOR_CLASS_OPTIONS = [
  { labelKey: "ROBOTECH.ArmorClass.light", value: "light" },
  { labelKey: "ROBOTECH.ArmorClass.mecha", value: "mecha" },
  { labelKey: "ROBOTECH.ArmorClass.naval", value: "naval" },
] as const satisfies readonly Option[];
export const ARMOR_CLASS_VALUES = toValues(ARMOR_CLASS_OPTIONS);
export type ArmorClassValue = (typeof ARMOR_CLASS_VALUES)[number];

/** The same damage types, labelled for the compact weapon property editor. */
export const WEAPON_DAMAGE_OPTIONS: {
  value: DamageTypeValue;
  labelKey: string;
}[] = [
  { labelKey: "ROBOTECH.Item.Property.DamageLight.name", value: "light" },
  { labelKey: "ROBOTECH.Item.Property.DamageMecha.name", value: "mecha" },
  { labelKey: "ROBOTECH.Item.Property.DamageNaval.name", value: "naval" },
];

export const WEAPON_RANGE_OPTIONS = [
  { labelKey: "ROBOTECH.Item.Ranges.Me", value: "Me" },
  { labelKey: "ROBOTECH.Item.Ranges.S", value: "S" },
  { labelKey: "ROBOTECH.Item.Ranges.M", value: "M" },
  { labelKey: "ROBOTECH.Item.Ranges.L", value: "L" },
  { labelKey: "ROBOTECH.Item.Ranges.EX", value: "EX" },
] as const satisfies readonly Option[];
export const WEAPON_RANGE_VALUES = toValues(WEAPON_RANGE_OPTIONS);
export type WeaponRangeValue = (typeof WEAPON_RANGE_VALUES)[number];

export const VESSEL_MODE_OPTIONS = [
  { labelKey: "ROBOTECH.Vessel.Fighter", value: "fighter" },
  { labelKey: "ROBOTECH.Vessel.Guardian", value: "guardian" },
  { labelKey: "ROBOTECH.Vessel.Battloid", value: "battloid" },
] as const satisfies readonly Option[];
export const VESSEL_MODE_VALUES = toValues(VESSEL_MODE_OPTIONS);
export type VesselModeValue = (typeof VESSEL_MODE_VALUES)[number];

export const ROLL_MODIFIER_OPTIONS = [
  { labelKey: "ROBOTECH.Roll.Modifiers.Disadvantage", shift: -2, value: "disadvantage" },
  { labelKey: "ROBOTECH.Roll.Modifiers.Hindrance", shift: -1, value: "hindrance" },
  { labelKey: "ROBOTECH.Roll.Modifiers.Nominal", shift: 0, value: "nominal" },
  { labelKey: "ROBOTECH.Roll.Modifiers.Edge", shift: 1, value: "edge" },
  { labelKey: "ROBOTECH.Roll.Modifiers.Advantage", shift: 2, value: "advantage" },
] as const satisfies readonly (Option & { shift: number })[];
export const ROLL_MODIFIER_VALUES = toValues(ROLL_MODIFIER_OPTIONS);
export type RollModifierValue = (typeof ROLL_MODIFIER_VALUES)[number];

export function modifierLabelOf(modifier: RollModifierValue): string {
  const option = ROLL_MODIFIER_OPTIONS.find((entry) => entry.value === modifier);
  if (!option) {
    return modifier;
  }
  const name = game.i18n.localize(option.labelKey);
  const shift = option.shift > 0 ? `+${option.shift}` : String(option.shift);
  return `${name} (${shift})`;
}

export const COMBAT_PHASE_OPTIONS = [
  { labelKey: "ROBOTECH.Combat.Phases.Communication", value: "communication" },
  { labelKey: "ROBOTECH.Combat.Phases.Support", value: "support" },
  { labelKey: "ROBOTECH.Combat.Phases.Ops", value: "ops" },
  { labelKey: "ROBOTECH.Combat.Phases.Cinematic", value: "cinematic" },
] as const satisfies readonly Option[];
export const COMBAT_PHASE_VALUES = toValues(COMBAT_PHASE_OPTIONS);
export type CombatPhaseValue = (typeof COMBAT_PHASE_VALUES)[number];

export const SLOT_PHASE_OPTIONS = [
  { labelKey: "ROBOTECH.Combat.Phases.Support", value: "support" },
  { labelKey: "ROBOTECH.Combat.Phases.Ops", value: "ops" },
  { labelKey: "ROBOTECH.Combat.Phases.Cinematic", value: "cinematic" },
] as const satisfies readonly Option[];
export const SLOT_PHASE_VALUES = toValues(SLOT_PHASE_OPTIONS);
export type SlotPhaseValue = (typeof SLOT_PHASE_VALUES)[number];

export const ACTION_PHASE_OPTIONS = [
  { labelKey: "ROBOTECH.Roll.Phases.Support", value: "support" },
  { labelKey: "ROBOTECH.Roll.Phases.Ops", value: "ops" },
  { labelKey: "ROBOTECH.Roll.Phases.Cinematic", value: "cinematic" },
  { labelKey: "ROBOTECH.Roll.Phases.Any", value: "any" },
] as const satisfies readonly Option[];
export type ActionPhaseValue = (typeof ACTION_PHASE_OPTIONS)[number]["value"];

export const ACTION_OPTIONS = [
  {
    hintKey: "ROBOTECH.Roll.Actions.Assist.hint",
    labelKey: "ROBOTECH.Roll.Actions.Assist.name",
    phase: "support",
    value: "assist",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Obscure.hint",
    labelKey: "ROBOTECH.Roll.Actions.Obscure.name",
    phase: "support",
    value: "obscure",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Observe.hint",
    labelKey: "ROBOTECH.Roll.Actions.Observe.name",
    phase: "support",
    value: "observe",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Attack.hint",
    labelKey: "ROBOTECH.Roll.Actions.Attack.name",
    phase: "ops",
    value: "attack",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Defend.hint",
    labelKey: "ROBOTECH.Roll.Actions.Defend.name",
    phase: "ops",
    value: "defend",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Redirect.hint",
    labelKey: "ROBOTECH.Roll.Actions.Redirect.name",
    phase: "ops",
    value: "redirect",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Inhibit.hint",
    labelKey: "ROBOTECH.Roll.Actions.Inhibit.name",
    phase: "cinematic",
    value: "inhibit",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Interact.hint",
    labelKey: "ROBOTECH.Roll.Actions.Interact.name",
    phase: "cinematic",
    value: "interact",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.HeroicMove.hint",
    labelKey: "ROBOTECH.Roll.Actions.HeroicMove.name",
    phase: "any",
    value: "heroicMove",
  },
  {
    hintKey: "ROBOTECH.Roll.Actions.Initiative.hint",
    labelKey: "ROBOTECH.Roll.Actions.Initiative.name",
    phase: "any",
    value: "initiative",
  },
] as const satisfies readonly (Option & {
  hintKey: string;
  phase: ActionPhaseValue;
})[];
export const ACTION_VALUES = toValues(ACTION_OPTIONS);
export type ActionValue = (typeof ACTION_VALUES)[number];

export const CONFLICT_ACTION_OPTIONS = ACTION_OPTIONS.filter((option) => option.phase !== "any");
export type ConflictActionValue = (typeof CONFLICT_ACTION_OPTIONS)[number]["value"];

export function isConflictAction(value: string): value is ConflictActionValue {
  return CONFLICT_ACTION_OPTIONS.some((option) => option.value === value);
}

export const GENERIC_SKILL_LABEL_KEYS = [
  "ROBOTECH.Roll.Actions.Attack.name",
  "ROBOTECH.Roll.Actions.Defend.name",
  "ROBOTECH.Roll.Actions.Redirect.name",
  "ROBOTECH.Roll.Actions.Assist.name",
  "ROBOTECH.Roll.Actions.Interact.name",
] as const;

export const THEME_OPTIONS = [
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
    labelKey: "ROBOTECH.Settings.Theme.Dark",
    value: "dark",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
    labelKey: "ROBOTECH.Settings.Theme.Orange",
    value: "orange",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
    labelKey: "ROBOTECH.Settings.Theme.Green",
    value: "green",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
    labelKey: "ROBOTECH.Settings.Theme.Blue",
    value: "blue",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
    labelKey: "ROBOTECH.Settings.Theme.Light",
    value: "light",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
    labelKey: "ROBOTECH.Settings.Theme.Sky",
    value: "sky",
  },
  {
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
    labelKey: "ROBOTECH.Settings.Theme.Brown",
    value: "brown",
  },
] as const satisfies readonly (Option & { groupKey: string })[];
export const THEME_VALUES = toValues(THEME_OPTIONS);
export type ThemeValue = (typeof THEME_VALUES)[number];

export const CONFLICT_TYPE_OPTIONS = [
  { labelKey: "ROBOTECH.Conflict.TypeSwarm", value: "swarm" },
  { labelKey: "ROBOTECH.Conflict.TypeBoss", value: "boss" },
  { labelKey: "ROBOTECH.Conflict.TypeNavalVessel", value: "naval_vessel" },
  { labelKey: "ROBOTECH.Conflict.TypeSocial", value: "social" },
  { labelKey: "ROBOTECH.Conflict.TypeEnvironmental", value: "environmental" },
] as const satisfies readonly Option[];
export const CONFLICT_TYPE_VALUES = toValues(CONFLICT_TYPE_OPTIONS);
export type ConflictTypeValue = (typeof CONFLICT_TYPE_VALUES)[number];

export const CONFLICT_RECOGNITION_OPTIONS = [
  { labelKey: "ROBOTECH.Conflict.RecognitionResolved", value: "resolved" },
  { labelKey: "ROBOTECH.Conflict.RecognitionVerified", value: "verified" },
  { labelKey: "ROBOTECH.Conflict.RecognitionReported", value: "reported" },
  { labelKey: "ROBOTECH.Conflict.RecognitionObscured", value: "obscured" },
  { labelKey: "ROBOTECH.Conflict.RecognitionHidden", value: "hidden" },
] as const satisfies readonly Option[];
export const CONFLICT_RECOGNITION_VALUES = toValues(CONFLICT_RECOGNITION_OPTIONS);
export type ConflictRecognitionValue = (typeof CONFLICT_RECOGNITION_VALUES)[number];

export const CONFLICT_THREAT_OPTIONS = [
  { labelKey: "ROBOTECH.Conflict.ThreatAlpha", value: "alpha" },
  { labelKey: "ROBOTECH.Conflict.ThreatBeta", value: "beta" },
  { labelKey: "ROBOTECH.Conflict.ThreatEpsilon", value: "epsilon" },
  { labelKey: "ROBOTECH.Conflict.ThreatOmega", value: "omega" },
] as const satisfies readonly Option[];
export const CONFLICT_THREAT_VALUES = toValues(CONFLICT_THREAT_OPTIONS);
export type ConflictThreatValue = (typeof CONFLICT_THREAT_VALUES)[number];

export const PLOT_EVENT_PHASE_OPTIONS = [
  { labelKey: "ROBOTECH.PlotEvent.RisingAction", value: "risingAction" },
  { labelKey: "ROBOTECH.PlotEvent.Climax", value: "climax" },
  { labelKey: "ROBOTECH.PlotEvent.Conclusion", value: "conclusion" },
] as const satisfies readonly Option[];
export const PLOT_EVENT_PHASE_VALUES = toValues(PLOT_EVENT_PHASE_OPTIONS);
export type PlotEventPhaseValue = (typeof PLOT_EVENT_PHASE_VALUES)[number];
