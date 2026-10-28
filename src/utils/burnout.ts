import type { SourcedOption } from "@/utils/actionCenterItems";
import { isMentalBreak } from "@/utils/combat";
import { isActorOf } from "@/utils/documents";

/** A character whose Skill dice in one roll exceed their Burnout. */
export interface BurnoutOverage {
  uuid: string;
  name: string;
  dice: number;
  burnout: number;
  fatigue: number;
}

/**
 * Skill dice over a character's Burnout cost 1 Fatigue each. Only Skill dice count: Equipment Suite
 * dice never contribute, and a character resolving a Mental Break accrues no Fatigue. Picks are grouped
 * by the character who owns the Skill, so each crew member is measured against their own Burnout.
 */
export function burnoutOverages(skills: readonly (SourcedOption<"skill"> | undefined)[]): BurnoutOverage[] {
  const diceByOwner = new Map<string, { owner: SourcedOption<"skill">["item"]["parent"]; dice: number }>();
  for (const skill of skills) {
    if (!skill) {
      continue;
    }
    const entry = diceByOwner.get(skill.sourceUuid);
    if (entry) {
      entry.dice += skill.item.system.value;
    } else {
      diceByOwner.set(skill.sourceUuid, { dice: skill.item.system.value, owner: skill.item.parent });
    }
  }

  const overages: BurnoutOverage[] = [];
  for (const [uuid, { owner, dice }] of diceByOwner) {
    if (!(owner instanceof foundry.documents.Actor) || !isActorOf(owner, "character") || isMentalBreak(owner)) {
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
