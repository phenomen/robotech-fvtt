import type Actor from "@client/documents/actor.mjs";
import type Combatant from "@client/documents/combatant.mjs";
import { useState } from "react";
import type { JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import {
  ActionSelect,
  AttackOptions,
  BonusRow,
  IncomingSummary,
  ModifierRow,
  SkillSelect,
  SuiteSelect,
  SwarmDiceRow,
  SynergyFooter,
  WeaponSelect,
} from "@/components/blocks/ActionCenterControls";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { CONFLICT_ACTION_OPTIONS, isConflictAction } from "@/config/options";
import type { ActionValue, RollModifierValue } from "@/config/options";
import type { ItemOf, WeaponAmount } from "@/models";
import type { ActionUsage } from "@/models/combat";
import type { AppOptions, CloseOptions } from "@/types/application";
import {
  livingSwarmCount,
  prefillSkillKey,
  resolveSuiteActors,
  resolveWeaponActors,
  sourcedMethodNames,
  sourcedOptionsOf,
} from "@/utils/actionCenterItems";
import type { ActionCenterItems } from "@/utils/actionCenterItems";
import { actionCardTitle, actionFlagsOf, postActionCard } from "@/utils/actionChat";
import type { IncomingAttack } from "@/utils/actionChat";
import {
  actorSpeed,
  actionBudgetError,
  actionIsPushed,
  applyInitiative,
  combatantOf,
  combatPhaseOf,
  simpleActionsEnabled,
  spendRoundUses,
} from "@/utils/combat";
import { isActorOf, resolveLinkedCharacters } from "@/utils/documents";
import { evaluateAd6Roll } from "@/utils/evaluateAd6Roll";
import { remainingSwarmDice } from "@/utils/swarmUtils";
import { applySynergy } from "@/utils/synergy";
import { incomingAttackOf } from "@/utils/weaponUtils";

export interface ActionCenterPrefill {
  action?: ActionValue;
  skill1Id?: string;
  incoming?: IncomingAttack;
  combatantId?: string;
  synergyMessage?: foundry.documents.ChatMessage;
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
  const synergyFlags = prefill?.synergyMessage ? actionFlagsOf(prefill.synergyMessage) : null;
  const isSynergy = Boolean(synergyFlags);
  const lockedAction = lockedActionOf(prefill, isSynergy);

  const { skills: skillItems, suites: suiteItems, weapons: weaponItems } = items;

  const [action, setAction] = useState<ActionValue>(
    lockedAction ??
      (isSynergy && synergyFlags ? defaultSynergyAction(synergyFlags.action) : defaultCombatAction(consumeSlot))
  );
  const [skill1Id, setSkill1Id] = useState(() => prefillSkillKey(skillItems, contextActor, prefill?.skill1Id));
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
  const isSwarm = isActorOf(contextActor, "swarm");
  const swarmDiceMax = remainingSwarmDice(livingVessels, combatant?.system.diceUsed ?? 0);
  const [swarmDice, setSwarmDice] = useState<number>(swarmDiceMax);
  const [transferred, setTransferred] = useState(() =>
    synergyFlags ? Math.max(1, Math.floor(synergyFlags.successes / 2)) : 1
  );
  const [pending, setPending] = useState(false);

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

  const combinedDice = Math.min(swarmDice, swarmDiceMax);
  const diceCount =
    combinedDice +
    (skill1?.item.system.value ?? 0) +
    (skill2?.item.system.value ?? 0) +
    (suite?.item.system.skill ?? 0) +
    manualDice;

  const needsWeapon = action === "attack" && !isSwarm;
  const canRoll = diceCount >= 1 && (!needsWeapon || Boolean(weapon));
  const skillPicks = (skill1 ? 1 : 0) + (skill2 ? 1 : 0);
  const usage: ActionUsage = {
    dice: isSwarm ? combinedDice : 0,
    skills: isSwarm && consumeSlot ? 1 : skillPicks,
    suite: Boolean(suite),
  };
  const sourceSuccesses = synergyFlags?.successes ?? 0;
  const moved = transferred;
  const remaining = Math.max(0, sourceSuccesses - moved);
  const canConfirm =
    isSynergy &&
    isConflictAction(action) &&
    action !== synergyFlags?.action &&
    moved >= 1 &&
    moved <= sourceSuccesses &&
    (!needsWeapon || Boolean(weapon));
  const pushedSynergy = isSynergy && (Boolean(synergyFlags?.pushed) || actionIsPushed(action));

  const handleRoll = async (): Promise<void> => {
    if (!canRoll || pending) {
      return;
    }

    if (action === "initiative" && !combatantOf(contextActor)) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.NotInCombat"));
      return;
    }

    if (consumeSlot && combatant) {
      if (!isConflictAction(action)) {
        return;
      }
      if (simpleActionsEnabled() && usage.suite && usage.skills < 1) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.SuiteRequiresSkill"));
        return;
      }
      const errorKey = actionBudgetError(combatant.system, usage, isSwarm);
      if (errorKey) {
        ui.notifications.warn(game.i18n.localize(errorKey));
        return;
      }
    }

    setPending(true);
    try {
      await executeRoll();
    } catch (error: unknown) {
      setPending(false);
      throw error;
    }
    setPending(false);
  };

  const executeRoll = async (): Promise<void> => {
    const result = await evaluateAd6Roll({ diceCount, modifier });
    const rolledSuccesses = result.successes;
    const successes = rolledSuccesses + manualSuccesses;
    const pushed = consumeSlot && isConflictAction(action) && actionIsPushed(action);

    if (action === "initiative") {
      const applied = await applyInitiative(contextActor, successes, diceCount);
      if (!applied) {
        return;
      }
    }

    const incomingAttack = incomingAttackOf(action, successes, incoming, weapon?.item, contextActor, calledShot, {
      active: penetrationActive,
      value: penetrationValue,
    });

    await postActionCard({
      action,
      actor: contextActor,
      bonusSuccesses: manualSuccesses,
      dice: result.dice,
      diceCount,
      fromCombat: consumeSlot,
      incoming: incomingAttack,
      modifier,
      pushed,
      roll: result.roll,
      rolledSuccesses,
      skillNames: sourcedMethodNames(skill1, skill2, suite, combinedDice, contextActor),
      speed: action === "initiative" ? actorSpeed(contextActor) : undefined,
      successes,
      title: actionCardTitle(contextActor, action, pushed),
    });

    if (consumeSlot && combatant && isConflictAction(action)) {
      await spendRoundUses(combatant, action, usage);
    }

    onClose();
  };

  const handleSynergy = async (): Promise<void> => {
    const message = prefill?.synergyMessage;
    if (!message || !canConfirm || pending || !isConflictAction(action)) {
      return;
    }
    setPending(true);
    try {
      const incomingAttack = incomingAttackOf(action, moved, undefined, weapon?.item, contextActor, calledShot, {
        active: penetrationActive,
        value: penetrationValue,
      });
      const applied = await applySynergy({
        action,
        actor: contextActor,
        incoming: incomingAttack,
        message,
        transferred: moved,
      });
      if (applied) {
        onClose();
      }
    } catch (error: unknown) {
      setPending(false);
      throw error;
    }
    setPending(false);
  };

  return (
    <Stack pad={4} gap={4}>
      {isSynergy ? (
        <Text variant="label" color="muted">
          {game.i18n.localize("ROBOTECH.Roll.SynergyHint")}
        </Text>
      ) : null}
      <ActionSelect
        value={lockedAction ?? action}
        disabled={Boolean(lockedAction)}
        conflictOnly={consumeSlot || isSynergy}
        exclude={isSynergy ? synergyFlags?.action : undefined}
        onChange={setAction}
      />
      {incoming && !isSynergy && <IncomingSummary incoming={incoming} />}
      {isSynergy ? null : (
        <>
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
        </>
      )}
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

      {isSynergy ? (
        <SynergyFooter
          sourceSuccesses={sourceSuccesses}
          transferred={moved}
          remaining={remaining}
          pushed={pushedSynergy}
          canConfirm={canConfirm}
          pending={pending}
          onTransferredChange={setTransferred}
          onConfirm={() => void handleSynergy()}
        />
      ) : (
        <>
          <Divider orientation="horizontal" />

          <ModifierRow modifier={modifier} onChange={setModifier} />
          {swarmDiceMax > 0 && <SwarmDiceRow value={combinedDice} max={swarmDiceMax} onChange={setSwarmDice} />}
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
            <Button size="large" variant="primary" onClick={() => void handleRoll()} disabled={!canRoll || pending}>
              {game.i18n.localize("ROBOTECH.Roll.Roll")}
            </Button>
          </Card>
        </>
      )}
    </Stack>
  );
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
  if (!id) {
    return undefined;
  }
  return game.combat?.combatants.get(id);
}

