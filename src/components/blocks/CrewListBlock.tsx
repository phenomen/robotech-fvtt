import { useState, useEffect, type JSX } from "react";

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
import { isActorOf } from "@/utils";

interface CrewListBlockProps {
  actor: ActorOf<"vessel">;
}

interface CrewPreview {
  uuid: string;
  name: string;
  img: string;
  missing: boolean;
}

export function CrewListBlock({ actor }: CrewListBlockProps): JSX.Element {
  const uuids = actor.system.characterUuids;
  const [crew, setCrew] = useState<CrewPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all(uuids.map((uuid) => previewOf(uuid))).then((resolved) => {
      if (!cancelled) setCrew(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [uuids]);

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

      {uuids.length > actor.system.crew && (
        <Callout icon="alert" tone="danger">
          {game.i18n.localize("ROBOTECH.Crew.OverCapacity", {
            count: uuids.length,
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

function CrewRow({ member, onDelete }: { member: CrewPreview; onDelete: (uuid: string) => void }): JSX.Element {
  return (
    <TableRow>
      <TableCell width="grow">
        {member.missing ? (
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.LinkedCharacter.Missing")}
          </Text>
        ) : (
          <Button
            variant="ghost"
            onClick={() => void openCrewSheet(member.uuid)}
            title={game.i18n.localize("ROBOTECH.LinkedCharacter.OpenSheet")}
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

async function previewOf(uuid: string): Promise<CrewPreview> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "character")) {
    return { uuid, name: document.name, img: document.img, missing: false };
  }
  return { uuid, name: "", img: "", missing: true };
}

async function openCrewSheet(uuid: string): Promise<void> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor) void document.sheet?.render(true);
}
