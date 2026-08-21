import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { useLinkedActors } from "@/utils";
import { openActorSheet } from "@/utils";

interface ConflictPlotLinkProps {
  actor: ActorOf<"conflict">;
}

export function ConflictPlotLink({ actor }: ConflictPlotLinkProps): JSX.Element {
  const uuid = actor.system.plotEventUuid;
  const [link] = useLinkedActors(uuid ? [uuid] : [], ["plot_event"]);
  const plotEvent = link?.actor ?? null;

  const linked = Boolean(uuid);
  const canOpen = linked && plotEvent !== null;
  const label =
    linked && plotEvent === null
      ? game.i18n.localize("ROBOTECH.Conflict.MissingPlotEvent")
      : plotEvent?.name || game.i18n.localize("ROBOTECH.Conflict.PlotEventEmpty");

  return (
    <Field label={game.i18n.localize("ROBOTECH.Conflict.PlotEvent")}>
      <Button
        variant="outline"
        full
        disabled={!canOpen}
        onClick={() => {
          if (uuid) void openActorSheet(uuid);
        }}
        title={game.i18n.localize("ROBOTECH.Sheet.Open")}
      >
        <Text variant="label" truncate color={canOpen ? "foreground" : "muted"}>
          {label}
        </Text>
      </Button>
    </Field>
  );
}
