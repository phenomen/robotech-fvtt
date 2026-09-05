import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LabelGrid, LabelRow } from "@/components/ui/LabelGrid";
import type { ActorOf } from "@/models";
import { sendToChat } from "@/utils";

interface DramaTrackerProps {
  actor: ActorOf<"character">;
}

const DRAMA_KEYS = ["drama1", "drama2", "drama3", "drama4", "drama5"] as const;

export function DramaTracker({ actor }: DramaTrackerProps): JSX.Element {
  const stress = actor.system.stress;

  const updateDramaText = (field: (typeof DRAMA_KEYS)[number], text: string) => {
    void actor.update({ [`system.stress.${field}`]: text });
  };

  const sendDrama = (index: number, text: string) => {
    void sendToChat({
      actor,
      description: text,
      title: game.i18n.localize("ROBOTECH.Stress.DramaN", { n: index + 1 }),
    });
  };

  return (
    <LabelGrid>
      {DRAMA_KEYS.map((key, index) => (
        <LabelRow
          key={key}
          label={
            <Button
              variant="ghost"
              align="start"
              title={game.i18n.localize("ROBOTECH.Buttons.SendToChat")}
              onClick={() => {
                sendDrama(index, stress[key]);
              }}
            >
              {game.i18n.localize("ROBOTECH.Stress.DramaN", { n: index + 1 })}
            </Button>
          }
        >
          <Input
            value={stress[key]}
            onChange={(e) => {
              updateDramaText(key, e.target.value);
            }}
            placeholder={game.i18n.localize("ROBOTECH.Stress.DramaPlaceholder")}
            width="full"
          />
        </LabelRow>
      ))}
    </LabelGrid>
  );
}
