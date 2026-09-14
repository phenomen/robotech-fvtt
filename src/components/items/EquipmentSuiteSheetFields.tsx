import type { JSX } from "react";

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
      <Field icon="skill" iconTone="teal" label={game.i18n.localize("ROBOTECH.Item.Skill")}>
        <NumberInput
          controls
          width="small"
          min={1}
          value={system.skill}
          onValueChange={(val) => {
            handleFieldChange("system.skill", val ?? 1);
          }}
        />
      </Field>
      <Field icon="stack" label={game.i18n.localize("ROBOTECH.Item.Uses")}>
        <NumberInput
          controls
          width="small"
          min={0}
          value={system.uses.max}
          onValueChange={(val) => {
            handleFieldChange("system.uses.max", val);
          }}
          placeholder={game.i18n.localize("ROBOTECH.Item.Unlimited")}
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
