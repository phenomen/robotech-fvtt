import type Combat from "@client/documents/combat.mjs";
import type Combatant from "@client/documents/combatant.mjs";
import { type DragEvent, type JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/Card";
import { CombatantFrame } from "@/components/ui/CombatantFrame";
//import { Divider } from "@/components/ui/Divider";
import { NumberInput } from "@/components/ui/NumberInput";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  combatPhaseOf,
  isMentalBreak,
  isSlowed,
  remainingSlots,
  takenActionLabel,
  writeTurnOrder,
} from "@/utils/combat";

const DRAG_TYPE = "robotech-combatant";

interface CombatantRowProps {
  combat: Combat;
  combatant: Combatant;
  index: number;
}

export function CombatantRow({ combat, combatant, index }: CombatantRowProps): JSX.Element {
  const isGM = game.user?.isGM === true;
  const canEdit = isGM || combatant.isOwner;
  const phase = combatPhaseOf(combat);
  const inComms = phase === "communication";
  const active = combat.started && !inComms && combat.turn === index;
  const actor = combatant.actor;
  const slots = combatant.system.slots.filter((slot) => slot.action);
  const left = remainingSlots(combatant.system.slots);
  const slowed = isSlowed(actor);
  const mentalBreak = isMentalBreak(actor);
  // const speed = actorSpeed(actor);
  const portrait = combatant.img ?? actor?.img ?? CONST.DEFAULT_TOKEN;
  const rolled = Number.isFinite(combatant.initiative);
  const canAct = canEdit && !!actor && left > 0 && !inComms && !combatant.isDefeated;

  const handleInitiative = (value: number | null) => {
    if (!isGM) return;
    void combatant.update({ initiative: value });
  };

  const handleRoll = () => {
    if (!actor) return;
    void openActionCenter(actor, { action: "initiative" });
  };

  const handleAct = () => {
    if (!actor || !canAct) return;
    void openActionCenter(actor, { combatantId: combatant.id ?? undefined });
  };

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData(DRAG_TYPE, combatant.id ?? "");
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isGM) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!isGM) return;
    event.preventDefault();
    const draggedId = event.dataTransfer.getData(DRAG_TYPE);
    const targetId = combatant.id;
    if (!draggedId || !targetId || draggedId === targetId) return;
    void reorderTurns(combat, draggedId, targetId);
  };

  return (
    <CombatantFrame
      combatantId={combatant.id ?? ""}
      active={active}
      hidden={combatant.hidden}
      defeated={combatant.isDefeated}
      tone={active ? "primary" : combatant.isDefeated ? "default" : "secondary"}
      draggable={isGM}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader>
        <Stack direction="row" gap={2} align="center" grow>
          <Portrait src={portrait} alt={combatant.name} size="small" />
          <Text variant="label" truncate>
            {combatant.name}
          </Text>
        </Stack>
        <NumberInput
          value={combatant.initiative}
          min={0}
          width="small"
          disabled={!isGM}
          placeholder={game.i18n.localize("ROBOTECH.Combat.Unrolled")}
          aria-label={game.i18n.localize("ROBOTECH.Combat.Initiative")}
          onValueChange={handleInitiative}
        />
      </CardHeader>

      {canEdit && actor && !rolled ? (
        <Button
          type="button"
          size="small"
          full
          title={game.i18n.localize("ROBOTECH.Combat.RollInitiative")}
          onClick={handleRoll}
        >
          {game.i18n.localize("ROBOTECH.Combat.RollInitiative")}
        </Button>
      ) : null}

      {slowed || mentalBreak || combatant.hidden || combatant.isDefeated ? (
        <Stack direction="row" gap={1} align="center" wrap>
          {slowed ? <Tag label={game.i18n.localize("ROBOTECH.Status.Slowed")} color="amber" /> : null}
          {mentalBreak ? <Tag label={game.i18n.localize("ROBOTECH.Status.MentalBreak")} color="red" /> : null}
          {combatant.hidden ? <Tag label={game.i18n.localize("ROBOTECH.Combat.Hidden")} color="purple" /> : null}
          {combatant.isDefeated ? <Tag label={game.i18n.localize("ROBOTECH.Status.Defeated")} color="red" /> : null}
        </Stack>
      ) : null}

      <Stack gap={2}>
        <Stack direction="row" gap={1} align="center" justify="between">
          <Text variant="caption" color="muted">
            {game.i18n.localize(left === 1 ? "ROBOTECH.Combat.ActionLeft" : "ROBOTECH.Combat.ActionsLeft", { n: left })}
          </Text>
          {/* TODO: need to display is somehow else
          <Stack direction="row" gap={1} align="center">
            <Text variant="caption" color="muted">
              {game.i18n.localize("ROBOTECH.Combat.Pool", { pool: combatant.system.pool })}
            </Text>
            <Divider orientation="vertical" />
            <Text variant="caption" color="muted">
              {game.i18n.localize("ROBOTECH.Combat.Speed", { speed })}
            </Text>
          </Stack>
          */}
        </Stack>

        {slots.map((slot, slotIndex) => (
          <Text key={`taken-${slotIndex}`} variant="label" color={slot.heightened ? "danger" : "foreground"}>
            {takenActionLabel(slot)}
          </Text>
        ))}

        {canAct ? (
          <Button
            type="button"
            variant="primary"
            size="small"
            full
            title={game.i18n.localize("ROBOTECH.Combat.TakeAction")}
            onClick={handleAct}
          >
            {game.i18n.localize("ROBOTECH.Combat.TakeAction")}
          </Button>
        ) : null}
      </Stack>
    </CombatantFrame>
  );
}

async function reorderTurns(combat: Combat, draggedId: string, targetId: string): Promise<void> {
  const ids = combat.turns.map((entry) => entry.id).filter((id): id is string => Boolean(id));
  const from = ids.indexOf(draggedId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) return;
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  if (!moved) return;
  next.splice(to, 0, moved);
  await writeTurnOrder(combat, next);
}
