import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf } from "@/models";
import { countCheckedBoxes, resizeBoxStates } from "@/utils/trackers";

interface ConflictTrackerBlockProps {
  actor: ActorOf<"conflict">;
}

export function ConflictTrackerBlock({ actor }: ConflictTrackerBlockProps): JSX.Element {
  const tracker = actor.system.tracker;
  const states = tracker.states;

  const handleMaxChange = (val: number | null) => {
    const max = Math.max(0, val ?? 0);
    const next = resizeBoxStates(states, max);
    void actor.update({
      "system.tracker.max": max,
      "system.tracker.states": next,
      "system.tracker.value": countCheckedBoxes(next),
    });
  };

  const handleToggle = (index: number, checked: boolean) => {
    const next = states.map((state, i) => (i === index ? checked : state));
    void actor.update({
      "system.tracker.states": next,
      "system.tracker.value": countCheckedBoxes(next),
    });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Conflict.Tracker")}</CardTitle>
        <Field orientation="horizontal" label={game.i18n.localize("ROBOTECH.Conflict.Ticks")}>
          <NumberInput value={tracker.max} min={0} onValueChange={handleMaxChange} />
        </Field>
      </CardHeader>
      {states.length > 0 && (
        <Stack direction="row" gap={2} wrap>
          {states.map((checked, index) => (
            <Checkbox
              key={`tracker-${index}`}
              id={`${actor.id}-tracker-${index}`}
              checked={checked}
              onCheckedChange={(val) => handleToggle(index, val)}
              title={game.i18n.localize("ROBOTECH.Conflict.TrackerBox", { n: index + 1 })}
              size="large"
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
