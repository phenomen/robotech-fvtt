import { useState } from "react";
import type { JSX } from "react";

import { DescriptionTab } from "@/components/blocks/DescriptionTab";
import { PlotEventConflictList } from "@/components/blocks/PlotEventConflictList";
import { PlotEventHeaderBlock } from "@/components/blocks/PlotEventHeaderBlock";
import { PlotEventRoundsBlock } from "@/components/blocks/PlotEventRoundsBlock";
import { RedactedBody } from "@/components/blocks/RedactedBody";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { TabNav } from "@/components/ui/TabNav";
import type { TabItem } from "@/components/ui/TabNav";
import type { ActorOf } from "@/models";

interface PlotEventSheetAppProps {
  actor: ActorOf<"plot_event">;
}

export type PlotEventTabType = "data" | "description";

const PLOT_EVENT_TABS: TabItem<PlotEventTabType>[] = [
  { key: "data", labelKey: "ROBOTECH.Tabs.Data" },
  { key: "description", labelKey: "ROBOTECH.Tabs.Description" },
];

export function PlotEventSheetApp({ actor }: PlotEventSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<PlotEventTabType>("data");

  const handleFieldChange = (path: string, val: unknown) => {
    void actor.update({ [path]: val });
  };

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

      {actor.isOwner ? (
        <>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={PLOT_EVENT_TABS} />

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
                    <DescriptionTab
                      name="system.description"
                      value={actor.system.description}
                      onChange={(val) => {
                        handleFieldChange("system.description", val);
                      }}
                      minHeight="tall"
                    />
                  </GridCell>
                </Grid>
              </GridSystem>
            )}
          </SheetBody>
        </>
      ) : (
        <RedactedBody />
      )}
    </Sheet>
  );
}
