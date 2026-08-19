import { type JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { ActorOf, FieldValue } from "@/models";

interface VesselFrameworkBlockProps {
  actor: ActorOf<"vessel">;
  onFieldChange: (path: string, value: FieldValue) => void;
}

export function VesselFrameworkBlock({ actor, onFieldChange }: VesselFrameworkBlockProps): JSX.Element {
  const { armor, structure, isBasic } = actor.system;

  return (
    <Stack gap={3}>
      <CardHeader>
        <Stack direction="row" gap={4} align="center">
          <CardTitle>{game.i18n.localize("ROBOTECH.Vessel.FrameworkTitle")}</CardTitle>
          <Checkbox
            checked={isBasic}
            onCheckedChange={(val) => onFieldChange("system.isBasic", val)}
            label={game.i18n.localize("ROBOTECH.Vessel.Basic")}
          />
        </Stack>
        <Stack direction="row" gap={2} shrink>
          <Text variant="caption" color="muted" align="center" width="num">
            {game.i18n.localize("ROBOTECH.Vessel.Total")}
          </Text>
          <Text variant="caption" color="muted" align="center" width="num">
            {game.i18n.localize("ROBOTECH.Vessel.Left")}
          </Text>
        </Stack>
      </CardHeader>

      <Stack direction="row" gap={2} align="center" justify="between">
        <Label icon="armor" iconTone="primary">
          {game.i18n.localize("ROBOTECH.Vessel.Armor")}
        </Label>
        <Stack direction="row" gap={2} shrink>
          <NumberInput
            min={0}
            value={armor.max}
            onValueChange={(val) => onFieldChange("system.armor.max", Math.max(0, val ?? 0))}
          />
          <NumberInput
            min={0}
            value={armor.value}
            onValueChange={(val) => onFieldChange("system.armor.value", Math.max(0, val ?? 0))}
          />
        </Stack>
      </Stack>

      <Stack direction="row" gap={2} align="center" justify="between">
        <Label icon="structure" iconTone="green">
          {game.i18n.localize("ROBOTECH.Vessel.Structure")}
        </Label>
        <Stack direction="row" gap={2} shrink>
          <NumberInput
            min={0}
            value={structure.max}
            onValueChange={(val) => onFieldChange("system.structure.max", Math.max(0, val ?? 0))}
          />
          <NumberInput
            min={0}
            value={structure.value}
            onValueChange={(val) => onFieldChange("system.structure.value", Math.max(0, val ?? 0))}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
