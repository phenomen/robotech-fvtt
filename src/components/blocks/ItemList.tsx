import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";
import { type JSX, type ReactNode } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import type { ItemOf, ItemType } from "@/models";
import { syncDestroyedSlots } from "@/models/items/hardwareSlots";
import { filterItemsOf, isItemOf, sendToChat } from "@/utils";
import { hardwareSlotsOf, isFullyDestroyed, setSlotDestroyed } from "@/utils/hardwareUtils";
import { weaponPropertyTags } from "@/utils/weaponUtils";

export type ListedItemType = Exclude<ItemType, "career" | "race">;

type ListedItem = ItemOf<ListedItemType>;
type UsableItem = ItemOf<"talent"> | ItemOf<"equipment_suite">;

const HARDWARE_SLOT_TYPES: ListedItemType[] = ["weapon", "feature", "equipment_suite"];
const USABLE_TYPES: ListedItemType[] = ["talent", "equipment_suite"];

function isUsable(itemType: ListedItemType): boolean {
  return USABLE_TYPES.includes(itemType);
}

function hasHardwareColumn(itemType: ListedItemType): boolean {
  return HARDWARE_SLOT_TYPES.includes(itemType);
}

function isSuite(itemType: ListedItemType): boolean {
  return itemType === "equipment_suite";
}

function isWeapon(itemType: ListedItemType): boolean {
  return itemType === "weapon";
}

function SkillCells({ item, onRoll }: { item: ItemOf<"skill">; onRoll: () => void }): JSX.Element {
  return (
    <>
      <TableCell width="stat" align="center">
        <Text variant="stat" color="primary" align="center">
          {item.system.value}
        </Text>
      </TableCell>
      <TableCell width="action">
        <Button size="small" variant="primary" onClick={onRoll} full>
          {game.i18n.localize("ROBOTECH.Buttons.Roll")}
        </Button>
      </TableCell>
    </>
  );
}

