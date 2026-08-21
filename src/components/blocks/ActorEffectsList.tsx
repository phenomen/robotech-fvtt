import type ActiveEffect from "@client/documents/active-effect.mjs";
import type Actor from "@client/documents/actor.mjs";
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

interface ActorEffectsListProps {
  actor: Actor;
}

export function ActorEffectsList({ actor }: ActorEffectsListProps): JSX.Element {
  const effects = actorEffects(actor);

  return (
    <Stack gap={2}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Effects")}</CardTitle>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => void createEffect(actor)}
          title={game.i18n.localize("ROBOTECH.Effect.Add")}
        >
          <Icon name="add" size="small" />
        </Button>
      </CardHeader>

      {effects.length === 0 ? (
        <Callout>{game.i18n.localize("ROBOTECH.Effect.Empty")}</Callout>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell width="grow">
                <Text variant="label" color="muted">
                  {game.i18n.localize("ROBOTECH.Effect.Name")}
                </Text>
              </TableCell>
              <TableCell width="hug">
                <Text variant="label" color="muted">
                  {game.i18n.localize("ROBOTECH.Effect.Source")}
                </Text>
              </TableCell>
              <TableCell width="action" align="center">
                <Text variant="label" color="muted" align="center">
                  {game.i18n.localize("ROBOTECH.Effect.Disabled")}
                </Text>
              </TableCell>
              <TableCell width="controls" align="end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {effects.map((effect) => (
              <ActorEffectRow key={effect.id} effect={effect} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function ActorEffectRow({ effect }: { effect: ActiveEffect }): JSX.Element {
  const own = isOwnEffect(effect);

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

      <TableCell width="hug">
        <Text variant="label" color="muted" truncate>
          {effectSource(effect)}
        </Text>
      </TableCell>

      <TableCell width="action" align="center">
        <Checkbox
          id={`${effect.id}-disabled`}
          checked={effect.disabled}
          title={game.i18n.localize("ROBOTECH.Effect.Disabled")}
          onCheckedChange={(checked) => void effect.update({ disabled: checked })}
        />
      </TableCell>

      <TableCell width="controls" align="end">
        {own && (
          <Button
            size="icon"
            variant="danger"
            onClick={() => void effect.delete()}
            title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
          >
            <Icon name="x" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
