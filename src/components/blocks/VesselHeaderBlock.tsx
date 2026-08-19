import { type ChangeEvent, type JSX } from "react";

import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Portrait } from "@/components/ui/Portrait";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { VESSEL_TYPE_OPTIONS } from "@/config/choices";
import type { ActorOf, FieldValue } from "@/models";
import { pickImage } from "@/utils";

interface VesselHeaderBlockProps {
  actor: ActorOf<"vessel">;
  onFieldChange: (path: string, value: FieldValue) => void;
}

export function VesselHeaderBlock({ actor, onFieldChange }: VesselHeaderBlockProps): JSX.Element {
  const system = actor.system;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    void actor.update({ name: e.target.value });
  };

  return (
    <Stack direction="row" gap={4} align="center">
      <Portrait
        src={actor.img}
        alt={actor.name}
        title={game.i18n.localize("ROBOTECH.Vessel.Title")}
        onClick={() => pickImage(actor)}
        size="large"
      />
      <Stack gap={2} grow>
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
        <Stack direction="row" gap={2}>
          <Field grow label={game.i18n.localize("ROBOTECH.Vessel.Designation")}>
            <Input
              width="full"
              value={system.designation}
              onChange={(e) => onFieldChange("system.designation", e.target.value)}
              placeholder={game.i18n.localize("ROBOTECH.Vessel.DesignationPlaceholder")}
            />
          </Field>
          <Field grow label={game.i18n.localize("ROBOTECH.Vessel.Classification")}>
            <Input
              width="full"
              value={system.classification}
              onChange={(e) => onFieldChange("system.classification", e.target.value)}
              placeholder={game.i18n.localize("ROBOTECH.Vessel.ClassificationPlaceholder")}
            />
          </Field>
          <Field grow label={game.i18n.localize("ROBOTECH.Vessel.Type")}>
            <Select
              width="full"
              value={system.vesselType}
              onChange={(e) => onFieldChange("system.vesselType", e.target.value)}
            >
              {VESSEL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {game.i18n.localize(option.labelKey)}
                </option>
              ))}
            </Select>
          </Field>
        </Stack>
      </Stack>
    </Stack>
  );
}
