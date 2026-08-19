import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";
import type React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { CharacterSheetApp } from "@/components/apps/CharacterSheetApp";
import { ConflictSheetApp } from "@/components/apps/ConflictSheetApp";
import { PlotEventSheetApp } from "@/components/apps/PlotEventSheetApp";
import { SwarmSheetApp } from "@/components/apps/SwarmSheetApp";
import { VesselSheetApp } from "@/components/apps/VesselSheetApp";
import { UNIQUE_ITEM_TYPES, isAllowedOnActor } from "@/config";
import type { ActorOf, SwarmMember } from "@/models";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import {
  addConflictActor,
  addCrewMember,
  addEventConflict,
  calcReducedStructure,
  createSheetContainer,
  isActorOf,
} from "@/utils";

type ActorSheetBase = foundry.applications.sheets.ActorSheetV2;
type DropItemResult = ReturnType<ActorSheetBase["_onDropItem"]>;
type DropActorResult = ReturnType<ActorSheetBase["_onDropActor"]>;

export class RobotechActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "sheet", "actor"],
    position: { width: 710, height: "auto" },
    window: { ...super.DEFAULT_OPTIONS.window, resizable: true },
    dragDrop: [{ dropSelector: null }],
  };

  override async _onFirstRender(...args: Parameters<ActorSheetBase["_onFirstRender"]>): Promise<void> {
    await super._onFirstRender(...args);
    if (this.actor.type === "conflict" || this.actor.type === "plot_event") {
      this.setPosition({ width: 610 });
    }
  }

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    if (!this.container) {
      this.container = createSheetContainer("robotech-sheet-container");
    }

    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.container);
    }

    flushSync(() => {
      this.reactRoot?.render(this.renderSheetApp());
    });

    return this.container;
  }

  private renderSheetApp(): React.JSX.Element | null {
    const actor = this.actor;
    if (isActorOf(actor, "vessel")) return <VesselSheetApp actor={actor} />;
    if (isActorOf(actor, "character")) return <CharacterSheetApp actor={actor} />;
    if (isActorOf(actor, "swarm")) return <SwarmSheetApp actor={actor} />;
    if (isActorOf(actor, "conflict")) return <ConflictSheetApp actor={actor} />;
    if (isActorOf(actor, "plot_event")) return <PlotEventSheetApp actor={actor} />;
    return null;
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    if (!content.contains(result)) {
      content.replaceChildren(result);
    }
  }

  protected override async _onDropActor(event: DragEvent, droppedActor: Actor): DropActorResult {
    if (!this.actor.isOwner || !this.isEditable) return null;

    if (isActorOf(droppedActor, "character") && isActorOf(this.actor, "vessel")) {
      const uuid = droppedActor.uuid;
      if (!uuid) return null;
      await addCrewMember(this.actor, uuid);
      return droppedActor;
    }

    if (isActorOf(droppedActor, "character") && isActorOf(this.actor, "swarm")) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Crew.InheritedFromVessels"));
      return null;
    }

    if (isActorOf(this.actor, "swarm") && isActorOf(droppedActor, "vessel")) {
      const uuid = droppedActor.uuid;
      if (!uuid) return null;
      await this.addVesselToSwarm(this.actor, droppedActor, uuid);
      return droppedActor;
    }

    if (isActorOf(this.actor, "conflict")) {
      const uuid = droppedActor.uuid;
      if (!uuid) return null;
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
      if (!uuid) return null;
      await addEventConflict(this.actor, uuid);
      return droppedActor;
    }

    return super._onDropActor(event, droppedActor);
  }

  private async addVesselToSwarm(
    swarm: ActorOf<"swarm">,
    droppedActor: ActorOf<"vessel">,
    uuid: string,
  ): Promise<void> {
    const existing = swarm.system.members.find((member) => member.actorUuid === uuid);

    if (existing) {
      const members = swarm.system.members.map((member) =>
        member.id === existing.id
          ? {
              ...member,
              count: member.count + 1,
              maxCount: member.maxCount + 1,
              currentStructure: member.currentStructure > 0 ? member.currentStructure : member.reducedStructure,
            }
          : member,
      );
      await swarm.update({ "system.members": members });
      return;
    }

    await swarm.update({
      "system.members": [...swarm.system.members, buildSwarmMember(droppedActor, uuid)],
    });
  }

  protected override async _onDropItem(event: DragEvent, item: Item): DropItemResult {
    if (!this.actor.isOwner || !this.isEditable) return null;
    if (item.parent instanceof foundry.documents.Actor && item.parent.uuid === this.actor.uuid) {
      return super._onDropItem(event, item);
    }

    if (!isAllowedOnActor(this.actor.type, item.type)) {
      ui.notifications.warn(
        game.i18n.localize("ROBOTECH.Item.ItemNotAllowed", {
          itemType: game.i18n.localize(`TYPES.Item.${item.type}`),
          actorType: game.i18n.localize(`TYPES.Actor.${this.actor.type}`),
        }),
      );
      return null;
    }

    await this.clearUniqueItem(item);
    return super._onDropItem(event, item);
  }

  private async clearUniqueItem(item: Item): Promise<void> {
    if (!UNIQUE_ITEM_TYPES.some((type) => type === item.type)) return;

    const ids: string[] = [];
    for (const owned of this.actor.items) {
      if (owned.type === item.type && owned.id) ids.push(owned.id);
    }
    if (ids.length > 0) {
      await this.actor.deleteEmbeddedDocuments("Item", ids);
    }
  }

  override _onClose(options: CloseOptions): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.container = null;
    super._onClose(options);
  }
}

function buildSwarmMember(droppedActor: ActorOf<"vessel">, actorUuid: string): SwarmMember {
  const originalStructure = droppedActor.system.structure.max;
  const reducedStructure = calcReducedStructure(originalStructure);

  return {
    id: foundry.utils.randomID(),
    actorUuid,
    name: droppedActor.name,
    img: droppedActor.img,
    armor: droppedActor.system.armor.max,
    originalStructure,
    reducedStructure,
    currentStructure: reducedStructure,
    count: 1,
    maxCount: 1,
    speed: droppedActor.system.activeSpeed.game,
  };
}
