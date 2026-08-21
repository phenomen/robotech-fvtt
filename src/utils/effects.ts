import type ActiveEffect from "@client/documents/active-effect.mjs";
import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import { DEFAULT_CHANGE_TYPE } from "@/config/effects";
import type { EffectChange } from "@/models";

/** Creates a blank effect on an Actor or Item; Foundry sets `transfer` from the parent type. */
export async function createEffect(parent: Actor | Item): Promise<void> {
  await parent.createEmbeddedDocuments("ActiveEffect", [{ name: game.i18n.localize("ROBOTECH.Effect.New") }]);
}

/** Every effect that can modify an actor: its own plus the transferred effects of its items. */
export function actorEffects(actor: Actor): ActiveEffect[] {
  return Array.from(actor.allApplicableEffects());
}

/** The document an effect came from: the owning item, or the actor for effects made on the actor. */
export function effectSource(effect: ActiveEffect): string {
  return effect.item?.name ?? effect.actor?.name ?? "";
}

/** Effects owned by the actor itself may be deleted from its sheet; transferred ones may not. */
export function isOwnEffect(effect: ActiveEffect): boolean {
  return effect.item === null;
}

export async function addChange(effect: ActiveEffect): Promise<void> {
  const next: EffectChange[] = [
    ...effect.system.changes,
    { key: "", type: DEFAULT_CHANGE_TYPE, value: "", phase: "initial", priority: null },
  ];
  await effect.update({ "system.changes": next });
}

export async function patchChange(effect: ActiveEffect, index: number, patch: Partial<EffectChange>): Promise<void> {
  const next = effect.system.changes.map((change, position) => (position === index ? { ...change, ...patch } : change));
  await effect.update({ "system.changes": next });
}

export async function removeChange(effect: ActiveEffect, index: number): Promise<void> {
  const next = effect.system.changes.filter((_change, position) => position !== index);
  await effect.update({ "system.changes": next });
}
