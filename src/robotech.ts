import { RobotechTokenRuler } from "@/canvas";
import { RobotechCombat, RobotechCombatant, RobotechCombatTracker } from "@/combat";
import { bindChatButtons } from "@/components/apps/chatActions";
import { STATUS_EFFECTS } from "@/config";
import { ACTOR_META } from "@/config/documentMeta";
import { registerDataModels } from "@/registry/documentTypes";
import { registerSystemSettings } from "@/registry/settings";
import { RobotechActorSheet } from "@/sheets/RobotechActorSheet";
import { RobotechEffectSheet } from "@/sheets/RobotechEffectSheet";
import { RobotechItemSheet } from "@/sheets/RobotechItemSheet";
import { clearActorCache } from "@/utils/documents";
import { applyTheme } from "@/utils/theme";

function registerSystemSheets(): void {
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("robotech", RobotechActorSheet, {
    label: "ROBOTECH.Sheet.Actor",
    makeDefault: true,
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("robotech", RobotechItemSheet, {
    label: "ROBOTECH.Sheet.Item",
    makeDefault: true,
  });

  registerEffectSheet();
}

/**
 * DocumentSheetConfig documents its sheet parameter as `typeof Application|typeof ApplicationV2`,
 * which no DocumentSheetV2 subclass satisfies — not even Foundry's own ActiveEffectConfig.
 */
type RegisterableSheet = Parameters<typeof foundry.applications.apps.DocumentSheetConfig.registerSheet>[2];

function registerEffectSheet(): void {
  const sheetConfig = foundry.applications.apps.DocumentSheetConfig;
  const coreSheet = foundry.applications.sheets.ActiveEffectConfig as unknown as RegisterableSheet;
  const systemSheet = RobotechEffectSheet as unknown as RegisterableSheet;

  sheetConfig.unregisterSheet(foundry.documents.ActiveEffect, "core", coreSheet);
  sheetConfig.registerSheet(foundry.documents.ActiveEffect, "robotech", systemSheet, {
    label: "ROBOTECH.Sheet.Effect",
    makeDefault: true,
  });
}

function registerTrackableAttributes(): void {
  CONFIG.Actor.trackableAttributes = Object.fromEntries(
    Object.entries(ACTOR_META).map(([type, meta]) => [
      type,
      { bar: [...meta.trackable.bar], value: [...meta.trackable.value] },
    ])
  );
}

function registerStatusEffects(): void {
  const config = CONFIG as unknown as {
    statusEffects: { id: string; img: string; name: string; order: number }[];
  };
  config.statusEffects = STATUS_EFFECTS.map((effect) => ({
    id: effect.id,
    img: effect.img,
    name: effect.name,
    order: effect.order,
  }));
}

foundry.helpers.Hooks.once("init", () => {
  CONFIG.Token.rulerClass = RobotechTokenRuler;
  CONFIG.Combat.documentClass = RobotechCombat;
  CONFIG.Combatant.documentClass = RobotechCombatant;
  CONFIG.ui.combat = RobotechCombatTracker as unknown as typeof foundry.applications.sidebar.tabs.CombatTracker;
  registerStatusEffects();
  registerTrackableAttributes();
  registerDataModels();
  registerSystemSheets();
  registerSystemSettings();
  applyTheme();
});

foundry.helpers.Hooks.once("ready", () => {
  applyTheme();
  foundry.helpers.Hooks.on("deleteActor", () => {
    clearActorCache();
  });
});

foundry.helpers.Hooks.on("renderChatMessageHTML", (message: foundry.documents.ChatMessage, html: HTMLElement) => {
  html.classList.add("robotech");
  bindChatButtons(message, html);
});
