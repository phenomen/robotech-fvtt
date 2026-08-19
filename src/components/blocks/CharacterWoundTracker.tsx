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

interface WoundTrackerProps {
  actor: ActorOf<"character">;
}

interface HexBoxProps {
  type: "brawl" | "critical";
  label: string;
  isChecked: boolean;
  onClick: () => void;
  title: string;
}

function HexBox({ type, isChecked, ...props }: HexBoxProps): JSX.Element {
  const color = type === "brawl" ? GRADATION.good.color : GRADATION.worst.color;
  return <TrackerHex color={color} isFilled={isChecked} {...props} />;
}

interface WoundGroupProps {
  brawlIndices: number[];
  critIndices: number[];
  isBrawlChecked: (index: number) => boolean;
  isCriticalChecked: (index: number) => boolean;
  onToggle: (type: "brawl" | "critical", index: number) => void;
  justify?: "start" | "center";
}

function WoundGroup({
  brawlIndices,
  critIndices,
  isBrawlChecked,
  isCriticalChecked,
  onToggle,
  justify = "start",
}: WoundGroupProps): JSX.Element {
  return (
    <Stack direction="row" gap={1} align="center" justify={justify} wrap pad={1}>
      {brawlIndices.map((i) => (
        <HexBox
          key={`brawl-${i}`}
          type="brawl"
          label={game.i18n.localize("ROBOTECH.Wounds.BrawlAbbr")}
          isChecked={isBrawlChecked(i)}
          onClick={() => onToggle("brawl", i)}
          title={game.i18n.localize("ROBOTECH.Wounds.Box", {
            type: game.i18n.localize("ROBOTECH.Wounds.Brawl"),
            n: i + 1,
          })}
        />
      ))}
      {critIndices.map((i) => (
        <HexBox
          key={`critical-${i}`}
          type="critical"
          label={game.i18n.localize("ROBOTECH.Wounds.CriticalAbbr")}
          isChecked={isCriticalChecked(i)}
          onClick={() => onToggle("critical", i)}
          title={game.i18n.localize("ROBOTECH.Wounds.Box", {
            type: game.i18n.localize("ROBOTECH.Wounds.Critical"),
            n: i + 1,
          })}
        />
      ))}
    </Stack>
  );
}

