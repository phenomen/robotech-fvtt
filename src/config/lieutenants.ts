import type { ActionValue, Option } from "@/config/options";

export const LIEUTENANT_TYPE_OPTIONS = [
  { labelKey: "ROBOTECH.Lieutenant.Types.minor", value: "minor" },
  { labelKey: "ROBOTECH.Lieutenant.Types.major", value: "major" },
  { labelKey: "ROBOTECH.Lieutenant.Types.ultra", value: "ultra" },
] as const satisfies readonly Option[];
export type LieutenantTypeValue = (typeof LIEUTENANT_TYPE_OPTIONS)[number]["value"];

export const LIEUTENANT_TYPE_INDEX = {
  major: 1,
  minor: 0,
  ultra: 2,
} as const satisfies Record<LieutenantTypeValue, 0 | 1 | 2>;

export const LIEUTENANT_FLAVOR_OPTIONS = [
  { labelKey: "ROBOTECH.Lieutenant.Flavors.supportive", value: "supportive" },
  { labelKey: "ROBOTECH.Lieutenant.Flavors.aggressive", value: "aggressive" },
  { labelKey: "ROBOTECH.Lieutenant.Flavors.technical", value: "technical" },
] as const satisfies readonly Option[];
export type LieutenantFlavorValue = (typeof LIEUTENANT_FLAVOR_OPTIONS)[number]["value"];

export const LIEUTENANT_SKILL_ACTIONS = [
  "assist",
  "observe",
  "obscure",
  "attack",
  "defend",
  "redirect",
  "interact",
] as const satisfies readonly ActionValue[];
export type LieutenantSkillAction = (typeof LIEUTENANT_SKILL_ACTIONS)[number];

type SkillTriple = readonly [number, number, number];

export const LIEUTENANT_SKILL_ROWS = {
  animalHandler: {
    assist: [3, 4, 5],
    attack: [2, 3, 4],
    defend: [3, 4, 5],
    interact: [1, 2, 3],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [2, 3, 4],
  },
  marine: {
    assist: [2, 3, 4],
    attack: [2, 3, 4],
    defend: [3, 4, 5],
    interact: [1, 2, 3],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [1, 2, 3],
  },
  mercenary: {
    assist: [2, 3, 4],
    attack: [3, 4, 5],
    defend: [3, 4, 5],
    interact: [1, 2, 3],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [1, 2, 3],
  },
  officer: {
    assist: [3, 4, 5],
    attack: [1, 2, 3],
    defend: [2, 3, 4],
    interact: [1, 2, 3],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [2, 3, 4],
  },
  pilot: {
    assist: [2, 3, 4],
    attack: [3, 4, 5],
    defend: [2, 3, 4],
    interact: [1, 2, 3],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [3, 4, 5],
  },
  spleen: {
    assist: [1, 2, 3],
    attack: [3, 4, 5],
    defend: [3, 4, 5],
    interact: [2, 3, 4],
    obscure: [2, 3, 4],
    observe: [2, 3, 4],
    redirect: [1, 2, 3],
  },
  spy: {
    assist: [1, 2, 3],
    attack: [2, 3, 4],
    defend: [1, 2, 3],
    interact: [2, 3, 4],
    obscure: [3, 4, 5],
    observe: [2, 3, 4],
    redirect: [3, 4, 4],
  },
  technician: {
    assist: [2, 3, 4],
    attack: [1, 2, 3],
    defend: [2, 3, 4],
    interact: [3, 4, 5],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [2, 3, 4],
  },
  triumvirate: {
    assist: [3, 4, 5],
    attack: [2, 3, 4],
    defend: [2, 3, 4],
    interact: [2, 3, 4],
    obscure: [1, 2, 3],
    observe: [2, 3, 4],
    redirect: [3, 4, 5],
  },
  volunteer: {
    assist: [2, 3, 4],
    attack: [2, 3, 4],
    defend: [2, 3, 4],
    interact: [2, 3, 4],
    obscure: [2, 3, 4],
    observe: [2, 3, 4],
    redirect: [2, 3, 4],
  },
} as const satisfies Record<string, Record<LieutenantSkillAction, SkillTriple>>;
export type LieutenantSkillRowId = keyof typeof LIEUTENANT_SKILL_ROWS;

export const LIEUTENANT_ELEMENT_OPTIONS = [
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.pilot.label",
    skillRow: "pilot",
    value: "pilot",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.officer.label",
    skillRow: "officer",
    value: "officer",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.marine.label",
    skillRow: "marine",
    value: "marine",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.technician.label",
    skillRow: "technician",
    value: "technician",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.spy.label",
    skillRow: "spy",
    value: "spy",
  },
  {
    flavors: true,
    labelKey: "ROBOTECH.Lieutenant.Elements.volunteer.label",
    skillRow: "volunteer",
    value: "volunteer",
  },
  {
    flavors: true,
    labelKey: "ROBOTECH.Lieutenant.Elements.entertainer.label",
    skillRow: "volunteer",
    value: "entertainer",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.triumvirate.label",
    skillRow: "triumvirate",
    value: "triumvirate",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.nomad.label",
    skillRow: "mercenary",
    value: "nomad",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.mercenary.label",
    skillRow: "mercenary",
    value: "mercenary",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.animalHandler.label",
    skillRow: "animalHandler",
    value: "animalHandler",
  },
  {
    labelKey: "ROBOTECH.Lieutenant.Elements.spleen.label",
    skillRow: "spleen",
    value: "spleen",
  },
] as const satisfies readonly (Option & {
  flavors?: true;
  skillRow: LieutenantSkillRowId;
})[];
export type LieutenantElementValue = (typeof LIEUTENANT_ELEMENT_OPTIONS)[number]["value"];

export function lieutenantElementOf(value: LieutenantElementValue): (typeof LIEUTENANT_ELEMENT_OPTIONS)[number] {
  const option = LIEUTENANT_ELEMENT_OPTIONS.find((entry) => entry.value === value);
  if (!option) {
    throw new Error(`Unknown lieutenant element: ${value}`);
  }
  return option;
}

export function lieutenantHasFlavor(element: LieutenantElementValue): boolean {
  const option = lieutenantElementOf(element);
  return "flavors" in option && option.flavors;
}

export function lieutenantDescriptionKey(element: LieutenantElementValue, flavor?: LieutenantFlavorValue): string {
  if (lieutenantHasFlavor(element)) {
    const used = flavor ?? "supportive";
    return `ROBOTECH.Lieutenant.Elements.${element}.${used}`;
  }
  return `ROBOTECH.Lieutenant.Elements.${element}.description`;
}
