import { useState, type JSX } from "react";

import { ConflictActorList } from "@/components/blocks/ConflictActorList";
import { ConflictFieldsBlock } from "@/components/blocks/ConflictFieldsBlock";
import { ConflictHeaderBlock } from "@/components/blocks/ConflictHeaderBlock";
import { ConflictTrackerBlock } from "@/components/blocks/ConflictTrackerBlock";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import type { ActorOf, FieldValue } from "@/models";

interface ConflictSheetAppProps {
  actor: ActorOf<"conflict">;
}

export type ConflictTabType = "data" | "description";

export function ConflictSheetApp({ actor }: ConflictSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ConflictTabType>("data");

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const tabs: TabItem<ConflictTabType>[] = [
    { key: "data", label: game.i18n.localize("ROBOTECH.Tabs.Data") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
  ];

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

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

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
