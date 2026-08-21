import { type TagColor } from "@/components/ui/Tag";
import { WEAPON_DAMAGE_OPTIONS, WEAPON_RANGE_OPTIONS, type Option, type DamageTypeValue } from "@/config/options";
import type { WeaponProperties } from "@/models";

/** Property keys grouped by the editor control and the value shape they share. */
type FlagKey = {
  [K in keyof WeaponProperties]: WeaponProperties[K] extends boolean ? K : never;
}[keyof WeaponProperties];
type AmountKey = "ammunition" | "blast" | "line" | "penetration";

export type PropertyInputType = "none" | "select" | "number" | "hardware" | "damage";

interface PropertyDefBase {
  nameKey: string;
  tagColor: TagColor;

  formatTag?: (properties: WeaponProperties) => string | string[];
}

export type WeaponPropertyDef = PropertyDefBase &
  (
    | { inputType: "none"; key: FlagKey }
    | { inputType: "number"; key: AmountKey }
    | { inputType: "hardware"; key: "hardware" }
    | { inputType: "select"; key: "range"; selectOptions: readonly Option[] }
    | { inputType: "damage"; key: "damage"; selectOptions: readonly Option[] }
    | { inputType: "multiplier"; key: "multiplier"; selectOptions: readonly Option[] }
  );

const DAMAGE_LETTER_KEYS: Record<DamageTypeValue, string> = {
  light: "ROBOTECH.Item.Property.Multiplier.light",
  mecha: "ROBOTECH.Item.Property.Multiplier.mecha",
  naval: "ROBOTECH.Item.Property.Multiplier.naval",
};

export const WEAPON_PROPERTIES: WeaponPropertyDef[] = [
  {
    key: "damage",
    nameKey: "ROBOTECH.Item.Property.Damage.name",
    tagColor: "red",
    inputType: "damage",
    selectOptions: WEAPON_DAMAGE_OPTIONS,
    formatTag: ({ damage }) =>
      game.i18n.localize("ROBOTECH.Item.Property.Damage.tag", {
        val: game.i18n.localize(DAMAGE_LETTER_KEYS[damage.type]),
      }),
  },
  {
    key: "multiplier",
    nameKey: "ROBOTECH.Item.Property.Multiplier.name",
    tagColor: "red",
    inputType: "multiplier",
    selectOptions: WEAPON_DAMAGE_OPTIONS,
    formatTag: ({ multiplier }) =>
      game.i18n.localize("ROBOTECH.Item.Property.Multiplier.tag", {
        mult: multiplier.value,
        typeLetter: game.i18n.localize(DAMAGE_LETTER_KEYS[multiplier.targetType]),
      }),
  },
  {
    key: "ammunition",
    nameKey: "ROBOTECH.Item.Property.Ammunition.name",
    tagColor: "teal",
    inputType: "number",
  },
  {
    key: "range",
    nameKey: "ROBOTECH.Item.Property.Range.name",
    tagColor: "teal",
    inputType: "select",
    selectOptions: WEAPON_RANGE_OPTIONS,
    formatTag: ({ range }) => game.i18n.localize("ROBOTECH.Item.Property.Range.tag", { val: range.value }),
  },
  {
    key: "extended",
    nameKey: "ROBOTECH.Item.Property.Extended.name",
    tagColor: "teal",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Extended.tag"),
  },
  {
    key: "blast",
    nameKey: "ROBOTECH.Item.Property.Blast.name",
    tagColor: "teal",
    inputType: "number",
    formatTag: ({ blast }) => game.i18n.localize("ROBOTECH.Item.Property.Blast.tag", { val: blast.value }),
  },
  {
    key: "line",
    nameKey: "ROBOTECH.Item.Property.Line.name",
    tagColor: "teal",
    inputType: "number",
    formatTag: ({ line }) => game.i18n.localize("ROBOTECH.Item.Property.Line.tag", { val: line.value }),
  },
  {
    key: "cone",
    nameKey: "ROBOTECH.Item.Property.Cone.name",
    tagColor: "teal",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Cone.tag"),
  },
  {
    key: "melee",
    nameKey: "ROBOTECH.Item.Property.Melee.name",
    tagColor: "teal",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Melee.tag"),
  },
  {
    key: "water",
    nameKey: "ROBOTECH.Item.Property.Water.name",
    tagColor: "teal",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Water.tag"),
  },
  {
    key: "penetration",
    nameKey: "ROBOTECH.Item.Property.Penetration.name",
    tagColor: "amber",
    inputType: "number",
    formatTag: ({ penetration }) =>
      game.i18n.localize("ROBOTECH.Item.Property.Penetration.tag", { val: penetration.value }),
  },
  {
    key: "sniper",
    nameKey: "ROBOTECH.Item.Property.Sniper.name",
    tagColor: "amber",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Sniper.tag"),
  },
  {
    key: "incendiary",
    nameKey: "ROBOTECH.Item.Property.Incendiary.name",
    tagColor: "amber",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Incendiary.tag"),
  },
  {
    key: "corrosive",
    nameKey: "ROBOTECH.Item.Property.Corrosive.name",
    tagColor: "amber",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Corrosive.tag"),
  },
  {
    key: "parry",
    nameKey: "ROBOTECH.Item.Property.Parry.name",
    tagColor: "amber",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Parry.tag"),
  },
  {
    key: "bulky",
    nameKey: "ROBOTECH.Item.Property.Bulky.name",
    tagColor: "green",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Bulky.tag"),
  },
  {
    key: "missile",
    nameKey: "ROBOTECH.Item.Property.Missile.name",
    tagColor: "green",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Missile.tag"),
  },
  {
    key: "quiet",
    nameKey: "ROBOTECH.Item.Property.Quiet.name",
    tagColor: "green",
    inputType: "none",
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Quiet.tag"),
  },
  {
    key: "hardware",
    nameKey: "ROBOTECH.Item.Property.Hardware.name",
    tagColor: "green",
    inputType: "hardware",
    formatTag: ({ hardware }) => {
      const slots = Math.max(0, hardware.value);
      return Array(slots).fill(game.i18n.localize("ROBOTECH.Item.Property.Hardware.tag"));
    },
  },
];
