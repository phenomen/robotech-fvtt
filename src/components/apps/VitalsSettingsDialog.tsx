import { useState } from "react";
import type { JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import { DialogFooter } from "@/components/blocks/DialogFooter";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { MAX_BRAWL_WOUNDS, MAX_CRITICAL_WOUNDS, woundBaselines } from "@/config";
import { ARMOR_CLASS_OPTIONS, isChoiceValue } from "@/config/options";
import type { ArmorClassValue } from "@/config/options";
import type { ActorOf } from "@/models";
import type { AppOptions } from "@/types/application";
import { sourceValueOf } from "@/utils/documents";

interface VitalsSettingsContentProps {
  actor: ActorOf<"character">;
  onClose: () => void;
}

function clamp(value: number | null, max: number): number {
  return Math.min(max, Math.max(0, value ?? 0));
}

/** A count equal to the baseline is stored as null so it follows the baseline when Triumvirate changes. */
function overrideOf(value: number, baseline: number): number | null {
  return value === baseline ? null : value;
}

function sourceCountOf(actor: ActorOf<"character">, path: string): number | null {
  const value = sourceValueOf(actor, path);
  return typeof value === "number" ? value : null;
}

export function VitalsSettingsContent({ actor, onClose }: VitalsSettingsContentProps): JSX.Element {
  const sourceArmorClass = String(sourceValueOf(actor, "system.armorClass")),
    [brawlOverride, setBrawlOverride] = useState(() => sourceCountOf(actor, "system.vitalsSettings.brawl")),
    [criticalOverride, setCriticalOverride] = useState(() => sourceCountOf(actor, "system.vitalsSettings.critical")),
    [armorClass, setArmorClass] = useState<ArmorClassValue>(
      isChoiceValue(ARMOR_CLASS_OPTIONS, sourceArmorClass) ? sourceArmorClass : actor.system.armorClass
    ),
    [isTriumvirateWounds, setIsTriumvirateWounds] = useState(
      () => sourceValueOf(actor, "system.vitalsSettings.isTriumvirateWounds") === true
    ),
    baseline = woundBaselines(isTriumvirateWounds),
    brawl = brawlOverride ?? baseline.brawl,
    critical = criticalOverride ?? baseline.critical,
    handleSave = () => {
      void actor.update({
        "system.armorClass": armorClass,
        "system.vitalsSettings.brawl": brawlOverride,
        "system.vitalsSettings.critical": criticalOverride,
        "system.vitalsSettings.isTriumvirateWounds": isTriumvirateWounds,
      });
      onClose();
    };

  return (
    <Stack pad={4} gap={3}>
      <Field
        orientation="horizontal"
        label={
          <>
            {game.i18n.localize("ROBOTECH.Wounds.Brawl")}{" "}
            <Text variant="label" color="muted" as="span">
              ({game.i18n.localize("ROBOTECH.Wounds.Max", { max: MAX_BRAWL_WOUNDS })})
            </Text>
          </>
        }
      >
        <NumberInput
          commit="change"
          min={0}
          max={MAX_BRAWL_WOUNDS}
          value={brawl}
          onValueChange={(val) => {
            setBrawlOverride(overrideOf(clamp(val, MAX_BRAWL_WOUNDS), baseline.brawl));
          }}
        />
      </Field>

      <Field
        orientation="horizontal"
        label={
          <>
            {game.i18n.localize("ROBOTECH.Wounds.Critical")}{" "}
            <Text variant="label" color="muted" as="span">
              ({game.i18n.localize("ROBOTECH.Wounds.Max", { max: MAX_CRITICAL_WOUNDS })})
            </Text>
          </>
        }
      >
        <NumberInput
          commit="change"
          min={0}
          max={MAX_CRITICAL_WOUNDS}
          value={critical}
          onValueChange={(val) => {
            setCriticalOverride(overrideOf(clamp(val, MAX_CRITICAL_WOUNDS), baseline.critical));
          }}
        />
      </Field>

      <Divider />

      <Field orientation="horizontal" label={game.i18n.localize("ROBOTECH.ArmorClass.Title")}>
        <Select
          width="medium"
          value={armorClass}
          onChange={(e) => {
            const next = e.target.value;
            if (isChoiceValue(ARMOR_CLASS_OPTIONS, next)) {
              setArmorClass(next);
            }
          }}
        >
          {ARMOR_CLASS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {game.i18n.localize(option.labelKey)}
            </option>
          ))}
        </Select>
      </Field>
      <Checkbox
        checked={isTriumvirateWounds}
        onCheckedChange={setIsTriumvirateWounds}
        label={game.i18n.localize("ROBOTECH.Wounds.Triumvirate")}
      />

      <DialogFooter onCancel={onClose} onConfirm={handleSave} />
    </Stack>
  );
}

export class VitalsSettingsApp extends ReactDialog {
  constructor(
    private readonly actor: ActorOf<"character">,
    options: AppOptions = {}
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    classes: ["robotech", "dialog", "vitals-settings"],
    id: "robotech-vitals-settings",
    position: { height: "auto", width: 400 },
    window: {
      resizable: false,
      title: "ROBOTECH.Wounds.Settings",
    },
  };

  protected override renderContent(): JSX.Element {
    return <VitalsSettingsContent actor={this.actor} onClose={() => void this.close()} />;
  }
}

export function openVitalsDialog(actor: ActorOf<"character">): void {
  void new VitalsSettingsApp(actor).render(true);
}
