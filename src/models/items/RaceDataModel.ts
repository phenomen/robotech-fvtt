import { ItemDataModel } from "@/models/items/ItemDataModel";

export class RaceDataModel extends ItemDataModel {
  declare form: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      form: new fields.StringField({ initial: "" }),
    };
  }
}
