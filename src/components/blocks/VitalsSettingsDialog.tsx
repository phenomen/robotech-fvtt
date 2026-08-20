import { useState, type JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { MAX_BRAWL_WOUNDS, MAX_CRITICAL_WOUNDS, woundBaselines } from "@/config";
import type { ActorOf } from "@/models";
import type { AppOptions } from "@/types/application";

interface VitalsSettingsContentProps {
  actor: ActorOf<"character">;
  onClose: () => void;
}

function clamp(value: number | null, max: number): number {
  return Math.min(max, Math.max(0, value ?? 0));
}

export function VitalsSettingsContent({ actor, onClose }: VitalsSettingsContentProps): JSX.Element {
  const settings = actor.system.vitalsSettings;
  const baseline = woundBaselines(settings.isTriumvirateWounds);

  const [brawl, setBrawl] = useState<number>(settings.brawl ?? baseline.brawl);
  const [critical, setCritical] = useState<number>(settings.critical ?? baseline.critical);
  const [isMechaWounds, setIsMechaWounds] = useState<boolean>(settings.isMechaWounds);
  const [isTriumvirateWounds, setIsTriumvirateWounds] = useState<boolean>(settings.isTriumvirateWounds);

  const handleSave = () => {
    void actor.update({
      "system.vitalsSettings.brawl": brawl,
      "system.vitalsSettings.critical": critical,
      "system.vitalsSettings.isMechaWounds": isMechaWounds,
      "system.vitalsSettings.isTriumvirateWounds": isTriumvirateWounds,
    });
    onClose();
  };

  return (
    <Stack pad={4} gap={4}>
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
          min={0}
          max={MAX_BRAWL_WOUNDS}
          value={brawl}
          onValueChange={(val) => setBrawl(clamp(val, MAX_BRAWL_WOUNDS))}
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
          min={0}
          max={MAX_CRITICAL_WOUNDS}
          value={critical}
          onValueChange={(val) => setCritical(clamp(val, MAX_CRITICAL_WOUNDS))}
        />
      </Field>

      <Stack gap={3}>
        <Divider />
        <Checkbox
          checked={isMechaWounds}
          onCheckedChange={setIsMechaWounds}
          label={game.i18n.localize("ROBOTECH.Wounds.MechaClassWounds")}
        />
        <Checkbox
          checked={isTriumvirateWounds}
          onCheckedChange={setIsTriumvirateWounds}
          label={game.i18n.localize("ROBOTECH.Wounds.Triumvirate")}
        />
      </Stack>

      <Stack direction="row" gap={2} justify="end" shrink>
        <Button size="medium" variant="outline" onClick={onClose}>
          {game.i18n.localize("ROBOTECH.Buttons.Cancel")}
        </Button>
        <Button size="medium" variant="primary" onClick={handleSave}>
          {game.i18n.localize("ROBOTECH.Buttons.Save")}
        </Button>
      </Stack>
    </Stack>
  );
}

export class VitalsSettingsApp extends ReactDialog {
  constructor(
    private actor: ActorOf<"character">,
    options: AppOptions = {},
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    id: "robotech-vitals-settings",
    classes: ["robotech", "dialog", "vitals-settings"],
    position: { width: 400, height: "auto" },
    window: {
      title: "ROBOTECH.Wounds.Settings",
      resizable: false,
    },
  };

  protected override renderContent(): JSX.Element {
    return <VitalsSettingsContent actor={this.actor} onClose={() => void this.close()} />;
  }
}

export function openVitalsDialog(actor: ActorOf<"character">): void {
  void new VitalsSettingsApp(actor).render(true);
}
