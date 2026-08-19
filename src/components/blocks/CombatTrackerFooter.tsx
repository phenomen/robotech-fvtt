import type Combat from "@client/documents/combat.mjs";
import { type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";

interface CombatTrackerFooterProps {
  combat: Combat | null;
}

export function CombatTrackerFooter({ combat }: CombatTrackerFooterProps): JSX.Element | null {
  if (!combat) return null;

  const isGM = game.user?.isGM === true;
  const currentOwner = !!combat.combatant?.isOwner;
  const canStep = isGM || currentOwner;

  if (!combat.started) {
    if (!isGM) return null;
    return (
      <Stack pad={2} gap={2}>
        <Button type="button" variant="primary" full onClick={() => void combat.startCombat()}>
          {game.i18n.localize("ROBOTECH.Combat.Start")}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack pad={2} gap={2}>
      <Stack direction="row" gap={1}>
        <Button type="button" size="medium" full disabled={!canStep} onClick={() => void combat.previousTurn()}>
          {game.i18n.localize("ROBOTECH.Combat.PreviousTurn")}
        </Button>
        <Button
          type="button"
          size="medium"
          variant="primary"
          full
          disabled={!canStep}
          onClick={() => void combat.nextTurn()}
        >
          {game.i18n.localize("ROBOTECH.Combat.NextTurn")}
        </Button>
      </Stack>
      {isGM ? (
        <Stack direction="row" gap={1}>
          <Button type="button" size="small" full onClick={() => void combat.previousRound()}>
            {game.i18n.localize("ROBOTECH.Combat.PreviousRound")}
          </Button>
          <Button type="button" size="small" full onClick={() => void combat.nextRound()}>
            {game.i18n.localize("ROBOTECH.Combat.NextRound")}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
