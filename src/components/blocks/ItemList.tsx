import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";
import type { JSX, ReactNode } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import {
  AmmoCell,
  ElementCells,
  HardwareSlotsCell,
  SkillCells,
  SuiteSkillCell,
  UsesCells,
  WeaponTagsCell,
} from "@/components/blocks/ItemListCells";
import type { ListedItem, ListedItemType, UsableItem } from "@/components/blocks/ItemListCells";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import type { ItemOf } from "@/models";
import { filterItemsOf, isItemOf, itemCardOf, sendToChat } from "@/utils";
import { isFullyDestroyed } from "@/utils/hardwareUtils";

export type { ListedItemType } from "@/components/blocks/ItemListCells";

const HARDWARE_SLOT_TYPES = new Set<ListedItemType>(["weapon", "feature", "equipment_suite"]);
const USABLE_TYPES = new Set<ListedItemType>(["talent", "equipment_suite"]);

function isUsable(itemType: ListedItemType): boolean {
  return USABLE_TYPES.has(itemType);
}

function hasHardwareColumn(itemType: ListedItemType): boolean {
  return HARDWARE_SLOT_TYPES.has(itemType);
}

function isSuite(itemType: ListedItemType): boolean {
  return itemType === "equipment_suite";
}

function isWeapon(itemType: ListedItemType): boolean {
  return itemType === "weapon";
}

function isElement(itemType: ListedItemType): boolean {
  return itemType === "element";
}

function nameCellWidth(itemType: ListedItemType): "32" | "grow" {
  return isWeapon(itemType) || isElement(itemType) ? "32" : "grow";
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

function postItemToChat(item: Item): void {
  void sendToChat(itemCardOf(item));
}

async function spendItemUse(item: UsableItem): Promise<void> {
  await sendToChat(itemCardOf(item));
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

function NameHeader({ itemType }: { itemType: ListedItemType }): JSX.Element {
  return (
    <TableCell width={nameCellWidth(itemType)}>
      <Text variant="label" color="muted">
        {game.i18n.localize("ROBOTECH.List.HeaderName")}
      </Text>
    </TableCell>
  );
}

function ControlsHeader(): JSX.Element {
  return <TableCell width="auto" />;
}

function ColumnHeaders({ itemType }: { itemType: ListedItemType }): JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        <NameHeader itemType={itemType} />
        {isWeapon(itemType) && (
          <TableCell width="grow">
            <Text variant="label" color="muted">
              {game.i18n.localize("ROBOTECH.List.HeaderTags")}
            </Text>
          </TableCell>
        )}
        {hasHardwareColumn(itemType) && (
          <TableCell width="auto" align="center">
            <Text variant="label" color="muted" align="center">
              {game.i18n.localize("ROBOTECH.List.HeaderHardware")}
            </Text>
          </TableCell>
        )}
        {itemType === "skill" && (
          <>
            <TableCell width="10" align="center">
              <Text variant="label" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderValue")}
              </Text>
            </TableCell>
            <TableCell width="12" align="center">
              <Text variant="label" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderAction")}
              </Text>
            </TableCell>
          </>
        )}
        {isElement(itemType) && (
          <TableCell width="grow">
            <Text variant="label" color="muted">
              {game.i18n.localize("ROBOTECH.Item.ElementTalent")}
            </Text>
          </TableCell>
        )}
        {isUsable(itemType) && (
          <>
            <TableCell width="12" align="center">
              <Text variant="label" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderAction")}
              </Text>
            </TableCell>
            <TableCell width="10" align="center">
              <Text variant="label" color="muted" align="center">
                {game.i18n.localize("ROBOTECH.List.HeaderUses")}
              </Text>
            </TableCell>
          </>
        )}
        {isWeapon(itemType) && (
          <TableCell width="20" align="center">
            <Text variant="label" color="muted" align="center">
              {game.i18n.localize("ROBOTECH.List.HeaderAmmo")}
            </Text>
          </TableCell>
        )}
        {isSuite(itemType) && (
          <TableCell width="10" align="center">
            <Text variant="label" color="muted" align="center">
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
    if (onOpenRoll) {
      onOpenRoll(skill);
    } else {
      void openActionCenter(actor, { skill1Id: skill.id ?? undefined });
    }
  };

  return (
    <TableRow tone={isDestroyed ? "danger" : "default"}>
      <TableCell width={nameCellWidth(itemType)}>
        <Stack direction="row" gap={2} align="center">
          <Text variant="label" color={isDestroyed ? "danger" : "foreground"} truncate title={item.name}>
            {item.name}
          </Text>
          {isItemOf(item, "skill") && skillDetailsOf(item) && (
            <Text variant="label" color="muted" truncate>
              [ {skillDetailsOf(item)} ]
            </Text>
          )}
        </Stack>
      </TableCell>

      {isItemOf(item, "weapon") && <WeaponTagsCell item={item} />}

      {hasHardwareColumn(itemType) && <HardwareSlotsCell item={item} />}

      {isItemOf(item, "skill") && (
        <SkillCells
          item={item}
          onRoll={() => {
            rollSkill(item);
          }}
        />
      )}

      {isItemOf(item, "element") && <ElementCells item={item} />}

      {isUsableItem(item) && <UsesCells item={item} onUse={() => void spendItemUse(item)} />}

      {isItemOf(item, "equipment_suite") && <SuiteSkillCell item={item} />}

      {isItemOf(item, "weapon") && (
        <AmmoCell
          item={item}
          onUpdateAmmo={(val) => {
            void item.update({ "system.properties.ammunition.current": Math.max(0, val ?? 0) });
          }}
        />
      )}

      <TableCell width="auto" align="end">
        <Stack direction="row" gap={1} align="center" justify="end">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              postItemToChat(item);
            }}
            title={game.i18n.localize("ROBOTECH.Buttons.SendToChat")}
          >
            <Icon name="message" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              openItemSheet(item);
            }}
            title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
          >
            <Icon name="edit" />
          </Button>
          <Button
            size="icon"
            variant="danger"
            title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
            onClick={() => {
              void item.delete();
            }}
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
    <Stack gap={1}>
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
