import { useState } from "react";
import type { JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { ARMOR_CLASS_OPTIONS, isChoiceValue } from "@/config/options";
import type { ArmorClassValue } from "@/config/options";
import type { ActorOf } from "@/models";
import type { AppOptions } from "@/types/application";

interface FrameworkSettingsContentProps {
  actor: ActorOf<"vessel">;
  onClose: () => void;
}

export function FrameworkSettingsContent({ actor, onClose }: FrameworkSettingsContentProps): JSX.Element {
  const [isBasic, setIsBasic] = useState<boolean>(actor.system.isBasic);
  const [armorClass, setArmorClass] = useState<ArmorClassValue>(actor.system.armorClass);
  const [armorMax, setArmorMax] = useState<number>(actor.system.armor.max);
  const [structureMax, setStructureMax] = useState<number>(actor.system.structure.max);

  const handleSave = () => {
    void actor.update({
      "system.armor.max": armorMax,
      "system.armorClass": armorClass,
      "system.isBasic": isBasic,
      "system.structure.max": structureMax,
    });
    onClose();
  };

  return (
    <Stack pad={4} gap={3}>
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
        checked={isBasic}
        onCheckedChange={setIsBasic}
        label={game.i18n.localize("ROBOTECH.Vessel.BasicStructure")}
      />

      <Divider />

      <Field orientation="horizontal" label={game.i18n.localize("ROBOTECH.Vessel.TotalStructure")}>
        <NumberInput
          min={0}
          value={structureMax}
          onValueChange={(val) => {
            setStructureMax(Math.max(0, val ?? 0));
          }}
        />
      </Field>

      <Field orientation="horizontal" label={game.i18n.localize("ROBOTECH.Vessel.TotalArmor")}>
        <NumberInput
          min={0}
          value={armorMax}
          onValueChange={(val) => {
            setArmorMax(Math.max(0, val ?? 0));
          }}
        />
      </Field>

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

export class FrameworkSettingsApp extends ReactDialog {
  constructor(
    private readonly actor: ActorOf<"vessel">,
    options: AppOptions = {}
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    classes: ["robotech", "dialog", "framework-settings"],
    id: "robotech-framework-settings",
    position: { height: "auto", width: 400 },
    window: {
      resizable: false,
      title: "ROBOTECH.Vessel.Settings",
    },
  };

  protected override renderContent(): JSX.Element {
    return <FrameworkSettingsContent actor={this.actor} onClose={() => void this.close()} />;
  }
}

export function openFrameworkDialog(actor: ActorOf<"vessel">): void {
  void new FrameworkSettingsApp(actor).render(true);
}
