import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function RaceSheetFields({ item, handleFieldChange }: ItemFieldsProps<"race">): JSX.Element {
  const system = item.system;

  return (
    <Field label={game.i18n.localize("ROBOTECH.Race.Form")}>
      <Input
        width="full"
        value={system.form}
        onChange={(e) => handleFieldChange("system.form", e.target.value)}
        placeholder={game.i18n.localize("ROBOTECH.Race.FormPlaceholder")}
      />
    </Field>
  );
}
