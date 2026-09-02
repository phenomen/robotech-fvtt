import { ItemDataModel } from "@/models/items/ItemDataModel";

export class GearDataModel extends ItemDataModel {
  declare quantity: number;
  declare category: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      category: new fields.StringField({ initial: "general" }),
      quantity: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
    };
  }
}
