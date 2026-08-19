import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { WEALTH_OPTIONS } from "@/config/choices";
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
    <Stack gap={3}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Character.Miscellaneous")}</CardTitle>
      </CardHeader>
      <Stack direction="row" gap={2} justify="between">
        <Field icon="wealth" iconTone="green" label={game.i18n.localize("ROBOTECH.Character.Wealth")}>
          <Select
            value={system.wealth}
            onChange={(e) => handleFieldChange("system.wealth", e.target.value)}
            width="medium"
          >
            {WEALTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {game.i18n.localize(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>
        <Field icon="armor" iconTone="teal" label={game.i18n.localize("ROBOTECH.Character.Armor")}>
          <NumberInput
            value={system.armor}
            onValueChange={(val) => handleFieldChange("system.armor", val ?? 0)}
            min={0}
          />
        </Field>
        <Field icon="speed" iconTone="blue" label={game.i18n.localize("ROBOTECH.Character.Speed")}>
          <NumberInput value={system.speed} onValueChange={(val) => handleFieldChange("system.speed", val ?? 0)} />
        </Field>
        <Field
          icon="star"
          iconTone="amber"
          title={game.i18n.localize("ROBOTECH.HeroicMove.Title")}
          label={game.i18n.localize("ROBOTECH.HeroicMove.Abbr")}
        >
          <Checkbox
            size="large"
            checked={system.heroicMove.used}
            onCheckedChange={(val) => handleFieldChange("system.heroicMove.used", val)}
            title={game.i18n.localize(
              system.heroicMove.used ? "ROBOTECH.HeroicMove.Used" : "ROBOTECH.HeroicMove.Ready",
            )}
          />
        </Field>
      </Stack>
    </Stack>
  );
}
