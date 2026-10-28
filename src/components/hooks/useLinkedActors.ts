import { useEffect, useReducer, useRef, useState } from "react";

import type { ActorOf, ActorType } from "@/models";
import { actorFromUuid, actorFromUuidSync } from "@/utils/documents";

/** A linked actor resolved from a UUID; `actor` is null while unresolved, missing, or of the wrong subtype. */
export interface LinkedActor<T extends ActorType> {
  uuid: string;
  actor: ActorOf<T> | null;
}

function resolveAll<T extends ActorType>(uuids: readonly string[], types: readonly T[]): LinkedActor<T>[] {
  return uuids.map((uuid) => ({ actor: actorFromUuidSync(uuid, types), uuid }));
}

/** Returns `current` when `next` links the same documents, so React skips the re-render. */
function keepIfSame<T extends ActorType>(current: LinkedActor<T>[], next: LinkedActor<T>[]): LinkedActor<T>[] {
  const same =
    current.length === next.length &&
    current.every((entry, index) => entry.uuid === next[index]?.uuid && entry.actor === next[index]?.actor);
  return same ? current : next;
}

/**
 * Resolves linked-actor UUIDs into live documents, one entry per UUID in order. Reads are
 * synchronous for world documents and fall back to async resolution for compendium entries;
 * updates and deletions of any resolved actor re-render so components always read current
 * names, images, and system data. Callers may pass fresh array literals; re-resolution is
 * driven by content, not array identity.
 */
export function useLinkedActors<T extends ActorType>(uuids: readonly string[], types: readonly T[]): LinkedActor<T>[] {
  const inputsRef = useRef({ types, uuids }),
    [actors, setActors] = useState<LinkedActor<T>[]>(() => resolveAll(uuids, types)),
    [, bumpVersion] = useReducer((count: number): number => count + 1, 0),
    signature = `${uuids.length}:${uuids.join("|")}#${types.join("|")}`;

  useEffect(() => {
    inputsRef.current = { types, uuids };
  });

  useEffect(() => {
    let cancelled = false;
    const { uuids: currentUuids, types: currentTypes } = inputsRef.current,
      synced = resolveAll(currentUuids, currentTypes);
    setActors((current) => keepIfSame(current, synced));
    // World actors resolve synchronously; only compendium entries need the async lookup.
    if (synced.some((entry) => entry.actor === null)) {
      void (async () => {
        const resolved = await Promise.all(
          synced.map(async (entry) =>
            entry.actor ? entry : { actor: await actorFromUuid(entry.uuid, currentTypes), uuid: entry.uuid }
          )
        );
        if (!cancelled) {
          setActors((current) => keepIfSame(current, resolved));
        }
      })();
    }
    return () => {
      cancelled = true;
    };
    // Signature is the content-based trigger; the effect reads the latest inputs from the ref.
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [signature]);

  const idKey = actors.map((entry) => entry.actor?.id ?? "-").join("|");

  useEffect(() => {
    const ids = new Set(idKey.split("|"));
    ids.delete("-");
    ids.delete("");
    if (ids.size === 0) {
      return () => {
        /* no linked actors to watch */
      };
    }
    const handleUpdate = (actor: foundry.documents.Actor): void => {
        if (actor.id !== null && ids.has(actor.id)) {
          bumpVersion();
        }
      },
      handleDelete = (actor: foundry.documents.Actor): void => {
        if (actor.id === null || !ids.has(actor.id)) {
          return;
        }
        const { uuids: currentUuids, types: currentTypes } = inputsRef.current;
        setActors((current) => keepIfSame(current, resolveAll(currentUuids, currentTypes)));
      };
    foundry.helpers.Hooks.on("updateActor", handleUpdate);
    foundry.helpers.Hooks.on("deleteActor", handleDelete);
    return () => {
      foundry.helpers.Hooks.off("updateActor", handleUpdate);
      foundry.helpers.Hooks.off("deleteActor", handleDelete);
    };
  }, [idKey]);

  return actors;
}
