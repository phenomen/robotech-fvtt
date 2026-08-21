import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { NumberInput } from "@/components/ui/NumberInput";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { useLinkedActors, type LinkedActor } from "@/utils";
import { openActorSheet } from "@/utils";

interface CrewListBlockProps {
  actor: ActorOf<"vessel">;
}

export function CrewListBlock({ actor }: CrewListBlockProps): JSX.Element {
  const crew = useLinkedActors(actor.system.characterUuids, ["character"]);

  const handleCapacityChange = (val: number | null) => {
    void actor.update({ "system.crew": Math.max(0, val ?? 0) });
  };

  const handleDelete = (uuid: string) => {
    void actor.update({
      "system.characterUuids": actor.system.characterUuids.filter((id) => id !== uuid),
    });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Crew")}</CardTitle>
        <Field orientation="horizontal" label={game.i18n.localize("ROBOTECH.Vessel.Capacity")}>
          <NumberInput value={actor.system.crew} min={0} onValueChange={handleCapacityChange} />
        </Field>
      </CardHeader>

      {actor.system.characterUuids.length > actor.system.crew && (
        <Callout icon="alert" tone="danger">
          {game.i18n.localize("ROBOTECH.Crew.OverCapacity", {
            count: actor.system.characterUuids.length,
            capacity: actor.system.crew,
          })}
        </Callout>
      )}

      {crew.length === 0 ? (
        <Callout icon="info">{game.i18n.localize("ROBOTECH.Crew.DragDropHint")}</Callout>
      ) : (
        <Table>
          <TableBody>
            {crew.map((member) => (
              <CrewRow key={member.uuid} member={member} onDelete={handleDelete} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function CrewRow({
  member,
  onDelete,
}: {
  member: LinkedActor<"character">;
  onDelete: (uuid: string) => void;
}): JSX.Element {
  if (!member.actor) {
    return (
      <TableRow>
        <TableCell width="grow">
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.LinkedCharacter.Missing")}
          </Text>
        </TableCell>
        <TableCell width="16" align="end">
          <Button
            variant="danger"
            size="icon"
            onClick={() => onDelete(member.uuid)}
            title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
          >
            <Icon name="x" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell width="grow">
        <Button
          variant="ghost"
          onClick={() => void openActorSheet(member.uuid)}
          title={game.i18n.localize("ROBOTECH.LinkedCharacter.OpenSheet")}
        >
          <Stack direction="row" gap={3} align="center">
            <Portrait src={member.actor.img} alt="" size="medium" />
            <Text variant="label" truncate>
              {member.actor.name}
            </Text>
          </Stack>
        </Button>
      </TableCell>
      <TableCell width="16" align="end">
        <Button
          variant="danger"
          size="icon"
          onClick={() => onDelete(member.uuid)}
          title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
        >
          <Icon name="x" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
