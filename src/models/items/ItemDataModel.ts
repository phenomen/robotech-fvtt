import type Item from "@client/documents/item.mjs";

import type { ParentOf } from "@/models/documents";

export class ItemDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<Item>;

  declare description: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}
