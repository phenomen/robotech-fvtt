export type ItemSheetLayoutMode = "tabs" | "stacked";

export const ITEM_SHEET_LAYOUTS: Record<string, ItemSheetLayoutMode> = {
  weapon: "tabs",
  career: "tabs",
  race: "tabs",
  skill: "stacked",
  talent: "tabs",
  equipment_suite: "tabs",
  gear: "tabs",
  feature: "tabs",
  upgrade: "tabs",
};

export function getLayoutMode(itemType: string): ItemSheetLayoutMode {
  return ITEM_SHEET_LAYOUTS[itemType] ?? "stacked";
}
