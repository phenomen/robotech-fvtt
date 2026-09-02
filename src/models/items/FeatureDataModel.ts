import { capHardwareDestroyed, hardwareSlotsSchema } from "@/models/items/hardwareSlots";
import type { HardwareSlots } from "@/models/items/hardwareSlots";
import { ItemDataModel } from "@/models/items/ItemDataModel";

export class FeatureDataModel extends ItemDataModel {
  declare slotType: string;
  declare bonus: string;
  declare hardware: HardwareSlots;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      bonus: new fields.StringField({ initial: "" }),
      hardware: hardwareSlotsSchema(),
      slotType: new fields.StringField({ initial: "general" }),
    };
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2]
  ): Promise<boolean | void> {
    capHardwareDestroyed(this.hardware, changes, "system.hardware");
    return await super._preUpdate(changes, options, user);
  }
}
