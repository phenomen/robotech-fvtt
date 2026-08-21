import type { JSX } from "react";

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
  type Option,
} from "@/config/options";
import type { ActorOf } from "@/models";
import { useLinkedActors, type LinkedActor } from "@/utils";
import { openActorSheet, removeEventConflict } from "@/utils";

interface PlotEventConflictListProps {
  actor: ActorOf<"plot_event">;
}

export function PlotEventConflictList({ actor }: PlotEventConflictListProps): JSX.Element {
  const conflicts = useLinkedActors(actor.system.conflictUuids, ["conflict"]);

  const handleDelete = (uuid: string) => {
    void removeEventConflict(actor, uuid);
  };

  return (
    <Stack gap={1}>
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
              <TableCell width="auto" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderType")}
                </Text>
              </TableCell>
              <TableCell width="auto" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderThreat")}
                </Text>
              </TableCell>
              <TableCell width="auto" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.PlotEvent.HeaderRecognition")}
                </Text>
              </TableCell>
              <TableCell width="16" />
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
  conflict: LinkedActor<"conflict">;
  onDelete: (uuid: string) => void;
}): JSX.Element {
  return (
    <TableRow>
      <TableCell width="grow">
        {conflict.actor ? (
          <Button
            variant="ghost"
            onClick={() => void openActorSheet(conflict.uuid)}
            title={game.i18n.localize("ROBOTECH.Sheet.Open")}
          >
            <Text variant="label" truncate>
              {conflict.actor.name}
            </Text>
          </Button>
        ) : (
          <Text variant="label" color="muted" truncate>
            {game.i18n.localize("ROBOTECH.PlotEvent.MissingConflict")}
          </Text>
        )}
      </TableCell>
      <TableCell width="auto" align="center">
        <Text variant="mono" color="primary" align="center">
          {choiceLabel(CONFLICT_TYPE_OPTIONS, conflict.actor?.system.conflictType ?? "")}
        </Text>
      </TableCell>
      <TableCell width="auto" align="center">
        <Text variant="mono" color="primary" align="center">
          {choiceLabel(CONFLICT_THREAT_OPTIONS, conflict.actor?.system.threat ?? "")}
        </Text>
      </TableCell>
      <TableCell width="auto" align="center">
        <Text variant="mono" color="primary" align="center">
          {choiceLabel(CONFLICT_RECOGNITION_OPTIONS, conflict.actor?.system.recognition ?? "")}
        </Text>
      </TableCell>
      <TableCell width="16" align="end">
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

function choiceLabel(options: readonly Option[], value: string): string {
  if (!value) return "";
  const option = options.find((item) => item.value === value);
  return option ? game.i18n.localize(option.labelKey) : value;
}
