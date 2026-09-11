import type { ChangeEvent, JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import type { ActorOf } from "@/models";
import { filterItemsOf, findItemOf, pickImage } from "@/utils";

interface HeaderProps {
  actor: ActorOf<"character">;
}

function rankTagLabel(rank: number, title: string): string {
  if (title) {
    return game.i18n.localize("ROBOTECH.Character.RankNTitle", { n: rank, title });
  }
  return game.i18n.localize("ROBOTECH.Character.RankN", { n: rank });
}

function fameTagLabel(fame: number, title: string): string | null {
  if (title) {
    return game.i18n.localize("ROBOTECH.Character.FameNTitle", { n: fame, title });
  }
  if (fame > 0) {
    return game.i18n.localize("ROBOTECH.Character.FameN", { n: fame });
  }
  return null;
}

function CharacterTags({ actor }: HeaderProps): JSX.Element | null {
  const race = findItemOf(actor, "race");
  const career = findItemOf(actor, "career");
  const elements = filterItemsOf(actor, "element");
  const fameLabel = fameTagLabel(actor.system.fame, actor.system.fameTitle);

  if (!(race || career || elements.length > 0 || fameLabel)) {
    return null;
  }

  return (
    <Stack direction="row" gap={1} wrap>
      {race ? (
        <Tag label={race.name} color="teal" size="medium" title={game.i18n.localize("ROBOTECH.Character.Race")} />
      ) : null}
      {career ? (
        <Tag label={career.name} color="blue" size="medium" title={game.i18n.localize("ROBOTECH.Character.Career")} />
      ) : null}
      {elements.map((element) => (
        <Tag
          key={element.id}
          label={element.name}
          color="green"
          size="medium"
          title={game.i18n.localize("ROBOTECH.Character.Element")}
        />
      ))}
      {career ? (
        <Tag
          label={rankTagLabel(actor.system.rank, actor.system.rankTitle)}
          color="purple"
          size="medium"
          title={game.i18n.localize("ROBOTECH.Character.Rank")}
        />
      ) : null}
      {fameLabel ? (
        <Tag label={fameLabel} color="amber" size="medium" title={game.i18n.localize("ROBOTECH.Character.Fame")} />
      ) : null}
    </Stack>
  );
}

export function CharacterHeader({ actor }: HeaderProps): JSX.Element {
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: e.target.value });
  };

  return (
    <Stack direction="row" gap={4} align="center">
      <Portrait
        src={actor.img}
        alt={actor.name}
        title={game.i18n.localize("ROBOTECH.Character.ChangePortrait")}
        onClick={() => {
          pickImage(actor);
        }}
        size="large"
      />
      <Stack gap={4} grow>
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
        <CharacterTags actor={actor} />
      </Stack>
    </Stack>
  );
}
