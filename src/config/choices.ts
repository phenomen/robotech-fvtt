export interface ChoiceOption {
  value: string;
  labelKey: string;
}

/** Keeps the literal value types of an option list while staying assignable to a field's `choices`. */
function toValues<const T extends readonly ChoiceOption[]>(options: T): T[number]["value"][] {
  return options.map((option) => option.value);
}

export function isChoiceValue<const T extends readonly ChoiceOption[]>(
  options: T,
  value: string,
): value is T[number]["value"] {
  return options.some((option) => option.value === value);
}

export const WEALTH_OPTIONS = [
  { value: "low", labelKey: "ROBOTECH.Wealth.Low" },
  { value: "standard", labelKey: "ROBOTECH.Wealth.Standard" },
  { value: "high", labelKey: "ROBOTECH.Wealth.High" },
  { value: "ultra", labelKey: "ROBOTECH.Wealth.Ultra" },
] as const satisfies readonly ChoiceOption[];
export const WEALTH_VALUES = toValues(WEALTH_OPTIONS);
export type WealthValue = (typeof WEALTH_VALUES)[number];

export const VESSEL_TYPE_OPTIONS = [
  { value: "infantry", labelKey: "ROBOTECH.Vessel.TypeInfantry" },
  { value: "vehicle", labelKey: "ROBOTECH.Vessel.TypeVehicle" },
  { value: "mecha", labelKey: "ROBOTECH.Vessel.TypeMecha" },
  { value: "naval", labelKey: "ROBOTECH.Vessel.TypeNaval" },
] as const satisfies readonly ChoiceOption[];
export const VESSEL_TYPE_VALUES = toValues(VESSEL_TYPE_OPTIONS);
export type VesselTypeValue = (typeof VESSEL_TYPE_VALUES)[number];

export const TALENT_CATEGORY_OPTIONS = [
  { value: "leadership", labelKey: "ROBOTECH.Talents.Category.Leadership" },
  { value: "piloting", labelKey: "ROBOTECH.Talents.Category.Piloting" },
  { value: "social", labelKey: "ROBOTECH.Talents.Category.Social" },
  { value: "tactical", labelKey: "ROBOTECH.Talents.Category.Tactical" },
  { value: "technical", labelKey: "ROBOTECH.Talents.Category.Technical" },
] as const satisfies readonly ChoiceOption[];
export const TALENT_CATEGORY_VALUES = toValues(TALENT_CATEGORY_OPTIONS);
export type TalentCategoryValue = (typeof TALENT_CATEGORY_VALUES)[number];

export const SPEED_UNIT_OPTIONS = [
  { value: "ground", labelKey: "ROBOTECH.Vessel.Ground" },
  { value: "planetary", labelKey: "ROBOTECH.Vessel.Planetary" },
  { value: "space", labelKey: "ROBOTECH.Vessel.Space" },
] as const satisfies readonly ChoiceOption[];
export const SPEED_UNIT_VALUES = toValues(SPEED_UNIT_OPTIONS);
export type SpeedUnitValue = (typeof SPEED_UNIT_VALUES)[number];

export const DAMAGE_TYPE_OPTIONS = [
  { value: "light", labelKey: "ROBOTECH.Damage.DamageClass.light" },
  { value: "mecha", labelKey: "ROBOTECH.Damage.DamageClass.mecha" },
  { value: "naval", labelKey: "ROBOTECH.Damage.DamageClass.naval" },
] as const satisfies readonly ChoiceOption[];
export const DAMAGE_TYPE_VALUES = toValues(DAMAGE_TYPE_OPTIONS);
export type DamageTypeValue = (typeof DAMAGE_TYPE_VALUES)[number];

/** The same damage types, labelled for the compact weapon property editor. */
export const WEAPON_DAMAGE_OPTIONS: {
  value: DamageTypeValue;
  labelKey: string;
}[] = [
  { value: "light", labelKey: "ROBOTECH.Item.Property.DamageLight.name" },
  { value: "mecha", labelKey: "ROBOTECH.Item.Property.DamageMecha.name" },
  { value: "naval", labelKey: "ROBOTECH.Item.Property.DamageNaval.name" },
];

export const WEAPON_RANGE_OPTIONS = [
  { value: "Me", labelKey: "ROBOTECH.Item.Ranges.Me" },
  { value: "S", labelKey: "ROBOTECH.Item.Ranges.S" },
  { value: "M", labelKey: "ROBOTECH.Item.Ranges.M" },
  { value: "L", labelKey: "ROBOTECH.Item.Ranges.L" },
  { value: "EX", labelKey: "ROBOTECH.Item.Ranges.EX" },
] as const satisfies readonly ChoiceOption[];
export const WEAPON_RANGE_VALUES = toValues(WEAPON_RANGE_OPTIONS);
export type WeaponRangeValue = (typeof WEAPON_RANGE_VALUES)[number];

