import { useId, type JSX } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { PLOT_EVENT_PHASE_OPTIONS, type PlotEventPhaseValue } from "@/config/choices";
import type { ActorOf } from "@/models";

interface PlotEventRoundsBlockProps {
  actor: ActorOf<"plot_event">;
}

interface PhaseRowProps {
  phase: PlotEventPhaseValue;
  label: string;
  count: number;
  active: boolean;
  onToggle: (checked: boolean) => void;
  onCountChange: (val: number | null) => void;
}

function PhaseRow({ phase, label, count, active, onToggle, onCountChange }: PhaseRowProps): JSX.Element {
  const id = useId();

  return (
    <Card pad={2} grow>
      <Stack direction="row" gap={2} align="center" justify="center">
        <Checkbox
          id={`${id}-${phase}`}
          checked={active}
          onCheckedChange={onToggle}
          label={label}
          title={game.i18n.localize("ROBOTECH.PlotEvent.SetActivePhase", { phase: label })}
        />
        <NumberInput
          id={`${id}-${phase}-count`}
          value={count}
          min={0}
          aria-label={label}
          onValueChange={onCountChange}
        />
      </Stack>
    </Card>
  );
}

export function PlotEventRoundsBlock({ actor }: PlotEventRoundsBlockProps): JSX.Element {
  const rounds = actor.system.rounds;
  const activePhase = actor.system.activePhase;

  const handleRoundChange = (phase: PlotEventPhaseValue, val: number | null) => {
    void actor.update({ [`system.rounds.${phase}`]: val ?? 0 });
  };

  const handlePhaseToggle = (phase: PlotEventPhaseValue, checked: boolean) => {
    void actor.update({ "system.activePhase": checked ? phase : "" });
  };

  return (
    <Stack gap={2}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.PlotEvent.Rounds")}</CardTitle>
      </CardHeader>
      <Stack direction="row" gap={0}>
        {PLOT_EVENT_PHASE_OPTIONS.map((option, index) => {
          const label = game.i18n.localize(option.labelKey);
          return (
            <Stack key={option.value} direction="row" gap={0} grow>
              {index > 0 ? <Divider orientation="vertical" /> : null}
              <PhaseRow
                phase={option.value}
                label={label}
                count={rounds[option.value]}
                active={activePhase === option.value}
                onToggle={(checked) => handlePhaseToggle(option.value, checked)}
                onCountChange={(val) => handleRoundChange(option.value, val)}
              />
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
