import type Actor from "@client/documents/actor.mjs";
import type Combat from "@client/documents/combat.mjs";
import type Combatant from "@client/documents/combatant.mjs";

import {
  ACTION_OPTIONS,
  COMBAT_PHASE_OPTIONS,
  COMBAT_PHASE_VALUES,
  isChoiceValue,
  isConflictAction,
} from "@/config/options";
import type { ActionValue, CombatPhaseValue, ConflictActionValue, SlotPhaseValue } from "@/config/options";
import { MENTAL_BREAK_STATUS_ID, SLOWED_STATUS_ID } from "@/config/statuses";
import { SKILL_USES_PER_ROUND, SUITE_USES_PER_ROUND } from "@/models/combat";
import type { ActionLogEntry, ActionUsage, RoundUsage } from "@/models/combat";
import { optionalRuleEnabled } from "@/registry/settings";
import { isActorOf } from "@/utils/documents";

export const COMBAT_DOCUMENT_TYPE = "robotech";

/** Stamp the system subtype before Foundry applies the `base` DocumentTypeField initial. */
export function applyCombatType(data: object): void {
  if (!isCombatSource(data)) {
    return;
  }
  if (data.type === COMBAT_DOCUMENT_TYPE) {
    return;
  }
  data.type = COMBAT_DOCUMENT_TYPE;
}

function isCombatSource(data: object): data is { type?: unknown } {
  return foundry.utils.isPlainObject(data);
}

export function actorSpeed(actor: Actor | null): number {
  if (!actor) {
    return 0;
  }
  if (isActorOf(actor, "character") || isActorOf(actor, "vessel") || isActorOf(actor, "swarm")) {
    return actor.system.speed;
  }
  return 0;
}

export function isSlowed(actor: Actor | null): boolean {
  return !!actor?.statuses.has(SLOWED_STATUS_ID);
}

export function isMentalBreak(actor: Actor | null): boolean {
  return !!actor?.statuses.has(MENTAL_BREAK_STATUS_ID);
}

export function combatPhaseOf(combat: Combat): CombatPhaseValue {
  const phase = combat.system.phase;
  if (isChoiceValue(COMBAT_PHASE_OPTIONS, phase)) {
    return phase;
  }
  return "communication";
}

function phaseIndex(phase: CombatPhaseValue | SlotPhaseValue | ""): number {
  if (!phase) {
    return -1;
  }
  return COMBAT_PHASE_VALUES.indexOf(phase);
}

export function nextPhaseOf(phase: CombatPhaseValue): CombatPhaseValue | null {
  const index = phaseIndex(phase);
  return COMBAT_PHASE_VALUES[index + 1] ?? null;
}

export function previousPhaseOf(phase: CombatPhaseValue): CombatPhaseValue | null {
  const index = phaseIndex(phase);
  if (index <= 0) {
    return null;
  }
  return COMBAT_PHASE_VALUES[index - 1] ?? null;
}

export function homePhaseOf(action: ConflictActionValue): SlotPhaseValue {
  const option = ACTION_OPTIONS.find((entry) => entry.value === action);
  if (!option || option.phase === "any") {
    return "support";
  }
  return option.phase;
}

export function isPushed(action: ConflictActionValue, phase: SlotPhaseValue): boolean {
  return phaseIndex(homePhaseOf(action)) > phaseIndex(phase);
}

/** Whether this action is Pushed in the current combat phase (earlier than its home phase). */
export function actionIsPushed(action: ActionValue): boolean {
  if (!game.combat || !isConflictAction(action)) {
    return false;
  }
  const phase = combatPhaseOf(game.combat);
  if (phase === "communication") {
    return false;
  }
  return isPushed(action, phase);
}

export function remainingSkills(usage: RoundUsage): number {
  return Math.max(0, SKILL_USES_PER_ROUND - usage.skillsUsed);
}

/** Optional rule: an equipment suite must be associated with a skill Action. */
export function simpleActionsEnabled(): boolean {
  return optionalRuleEnabled("simpleActions");
}

export function remainingSuites(usage: RoundUsage): number {
  return Math.max(0, SUITE_USES_PER_ROUND - (usage.suiteUsed ? 1 : 0));
}

