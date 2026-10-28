import { openActionCenter } from "@/components/apps/ActionCenterApp";
import type { CombatPhaseValue } from "@/config/options";
import {
  announceCombatEnd,
  announceRoundPhase,
  applyCombatType,
  changePhase,
  clearRoundUses,
  combatPhaseOf,
  compareCombatants,
  nextLivingIndex,
  nextPhaseOf,
  previousLivingIndex,
  previousPhaseOf,
} from "@/utils/combat";

type CombatBase = foundry.documents.Combat;
type CombatantBase = foundry.documents.Combatant;
type InitSource = CombatBase["_initializeSource"];
type RollInitiative = CombatBase["rollInitiative"];
type OnUpdate = CombatBase["_onUpdate"];
type OnDelete = CombatBase["_onDelete"];

export class RobotechCombat extends foundry.documents.Combat {
  protected override _initializeSource(...args: Parameters<InitSource>): ReturnType<InitSource> {
    const data = args[0];
    if (data && typeof data === "object") {
      applyCombatType(data);
    }
    return super._initializeSource(...args);
  }

  /**
   * The server only runs core's permissive `_canChangeTurn`, so this is a client-side courtesy check:
   * a player may end the turn of a combatant they own, not someone else's.
   */
  private canChangeTurn(): boolean {
    return game.user?.isGM === true || (this.combatant?.isOwner ?? false);
  }

  override _sortCombatants(a: CombatantBase, b: CombatantBase): number {
    return compareCombatants(a, b);
  }

  override async startCombat(): Promise<this> {
    this._playCombatSound("startEncounter");
    const updateData = { round: 1, "system.phase": "communication", turn: null };
    foundry.helpers.Hooks.callAll("combatStart", this, updateData);
    await this.update(updateData);
    await foundry.documents.ActiveEffect.registry.refresh("combatStart", { combat: this });
    return this;
  }

  override async nextTurn(): Promise<this> {
    if (this.round === 0) {
      return await this.startCombat();
    }

    const phase = combatPhaseOf(this);
    if (phase === "communication") {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return await this.setPhase("support");
    }

    const next = nextLivingIndex(this, this.turn ?? -1);
    if (next === null) {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return await this.advancePhase();
    }

    return await this.setTurn(next, 1);
  }

  override async previousTurn(): Promise<this> {
    if (this.round === 0) {
      return this;
    }

    const phase = combatPhaseOf(this);
    if (phase === "communication") {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return await this.previousRound();
    }

    const previous = previousLivingIndex(this, this.turn ?? 0);
    if (previous === null) {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return await this.rewindPhase();
    }

    return await this.setTurn(previous, -1);
  }

