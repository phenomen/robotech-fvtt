import { useId, type ChangeEvent, type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { CONFLICT_RECOGNITION_OPTIONS, CONFLICT_THREAT_OPTIONS } from "@/config/choices";
import type { ActorOf, FieldValue } from "@/models";
import { rollConflictPool } from "@/utils";

interface ConflictFieldsBlockProps {
  actor: ActorOf<"conflict">;
}

export function ConflictFieldsBlock({ actor }: ConflictFieldsBlockProps): JSX.Element {
  const system = actor.system;
  const poolId = useId();

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  const handleSelect = (path: string) => (event: ChangeEvent<HTMLSelectElement>) => {
    handleFieldChange(path, event.target.value);
  };

  return (
    <Stack direction="row" gap={3} align="end">
      <Field grow label={game.i18n.localize("ROBOTECH.Conflict.Threat")}>
        <Select value={system.threat} onChange={handleSelect("system.threat")} width="full">
          {CONFLICT_THREAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>

      <Field grow label={game.i18n.localize("ROBOTECH.Conflict.Recognition")}>
        <Select value={system.recognition} onChange={handleSelect("system.recognition")} width="full">
          {CONFLICT_RECOGNITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={game.i18n.localize("ROBOTECH.Conflict.Armor")}>
        <NumberInput
          value={system.armor}
          min={0}
          onValueChange={(val) => handleFieldChange("system.armor", val ?? 0)}
        />
      </Field>

      <Stack gap={1} align="center">
        <Label htmlFor={poolId}>{game.i18n.localize("ROBOTECH.Conflict.Pool")}</Label>
        <Stack direction="row" gap={1} align="center">
          <NumberInput
            id={poolId}
            value={system.pool}
            min={0}
            onValueChange={(val) => handleFieldChange("system.pool", val ?? 0)}
          />
          <Button type="button" variant="primary" size="large" onClick={() => void rollConflictPool(actor)}>
            {game.i18n.localize("ROBOTECH.Buttons.Roll")}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
