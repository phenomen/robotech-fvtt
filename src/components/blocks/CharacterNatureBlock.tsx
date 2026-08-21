import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf, FieldValue } from "@/models";

interface CharacterNatureBlockProps {
  actor: ActorOf<"character">;
}

export function CharacterNatureBlock({ actor }: CharacterNatureBlockProps): JSX.Element {
  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Character.Nature")}</CardTitle>
      </CardHeader>
      <Stack direction="row" gap={3}>
        <Field label={game.i18n.localize("ROBOTECH.Character.Disposition")}>
          <Input
            width="full"
            value={system.nature.disposition}
            onChange={(e) => handleFieldChange("system.nature.disposition", e.target.value)}
          />
        </Field>
        <Field label={game.i18n.localize("ROBOTECH.Character.Demeanor")}>
          <Input
            width="full"
            value={system.nature.demeanor}
            onChange={(e) => handleFieldChange("system.nature.demeanor", e.target.value)}
          />
        </Field>
      </Stack>
    </Stack>
  );
}
