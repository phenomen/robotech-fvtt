import type Actor from "@client/documents/actor.mjs";
import type { JSX } from "react";

import { CharacterSheetApp } from "@/components/apps/CharacterSheetApp";
import { ConflictSheetApp } from "@/components/apps/ConflictSheetApp";
import { PlotEventSheetApp } from "@/components/apps/PlotEventSheetApp";
import { SwarmSheetApp } from "@/components/apps/SwarmSheetApp";
import { VesselSheetApp } from "@/components/apps/VesselSheetApp";
import type { ActorType } from "@/models";
import { isActorOf } from "@/utils/documents";

type ActorSheetRenderer = (actor: Actor) => JSX.Element | null;

/** One renderer per Actor subtype; add a subtype here plus its data model and manifest entry. */
const ACTOR_SHEETS: Record<ActorType, ActorSheetRenderer> = {
  character: (actor) => (isActorOf(actor, "character") ? <CharacterSheetApp actor={actor} /> : null),
  conflict: (actor) => (isActorOf(actor, "conflict") ? <ConflictSheetApp actor={actor} /> : null),
  plot_event: (actor) => (isActorOf(actor, "plot_event") ? <PlotEventSheetApp actor={actor} /> : null),
  swarm: (actor) => (isActorOf(actor, "swarm") ? <SwarmSheetApp actor={actor} /> : null),
  vessel: (actor) => (isActorOf(actor, "vessel") ? <VesselSheetApp actor={actor} /> : null),
};

export function renderActorSheet(actor: Actor): JSX.Element | null {
  const renderer: ActorSheetRenderer | undefined = ACTOR_SHEETS[actor.type];
  return renderer ? renderer(actor) : null;
}
