import { type ChangeEvent, type JSX } from "react";

import { ConflictPlotLink } from "@/components/blocks/ConflictPlotLink";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { CONFLICT_TYPE_OPTIONS } from "@/config/choices";
import type { ActorOf, FieldValue } from "@/models";

interface ConflictHeaderBlockProps {
  actor: ActorOf<"conflict">;
}

export function ConflictHeaderBlock({ actor }: ConflictHeaderBlockProps): JSX.Element {
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: event.target.value });
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value: FieldValue = event.target.value;
    void actor.update({ "system.conflictType": value });
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
      <Field label={game.i18n.localize("ROBOTECH.Conflict.Type")}>
        <Select value={actor.system.conflictType} onChange={handleTypeChange} width="full">
          {CONFLICT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>
      <ConflictPlotLink actor={actor} />
    </Stack>
  );
}
