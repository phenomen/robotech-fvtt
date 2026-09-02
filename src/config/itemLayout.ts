export type ItemSheetLayoutMode = "tabs" | "stacked";

export const ITEM_SHEET_LAYOUTS: Record<string, ItemSheetLayoutMode> = {
  career: "tabs",
  equipment_suite: "tabs",
  feature: "tabs",
  gear: "tabs",
  race: "tabs",
  skill: "stacked",
  talent: "tabs",
  upgrade: "tabs",
  weapon: "tabs",
};

export function getLayoutMode(itemType: string): ItemSheetLayoutMode {
  return ITEM_SHEET_LAYOUTS[itemType] ?? "stacked";
}
