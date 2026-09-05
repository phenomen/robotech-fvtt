import { ItemDataModel } from "@/models/items/ItemDataModel";

export class ElementDataModel extends ItemDataModel {
  declare rank: string;
  declare talent: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      rank: new fields.StringField({ initial: "" }),
      talent: new fields.StringField({ initial: "" }),
    };
  }
}
