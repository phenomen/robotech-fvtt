import { useState, type JSX } from "react";

import { ActorEffectsList } from "@/components/blocks/ActorEffectsList";
import { CrewListBlock } from "@/components/blocks/CrewListBlock";
import { EquipmentSuitesBlock } from "@/components/blocks/EquipmentSuitesBlock";
import { ItemList } from "@/components/blocks/ItemList";
import { VesselDetailsBlock } from "@/components/blocks/VesselDetailsBlock";
import { VesselFrameworkBlock } from "@/components/blocks/VesselFrameworkBlock";
import { VesselHeaderBlock } from "@/components/blocks/VesselHeaderBlock";
import { VesselSpeedBlock } from "@/components/blocks/VesselSpeedBlock";
import { VesselSystemsBlock } from "@/components/blocks/VesselSystemsBlock";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import { ToggleGroup, ToggleItem } from "@/components/ui/ToggleGroup";
import { VESSEL_MODE_OPTIONS } from "@/config/options";
import type { ActorOf, FieldValue } from "@/models";

interface VesselSheetAppProps {
  actor: ActorOf<"vessel">;
}

export type VesselTabType = "stats" | "equipment" | "crew" | "description" | "effects";

export function VesselSheetApp({ actor }: VesselSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<VesselTabType>("stats");

  const system = actor.system;
  const isMecha = system.vesselType === "mecha";
  const statsRows = 1 + (system.isBasic ? 0 : 1) + 1 + (isMecha ? 1 : 0);

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const vesselTabs: TabItem<VesselTabType>[] = [
    { key: "stats", label: game.i18n.localize("ROBOTECH.Tabs.Stats") },
    { key: "equipment", label: game.i18n.localize("ROBOTECH.Tabs.Equipment") },
    { key: "crew", label: game.i18n.localize("ROBOTECH.Tabs.Crew") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
    { key: "effects", label: game.i18n.localize("ROBOTECH.Tabs.Effects") },
  ];

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <VesselHeaderBlock actor={actor} onFieldChange={handleFieldChange} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={vesselTabs} />

      <SheetBody>
        {activeTab === "stats" && (
          <GridSystem guideWidth={1}>
            <Grid columns={2} rows={statsRows}>
              <GridCell solid pad={3}>
                <VesselFrameworkBlock actor={actor} onFieldChange={handleFieldChange} />
              </GridCell>
              <GridCell solid pad={3}>
                <VesselDetailsBlock actor={actor} />
              </GridCell>
              {!system.isBasic && (
                <GridCell column="1/3" solid pad={3} tone="hollow">
                  <VesselSystemsBlock actor={actor} onFieldChange={handleFieldChange} />
                </GridCell>
              )}
              <GridCell column="1/3" solid pad={3}>
                <VesselSpeedBlock actor={actor} />
              </GridCell>
              {isMecha && (
                <GridCell column="1/3" solid pad={3}>
                  <Stack direction="row" gap={3} align="center" justify="between">
                    <Checkbox
                      checked={system.transformable}
                      onCheckedChange={(val) => handleFieldChange("system.transformable", val)}
                      label={game.i18n.localize("ROBOTECH.Vessel.Transformable")}
                    />
                    {system.transformable && (
                      <ToggleGroup value={system.mode} onValueChange={(val) => handleFieldChange("system.mode", val)}>
                        {VESSEL_MODE_OPTIONS.map((option) => (
                          <ToggleItem key={option.value} value={option.value}>
                            {game.i18n.localize(option.labelKey)}
                          </ToggleItem>
                        ))}
                      </ToggleGroup>
                    )}
                  </Stack>
                </GridCell>
              )}
            </Grid>
          </GridSystem>
        )}

        {activeTab === "equipment" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={4}>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="weapon" title={game.i18n.localize("ROBOTECH.Item.WeaponPl")} />
              </GridCell>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="feature" title={game.i18n.localize("ROBOTECH.Item.FeaturePl")} />
              </GridCell>
              <GridCell solid pad={3}>
                <EquipmentSuitesBlock actor={actor} />
              </GridCell>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="upgrade" title={game.i18n.localize("ROBOTECH.Item.UpgradePl")} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "crew" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <CrewListBlock actor={actor} />
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
                    value={system.description}
                    onChange={(val) => handleFieldChange("system.description", val)}
                    minHeight="tall"
                  />
                </Stack>
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "effects" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <ActorEffectsList actor={actor} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}
      </SheetBody>
    </Sheet>
  );
}
