import type { JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf, FieldValue } from "@/models";

interface CharacterCombatBlockProps {
  actor: ActorOf<"character">;
}

export function CharacterCombatBlock({ actor }: CharacterCombatBlockProps): JSX.Element {
  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Character.Encounter")}</CardTitle>
      </CardHeader>
      <Stack direction="row" gap={2} justify="between">
        <Field icon="armor" iconTone="teal" label={game.i18n.localize("ROBOTECH.Character.Armor")}>
          <NumberInput
            value={system.armor.max}
            onValueChange={(val) => {
              const rating = Math.max(0, val ?? 0);
              void actor.update({
                "system.armor.max": rating,
                "system.armor.value": rating,
              });
            }}
            min={0}
          />
        </Field>
        <Field icon="resistance" iconTone="teal" label={game.i18n.localize("ROBOTECH.Character.Resistance")}>
          <NumberInput
            value={system.resistance}
            onValueChange={(val) => {
              handleFieldChange("system.resistance", val ?? 0);
            }}
            min={0}
          />
        </Field>
        <Field icon="speed" iconTone="blue" label={game.i18n.localize("ROBOTECH.Character.Speed")}>
          <NumberInput
            value={system.speed}
            onValueChange={(val) => {
              handleFieldChange("system.speed", val ?? 0);
            }}
          />
        </Field>
        <Field icon="star" iconTone="amber" label={game.i18n.localize("ROBOTECH.HeroicMove.Title")}>
          <Checkbox
            size="large"
            checked={system.heroicMove.used}
            onCheckedChange={(val) => {
              handleFieldChange("system.heroicMove.used", val);
            }}
            title={game.i18n.localize(
              system.heroicMove.used ? "ROBOTECH.HeroicMove.Used" : "ROBOTECH.HeroicMove.Ready"
            )}
          />
        </Field>
      </Stack>
    </Stack>
  );
}
