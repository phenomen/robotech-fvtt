import type Actor from "@client/documents/actor.mjs";
import type Combatant from "@client/documents/combatant.mjs";
import { useState, type JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
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
  type ActionValue,
  type RollModifierValue,
} from "@/config/options";
import type { ActorOf, ItemOf, ItemType, WeaponAmount } from "@/models";
import type { ActionUsage } from "@/models/combat";
import type { AppOptions, CloseOptions } from "@/types/application";
import { postActionCard, type IncomingAttack } from "@/utils/actionChat";
import { evaluateAd6Roll, calcDieSuccess } from "@/utils/AD6Roll";
import {
  actorSpeed,
  actionBudgetError,
  applyInitiative,
  combatantOf,
  combatPhaseOf,
  isHeightened,
  simpleActionsEnabled,
  spendRoundUses,
} from "@/utils/combat";
import { filterItemsOf, isActorOf, resolveLinkedCharacters, memberVesselsOf } from "@/utils/documents";
import { isFullyDestroyed } from "@/utils/hardwareUtils";
import { weaponAttackStats, type WeaponTag } from "@/utils/weaponUtils";

export interface ActionCenterPrefill {
  action?: ActionValue;
  skill1Id?: string;
  incoming?: IncomingAttack;
  combatantId?: string;
}

export interface SourcedOption<T extends ItemType> {
  key: string;
  item: ItemOf<T>;
  sourceName: string;
  sourceUuid: string;
}

export interface ActionCenterItems {
  skills: SourcedOption<"skill">[];
  suites: SourcedOption<"equipment_suite">[];
  weapons: SourcedOption<"weapon">[];
}

interface ActionCenterContentProps {
  contextActor: Actor;
  items: ActionCenterItems;
  prefill?: ActionCenterPrefill;
  onClose: () => void;
}

