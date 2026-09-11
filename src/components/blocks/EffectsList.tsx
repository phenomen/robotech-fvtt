import type ActiveEffect from "@client/documents/active-effect.mjs";
import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";
import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import { actorEffects, createEffect, effectSource, isOwnEffect } from "@/utils";

interface EffectsListProps {
  parent: Actor | Item;
}

export function EffectsList({ parent }: EffectsListProps): JSX.Element {
  const isActor = parent instanceof foundry.documents.Actor;
  const effects = isActor ? actorEffects(parent) : [...parent.effects];

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Effects")}</CardTitle>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => {
            void createEffect(parent);
          }}
          title={game.i18n.localize("ROBOTECH.Effect.Add")}
        >
          <Icon name="add" size="small" />
        </Button>
      </CardHeader>

      {effects.length === 0 ? (
        <Callout>{game.i18n.localize("ROBOTECH.Effect.Empty")}</Callout>
      ) : (
        <Table>
          <TableHeader hidden={!isActor}>
            <TableRow>
              <TableCell width="grow">
                <Text variant="label" color="muted">
                  {game.i18n.localize("ROBOTECH.Effect.Name")}
                </Text>
              </TableCell>
              {isActor ? (
                <TableCell width="auto">
                  <Text variant="label" color="muted">
                    {game.i18n.localize("ROBOTECH.Effect.Source")}
                  </Text>
                </TableCell>
              ) : null}
              {isActor ? (
                <TableCell width="12" align="center">
                  <Text variant="label" color="muted" align="center">
                    {game.i18n.localize("ROBOTECH.Effect.Enabled")}
                  </Text>
                </TableCell>
              ) : null}
              <TableCell width="16" align="end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {effects.map((effect) => (
              <EffectRow key={effect.id} effect={effect} showSource={isActor} showEnabled={isActor} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function EffectRow({
  effect,
  showSource,
  showEnabled,
}: {
  effect: ActiveEffect;
  showSource: boolean;
  showEnabled: boolean;
}): JSX.Element {
  const own = isOwnEffect(effect);
  const canDelete = showSource ? own : true;

  return (
    <TableRow>
      <TableCell width="grow">
        <Button
          variant="ghost"
          onClick={() => void effect.sheet?.render(true)}
          title={game.i18n.localize("ROBOTECH.Effect.OpenSheet")}
        >
          <Text variant="label" truncate>
            {effect.name}
          </Text>
        </Button>
      </TableCell>
      {showSource ? (
        <TableCell width="auto">
          <Text variant="label" color="muted" truncate>
            {effectSource(effect)}
          </Text>
        </TableCell>
      ) : null}
      {showEnabled ? (
        <TableCell width="12" align="center">
          <Checkbox
            id={`${effect.id}-enabled`}
            checked={!effect.disabled}
            title={game.i18n.localize("ROBOTECH.Effect.Enabled")}
            onCheckedChange={(checked) => {
              void effect.update({ disabled: !checked });
            }}
          />
        </TableCell>
      ) : null}
      <TableCell width="16" align="end">
        {canDelete ? (
          <Button
            size="icon"
            variant="danger"
            onClick={() => void effect.delete()}
            title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
          >
            <Icon name="x" />
          </Button>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
