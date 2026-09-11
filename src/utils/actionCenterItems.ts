import type Actor from "@client/documents/actor.mjs";

import type { ActorOf, ItemOf, ItemType } from "@/models";
import { filterItemsOf, isActorOf, memberVesselsOf } from "@/utils/documents";
import { isFullyDestroyed } from "@/utils/hardwareUtils";

export interface SourcedOption<T extends ItemType> {
  key: string;
  item: ItemOf<T>;
  sourceName: string;
  sourceUuid: string;
}

export interface ActionCenterItems {
  skills: SourcedOption<"skill">[];
  suites: SourcedOption<"equipment_suite">[];
  weapons: SourcedOption<"weapon">[];
}

export function sourcedOptionsOf<T extends ItemType>(actors: Actor[], type: T): SourcedOption<T>[] {
  const options: SourcedOption<T>[] = [];
  for (const actor of actors) {
    const uuid = actor.uuid;
    if (!uuid) {
      continue;
    }
    for (const item of filterItemsOf(actor, type)) {
      if (isFullyDestroyed(item) || !item.id) {
        continue;
      }
      options.push({
        item,
        key: `${uuid}:${item.id}`,
        sourceName: actor.name,
        sourceUuid: uuid,
      });
    }
  }
  return options.toSorted((a, b) => a.item.name.localeCompare(b.item.name));
}

export function prefillSkillKey(skills: SourcedOption<"skill">[], contextActor: Actor, prefillId?: string): string {
  if (!prefillId) {
    return "";
  }
  return skills.find((skill) => skill.item.id === prefillId && skill.sourceUuid === contextActor.uuid)?.key ?? "";
}

export function livingSwarmCount(actor: Actor): number {
  return isActorOf(actor, "swarm") ? actor.system.vessels.value : 0;
}

export function optionLabel(name: string, value: number, source: string): string {
  return game.i18n.localize("ROBOTECH.Roll.OptionWithSource", { name, source, value });
}

export function sourcedMethodNames(
  skill1: SourcedOption<"skill"> | undefined,
  skill2: SourcedOption<"skill"> | undefined,
  suite: SourcedOption<"equipment_suite"> | undefined,
  swarmDice: number,
  contextActor: Actor
): string[] {
  const names: string[] = [];
  if (swarmDice > 0 && isActorOf(contextActor, "swarm")) {
    names.push(optionLabel(game.i18n.localize("ROBOTECH.Roll.SwarmVessels"), swarmDice, contextActor.name));
  }
  if (skill1) {
    names.push(optionLabel(skill1.item.name, skill1.item.system.value, skill1.sourceName));
  }
  if (skill2) {
    names.push(optionLabel(skill2.item.name, skill2.item.system.value, skill2.sourceName));
  }
  if (suite) {
    names.push(optionLabel(suite.item.name, suite.item.system.skill, suite.sourceName));
  }
  return names;
}

export async function resolveSuiteActors(contextActor: Actor, crew: ActorOf<"character">[]): Promise<Actor[]> {
  if (isActorOf(contextActor, "character")) {
    return [contextActor];
  }
  if (isActorOf(contextActor, "vessel")) {
    return [contextActor, ...crew];
  }
  if (isActorOf(contextActor, "swarm")) {
    const vessels = await memberVesselsOf(contextActor);
    return [...vessels, ...crew];
  }
  return crew;
}

export async function resolveWeaponActors(contextActor: Actor): Promise<Actor[]> {
  if (isActorOf(contextActor, "swarm")) {
    return await memberVesselsOf(contextActor);
  }
  return [contextActor];
}
