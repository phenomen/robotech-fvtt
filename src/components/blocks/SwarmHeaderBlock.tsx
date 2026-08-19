import { type ChangeEvent, type JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { ActorOf } from "@/models";
import { pickImage } from "@/utils";

interface SwarmHeaderBlockProps {
  actor: ActorOf<"swarm">;
}

export function SwarmHeaderBlock({ actor }: SwarmHeaderBlockProps): JSX.Element {
  const system = actor.system;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: e.target.value });
  };

  const speedDisplay =
    system.minSpeed === system.maxSpeed
      ? `${system.minSpeed}`
      : `${system.minSpeed} - ${system.maxSpeed} (${system.averageSpeed})`;

  return (
    <Stack direction="row" gap={4} align="center">
      <Portrait
        src={actor.img}
        alt={actor.name}
        title={game.i18n.localize("ROBOTECH.Swarm.Title")}
        onClick={() => pickImage(actor)}
        size="large"
      />
      <Stack gap={2} grow>
        <Stack direction="row" gap={3} align="center">
          <Input
            value={actor.name}
            onChange={handleNameChange}
            size="large"
            width="full"
            aria-label={game.i18n.localize("ROBOTECH.Sheet.Name")}
            placeholder={game.i18n.localize("ROBOTECH.Sheet.NamePlaceholder")}
          />
          <Button variant="primary" size="large" onClick={() => void openActionCenter(actor)}>
            {game.i18n.localize("ROBOTECH.Roll.Title")}
          </Button>
        </Stack>

        <Stack direction="row" gap={2}>
          <Stack align="center" justify="center" grow>
            <Label>{game.i18n.localize("ROBOTECH.Swarm.Stats.TotalVessels")}</Label>
            <Text variant="stat" color="primary">
              {system.vessels.value} / {system.vessels.max}
            </Text>
          </Stack>
          <Stack align="center" justify="center" grow>
            <Label>{game.i18n.localize("ROBOTECH.Swarm.Stats.TotalStructure")}</Label>
            <Text variant="stat" color="primary">
              {system.structure.value} / {system.structure.max}
            </Text>
          </Stack>
          <Stack align="center" justify="center" grow>
            <Label>{game.i18n.localize("ROBOTECH.Swarm.Stats.SpeedRange")}</Label>
            <Text variant="stat" color="primary" truncate>
              {speedDisplay}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
