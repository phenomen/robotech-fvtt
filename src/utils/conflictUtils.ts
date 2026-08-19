import type Actor from "@client/documents/actor.mjs";

import type { ActorOf } from "@/models";
import { postPoolCard } from "@/utils/actionChat";
import { evaluateAd6Roll } from "@/utils/AD6Roll";
import { isActorOf } from "@/utils/documents";

export async function linkPlotEvent(conflict: ActorOf<"conflict">, plotEventUuid: string): Promise<void> {
  if (!plotEventUuid) return;
  if (conflict.system.plotEventUuid === plotEventUuid) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Conflict.AlreadyLinked"));
    return;
  }

  const plotEvent = await plotEventOf(plotEventUuid);
  if (!plotEvent) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Conflict.MissingPlotEvent"));
    return;
  }
  if (!plotEvent.isOwner) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Sheet.NoPermission"));
    return;
  }

  const previousUuid = conflict.system.plotEventUuid;
  if (previousUuid) await detachFromEvent(conflict, previousUuid);

  const conflictUuid = conflict.uuid;
  if (!conflictUuid) return;

  const nextIds = plotEvent.system.conflictUuids.includes(conflictUuid)
    ? plotEvent.system.conflictUuids
    : [...plotEvent.system.conflictUuids, conflictUuid];

  await conflict.update({ "system.plotEventUuid": plotEventUuid });
  await plotEvent.update({ "system.conflictUuids": nextIds });
}

export async function unlinkPlotEvent(conflict: ActorOf<"conflict">): Promise<void> {
  const previousUuid = conflict.system.plotEventUuid;
  if (previousUuid) {
    const plotEvent = await plotEventOf(previousUuid);
    if (plotEvent && !plotEvent.isOwner) {
      ui.notifications.error(game.i18n.localize("ROBOTECH.Sheet.NoPermission"));
      return;
    }
    if (plotEvent) await detachFromEvent(conflict, previousUuid);
  }
  await conflict.update({ "system.plotEventUuid": "" });
}

export async function addEventConflict(plotEvent: ActorOf<"plot_event">, conflictUuid: string): Promise<void> {
  const conflict = await conflictOf(conflictUuid);
  if (!conflict) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.PlotEvent.WrongType"));
    return;
  }
  if (!conflict.isOwner) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Sheet.NoPermission"));
    return;
  }

  const plotUuid = plotEvent.uuid;
  if (!plotUuid) return;
  await linkPlotEvent(conflict, plotUuid);
}

export async function removeEventConflict(plotEvent: ActorOf<"plot_event">, conflictUuid: string): Promise<void> {
  const conflict = await conflictOf(conflictUuid);
  if (conflict) {
    await unlinkPlotEvent(conflict);
    return;
  }

  await plotEvent.update({
    "system.conflictUuids": plotEvent.system.conflictUuids.filter((id) => id !== conflictUuid),
  });
}

export async function addConflictActor(conflict: ActorOf<"conflict">, uuid: string): Promise<void> {
  if (conflict.system.actorUuids.includes(uuid)) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Conflict.AlreadyAssigned"));
    return;
  }

  const document = await foundry.utils.fromUuid(uuid);
  if (!(document instanceof foundry.documents.Actor) || !isSceneActor(document)) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Conflict.WrongActorType"));
    return;
  }

  await conflict.update({
    "system.actorUuids": [...conflict.system.actorUuids, uuid],
  });
}

export async function rollConflictPool(conflict: ActorOf<"conflict">): Promise<void> {
  const pool = conflict.system.pool;
  if (pool < 1) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Conflict.EmptyPool"));
    return;
  }

  const result = await evaluateAd6Roll({ diceCount: pool, modifier: "nominal" });
  await postPoolCard({
    actor: conflict,
    title: game.i18n.localize("ROBOTECH.Conflict.PoolRollTitle", { name: conflict.name }),
    modifier: "nominal",
    diceCount: pool,
    dice: result.dice,
    successes: result.successes,
    roll: result.roll,
  });
}

async function detachFromEvent(conflict: ActorOf<"conflict">, plotEventUuid: string): Promise<void> {
  const plotEvent = await plotEventOf(plotEventUuid);
  if (!plotEvent?.isOwner) return;

  const conflictUuid = conflict.uuid;
  if (!conflictUuid) return;

  await plotEvent.update({
    "system.conflictUuids": plotEvent.system.conflictUuids.filter((id) => id !== conflictUuid),
  });
}

async function plotEventOf(uuid: string): Promise<ActorOf<"plot_event"> | null> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "plot_event")) {
    return document;
  }
  return null;
}

async function conflictOf(uuid: string): Promise<ActorOf<"conflict"> | null> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "conflict")) {
    return document;
  }
  return null;
}

function isSceneActor(actor: Actor): actor is ActorOf<"character" | "vessel" | "swarm"> {
  return isActorOf(actor, "character") || isActorOf(actor, "vessel") || isActorOf(actor, "swarm");
}
