import { type ChangeEvent, type JSX } from "react";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf } from "@/models";

interface PlotEventHeaderBlockProps {
  actor: ActorOf<"plot_event">;
}

export function PlotEventHeaderBlock({ actor }: PlotEventHeaderBlockProps): JSX.Element {
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: event.target.value });
  };

  return (
    <Stack direction="row" gap={3} align="end">
      <Input
        value={actor.name}
        onChange={handleNameChange}
        size="large"
        width="full"
        aria-label={game.i18n.localize("ROBOTECH.Sheet.Name")}
        placeholder={game.i18n.localize("ROBOTECH.Sheet.NamePlaceholder")}
      />
      <Field label={game.i18n.localize("ROBOTECH.PlotEvent.Level")}>
        <NumberInput
          value={actor.system.eventLevel}
          min={0}
          onValueChange={(val) => void actor.update({ "system.eventLevel": val ?? 0 })}
        />
      </Field>
    </Stack>
  );
}
