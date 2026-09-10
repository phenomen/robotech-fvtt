import type { ActorType, ItemType } from "@/models/documents";

/**
 * Pure, runtime-free metadata for every Actor and Item subtype. Data models and sheets are bound to
 * these keys in `@/registry/documentTypes`; UI routing reads the flags here so a new subtype is a
 * single declaration plus its model and sheet.
 */

export interface ActorMeta {
  /** Dot paths surfaced as token bars and in the combat tracker. */
  trackable: { bar: readonly string[]; value: readonly string[] };
  tokenBars: { bar1: string | null; bar2: string | null };
  /** Item subtypes this actor may own. */
  itemTypes: readonly ItemType[];
  hasEffects: boolean;
}

export const ACTOR_META = {
  character: {
    hasEffects: true,
    itemTypes: ["career", "element", "race", "skill", "talent", "equipment_suite", "weapon", "gear"],
    tokenBars: { bar1: "vitals.wounds", bar2: null },
    trackable: { bar: ["vitals.wounds", "vitals.stress"], value: ["armor.max"] },
  },
  conflict: {
    hasEffects: false,
    itemTypes: [],
    tokenBars: { bar1: "tracker", bar2: null },
    trackable: { bar: ["tracker"], value: ["pool", "armor"] },
  },
  plot_event: {
    hasEffects: false,
    itemTypes: [],
    tokenBars: { bar1: null, bar2: null },
    trackable: { bar: [], value: ["eventLevel"] },
  },
  swarm: {
    hasEffects: false,
    itemTypes: [],
    tokenBars: { bar1: "structure", bar2: "vessels" },
    trackable: { bar: ["structure", "vessels"], value: [] },
  },
  vessel: {
    hasEffects: true,
    itemTypes: ["equipment_suite", "weapon", "feature", "upgrade"],
    tokenBars: { bar1: "structure", bar2: "armor" },
    trackable: { bar: ["structure", "armor"], value: [] },
  },
} as const satisfies Record<ActorType, ActorMeta>;

export type ItemSheetLayoutMode = "unstacked" | "stacked";

export interface ItemMeta {
  hasEffects: boolean;
  layout: ItemSheetLayoutMode;
}

export const ITEM_META = {
  career: { hasEffects: false, layout: "stacked" },
  element: { hasEffects: false, layout: "stacked" },
  equipment_suite: { hasEffects: true, layout: "stacked" },
  feature: { hasEffects: true, layout: "stacked" },
  gear: { hasEffects: true, layout: "stacked" },
  race: { hasEffects: true, layout: "stacked" },
  skill: { hasEffects: false, layout: "stacked" },
  talent: { hasEffects: true, layout: "stacked" },
  upgrade: { hasEffects: true, layout: "stacked" },
  weapon: { hasEffects: true, layout: "unstacked" },
} as const satisfies Record<ItemType, ItemMeta>;

/** At most one of each of these types may exist on an actor; a new drop replaces the old. */
export const UNIQUE_ITEM_TYPES = ["career", "race"] as const satisfies readonly ItemType[];

export function isAllowedOnActor(actorType: ActorType, itemType: ItemType): boolean {
  return ACTOR_META[actorType].itemTypes.some((type) => type === itemType);
}

export function actorHasEffects(actorType: ActorType): boolean {
  return ACTOR_META[actorType].hasEffects;
}

export function itemHasEffects(itemType: ItemType): boolean {
  return ITEM_META[itemType].hasEffects;
}

export function getLayoutMode(itemType: ItemType): ItemSheetLayoutMode {
  return ITEM_META[itemType].layout;
}
