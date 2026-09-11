import { useState } from "react";
import type { JSX } from "react";

import { ConflictActorList } from "@/components/blocks/ConflictActorList";
import { ConflictFieldsBlock } from "@/components/blocks/ConflictFieldsBlock";
import { ConflictHeaderBlock } from "@/components/blocks/ConflictHeaderBlock";
import { ConflictTrackerBlock } from "@/components/blocks/ConflictTrackerBlock";
import { DescriptionTab } from "@/components/blocks/DescriptionTab";
import { RedactedBody } from "@/components/blocks/RedactedBody";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { TabNav } from "@/components/ui/TabNav";
import type { TabItem } from "@/components/ui/TabNav";
import type { ActorOf } from "@/models";

interface ConflictSheetAppProps {
  actor: ActorOf<"conflict">;
}

export type ConflictTabType = "data" | "description";

const CONFLICT_TABS: TabItem<ConflictTabType>[] = [
  { key: "data", labelKey: "ROBOTECH.Tabs.Data" },
  { key: "description", labelKey: "ROBOTECH.Tabs.Description" },
];

export function ConflictSheetApp({ actor }: ConflictSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ConflictTabType>("data");

  const handleFieldChange = (path: string, val: unknown) => {
    void actor.update({ [path]: val });
  };

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <ConflictHeaderBlock actor={actor} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      {actor.isOwner ? (
        <>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={CONFLICT_TABS} />

          <SheetBody>
            {activeTab === "data" && (
              <GridSystem guideWidth={1}>
                <Grid columns={1} rows={3}>
                  <GridCell solid pad={3}>
                    <ConflictFieldsBlock actor={actor} />
                  </GridCell>
                  <GridCell solid pad={3}>
                    <ConflictTrackerBlock actor={actor} />
                  </GridCell>
                  <GridCell solid pad={3}>
                    <ConflictActorList actor={actor} />
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
