import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LabelGrid, LabelRow } from "@/components/ui/LabelGrid";
import type { ActorOf } from "@/models";
import { sendToChat } from "@/utils";

interface CharacterDramaTrackerProps {
  actor: ActorOf<"character">;
}

export function CharacterDramaTracker({ actor }: CharacterDramaTrackerProps): JSX.Element {
  const dramas = actor.system.stress.dramas;

  const updateDramaText = (index: number, text: string) => {
    const next = [...dramas];
    next[index] = text;
    void actor.update({ "system.stress.dramas": next });
  };

  const sendDrama = (index: number, text: string) => {
    void sendToChat({
      actor,
      description: text,
      name: game.i18n.localize("ROBOTECH.Stress.DramaN", { n: index + 1 }),
    });
  };

  return (
    <LabelGrid>
      {dramas.map((text, index) => (
        <LabelRow
          // Fixed drama slots; index is the slot identity.
          // oxlint-disable-next-line react-doctor/no-array-index-as-key
          key={index}
          label={
            <Button
              variant="ghost"
              align="start"
              title={game.i18n.localize("ROBOTECH.Buttons.SendToChat")}
              onClick={() => {
                sendDrama(index, text);
              }}
            >
              {game.i18n.localize("ROBOTECH.Stress.DramaN", { n: index + 1 })}
            </Button>
          }
        >
          <Input
            value={text}
            onChange={(e) => {
              updateDramaText(index, e.target.value);
            }}
            placeholder={game.i18n.localize("ROBOTECH.Stress.DramaPlaceholder")}
            width="full"
          />
        </LabelRow>
      ))}
    </LabelGrid>
  );
}
