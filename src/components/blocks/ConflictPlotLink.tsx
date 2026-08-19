import { useEffect, useState, type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { isActorOf } from "@/utils";

interface ConflictPlotLinkProps {
  actor: ActorOf<"conflict">;
}

interface PlotPreview {
  uuid: string;
  name: string;
  missing: boolean;
}

export function ConflictPlotLink({ actor }: ConflictPlotLinkProps): JSX.Element {
  const uuid = actor.system.plotEventUuid;
  const [preview, setPreview] = useState<PlotPreview | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!uuid) {
      setPreview(null);
      return;
    }

    void previewOf(uuid).then((resolved) => {
      if (!cancelled) setPreview(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [uuid]);

  const linked = Boolean(uuid);
  const canOpen = linked && preview && !preview.missing;
  const label = preview?.missing
    ? game.i18n.localize("ROBOTECH.Conflict.MissingPlotEvent")
    : preview?.name || game.i18n.localize("ROBOTECH.Conflict.PlotEventEmpty");

  return (
    <Field label={game.i18n.localize("ROBOTECH.Conflict.PlotEvent")}>
      <Button
        variant="outline"
        full
        disabled={!canOpen}
        onClick={() => {
          if (preview) void openLinkedSheet(preview.uuid);
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

async function previewOf(uuid: string): Promise<PlotPreview> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "plot_event")) {
    return { uuid, name: document.name, missing: false };
  }
  return { uuid, name: "", missing: true };
}

async function openLinkedSheet(uuid: string): Promise<void> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor) void document.sheet?.render(true);
}