export function WoundTracker({ actor }: WoundTrackerProps): JSX.Element {
  const system = actor.system;

  const wounds = system.wounds;
  const { isMechaWounds, isTriumvirateWounds } = system.vitalsSettings;

  const brawlMax = wounds.brawl.max;
  const criticalMax = wounds.critical.max;

  const isBrawlChecked = (index: number) => wounds.brawl.states[index] ?? false;
  const isCriticalChecked = (index: number) => wounds.critical.states[index] ?? false;

  const m1BrawlCount = Math.floor(brawlMax / 3) + (brawlMax % 3 > 0 ? 1 : 0);
  const m2BrawlCount = Math.floor(brawlMax / 3) + (brawlMax % 3 > 1 ? 1 : 0);
  const m3BrawlCount = Math.floor(brawlMax / 3);

  const m1CritCount = Math.floor(criticalMax / 3) + (criticalMax % 3 > 0 ? 1 : 0);
  const m2CritCount = Math.floor(criticalMax / 3) + (criticalMax % 3 > 1 ? 1 : 0);
  const m3CritCount = Math.floor(criticalMax / 3);

  const m1BrawlIndices = Array.from({ length: m1BrawlCount }, (_, i) => i);
  const m1CritIndices = Array.from({ length: m1CritCount }, (_, i) => i);

  const m2BrawlIndices = Array.from({ length: m2BrawlCount }, (_, i) => m1BrawlCount + i);
  const m2CritIndices = Array.from({ length: m2CritCount }, (_, i) => m1CritCount + i);

  const m3BrawlIndices = Array.from({ length: m3BrawlCount }, (_, i) => m1BrawlCount + m2BrawlCount + i);
  const m3CritIndices = Array.from({ length: m3CritCount }, (_, i) => m1CritCount + m2CritCount + i);

  const getWoundGroup = (
    type: "brawl" | "critical",
    index: number,
  ): Array<{ type: "brawl" | "critical"; index: number }> => {
    if (!isTriumvirateWounds) {
      const group: Array<{ type: "brawl" | "critical"; index: number }> = [];
      for (let i = 0; i < brawlMax; i++) {
        group.push({ type: "brawl", index: i });
      }
      for (let i = 0; i < criticalMax; i++) {
        group.push({ type: "critical", index: i });
      }
      return group;
    }

    const m1Group = [
      ...m1BrawlIndices.map((i) => ({ type: "brawl" as const, index: i })),
      ...m1CritIndices.map((i) => ({ type: "critical" as const, index: i })),
    ];
    if (m1Group.some((item) => item.type === type && item.index === index)) {
      return m1Group;
    }

    const m2Group = [
      ...m2BrawlIndices.map((i) => ({ type: "brawl" as const, index: i })),
      ...m2CritIndices.map((i) => ({ type: "critical" as const, index: i })),
    ];
    if (m2Group.some((item) => item.type === type && item.index === index)) {
      return m2Group;
    }

    const m3Group = [
      ...m3BrawlIndices.map((i) => ({ type: "brawl" as const, index: i })),
      ...m3CritIndices.map((i) => ({ type: "critical" as const, index: i })),
    ];
    if (m3Group.some((item) => item.type === type && item.index === index)) {
      return m3Group;
    }

    return [];
  };

  const toggleWoundHex = (type: "brawl" | "critical", index: number) => {
    const brawlStates = Array.from({ length: brawlMax }, (_, i) => isBrawlChecked(i));
    const critStates = Array.from({ length: criticalMax }, (_, i) => isCriticalChecked(i));
    const group = getWoundGroup(type, index);
    const targetChecked = type === "brawl" ? isBrawlChecked(index) : isCriticalChecked(index);
    const pos = group.findIndex((item) => item.type === type && item.index === index);

    if (pos !== -1) {
      if (!targetChecked) {
        for (let i = 0; i <= pos; i++) {
          const item = group[i];
          if (!item) continue;
          if (item.type === "brawl") {
            brawlStates[item.index] = true;
          } else {
            critStates[item.index] = true;
          }
        }
      } else {
        for (let i = pos; i < group.length; i++) {
          const item = group[i];
          if (!item) continue;
          if (item.type === "brawl") {
            brawlStates[item.index] = false;
          } else {
            critStates[item.index] = false;
          }
        }
      }
    }

    void actor.update({
      "system.wounds.brawl.states": brawlStates,
      "system.wounds.brawl.value": brawlStates.filter(Boolean).length,
      "system.wounds.critical.states": critStates,
      "system.wounds.critical.value": critStates.filter(Boolean).length,
    });
  };

  const groups = [
    { brawl: m1BrawlIndices, crit: m1CritIndices },
    { brawl: m2BrawlIndices, crit: m2CritIndices },
    { brawl: m3BrawlIndices, crit: m3CritIndices },
  ];

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
            {groups.map((member, index) => (
              <Stack key={`member-${index}`} direction="row" gap={0} grow>
                {index > 0 ? <Divider orientation="vertical" /> : null}
                <Stack grow>
                  <WoundGroup
                    brawlIndices={member.brawl}
                    critIndices={member.crit}
                    isBrawlChecked={isBrawlChecked}
                    isCriticalChecked={isCriticalChecked}
                    onToggle={toggleWoundHex}
                    justify="center"
                  />
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <WoundGroup
            brawlIndices={Array.from({ length: brawlMax }, (_, i) => i)}
            critIndices={Array.from({ length: criticalMax }, (_, i) => i)}
            isBrawlChecked={isBrawlChecked}
            isCriticalChecked={isCriticalChecked}
            onToggle={toggleWoundHex}
          />
        )}
      </Stack>
    </Card>
  );
}
