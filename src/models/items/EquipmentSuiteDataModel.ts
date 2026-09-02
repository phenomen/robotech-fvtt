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

function isUsesPatch(value: unknown): value is Partial<SuiteUses> {
  return typeof value === "object" && value !== null;
}

function capUses(uses: SuiteUses, changes: object): void {
  const patch = foundry.utils.getProperty(changes, "system.uses");
  if (!isUsesPatch(patch)) {
    return;
  }

  let nextMax = uses.max;
  if ("max" in patch) {
    nextMax = typeof patch.max === "number" ? patch.max : null;
  }
  if (nextMax === null) {
    return;
  }

  let nextCurrent = typeof patch.value === "number" ? patch.value : uses.value;
  if (typeof patch.max === "number") {
    nextCurrent = uses.max === null || uses.value >= uses.max ? nextMax : Math.min(uses.value, nextMax);
  }

  nextCurrent = Math.min(Math.max(0, nextCurrent), nextMax);
  if (nextCurrent === uses.value && (patch.value === undefined || patch.value === nextCurrent)) {
    return;
  }

  foundry.utils.setProperty(changes, "system.uses.value", nextCurrent);
}