function UsesCells({ item, onUse }: { item: UsableItem; onUse: () => void }): JSX.Element {
  return (
    <>
      <TableCell width="action">
        <Button size="small" variant="primary" onClick={onUse} full>
          {game.i18n.localize("ROBOTECH.Buttons.Use")}
        </Button>
      </TableCell>
      <TableCell width="stat" align="center">
        {isItemOf(item, "equipment_suite") ? (
          <SuiteUsesValue item={item} />
        ) : (
          <NumberInput
            value={item.system.uses}
            min={0}
            onValueChange={(val) => void item.update({ "system.uses": Math.max(0, val ?? 0) })}
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
      <Text variant="caption" color="muted" align="center">
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
        onValueChange={(val) => void item.update({ "system.uses.value": Math.max(0, val ?? 0) })}
        width="small"
      />
      <Text variant="caption" color="muted">
        /
      </Text>
      <Text variant="stat" color="muted" align="center">
        {max}
      </Text>
    </Stack>
  );
}

function SuiteSkillCell({ item }: { item: ItemOf<"equipment_suite"> }): JSX.Element {
  return (
    <TableCell width="stat" align="center">
      <Text variant="stat" color="primary" align="center">
        {item.system.skill}
      </Text>
    </TableCell>
  );
}

function AmmoCell({
  item,
  onUpdateAmmo,
}: {
  item: ItemOf<"weapon">;
  onUpdateAmmo: (val: number | null) => void;
}): JSX.Element {
  const { active, value, current } = item.system.properties.ammunition;

  return (
    <TableCell width="ammo" align="center">
      {active ? (
        <Stack direction="row" gap={1} align="center" justify="center">
          <NumberInput value={current} min={0} max={value} onValueChange={onUpdateAmmo} width="small" />
          <Text variant="caption" color="muted">
            /
          </Text>
          <Text variant="stat" color="muted" align="center">
            {value}
          </Text>
        </Stack>
      ) : null}
    </TableCell>
  );
}

function WeaponTags({ item }: { item: ItemOf<"weapon"> }): JSX.Element | null {
  const tags = weaponPropertyTags(item.system.properties);
  if (tags.length === 0) return null;

  return (
    <Stack direction="row" gap={1} wrap>
      {tags.map((tag) => (
        <Tag key={tag.id} label={tag.label} color={tag.color} size="small" title={tag.title} />
      ))}
    </Stack>
  );
}

function HardwareSlotsCell({ item }: { item: ListedItem }): JSX.Element {
  const slots = hardwareSlotsOf(item);
  const destroyed = slots && slots.value > 0 ? syncDestroyedSlots(slots.value, slots.destroyed) : [];

  return (
    <TableCell width="hug" align="center">
      {destroyed.length > 0 ? (
        <Stack direction="row" gap={1} align="center" justify="center">
          {destroyed.map((isDestroyed, index) => (
            <Checkbox
              key={index}
              checked={isDestroyed}
              onCheckedChange={(checked) => void setSlotDestroyed(item, index, checked)}
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

function skillDetailsOf(item: ItemOf<"skill">): string {
  return [item.system.benefit, item.system.cost].filter(Boolean).join(" / ");
}

function isUsableItem(item: ListedItem): item is UsableItem {
  return isItemOf(item, "talent") || isItemOf(item, "equipment_suite");
}

function openItemSheet(item: Item): void {
  void item.sheet?.render(true);
}

async function useItem(actor: Actor, item: UsableItem): Promise<void> {
  await sendToChat({
    actor,
    title: item.name,
    description: item.system.description,
    relativeTo: item,
  });
  await spendUse(item);
}

async function spendUse(item: UsableItem): Promise<void> {
  if (isItemOf(item, "equipment_suite")) {
    const { value, max } = item.system.uses;
    if (max !== null && value > 0) {
      await item.update({ "system.uses.value": value - 1 });
    }
    return;
  }

  if (item.system.uses > 0) {
    await item.update({ "system.uses": item.system.uses - 1 });
  }
}

function NameHeader(): JSX.Element {
  return (
    <TableCell width="grow">
      <Text variant="caption" color="muted">
        {game.i18n.localize("ROBOTECH.List.HeaderName")}
      </Text>
    </TableCell>
  );
}

function ControlsHeader(): JSX.Element {
  return <TableCell width="controls" />;
}

function ColumnHeaders({ itemType }: { itemType: ListedItemType }): JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        <NameHeader />
        {hasHardwareColumn(itemType) && (
          <TableCell width="hug" align="center">
            <Text variant="caption" color="muted" align="center">
              {game.i18n.localize("ROBOTECH.List.HeaderHardware")}
            </Text>
          </TableCell>
        )}
        {itemType === "skill" && (
          <>
            <TableCell width="stat" align="center">
              <Text variant="caption" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderValue")}
              </Text>
            </TableCell>
            <TableCell width="action" align="center">
              <Text variant="caption" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderAction")}
              </Text>
            </TableCell>
          </>
        )}
        {isUsable(itemType) && (
          <>
            <TableCell width="action" align="center">
              <Text variant="caption" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderAction")}
              </Text>
            </TableCell>
            <TableCell width="stat" align="center">
              <Text variant="caption" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderUses")}
              </Text>
            </TableCell>
          </>
        )}
        {isWeapon(itemType) && (
          <TableCell width="ammo" align="center">
            <Text variant="caption" color="muted" align="center">
              {game.i18n.localize("ROBOTECH.List.HeaderAmmo")}
            </Text>
          </TableCell>
        )}
        {isSuite(itemType) && (
          <TableCell width="stat" align="center">
            <Text variant="caption" color="muted" align="center">
              {game.i18n.localize("ROBOTECH.List.HeaderSkill")}
            </Text>
          </TableCell>
        )}
        <ControlsHeader />
      </TableRow>
    </TableHeader>
  );
}

interface ItemListItemProps {
  actor: Actor;
  item: ListedItem;
  onOpenRoll?: (skill: ItemOf<"skill">) => void;
}

function ItemListItem({ actor, item, onOpenRoll }: ItemListItemProps): JSX.Element {
  const itemType = item.type;
  const isDestroyed = isFullyDestroyed(item);

  const rollSkill = (skill: ItemOf<"skill">) => {
    if (onOpenRoll) onOpenRoll(skill);
    else void openActionCenter(actor, { skill1Id: skill.id ?? undefined });
  };

  return (
    <TableRow tone={isDestroyed ? "danger" : "default"}>
      <TableCell width="grow">
        <Stack direction="row" gap={2} align="center">
          <Text variant="label" color={isDestroyed ? "danger" : "foreground"} truncate title={item.name}>
            {item.name}
          </Text>
          {isItemOf(item, "skill") && skillDetailsOf(item) && (
            <Text variant="caption" color="muted" truncate>
              [ {skillDetailsOf(item)} ]
            </Text>
          )}
          {isItemOf(item, "weapon") && <WeaponTags item={item} />}
        </Stack>
      </TableCell>

      {hasHardwareColumn(itemType) && <HardwareSlotsCell item={item} />}

      {isItemOf(item, "skill") && <SkillCells item={item} onRoll={() => rollSkill(item)} />}

      {isUsableItem(item) && <UsesCells item={item} onUse={() => void useItem(actor, item)} />}

      {isItemOf(item, "equipment_suite") && <SuiteSkillCell item={item} />}

      {isItemOf(item, "weapon") && (
        <AmmoCell
          item={item}
          onUpdateAmmo={(val) => void item.update({ "system.properties.ammunition.current": Math.max(0, val ?? 0) })}
        />
      )}

      <TableCell width="controls" align="end">
        <Stack direction="row" gap={1} align="center" justify="end">
          <Button
            size="icon"
            variant="outline"
            onClick={() => openItemSheet(item)}
            title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
          >
            <Icon name="edit" />
          </Button>
          <Button
            size="icon"
            variant="danger"
            title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
            onClick={() => void item.delete()}
          >
            <Icon name="x" />
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

interface ItemListProps {
  actor: Actor;
  itemType: ListedItemType;
  title: string;
  onOpenRoll?: (skill: ItemOf<"skill">) => void;
  emptyLabel?: string;
  headerActions?: ReactNode;
}

export function ItemList({
  actor,
  itemType,
  title,
  onOpenRoll,
  emptyLabel,
  headerActions,
}: ItemListProps): JSX.Element {
  const items = filterItemsOf(actor, itemType);

  const createItem = async () => {
    const typeLabel = game.i18n.localize(`TYPES.Item.${itemType}`);
    await actor.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("ROBOTECH.List.NewItem", { type: typeLabel }),
        type: itemType,
      },
    ]);
  };

  return (
    <Stack gap={2}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Stack direction="row" gap={1} align="center">
          {headerActions}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => void createItem()}
            title={game.i18n.localize("ROBOTECH.Buttons.Add")}
          >
            <Icon name="add" size="small" />
          </Button>
        </Stack>
      </CardHeader>

      {items.length === 0 ? (
        <Callout>{emptyLabel ?? game.i18n.localize("ROBOTECH.List.Empty")}</Callout>
      ) : (
        <Table>
          <ColumnHeaders itemType={itemType} />
          <TableBody>
            {items.map((item) => (
              <ItemListItem key={item.id} actor={actor} item={item} onOpenRoll={onOpenRoll} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