export const VESSEL_MODE_OPTIONS = [
  { value: "fighter", labelKey: "ROBOTECH.Vessel.Fighter" },
  { value: "guardian", labelKey: "ROBOTECH.Vessel.Guardian" },
  { value: "battloid", labelKey: "ROBOTECH.Vessel.Battloid" },
] as const satisfies readonly ChoiceOption[];
export const VESSEL_MODE_VALUES = toValues(VESSEL_MODE_OPTIONS);
export type VesselModeValue = (typeof VESSEL_MODE_VALUES)[number];

export const SYSTEM_RATING_OPTIONS = [
  { value: "disadvantage", labelKey: "ROBOTECH.Roll.Modifiers.Disadvantage" },
  { value: "hindrance", labelKey: "ROBOTECH.Roll.Modifiers.Hindrance" },
  { value: "nominal", labelKey: "ROBOTECH.Roll.Modifiers.Nominal" },
  { value: "edge", labelKey: "ROBOTECH.Roll.Modifiers.Edge" },
  { value: "advantage", labelKey: "ROBOTECH.Roll.Modifiers.Advantage" },
] as const satisfies readonly ChoiceOption[];
export const SYSTEM_RATING_VALUES = toValues(SYSTEM_RATING_OPTIONS);
export type SystemRatingValue = (typeof SYSTEM_RATING_VALUES)[number];

export const COMBAT_PHASE_OPTIONS = [
  { value: "communication", labelKey: "ROBOTECH.Combat.Phases.Communication" },
  { value: "support", labelKey: "ROBOTECH.Combat.Phases.Support" },
  { value: "ops", labelKey: "ROBOTECH.Combat.Phases.Ops" },
  { value: "cinematic", labelKey: "ROBOTECH.Combat.Phases.Cinematic" },
] as const satisfies readonly ChoiceOption[];
export const COMBAT_PHASE_VALUES = toValues(COMBAT_PHASE_OPTIONS);
export type CombatPhaseValue = (typeof COMBAT_PHASE_VALUES)[number];

export const SLOT_PHASE_OPTIONS = [
  { value: "support", labelKey: "ROBOTECH.Combat.Phases.Support" },
  { value: "ops", labelKey: "ROBOTECH.Combat.Phases.Ops" },
  { value: "cinematic", labelKey: "ROBOTECH.Combat.Phases.Cinematic" },
] as const satisfies readonly ChoiceOption[];
export const SLOT_PHASE_VALUES = toValues(SLOT_PHASE_OPTIONS);
export type SlotPhaseValue = (typeof SLOT_PHASE_VALUES)[number];

export const ACTION_PHASE_OPTIONS = [
  { value: "support", labelKey: "ROBOTECH.Roll.Phases.Support" },
  { value: "ops", labelKey: "ROBOTECH.Roll.Phases.Ops" },
  { value: "cinematic", labelKey: "ROBOTECH.Roll.Phases.Cinematic" },
  { value: "any", labelKey: "ROBOTECH.Roll.Phases.Any" },
] as const satisfies readonly ChoiceOption[];
export const ACTION_PHASE_VALUES = toValues(ACTION_PHASE_OPTIONS);
export type ActionPhaseValue = (typeof ACTION_PHASE_VALUES)[number];