  override async nextRound(): Promise<this> {
    if (!game.user?.isGM) {
      return this;
    }
    await clearRoundUses(this);
    const nextRound = this.round + 1,
      updateData = { round: nextRound, "system.phase": "communication", turn: null },
      advanceTime = this.getTimeDelta(this.round, this.turn, nextRound, null),
      updateOptions = { direction: 1, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatRound", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  override async previousRound(): Promise<this> {
    if (!game.user?.isGM || this.round === 0) {
      return this;
    }
    await clearRoundUses(this);
    const previousRound = this.round - 1,
      updateData = { round: previousRound, "system.phase": "communication", turn: null },
      advanceTime = this.getTimeDelta(this.round, this.turn, previousRound, null),
      updateOptions = { direction: -1, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatRound", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  override async rollInitiative(...args: Parameters<RollInitiative>): Promise<this> {
    const ids = args[0],
      list = typeof ids === "string" ? [ids] : ids,
      id = list[0];
    if (!id) {
      return this;
    }
    const combatant = this.combatants.get(id),
      actor = combatant?.actor;
    if (!actor) {
      return this;
    }
    await openActionCenter(actor, { action: "initiative" });
    return this;
  }

  async setPhase(phase: CombatPhaseValue): Promise<this> {
    await changePhase(this, phase);
    return this;
  }

  private async advancePhase(): Promise<this> {
    const next = nextPhaseOf(combatPhaseOf(this));
    if (!next) {
      return await this.nextRound();
    }
    return await this.setPhase(next);
  }

  private async rewindPhase(): Promise<this> {
    const previous = previousPhaseOf(combatPhaseOf(this));
    if (!previous) {
      return await this.previousRound();
    }
    return await this.setPhase(previous);
  }

  private async setTurn(turn: number, direction: 1 | -1): Promise<this> {
    if (!this.canChangeTurn()) {
      ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.NotYourTurn"));
      return this;
    }
    const advanceTime = this.getTimeDelta(this.round, this.turn, this.round, turn),
      updateData = { round: this.round, turn },
      updateOptions = { direction, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatTurn", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  /** Set by `_onUpdate` while core runs turn events for an update that changed the phase. */
  private phaseShift: -1 | 0 | 1 = 0;

  /**
   * Core detects turn progress by comparing round and turn indexes. A phase change restarts the turn
   * order within the same round, which core reads as a rewind (forward) or a run of skipped turns
   * (backward), so phase changes dispatch their own events: the previous combatant's turn ends and the
   * new one's starts, clearing movement history for the TokenRuler.
   */
  override async _manageTurnEvents(): Promise<void> {
    const direction = this.phaseShift;
    this.phaseShift = 0;
    if (direction === 0 || !this.started || this.current.round !== this.previous.round) {
      await super._manageTurnEvents();
      return;
    }
    if (game.user?.isActiveGM) {
      await this.dispatchPhaseShift(direction);
    }
    foundry.helpers.Hooks.callAll("combatTurnChange", this, this.previous, this.current);
  }

  private async dispatchPhaseShift(direction: -1 | 1): Promise<void> {
    const { current, previous } = this,
      registry = foundry.documents.ActiveEffect.registry;
    if (direction === -1) {
      await registry.refresh("combatRewind", {
        actors: new Set(this.combatants.map((combatant) => combatant.actor).filter((actor) => actor !== null)),
        combat: this,
      });
      return;
    }
    const prior = previous.combatantId ? this.combatants.get(previous.combatantId) : undefined,
      next = this.combatant;
    if (prior && previous.turn !== null) {
      const context = { round: previous.round, skipped: false, turn: previous.turn };
      await this._onEndTurn(prior, context);
      await registry.refresh("turnEnd", { ...context, combat: this });
    }
    if (next && current.turn !== null) {
      const context = { round: current.round, skipped: false, turn: current.turn };
      await this._onStartTurn(next, context);
      await this._clearMovementHistoryOnStartTurn(next, context);
      await registry.refresh("turnStart", { ...context, combat: this });
    }
  }

  override _onUpdate(...args: Parameters<OnUpdate>): void {
    const [changedBefore, optionsBefore] = args;
    if (typeof foundry.utils.getProperty(changedBefore, "system.phase") === "string") {
      this.phaseShift = isRewind(optionsBefore) ? -1 : 1;
    }
    super._onUpdate(...args);
    // Core skips `_manageTurnEvents` when the turn and combatant stay the same; don't leak the flag.
    this.phaseShift = 0;
    if (!this.started) {
      return;
    }
    const [changed, options] = args;
    if (isRewind(options)) {
      return;
    }
    const phase = foundry.utils.getProperty(changed, "system.phase"),
      phaseChanged = typeof phase === "string",
      roundChanged = "round" in changed && typeof changed.round === "number";
    if (!phaseChanged && !roundChanged) {
      return;
    }
    announceRoundPhase(this.round, phaseChanged ? phase : combatPhaseOf(this));
  }

  override _onDelete(...args: Parameters<OnDelete>): void {
    const started = this.started;
    super._onDelete(...args);
    if (started) {
      announceCombatEnd();
    }
  }
}

function isRewind(options: object): boolean {
  return "direction" in options && options.direction === -1;
}
