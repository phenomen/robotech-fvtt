import { type JSX } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import { HexInput, TrackerHex } from "@/components/ui/TrackerHex";
import { GRADATION, GRADATION_LEVELS } from "@/config";
import type { ActorOf } from "@/models";

interface StressTrackerProps {
  actor: ActorOf<"character">;
}

interface StressHexBoxProps {
  index: number;
  state: string;
  onLeftClick: () => void;
  onRightClick: () => void;
}

function StressHexBox({ index, state, onLeftClick, onRightClick }: StressHexBoxProps): JSX.Element {
  const color = GRADATION_LEVELS[index]?.color ?? GRADATION.worst.color;
  const isFilled = Boolean(state);

  const getTitleText = (): string => {
    let stateLabel = game.i18n.localize("ROBOTECH.Stress.Empty");
    if (state === "F") stateLabel = game.i18n.localize("ROBOTECH.Stress.Fatigue");
    if (state === "D") stateLabel = game.i18n.localize("ROBOTECH.Stress.Drama");
    return game.i18n.localize("ROBOTECH.Stress.Box", { n: index + 1, state: stateLabel });
  };

  return (
    <TrackerHex
      color={color}
      isFilled={isFilled}
      label={isFilled ? state : ""}
      onClick={onLeftClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick();
      }}
      title={getTitleText()}
    />
  );
}

export function StressTracker({ actor }: StressTrackerProps): JSX.Element {
  const boxes = actor.system.stress.boxes;
  const burnout = actor.system.burnout;

  const setBoxState = (index: number, state: string) => {
    const newBoxes = [...boxes];
    newBoxes[index] = state;
    void actor.update({ "system.stress.boxes": newBoxes });
  };

  const toggleBoxState = (index: number) => {
    setBoxState(index, boxes[index] === "F" ? "D" : "F");
  };

  const updateBurnoutValue = (val: number) => {
    void actor.update({ "system.burnout": Math.max(1, val) });
  };

  return (
    <Card pad={0}>
      <Stack gap={3}>
        <CardHeader>
          <CardTitle>{game.i18n.localize("ROBOTECH.Stress.Stress")}</CardTitle>
        </CardHeader>

        <Stack direction="row" gap={3} align="center" justify="between" wrap pad={1}>
          <Stack direction="row" gap={1} align="center">
            {boxes.map((state, i) => (
              <StressHexBox
                key={`stress-hex-${i}`}
                index={i}
                state={state}
                onLeftClick={() => toggleBoxState(i)}
                onRightClick={() => setBoxState(i, "")}
              />
            ))}
          </Stack>

          <HexInput
            color="var(--rt-danger)"
            label={game.i18n.localize("ROBOTECH.Stress.Burnout")}
            icon="burnout"
            value={burnout}
            onValueChange={updateBurnoutValue}
          />
        </Stack>
      </Stack>
    </Card>
  );
}
