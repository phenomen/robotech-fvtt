import { useState, type JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { AppOptions, CloseOptions } from "@/types/application";
import {
  amountOf,
  assignedDamageOf,
  assignToSink,
  canApplyDamage,
  commitDamage,
  initialAmountsOf,
  selectedSlotsOf,
  toggleHardwareSlot,
  type DamageAmounts,
  type DamagePreview,
  type DamageSink,
} from "@/utils/applyDamage";

interface DamageDialogContentProps {
  preview: DamagePreview;
  onClose: () => void;
}

export function DamageDialogContent({ preview, onClose }: DamageDialogContentProps): JSX.Element {
  const damage = preview.cascade.damageInflicted;
  const { sinks } = preview;
  const [amounts, setAmounts] = useState<DamageAmounts>(initialAmountsOf);

  const incoming = preview.breakdown.multipliedHits;
  const assigned = assignedDamageOf(amounts);
  const remaining = Math.max(0, damage - assigned);
  const soaked = Math.max(0, incoming - preview.cascade.hitsOverArmor);
  const canApply = canApplyDamage(amounts, damage);
  const framework = sinks.filter((sink) => sink.kind !== "hardware");
  const hardware = sinks.filter((sink) => sink.kind === "hardware");
  const typeLabel = game.i18n.localize(`ROBOTECH.Damage.DamageClass.${preview.breakdown.damageType}`);

  const handleChange = (sink: DamageSink, value: number | null): void => {
    setAmounts((current) => assignToSink(current, sink, value ?? 0, damage));
  };

  const handleHardware = (sink: DamageSink, index: number, checked: boolean): void => {
    setAmounts((current) => toggleHardwareSlot(current, sink, index, checked, damage));
  };

  const handleApply = (): void => {
    if (!canApply) return;
    void commitDamage(preview, amounts).then(() => onClose());
  };

  return (
    <Stack pad={4} gap={4}>
      <Stack gap={1}>
        <Text variant="label" color="primary">
          {game.i18n.localize("ROBOTECH.Damage.DistributeHint", {
            damage: incoming,
            type: typeLabel,
            name: preview.actor.name,
          })}
        </Text>
        {preview.incoming.calledShot && (
          <Text variant="label" color="amber">
            {game.i18n.localize("ROBOTECH.Roll.CalledShotYes")}
          </Text>
        )}
        <Stack direction="row" gap={2} wrap>
          {soaked > 0 && (
            <Text variant="label" color="muted">
              {game.i18n.localize("ROBOTECH.Damage.Soaked", { soaked })}
            </Text>
          )}
          <Text variant="label" color={remaining > 0 ? "amber" : "green"}>
            {game.i18n.localize("ROBOTECH.Damage.Assigned", { assigned, total: damage })}
          </Text>
        </Stack>
      </Stack>

      <Stack gap={3}>
        {framework.map((sink) => (
          <SinkRow key={sink.id} sink={sink} amounts={amounts} onChange={handleChange} />
        ))}
      </Stack>

      {hardware.length > 0 && (
        <Stack gap={3}>
          <Divider />
          <Text variant="label" color="primary">
            {game.i18n.localize("ROBOTECH.Damage.HardwareSection")}
          </Text>
          {hardware.map((sink) => (
            <HardwareRow key={sink.id} sink={sink} amounts={amounts} remaining={remaining} onToggle={handleHardware} />
          ))}
        </Stack>
      )}

      <Stack direction="row" gap={2} justify="end" shrink>
        <Button size="medium" variant="outline" onClick={onClose}>
          {game.i18n.localize("ROBOTECH.Buttons.Cancel")}
        </Button>
        <Button size="medium" variant="primary" disabled={!canApply} onClick={handleApply}>
          {game.i18n.localize("ROBOTECH.Roll.ApplyDamage")}
        </Button>
      </Stack>
    </Stack>
  );
}

interface SinkRowProps {
  sink: DamageSink;
  amounts: DamageAmounts;
  onChange: (sink: DamageSink, value: number | null) => void;
}

function SinkRow({ sink, amounts, onChange }: SinkRowProps): JSX.Element {
  const label = sink.name ?? game.i18n.localize(sink.labelKey);
  const value = amountOf(sink, amounts);

  return (
    <Field
      icon={sink.icon}
      iconTone={sink.iconTone}
      orientation="horizontal"
      label={
        <>
          {label}{" "}
          <Text variant="label" color="muted" as="span">
            ({game.i18n.localize("ROBOTECH.Damage.Capacity", { remaining: sink.capacity })})
          </Text>
        </>
      }
    >
      <NumberInput min={0} max={sink.maxAssign} controls value={value} onValueChange={(next) => onChange(sink, next)} />
    </Field>
  );
}

interface HardwareRowProps {
  sink: DamageSink;
  amounts: DamageAmounts;
  remaining: number;
  onToggle: (sink: DamageSink, index: number, checked: boolean) => void;
}

function HardwareRow({ sink, amounts, remaining, onToggle }: HardwareRowProps): JSX.Element {
  const slots = sink.destroyed ?? [];
  const selected = selectedSlotsOf(sink, amounts);
  const canSpend = remaining > 0 || amounts.structure > 0;
  const label = sink.name ?? game.i18n.localize(sink.labelKey);

  return (
    <Stack direction="row" gap={2} align="start" justify="between">
      <Label icon={sink.icon} iconTone={sink.iconTone}>{label}</Label>
      <Stack direction="row" gap={1} align="center" justify="end" wrap shrink>
        {slots.map((wasDestroyed, index) => {
          const assigned = selected.includes(index);
          return (
            <Checkbox
              key={index}
              checked={wasDestroyed || assigned}
              disabled={wasDestroyed || (!assigned && !canSpend)}
              variant="danger"
              title={game.i18n.localize("ROBOTECH.List.HardwareSlot", {
                current: index + 1,
                total: slots.length,
              })}
              onCheckedChange={(checked) => onToggle(sink, index, checked)}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

export class DamageDialogApp extends ReactDialog {
  constructor(
    private preview: DamagePreview,
    options: AppOptions = {},
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    id: "robotech-damage-dialog",
    classes: ["robotech", "dialog", "damage-dialog"],
    position: { width: 420, height: "auto" },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "ROBOTECH.Damage.DistributeTitle",
      resizable: false,
    },
  };

  protected override renderContent(): JSX.Element {
    return <DamageDialogContent preview={this.preview} onClose={() => void this.close()} />;
  }

  override _onClose(options: CloseOptions): void {
    if (currentApp === this) currentApp = null;
    super._onClose(options);
  }
}

let currentApp: DamageDialogApp | null = null;

export function openDamageDialog(preview: DamagePreview): void {
  void (async () => {
    if (currentApp) await currentApp.close();
    currentApp = new DamageDialogApp(preview);
    void currentApp.render(true);
  })();
}
