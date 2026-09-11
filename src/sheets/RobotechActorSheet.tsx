import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import { renderActorSheet } from "@/components/apps/actorSheets";
import { UNIQUE_ITEM_TYPES, itemAllowedOn } from "@/config/documentMeta";
import type { ActorOf, SwarmMember } from "@/models";
import { createReactMount, renderReactMount, replaceReactContent, unmountReactMount } from "@/sheets/reactMount";
import type { ReactMount } from "@/sheets/reactMount";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { addConflictActor, addCrewMember, addEventConflict, calcReducedStructure, isActorOf } from "@/utils";

type ActorSheetBase = foundry.applications.sheets.ActorSheetV2;
type DropItemResult = ReturnType<ActorSheetBase["_onDropItem"]>;
type DropActorResult = ReturnType<ActorSheetBase["_onDropActor"]>;

export class RobotechActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  private readonly mount: ReactMount = createReactMount();

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "sheet", "actor"],
    dragDrop: [{ dropSelector: null }],
    position: { height: "auto", width: 710 },
    window: { ...super.DEFAULT_OPTIONS.window, resizable: true },
  };

  override async _onFirstRender(...args: Parameters<ActorSheetBase["_onFirstRender"]>): Promise<void> {
    await super._onFirstRender(...args);
    if (this.actor.type === "conflict" || this.actor.type === "plot_event") {
      this.setPosition({ width: 610 });
    }
  }

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    return renderReactMount(this.mount, "robotech-sheet-container", renderActorSheet(this.actor));
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    replaceReactContent(result, content);
  }

  protected override async _onDropActor(event: DragEvent, droppedActor: Actor): DropActorResult {
    if (!this.actor.isOwner || !this.isEditable) {
      return null;
    }

    if (isActorOf(droppedActor, "character") && isActorOf(this.actor, "vessel")) {
      const uuid = droppedActor.uuid;
      if (!uuid) {
        return null;
      }
      await addCrewMember(this.actor, uuid);
      return droppedActor;
    }

    if (isActorOf(droppedActor, "character") && isActorOf(this.actor, "swarm")) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Crew.InheritedFromVessels"));
      return null;
    }

    if (isActorOf(this.actor, "swarm") && isActorOf(droppedActor, "vessel")) {
      const uuid = droppedActor.uuid;
      if (!uuid) {
        return null;
      }
      await this.addVesselToSwarm(this.actor, droppedActor, uuid);
      return droppedActor;
    }

    if (isActorOf(this.actor, "conflict")) {
      const uuid = droppedActor.uuid;
      if (!uuid) {
        return null;
      }
      if (
        isActorOf(droppedActor, "character") ||
        isActorOf(droppedActor, "vessel") ||
        isActorOf(droppedActor, "swarm")
      ) {
        await addConflictActor(this.actor, uuid);
        return droppedActor;
      }
    }

    if (isActorOf(this.actor, "plot_event") && isActorOf(droppedActor, "conflict")) {
      const uuid = droppedActor.uuid;
      if (!uuid) {
        return null;
      }
      await addEventConflict(this.actor, uuid);
      return droppedActor;
    }

    return await super._onDropActor(event, droppedActor);
  }

  private async addVesselToSwarm(
    swarm: ActorOf<"swarm">,
    droppedActor: ActorOf<"vessel">,
    uuid: string
  ): Promise<void> {
    const existing = swarm.system.members.find((member) => member.actorUuid === uuid);

    if (existing) {
      const members = swarm.system.members.map((member) =>
        member.id === existing.id
          ? {
              ...member,
              count: member.count + 1,
              currentStructure: member.currentStructure > 0 ? member.currentStructure : member.reducedStructure,
              maxCount: member.maxCount + 1,
            }
          : member
      );
      await swarm.update({ "system.members": members });
      return;
    }

    await swarm.update({
      "system.members": [...swarm.system.members, buildSwarmMember(droppedActor, uuid)],
    });
  }

  protected override async _onDropItem(event: DragEvent, item: Item): DropItemResult {
    if (!this.actor.isOwner || !this.isEditable) {
      return null;
    }
    if (item.parent instanceof foundry.documents.Actor && item.parent.uuid === this.actor.uuid) {
      return await super._onDropItem(event, item);
    }

    if (!itemAllowedOn(this.actor.type, item.type)) {
      ui.notifications.warn(
        game.i18n.localize("ROBOTECH.Item.ItemNotAllowed", {
          actorType: game.i18n.localize(`TYPES.Actor.${this.actor.type}`),
          itemType: game.i18n.localize(`TYPES.Item.${item.type}`),
        })
      );
      return null;
    }

    await this.clearUniqueItem(item);
    return await super._onDropItem(event, item);
  }

  private async clearUniqueItem(item: Item): Promise<void> {
    if (!UNIQUE_ITEM_TYPES.some((type) => type === item.type)) {
      return;
    }

    const ids: string[] = [];
    for (const owned of this.actor.items) {
      if (owned.type === item.type && owned.id) {
        ids.push(owned.id);
      }
    }
    if (ids.length > 0) {
      await this.actor.deleteEmbeddedDocuments("Item", ids);
    }
  }

  override _onClose(options: CloseOptions): void {
    unmountReactMount(this.mount);
    super._onClose(options);
  }
}

function buildSwarmMember(droppedActor: ActorOf<"vessel">, actorUuid: string): SwarmMember {
  const originalStructure = droppedActor.system.structure.max;
  const reducedStructure = calcReducedStructure(originalStructure);

  return {
    actorUuid,
    armor: droppedActor.system.armor.max,
    count: 1,
    currentStructure: reducedStructure,
    id: foundry.utils.randomID(),
    img: droppedActor.img,
    maxCount: 1,
    name: droppedActor.name,
    originalStructure,
    reducedStructure,
    resistance: droppedActor.system.resistance,
    speed: droppedActor.system.activeSpeed.game,
  };
}
