import type Actor from "@client/documents/actor.mjs";

import type { SourcedOption } from "@/utils/actionCenterItems";
import { isMentalBreak } from "@/utils/combat";
import { isActorOf } from "@/utils/documents";

/** A character whose dice in one roll exceed their Burnout. */
export interface BurnoutOverage {
  uuid: string;
  name: string;
  dice: number;
  burnout: number;
  fatigue: number;
}

interface OwnerDice {
  owner: Actor | null;
  dice: number;
}

/**
 * Dice over a character's Burnout cost 1 Fatigue each. Skill dice count toward the Skill's owner, so
 * each crew member is measured against their own Burnout. Bonus dice count too: extra dice can push a
 * roll over Burnout, and a negative bonus lets a player trim the pool to stay under it. They belong to
 * the roller, the owner of the first picked Skill, or the acting character when no Skill is picked.
 * Equipment Suite dice never contribute, and a character resolving a Mental Break accrues no Fatigue.
 */
export function burnoutOverages(
  skills: readonly (SourcedOption<"skill"> | undefined)[],
  bonusDice: number,
  contextActor: Actor
): BurnoutOverage[] {
  const diceByOwner = new Map<string, OwnerDice>();
  for (const skill of skills) {
    if (!skill) {
      continue;
    }
    const entry = diceByOwner.get(skill.sourceUuid);
    if (entry) {
      entry.dice += skill.item.system.value;
    } else {
      const parent = skill.item.parent;
      diceByOwner.set(skill.sourceUuid, {
        dice: skill.item.system.value,
        owner: parent instanceof foundry.documents.Actor ? parent : null,
      });
    }
  }
  addBonusDice(diceByOwner, bonusDice, contextActor);

  const overages: BurnoutOverage[] = [];
  for (const [uuid, { owner, dice }] of diceByOwner) {
    if (!owner || !isActorOf(owner, "character") || isMentalBreak(owner)) {
      continue;
    }
    const burnout = owner.system.burnout,
      fatigue = dice - burnout;
    if (fatigue > 0) {
      overages.push({ burnout, dice, fatigue, name: owner.name, uuid });
    }
  }
  return overages;
}

function addBonusDice(diceByOwner: Map<string, OwnerDice>, bonusDice: number, contextActor: Actor): void {
  if (bonusDice === 0) {
    return;
  }
  const [roller] = diceByOwner.values();
  if (roller) {
    roller.dice = Math.max(0, roller.dice + bonusDice);
    return;
  }
  if (isActorOf(contextActor, "character") && contextActor.uuid) {
    diceByOwner.set(contextActor.uuid, { dice: Math.max(0, bonusDice), owner: contextActor });
  }
}
