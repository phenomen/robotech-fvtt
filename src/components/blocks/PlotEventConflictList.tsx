import { useEffect, useState, type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import {
  CONFLICT_RECOGNITION_OPTIONS,
  CONFLICT_THREAT_OPTIONS,
  CONFLICT_TYPE_OPTIONS,
  type ChoiceOption,
} from "@/config/choices";
import type { ActorOf } from "@/models";
import { isActorOf, removeEventConflict } from "@/utils";

interface PlotEventConflictListProps {
  actor: ActorOf<"plot_event">;
}

interface ConflictPreview {
  uuid: string;
  name: string;
  conflictType: string;
  threat: string;
  recognition: string;
  missing: boolean;
}

export function PlotEventConflictList({ actor }: PlotEventConflictListProps): JSX.Element {
  const uuids = actor.system.conflictUuids;
  const [conflicts, setConflicts] = useState<ConflictPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all(uuids.map((uuid) => previewOf(uuid))).then((resolved) => {
      if (!cancelled) setConflicts(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [uuids]);

  const handleDelete = (uuid: string) => {
    void removeEventConflict(actor, uuid);
  };

  return (
    <Stack gap={3}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.PlotEvent.Conflicts")}</CardTitle>
      </CardHeader>

      {conflicts.length === 0 ? (
        <Callout icon="info">{game.i18n.localize("ROBOTECH.PlotEvent.ConflictsHint")}</Callout>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell width="grow">
                <Text variant="label" color="muted">
                  {game.i18n.localize("ROBOTECH.List.HeaderName")}
                </Text>
              </TableCell>
              <TableCell width="hug" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderType")}
                </Text>
              </TableCell>
              <TableCell width="hug" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderThreat")}
                </Text>
              </TableCell>
              <TableCell width="hug" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderRecognition")}
                </Text>
              </TableCell>
              <TableCell width="controls" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {conflicts.map((conflict) => (
              <ConflictRow key={conflict.uuid} conflict={conflict} onDelete={handleDelete} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function ConflictRow({
  conflict,
  onDelete,
}: {
  conflict: ConflictPreview;
  onDelete: (uuid: string) => void;
}): JSX.Element {
  return (
    <TableRow>
      <TableCell width="grow">
        {conflict.missing ? (
          <Text variant="label" color="muted" truncate>
            {game.i18n.localize("ROBOTECH.PlotEvent.MissingConflict")}
          </Text>
        ) : (
          <Button
            variant="ghost"
            onClick={() => void openLinkedSheet(conflict.uuid)}
            title={game.i18n.localize("ROBOTECH.Sheet.Open")}
          >
            <Text variant="label" truncate>
              {conflict.name}
            </Text>
          </Button>
        )}
      </TableCell>
      <TableCell width="hug" align="center">
        <Text variant="mono" color="primary" align="center">
          {conflict.conflictType}
        </Text>
      </TableCell>
      <TableCell width="hug" align="center">
        <Text variant="mono" color="primary" align="center">
          {conflict.threat}
        </Text>
      </TableCell>
      <TableCell width="hug" align="center">
        <Text variant="mono" color="primary" align="center">
          {conflict.recognition}
        </Text>
      </TableCell>
      <TableCell width="controls" align="end">
        <Button
          variant="danger"
          size="icon"
          onClick={() => onDelete(conflict.uuid)}
          title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
        >
          <Icon name="x" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

async function previewOf(uuid: string): Promise<ConflictPreview> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "conflict")) {
    return {
      uuid,
      name: document.name,
      conflictType: choiceLabel(CONFLICT_TYPE_OPTIONS, document.system.conflictType),
      threat: choiceLabel(CONFLICT_THREAT_OPTIONS, document.system.threat),
      recognition: choiceLabel(CONFLICT_RECOGNITION_OPTIONS, document.system.recognition),
      missing: false,
    };
  }
  return { uuid, name: "", conflictType: "", threat: "", recognition: "", missing: true };
}

function choiceLabel(options: readonly ChoiceOption[], value: string): string {
  const option = options.find((item) => item.value === value);
  return option ? game.i18n.localize(option.labelKey) : value;
}

async function openLinkedSheet(uuid: string): Promise<void> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor) void document.sheet?.render(true);
}
