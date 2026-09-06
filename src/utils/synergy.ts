import type Actor from "@client/documents/actor.mjs";

import { isConflictAction } from "@/config/options";
import type { ConflictActionValue } from "@/config/options";
import { SKILL_USES_PER_ROUND } from "@/models/combat";
import { actionCardTitle, actionFlagsOf, canSynergize, postActionCard, updateActionCard } from "@/utils/actionChat";
import type { IncomingAttack } from "@/utils/actionChat";
import { actionIsPushed, combatantOf, spendRoundUses } from "@/utils/combat";

export interface ApplySynergyInput {
  message: foundry.documents.ChatMessage;
  actor: Actor;
  action: ConflictActionValue;
  transferred: number;
  incoming?: IncomingAttack;
}

export function canSplitSynergy(message: foundry.documents.ChatMessage, actor: Actor): boolean {
  const user = game.user;
  if (!user) {
    return false;
  }
  return user.isGM || actor.isOwner || message.isAuthor;
}

export async function applySynergy(input: ApplySynergyInput): Promise<boolean> {
  const flags = actionFlagsOf(input.message);
  if (!flags || !canSynergize(flags) || !flags.snapshot) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Roll.SynergyAlreadySplit"));
    return false;
  }
  if (!canSplitSynergy(input.message, input.actor)) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SynergyNoPermission"));
    return false;
  }
  if (input.action === flags.action || !isConflictAction(input.action)) {
    return false;
  }
  if (input.transferred < 1 || input.transferred > flags.successes) {
    return false;
  }

  const combatant = combatantOf(input.actor);
  if (combatant && combatant.system.log.length >= SKILL_USES_PER_ROUND) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Roll.SynergyLogFull"));
    return false;
  }

  const snapshot = flags.snapshot;
  const remaining = flags.successes - input.transferred;
  const childPushed = actionIsPushed(input.action);
  const fatigueNotice = Boolean(flags.pushed) || childPushed;
  const sourceIncoming =
    flags.kind === "attack" && flags.incoming ? { ...flags.incoming, attackSuccesses: remaining } : flags.incoming;

  const child = await postActionCard({
    action: input.action,
    actor: input.actor,
    bonusSuccesses: 0,
    dice: [],
    diceCount: snapshot.diceCount,
    fatigueNotice,
    incoming: input.incoming,
    modifier: snapshot.modifier,
    pushed: childPushed,
    rolledSuccesses: input.transferred,
    skillNames: snapshot.skillNames,
    successes: input.transferred,
    synergy: { partnerId: input.message.id ?? undefined, role: "child" },
    title: actionCardTitle(input.actor, input.action, childPushed, true),
  });

  await updateActionCard(input.message, {
    ...flags,
    incoming: sourceIncoming,
    successes: remaining,
    synergy: { partnerId: child?.id ?? undefined, role: "source" },
  });

  if (combatant && isConflictAction(input.action)) {
    await spendRoundUses(combatant, input.action, { skills: 0, suite: false });
  }

  return true;
}
