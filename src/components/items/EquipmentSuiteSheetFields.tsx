import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function EquipmentSuiteSheetFields({
  item,
  handleFieldChange,
}: ItemFieldsProps<"equipment_suite">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.Skill")}>
        <NumberInput
          min={1}
          value={system.skill}
          onValueChange={(val) => handleFieldChange("system.skill", val ?? 1)}
          width="full"
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Uses")}>
        <NumberInput
          min={0}
          value={system.uses.max}
          onValueChange={(val) => handleFieldChange("system.uses.max", val)}
          placeholder={game.i18n.localize("ROBOTECH.Item.Unlimited")}
          width="full"
        />
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
