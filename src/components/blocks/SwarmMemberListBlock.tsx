import { useState, useEffect, type JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Portrait } from "@/components/ui/Portrait";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { ActorOf, SwarmMember } from "@/models";
import { isActorOf } from "@/utils";

interface SwarmMemberListBlockProps {
  actor: ActorOf<"swarm">;
}

interface CrewPreview {
  uuid: string;
  name: string;
  img: string;
  missing: boolean;
}

/** A stack keeps structure on its lead vessel while any vessel is left, and none once emptied. */
function withMemberPatch(member: SwarmMember, updates: Partial<SwarmMember>): SwarmMember {
  const next = { ...member, ...updates };
  if (next.count <= 0) return { ...next, currentStructure: 0 };
  if (next.currentStructure <= 0) return { ...next, currentStructure: next.reducedStructure };
  return next;
}

export function SwarmMemberListBlock({ actor }: SwarmMemberListBlockProps): JSX.Element {
  const members = actor.system.members;

  const handleUpdateMember = (id: string, updates: Partial<SwarmMember>) => {
    const updated = members.map((member) => (member.id === id ? withMemberPatch(member, updates) : member));
    void actor.update({ "system.members": updated });
  };

  const handleCountChange = (member: SwarmMember, count: number) => {
    handleUpdateMember(member.id, {
      count,
      maxCount: Math.max(member.maxCount, count),
    });
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter((member) => member.id !== id);
    void actor.update({ "system.members": updated });
  };

  return (
    <Stack gap={1}>
      <CardHeader>
        <CardTitle>{game.i18n.localize("ROBOTECH.Swarm.Members.Title")}</CardTitle>
      </CardHeader>

      {members.length === 0 ? (
        <Callout icon="info">{game.i18n.localize("ROBOTECH.Swarm.Members.DragDropHint")}</Callout>
      ) : (
        <Stack gap={3}>
          {members.map((member) => (
            <SwarmMemberRow
              key={member.id}
              member={member}
              onUpdate={handleUpdateMember}
              onCountChange={handleCountChange}
              onDelete={handleDeleteMember}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function SwarmMemberRow({
  member,
  onUpdate,
  onCountChange,
  onDelete,
}: {
  member: SwarmMember;
  onUpdate: (id: string, updates: Partial<SwarmMember>) => void;
  onCountChange: (member: SwarmMember, count: number) => void;
  onDelete: (id: string) => void;
}): JSX.Element {
  return (
    <Stack gap={2}>
      <Stack direction="row" gap={3} align="end">
        <Stack direction="row" gap={3} align="center" grow>
          <Button
            variant="ghost"
            onClick={() => void openActorSheet(member.actorUuid)}
            title={game.i18n.localize("ROBOTECH.Buttons.Edit")}
          >
            <Stack direction="row" gap={3} align="center">
              <Portrait src={member.img} alt="" size="medium" />
              <Text variant="label" truncate>
                {member.name}
              </Text>
            </Stack>
          </Button>
        </Stack>

        <Field label={game.i18n.localize("ROBOTECH.Swarm.Members.Armor")}>
          <NumberInput value={member.armor} min={0} onValueChange={(val) => onUpdate(member.id, { armor: val ?? 0 })} />
        </Field>

        <Field
          title={game.i18n.localize("ROBOTECH.Swarm.Members.ReducedStructureHint")}
          label={
            <>
              {game.i18n.localize("ROBOTECH.Swarm.Members.Structure")} [ {member.originalStructure} →{" "}
              {member.reducedStructure} ]
            </>
          }
        >
          <NumberInput
            value={member.currentStructure}
            min={member.count > 0 ? 1 : 0}
            max={member.reducedStructure}
            onValueChange={(val) => onUpdate(member.id, { currentStructure: val ?? 0 })}
          />
        </Field>

        <Field label={game.i18n.localize("ROBOTECH.Swarm.Members.Speed")}>
          <NumberInput value={member.speed} min={0} onValueChange={(val) => onUpdate(member.id, { speed: val ?? 0 })} />
        </Field>

        <Field label={game.i18n.localize("ROBOTECH.Swarm.Members.Count")}>
          <NumberInput value={member.count} min={0} controls onValueChange={(val) => onCountChange(member, val ?? 0)} />
        </Field>

        <Button
          variant="danger"
          size="icon"
          onClick={() => onDelete(member.id)}
          title={game.i18n.localize("ROBOTECH.Buttons.Delete")}
        >
          <Icon name="x" />
        </Button>
      </Stack>

      <Divider />

      <MemberCrewList actorUuid={member.actorUuid} />
    </Stack>
  );
}

function MemberCrewList({ actorUuid }: { actorUuid: string }): JSX.Element {
  const [crew, setCrew] = useState<CrewPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    void loadVesselCrew(actorUuid).then((resolved) => {
      if (!cancelled) setCrew(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [actorUuid]);

  return (
    <Stack gap={2}>
      <Label>{game.i18n.localize("ROBOTECH.Tabs.Crew")}</Label>
      {crew.length === 0 ? (
        <Text variant="label" color="muted">
          {game.i18n.localize("ROBOTECH.Crew.Empty")}
        </Text>
      ) : (
        <Stack direction="row" gap={2} wrap>
          {crew.map((member) => (
            <CrewChip key={member.uuid} member={member} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function CrewChip({ member }: { member: CrewPreview }): JSX.Element {
  if (member.missing) {
    return (
      <Text variant="label" color="muted">
        {game.i18n.localize("ROBOTECH.LinkedCharacter.Missing")}
      </Text>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => void openActorSheet(member.uuid)}
      title={game.i18n.localize("ROBOTECH.LinkedCharacter.OpenSheet")}
    >
      <Text variant="label" truncate>
        {member.name}
      </Text>
    </Button>
  );
}

async function loadVesselCrew(actorUuid: string): Promise<CrewPreview[]> {
  if (!actorUuid) return [];
  const document = await foundry.utils.fromUuid(actorUuid);
  if (!(document instanceof foundry.documents.Actor) || !isActorOf(document, "vessel")) return [];
  return Promise.all(document.system.characterUuids.filter(Boolean).map(previewOf));
}

async function previewOf(uuid: string): Promise<CrewPreview> {
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor && isActorOf(document, "character")) {
    return { uuid, name: document.name, img: document.img, missing: false };
  }
  return { uuid, name: "", img: "", missing: true };
}

async function openActorSheet(uuid: string): Promise<void> {
  if (!uuid) return;
  const document = await foundry.utils.fromUuid(uuid);
  if (document instanceof foundry.documents.Actor) void document.sheet?.render(true);
}
