import type Actor from "@client/documents/actor.mjs";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { openDamageDialog } from "@/components/apps/DamageDialog";
import { actionFlagsOf, canSynergize, postDamageCard } from "@/utils/actionChat";
import type { ActionChatFlags, IncomingAttack } from "@/utils/actionChat";
import { damagePreviewFor } from "@/utils/applyDamage";
import { actorFromUuid, controlledTokenActor, ownedControlledActor, SCENE_ACTOR_TYPES } from "@/utils/documents";
import { canSplitSynergy } from "@/utils/synergy";

export function bindChatButtons(message: foundry.documents.ChatMessage, html: HTMLElement): void {
  for (const button of html.querySelectorAll("[data-rt-action]")) {
    if (!(button instanceof HTMLElement)) {
      continue;
    }
    button.addEventListener("click", () => {
      const action = button.dataset.rtAction;
      if (action) {
        void handleChatClick(action, message);
      }
    });
  }
}

async function handleChatClick(action: string, message: foundry.documents.ChatMessage): Promise<void> {
  const flags = actionFlagsOf(message);
  if (!flags) {
    return;
  }

  if (action === "defend") {
    await openDefendChat(flags.successes, flags.incoming);
    return;
  }

  if (action === "synergy") {
    await openSynergyChat(message, flags);
    return;
  }

  if (action === "apply-damage" && flags.incoming) {
    await openDamageChat(flags);
  }
}

async function openDamageChat(flags: ActionChatFlags): Promise<void> {
  if (!flags.incoming) {
    return;
  }
  const actor = controlledDamageActor();
  if (!actor) {
    return;
  }
  const defendSuccesses = flags.kind === "defend" ? flags.successes : 0;
  const preview = damagePreviewFor(actor, flags.incoming, defendSuccesses);
  if (!preview) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SelectOneToken"));
    return;
  }
  if (preview.cascade.damageInflicted <= 0) {
    await postDamageCard(preview.breakdown);
    return;
  }
  openDamageDialog(preview);
}

function controlledDamageActor(): Actor | null {
  const actor = controlledTokenActor();
  if (!actor) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SelectOneToken"));
    return null;
  }
  if (!game.user?.isGM && !actor.isOwner) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.NoPermission"));
    return null;
  }
  return actor;
}

async function openSynergyChat(message: foundry.documents.ChatMessage, flags: ActionChatFlags): Promise<void> {
  if (!canSynergize(flags)) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Roll.SynergyAlreadySplit"));
    return;
  }

  const context = await actorFromUuid(flags.contextUuid, SCENE_ACTOR_TYPES);
  if (!context) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SynergyMissingActor"));
    return;
  }
  if (!canSplitSynergy(message, context)) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SynergyNoPermission"));
    return;
  }

  await openActionCenter(context, { synergyMessage: message });
}

async function openDefendChat(attackSuccesses: number, incoming: IncomingAttack | undefined): Promise<void> {
  if (!incoming) {
    return;
  }

  const context = ownedControlledActor();
  if (!context) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SelectOneToken"));
    return;
  }

  await openActionCenter(context, {
    action: "defend",
    incoming: { ...incoming, attackSuccesses },
  });
}
