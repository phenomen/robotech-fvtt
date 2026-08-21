import type ActiveEffect from "@client/documents/active-effect.mjs";
import type Item from "@client/documents/item.mjs";
import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import { createEffect } from "@/utils";

interface ItemEffectsListProps {
  item: Item;
}

export function ItemEffectsList({ item }: ItemEffectsListProps): JSX.Element {
  const effects = Array.from(item.effects);

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Effects")}</CardTitle>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => void createEffect(item)}
          title={game.i18n.localize("ROBOTECH.Effect.Add")}
        >
          <Icon name="add" size="small" />
        </Button>
      </CardHeader>

      {effects.length === 0 ? (
        <Callout>{game.i18n.localize("ROBOTECH.Effect.Empty")}</Callout>
      ) : (
        <Table>
          <TableHeader hidden>
            <TableRow>
              <TableCell width="grow">
                <Text variant="label" color="muted">
                  {game.i18n.localize("ROBOTECH.Effect.Name")}
                </Text>
              </TableCell>
              <TableCell width="16" align="end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {effects.map((effect) => (
              <ItemEffectRow key={effect.id} effect={effect} />
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

function ItemEffectRow({ effect }: { effect: ActiveEffect }): JSX.Element {
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
      <TableCell width="16" align="end">
        <Button
          size="icon"
          variant="danger"
          onClick={() => void effect.delete()}
          title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
        >
          <Icon name="x" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
