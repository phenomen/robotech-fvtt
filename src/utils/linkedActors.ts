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

/**
 * Resolves linked-actor UUIDs into live documents, one entry per UUID in order. Reads are
 * synchronous for world documents and fall back to async resolution for compendium entries;
 * updates and deletions of any resolved actor re-render so components always read current
 * names, images, and system data. Callers may pass fresh array literals; re-resolution is
 * driven by content, not array identity.
 */
export function useLinkedActors<T extends ActorType>(uuids: readonly string[], types: readonly T[]): LinkedActor<T>[] {
  const inputsRef = useRef({ types, uuids });
  const [actors, setActors] = useState<LinkedActor<T>[]>(() => resolveAll(uuids, types));
  const [, bumpVersion] = useReducer((count: number): number => count + 1, 0);

  const signature = `${uuids.length}:${uuids.join("|")}#${types.join("|")}`;

  useEffect(() => {
    inputsRef.current = { types, uuids };
  });

  useEffect(() => {
    let cancelled = false;
    const { uuids: currentUuids, types: currentTypes } = inputsRef.current;
    setActors(resolveAll(currentUuids, currentTypes));
    void (async () => {
      const resolved = await Promise.all(
        currentUuids.map(async (uuid) => ({
          actor: await actorFromUuid(uuid, currentTypes),
          uuid,
        }))
      );
      if (!cancelled) {
        setActors(resolved);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Signature is the content-based trigger; the effect reads the latest inputs from the ref.
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
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
    };
    const handleDelete = (actor: foundry.documents.Actor): void => {
      if (actor.id === null || !ids.has(actor.id)) {
        return;
      }
      const { uuids: currentUuids, types: currentTypes } = inputsRef.current;
      setActors(resolveAll(currentUuids, currentTypes));
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
