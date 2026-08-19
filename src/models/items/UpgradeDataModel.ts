import { ItemDataModel } from "@/models/items/ItemDataModel";

export class UpgradeDataModel extends ItemDataModel {
  declare rank: number;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      rank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
    };
  }
}
