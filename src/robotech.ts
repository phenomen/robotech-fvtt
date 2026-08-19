import { RobotechTokenRuler } from "@/canvas";
import { RobotechCombat, RobotechCombatant, RobotechCombatTracker } from "@/combat";
import { STATUS_EFFECTS, THEME_OPTIONS, THEME_VALUES, type ThemeValue } from "@/config";
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
import { RobotechItemSheet } from "@/sheets/RobotechItemSheet";
import { bindChatButtons } from "@/utils/chatActions";

function registerDataModels(): void {
  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterDataModel,
    vessel: VesselDataModel,
    swarm: SwarmDataModel,
    conflict: ConflictDataModel,
    plot_event: PlotEventDataModel,
  });

  Object.assign(CONFIG.Item.dataModels, {
    career: CareerDataModel,
    race: RaceDataModel,
    gear: GearDataModel,
    skill: SkillDataModel,
    talent: TalentDataModel,
    equipment_suite: EquipmentSuiteDataModel,
    weapon: WeaponDataModel,
    feature: FeatureDataModel,
    upgrade: UpgradeDataModel,
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
    makeDefault: true,
    label: "ROBOTECH.Sheet.Actor",
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("robotech", RobotechItemSheet, {
    makeDefault: true,
    label: "ROBOTECH.Sheet.Item",
  });
}

function isTheme(value: string): value is ThemeValue {
  return (THEME_VALUES as readonly string[]).includes(value);
}

function applyTheme(theme?: string): void {
  const selectedTheme = theme ?? (game.settings?.get("robotech", "theme") as string | undefined) ?? "dark";
  const root = document.documentElement;
  if (!root) return;
  root.setAttribute("data-theme", isTheme(selectedTheme) ? selectedTheme : "dark");
}

function registerStatusEffects(): void {
  for (const id of Object.keys(CONFIG.statusEffects)) {
    delete CONFIG.statusEffects[id];
  }
  for (const effect of STATUS_EFFECTS) {
    CONFIG.statusEffects[effect.id] = {
      id: effect.id,
      name: effect.name,
      img: effect.img,
      order: effect.order,
    };
  }
}

function registerSystemSettings(): void {
  game.settings.register("robotech", "applyTokenDefaults", {
    key: "applyTokenDefaults",
    namespace: "robotech",
    name: "ROBOTECH.Settings.TokenDefaults.Name",
    hint: "ROBOTECH.Settings.TokenDefaults.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("robotech", "theme", {
    key: "theme",
    namespace: "robotech",
    name: "ROBOTECH.Settings.Theme.Name",
    hint: "ROBOTECH.Settings.Theme.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: Object.fromEntries(
      THEME_OPTIONS.map(({ value, labelKey, groupKey }) => [value, { label: labelKey, group: groupKey }]),
    ),
    default: "dark",
    onChange: (value: unknown) => applyTheme(String(value)),
  });
}

foundry.helpers.Hooks.once("init", () => {
  CONFIG.Token.rulerClass = RobotechTokenRuler;
  CONFIG.Combat.documentClass = RobotechCombat;
  CONFIG.Combatant.documentClass = RobotechCombatant as typeof foundry.documents.Combatant;
  CONFIG.ui.combat = RobotechCombatTracker as unknown as typeof foundry.applications.sidebar.tabs.CombatTracker;
  registerStatusEffects();
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["vitals.wounds", "vitals.stress"],
      value: ["armor"],
    },
    vessel: {
      bar: ["structure"],
      value: ["armor"],
    },
    swarm: {
      bar: ["structure", "vessels"],
      value: [],
    },
    conflict: {
      bar: ["tracker"],
      value: ["pool", "armor"],
    },
    plot_event: {
      bar: [],
      value: ["eventLevel"],
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
