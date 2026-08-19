import { type JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { WEAPON_PROPERTIES, type WeaponPropertyDef } from "@/config/weaponProperties";
import type { FieldValue, WeaponProperties } from "@/models";
import { weaponPropertyTags } from "@/utils/weaponUtils";

interface PropertyRowProps {
  def: WeaponPropertyDef;
  properties: WeaponProperties;
  setProp: (path: string, val: FieldValue) => void;
}

function WeaponPropertyRow({ def, properties, setProp }: PropertyRowProps): JSX.Element {
  const value = properties[def.key];
  const isActive = typeof value === "boolean" ? value : value.active;

  const handleCheckboxChange = (checked: boolean) => {
    setProp(def.inputType === "none" ? def.key : `${def.key}.active`, checked);
  };

  return (
    <Stack direction="row" gap={4} align="center" justify="between">
      <Checkbox checked={isActive} onCheckedChange={handleCheckboxChange} label={game.i18n.localize(def.nameKey)} />

      {isActive && def.inputType === "damage" && (
        <Select
          value={properties[def.key].type}
          onChange={(e) => setProp(`${def.key}.type`, e.target.value)}
          width="medium"
        >
          {def.selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {game.i18n.localize(opt.labelKey)}
            </option>
          ))}
        </Select>
      )}

      {isActive && def.inputType === "select" && (
        <Select
          value={properties[def.key].value}
          onChange={(e) => setProp(`${def.key}.value`, e.target.value)}
          width="medium"
        >
          {def.selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {game.i18n.localize(opt.labelKey)}
            </option>
          ))}
        </Select>
      )}

      {isActive && def.inputType === "number" && (
        <NumberInput
          min={0}
          value={properties[def.key].value}
          onValueChange={(val) => setProp(`${def.key}.value`, val ?? 0)}
        />
      )}

      {isActive && def.inputType === "hardware" && (
        <NumberInput
          min={0}
          value={properties[def.key].value}
          onValueChange={(val) => setProp(`${def.key}.value`, val ?? 0)}
        />
      )}

      {isActive && def.inputType === "multiplier" && (
        <Stack direction="row" gap={1} align="center">
          <NumberInput
            min={2}
            max={5}
            value={properties[def.key].value}
            onValueChange={(val) => setProp(`${def.key}.value`, val ?? 2)}
            width="small"
          />
          <Select
            value={properties[def.key].targetType}
            onChange={(e) => setProp(`${def.key}.targetType`, e.target.value)}
          >
            {def.selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {game.i18n.localize(opt.labelKey)}
              </option>
            ))}
          </Select>
        </Stack>
      )}
    </Stack>
  );
}

export function WeaponSheetFields({ item, handleFieldChange }: ItemFieldsProps<"weapon">): JSX.Element {
  const properties = item.system.properties;

  const setProp = (path: string, val: FieldValue) => {
    handleFieldChange(`system.properties.${path}`, val);
  };

  const midpoint = Math.ceil(WEAPON_PROPERTIES.length / 2);
  const left = WEAPON_PROPERTIES.slice(0, midpoint);
  const right = WEAPON_PROPERTIES.slice(midpoint);

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} wrap>
        {weaponPropertyTags(properties).map((tag) => (
          <Tag key={tag.id} label={tag.label} color={tag.color} size="small" title={tag.title} />
        ))}
      </Stack>

      <Stack gap={3}>
        <CardHeader>
          <CardTitle>{game.i18n.localize("ROBOTECH.Item.Properties")}</CardTitle>
        </CardHeader>

        <Stack direction="row" gap={4}>
          <Stack gap={1} grow>
            {left.map((def) => (
              <WeaponPropertyRow key={def.key} def={def} properties={properties} setProp={setProp} />
            ))}
          </Stack>
          <Stack gap={1} grow>
            {right.map((def) => (
              <WeaponPropertyRow key={def.key} def={def} properties={properties} setProp={setProp} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
