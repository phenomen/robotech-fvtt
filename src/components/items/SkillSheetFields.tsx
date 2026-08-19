import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function SkillSheetFields({ item, handleFieldChange }: ItemFieldsProps<"skill">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.Value")}>
        <NumberInput
          min={1}
          max={5}
          value={system.value}
          onValueChange={(val) => handleFieldChange("system.value", val ?? 1)}
          width="full"
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Benefit")}>
        <Input
          width="full"
          value={system.benefit}
          onChange={(e) => handleFieldChange("system.benefit", e.target.value)}
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Cost")}>
        <Input width="full" value={system.cost} onChange={(e) => handleFieldChange("system.cost", e.target.value)} />
      </Field>
    </Stack>
  );
}
