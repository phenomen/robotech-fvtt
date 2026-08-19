import type { ActorType, ItemType } from "@/models/documents";

/** Item subtypes that may be embedded on each Actor subtype. */
export const ACTOR_ITEM_TYPES = {
  character: ["career", "race", "skill", "talent", "equipment_suite", "weapon", "gear"],
  vessel: ["equipment_suite", "weapon", "feature", "upgrade"],
  swarm: [],
  conflict: [],
  plot_event: [],
} as const satisfies Record<ActorType, readonly ItemType[]>;

/** At most one of each of these types may exist on an actor; a new drop replaces the old. */
export const UNIQUE_ITEM_TYPES = ["career", "race"] as const satisfies readonly ItemType[];

export function isAllowedOnActor(actorType: ActorType, itemType: ItemType): boolean {
  return ACTOR_ITEM_TYPES[actorType].some((type) => type === itemType);
}
