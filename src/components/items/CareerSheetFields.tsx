import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";

export function CareerSheetFields({ item, handleFieldChange }: ItemFieldsProps<"career">): JSX.Element {
  const system = item.system;

  return (
    <Stack gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Item.Element")}>
        <Input
          width="full"
          value={system.element}
          onChange={(e) => handleFieldChange("system.element", e.target.value)}
          placeholder={game.i18n.localize("ROBOTECH.Item.ElementPlaceholder")}
        />
      </Field>
      <Field label={game.i18n.localize("ROBOTECH.Item.Talent")}>
        <Input
          width="full"
          value={system.talent}
          onChange={(e) => handleFieldChange("system.talent", e.target.value)}
          placeholder={game.i18n.localize("ROBOTECH.Item.TalentPlaceholder")}
        />
      </Field>
      <Stack direction="row" gap={3}>
        <Field label={game.i18n.localize("ROBOTECH.Character.Rank")}>
          <NumberInput
            controls
            min={0}
            value={system.rank}
            onValueChange={(val) => handleFieldChange("system.rank", val ?? 1)}
          />
        </Field>
        <Field label={game.i18n.localize("ROBOTECH.Item.RankTitle")}>
          <Input
            width="full"
            value={system.rankTitle}
            onChange={(e) => handleFieldChange("system.rankTitle", e.target.value)}
            placeholder={game.i18n.localize("ROBOTECH.Item.RankTitlePlaceholder")}
          />
        </Field>
      </Stack>
      <Stack direction="row" gap={3}>
        <Field label={game.i18n.localize("ROBOTECH.Character.Fame")}>
          <NumberInput
            controls
            min={0}
            value={system.fame}
            onValueChange={(val) => handleFieldChange("system.fame", val ?? 0)}
          />
        </Field>
        <Field label={game.i18n.localize("ROBOTECH.Item.FameTitle")}>
          <Input
            width="full"
            value={system.fameTitle}
            onChange={(e) => handleFieldChange("system.fameTitle", e.target.value)}
            placeholder={game.i18n.localize("ROBOTECH.Item.FameTitlePlaceholder")}
          />
        </Field>
      </Stack>
      <Field label={game.i18n.localize("ROBOTECH.Item.Equipment")}>
        <Input
          width="full"
          value={system.equipment}
          onChange={(e) => handleFieldChange("system.equipment", e.target.value)}
          placeholder={game.i18n.localize("ROBOTECH.Item.EquipmentPlaceholder")}
        />
      </Field>
    </Stack>
  );
}