export const ACTION_OPTIONS = [
  {
    value: "assist",
    labelKey: "ROBOTECH.Roll.Actions.Assist.name",
    hintKey: "ROBOTECH.Roll.Actions.Assist.hint",
    phase: "support",
  },
  {
    value: "obscure",
    labelKey: "ROBOTECH.Roll.Actions.Obscure.name",
    hintKey: "ROBOTECH.Roll.Actions.Obscure.hint",
    phase: "support",
  },
  {
    value: "observe",
    labelKey: "ROBOTECH.Roll.Actions.Observe.name",
    hintKey: "ROBOTECH.Roll.Actions.Observe.hint",
    phase: "support",
  },
  {
    value: "attack",
    labelKey: "ROBOTECH.Roll.Actions.Attack.name",
    hintKey: "ROBOTECH.Roll.Actions.Attack.hint",
    phase: "ops",
  },
  {
    value: "defend",
    labelKey: "ROBOTECH.Roll.Actions.Defend.name",
    hintKey: "ROBOTECH.Roll.Actions.Defend.hint",
    phase: "ops",
  },
  {
    value: "redirect",
    labelKey: "ROBOTECH.Roll.Actions.Redirect.name",
    hintKey: "ROBOTECH.Roll.Actions.Redirect.hint",
    phase: "ops",
  },
  {
    value: "inhibit",
    labelKey: "ROBOTECH.Roll.Actions.Inhibit.name",
    hintKey: "ROBOTECH.Roll.Actions.Inhibit.hint",
    phase: "cinematic",
  },
  {
    value: "interact",
    labelKey: "ROBOTECH.Roll.Actions.Interact.name",
    hintKey: "ROBOTECH.Roll.Actions.Interact.hint",
    phase: "cinematic",
  },
  {
    value: "heroicMove",
    labelKey: "ROBOTECH.Roll.Actions.HeroicMove.name",
    hintKey: "ROBOTECH.Roll.Actions.HeroicMove.hint",
    phase: "any",
  },
  {
    value: "initiative",
    labelKey: "ROBOTECH.Roll.Actions.Initiative.name",
    hintKey: "ROBOTECH.Roll.Actions.Initiative.hint",
    phase: "any",
  },
] as const satisfies readonly (ChoiceOption & {
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
    value: "dark",
    labelKey: "ROBOTECH.Settings.Theme.Dark",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
  },
  {
    value: "orange",
    labelKey: "ROBOTECH.Settings.Theme.Orange",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
  },
  {
    value: "green",
    labelKey: "ROBOTECH.Settings.Theme.Green",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
  },
  {
    value: "blue",
    labelKey: "ROBOTECH.Settings.Theme.Blue",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Dark",
  },
  {
    value: "light",
    labelKey: "ROBOTECH.Settings.Theme.Light",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
  },
  {
    value: "sky",
    labelKey: "ROBOTECH.Settings.Theme.Sky",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
  },
  {
    value: "brown",
    labelKey: "ROBOTECH.Settings.Theme.Brown",
    groupKey: "ROBOTECH.Settings.Theme.Groups.Light",
  },
] as const satisfies readonly (ChoiceOption & { groupKey: string })[];
export const THEME_VALUES = toValues(THEME_OPTIONS);
export type ThemeValue = (typeof THEME_VALUES)[number];

export const CONFLICT_TYPE_OPTIONS = [
  { value: "swarm", labelKey: "ROBOTECH.Conflict.TypeSwarm" },
  { value: "boss", labelKey: "ROBOTECH.Conflict.TypeBoss" },
  { value: "naval_vessel", labelKey: "ROBOTECH.Conflict.TypeNavalVessel" },
  { value: "social", labelKey: "ROBOTECH.Conflict.TypeSocial" },
  { value: "environmental", labelKey: "ROBOTECH.Conflict.TypeEnvironmental" },
] as const satisfies readonly ChoiceOption[];
export const CONFLICT_TYPE_VALUES = toValues(CONFLICT_TYPE_OPTIONS);
export type ConflictTypeValue = (typeof CONFLICT_TYPE_VALUES)[number];

export const CONFLICT_RECOGNITION_OPTIONS = [
  { value: "resolved", labelKey: "ROBOTECH.Conflict.RecognitionResolved" },
  { value: "verified", labelKey: "ROBOTECH.Conflict.RecognitionVerified" },
  { value: "reported", labelKey: "ROBOTECH.Conflict.RecognitionReported" },
  { value: "obscured", labelKey: "ROBOTECH.Conflict.RecognitionObscured" },
  { value: "hidden", labelKey: "ROBOTECH.Conflict.RecognitionHidden" },
] as const satisfies readonly ChoiceOption[];
export const CONFLICT_RECOGNITION_VALUES = toValues(CONFLICT_RECOGNITION_OPTIONS);
export type ConflictRecognitionValue = (typeof CONFLICT_RECOGNITION_VALUES)[number];

export const CONFLICT_THREAT_OPTIONS = [
  { value: "alpha", labelKey: "ROBOTECH.Conflict.ThreatAlpha" },
  { value: "beta", labelKey: "ROBOTECH.Conflict.ThreatBeta" },
  { value: "epsilon", labelKey: "ROBOTECH.Conflict.ThreatEpsilon" },
  { value: "omega", labelKey: "ROBOTECH.Conflict.ThreatOmega" },
] as const satisfies readonly ChoiceOption[];
export const CONFLICT_THREAT_VALUES = toValues(CONFLICT_THREAT_OPTIONS);
export type ConflictThreatValue = (typeof CONFLICT_THREAT_VALUES)[number];

export const PLOT_EVENT_PHASE_OPTIONS = [
  { value: "risingAction", labelKey: "ROBOTECH.PlotEvent.RisingAction" },
  { value: "climax", labelKey: "ROBOTECH.PlotEvent.Climax" },
  { value: "conclusion", labelKey: "ROBOTECH.PlotEvent.Conclusion" },
] as const satisfies readonly ChoiceOption[];
export const PLOT_EVENT_PHASE_VALUES = toValues(PLOT_EVENT_PHASE_OPTIONS);
export type PlotEventPhaseValue = (typeof PLOT_EVENT_PHASE_VALUES)[number];
