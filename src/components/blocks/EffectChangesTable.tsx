import type ActiveEffect from "@client/documents/active-effect.mjs";
import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import { EFFECT_ATTRIBUTE_GROUPS, EFFECT_CHANGE_TYPE_OPTIONS, type EffectChangeType } from "@/config/effects";
import type { EffectChange } from "@/models";
import { addChange, patchChange, removeChange } from "@/utils";

const PREMADE_KEYS = new Set<string>(
  EFFECT_ATTRIBUTE_GROUPS.flatMap((group) => group.options.map((option) => option.value)),
);

function isChangeType(value: string): value is EffectChangeType {
  return EFFECT_CHANGE_TYPE_OPTIONS.some((option) => option.value === value);
}

interface EffectChangesTableProps {
  effect: ActiveEffect;
}

export function EffectChangesTable({ effect }: EffectChangesTableProps): JSX.Element {
  const changes = effect.system.changes;

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Effect.Modifiers")}</CardTitle>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => void addChange(effect)}
          title={game.i18n.localize("ROBOTECH.Effect.AddModifier")}
        >
          <Icon name="add" size="small" />
        </Button>
      </CardHeader>

      {changes.length === 0 ? (
        <Callout>{game.i18n.localize("ROBOTECH.Effect.NoModifiers")}</Callout>
      ) : (
        <Table>
          <ChangeHeaders />
          <TableBody>
            {/* Foundry stores changes as a plain array, so the row index is the only available key. */}
            {changes.map((change, index) => (
              <ChangeRow key={index} effect={effect} change={change} index={index} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function ChangeHeaders(): JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        <TableCell width="auto">
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.Effect.Attribute.Header")}
          </Text>
        </TableCell>
        <TableCell width="grow">
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.Effect.Key")}
          </Text>
        </TableCell>
        <TableCell width="auto">
          <Text variant="label" color="muted">
            {game.i18n.localize("ROBOTECH.Effect.Type")}
          </Text>
        </TableCell>
        <TableCell width="20" align="center">
          <Text variant="label" color="muted" align="center">
            {game.i18n.localize("ROBOTECH.Effect.Value")}
          </Text>
        </TableCell>
        <TableCell width="16" align="end" />
      </TableRow>
    </TableHeader>
  );
}

interface ChangeRowProps {
  effect: ActiveEffect;
  change: EffectChange;
  index: number;
}

function ChangeRow({ effect, change, index }: ChangeRowProps): JSX.Element {
  const attributeId = `${effect.id}-attribute-${index}`;
  const keyId = `${effect.id}-key-${index}`;
  const typeId = `${effect.id}-type-${index}`;
  const valueId = `${effect.id}-value-${index}`;
  const selectedAttribute = PREMADE_KEYS.has(change.key) ? change.key : "";

  return (
    <TableRow>
      <TableCell width="auto">
        <Select
          id={attributeId}
          value={selectedAttribute}
          width="medium"
          aria-label={game.i18n.localize("ROBOTECH.Effect.Attribute.Header")}
          onChange={(event) => void patchChange(effect, index, { key: event.target.value })}
        >
          <option value="">{game.i18n.localize("ROBOTECH.Effect.Attribute.Custom")}</option>
          {EFFECT_ATTRIBUTE_GROUPS.map((group) => (
            <optgroup key={group.labelKey} label={game.i18n.localize(group.labelKey)}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {game.i18n.localize(option.labelKey)}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </TableCell>

      <TableCell width="grow">
        <Input
          id={keyId}
          value={change.key}
          width="full"
          aria-label={game.i18n.localize("ROBOTECH.Effect.Key")}
          placeholder={game.i18n.localize("ROBOTECH.Effect.KeyPlaceholder")}
          onChange={(event) => void patchChange(effect, index, { key: event.target.value })}
        />
      </TableCell>

      <TableCell width="auto">
        <Select
          id={typeId}
          value={change.type}
          width="medium"
          aria-label={game.i18n.localize("ROBOTECH.Effect.Type")}
          onChange={(event) => {
            if (!isChangeType(event.target.value)) return;
            void patchChange(effect, index, { type: event.target.value });
          }}
        >
          {EFFECT_CHANGE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </TableCell>

      <TableCell width="20" align="center">
        <Input
          id={valueId}
          value={change.value}
          width="full"
          aria-label={game.i18n.localize("ROBOTECH.Effect.Value")}
          onChange={(event) => void patchChange(effect, index, { value: event.target.value })}
        />
      </TableCell>

      <TableCell width="16" align="end">
        <Button
          size="icon"
          variant="danger"
          title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
          onClick={() => void removeChange(effect, index)}
        >
          <Icon name="x" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
