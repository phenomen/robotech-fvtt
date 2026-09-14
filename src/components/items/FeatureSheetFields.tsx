import type { JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function FeatureSheetFields({ item, handleFieldChange }: ItemFieldsProps<"feature">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={4} justify="center">
      <Field icon="rank" iconTone="primary" label={game.i18n.localize("ROBOTECH.Item.RequiredRank")}>
        <NumberInput
          controls
          width="small"
          min={0}
          value={system.requiredRank}
          onValueChange={(val) => {
            handleFieldChange("system.requiredRank", val ?? 1);
          }}
        />
      </Field>
      <Field icon="hardware-point" iconTone="amber" label={game.i18n.localize("ROBOTECH.Item.HardwarePoints")}>
        <NumberInput
          controls
          width="small"
          min={0}
          value={system.hardware.value}
          onValueChange={(val) => {
            handleFieldChange("system.hardware.value", val ?? 0);
          }}
        />
      </Field>
    </Stack>
  );
}
