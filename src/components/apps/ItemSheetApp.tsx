import type Item from "@client/documents/item.mjs";
import { useState } from "react";
import type { ChangeEvent, JSX } from "react";

import { ItemEffectsList } from "@/components/blocks/ItemEffectsList";
import { ItemStatsFields } from "@/components/items/ItemStatsFields";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Input } from "@/components/ui/Input";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav } from "@/components/ui/TabNav";
import type { TabItem } from "@/components/ui/TabNav";
import { Text } from "@/components/ui/Text";
import { getLayoutMode, itemHasEffects, itemHasStats } from "@/config/documentMeta";
import type { FieldValue } from "@/models";
import { isItemOf } from "@/utils/documents";

export type ItemTabType = "stats" | "description" | "effects";

const ITEM_STATS_TAB: TabItem<ItemTabType> = { key: "stats", labelKey: "ROBOTECH.Tabs.Stats" };
const ITEM_DESCRIPTION_TAB: TabItem<ItemTabType> = { key: "description", labelKey: "ROBOTECH.Tabs.Description" };
const ITEM_EFFECTS_TAB: TabItem<ItemTabType> = { key: "effects", labelKey: "ROBOTECH.Tabs.Effects" };

interface ItemSheetAppProps {
  item: Item;
}

export function ItemSheetApp({ item }: ItemSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ItemTabType>(isItemOf(item, "upgrade") ? "description" : "stats");
  const layoutMode = getLayoutMode(item.type);
  const hasEffects = itemHasEffects(item.type);
  const hasStats = itemHasStats(item.type);
  const system = item.system;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void item.update({ name: e.target.value });
  };

  const handleFieldChange = (path: string, val: FieldValue) => {
    void item.update({ [path]: val });
  };

  const renderedFields = hasStats ? <ItemStatsFields item={item} onFieldChange={handleFieldChange} /> : null;
  const stackedRows = renderedFields ? 2 : 1;
  const itemTabs: TabItem<ItemTabType>[] = [
    ...(hasStats ? [ITEM_STATS_TAB] : []),
    ITEM_DESCRIPTION_TAB,
    ...(hasEffects ? [ITEM_EFFECTS_TAB] : []),
  ];

  const descriptionBlock = (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Description")}</CardTitle>
      </CardHeader>
      <ProseMirrorField
        name="system.description"
        value={system.description}
        onChange={(val) => {
          handleFieldChange("system.description", val);
        }}
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

            {activeTab === "effects" && hasEffects && (
              <GridSystem guideWidth={1}>
                <Grid columns={1} rows={1}>
                  <GridCell solid pad={3}>
                    <ItemEffectsList item={item} />
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
