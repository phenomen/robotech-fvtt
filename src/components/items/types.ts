import type { FieldValue, ItemOf, ItemType } from "@/models";

/** Props shared by every per-subtype block of Item sheet fields. */
export interface ItemFieldsProps<T extends ItemType> {
  item: ItemOf<T>;
  handleFieldChange: (path: string, val: FieldValue) => void;
}
