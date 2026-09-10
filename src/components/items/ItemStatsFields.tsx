import type Item from "@client/documents/item.mjs";
import type { JSX } from "react";

import { CareerSheetFields } from "@/components/items/CareerSheetFields";
import { ElementSheetFields } from "@/components/items/ElementSheetFields";
import { EquipmentSuiteSheetFields } from "@/components/items/EquipmentSuiteSheetFields";
import { FeatureSheetFields } from "@/components/items/FeatureSheetFields";
import { GearSheetFields } from "@/components/items/GearSheetFields";
import { RaceSheetFields } from "@/components/items/RaceSheetFields";
import { SkillSheetFields } from "@/components/items/SkillSheetFields";
import { TalentSheetFields } from "@/components/items/TalentSheetFields";
import { UpgradeSheetFields } from "@/components/items/UpgradeSheetFields";
import { WeaponSheetFields } from "@/components/items/WeaponSheetFields";
import type { FieldValue, ItemType } from "@/models";
import { isItemOf } from "@/utils/documents";

type ItemFieldChange = (path: string, val: FieldValue) => void;
type ItemStatsRenderer = (item: Item, onChange: ItemFieldChange) => JSX.Element | null;

/** One renderer per Item subtype. */
const ITEM_STATS_RENDERERS: Record<ItemType, ItemStatsRenderer> = {
  career: (item, onChange) =>
    isItemOf(item, "career") ? <CareerSheetFields item={item} handleFieldChange={onChange} /> : null,
  element: (item, onChange) =>
    isItemOf(item, "element") ? <ElementSheetFields item={item} handleFieldChange={onChange} /> : null,
  equipment_suite: (item, onChange) =>
    isItemOf(item, "equipment_suite") ? <EquipmentSuiteSheetFields item={item} handleFieldChange={onChange} /> : null,
  feature: (item, onChange) =>
    isItemOf(item, "feature") ? <FeatureSheetFields item={item} handleFieldChange={onChange} /> : null,
  gear: (item, onChange) =>
    isItemOf(item, "gear") ? <GearSheetFields item={item} handleFieldChange={onChange} /> : null,
  race: (item, onChange) =>
    isItemOf(item, "race") ? <RaceSheetFields item={item} handleFieldChange={onChange} /> : null,
  skill: (item, onChange) =>
    isItemOf(item, "skill") ? <SkillSheetFields item={item} handleFieldChange={onChange} /> : null,
  talent: (item, onChange) =>
    isItemOf(item, "talent") ? <TalentSheetFields item={item} handleFieldChange={onChange} /> : null,
  upgrade: (item, onChange) =>
    isItemOf(item, "upgrade") ? <UpgradeSheetFields item={item} handleFieldChange={onChange} /> : null,
  weapon: (item, onChange) =>
    isItemOf(item, "weapon") ? <WeaponSheetFields item={item} handleFieldChange={onChange} /> : null,
};

export function ItemStatsFields({
  item,
  onFieldChange,
}: {
  item: Item;
  onFieldChange: ItemFieldChange;
}): JSX.Element | null {
  const renderer: ItemStatsRenderer | undefined = ITEM_STATS_RENDERERS[item.type];
  return renderer ? renderer(item, onFieldChange) : null;
}
