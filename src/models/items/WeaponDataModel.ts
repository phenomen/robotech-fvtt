import { DAMAGE_TYPE_VALUES, WEAPON_RANGE_VALUES, type DamageTypeValue, type WeaponRangeValue } from "@/config/options";
import { capHardwareDestroyed, hardwareSlotsFields, type HardwareSlots } from "@/models/items/hardwareSlots";
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
}

export interface WeaponRange {
  active: boolean;
  value: WeaponRangeValue;
}

export interface WeaponMultiplier extends WeaponAmount {
  targetType: DamageTypeValue;
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
  multiplier: WeaponMultiplier;
}

export class WeaponDataModel extends ItemDataModel {
  declare properties: WeaponProperties;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      properties: new fields.SchemaField({
        damage: new fields.SchemaField({
          active: new fields.BooleanField({ initial: true }),
          type: new fields.StringField({
            initial: "mecha",
            choices: DAMAGE_TYPE_VALUES,
          }),
        }),
        ammunition: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 10, integer: true, min: 0 }),
          current: new fields.NumberField({ initial: 10, integer: true, min: 0 }),
        }),
        range: new fields.SchemaField({
          active: new fields.BooleanField({ initial: true }),
          value: new fields.StringField({
            initial: "M",
            choices: WEAPON_RANGE_VALUES,
          }),
        }),
        extended: new fields.BooleanField({ initial: false }),
        melee: new fields.BooleanField({ initial: false }),
        water: new fields.BooleanField({ initial: false }),
        blast: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        line: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        cone: new fields.BooleanField({ initial: false }),
        sniper: new fields.BooleanField({ initial: false }),
        incendiary: new fields.BooleanField({ initial: false }),
        corrosive: new fields.BooleanField({ initial: false }),
        bulky: new fields.BooleanField({ initial: false }),
        parry: new fields.BooleanField({ initial: false }),
        missile: new fields.BooleanField({ initial: false }),
        quiet: new fields.BooleanField({ initial: false }),
        hardware: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          ...hardwareSlotsFields(),
        }),
        penetration: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        }),
        multiplier: new fields.SchemaField({
          active: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({
            initial: 2,
            integer: true,
            min: 2,
            max: 5,
          }),
          targetType: new fields.StringField({
            initial: "light",
            choices: DAMAGE_TYPE_VALUES,
          }),
        }),
      }),
    };
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2],
  ): Promise<boolean | void> {
    capAmmunition(this.properties.ammunition, changes);
    capHardwareDestroyed(this.properties.hardware, changes, "system.properties.hardware");
    return super._preUpdate(changes, options, user);
  }
}

function isAmmoPatch(value: unknown): value is Partial<WeaponAmmunition> {
  return typeof value === "object" && value !== null;
}

function capAmmunition(ammo: WeaponAmmunition, changes: object): void {
  const patch = foundry.utils.getProperty(changes, "system.properties.ammunition");
  if (!isAmmoPatch(patch)) return;

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
