import { applyTheme, themeChoices } from "@/utils/theme";

export interface OptionalRuleDefinition {
  key: string;
  name: string;
  hint: string;
  default: boolean;
}

/** World toggles that switch optional play rules; extend here instead of branching in game logic. */
export const OPTIONAL_RULE_DEFINITIONS = [
  {
    default: false,
    hint: "ROBOTECH.Settings.SimpleActions.Hint",
    key: "simpleActions",
    name: "ROBOTECH.Settings.SimpleActions.Name",
  },
] as const satisfies readonly OptionalRuleDefinition[];

export type OptionalRuleKey = (typeof OPTIONAL_RULE_DEFINITIONS)[number]["key"];

export function optionalRuleEnabled(key: OptionalRuleKey): boolean {
  return game.settings.get("robotech", key) === true;
}

export function registerSystemSettings(): void {
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

  for (const rule of OPTIONAL_RULE_DEFINITIONS) {
    game.settings.register("robotech", rule.key, {
      config: true,
      default: rule.default,
      hint: rule.hint,
      key: rule.key,
      name: rule.name,
      namespace: "robotech",
      scope: "world",
      type: Boolean,
    });
  }

  game.settings.register("robotech", "theme", {
    choices: themeChoices(),
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