function lockedActionOf(prefill: ActionCenterPrefill | undefined, synergy: boolean): ActionValue | null {
  if (synergy) {
    return null;
  }
  if (prefill?.incoming) {
    return "defend";
  }
  return prefill?.action ?? null;
}

function defaultCombatAction(consumeSlot: boolean): ActionValue {
  if (!consumeSlot || !game.combat) {
    return "assist";
  }
  const phase = combatPhaseOf(game.combat);
  return CONFLICT_ACTION_OPTIONS.find((option) => option.phase === phase)?.value ?? "attack";
}

function defaultSynergyAction(source: ActionValue): ActionValue {
  const phaseDefault = defaultCombatAction(true);
  if (phaseDefault !== source && isConflictAction(phaseDefault)) {
    return phaseDefault;
  }
  return CONFLICT_ACTION_OPTIONS.find((option) => option.value !== source)?.value ?? "attack";
}

export class ActionCenterApp extends ReactDialog {
  constructor(
    private readonly contextActor: Actor,
    private readonly items: ActionCenterItems,
    private readonly prefill?: ActionCenterPrefill,
    options: AppOptions = {}
  ) {
    super({
      ...options,
      window: {
        ...options.window,
        title: prefill?.synergyMessage ? "ROBOTECH.Roll.SynergyTitle" : "ROBOTECH.Roll.Title",
      },
    });
  }

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "dialog", "action-center"],
    id: "robotech-action-center",
    position: { height: "auto", width: 480 },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      resizable: false,
      title: "ROBOTECH.Roll.Title",
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
    if (currentApp === this) {
      currentApp = null;
    }
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
  if (currentApp) {
    await currentApp.close();
  }
  currentApp = new ActionCenterApp(contextActor, items, prefill);
  void currentApp.render(true);
}
