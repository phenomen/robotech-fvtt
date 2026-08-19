import { type JSX } from "react";

import { Input } from "@/components/ui/Input";
import { LabelGrid, LabelRow } from "@/components/ui/LabelGrid";
import type { ActorOf } from "@/models";

interface DramaTrackerProps {
  actor: ActorOf<"character">;
}

const DRAMA_KEYS = ["drama1", "drama2", "drama3"] as const;

export function DramaTracker({ actor }: DramaTrackerProps): JSX.Element {
  const stress = actor.system.stress;

  const updateDramaText = (field: (typeof DRAMA_KEYS)[number], text: string) => {
    void actor.update({ [`system.stress.${field}`]: text });
  };

  return (
    <LabelGrid>
      {DRAMA_KEYS.map((key, index) => (
        <LabelRow key={key} label={game.i18n.localize("ROBOTECH.Stress.DramaN", { n: index + 1 })}>
          <Input
            value={stress[key]}
            onChange={(e) => updateDramaText(key, e.target.value)}
            placeholder={game.i18n.localize("ROBOTECH.Stress.DramaPlaceholder")}
            width="full"
          />
        </LabelRow>
      ))}
    </LabelGrid>
  );
}
