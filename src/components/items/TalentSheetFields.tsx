import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { TALENT_CATEGORY_OPTIONS } from "@/config/choices";

export function TalentSheetFields({ item, handleFieldChange }: ItemFieldsProps<"talent">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.Category")}>
        <Select
          width="full"
          value={system.category}
          onChange={(e) => handleFieldChange("system.category", e.target.value)}
        >
          {TALENT_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Prerequisites")} grow>
        <Input
          width="full"
          value={system.prerequisite}
          onChange={(e) => handleFieldChange("system.prerequisite", e.target.value)}
          placeholder={game.i18n.localize("ROBOTECH.Item.PrerequisitePlaceholder")}
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Uses")}>
        <NumberInput min={0} value={system.uses} onValueChange={(val) => handleFieldChange("system.uses", val ?? 1)} />
      </Field>
    </Stack>
  );
}
