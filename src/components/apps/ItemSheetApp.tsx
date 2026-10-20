import type Item from "@client/documents/item.mjs";
import { useState } from "react";
import type { ChangeEvent, JSX } from "react";

import { DescriptionTab } from "@/components/blocks/DescriptionTab";
import { EffectsList } from "@/components/blocks/EffectsList";
import { ItemStatsFields } from "@/components/items/ItemStatsFields";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Input } from "@/components/ui/Input";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav } from "@/components/ui/TabNav";
import type { TabItem } from "@/components/ui/TabNav";
import { Text } from "@/components/ui/Text";
import { getLayoutMode, itemHasEffects } from "@/config/documentMeta";

export type ItemTabType = "stats" | "description" | "effects";

const ITEM_STATS_TAB: TabItem<ItemTabType> = { key: "stats", labelKey: "ROBOTECH.Tabs.Stats" },
  ITEM_DESCRIPTION_TAB: TabItem<ItemTabType> = { key: "description", labelKey: "ROBOTECH.Tabs.Description" },
  ITEM_EFFECTS_TAB: TabItem<ItemTabType> = { key: "effects", labelKey: "ROBOTECH.Tabs.Effects" };

interface ItemSheetAppProps {
  item: Item;
}

export function ItemSheetApp({ item }: ItemSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ItemTabType>("stats"),
    stacked = getLayoutMode(item.type) === "stacked",
    hasEffects = itemHasEffects(item.type),
    showTabNav = !stacked || hasEffects,
    system = item.system,
    handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      void item.update({ name: e.target.value });
    },
    handleFieldChange = (path: string, val: unknown) => {
      void item.update({ [path]: val });
    },
    itemTabs: TabItem<ItemTabType>[] = [
      ITEM_STATS_TAB,
      ...(stacked ? [] : [ITEM_DESCRIPTION_TAB]),
      ...(hasEffects ? [ITEM_EFFECTS_TAB] : []),
    ],
    descriptionBlock = (
      <DescriptionTab
        name="system.description"
        value={system.description}
        onChange={(val) => {
          handleFieldChange("system.description", val);
        }}
        minHeight="tall"
      />
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

      {showTabNav && <TabNav tabs={itemTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      <SheetBody>
        {activeTab === "stats" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={stacked ? 2 : 1}>
              <GridCell solid pad={3}>
                <ItemStatsFields item={item} onFieldChange={handleFieldChange} />
              </GridCell>
              {stacked && (
                <GridCell solid pad={3}>
                  {descriptionBlock}
                </GridCell>
              )}
            </Grid>
          </GridSystem>
        )}

        {activeTab === "description" && !stacked && (
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
                <EffectsList parent={item} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}
      </SheetBody>
    </Sheet>
  );
}
