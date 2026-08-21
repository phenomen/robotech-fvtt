import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf, FieldValue } from "@/models";

interface CharacterExperienceBlockProps {
  actor: ActorOf<"character">;
}

export function CharacterExperienceBlock({ actor }: CharacterExperienceBlockProps): JSX.Element {
  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Character.Experience")}</CardTitle>
      </CardHeader>
      <Stack direction="row" gap={2} justify="between">
        <Field icon="rank" iconTone="primary" label={game.i18n.localize("ROBOTECH.Character.Level")}>
          <NumberInput
            value={system.level}
            onValueChange={(val) => handleFieldChange("system.level", val ?? 1)}
            min={1}
          />
        </Field>
        <Field icon="exp" iconTone="primary" label={game.i18n.localize("ROBOTECH.Character.Experience")}>
          <NumberInput
            value={system.experience}
            onValueChange={(val) => handleFieldChange("system.experience", val ?? 0)}
            min={0}
          />
        </Field>
        <Field icon="bp" iconTone="primary" label={game.i18n.localize("ROBOTECH.Character.BuildPoints")}>
          <NumberInput
            value={system.buildPoints}
            onValueChange={(val) => handleFieldChange("system.buildPoints", val ?? 0)}
            min={0}
          />
        </Field>
      </Stack>
    </Stack>
  );
}
