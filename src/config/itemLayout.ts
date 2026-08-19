export type ItemSheetLayoutMode = "tabs" | "stacked";

export const ITEM_SHEET_LAYOUTS: Record<string, ItemSheetLayoutMode> = {
  weapon: "tabs",
  career: "tabs",
  race: "stacked",
  skill: "stacked",
  talent: "stacked",
  equipment_suite: "stacked",
  gear: "stacked",
  feature: "stacked",
  upgrade: "stacked",
};

export function getLayoutMode(itemType: string): ItemSheetLayoutMode {
  return ITEM_SHEET_LAYOUTS[itemType] ?? "stacked";
}
