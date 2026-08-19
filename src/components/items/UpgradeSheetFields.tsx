import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";

export function UpgradeSheetFields({ item, handleFieldChange }: ItemFieldsProps<"upgrade">): JSX.Element {
  const system = item.system;

  return (
    <Field label={game.i18n.localize("ROBOTECH.Character.Rank")}>
      <NumberInput min={0} value={system.rank} onValueChange={(val) => handleFieldChange("system.rank", val ?? 1)} />
    </Field>
  );
}
