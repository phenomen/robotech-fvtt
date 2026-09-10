import type Combat from "@client/documents/combat.mjs";
import type { JSX } from "react";

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
  const combats = game.combats?.combats ?? [];
  const turns = combat?.turns.filter((combatant) => combatant.visible) ?? [];
  const turnIndexes = new Map((combat?.turns ?? []).map((combatant, index) => [combatant.id, index]));

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
            ? turns.map((combatant, index) => (
                <CombatantRow
                  key={combatant.id}
                  combat={combat}
                  combatant={combatant}
                  index={turnIndexes.get(combatant.id) ?? index}
                />
              ))
            : null}
        </Stack>
      </SheetBody>
      <Divider />
      <CombatTrackerFooter combat={combat} />
    </Sheet>
  );
}
