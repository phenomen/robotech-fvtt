import type { JSX } from "react";

import type { ItemFieldsProps } from "@/components/items/types";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { WEAPON_PROPERTIES } from "@/config/weaponProperties";
import type { WeaponPropertyDef } from "@/config/weaponProperties";
import type { FieldValue, WeaponProperties } from "@/models";
import { weaponPropertyTags } from "@/utils/weaponUtils";

interface PropertyRowProps {
  def: WeaponPropertyDef;
  properties: WeaponProperties;
  setProp: (path: string, val: FieldValue) => void;
}

function WeaponPropertyRow({ def, properties, setProp }: PropertyRowProps): JSX.Element {
  const value = properties[def.key],
    isActive = typeof value === "boolean" ? value : value.active,
    handleCheckboxChange = (checked: boolean) => {
      setProp(def.inputType === "none" ? def.key : `${def.key}.active`, checked);
    };

  return (
    <Stack direction="row" gap={4} align="center" justify="between" minHeight="input">
      <Checkbox checked={isActive} onCheckedChange={handleCheckboxChange} label={game.i18n.localize(def.nameKey)} />

      {isActive && def.inputType === "damage" && (
        <Stack direction="row" gap={1} align="center">
          <NumberInput
            min={1}
            value={properties[def.key].multiplier}
            onValueChange={(val) => {
              setProp(`${def.key}.multiplier`, val ?? 1);
            }}
            aria-label={game.i18n.localize("ROBOTECH.Item.Property.Damage.multiplier")}
          />
          <Select
            value={properties[def.key].type}
            onChange={(e) => {
              setProp(`${def.key}.type`, e.target.value);
            }}
            width="medium"
          >
            {def.selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {game.i18n.localize(opt.labelKey)}
              </option>
            ))}
          </Select>
        </Stack>
      )}

      {isActive && def.inputType === "select" && (
        <Select
          value={properties[def.key].value}
          onChange={(e) => {
            setProp(`${def.key}.value`, e.target.value);
          }}
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
          onValueChange={(val) => {
            setProp(`${def.key}.value`, val ?? 0);
          }}
        />
      )}

      {isActive && def.inputType === "hardware" && (
        <NumberInput
          min={0}
          value={properties[def.key].value}
          onValueChange={(val) => {
            setProp(`${def.key}.value`, val ?? 0);
          }}
        />
      )}
    </Stack>
  );
}

export function WeaponSheetFields({ item, handleFieldChange }: ItemFieldsProps<"weapon">): JSX.Element {
  const system = item.system,
    properties = system.properties,
    setProp = (path: string, val: FieldValue) => {
      handleFieldChange(`system.properties.${path}`, val);
    },
    midpoint = Math.ceil(WEAPON_PROPERTIES.length / 2),
    left = WEAPON_PROPERTIES.slice(0, midpoint),
    right = WEAPON_PROPERTIES.slice(midpoint);

  return (
    <Stack gap={4}>
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

      <Divider />

      <Card tone="background">
        <Stack direction="row" gap={2} wrap>
          {weaponPropertyTags(properties).map((tag) => (
            <Tag key={tag.id} label={tag.label} color={tag.color} size="small" title={tag.title} />
          ))}
        </Stack>
      </Card>

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
  );
}
