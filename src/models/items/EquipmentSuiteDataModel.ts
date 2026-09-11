import { expandChanges, numberAt, pathTouched } from "@/models/changePatch";
import { capHardwareDestroyed, hardwareSlotsSchema } from "@/models/items/hardwareSlots";
import type { HardwareSlots } from "@/models/items/hardwareSlots";
import { ItemDataModel } from "@/models/items/ItemDataModel";

export interface SuiteUses {
  value: number;
  max: number | null;
}

export class EquipmentSuiteDataModel extends ItemDataModel {
  declare skill: number;
  declare uses: SuiteUses;
  declare hardware: HardwareSlots;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      hardware: hardwareSlotsSchema(),
      skill: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
      uses: new fields.SchemaField({
        max: new fields.NumberField({ initial: 1, integer: true, min: 0, nullable: true }),
        value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      }),
    };
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2]
  ): Promise<boolean | void> {
    capUses(this.uses, changes);
    capHardwareDestroyed(this.hardware, changes, "system.hardware");
    return await super._preUpdate(changes, options, user);
  }
}

function capUses(uses: SuiteUses, changes: object): void {
  const path = "system.uses";
  if (!pathTouched(changes, path)) {
    return;
  }

  const expanded = expandChanges(changes);
  const patchMax = foundry.utils.getProperty(expanded, `${path}.max`);
  let nextMax = uses.max;
  if (pathTouched(changes, `${path}.max`)) {
    nextMax = typeof patchMax === "number" ? patchMax : null;
  }
  if (nextMax === null) {
    return;
  }

  const patchValue = numberAt(expanded, `${path}.value`);
  let nextCurrent = patchValue ?? uses.value;
  if (typeof patchMax === "number") {
    nextCurrent = uses.max === null || uses.value >= uses.max ? nextMax : Math.min(uses.value, nextMax);
  }

  nextCurrent = Math.min(Math.max(0, nextCurrent), nextMax);
  if (nextCurrent === uses.value && (patchValue === undefined || patchValue === nextCurrent)) {
    return;
  }

  foundry.utils.setProperty(changes, `${path}.value`, nextCurrent);
}
