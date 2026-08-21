import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { SPEED_UNIT_OPTIONS, VESSEL_MODE_OPTIONS, type SpeedUnitValue } from "@/config/choices";
import type { ActorOf, FieldValue } from "@/models";
import { calcEngineSpeed } from "@/utils/vesselUtils";

interface VesselSpeedBlockProps {
  actor: ActorOf<"vessel">;
}

type EngineTone = "green" | "teal" | "primary" | "amber" | "danger";

function engineTone(engines: number): EngineTone {
  if (engines >= 4) return "green";
  if (engines === 3) return "teal";
  if (engines === 2) return "primary";
  if (engines === 1) return "amber";
  return "danger";
}

export function VesselSpeedBlock({ actor }: VesselSpeedBlockProps): JSX.Element {
  const system = actor.system;
  const activeMode = system.activeSpeedMode;
  const isTransformableMecha = activeMode !== "general";
  const currentSpeed = system.speedModes[activeMode];
  const selectedUnit = currentSpeed.selected;
  const engines = system.systems.engines;
  const tone = engineTone(engines);

  const handleSelectSpeed = (unit: SpeedUnitValue) => {
    void actor.update({
      [`system.speedModes.${activeMode}.selected`]: unit,
      [`system.speedModes.${activeMode}.game`]: calcEngineSpeed(currentSpeed[unit], engines),
    });
  };

  const handleSpeedNumberChange = (unit: SpeedUnitValue, val: number) => {
    const updates: Record<string, FieldValue> = {
      [`system.speedModes.${activeMode}.${unit}`]: val,
    };
    if (selectedUnit === unit) {
      updates[`system.speedModes.${activeMode}.game`] = calcEngineSpeed(val, engines);
    }
    void actor.update(updates);
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>
          {game.i18n.localize("ROBOTECH.Vessel.SpeedTitle")}
          {isTransformableMecha
            ? ` [${game.i18n.localize(
                VESSEL_MODE_OPTIONS.find((option) => option.value === system.mode)?.labelKey ?? "ROBOTECH.Vessel.Mode",
              )}]`
            : null}
        </CardTitle>
        <Text variant="label" color="muted" size="small">
          {game.i18n.localize("ROBOTECH.Vessel.UnitConversionHint")}
        </Text>
      </CardHeader>

      <Stack direction="row" gap={2} align="center">
        <Stack direction="row" gap={1} align="center" grow>
          <Label icon="speed" iconTone={tone}>
            {game.i18n.localize("ROBOTECH.Vessel.GameUnits")}:
          </Label>
          <Text variant="mono" color={tone}>
            {system.speed}
          </Text>
        </Stack>
        {SPEED_UNIT_OPTIONS.map((unit) => {
          const isSelected = selectedUnit === unit.value;
          return (
            <Stack key={unit.value} align="center" grow>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleSelectSpeed(unit.value)}
                label={game.i18n.localize(unit.labelKey)}
              />
            </Stack>
          );
        })}
      </Stack>

      <Stack direction="row" gap={2} align="center">
        <Stack grow>
          <Label icon="grid">{game.i18n.localize("ROBOTECH.Vessel.Units")}</Label>
        </Stack>
        {SPEED_UNIT_OPTIONS.map((unit) => (
          <Stack key={unit.value} align="center" grow>
            <NumberInput
              value={currentSpeed[unit.value]}
              onValueChange={(val) => handleSpeedNumberChange(unit.value, val ?? 0)}
              min={0}
              width="full"
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
