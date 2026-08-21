import { useEffect, useState, type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { isActorOf } from "@/utils";

interface ConflictActorListProps {
  actor: ActorOf<"conflict">;
}

interface ActorPreview {
  uuid: string;
  name: string;
  img: string;
  missing: boolean;
}

export function ConflictActorList({ actor }: ConflictActorListProps): JSX.Element {
  const uuids = actor.system.actorUuids;
  const [actors, setActors] = useState<ActorPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all(uuids.map((uuid) => previewOf(uuid))).then((resolved) => {
      if (!cancelled) setActors(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [uuids]);

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

function ActorRow({ member, onDelete }: { member: ActorPreview; onDelete: (uuid: string) => void }): JSX.Element {
  return (
    <TableRow>
      <TableCell width="grow">
        {member.missing ? (
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.Conflict.MissingActor")}
          </Text>
        ) : (
          <Button
            variant="ghost"
            onClick={() => void openLinkedSheet(member.uuid)}
            title={game.i18n.localize("ROBOTECH.Sheet.Open")}
          >
            <Stack direction="row" gap={3} align="center">
              <Portrait src={member.img} alt="" size="medium" />
              <Text variant="label" truncate>
                {member.name}
              </Text>
            </Stack>
          </Button>
        )}
      </TableCell>
      <TableCell width="controls" align="end">
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

async function previewOf(uuid: string): Promise<ActorPreview> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isSceneActor(document)) {
    return { uuid, name: document.name, img: document.img, missing: false };
  }
  return { uuid, name: "", img: "", missing: true };
}

function isSceneActor(actor: foundry.documents.Actor): actor is ActorOf<"character" | "vessel" | "swarm"> {
  return isActorOf(actor, "character") || isActorOf(actor, "vessel") || isActorOf(actor, "swarm");
}

async function openLinkedSheet(uuid: string): Promise<void> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor) void document.sheet?.render(true);
}
