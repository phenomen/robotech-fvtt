import { ItemDataModel } from "@/models/items/ItemDataModel";

export class CareerDataModel extends ItemDataModel {
  declare rank: number;
  declare rankTitle: string;
  declare fame: number;
  declare fameTitle: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      fame: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      fameTitle: new fields.StringField({ initial: "" }),
      rank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      rankTitle: new fields.StringField({ initial: "" }),
    };
  }
}
