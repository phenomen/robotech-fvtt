import { type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { LabelGrid, LabelRow, LabelRule } from "@/components/ui/LabelGrid";
import { Stack } from "@/components/ui/Stack";
import { GRADATION_KEYS, type SystemRatingValue } from "@/config";
import type { ActorOf, FieldValue, VesselSystemName } from "@/models";

interface VesselSystemsBlockProps {
  actor: ActorOf<"vessel">;
  onFieldChange: (path: string, value: FieldValue) => void;
}

const SYSTEM_LEVELS: { key: SystemRatingValue; labelKey: string }[] = [
  { key: "advantage", labelKey: "ROBOTECH.Vessel.SystemLevels.advantage" },
  { key: "edge", labelKey: "ROBOTECH.Vessel.SystemLevels.edge" },
  { key: "nominal", labelKey: "ROBOTECH.Vessel.SystemLevels.nominal" },
  { key: "hindrance", labelKey: "ROBOTECH.Vessel.SystemLevels.hindrance" },
  { key: "disadvantage", labelKey: "ROBOTECH.Vessel.SystemLevels.disadvantage" },
];

const ENGINE_STEPS = [
  { level: 4, label: "100%" },
  { level: 3, label: "75%" },
  { level: 2, label: "50%" },
  { level: 1, label: "25%" },
  { level: 0, label: "0%" },
];

export function VesselSystemsBlock({ actor, onFieldChange }: VesselSystemsBlockProps): JSX.Element {
  const systems = actor.system.systems;

  const setSystemLevel = (sysName: VesselSystemName, level: SystemRatingValue) => {
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
          {SYSTEM_LEVELS.map((lvl, index) => {
            const isActive = currentVal === lvl.key;
            return (
              <Button
                key={lvl.key}
                type="button"
                size="small"
                variant={isActive ? "primary" : "secondary"}
                gradation={GRADATION_KEYS[index] ?? "neutral"}
                full
                onClick={() => setSystemLevel(sysName, lvl.key)}
              >
                {game.i18n.localize(lvl.labelKey)}
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
