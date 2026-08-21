import type Combat from "@client/documents/combat.mjs";
import { type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { ContextAnchor } from "@/components/ui/ContextAnchor";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { ToggleGroup, ToggleItem } from "@/components/ui/ToggleGroup";
import { COMBAT_PHASE_OPTIONS, type CombatPhaseValue } from "@/config/options";
import { changePhase, combatPhaseOf, COMBAT_DOCUMENT_TYPE } from "@/utils/combat";

interface CombatTrackerHeaderProps {
  combat: Combat | null;
  combats: Combat[];
}

export function CombatTrackerHeader({ combat, combats }: CombatTrackerHeaderProps): JSX.Element {
  const isGM = game.user?.isGM === true;
  const phase = combat ? combatPhaseOf(combat) : "communication";

  const handleCreate = () => {
    void createEncounter();
  };

  const handlePhase = (value: string) => {
    if (!combat || !isGM) return;
    void changePhase(combat, value as CombatPhaseValue);
  };

  return (
    <Stack gap={2} pad={2}>
      <Stack direction="row" gap={1} align="center" justify="between">
        <Stack direction="row" gap={1} align="center" wrap>
          {combats.map((entry, index) => (
            <Button
              key={entry.id}
              type="button"
              size="icon"
              variant={entry === combat ? "primary" : "secondary"}
              onClick={() => void entry.activate({ render: false })}
            >
              {index + 1}
            </Button>
          ))}
          {isGM ? (
            <Button
              type="button"
              size="icon"
              title={game.i18n.localize("ROBOTECH.Combat.Create")}
              onClick={handleCreate}
            >
              <Icon name="add" />
            </Button>
          ) : null}
        </Stack>
        {isGM && combat ? (
          <Stack direction="row" gap={1} align="center">
            <Button
              type="button"
              size="icon"
              title={game.i18n.localize("ROBOTECH.Combat.Settings")}
              onClick={() => void new foundry.applications.apps.CombatTrackerConfig().render({ force: true })}
            >
              <Icon name="settings" />
            </Button>
            <ContextAnchor name="encounter-context-menu">
              <Button type="button" size="icon" title={game.i18n.localize("ROBOTECH.Combat.Menu")}>
                <Icon name="grid" />
              </Button>
            </ContextAnchor>
          </Stack>
        ) : null}
      </Stack>

      <Text variant="label" align="center">
        {combat
          ? combat.started
            ? game.i18n.localize("ROBOTECH.Combat.Round", { n: combat.round })
            : game.i18n.localize("ROBOTECH.Combat.NotStarted")
          : game.i18n.localize("ROBOTECH.Combat.NoEncounter")}
      </Text>

      {combat ? (
        <ToggleGroup value={phase} onValueChange={isGM ? handlePhase : undefined} disabled={!isGM}>
          {COMBAT_PHASE_OPTIONS.map((option) => (
            <ToggleItem key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </ToggleItem>
          ))}
        </ToggleGroup>
      ) : null}
    </Stack>
  );
}

async function createEncounter(): Promise<void> {
  const created = await foundry.documents.Combat.implementation.create({ type: COMBAT_DOCUMENT_TYPE });
  const combat = (Array.isArray(created) ? created[0] : created) as foundry.documents.Combat | undefined;
  if (combat) await combat.activate({ render: false });
}
