import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ACTION_OPTIONS,
  ACTION_PHASE_OPTIONS,
  CONFLICT_ACTION_OPTIONS,
  ROLL_MODIFIER_OPTIONS,
  isChoiceValue,
  isConflictAction,
  modifierLabelOf,
} from "@/config/options";
import type { ActionValue, RollModifierValue } from "@/config/options";
import type { SourcedOption } from "@/utils/actionCenterItems";
import { optionLabel } from "@/utils/actionCenterItems";
import type { IncomingAttack } from "@/utils/actionChat";
import { calcDieSuccess } from "@/utils/evaluateAd6Roll";

export function ActionSelect({
  value,
  disabled,
  conflictOnly,
  exclude,
  onChange,
}: {
  value: ActionValue;
  disabled: boolean;
  conflictOnly: boolean;
  exclude?: ActionValue;
  onChange: (value: ActionValue) => void;
}): JSX.Element {
  const options = (conflictOnly ? CONFLICT_ACTION_OPTIONS : ACTION_OPTIONS).filter(
    (option) => option.value !== exclude
  );
  const phases = conflictOnly ? ACTION_PHASE_OPTIONS.filter((phase) => phase.value !== "any") : ACTION_PHASE_OPTIONS;
  const selected = ACTION_OPTIONS.find((option) => option.value === value) ?? ACTION_OPTIONS[0];
  return (
    <Stack gap={1}>
      <Field label={game.i18n.localize("ROBOTECH.Roll.Action")}>
        <Select
          width="full"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            if (conflictOnly) {
              if (isConflictAction(next)) {
                onChange(next);
              }
              return;
            }
            if (isChoiceValue(ACTION_OPTIONS, next)) {
              onChange(next);
            }
          }}
        >
          {phases.map((phase) => (
            <optgroup key={phase.value} label={game.i18n.localize(phase.labelKey)}>
              {options.map((option) =>
                option.phase === phase.value ? (
                  <option key={option.value} value={option.value}>
                    {game.i18n.localize(option.labelKey)}
                  </option>
                ) : null
              )}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Text variant="label" color="muted">
        {selected ? game.i18n.localize(selected.hintKey) : null}
      </Text>
    </Stack>
  );
}

export function AttackOptions({
  calledShot,
  onCalledShotChange,
  penetrationActive,
  penetrationValue,
  onPenetrationActiveChange,
  onPenetrationValueChange,
}: {
  calledShot: boolean;
  onCalledShotChange: (value: boolean) => void;
  penetrationActive: boolean;
  penetrationValue: number;
  onPenetrationActiveChange: (value: boolean) => void;
  onPenetrationValueChange: (value: number) => void;
}): JSX.Element {
  return (
    <Stack direction="row" gap={2} align="center">
      <Checkbox
        checked={calledShot}
        onCheckedChange={onCalledShotChange}
        label={game.i18n.localize("ROBOTECH.Roll.CalledShot")}
        title={game.i18n.localize("ROBOTECH.Roll.CalledShotYes")}
      />
      <Divider orientation="vertical" />
      <Stack direction="row" gap={2} align="center">
        <Checkbox
          checked={penetrationActive}
          onCheckedChange={onPenetrationActiveChange}
          label={game.i18n.localize("ROBOTECH.Roll.ArmorPenetration")}
        />
        <NumberInput
          min={0}
          value={penetrationValue}
          disabled={!penetrationActive}
          aria-label={game.i18n.localize("ROBOTECH.Roll.ArmorPenetration")}
          onValueChange={(value) => {
            onPenetrationValueChange(value ?? 0);
          }}
        />
      </Stack>
    </Stack>
  );
}

export function IncomingSummary({ incoming }: { incoming: IncomingAttack }): JSX.Element {
  return (
    <Card tone="secondary" bordered pad={2} gap={1}>
      <Stack gap={1}>
        <Stack direction="row" gap={1} align="center" justify="between">
          <Label icon="alert" iconTone="danger">
            {game.i18n.localize("ROBOTECH.Roll.IncomingAttack")}
          </Label>
          <Text variant="label">
            {game.i18n.localize("ROBOTECH.Roll.AttackSuccesses")}: {incoming.attackSuccesses}
          </Text>
        </Stack>
        <Text variant="label">{incoming.weaponName}</Text>
        {incoming.tags?.length ? (
          <Stack direction="row" gap={1} wrap>
            {incoming.tags.map((tag) => (
              <Tag key={tag.id} label={tag.label} color={tag.color} size="small" title={tag.title} />
            ))}
          </Stack>
        ) : null}
        {incoming.calledShot && (
          <Text variant="label" color="amber">
            {game.i18n.localize("ROBOTECH.Roll.CalledShotYes")}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

export function SkillSelect({
  labelKey,
  value,
  skills,
  allowNone,
  onChange,
}: {
  labelKey: string;
  value: string;
  skills: SourcedOption<"skill">[];
  allowNone?: boolean;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <Field label={game.i18n.localize(labelKey)} grow>
      <Select
        width="full"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {allowNone && <option value="">— {game.i18n.localize("ROBOTECH.Roll.None")} —</option>}
        {skills.map((skill) => (
          <option key={skill.key} value={skill.key}>
            {optionLabel(skill.item.name, skill.item.system.value, skill.sourceName)}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function SuiteSelect({
  value,
  suites,
  onChange,
}: {
  value: string;
  suites: SourcedOption<"equipment_suite">[];
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <Field label={game.i18n.localize("ROBOTECH.Roll.SelectSuite")}>
      <Select
        width="full"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="">— {game.i18n.localize("ROBOTECH.Roll.None")} —</option>
        {suites.map((item) => (
          <option key={item.key} value={item.key}>
            {optionLabel(item.item.name, item.item.system.skill, item.sourceName)}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function WeaponSelect({
  value,
  weapons,
  onChange,
}: {
  value: string;
  weapons: SourcedOption<"weapon">[];
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <Field label={game.i18n.localize("ROBOTECH.Roll.Weapon")}>
      <Select
        width="full"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {weapons.length === 0 && <option value="">{game.i18n.localize("ROBOTECH.Roll.None")}</option>}
        {weapons.map((item) => (
          <option key={item.key} value={item.key}>
            {game.i18n.localize("ROBOTECH.Roll.OptionNameWithSource", {
              name: item.item.name,
              source: item.sourceName,
            })}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function ModifierRow({
  modifier,
  onChange,
}: {
  modifier: RollModifierValue;
  onChange: (value: RollModifierValue) => void;
}): JSX.Element {
  return (
    <Stack direction="row" gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Roll.Modifier")}>
        <Select
          value={modifier}
          onChange={(event) => {
            if (isChoiceValue(ROLL_MODIFIER_OPTIONS, event.target.value)) {
              onChange(event.target.value);
            }
          }}
        >
          {ROLL_MODIFIER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {modifierLabelOf(option.value)}
            </option>
          ))}
        </Select>
      </Field>
      <Stack gap={1}>
        <Label>{game.i18n.localize("ROBOTECH.Roll.Successes")}</Label>
        <Stack direction="row" gap={3} align="center">
          {[4, 5, 6].map((die) => {
            const successes = calcDieSuccess(die, modifier);
            return (
              <Stack key={die} direction="row" gap={1} align="center">
                <Icon name={`dice-${die}`} size="large" />
                <Text variant="mono" size="large" color={dieTextColor(successes)}>
                  {successes}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}

export function BonusRow({
  dice,
  successes,
  onDiceChange,
  onSuccessesChange,
}: {
  dice: number;
  successes: number;
  onDiceChange: (value: number) => void;
  onSuccessesChange: (value: number) => void;
}): JSX.Element {
  return (
    <Card direction="row" align="center" tone="secondary" bordered>
      <Field label={game.i18n.localize("ROBOTECH.Roll.ManualDice")} orientation="horizontal" grow>
        <NumberInput
          min={-5}
          controls
          value={dice}
          onValueChange={(value) => {
            onDiceChange(value ?? 0);
          }}
        />
      </Field>
      <Divider orientation="vertical" />
      <Field label={game.i18n.localize("ROBOTECH.Roll.ManualSuccesses")} orientation="horizontal" grow>
        <NumberInput
          min={-5}
          controls
          value={successes}
          onValueChange={(value) => {
            onSuccessesChange(value ?? 0);
          }}
        />
      </Field>
    </Card>
  );
}

export function SwarmDiceRow({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}): JSX.Element {
  return (
    <Card tone="secondary" bordered>
      <Field
        label={game.i18n.localize("ROBOTECH.Roll.SwarmVessels")}
        title={game.i18n.localize("ROBOTECH.Roll.SwarmVesselsHint")}
        orientation="horizontal"
      >
        <NumberInput
          min={1}
          max={max}
          controls
          value={value}
          onValueChange={(next) => {
            onChange(next ?? 1);
          }}
        />
      </Field>
    </Card>
  );
}

export function SynergyFooter({
  sourceSuccesses,
  transferred,
  remaining,
  pushed,
  canConfirm,
  pending,
  onTransferredChange,
  onConfirm,
}: {
  sourceSuccesses: number;
  transferred: number;
  remaining: number;
  pushed: boolean;
  canConfirm: boolean;
  pending: boolean;
  onTransferredChange: (value: number) => void;
  onConfirm: () => void;
}): JSX.Element {
  return (
    <Stack gap={3}>
      <Field label={game.i18n.localize("ROBOTECH.Roll.SynergyMove")} orientation="horizontal">
        <NumberInput
          min={1}
          max={sourceSuccesses}
          controls
          value={transferred}
          onValueChange={(value) => {
            onTransferredChange(value ?? 1);
          }}
        />
      </Field>
      <Stack direction="row" gap={2} wrap>
        <Text variant="label" color="muted">
          {game.i18n.localize("ROBOTECH.Roll.SynergyRemaining", { count: remaining })}
        </Text>
        <Text variant="label" color="primary">
          {game.i18n.localize("ROBOTECH.Roll.SynergyTransferred", { count: transferred })}
        </Text>
      </Stack>
      {pushed ? (
        <Text variant="label" color="danger">
          {game.i18n.localize("ROBOTECH.Roll.PushedSynergyFatigue")}
        </Text>
      ) : null}
      <Stack direction="row" gap={2} justify="end" shrink>
        <Button size="large" variant="primary" disabled={!canConfirm || pending} onClick={onConfirm}>
          {game.i18n.localize("ROBOTECH.Roll.SynergyConfirm")}
        </Button>
      </Stack>
    </Stack>
  );
}

function dieTextColor(successes: number): "green" | "amber" | "danger" {
  if (successes >= 2) {
    return "green";
  }
  if (successes === 1) {
    return "amber";
  }
  return "danger";
}
