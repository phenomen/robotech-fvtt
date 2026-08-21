import { type JSX } from "react";

import { openVitalsDialog } from "@/components/blocks/VitalsSettingsDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { TrackerHex } from "@/components/ui/TrackerHex";
import { GRADATION } from "@/config";
import type { ActorOf } from "@/models";
import { countCheckedBoxes } from "@/utils/trackers";
import {
  flatWoundGroup,
  toggledWoundStates,
  triumvirateGroupsOf,
  type WoundRef,
  type WoundType,
} from "@/utils/woundUtils";

interface WoundTrackerProps {
  actor: ActorOf<"character">;
}

interface HexBoxProps {
  tone: WoundType;
  label: string;
  isChecked: boolean;
  onClick: () => void;
  title: string;
}

function HexBox({ tone, isChecked, ...props }: HexBoxProps): JSX.Element {
  const color = tone === "brawl" ? GRADATION.good.color : GRADATION.worst.color;
  return <TrackerHex color={color} isFilled={isChecked} {...props} />;
}

interface WoundGroupProps {
  refs: WoundRef[];
  brawlStates: readonly boolean[];
  criticalStates: readonly boolean[];
  onToggle: (ref: WoundRef) => void;
  justify?: "start" | "center";
}

function WoundGroup({ refs, brawlStates, criticalStates, onToggle, justify = "start" }: WoundGroupProps): JSX.Element {
  const isChecked = (ref: WoundRef): boolean =>
    (ref.type === "brawl" ? brawlStates[ref.index] : criticalStates[ref.index]) ?? false;
  const labelOf = (ref: WoundRef): string =>
    game.i18n.localize(ref.type === "brawl" ? "ROBOTECH.Wounds.BrawlAbbr" : "ROBOTECH.Wounds.CriticalAbbr");
  const titleOf = (ref: WoundRef): string =>
    game.i18n.localize("ROBOTECH.Wounds.Box", {
      type: game.i18n.localize(ref.type === "brawl" ? "ROBOTECH.Wounds.Brawl" : "ROBOTECH.Wounds.Critical"),
      n: ref.index + 1,
    });

  return (
    <Stack direction="row" gap={1} align="center" justify={justify} wrap pad={1}>
      {refs.map((ref) => (
        <HexBox
          key={`${ref.type}-${ref.index}`}
          tone={ref.type}
          label={labelOf(ref)}
          isChecked={isChecked(ref)}
          onClick={() => onToggle(ref)}
          title={titleOf(ref)}
        />
      ))}
    </Stack>
  );
}

export function WoundTracker({ actor }: WoundTrackerProps): JSX.Element {
  const system = actor.system;
  const { isMechaWounds, isTriumvirateWounds } = system.vitalsSettings;
  const brawlStates = system.wounds.brawl.states;
  const criticalStates = system.wounds.critical.states;

  const groups = isTriumvirateWounds
    ? triumvirateGroupsOf(system.wounds.brawl.max, system.wounds.critical.max)
    : [flatWoundGroup(system.wounds.brawl.max, system.wounds.critical.max)];

  const toggleWoundHex = (ref: WoundRef) => {
    const group = groups.find((candidate) =>
      candidate.some((item) => item.type === ref.type && item.index === ref.index),
    );
    if (!group) return;
    const next = toggledWoundStates(group, ref.type, ref.index, brawlStates, criticalStates);
    void actor.update({
      "system.wounds.brawl.states": next.brawl,
      "system.wounds.brawl.value": countCheckedBoxes(next.brawl),
      "system.wounds.critical.states": next.critical,
      "system.wounds.critical.value": countCheckedBoxes(next.critical),
    });
  };

  return (
    <Card pad={0}>
      <Stack gap={3}>
        <CardHeader>
          <CardTitle>
            {game.i18n.localize("ROBOTECH.Wounds.Title")}
            {isMechaWounds ? ` [${game.i18n.localize("ROBOTECH.Wounds.MechaClass")}]` : null}
          </CardTitle>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => openVitalsDialog(actor)}
            title={game.i18n.localize("ROBOTECH.Wounds.Settings")}
          >
            <Icon name="settings" />
          </Button>
        </CardHeader>

        {isTriumvirateWounds ? (
          <Stack direction="row" gap={0}>
            {groups.map((group, index) => (
              <Stack key={groupKeyOf(group, index)} direction="row" gap={0} grow>
                {index > 0 ? <Divider orientation="vertical" /> : null}
                <Stack grow>
                  <WoundGroup
                    refs={group}
                    brawlStates={brawlStates}
                    criticalStates={criticalStates}
                    onToggle={toggleWoundHex}
                    justify="center"
                  />
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <WoundGroup
            refs={groups[0] ?? []}
            brawlStates={brawlStates}
            criticalStates={criticalStates}
            onToggle={toggleWoundHex}
          />
        )}
      </Stack>
    </Card>
  );
}

function groupKeyOf(group: WoundRef[], index: number): string {
  const first = group[0];
  return first ? `${first.type}-${first.index}` : `member-${index}`;
}
