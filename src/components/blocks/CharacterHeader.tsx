import { type ChangeEvent, type JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { DragDropSlots } from "@/components/blocks/DragDropSlots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import type { ActorOf } from "@/models";
import { pickImage } from "@/utils";

interface HeaderProps {
  actor: ActorOf<"character">;
}

export function Header({ actor }: HeaderProps): JSX.Element {
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: e.target.value });
  };

  return (
    <Stack direction="row" gap={4} align="center">
      <Portrait
        src={actor.img}
        alt={actor.name}
        title={game.i18n.localize("ROBOTECH.Character.ChangePortrait")}
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
        <DragDropSlots actor={actor} />
      </Stack>
    </Stack>
  );
}
