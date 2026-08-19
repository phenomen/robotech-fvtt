import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import type { ItemOf } from "@/models";
import { syncDestroyedSlots, type HardwareSlots } from "@/models/items/hardwareSlots";
import { isItemOf } from "@/utils/documents";

export type HardwareItem = ItemOf<"weapon"> | ItemOf<"feature"> | ItemOf<"equipment_suite">;

export function isHardwareItem(item: Item): item is HardwareItem {
  return isItemOf(item, "weapon") || isItemOf(item, "feature") || isItemOf(item, "equipment_suite");
}

export function hardwareSlotsOf(item: Item): HardwareSlots | null {
  const slots = rawHardwareSlots(item);
  if (!slots || slots.value <= 0) return null;
  return slots;
}

function rawHardwareSlots(item: Item): HardwareSlots | null {
  if (isItemOf(item, "weapon")) {
    const hardware = item.system.properties.hardware;
    if (!hardware.active) return null;
    return { value: hardware.value, destroyed: hardware.destroyed };
  }
  if (isItemOf(item, "feature") || isItemOf(item, "equipment_suite")) {
    return item.system.hardware;
  }
  return null;
}

export function intactSlotsOf(item: Item): number {
  const slots = hardwareSlotsOf(item);
  if (!slots) return 0;
  return syncDestroyedSlots(slots.value, slots.destroyed).reduce((count, destroyed) => count + (destroyed ? 0 : 1), 0);
}

export function hardwareItemsOf(actor: Actor): HardwareItem[] {
  const items: HardwareItem[] = [];
  for (const item of actor.items) {
    if (!isHardwareItem(item) || intactSlotsOf(item) <= 0) continue;
    items.push(item);
  }
  return items;
}

export function isFullyDestroyed(item: Item): boolean {
  const slots = hardwareSlotsOf(item);
  if (!slots || slots.value <= 0) return false;
  return syncDestroyedSlots(slots.value, slots.destroyed).every(Boolean);
}

/** Marks the given slot indexes destroyed and returns the updated array, or null if nothing changed. */
export function markDestroyedSlots(item: HardwareItem, indexes: number[]): boolean[] | null {
  if (indexes.length === 0) return null;
  const slots = hardwareSlotsOf(item);
  if (!slots) return null;

  const next = syncDestroyedSlots(slots.value, slots.destroyed);
  let changed = false;
  for (const index of indexes) {
    if (index < 0 || index >= next.length || next[index]) continue;
    next[index] = true;
    changed = true;
  }
  return changed ? next : null;
}

export async function setSlotDestroyed(item: Item, index: number, destroyed: boolean): Promise<void> {
  if (!isHardwareItem(item)) return;
  const slots = hardwareSlotsOf(item);
  if (!slots) return;

  const next = syncDestroyedSlots(slots.value, slots.destroyed);
  if (index < 0 || index >= next.length || next[index] === destroyed) return;

  next[index] = destroyed;
  await item.update({ [destroyedPathOf(item)]: next });
}

export function destroyedPathOf(item: HardwareItem): string {
  if (item.type === "weapon") return "system.properties.hardware.destroyed";
  return "system.hardware.destroyed";
}
