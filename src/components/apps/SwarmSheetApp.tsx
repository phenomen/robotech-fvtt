import { useState, type JSX } from "react";

import { SwarmHeaderBlock } from "@/components/blocks/SwarmHeaderBlock";
import { SwarmMemberListBlock } from "@/components/blocks/SwarmMemberListBlock";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import type { ActorOf, FieldValue } from "@/models";

interface SwarmSheetAppProps {
  actor: ActorOf<"swarm">;
}

export type SwarmTabType = "members" | "description";

export function SwarmSheetApp({ actor }: SwarmSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<SwarmTabType>("members");

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const swarmTabs: TabItem<SwarmTabType>[] = [
    { key: "members", label: game.i18n.localize("ROBOTECH.Swarm.Tabs.Members") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
  ];

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <SwarmHeaderBlock actor={actor} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={swarmTabs} />

      <SheetBody>
        {activeTab === "members" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <SwarmMemberListBlock actor={actor} />
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
