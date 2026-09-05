import { DAMAGE_TYPE_VALUES, WEAPON_RANGE_VALUES } from "@/config/options";
import type { DamageTypeValue, WeaponRangeValue } from "@/config/options";
import { capHardwareDestroyed, hardwareSlotsFields } from "@/models/items/hardwareSlots";
import type { HardwareSlots } from "@/models/items/hardwareSlots";
import { ItemDataModel } from "@/models/items/ItemDataModel";

/** A property that is either on or off, with no value of its own. */
export type WeaponFlag = boolean;

export interface WeaponAmount {
  active: boolean;
  value: number;
}

export interface WeaponHardware extends HardwareSlots {
  active: boolean;
}

export interface WeaponAmmunition extends WeaponAmount {
  current: number;
}

export interface WeaponDamage {
  active: boolean;
  type: DamageTypeValue;
  multiplier: number;
}

export interface WeaponRange {
  active: boolean;
  value: WeaponRangeValue;
}

export interface WeaponProperties {
  damage: WeaponDamage;
  ammunition: WeaponAmmunition;
  range: WeaponRange;
  extended: WeaponFlag;
  melee: WeaponFlag;
  water: WeaponFlag;
  blast: WeaponAmount;
  line: WeaponAmount;
  cone: WeaponFlag;
  sniper: WeaponFlag;
  incendiary: WeaponFlag;
  corrosive: WeaponFlag;
  bulky: WeaponFlag;
  parry: WeaponFlag;
  missile: WeaponFlag;
  quiet: WeaponFlag;
  hardware: WeaponHardware;
  penetration: WeaponAmount;
}

export class WeaponDataModel extends ItemDataModel {
  declare properties: WeaponProperties;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      properties: new fields.SchemaField({
        ammunition: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          current: new fields.NumberField({ initial: 10, integer: true, min: 0 }),
          value: new fields.NumberField({ initial: 10, integer: true, min: 0 }),
        }),
        blast: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        bulky: new fields.BooleanField({ initial: false }),
        cone: new fields.BooleanField({ initial: false }),
        corrosive: new fields.BooleanField({ initial: false }),
        damage: new fields.SchemaField({
          active: new fields.BooleanField({ initial: true }),
          multiplier: new fields.NumberField({
            initial: 1,
            integer: true,
            min: 1,
          }),
          type: new fields.StringField({
            choices: DAMAGE_TYPE_VALUES,
            initial: "mecha",
          }),
        }),
        extended: new fields.BooleanField({ initial: false }),
        hardware: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          ...hardwareSlotsFields(),
        }),
        incendiary: new fields.BooleanField({ initial: false }),
        line: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        melee: new fields.BooleanField({ initial: false }),
        missile: new fields.BooleanField({ initial: false }),
        parry: new fields.BooleanField({ initial: false }),
        penetration: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        quiet: new fields.BooleanField({ initial: false }),
        range: new fields.SchemaField({
          active: new fields.BooleanField({ initial: true }),
          value: new fields.StringField({
            choices: WEAPON_RANGE_VALUES,
            initial: "M",
          }),
        }),
        sniper: new fields.BooleanField({ initial: false }),
        water: new fields.BooleanField({ initial: false }),
      }),
    };
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2]
  ): Promise<boolean | void> {
    capAmmunition(this.properties.ammunition, changes);
    capHardwareDestroyed(this.properties.hardware, changes, "system.properties.hardware");
    return await super._preUpdate(changes, options, user);
  }
}

function isAmmoPatch(value: unknown): value is Partial<WeaponAmmunition> {
  return typeof value === "object" && value !== null;
}

function capAmmunition(ammo: WeaponAmmunition, changes: object): void {
  const patch = foundry.utils.getProperty(changes, "system.properties.ammunition");
  if (!isAmmoPatch(patch)) {
    return;
  }

  const nextMax = typeof patch.value === "number" ? patch.value : ammo.value;
  let nextCurrent = typeof patch.current === "number" ? patch.current : ammo.current;

  if (typeof patch.value === "number") {
    nextCurrent = ammo.current >= ammo.value ? nextMax : Math.min(nextCurrent, nextMax);
  }

  nextCurrent = Math.min(Math.max(0, nextCurrent), nextMax);
  if (nextCurrent === ammo.current && (patch.current === undefined || patch.current === nextCurrent)) {
    return;
  }

  foundry.utils.setProperty(changes, "system.properties.ammunition.current", nextCurrent);
}
