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

/** Narrows an Actor to any of several subtypes. */
export function isActorOfType<T extends ActorType>(actor: Actor, types: readonly T[]): actor is ActorOf<T> {
  return types.some((type) => actor.type === type);
}

/** Narrows to the subtypes that can take part in a conflict: characters, vessels, and swarms. */
export function isSceneActor(actor: Actor): actor is ActorOf<"character" | "vessel" | "swarm"> {
  return isActorOfType(actor, SCENE_ACTOR_TYPES);
}

export const SCENE_ACTOR_TYPES = ["character", "vessel", "swarm"] as const;

/** Resolves a UUID into one of the given Actor subtypes; null when missing or of another subtype. */
export async function actorFromUuid<T extends ActorType>(
  uuid: string,
  types: readonly T[]
): Promise<ActorOf<T> | null> {
  const document = await foundry.utils.fromUuid(uuid);
  return document instanceof foundry.documents.Actor && isActorOfType(document, types) ? document : null;
}

/** Resolves many UUIDs concurrently, dropping duplicates and misses. */
async function resolveActors<T extends ActorType>(
  uuids: readonly string[],
  types: readonly T[]
): Promise<ActorOf<T>[]> {
  const seen = new Set<string>();
  const targets: string[] = [];
  for (const uuid of uuids) {
    if (!uuid || seen.has(uuid)) {
      continue;
    }
    seen.add(uuid);
    targets.push(uuid);
  }
  const resolved = await Promise.all(targets.map(async (uuid) => await actorFromUuid(uuid, types)));
  const actors: ActorOf<T>[] = [];
  for (const actor of resolved) {
    if (actor) {
      actors.push(actor);
    }
  }
  return actors;
}

/** Synchronous variant of {@link actorFromUuid}; world documents and loaded compendium entries only. */
export function actorFromUuidSync<T extends ActorType>(uuid: string, types: readonly T[]): ActorOf<T> | null {
  const document = foundry.utils.fromUuidSync(uuid);
  return document instanceof foundry.documents.Actor && isActorOfType(document, types) ? document : null;
}

/** Opens the sheet of the actor behind a UUID, if it resolves. */
export async function openActorSheet(uuid: string): Promise<void> {
  if (!uuid) {
    return;
  }
  const document = await foundry.utils.fromUuid(uuid);
  if (!(document instanceof foundry.documents.Actor)) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Sheet.MissingActor", { uuid }));
    return;
  }
  void document.sheet?.render(true);
}

export function filterItemsOf<T extends ItemType>(actor: Actor, type: T): ItemOf<T>[] {
  const items: ItemOf<T>[] = [];
  for (const item of actor.items) {
    if (isItemOf(item, type)) {
      items.push(item);
    }
  }
  return items;
}

export function findItemOf<T extends ItemType>(actor: Actor, type: T): ItemOf<T> | undefined {
  for (const item of actor.items) {
    if (isItemOf(item, type)) {
      return item;
    }
  }
  return undefined;
}

/** Living vessel actors referenced by a swarm's member stacks. */
export async function memberVesselsOf(swarm: ActorOf<"swarm">): Promise<ActorOf<"vessel">[]> {
  const uuids: string[] = [];
  for (const member of swarm.system.members) {
    if (isMemberAlive(member)) {
      uuids.push(member.actorUuid);
    }
  }
  return await resolveActors(uuids, ["vessel"]);
}

/** Characters whose skills are used: the actor itself, a vessel's crew, or a swarm's inherited crew. */
export async function resolveLinkedCharacters(actor: Actor): Promise<ActorOf<"character">[]> {
  if (isActorOf(actor, "character")) {
    return [actor];
  }
  if (isActorOf(actor, "vessel")) {
    return await resolveCrewActors(actor.system.characterUuids);
  }
  if (isActorOf(actor, "swarm")) {
    const vessels = await memberVesselsOf(actor);
    return await resolveCrewActors(vessels.flatMap((vessel) => vessel.system.characterUuids));
  }
  return [];
}

async function resolveCrewActors(uuids: string[]): Promise<ActorOf<"character">[]> {
  return await resolveActors(uuids, ["character"]);
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
  if (!actor?.isOwner) {
    return null;
  }
  return actor;
}

/** The actor of the single currently controlled token, or null if the selection is empty or mixed. */
export function controlledTokenActor(): Actor | null {
  const layer = canvas.getLayerByEmbeddedName("Token");
  const controlled = layer?.controlled ?? [];
  if (controlled.length !== 1) {
    return null;
  }
  const token = controlled[0];
  if (!(token instanceof foundry.canvas.placeables.Token)) {
    return null;
  }
  return token.actor;
}

/** Opens Foundry's file browser and stores the picked image on the actor. */
export function pickImage(document: Actor): void {
  const picker = new foundry.applications.apps.FilePicker.implementation({
    callback: async (path: string) => await document.update({ img: path }),
    current: document.img,
    type: "image",
  });
  void picker.browse();
}
