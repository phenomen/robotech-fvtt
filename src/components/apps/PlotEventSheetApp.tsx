import { useState, type JSX } from "react";

import { PlotEventConflictList } from "@/components/blocks/PlotEventConflictList";
import { PlotEventHeaderBlock } from "@/components/blocks/PlotEventHeaderBlock";
import { PlotEventRoundsBlock } from "@/components/blocks/PlotEventRoundsBlock";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import type { ActorOf, FieldValue } from "@/models";

interface PlotEventSheetAppProps {
  actor: ActorOf<"plot_event">;
}

export type PlotEventTabType = "data" | "description";

export function PlotEventSheetApp({ actor }: PlotEventSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<PlotEventTabType>("data");

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const tabs: TabItem<PlotEventTabType>[] = [
    { key: "data", label: game.i18n.localize("ROBOTECH.Tabs.Data") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
  ];

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <PlotEventHeaderBlock actor={actor} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      <SheetBody>
        {activeTab === "data" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={2}>
              <GridCell solid pad={3}>
                <PlotEventRoundsBlock actor={actor} />
              </GridCell>
              <GridCell solid pad={3}>
                <PlotEventConflictList actor={actor} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}
        {activeTab === "description" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <Stack gap={3}>
                  <CardHeader>
                    <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Description")}</CardTitle>
                  </CardHeader>
                  <ProseMirrorField
                    name="system.description"
                    value={actor.system.description}
                    onChange={(val) => handleFieldChange("system.description", val)}
                    minHeight="tall"
                  />
                </Stack>
              </GridCell>
            </Grid>
          </GridSystem>
        )}
      </SheetBody>
    </Sheet>
  );
}
