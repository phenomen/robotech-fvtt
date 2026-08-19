import { type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { findItemOf } from "@/utils";

interface DragDropSlotsProps {
  actor: ActorOf<"character">;
}

export function DragDropSlots({ actor }: DragDropSlotsProps): JSX.Element {
  const careerItem = findItemOf(actor, "career");
  const raceItem = findItemOf(actor, "race");

  return (
    <Stack direction="row" gap={3}>
      {careerItem ? (
        <Card pad={2} grow bordered>
          <Stack gap={1} grow>
            <Button
              variant="ghost"
              align="start"
              full
              onClick={() => void careerItem.sheet?.render(true)}
              title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
            >
              <Text variant="label" truncate>
                {careerItem.name}
              </Text>
            </Button>
            <Stack direction="row" gap={1} wrap>
              {careerItem.system.element && (
                <Tag
                  label={careerItem.system.element}
                  color="teal"
                  size="small"
                  title={game.i18n.localize("ROBOTECH.Item.Element")}
                />
              )}
              <Tag
                label={
                  careerItem.system.rankTitle
                    ? `R${careerItem.system.rank}: ${careerItem.system.rankTitle}`
                    : `R${careerItem.system.rank}`
                }
                color="purple"
                size="small"
                title={game.i18n.localize("ROBOTECH.Character.Rank")}
              />
              {careerItem.system.fameTitle ? (
                <Tag
                  label={`F${careerItem.system.fame}: ${careerItem.system.fameTitle}`}
                  color="amber"
                  size="small"
                  title={game.i18n.localize("ROBOTECH.Character.Fame")}
                />
              ) : (
                careerItem.system.fame > 0 && (
                  <Tag
                    label={`F${careerItem.system.fame}`}
                    color="amber"
                    size="small"
                    title={game.i18n.localize("ROBOTECH.Character.Fame")}
                  />
                )
              )}
            </Stack>
          </Stack>
        </Card>
      ) : (
        <Callout>{game.i18n.localize("ROBOTECH.Character.DragDropCareer")}</Callout>
      )}

      {raceItem ? (
        <Card pad={2} grow bordered>
          <Stack gap={1} grow>
            <Button
              variant="ghost"
              align="start"
              full
              onClick={() => void raceItem.sheet?.render(true)}
              title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
            >
              <Text variant="label" truncate>
                {raceItem.name}
              </Text>
            </Button>
            {raceItem.system.form && (
              <Tag
                label={raceItem.system.form}
                color="teal"
                size="small"
                title={game.i18n.localize("ROBOTECH.Race.Form")}
              />
            )}
          </Stack>
        </Card>
      ) : (
        <Callout>{game.i18n.localize("ROBOTECH.Character.DragDropRace")}</Callout>
      )}
    </Stack>
  );
}
