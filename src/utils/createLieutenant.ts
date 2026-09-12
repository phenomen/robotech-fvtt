import {
  ACTION_OPTIONS,
  LIEUTENANT_FLAVOR_OPTIONS,
  LIEUTENANT_SKILL_ACTIONS,
  LIEUTENANT_SKILL_ROWS,
  LIEUTENANT_TYPE_INDEX,
  LIEUTENANT_TYPE_OPTIONS,
  lieutenantDescriptionKey,
  lieutenantElementOf,
  lieutenantHasFlavor,
} from "@/config";
import type { LieutenantElementValue, LieutenantFlavorValue, LieutenantTypeValue } from "@/config";
import type { ActorOf } from "@/models";
import { addCrewMember, isActorOf } from "@/utils/documents";

export interface CreateLieutenantInput {
  element: LieutenantElementValue;
  flavor?: LieutenantFlavorValue;
  name?: string;
  openSheet?: boolean;
  type: LieutenantTypeValue;
  veteran: boolean;
  vessel?: ActorOf<"vessel">;
}

export interface LieutenantSkillPreview {
  name: string;
  value: number;
}

type CreateUser = Parameters<(typeof foundry.documents.Actor)["canUserCreate"]>[0];

export function canCreateActor(): boolean {
  const user = game.user;
  return user !== null && foundry.documents.Actor.canUserCreate(user as unknown as CreateUser);
}

export async function createLieutenant(input: CreateLieutenantInput): Promise<ActorOf<"character"> | null> {
  if (!canCreateActor()) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Lieutenant.NoPermission"));
    return null;
  }

  try {
    const documents = await foundry.documents.Actor.createDocuments([
      {
        items: lieutenantItemsOf(input),
        name: customNameOf(input),
        type: "character",
      },
    ]);
    const created = documents[0];
    if (!(created instanceof foundry.documents.Actor) || !isActorOf(created, "character")) {
      ui.notifications.error(game.i18n.localize("ROBOTECH.Lieutenant.CreateFailed"));
      return null;
    }
    const uuid = created.uuid;
    if (input.vessel && uuid) {
      await addCrewMember(input.vessel, uuid);
    }
    if (input.openSheet) {
      void created.sheet?.render(true);
    }
    return created;
  } catch (error) {
    console.error(error);
    ui.notifications.error(game.i18n.localize("ROBOTECH.Lieutenant.CreateFailed"));
    return null;
  }
}

function customNameOf(input: CreateLieutenantInput): string {
  const custom = input.name?.trim();
  if (custom) {
    return custom;
  }
  return lieutenantNameOf(input);
}

export function lieutenantNameOf(input: CreateLieutenantInput): string {
  const typeOption = LIEUTENANT_TYPE_OPTIONS.find((option) => option.value === input.type);
  const flavorOption = LIEUTENANT_FLAVOR_OPTIONS.find((option) => option.value === input.flavor);
  const parts = [typeOption ? game.i18n.localize(typeOption.labelKey) : input.type];
  if (input.veteran) {
    parts.push(game.i18n.localize("ROBOTECH.Lieutenant.Veteran"));
  }
  if (lieutenantHasFlavor(input.element) && flavorOption) {
    parts.push(game.i18n.localize(flavorOption.labelKey));
  }
  parts.push(
    game.i18n.localize(lieutenantElementOf(input.element).labelKey),
    game.i18n.localize("ROBOTECH.Lieutenant.Noun")
  );
  return parts.join(" ");
}

export function lieutenantSkillsOf(
  type: LieutenantTypeValue,
  element: LieutenantElementValue
): LieutenantSkillPreview[] {
  const row = LIEUTENANT_SKILL_ROWS[lieutenantElementOf(element).skillRow];
  const index = LIEUTENANT_TYPE_INDEX[type];
  const skills: LieutenantSkillPreview[] = [];
  for (const action of LIEUTENANT_SKILL_ACTIONS) {
    const option = ACTION_OPTIONS.find((entry) => entry.value === action);
    const value = row[action][index];
    if (!option || value === undefined) {
      continue;
    }
    skills.push({ name: game.i18n.localize(option.labelKey), value });
  }
  return skills;
}

function lieutenantItemsOf(input: CreateLieutenantInput): Record<string, unknown>[] {
  const skills = lieutenantSkillsOf(input.type, input.element).map((skill) => ({
    name: skill.name,
    system: { value: skill.value },
    type: "skill",
  }));
  return [
    ...skills,
    {
      name: game.i18n.localize(lieutenantElementOf(input.element).labelKey),
      system: { description: game.i18n.localize(lieutenantDescriptionKey(input.element, input.flavor)) },
      type: "element",
    },
  ];
}
