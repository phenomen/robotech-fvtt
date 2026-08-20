import { type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { LabelGrid, LabelRow, LabelRule } from "@/components/ui/LabelGrid";
import { Stack } from "@/components/ui/Stack";
import { GRADATION_KEYS, ROLL_MODIFIER_OPTIONS, type RollModifierValue } from "@/config";
import type { ActorOf, FieldValue, VesselSystemName } from "@/models";

interface VesselSystemsBlockProps {
  actor: ActorOf<"vessel">;
  onFieldChange: (path: string, value: FieldValue) => void;
}

const ENGINE_STEPS = [
  { level: 0, label: "0%" },
  { level: 1, label: "25%" },
  { level: 2, label: "50%" },
  { level: 3, label: "75%" },
  { level: 4, label: "100%" },
];

export function VesselSystemsBlock({ actor, onFieldChange }: VesselSystemsBlockProps): JSX.Element {
  const systems = actor.system.systems;

  const setSystemLevel = (sysName: VesselSystemName, level: RollModifierValue) => {
    onFieldChange(`system.systems.${sysName}`, level);
  };

  const setEngineLevel = (level: number) => {
    onFieldChange("system.systems.engines", level);
  };

  const renderSystemRow = (sysName: VesselSystemName, labelKey: string) => {
    const currentVal = systems[sysName];

    return (
      <LabelRow key={sysName} label={game.i18n.localize(labelKey)}>
        <Stack direction="row" gap={1}>
          {ROLL_MODIFIER_OPTIONS.map((option, index) => {
            const isActive = currentVal === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                size="small"
                variant={isActive ? "primary" : "secondary"}
                gradation={GRADATION_KEYS[index] ?? "neutral"}
                full
                onClick={() => setSystemLevel(sysName, option.value)}
              >
                {game.i18n.localize(option.labelKey)}
              </Button>
            );
          })}
        </Stack>
      </LabelRow>
    );
  };

  return (
    <Stack gap={3}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Vessel.SystemsTitle")}</CardTitle>
      </CardHeader>

      <LabelGrid>
        {renderSystemRow("sensors", "ROBOTECH.Vessel.Sensors")}
        {renderSystemRow("targeting", "ROBOTECH.Vessel.Targeting")}
        {renderSystemRow("thrusters", "ROBOTECH.Vessel.Thrusters")}
        <LabelRule />
        <LabelRow label={game.i18n.localize("ROBOTECH.Vessel.Engines")}>
          <Stack direction="row" gap={1}>
            {ENGINE_STEPS.map((step, index) => {
              const isActive = systems.engines === step.level;
              return (
                <Button
                  key={step.level}
                  type="button"
                  size="small"
                  variant={isActive ? "primary" : "secondary"}
                  gradation={GRADATION_KEYS[index] ?? "neutral"}
                  full
                  onClick={() => setEngineLevel(step.level)}
                >
                  {step.label}
                </Button>
              );
            })}
          </Stack>
        </LabelRow>
      </LabelGrid>
    </Stack>
  );
}
