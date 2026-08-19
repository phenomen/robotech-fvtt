import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import type { ActorOf, ActorType, ItemOf, ItemType } from "@/models";
import { isMemberAlive } from "@/utils/swarmUtils";

/** Narrows an Actor to one subtype, which in turn pins down its `system` data. */
export function isActorOf<T extends ActorType>(actor: Actor, type: T): actor is ActorOf<T> {
  return actor.type === type;
}

/** Narrows an Item to one subtype, which in turn pins down its `system` data. */
export function isItemOf<T extends ItemType>(item: Item, type: T): item is ItemOf<T> {
  return item.type === type;
}

export function filterItemsOf<T extends ItemType>(actor: Actor, type: T): ItemOf<T>[] {
  const items: ItemOf<T>[] = [];
  for (const item of actor.items) {
    if (isItemOf(item, type)) items.push(item);
  }
  return items;
}

export function findItemOf<T extends ItemType>(actor: Actor, type: T): ItemOf<T> | undefined {
  for (const item of actor.items) {
    if (isItemOf(item, type)) return item;
  }
  return undefined;
}

/** Living vessel actors referenced by a swarm's member stacks. */
export async function memberVesselsOf(swarm: ActorOf<"swarm">): Promise<ActorOf<"vessel">[]> {
  const vessels: ActorOf<"vessel">[] = [];
  const seen = new Set<string>();
  for (const member of swarm.system.members) {
    if (!isMemberAlive(member) || !member.actorUuid || seen.has(member.actorUuid)) continue;
    seen.add(member.actorUuid);
    const document = await foundry.utils.fromUuid(member.actorUuid);
    if (document instanceof foundry.documents.Actor && isActorOf(document, "vessel")) {
      vessels.push(document);
    }
  }
  return vessels;
}

/** Characters whose skills are used: the actor itself, a vessel's crew, or a swarm's inherited crew. */
export async function resolveLinkedCharacters(actor: Actor): Promise<ActorOf<"character">[]> {
  if (isActorOf(actor, "character")) return [actor];
  if (isActorOf(actor, "vessel")) return resolveCrewActors(actor.system.characterUuids);
  if (isActorOf(actor, "swarm")) {
    const vessels = await memberVesselsOf(actor);
    return resolveCrewActors(vessels.flatMap((vessel) => vessel.system.characterUuids));
  }
  return [];
}

async function resolveCrewActors(uuids: string[]): Promise<ActorOf<"character">[]> {
  const crew: ActorOf<"character">[] = [];
  const seen = new Set<string>();
  for (const uuid of uuids) {
    if (!uuid || seen.has(uuid)) continue;
    seen.add(uuid);
    const document = await foundry.utils.fromUuid(uuid);
    if (!(document instanceof foundry.documents.Actor)) continue;
    if (!isActorOf(document, "character")) continue;
    crew.push(document);
  }
  return crew;
}

export async function addCrewMember(actor: ActorOf<"vessel">, uuid: string): Promise<void> {
  if (actor.system.characterUuids.includes(uuid)) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Crew.AlreadyAssigned"));
    return;
  }
  await actor.update({
    "system.characterUuids": [...actor.system.characterUuids, uuid],
  });
}

export function ownedControlledActor(): Actor | null {
  const actor = controlledTokenActor();
  if (!actor?.isOwner) return null;
  return actor;
}

/** The actor of the single currently controlled token, or null if the selection is empty or mixed. */
export function controlledTokenActor(): Actor | null {
  const layer = canvas.getLayerByEmbeddedName("Token");
  const controlled = layer?.controlled ?? [];
  if (controlled.length !== 1) return null;
  const token = controlled[0];
  if (!(token instanceof foundry.canvas.placeables.Token)) return null;
  return token.actor;
}

/** Opens Foundry's file browser and stores the picked image on the actor. */
export function pickImage(document: Actor): void {
  const picker = new foundry.applications.apps.FilePicker.implementation({
    type: "image",
    current: document.img,
    callback: (path: string) => document.update({ img: path }),
  });
  void picker.browse();
}