/** Returns the i18n key of the first round-budget rule this usage would break, or null when allowed. */
export function actionBudgetError(used: RoundUsage, next: ActionUsage, swarm = false): string | null {
  if (next.skills > remainingSkills(used)) {
    return swarm ? "ROBOTECH.Swarm.ActionBudget" : "ROBOTECH.Combat.SkillBudget";
  }
  if (next.suite && remainingSuites(used) < 1) {
    return "ROBOTECH.Combat.SuiteBudget";
  }
  return null;
}

export function compareCombatants(a: Combatant, b: Combatant): number {
  const sortA = a.system.sort,
    sortB = b.system.sort;
  if (sortA !== null || sortB !== null) {
    return (sortA ?? 9999) - (sortB ?? 9999) || compareId(a, b);
  }

  const slowedA = isSlowed(a.actor),
    slowedB = isSlowed(b.actor);
  if (slowedA !== slowedB) {
    return slowedA ? 1 : -1;
  }

  const initA = a.initiative,
    initB = b.initiative,
    missingA = !Number.isFinite(initA),
    missingB = !Number.isFinite(initB);
  if (missingA !== missingB) {
    return missingA ? 1 : -1;
  }
  if (!(missingA || missingB) && initA !== initB) {
    return (initB ?? 0) - (initA ?? 0);
  }

  const poolDiff = (b.system.pool ?? 0) - (a.system.pool ?? 0);
  if (poolDiff) {
    return poolDiff;
  }

  const speedDiff = actorSpeed(b.actor) - actorSpeed(a.actor);
  if (speedDiff) {
    return speedDiff;
  }
  return compareId(a, b);
}

function compareId(a: Combatant, b: Combatant): number {
  const idA = a.id ?? "",
    idB = b.id ?? "";
  if (idA === idB) {
    return 0;
  }
  return idA > idB ? 1 : -1;
}

export function firstLivingIndex(combat: Combat): number | null {
  const index = combat.turns.findIndex((combatant) => !combatant.isDefeated);
  return index === -1 ? null : index;
}

export function nextLivingIndex(combat: Combat, fromTurn: number): number | null {
  for (let index = fromTurn + 1; index < combat.turns.length; index += 1) {
    if (!combat.turns[index]?.isDefeated) {
      return index;
    }
  }
  return null;
}

export function previousLivingIndex(combat: Combat, fromTurn: number): number | null {
  for (let index = fromTurn - 1; index >= 0; index -= 1) {
    if (!combat.turns[index]?.isDefeated) {
      return index;
    }
  }
  return null;
}

export function lastLivingIndex(combat: Combat): number | null {
  for (let index = combat.turns.length - 1; index >= 0; index -= 1) {
    if (!combat.turns[index]?.isDefeated) {
      return index;
    }
  }
  return null;
}

export function combatantOf(actor: Actor): Combatant | undefined {
  const combat = game.combat;
  if (!combat) {
    return undefined;
  }
  return combat.getCombatantsByActor(actor)[0];
}

export async function applyInitiative(actor: Actor, successes: number, pool: number): Promise<boolean> {
  const combatant = combatantOf(actor);
  if (!combatant) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.NotInCombat"));
    return false;
  }
  const combat = combatant.combat,
    activeId = combat?.combatant?.id;
  await combatant.update({ initiative: successes, "system.pool": pool });
  if (combat && activeId) {
    await keepActiveCombatant(combat, activeId);
  }
  return true;
}

/**
 * Core keeps the turn index, not the combatant, when the order is re-sorted. After a mid-phase
 * initiative change, point the turn back at whoever was acting.
 */
async function keepActiveCombatant(combat: Combat, activeId: string): Promise<void> {
  const index = combat.turns.findIndex((entry) => entry.id === activeId);
  if (index === -1 || index === combat.turn) {
    return;
  }
  await combat.update({ turn: index }, { turnEvents: false });
}

