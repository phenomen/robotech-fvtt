import { RobotechTokenRuler } from "@/canvas";
import { RobotechCombat, RobotechCombatant, RobotechCombatTracker } from "@/combat";
import { bindChatButtons } from "@/components/apps/chatActions";
import { STATUS_EFFECTS } from "@/config";
import { ACTOR_META } from "@/config/documentMeta";
import { RobotechActor } from "@/documents/RobotechActor";
import { registerDataModels } from "@/registry/documentTypes";
import { registerSystemSettings } from "@/registry/settings";
import { RobotechActorSheet } from "@/sheets/RobotechActorSheet";
import { RobotechEffectSheet } from "@/sheets/RobotechEffectSheet";
import { RobotechItemSheet } from "@/sheets/RobotechItemSheet";
import { RobotechActorDirectory } from "@/sidebar/RobotechActorDirectory";
import { applyTheme } from "@/utils/theme";

function registerSystemSheets(): void {
  // Core still ships AppV1 defaults; unregister them before registering ApplicationV2 sheets.
  // oxlint-disable-next-line typescript/no-deprecated
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("robotech", RobotechActorSheet, {
    label: "ROBOTECH.Sheet.Actor",
    makeDefault: true,
  });

  // oxlint-disable-next-line typescript/no-deprecated
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
  // Foundry types `CONFIG.statusEffects` as a Proxy array that also indexes by id.
  // @ts-expect-error Assignment through the proxy is the supported replacement path.
  CONFIG.statusEffects = STATUS_EFFECTS.map((effect) => ({
    id: effect.id,
    img: effect.img,
    name: effect.name,
    order: effect.order,
  }));
}

foundry.helpers.Hooks.once("init", () => {
  CONFIG.Actor.documentClass = RobotechActor;
  CONFIG.Token.rulerClass = RobotechTokenRuler;
  CONFIG.Combat.documentClass = RobotechCombat;
  CONFIG.Combatant.documentClass = RobotechCombatant;
  CONFIG.ui.combat = RobotechCombatTracker as unknown as typeof foundry.applications.sidebar.tabs.CombatTracker;
  CONFIG.ui.actors = RobotechActorDirectory;
  registerStatusEffects();
  registerTrackableAttributes();
  registerDataModels();
  registerSystemSheets();
  registerSystemSettings();
  applyTheme();
});

foundry.helpers.Hooks.once("ready", () => {
  applyTheme();
});

foundry.helpers.Hooks.on("renderChatMessageHTML", (message: foundry.documents.ChatMessage, html: HTMLElement) => {
  html.classList.add("robotech");
  bindChatButtons(message, html);
});
