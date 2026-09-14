import { ItemDataModel } from "@/models/items/ItemDataModel";

export class GearDataModel extends ItemDataModel {
  declare category: string;
  declare requiredRank: number;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      category: new fields.StringField({ initial: "General" }),
      requiredRank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
    };
  }
}
