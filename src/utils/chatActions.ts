import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { openDamageDialog } from "@/components/apps/DamageDialog";
import { actionFlagsOf, postDamageCard, type IncomingAttack } from "@/utils/actionChat";
import { damagePreviewOf } from "@/utils/applyDamage";
import { ownedControlledActor } from "@/utils/documents";

export function bindChatButtons(message: foundry.documents.ChatMessage, html: HTMLElement): void {
  for (const button of html.querySelectorAll("[data-rt-action]")) {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-rt-action");
      if (action) void handleChatClick(action, message);
    });
  }
}

async function handleChatClick(action: string, message: foundry.documents.ChatMessage): Promise<void> {
  const flags = actionFlagsOf(message);
  if (!flags) return;

  if (action === "defend") {
    await openDefendChat(flags.successes, flags.incoming);
    return;
  }

  if (action === "apply-damage" && flags.incoming) {
    const defendSuccesses = flags.kind === "defend" ? flags.successes : 0;
    const preview = damagePreviewOf(flags.incoming, defendSuccesses);
    if (!preview) return;
    if (preview.cascade.damageInflicted <= 0) {
      await postDamageCard(preview.breakdown);
      return;
    }
    openDamageDialog(preview);
  }
}

async function openDefendChat(attackSuccesses: number, incoming: IncomingAttack | undefined): Promise<void> {
  if (!incoming) return;

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
