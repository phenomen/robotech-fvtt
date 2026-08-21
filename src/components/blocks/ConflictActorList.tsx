import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { useLinkedActors, type LinkedActor } from "@/utils";
import { openActorSheet, SCENE_ACTOR_TYPES } from "@/utils";

interface ConflictActorListProps {
  actor: ActorOf<"conflict">;
}

export function ConflictActorList({ actor }: ConflictActorListProps): JSX.Element {
  const actors = useLinkedActors(actor.system.actorUuids, SCENE_ACTOR_TYPES);

  const handleDelete = (uuid: string) => {
    void actor.update({
      "system.actorUuids": actor.system.actorUuids.filter((id) => id !== uuid),
    });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Conflict.Actors")}</CardTitle>
      </CardHeader>

      {actors.length === 0 ? (
        <Callout icon="info">{game.i18n.localize("ROBOTECH.Conflict.ActorsHint")}</Callout>
      ) : (
        <Table>
          <TableBody>
            {actors.map((member) => (
              <ActorRow key={member.uuid} member={member} onDelete={handleDelete} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function ActorRow({
  member,
  onDelete,
}: {
  member: LinkedActor<"character" | "vessel" | "swarm">;
  onDelete: (uuid: string) => void;
}): JSX.Element {
  if (!member.actor) {
    return (
      <TableRow>
        <TableCell width="grow">
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.Conflict.MissingActor")}
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
          title={game.i18n.localize("ROBOTECH.Sheet.Open")}
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
