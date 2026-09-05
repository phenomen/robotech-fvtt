import type { JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";

export function ElementSheetFields({ item, handleFieldChange }: ItemFieldsProps<"element">): JSX.Element {
  const system = item.system;

  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.StartingRank")} grow>
        <Input
          width="full"
          value={system.rank}
          onChange={(e) => {
            handleFieldChange("system.rank", e.target.value);
          }}
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.ElementTalent")} grow>
        <Input
          width="full"
          value={system.talent}
          onChange={(e) => {
            handleFieldChange("system.talent", e.target.value);
          }}
          placeholder={game.i18n.localize("ROBOTECH.Item.ElementTalentPlaceholder")}
        />
      </Field>
    </Stack>
  );
}
