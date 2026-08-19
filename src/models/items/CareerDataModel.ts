import { ItemDataModel } from "@/models/items/ItemDataModel";

export class CareerDataModel extends ItemDataModel {
  declare element: string;
  declare talent: string;
  declare rank: number;
  declare rankTitle: string;
  declare fame: number;
  declare fameTitle: string;
  declare equipment: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      element: new fields.StringField({ initial: "" }),
      talent: new fields.StringField({ initial: "" }),
      rank: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      rankTitle: new fields.StringField({ initial: "" }),
      fame: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      fameTitle: new fields.StringField({ initial: "" }),
      equipment: new fields.StringField({ initial: "" }),
    };
  }
}
