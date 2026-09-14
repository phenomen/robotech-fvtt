import type { JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function GearSheetFields({ item, handleFieldChange }: ItemFieldsProps<"gear">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field icon="rank" iconTone="primary" label={game.i18n.localize("ROBOTECH.Item.RequiredRank")}>
        <NumberInput
          controls
          min={0}
          value={system.requiredRank}
          onValueChange={(val) => {
            handleFieldChange("system.requiredRank", val ?? 1);
          }}
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Category")}>
        <Input
          width="full"
          value={system.category}
          onChange={(e) => {
            handleFieldChange("system.category", e.target.value);
          }}
        />
      </Field>
    </Stack>
  );
}
