import type { JSX } from "react";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { WEALTH_OPTIONS } from "@/config/options";
import type { ActorOf, FieldValue } from "@/models";

interface CharacterMiscBlockProps {
  actor: ActorOf<"character">;
}

export function CharacterMiscBlock({ actor }: CharacterMiscBlockProps): JSX.Element {
  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  return (
    <Stack direction="row" gap={3}>
      <Field grow label={game.i18n.localize("ROBOTECH.Character.Callsign")}>
        <Input
          width="full"
          value={system.callsign}
          onChange={(e) => {
            handleFieldChange("system.callsign", e.target.value);
          }}
          placeholder={game.i18n.localize("ROBOTECH.Character.CallsignPlaceholder")}
        />
      </Field>
      <Field grow label={game.i18n.localize("ROBOTECH.Character.Faction")}>
        <Input
          width="full"
          value={system.faction}
          onChange={(e) => {
            handleFieldChange("system.faction", e.target.value);
          }}
          placeholder={game.i18n.localize("ROBOTECH.Character.FactionPlaceholder")}
        />
      </Field>
      <Field icon="wealth" iconTone="green" label={game.i18n.localize("ROBOTECH.Character.Wealth")}>
        <Select
          value={system.wealth}
          onChange={(e) => {
            handleFieldChange("system.wealth", e.target.value);
          }}
          width="medium"
        >
          {WEALTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>
    </Stack>
  );
}
