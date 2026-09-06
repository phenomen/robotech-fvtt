import { RobotechTokenRuler } from "@/canvas";
import { RobotechCombat, RobotechCombatant, RobotechCombatTracker } from "@/combat";
import { STATUS_EFFECTS, THEME_OPTIONS, THEME_VALUES } from "@/config";
import type { ThemeValue } from "@/config";
import {
  CharacterDataModel,
  ConflictDataModel,
  PlotEventDataModel,
  SwarmDataModel,
  VesselDataModel,
} from "@/models/actors";
import { CombatantDataModel, CombatDataModel } from "@/models/combat";
import {
  CareerDataModel,
  ElementDataModel,
  EquipmentSuiteDataModel,
  FeatureDataModel,
  GearDataModel,
  RaceDataModel,
  SkillDataModel,
  TalentDataModel,
  UpgradeDataModel,
  WeaponDataModel,
} from "@/models/items";
import { RobotechActorSheet } from "@/sheets/RobotechActorSheet";
import { RobotechEffectSheet } from "@/sheets/RobotechEffectSheet";
import { RobotechItemSheet } from "@/sheets/RobotechItemSheet";
import { bindChatButtons } from "@/utils/chatActions";

function registerDataModels(): void {
  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterDataModel,
    conflict: ConflictDataModel,
    plot_event: PlotEventDataModel,
    swarm: SwarmDataModel,
    vessel: VesselDataModel,
  });

  Object.assign(CONFIG.Item.dataModels, {
    career: CareerDataModel,
    element: ElementDataModel,
    equipment_suite: EquipmentSuiteDataModel,
    feature: FeatureDataModel,
    gear: GearDataModel,
    race: RaceDataModel,
    skill: SkillDataModel,
    talent: TalentDataModel,
    upgrade: UpgradeDataModel,
    weapon: WeaponDataModel,
  });

  Object.assign(CONFIG.Combat.dataModels, {
    robotech: CombatDataModel,
  });
  Object.assign(CONFIG.Combatant.dataModels, {
    robotech: CombatantDataModel,
  });
}

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

function isTheme(value: string): value is ThemeValue {
  return (THEME_VALUES as readonly string[]).includes(value);
}

function applyTheme(theme?: string): void {
  const selectedTheme = theme ?? (game.settings?.get("robotech", "theme") as string | undefined) ?? "dark";
  const root = document.documentElement;
  if (!root) {
    return;
  }
  root.dataset.theme = isTheme(selectedTheme) ? selectedTheme : "dark";
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

function registerSystemSettings(): void {
  game.settings.register("robotech", "applyTokenDefaults", {
    config: true,
    default: true,
    hint: "ROBOTECH.Settings.TokenDefaults.Hint",
    key: "applyTokenDefaults",
    name: "ROBOTECH.Settings.TokenDefaults.Name",
    namespace: "robotech",
    scope: "world",
    type: Boolean,
  });

  game.settings.register("robotech", "simpleActions", {
    config: true,
    default: false,
    hint: "ROBOTECH.Settings.SimpleActions.Hint",
    key: "simpleActions",
    name: "ROBOTECH.Settings.SimpleActions.Name",
    namespace: "robotech",
    scope: "world",
    type: Boolean,
  });

  game.settings.register("robotech", "theme", {
    choices: Object.fromEntries(
      THEME_OPTIONS.map(({ value, labelKey, groupKey }) => [value, { group: groupKey, label: labelKey }])
    ),
    config: true,
    default: "dark",
    hint: "ROBOTECH.Settings.Theme.Hint",
    key: "theme",
    name: "ROBOTECH.Settings.Theme.Name",
    namespace: "robotech",
    onChange: (value: unknown) => {
      applyTheme(String(value));
    },
    scope: "client",
    type: String,
  });
}

foundry.helpers.Hooks.once("init", () => {
  CONFIG.Token.rulerClass = RobotechTokenRuler;
  CONFIG.Combat.documentClass = RobotechCombat;
  CONFIG.Combatant.documentClass = RobotechCombatant;
  CONFIG.ui.combat = RobotechCombatTracker as unknown as typeof foundry.applications.sidebar.tabs.CombatTracker;
  registerStatusEffects();
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["vitals.wounds", "vitals.stress"],
      value: ["armor.max"],
    },
    conflict: {
      bar: ["tracker"],
      value: ["pool", "armor"],
    },
    plot_event: {
      bar: [],
      value: ["eventLevel"],
    },
    swarm: {
      bar: ["structure", "vessels"],
      value: [],
    },
    vessel: {
      bar: ["structure", "armor"],
      value: [],
    },
  };
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
