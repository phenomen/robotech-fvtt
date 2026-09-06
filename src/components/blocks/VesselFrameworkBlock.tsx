import type { JSX } from "react";

import { openFrameworkDialog } from "@/components/blocks/FrameworkSettingsDialog";
import { Button } from "@/components/ui/Button";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
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
  const { armor, armorClass, structure, resistance } = actor.system;

  return (
    <Stack gap={1}>
      <CardHeader>
        <Stack direction="row" gap={2} align="center">
          <CardTitle>{game.i18n.localize("ROBOTECH.Vessel.FrameworkTitle")}</CardTitle>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => {
              openFrameworkDialog(actor);
            }}
            title={game.i18n.localize("ROBOTECH.Vessel.Settings")}
          >
            <Icon name="settings" />
          </Button>
        </Stack>
        <Stack direction="row" gap={1} shrink align="center">
          <Text variant="label" color="muted" align="center" width="num">
            {game.i18n.localize("ROBOTECH.Vessel.Total")}
          </Text>
          <Text variant="label" color="muted" align="center" width="num">
            {game.i18n.localize("ROBOTECH.Vessel.Current")}
          </Text>
        </Stack>
      </CardHeader>
      <Stack direction="row" gap={2} align="center" justify="between">
        <Label icon="structure" iconTone="green">
          {game.i18n.localize("ROBOTECH.Vessel.Structure")}
        </Label>
        <Stack direction="row" gap={1} shrink align="center">
          <Text variant="mono" color="muted" align="center" width="num">
            {structure.max}
          </Text>
          <NumberInput
            min={0}
            max={structure.max}
            value={structure.value}
            onValueChange={(val) => {
              onFieldChange("system.structure.value", Math.max(0, val ?? 0));
            }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" gap={2} align="center" justify="between">
        <Label icon="armor" iconTone="teal">
          {game.i18n.localize("ROBOTECH.Vessel.Armor")}
          {` [${game.i18n.localize(`ROBOTECH.ArmorClass.${armorClass}`)}]`}
        </Label>
        <Stack direction="row" gap={1} shrink align="center">
          <Text variant="mono" color="muted" align="center" width="num">
            {armor.max}
          </Text>
          <NumberInput
            min={0}
            max={armor.max}
            value={armor.value}
            onValueChange={(val) => {
              onFieldChange("system.armor.value", Math.max(0, val ?? 0));
            }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" gap={2} align="center" justify="between">
        <Label icon="resistance" iconTone="teal">
          {game.i18n.localize("ROBOTECH.Vessel.Resistance")}
        </Label>
        <Stack direction="row" gap={2} shrink>
          <NumberInput
            min={0}
            value={resistance}
            onValueChange={(val) => {
              onFieldChange("system.resistance", Math.max(0, val ?? 0));
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
