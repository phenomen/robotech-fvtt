import type { ActorOf } from "@/models";
import { isActorOf } from "@/utils/documents";
import { stressUpdatesForBar, woundUpdatesForBar } from "@/utils/woundUtils";

/**
 * Maps token-bar edits on derived gauges onto persisted data: character `vitals.*` onto wound and
 * stress boxes. Swarm gauges sum their member stacks and are edited on the sheet only.
 */
export class RobotechActor extends foundry.documents.Actor {
  override async modifyTokenAttribute(attribute: string, value: number, isDelta = false, isBar = true): Promise<this> {
    if (isActorOf(this, "swarm") && isBar) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Swarm.BarReadOnly"));
      return this;
    }
    if (isActorOf(this, "character") && isBar) {
      const updates = characterBarUpdates(this, attribute, value, isDelta);
      if (updates) {
        const allowed = foundry.helpers.Hooks.call(
          "modifyTokenAttribute",
          { attribute, isBar, isDelta, value },
          updates,
          this
        );
        if (allowed) {
          await this.update(updates);
        }
        return this;
      }
    }
    return (await super.modifyTokenAttribute(attribute, value, isDelta, isBar)) as this;
  }
}

function characterBarUpdates(
  actor: ActorOf<"character">,
  attribute: string,
  value: number,
  isDelta: boolean
): Record<string, unknown> | null {
  if (attribute === "vitals.wounds") {
    const { value: current, max } = actor.system.vitals.wounds,
      next = isDelta ? current + value : value;
    return woundUpdatesForBar(actor, Math.clamp(next, 0, max));
  }
  if (attribute === "vitals.stress") {
    const { value: current, max } = actor.system.vitals.stress,
      next = isDelta ? current + value : value;
    return stressUpdatesForBar(actor, Math.clamp(next, 0, max));
  }
  return null;
}
