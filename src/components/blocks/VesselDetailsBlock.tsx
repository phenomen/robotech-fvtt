import { type JSX } from "react";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf, FieldValue } from "@/models";

interface VesselDetailsBlockProps {
  actor: ActorOf<"vessel">;
}

export function VesselDetailsBlock({ actor }: VesselDetailsBlockProps): JSX.Element {
  const system = actor.system;

  const handleFieldChange = (path: string, val: FieldValue) => {
    void actor.update({ [path]: val });
  };

  return (
    <Stack gap={3} justify="center">
      <Field
        icon="hardware-point"
        iconTone="amber"
        orientation="horizontal"
        label={game.i18n.localize("ROBOTECH.Vessel.HardwarePoints")}
      >
        <NumberInput
          value={system.hardwarePoints}
          onValueChange={(val) => handleFieldChange("system.hardwarePoints", val ?? 0)}
          min={0}
        />
      </Field>

      <Field
        icon="rank"
        iconTone="primary"
        orientation="horizontal"
        label={game.i18n.localize("ROBOTECH.Vessel.RequiredRank")}
      >
        <NumberInput
          value={system.requiredRank}
          onValueChange={(val) => handleFieldChange("system.requiredRank", val ?? 0)}
          min={0}
        />
      </Field>

      <Field
        icon="faction"
        iconTone="blue"
        orientation="horizontal"
        label={game.i18n.localize("ROBOTECH.Vessel.Faction")}
      >
        <Input
          value={system.faction}
          onChange={(e) => handleFieldChange("system.faction", e.target.value)}
          width="medium"
        />
      </Field>
    </Stack>
  );
}
