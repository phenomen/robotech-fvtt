import { TALENT_CATEGORY_VALUES, type TalentCategoryValue } from "@/config/choices";
import { ItemDataModel } from "@/models/items/ItemDataModel";

export class TalentDataModel extends ItemDataModel {
  declare category: TalentCategoryValue;
  declare prerequisite: string;
  declare uses: number;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      category: new fields.StringField({
        initial: "leadership",
        choices: TALENT_CATEGORY_VALUES,
      }),
      prerequisite: new fields.StringField({ initial: "" }),
      uses: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
    };
  }
}
