import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { TableCell } from "@/components/ui/Table";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import type { ItemOf, ItemType } from "@/models";
import { syncDestroyedSlots } from "@/models/items/hardwareSlots";
import { isItemOf } from "@/utils";
import { hardwareSlotsOf, setSlotDestroyed } from "@/utils/hardwareUtils";
import { weaponPropertyTags } from "@/utils/weaponUtils";

export type ListedItemType = Exclude<ItemType, "career" | "race">;
export type ListedItem = ItemOf<ListedItemType>;
export type UsableItem = ItemOf<"talent"> | ItemOf<"equipment_suite">;

export function SkillCells({ item, onRoll }: { item: ItemOf<"skill">; onRoll: () => void }): JSX.Element {
  return (
    <>
      <TableCell width="10" align="center">
        <Text variant="mono" color="primary" align="center">
          {item.system.value}
        </Text>
      </TableCell>
      <TableCell width="12">
        <Button size="small" variant="primary" onClick={onRoll} full>
          {game.i18n.localize("ROBOTECH.Buttons.Roll")}
        </Button>
      </TableCell>
    </>
  );
}

export function ElementCells({ item }: { item: ItemOf<"element"> }): JSX.Element {
  return (
    <TableCell width="grow">
      <Text variant="label" truncate>
        {item.system.talent}
      </Text>
    </TableCell>
  );
}

export function UsesCells({ item, onUse }: { item: UsableItem; onUse: () => void }): JSX.Element {
  return (
    <>
      <TableCell width="12">
        <Button size="small" variant="primary" onClick={onUse} full>
          {game.i18n.localize("ROBOTECH.Buttons.Use")}
        </Button>
      </TableCell>
      <TableCell width="10" align="center">
        {isItemOf(item, "equipment_suite") ? (
          <SuiteUsesValue item={item} />
        ) : (
          <NumberInput
            value={item.system.uses}
            min={0}
            onValueChange={(val) => {
              void item.update({ "system.uses": Math.max(0, val ?? 0) });
            }}
            width="small"
          />
        )}
      </TableCell>
    </>
  );
}

function SuiteUsesValue({ item }: { item: ItemOf<"equipment_suite"> }): JSX.Element {
  const { value, max } = item.system.uses;
  if (max === null) {
    return (
      <Text variant="label" color="muted" align="center">
        {game.i18n.localize("ROBOTECH.Item.Unlimited")}
      </Text>
    );
  }

  return (
    <Stack direction="row" gap={1} align="center" justify="center">
      <NumberInput
        value={value}
        min={0}
        max={max}
        onValueChange={(val) => {
          void item.update({ "system.uses.value": Math.max(0, val ?? 0) });
        }}
        width="small"
      />
      <Text variant="label" color="muted">
        /
      </Text>
      <Text variant="mono" color="muted" align="center">
        {max}
      </Text>
    </Stack>
  );
}

export function SuiteSkillCell({ item }: { item: ItemOf<"equipment_suite"> }): JSX.Element {
  return (
    <TableCell width="10" align="center">
      <Text variant="mono" color="primary" align="center">
        {item.system.skill}
      </Text>
    </TableCell>
  );
}

export function AmmoCell({
  item,
  onUpdateAmmo,
}: {
  item: ItemOf<"weapon">;
  onUpdateAmmo: (val: number | null) => void;
}): JSX.Element {
  const { active, value, current } = item.system.properties.ammunition;

  return (
    <TableCell width="20" align="center">
      {active ? (
        <Stack direction="row" gap={1} align="center" justify="center">
          <NumberInput value={current} min={0} max={value} onValueChange={onUpdateAmmo} width="small" />
          <Text variant="label" color="muted">
            /
          </Text>
          <Text variant="mono" color="muted" align="center">
            {value}
          </Text>
        </Stack>
      ) : null}
    </TableCell>
  );
}

export function WeaponTagsCell({ item }: { item: ItemOf<"weapon"> }): JSX.Element {
  const tags = weaponPropertyTags(item.system.properties);

  return (
    <TableCell width="grow">
      {tags.length > 0 ? (
        <Stack direction="row" gap={1} wrap>
          {tags.map((tag) => (
            <Tag key={tag.id} label={tag.label} color={tag.color} size="small" title={tag.title} />
          ))}
        </Stack>
      ) : null}
    </TableCell>
  );
}

export function HardwareSlotsCell({ item }: { item: ListedItem }): JSX.Element {
  const slots = hardwareSlotsOf(item);
  const destroyed = slots && slots.value > 0 ? syncDestroyedSlots(slots.value, slots.destroyed) : [];

  return (
    <TableCell width="auto" align="center">
      {destroyed.length > 0 ? (
        <Stack direction="row" gap={1} align="center" justify="center">
          {destroyed.map((isDestroyed, index) => (
            <Checkbox
              // Fixed-position hardware slot; index is the slot identity.
              // oxlint-disable-next-line react-doctor/no-array-index-as-key
              key={`hardware-slot-${index}`}
              checked={isDestroyed}
              onCheckedChange={(checked) => {
                void setSlotDestroyed(item, index, checked);
              }}
              variant="danger"
              title={game.i18n.localize("ROBOTECH.List.HardwareSlot", {
                current: index + 1,
                total: destroyed.length,
              })}
            />
          ))}
        </Stack>
      ) : null}
    </TableCell>
  );
}
