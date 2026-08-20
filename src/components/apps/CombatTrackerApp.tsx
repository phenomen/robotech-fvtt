import type Combat from "@client/documents/combat.mjs";
import { type JSX } from "react";

import { CombatantRow } from "@/components/blocks/CombatantRow";
import { CombatTrackerFooter } from "@/components/blocks/CombatTrackerFooter";
import { CombatTrackerHeader } from "@/components/blocks/CombatTrackerHeader";
import { Divider } from "@/components/ui/Divider";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

interface CombatTrackerAppProps {
  combat: Combat | null;
}

export function CombatTrackerApp({ combat }: CombatTrackerAppProps): JSX.Element {
  const combats = (game.combats?.combats ?? []) as Combat[];
  const turns = combat?.turns.filter((combatant) => combatant.visible) ?? [];

  return (
    <Sheet>
      <SheetHeader>
        <CombatTrackerHeader combat={combat} combats={combats} />
      </SheetHeader>
      <Divider />
      <SheetBody>
        <Stack gap={2} pad={2}>
          {combat && turns.length === 0 ? (
            <Text variant="label" color="muted">
              {game.i18n.localize("ROBOTECH.Combat.EmptyTurns")}
            </Text>
          ) : null}
          {combat
            ? turns.map((combatant, index) => {
                const turnIndex = combat.turns.indexOf(combatant);
                return (
                  <CombatantRow
                    key={combatant.id}
                    combat={combat}
                    combatant={combatant}
                    index={turnIndex === -1 ? index : turnIndex}
                  />
                );
              })
            : null}
        </Stack>
      </SheetBody>
      <Divider />
      <CombatTrackerFooter combat={combat} />
    </Sheet>
  );
}
