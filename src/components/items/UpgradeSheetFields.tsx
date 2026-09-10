import type { JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";

export function UpgradeSheetFields({ item, handleFieldChange }: ItemFieldsProps<"upgrade">): JSX.Element {
  const system = item.system;

  return (
    <Field label={game.i18n.localize("ROBOTECH.Item.RequiredRank")}>
      <NumberInput
        controls
        min={0}
        value={system.requiredRank}
        onValueChange={(val) => {
          handleFieldChange("system.requiredRank", val ?? 1);
        }}
      />
    </Field>
  );
}