export function ActionCenterContent({ contextActor, items, prefill, onClose }: ActionCenterContentProps): JSX.Element {
  const incoming = prefill?.incoming;
  const combatant = combatantFromPrefill(prefill);
  const consumeSlot = Boolean(combatant);
  const lockedAction: ActionValue | null = incoming ? "defend" : (prefill?.action ?? null);

  const { skills: skillItems, suites: suiteItems, weapons: weaponItems } = items;

  const [action, setAction] = useState<ActionValue>(
    lockedAction ?? prefill?.action ?? defaultCombatAction(consumeSlot),
  );
  const [skill1Id, setSkill1Id] = useState<string>(prefillSkillKey(skillItems, contextActor, prefill?.skill1Id));
  const [skill2Id, setSkill2Id] = useState<string>("");
  const [suiteId, setSuiteId] = useState<string>("");
  const [weaponId, setWeaponId] = useState<string>(weaponItems[0]?.key ?? "");
  const [calledShot, setCalledShot] = useState<boolean>(false);
  const initialPenetration = weaponPenetrationOf(weaponItems[0]?.item);
  const [penetrationActive, setPenetrationActive] = useState(initialPenetration.active);
  const [penetrationValue, setPenetrationValue] = useState(initialPenetration.value);
  const [modifier, setModifier] = useState<RollModifierValue>("nominal");
  const [manualDice, setManualDice] = useState<number>(0);
  const [manualSuccesses, setManualSuccesses] = useState<number>(0);
  const livingVessels = livingSwarmCount(contextActor);
  const [swarmDice, setSwarmDice] = useState<number>(livingVessels);

  const skill1 = skillItems.find((skill) => skill.key === skill1Id);
  const skill2 = skillItems.find((skill) => skill.key === skill2Id);
  const suite = suiteItems.find((item) => item.key === suiteId);
  const weapon = weaponItems.find((item) => item.key === weaponId);

  const handleWeaponChange = (nextId: string): void => {
    setWeaponId(nextId);
    const next = weaponPenetrationOf(weaponItems.find((item) => item.key === nextId)?.item);
    setPenetrationActive(next.active);
    setPenetrationValue(next.value);
  };

  const diceCount =
    swarmDice +
    (skill1?.item.system.value ?? 0) +
    (skill2?.item.system.value ?? 0) +
    (suite?.item.system.skill ?? 0) +
    manualDice;

  const needsWeapon = action === "attack" && !isActorOf(contextActor, "swarm");
  const canRoll = diceCount >= 1 && (!needsWeapon || Boolean(weapon));
  const usage: ActionUsage = { skills: (skill1 ? 1 : 0) + (skill2 ? 1 : 0), suite: Boolean(suite) };

  const handleRoll = async () => {
    if (!canRoll) return;

    if (action === "initiative" && !combatantOf(contextActor)) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.NotInCombat"));
      return;
    }

    if (consumeSlot && combatant) {
      if (!isConflictAction(action)) return;
      if (simpleActionsEnabled() && usage.suite && usage.skills < 1) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.SuiteRequiresSkill"));
        return;
      }
      const errorKey = actionBudgetError(combatant.system, usage);
      if (errorKey) {
        ui.notifications.warn(game.i18n.localize(errorKey));
        return;
      }
    }

    const result = await evaluateAd6Roll({ diceCount, modifier });
    const rolledSuccesses = result.successes;
    const successes = rolledSuccesses + manualSuccesses;
    const heightened = consumeSlot && isConflictAction(action) && actionIsHeightened(action);

    if (action === "initiative") {
      const applied = await applyInitiative(contextActor, successes, diceCount);
      if (!applied) return;
    }

    const incomingAttack = incomingAttackOf(action, successes, incoming, weapon?.item, contextActor, calledShot, {
      active: penetrationActive,
      value: penetrationValue,
    });

    await postActionCard({
      actor: contextActor,
      action,
      title: actionCardTitle(contextActor, action, heightened),
      modifier,
      diceCount,
      dice: result.dice,
      rolledSuccesses,
      bonusSuccesses: manualSuccesses,
      successes,
      roll: result.roll,
      skillNames: sourcedMethodNames(skill1, skill2, suite, swarmDice, contextActor),
      incoming: incomingAttack,
      heightened,
      speed: action === "initiative" ? actorSpeed(contextActor) : undefined,
    });

    if (consumeSlot && combatant && isConflictAction(action)) {
      await spendRoundUses(combatant, action, usage);
    }

    onClose();
  };

  return (
    <Stack pad={4} gap={4}>
      <ActionSelect
        value={lockedAction ?? action}
        disabled={Boolean(lockedAction)}
        conflictOnly={consumeSlot}
        onChange={setAction}
      />
      {incoming && <IncomingSummary incoming={incoming} />}
      <Stack direction="row" gap={2}>
        <SkillSelect
          labelKey="ROBOTECH.Roll.SelectSkill1"
          value={skill1Id}
          skills={skillItems}
          allowNone
          onChange={setSkill1Id}
        />
        <SkillSelect
          labelKey="ROBOTECH.Roll.SelectSkill2"
          value={skill2Id}
          skills={skillItems.filter((skill) => skill.key !== skill1Id)}
          allowNone
          onChange={setSkill2Id}
        />
      </Stack>
      <SuiteSelect value={suiteId} suites={suiteItems} onChange={setSuiteId} />
      {consumeSlot && simpleActionsEnabled() ? (
        <Text variant="label" color="muted">
          {game.i18n.localize("ROBOTECH.Combat.SuiteRequiresSkill")}
        </Text>
      ) : null}
      {action === "attack" && <WeaponSelect value={weaponId} weapons={weaponItems} onChange={handleWeaponChange} />}
      {action === "attack" && (
        <AttackOptions
          calledShot={calledShot}
          onCalledShotChange={setCalledShot}
          penetrationActive={penetrationActive}
          penetrationValue={penetrationValue}
          onPenetrationActiveChange={setPenetrationActive}
          onPenetrationValueChange={setPenetrationValue}
        />
      )}

      <Divider orientation="horizontal" />

      <ModifierRow modifier={modifier} onChange={setModifier} />
      {livingVessels > 0 && <SwarmDiceRow value={swarmDice} max={livingVessels} onChange={setSwarmDice} />}
      <BonusRow
        dice={manualDice}
        successes={manualSuccesses}
        onDiceChange={setManualDice}
        onSuccessesChange={setManualSuccesses}
      />

      <Card direction="row" align="between" tone="primary">
        <Text variant="label" color="secondary">
          {game.i18n.localize("ROBOTECH.Roll.TotalDice")}:
        </Text>
        <Text variant="title" color="primary">
          {Math.max(0, diceCount)}d6
        </Text>
        <Button size="large" variant="primary" onClick={() => void handleRoll()} disabled={!canRoll}>
          {game.i18n.localize("ROBOTECH.Roll.Roll")}
        </Button>
      </Card>
    </Stack>
  );
}

