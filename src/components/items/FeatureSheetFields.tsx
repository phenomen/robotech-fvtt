import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function FeatureSheetFields({ item, handleFieldChange }: ItemFieldsProps<"feature">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.Bonus")}>
        <Input value={system.bonus} onChange={(e) => handleFieldChange("system.bonus", e.target.value)} width="full" />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.HardwarePoints")}>
        <NumberInput
          min={0}
          value={system.hardware.value}
          onValueChange={(val) => handleFieldChange("system.hardware.value", val ?? 0)}
          width="full"
        />
      </Field>
    </Stack>
  );
}
