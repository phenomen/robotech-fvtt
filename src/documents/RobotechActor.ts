import type { ActorOf } from "@/models";
import { isActorOf } from "@/utils/documents";
import { stressUpdatesForBar, woundUpdatesForBar } from "@/utils/woundUtils";

/**
 * Maps token-bar edits on derived `vitals.*` gauges onto the persisted wound and stress boxes.
 */
export class RobotechActor extends foundry.documents.Actor {
  override async modifyTokenAttribute(attribute: string, value: number, isDelta = false, isBar = true): Promise<this> {
    if (isActorOf(this, "character") && isBar) {
      const applied = await applyCharacterBar(this, attribute, value, isDelta);
      if (applied) {
        return this;
      }
    }
    return (await super.modifyTokenAttribute(attribute, value, isDelta, isBar)) as this;
  }
}

async function applyCharacterBar(
  actor: ActorOf<"character">,
  attribute: string,
  value: number,
  isDelta: boolean
): Promise<boolean> {
  if (attribute === "vitals.wounds") {
    const current = actor.system.vitals.wounds.value;
    const next = isDelta ? current + value : value;
    const remaining = Math.clamp(next, 0, actor.system.vitals.wounds.max);
    await actor.update(woundUpdatesForBar(actor, remaining));
    return true;
  }
  if (attribute === "vitals.stress") {
    const current = actor.system.vitals.stress.value;
    const next = isDelta ? current + value : value;
    const filled = Math.clamp(next, 0, actor.system.vitals.stress.max);
    await actor.update(stressUpdatesForBar(actor, filled));
    return true;
  }
  return false;
}
