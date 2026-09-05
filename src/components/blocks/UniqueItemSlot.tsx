import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import type { ActorOf, ItemOf } from "@/models";
import { findItemOf, isItemOf } from "@/utils";

type UniqueSlotType = "career" | "race";

const SLOT_TITLE_KEYS = {
  career: "ROBOTECH.Character.Career",
  race: "ROBOTECH.Character.Race",
} as const;

interface UniqueItemSlotProps {
  actor: ActorOf<"character">;
  itemType: UniqueSlotType;
}

async function createSlotItem(actor: ActorOf<"character">, itemType: UniqueSlotType): Promise<void> {
  const typeLabel = game.i18n.localize(`TYPES.Item.${itemType}`);
  const created = await actor.createEmbeddedDocuments("Item", [
    {
      name: game.i18n.localize("ROBOTECH.List.NewItem", { type: typeLabel }),
      type: itemType,
    },
  ]);
  const item = created[0];
  if (item instanceof foundry.documents.Item) {
    void item.sheet?.render(true);
  }
}

function CareerTags({ item }: { item: ItemOf<"career"> }): JSX.Element {
  return (
    <Stack direction="row" gap={1} wrap>
      <Tag
        label={
          item.system.rankTitle
            ? game.i18n.localize("ROBOTECH.Character.RankNTitle", {
                n: item.system.rank,
                title: item.system.rankTitle,
              })
            : game.i18n.localize("ROBOTECH.Character.RankN", { n: item.system.rank })
        }
        color="purple"
        size="small"
        title={game.i18n.localize("ROBOTECH.Character.Rank")}
      />
      {item.system.fameTitle ? (
        <Tag
          label={game.i18n.localize("ROBOTECH.Character.FameNTitle", {
            n: item.system.fame,
            title: item.system.fameTitle,
          })}
          color="amber"
          size="small"
          title={game.i18n.localize("ROBOTECH.Character.Fame")}
        />
      ) : (
        item.system.fame > 0 && (
          <Tag
            label={game.i18n.localize("ROBOTECH.Character.FameN", { n: item.system.fame })}
            color="amber"
            size="small"
            title={game.i18n.localize("ROBOTECH.Character.Fame")}
          />
        )
      )}
    </Stack>
  );
}

function RaceTags({ item }: { item: ItemOf<"race"> }): JSX.Element | null {
  if (!item.system.form) {
    return null;
  }
  return <Tag label={item.system.form} color="teal" size="small" title={game.i18n.localize("ROBOTECH.Race.Form")} />;
}

function FilledSlot({ item }: { item: ItemOf<"career"> | ItemOf<"race"> }): JSX.Element {
  return (
    <Card pad={2} grow bordered>
      <Stack gap={1} grow>
        <Button
          variant="ghost"
          align="start"
          full
          onClick={() => void item.sheet?.render(true)}
          title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
        >
          <Text variant="label" truncate>
            {item.name}
          </Text>
        </Button>
        {isItemOf(item, "career") ? <CareerTags item={item} /> : <RaceTags item={item} />}
      </Stack>
    </Card>
  );
}

export function UniqueItemSlot({ actor, itemType }: UniqueItemSlotProps): JSX.Element {
  const item = itemType === "career" ? findItemOf(actor, "career") : findItemOf(actor, "race");
  const addKey = itemType === "career" ? "ROBOTECH.Character.AddCareer" : "ROBOTECH.Character.AddRace";
  const hintKey = itemType === "career" ? "ROBOTECH.Character.DragDropCareer" : "ROBOTECH.Character.DragDropRace";

  return (
    <Stack gap={1} grow>
      <CardHeader>
        <CardTitle>{game.i18n.localize(SLOT_TITLE_KEYS[itemType])}</CardTitle>
      </CardHeader>
      {item ? (
        <FilledSlot item={item} />
      ) : (
        <Callout
          onClick={() => {
            void createSlotItem(actor, itemType);
          }}
          title={game.i18n.localize(addKey)}
        >
          {game.i18n.localize(hintKey)}
        </Callout>
      )}
    </Stack>
  );
}
