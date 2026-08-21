import { useState, type JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { ActorEffectsList } from "@/components/blocks/ActorEffectsList";
import { DramaTracker } from "@/components/blocks/CharacterDramaTracker";
import { CharacterExperienceBlock } from "@/components/blocks/CharacterExperienceBlock";
import { Header } from "@/components/blocks/CharacterHeader";
import { CharacterMiscBlock } from "@/components/blocks/CharacterMiscBlock";
import { CharacterNatureBlock } from "@/components/blocks/CharacterNatureBlock";
import { StressTracker } from "@/components/blocks/CharacterStressTracker";
import { WoundTracker } from "@/components/blocks/CharacterWoundTracker";
import { EquipmentSuitesBlock } from "@/components/blocks/EquipmentSuitesBlock";
import { ItemList } from "@/components/blocks/ItemList";
import { Button } from "@/components/ui/Button";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav, type TabItem } from "@/components/ui/TabNav";
import { Textarea } from "@/components/ui/Textarea";
import { GENERIC_SKILL_LABEL_KEYS } from "@/config/options";
import type { ActorOf, FieldValue, ItemOf } from "@/models";
import { filterItemsOf } from "@/utils";

export type ActorTabType = "stats" | "skills" | "talents" | "equipment" | "description" | "effects";

interface ActorSheetAppProps {
  actor: ActorOf<"character">;
}

async function addGenericSkills(actor: ActorOf<"character">): Promise<void> {
  const existing = new Set(filterItemsOf(actor, "skill").map((skill) => skill.name.toLowerCase()));
  const items = GENERIC_SKILL_LABEL_KEYS.flatMap((key) => {
    const name = game.i18n.localize(key);
    if (existing.has(name.toLowerCase())) return [];
    return [{ name, type: "skill" as const, system: { value: 1 } }];
  });
  if (items.length === 0) return;
  await actor.createEmbeddedDocuments("Item", items);
}

export function CharacterSheetApp({ actor }: ActorSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActorTabType>("stats");

  const actorTabs: TabItem<ActorTabType>[] = [
    { key: "stats", label: game.i18n.localize("ROBOTECH.Tabs.Stats") },
    { key: "skills", label: game.i18n.localize("ROBOTECH.Tabs.Skills") },
    { key: "talents", label: game.i18n.localize("ROBOTECH.Tabs.Talents") },
    { key: "equipment", label: game.i18n.localize("ROBOTECH.Tabs.Equipment") },
    { key: "description", label: game.i18n.localize("ROBOTECH.Tabs.Description") },
    { key: "effects", label: game.i18n.localize("ROBOTECH.Tabs.Effects") },
  ];

  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const handleOpenRoll = (skill?: ItemOf<"skill">) => {
    void openActionCenter(actor, { skill1Id: skill?.id ?? undefined });
  };

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <Header actor={actor} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={actorTabs} />

      <SheetBody>
        {activeTab === "stats" && (
          <GridSystem guideWidth={1}>
            <Grid columns={10} rows={3}>
              <GridCell
                column="1/6"
                row={1}
                solid
                pad={3}
                tone={system.vitalsSettings.isMechaWounds ? "info" : "default"}
              >
                <WoundTracker actor={actor} />
              </GridCell>
              <GridCell column="6/11" row={1} solid pad={3} tone={system.isMentalBreak ? "danger" : "default"}>
                <StressTracker actor={actor} />
              </GridCell>
              <GridCell column="1/7" row={2} solid pad={3}>
                <CharacterMiscBlock actor={actor} />
              </GridCell>
              <GridCell column="7/11" row={2} solid pad={3}>
                <CharacterExperienceBlock actor={actor} />
              </GridCell>
              <GridCell column="1/7" row={3} solid pad={3}>
                <DramaTracker actor={actor} />
              </GridCell>
              <GridCell column="7/11" row={3} solid pad={3}>
                <CharacterNatureBlock actor={actor} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "skills" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <ItemList
                  actor={actor}
                  itemType="skill"
                  title={game.i18n.localize("ROBOTECH.Tabs.Skills")}
                  onOpenRoll={handleOpenRoll}
                  headerActions={
                    <Button variant="secondary" onClick={() => void addGenericSkills(actor)}>
                      {game.i18n.localize("ROBOTECH.Character.AddGenericSkills")}
                    </Button>
                  }
                />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "talents" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={2}>
              <GridCell solid pad={3}>
                <Field label={game.i18n.localize("ROBOTECH.Character.Proficiencies")}>
                  <Textarea
                    value={system.proficiencies.join("\n")}
                    onChange={(e) => {
                      void actor.update({ "system.proficiencies": e.target.value.split("\n") });
                    }}
                    rows={3}
                    placeholder={game.i18n.localize("ROBOTECH.Character.ProficienciesPlaceholder")}
                  />
                </Field>
              </GridCell>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="talent" title={game.i18n.localize("ROBOTECH.Tabs.Talents")} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "equipment" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={3}>
              <GridCell solid pad={3}>
                <EquipmentSuitesBlock actor={actor} />
              </GridCell>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="weapon" title={game.i18n.localize("ROBOTECH.Item.WeaponPl")} />
              </GridCell>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="gear" title={game.i18n.localize("ROBOTECH.Item.GearPl")} />
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