function ActionSelect({
  value,
  disabled,
  conflictOnly,
  onChange,
}: {
  value: ActionValue;
  disabled: boolean;
  conflictOnly: boolean;
  onChange: (value: ActionValue) => void;
}): JSX.Element {
  const options = conflictOnly ? CONFLICT_ACTION_OPTIONS : ACTION_OPTIONS;
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
              if (isConflictAction(next)) onChange(next);
              return;
            }
            if (isChoiceValue(ACTION_OPTIONS, next)) onChange(next);
          }}
        >
          {phases.map((phase) => (
            <optgroup key={phase.value} label={game.i18n.localize(phase.labelKey)}>
              {options
                .filter((option) => option.phase === phase.value)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {game.i18n.localize(option.labelKey)}
                  </option>
                ))}
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

function AttackOptions({
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
          onValueChange={(value) => onPenetrationValueChange(value ?? 0)}
        />
      </Stack>
    </Stack>
  );
}

function IncomingSummary({ incoming }: { incoming: IncomingAttack }): JSX.Element {
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

function SkillSelect({
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
      <Select width="full" value={value} onChange={(event) => onChange(event.target.value)}>
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

function SuiteSelect({
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
      <Select width="full" value={value} onChange={(event) => onChange(event.target.value)}>
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

function WeaponSelect({
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
      <Select width="full" value={value} onChange={(event) => onChange(event.target.value)}>
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

function ModifierRow({
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

function BonusRow({
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
      <Stepper
        label={`${game.i18n.localize("ROBOTECH.Roll.ManualDice")}:`}
        value={dice}
        min={-5}
        onChange={onDiceChange}
      />
      <Divider orientation="vertical" />
      <Stepper
        label={`${game.i18n.localize("ROBOTECH.Roll.ManualSuccesses")}:`}
        value={successes}
        min={-5}
        onChange={onSuccessesChange}
      />
    </Card>
  );
}

function SwarmDiceRow({
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
      <Stepper
        label={game.i18n.localize("ROBOTECH.Roll.SwarmVessels")}
        title={game.i18n.localize("ROBOTECH.Roll.SwarmVesselsHint")}
        value={value}
        min={1}
        max={max}
        onChange={onChange}
      />
    </Card>
  );
}

function Stepper({
  label,
  title,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  title?: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
}): JSX.Element {
  const nextMax = max ?? Number.POSITIVE_INFINITY;
  return (
    <Stack direction="row" gap={2} align="center" justify="between" grow>
      <Label title={title}>{label}</Label>
      <Stack direction="row" gap={2} align="center" shrink>
        <Button
          size="icon"
          variant="outline"
          title={game.i18n.localize("ROBOTECH.Buttons.Decrement")}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          -
        </Button>
        <Text variant="mono" color="primary" align="center">
          {value}
        </Text>
        <Button
          size="icon"
          variant="outline"
          title={game.i18n.localize("ROBOTECH.Buttons.Increment")}
          onClick={() => onChange(Math.min(nextMax, value + 1))}
        >
          +
        </Button>
      </Stack>
    </Stack>
  );
}

function dieTextColor(successes: number): "green" | "amber" | "danger" {
  if (successes >= 2) return "green";
  if (successes === 1) return "amber";
  return "danger";
}

function actionCardTitle(actor: Actor, action: ActionValue, heightened: boolean): string {
  const fallbackKey = ACTION_OPTIONS[0]?.labelKey ?? "";
  const actionLabel = game.i18n.localize(
    ACTION_OPTIONS.find((option) => option.value === action)?.labelKey ?? fallbackKey,
  );
  const key = heightened ? "ROBOTECH.Roll.HeightenedTitle" : "ROBOTECH.Roll.RollTitle";
  return game.i18n.localize(key, { action: actionLabel, name: actor.name });
}

function incomingAttackOf(
  action: ActionValue,
  successes: number,
  incoming: IncomingAttack | undefined,
  weapon: ItemOf<"weapon"> | undefined,
  contextActor: Actor,
  calledShot: boolean,
  penetration: WeaponAmount,
): IncomingAttack | undefined {
  if (action === "defend") return incoming;
  if (action !== "attack") return undefined;
  if (weapon) {
    return { ...weaponAttackStats(weapon, penetration), attackSuccesses: successes, calledShot };
  }
  if (isActorOf(contextActor, "swarm")) {
    const damageType = contextActor.system.damageClass;
    const tags: WeaponTag[] = [
      {
        id: "damage",
        label: game.i18n.localize(`ROBOTECH.Damage.DamageClass.${damageType}`),
        color: "red",
      },
    ];
    if (penetration.active) {
      tags.push({
        id: "penetration",
        label: game.i18n.localize("ROBOTECH.Item.Property.Penetration.tag", { val: penetration.value }),
        color: "amber",
        title: game.i18n.localize("ROBOTECH.Item.Property.Penetration.name"),
      });
    }
    return {
      weaponName: contextActor.name,
      damageType,
      armorPenetration: penetration.active ? penetration.value : 0,
      multiplier: 1,
      multiplierTargetType: null,
      tags,
      attackSuccesses: successes,
      calledShot,
    };
  }
  return undefined;
}

function weaponPenetrationOf(weapon: ItemOf<"weapon"> | undefined): WeaponAmount {
  const penetration = weapon?.system.properties.penetration;
  return {
    active: penetration?.active ?? false,
    value: penetration?.value ?? 0,
  };
}

function combatantFromPrefill(prefill: ActionCenterPrefill | undefined): Combatant | undefined {
  const id = prefill?.combatantId;
  if (!id) return undefined;
  return game.combat?.combatants.get(id);
}

function defaultCombatAction(consumeSlot: boolean): ActionValue {
  if (!consumeSlot || !game.combat) return "assist";
  const phase = combatPhaseOf(game.combat);
  return CONFLICT_ACTION_OPTIONS.find((option) => option.phase === phase)?.value ?? "attack";
}

function actionIsHeightened(action: ActionValue): boolean {
  if (!game.combat || !isConflictAction(action)) return false;
  const phase = combatPhaseOf(game.combat);
  if (phase === "communication") return false;
  return isHeightened(action, phase);
}

function sourcedOptionsOf<T extends ItemType>(actors: Actor[], type: T): SourcedOption<T>[] {
  const options: SourcedOption<T>[] = [];
  for (const actor of actors) {
    const uuid = actor.uuid;
    if (!uuid) continue;
    for (const item of filterItemsOf(actor, type)) {
      if (isFullyDestroyed(item) || !item.id) continue;
      options.push({
        key: `${uuid}:${item.id}`,
        item,
        sourceName: actor.name,
        sourceUuid: uuid,
      });
    }
  }
  return options.sort((a, b) => a.item.name.localeCompare(b.item.name));
}

function prefillSkillKey(skills: SourcedOption<"skill">[], contextActor: Actor, prefillId?: string): string {
  if (!prefillId) return "";
  return skills.find((skill) => skill.item.id === prefillId && skill.sourceUuid === contextActor.uuid)?.key ?? "";
}

function livingSwarmCount(actor: Actor): number {
  return isActorOf(actor, "swarm") ? actor.system.vessels.value : 0;
}

function optionLabel(name: string, value: number, source: string): string {
  return game.i18n.localize("ROBOTECH.Roll.OptionWithSource", { name, value, source });
}

function sourcedMethodNames(
  skill1: SourcedOption<"skill"> | undefined,
  skill2: SourcedOption<"skill"> | undefined,
  suite: SourcedOption<"equipment_suite"> | undefined,
  swarmDice: number,
  contextActor: Actor,
): string[] {
  const names: string[] = [];
  if (swarmDice > 0 && isActorOf(contextActor, "swarm")) {
    names.push(optionLabel(game.i18n.localize("ROBOTECH.Roll.SwarmVessels"), swarmDice, contextActor.name));
  }
  if (skill1) names.push(optionLabel(skill1.item.name, skill1.item.system.value, skill1.sourceName));
  if (skill2) names.push(optionLabel(skill2.item.name, skill2.item.system.value, skill2.sourceName));
  if (suite) names.push(optionLabel(suite.item.name, suite.item.system.skill, suite.sourceName));
  return names;
}

async function resolveSuiteActors(contextActor: Actor, crew: ActorOf<"character">[]): Promise<Actor[]> {
  if (isActorOf(contextActor, "character")) return [contextActor];
  if (isActorOf(contextActor, "vessel")) return [contextActor, ...crew];
  if (isActorOf(contextActor, "swarm")) {
    const vessels = await memberVesselsOf(contextActor);
    return [...vessels, ...crew];
  }
  return crew;
}

async function resolveWeaponActors(contextActor: Actor): Promise<Actor[]> {
  if (isActorOf(contextActor, "swarm")) return memberVesselsOf(contextActor);
  return [contextActor];
}

export class ActionCenterApp extends ReactDialog {
  constructor(
    private contextActor: Actor,
    private items: ActionCenterItems,
    private prefill?: ActionCenterPrefill,
    options: AppOptions = {},
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    id: "robotech-action-center",
    classes: ["robotech", "dialog", "action-center"],
    position: { width: 480, height: "auto" },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "ROBOTECH.Roll.Title",
      resizable: false,
    },
  };

  protected override renderContent(): JSX.Element {
    return (
      <ActionCenterContent
        contextActor={this.contextActor}
        items={this.items}
        prefill={this.prefill}
        onClose={() => void this.close()}
      />
    );
  }

  override _onClose(options: CloseOptions): void {
    if (currentApp === this) currentApp = null;
    super._onClose(options);
  }
}

let currentApp: ActionCenterApp | null = null;

export async function openActionCenter(contextActor: Actor, prefill?: ActionCenterPrefill): Promise<void> {
  const crew = await resolveLinkedCharacters(contextActor);
  if (isActorOf(contextActor, "swarm")) {
    if (livingSwarmCount(contextActor) < 1) {
      ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.NoSwarmVessels"));
      return;
    }
  } else if (crew.length === 0) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.NoVesselCrew"));
    return;
  }

  const suiteActors = await resolveSuiteActors(contextActor, crew);
  const weaponActors = await resolveWeaponActors(contextActor);
  const items: ActionCenterItems = {
    skills: sourcedOptionsOf(crew, "skill"),
    suites: sourcedOptionsOf(suiteActors, "equipment_suite"),
    weapons: sourcedOptionsOf(weaponActors, "weapon"),
  };
  if (currentApp) await currentApp.close();
  currentApp = new ActionCenterApp(contextActor, items, prefill);
  void currentApp.render(true);
}
