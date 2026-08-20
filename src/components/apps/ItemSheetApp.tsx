import type Item from "@client/documents/item.mjs";
import { useState, type ChangeEvent, type JSX } from "react";

import {
  CareerSheetFields,
  EquipmentSuiteSheetFields,
  FeatureSheetFields,
  GearSheetFields,
  RaceSheetFields,
  SkillSheetFields,
  TalentSheetFields,
  UpgradeSheetFields,
  WeaponSheetFields,
} from "@/components/items";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Input } from "@/components/ui/Input";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import { Text } from "@/components/ui/Text";
import { getLayoutMode } from "@/config/itemLayout";
import type { FieldValue } from "@/models";
import { isItemOf } from "@/utils";

export type ItemTabType = "stats" | "description";

interface ItemSheetAppProps {
  item: Item;
}

export function ItemSheetApp({ item }: ItemSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ItemTabType>("stats");
  const layoutMode = getLayoutMode(item.type);
  const system = item.system;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void item.update({ name: e.target.value });
  };

  const handleFieldChange = (path: string, val: FieldValue) => {
    void item.update({ [path]: val });
  };

  const itemTabs: TabItem<ItemTabType>[] = [
    { key: "stats", label: game.i18n.localize("ROBOTECH.Tabs.Stats") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
  ];

  const renderItemFields = () => {
    if (isItemOf(item, "race")) {
      return <RaceSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "career")) {
      return <CareerSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "weapon")) {
      return <WeaponSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "skill")) {
      return <SkillSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "talent")) {
      return <TalentSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "equipment_suite")) {
      return <EquipmentSuiteSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "upgrade")) {
      return <UpgradeSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "gear")) {
      return <GearSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    if (isItemOf(item, "feature")) {
      return <FeatureSheetFields item={item} handleFieldChange={handleFieldChange} />;
    }
    return null;
  };

  const renderedFields = renderItemFields();
  const stackedRows = renderedFields ? 2 : 1;

  const descriptionBlock = (
    <Stack gap={3}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Description")}</CardTitle>
      </CardHeader>
      <ProseMirrorField
        name="system.description"
        value={system.description}
        onChange={(val) => handleFieldChange("system.description", val)}
        minHeight="tall"
      />
    </Stack>
  );

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <Stack gap={2}>
                <Text variant="label" color="primary">
                  {game.i18n.localize(`TYPES.Item.${item.type}`) || item.type}
                </Text>
                <Input
                  value={item.name}
                  onChange={handleNameChange}
                  size="large"
                  width="full"
                  aria-label={game.i18n.localize("ROBOTECH.Item.Name")}
                  placeholder={game.i18n.localize("ROBOTECH.Item.NamePlaceholder")}
                />
              </Stack>
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      {layoutMode === "tabs" ? (
        <>
          <TabNav tabs={itemTabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <SheetBody>
            {activeTab === "stats" && renderedFields && (
              <GridSystem guideWidth={1}>
                <Grid columns={1} rows={1}>
                  <GridCell solid pad={3}>
                    {renderedFields}
                  </GridCell>
                </Grid>
              </GridSystem>
            )}
            {activeTab === "description" && (
              <GridSystem guideWidth={1}>
                <Grid columns={1} rows={1}>
                  <GridCell solid pad={3}>
                    {descriptionBlock}
                  </GridCell>
                </Grid>
              </GridSystem>
            )}
          </SheetBody>
        </>
      ) : (
        <SheetBody>
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={stackedRows}>
              {renderedFields && (
                <GridCell solid pad={3}>
                  {renderedFields}
                </GridCell>
              )}
              <GridCell solid pad={3}>
                {descriptionBlock}
              </GridCell>
            </Grid>
          </GridSystem>
        </SheetBody>
      )}
    </Sheet>
  );
}
