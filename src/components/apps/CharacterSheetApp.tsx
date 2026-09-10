import { useState } from "react";
import type { JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { ActorEffectsList } from "@/components/blocks/ActorEffectsList";
import { CharacterCombatBlock } from "@/components/blocks/CharacterCombatBlock";
import { DramaTracker } from "@/components/blocks/CharacterDramaTracker";
import { CharacterExperienceBlock } from "@/components/blocks/CharacterExperienceBlock";
import { Header } from "@/components/blocks/CharacterHeader";
import { CharacterMiscBlock } from "@/components/blocks/CharacterMiscBlock";
import { CharacterNatureBlock } from "@/components/blocks/CharacterNatureBlock";
import { StressTracker } from "@/components/blocks/CharacterStressTracker";
import { WoundTracker } from "@/components/blocks/CharacterWoundTracker";
import { EquipmentSuitesBlock } from "@/components/blocks/EquipmentSuitesBlock";
import { ItemList } from "@/components/blocks/ItemList";
import { UniqueItemSlot } from "@/components/blocks/UniqueItemSlot";
import { Button } from "@/components/ui/Button";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { TabNav } from "@/components/ui/TabNav";
import type { TabItem } from "@/components/ui/TabNav";
import { Textarea } from "@/components/ui/Textarea";
import { GENERIC_SKILL_LABEL_KEYS } from "@/config/options";
import type { ActorOf, FieldValue, ItemOf } from "@/models";
import { filterItemsOf } from "@/utils";

export type ActorTabType = "stats" | "skills" | "talents" | "career" | "equipment" | "personal" | "bio" | "effects";

const ACTOR_TABS: TabItem<ActorTabType>[] = [
  { key: "stats", labelKey: "ROBOTECH.Tabs.Stats" },
  { key: "career", labelKey: "ROBOTECH.Tabs.Career" },
  { key: "personal", labelKey: "ROBOTECH.Tabs.Personal" },
  { key: "skills", labelKey: "ROBOTECH.Tabs.Skills" },
  { key: "talents", labelKey: "ROBOTECH.Tabs.Talents" },
  { key: "equipment", labelKey: "ROBOTECH.Tabs.Equipment" },
  { key: "bio", labelKey: "ROBOTECH.Tabs.Bio" },
  { key: "effects", labelKey: "ROBOTECH.Tabs.Effects" },
];

interface ActorSheetAppProps {
  actor: ActorOf<"character">;
}

async function addGenericSkills(actor: ActorOf<"character">): Promise<void> {
  const existing = new Set(filterItemsOf(actor, "skill").map((skill) => skill.name.toLowerCase()));
  const items = GENERIC_SKILL_LABEL_KEYS.flatMap((key) => {
    const name = game.i18n.localize(key);
    if (existing.has(name.toLowerCase())) {
      return [];
    }
    return [{ name, system: { value: 1 }, type: "skill" as const }];
  });
  if (items.length === 0) {
    return;
  }
  await actor.createEmbeddedDocuments("Item", items);
}

export function CharacterSheetApp({ actor }: ActorSheetAppProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActorTabType>("stats");

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

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={ACTOR_TABS} />

      <SheetBody>
        {activeTab === "stats" && (
          <GridSystem guideWidth={1}>
            <Grid columns={10} rows={2}>
              <GridCell column="1/6" row={1} solid pad={3} tone={system.armorClass === "light" ? "default" : "info"}>
                <WoundTracker actor={actor} />
              </GridCell>
              <GridCell column="6/11" row={1} solid pad={3} tone={system.isMentalBreak ? "danger" : "default"}>
                <StressTracker actor={actor} />
              </GridCell>
              <GridCell column="1/7" row={2} solid pad={3}>
                <CharacterCombatBlock actor={actor} />
              </GridCell>
              <GridCell column="7/11" row={2} solid pad={3}>
                <CharacterExperienceBlock actor={actor} />
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
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <ItemList actor={actor} itemType="talent" title={game.i18n.localize("ROBOTECH.Tabs.Talents")} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "career" && (
          <GridSystem guideWidth={1}>
            <Grid columns={10} rows={2}>
              <GridCell column="1/6" row={1} solid pad={3}>
                <UniqueItemSlot actor={actor} itemType="career" />
              </GridCell>
              <GridCell column="6/11" row={1} solid pad={3}>
                <Stack gap={1}>
                  <CardHeader>
                    <CardTitle>{game.i18n.localize("ROBOTECH.Character.Proficiencies")}</CardTitle>
                  </CardHeader>
                  <Textarea
                    value={system.proficiencies.join("\n")}
                    onChange={(e) => {
                      void actor.update({ "system.proficiencies": e.target.value.split("\n") });
                    }}
                    rows={3}
                    aria-label={game.i18n.localize("ROBOTECH.Character.Proficiencies")}
                    placeholder={game.i18n.localize("ROBOTECH.Character.ProficienciesPlaceholder")}
                  />
                </Stack>
              </GridCell>
              <GridCell column="1/11" row={2} solid pad={3}>
                <ItemList actor={actor} itemType="element" title={game.i18n.localize("ROBOTECH.Item.ElementPl")} />
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

        {activeTab === "personal" && (
          <GridSystem guideWidth={1}>
            <Grid columns={10} rows={3}>
              <GridCell column="1/6" row={1} solid pad={3}>
                <UniqueItemSlot actor={actor} itemType="race" />
              </GridCell>
              <GridCell column="6/11" row={1} solid pad={3}>
                <CharacterNatureBlock actor={actor} />
              </GridCell>
              <GridCell column="1/11" row={2} solid pad={3}>
                <CharacterMiscBlock actor={actor} />
              </GridCell>
              <GridCell column="1/11" row={3} solid pad={3}>
                <DramaTracker actor={actor} />
              </GridCell>
            </Grid>
          </GridSystem>
        )}

        {activeTab === "bio" && (
          <GridSystem guideWidth={1}>
            <Grid columns={1} rows={1}>
              <GridCell solid pad={3}>
                <Stack gap={3}>
                  <CardHeader>
                    <CardTitle>{game.i18n.localize("ROBOTECH.Character.Biography")}</CardTitle>
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
