import type { TagColor } from "@/components/ui/Tag";
import { WEAPON_DAMAGE_OPTIONS, WEAPON_RANGE_OPTIONS } from "@/config/options";
import type { Option, DamageTypeValue } from "@/config/options";
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
  );

const DAMAGE_LETTER_KEYS: Record<DamageTypeValue, string> = {
  light: "ROBOTECH.Item.Property.Damage.light",
  mecha: "ROBOTECH.Item.Property.Damage.mecha",
  naval: "ROBOTECH.Item.Property.Damage.naval",
};

export function damageTagLabel(multiplier: number, type: DamageTypeValue): string {
  return game.i18n.localize("ROBOTECH.Item.Property.Damage.tag", {
    mult: Math.max(1, multiplier),
    typeLetter: game.i18n.localize(DAMAGE_LETTER_KEYS[type]),
  });
}

export const WEAPON_PROPERTIES: WeaponPropertyDef[] = [
  {
    formatTag: ({ damage }) => damageTagLabel(damage.multiplier, damage.type),
    inputType: "damage",
    key: "damage",
    nameKey: "ROBOTECH.Item.Property.Damage.name",
    selectOptions: WEAPON_DAMAGE_OPTIONS,
    tagColor: "red",
  },
  {
    inputType: "number",
    key: "ammunition",
    nameKey: "ROBOTECH.Item.Property.Ammunition.name",
    tagColor: "teal",
  },
  {
    formatTag: ({ range }) => game.i18n.localize("ROBOTECH.Item.Property.Range.tag", { val: range.value }),
    inputType: "select",
    key: "range",
    nameKey: "ROBOTECH.Item.Property.Range.name",
    selectOptions: WEAPON_RANGE_OPTIONS,
    tagColor: "teal",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Extended.tag"),
    inputType: "none",
    key: "extended",
    nameKey: "ROBOTECH.Item.Property.Extended.name",
    tagColor: "teal",
  },
  {
    formatTag: ({ blast }) => game.i18n.localize("ROBOTECH.Item.Property.Blast.tag", { val: blast.value }),
    inputType: "number",
    key: "blast",
    nameKey: "ROBOTECH.Item.Property.Blast.name",
    tagColor: "teal",
  },
  {
    formatTag: ({ line }) => game.i18n.localize("ROBOTECH.Item.Property.Line.tag", { val: line.value }),
    inputType: "number",
    key: "line",
    nameKey: "ROBOTECH.Item.Property.Line.name",
    tagColor: "teal",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Cone.tag"),
    inputType: "none",
    key: "cone",
    nameKey: "ROBOTECH.Item.Property.Cone.name",
    tagColor: "teal",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Melee.tag"),
    inputType: "none",
    key: "melee",
    nameKey: "ROBOTECH.Item.Property.Melee.name",
    tagColor: "teal",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Water.tag"),
    inputType: "none",
    key: "water",
    nameKey: "ROBOTECH.Item.Property.Water.name",
    tagColor: "teal",
  },
  {
    formatTag: ({ penetration }) =>
      game.i18n.localize("ROBOTECH.Item.Property.Penetration.tag", { val: penetration.value }),
    inputType: "number",
    key: "penetration",
    nameKey: "ROBOTECH.Item.Property.Penetration.name",
    tagColor: "amber",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Sniper.tag"),
    inputType: "none",
    key: "sniper",
    nameKey: "ROBOTECH.Item.Property.Sniper.name",
    tagColor: "amber",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Incendiary.tag"),
    inputType: "none",
    key: "incendiary",
    nameKey: "ROBOTECH.Item.Property.Incendiary.name",
    tagColor: "amber",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Corrosive.tag"),
    inputType: "none",
    key: "corrosive",
    nameKey: "ROBOTECH.Item.Property.Corrosive.name",
    tagColor: "amber",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Parry.tag"),
    inputType: "none",
    key: "parry",
    nameKey: "ROBOTECH.Item.Property.Parry.name",
    tagColor: "amber",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Bulky.tag"),
    inputType: "none",
    key: "bulky",
    nameKey: "ROBOTECH.Item.Property.Bulky.name",
    tagColor: "green",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Missile.tag"),
    inputType: "none",
    key: "missile",
    nameKey: "ROBOTECH.Item.Property.Missile.name",
    tagColor: "green",
  },
  {
    formatTag: () => game.i18n.localize("ROBOTECH.Item.Property.Quiet.tag"),
    inputType: "none",
    key: "quiet",
    nameKey: "ROBOTECH.Item.Property.Quiet.name",
    tagColor: "green",
  },
  {
    formatTag: ({ hardware }) => {
      const slots = Math.max(0, hardware.value);
      return Array.from({ length: slots }, () => game.i18n.localize("ROBOTECH.Item.Property.Hardware.tag"));
    },
    inputType: "hardware",
    key: "hardware",
    nameKey: "ROBOTECH.Item.Property.Hardware.name",
    tagColor: "green",
  },
];
