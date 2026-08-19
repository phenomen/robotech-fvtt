import { ItemDataModel } from "@/models/items/ItemDataModel";

export class SkillDataModel extends ItemDataModel {
  declare value: number;
  declare benefit: string;
  declare cost: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      value: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 5 }),
      benefit: new fields.StringField({ initial: "" }),
      cost: new fields.StringField({ initial: "" }),
    };
  }
}