/** Spend skill and equipment-suite uses for this round on a combatant, logging the taken action. */
export async function spendRoundUses(
  combatant: Combatant,
  action: ConflictActionValue,
  usage: ActionUsage
): Promise<boolean> {
  const combat = game.combat;
  if (!combat) {
    ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.NotInCombat"));
    return false;
  }

  const currentPhase = combatPhaseOf(combat);
  if (currentPhase === "communication") {
    return false;
  }

  const used: RoundUsage = combatant.system,
    actor = combatant.actor,
    errorKey = actionBudgetError(used, usage, !!actor && isActorOf(actor, "swarm"));
  if (errorKey) {
    ui.notifications.warn(game.i18n.localize(errorKey));
    return false;
  }

  await combatant.update({
    "system.diceUsed": used.diceUsed + (usage.dice ?? 0),
    "system.log": [...used.log, { action, phase: currentPhase, pushed: isPushed(action, currentPhase) }],
    "system.skillsUsed": used.skillsUsed + usage.skills,
    "system.suiteUsed": used.suiteUsed || usage.suite,
  });
  return true;
}

/**
 * Moves the combat to another phase of the current round. Moving forward starts at the first living
 * combatant, moving back resumes at the last one; Communication has no active turn.
 */
export async function changePhase(combat: Combat, phase: CombatPhaseValue): Promise<void> {
  const current = combatPhaseOf(combat);
  if (phase === current) {
    return;
  }
  await clearManualSort(combat);
  const direction = phaseIndex(phase) < phaseIndex(current) ? -1 : 1,
    living = direction === 1 ? firstLivingIndex(combat) : lastLivingIndex(combat),
    turn = phase === "communication" ? null : living,
    updateData = { "system.phase": phase, turn },
    updateOptions = { direction };
  foundry.helpers.Hooks.callAll("combatTurn", combat, updateData, updateOptions);
  await combat.update(updateData, updateOptions);
}

export async function clearRoundUses(combat: Combat): Promise<void> {
  const updates = combat.combatants.map((combatant) => ({
    _id: combatant.id,
    "system.diceUsed": 0,
    "system.log": [],
    "system.skillsUsed": 0,
    "system.sort": null,
    "system.suiteUsed": false,
  }));
  if (updates.length === 0) {
    return;
  }
  await combat.updateEmbeddedDocuments("Combatant", updates);
}

export async function clearManualSort(combat: Combat): Promise<void> {
  const updates = combat.combatants
    .filter((combatant) => combatant.system.sort !== null)
    .map((combatant) => ({ _id: combatant.id, "system.sort": null }));
  if (updates.length === 0) {
    return;
  }
  await combat.updateEmbeddedDocuments("Combatant", updates);
}

export async function writeTurnOrder(combat: Combat, orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) => ({ _id: id, "system.sort": index }));
  if (updates.length === 0) {
    return;
  }
  // Keep the active combatant active rather than whoever lands on its old index.
  const activeId = combat.combatant?.id,
    activeIndex = activeId ? orderedIds.indexOf(activeId) : -1,
    combatTurn = activeIndex === -1 ? undefined : activeIndex;
  await combat.updateEmbeddedDocuments("Combatant", updates, { combatTurn });
}

export function phaseLabelOf(phase: CombatPhaseValue | SlotPhaseValue | ""): string {
  if (!phase) {
    return "";
  }
  const option = COMBAT_PHASE_OPTIONS.find((entry) => entry.value === phase);
  if (!option) {
    return phase;
  }
  return game.i18n.localize(option.labelKey);
}

export function takenActionLabel(entry: ActionLogEntry): string {
  const phase = phaseLabelOf(entry.phase),
    action = ACTION_OPTIONS.find((option) => option.value === entry.action)?.labelKey ?? entry.action,
    actionLabel = game.i18n.localize(action);
  if (entry.pushed) {
    return game.i18n.localize("ROBOTECH.Combat.TakenPushed", {
      action: actionLabel,
      phase,
      pushed: game.i18n.localize("ROBOTECH.Combat.Pushed"),
    });
  }
  return game.i18n.localize("ROBOTECH.Combat.TakenAction", { action: actionLabel, phase });
}

export function announceRoundPhase(round: number, phase: string): void {
  if (round < 1 || !isChoiceValue(COMBAT_PHASE_OPTIONS, phase)) {
    return;
  }
  ui.notifications.info(game.i18n.localize("ROBOTECH.Combat.RoundPhase", { n: round, phase: phaseLabelOf(phase) }));
}

export function announceCombatEnd(): void {
  ui.notifications.info(game.i18n.localize("ROBOTECH.Combat.EncounterResolved"));
}
