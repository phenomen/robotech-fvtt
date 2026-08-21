import { openActionCenter } from "@/components/apps/ActionCenterApp";
import { type CombatPhaseValue } from "@/config/options";
import {
  announceCombatEnd,
  announceRoundPhase,
  applyCombatType,
  clearManualSort,
  clearRoundUses,
  combatPhaseOf,
  compareCombatants,
  firstLivingIndex,
  lastLivingIndex,
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
    if (data && typeof data === "object") applyCombatType(data);
    return super._initializeSource(...args);
  }

  _canChangeRound(user: { isGM: boolean }): boolean {
    return user.isGM;
  }

  _canChangeTurn(user: { isGM: boolean }): boolean {
    if (user.isGM) return true;
    return this.combatant?.isOwner ?? false;
  }

  override _sortCombatants(a: CombatantBase, b: CombatantBase): number {
    return compareCombatants(a, b);
  }

  override async startCombat(): Promise<this> {
    this._playCombatSound("startEncounter");
    const updateData = { round: 1, turn: null, "system.phase": "communication" };
    foundry.helpers.Hooks.callAll("combatStart", this, updateData);
    await this.update(updateData);
    await foundry.documents.ActiveEffect.registry.refresh("combatStart", { combat: this });
    return this;
  }

  override async nextTurn(): Promise<this> {
    if (this.round === 0) return this.startCombat();

    const phase = combatPhaseOf(this);
    if (phase === "communication") {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return this.setPhase("support");
    }

    const next = nextLivingIndex(this, this.turn ?? -1);
    if (next === null) {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return this.advancePhase();
    }

    return this.setTurn(next, 1);
  }

  override async previousTurn(): Promise<this> {
    if (this.round === 0) return this;

    const phase = combatPhaseOf(this);
    if (phase === "communication") {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return this.previousRound();
    }

    const previous = previousLivingIndex(this, this.turn ?? 0);
    if (previous === null) {
      if (!game.user?.isGM) {
        ui.notifications.warn(game.i18n.localize("ROBOTECH.Combat.WaitForPhase"));
        return this;
      }
      return this.rewindPhase();
    }

    return this.setTurn(previous, -1);
  }

  override async nextRound(): Promise<this> {
    if (!game.user?.isGM) return this;
    await clearRoundUses(this);
    const nextRound = this.round + 1;
    const updateData = { round: nextRound, turn: null, "system.phase": "communication" };
    const advanceTime = this.getTimeDelta(this.round, this.turn, nextRound, null);
    const updateOptions = { direction: 1, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatRound", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  override async previousRound(): Promise<this> {
    if (!game.user?.isGM || this.round === 0) return this;
    await clearRoundUses(this);
    const previousRound = this.round - 1;
    const updateData = { round: previousRound, turn: null, "system.phase": "communication" };
    const advanceTime = this.getTimeDelta(this.round, this.turn, previousRound, null);
    const updateOptions = { direction: -1, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatRound", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  override async rollInitiative(...args: Parameters<RollInitiative>): Promise<this> {
    const ids = args[0];
    const list = typeof ids === "string" ? [ids] : ids;
    const id = list[0];
    if (!id) return this;
    const combatant = this.combatants.get(id);
    const actor = combatant?.actor;
    if (!actor) return this;
    await openActionCenter(actor, { action: "initiative" });
    return this;
  }

  async setPhase(phase: CombatPhaseValue): Promise<this> {
    await clearManualSort(this);
    const turn = phase === "communication" ? null : firstLivingIndex(this);
    const updateData = { "system.phase": phase, turn };
    const updateOptions = { direction: 1 };
    foundry.helpers.Hooks.callAll("combatTurn", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  private async advancePhase(): Promise<this> {
    const next = nextPhaseOf(combatPhaseOf(this));
    if (!next) return this.nextRound();
    return this.setPhase(next);
  }

  private async rewindPhase(): Promise<this> {
    const previous = previousPhaseOf(combatPhaseOf(this));
    if (!previous) return this.previousRound();
    await clearManualSort(this);
    const turn = previous === "communication" ? null : lastLivingIndex(this);
    const updateData = { "system.phase": previous, turn };
    const updateOptions = { direction: -1 };
    foundry.helpers.Hooks.callAll("combatTurn", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  private async setTurn(turn: number, direction: 1 | -1): Promise<this> {
    const advanceTime = this.getTimeDelta(this.round, this.turn, this.round, turn);
    const updateData = { round: this.round, turn };
    const updateOptions = { direction, worldTime: { delta: advanceTime } };
    foundry.helpers.Hooks.callAll("combatTurn", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }

  override _onUpdate(...args: Parameters<OnUpdate>): void {
    super._onUpdate(...args);
    if (!this.started) return;
    const [changed, options] = args;
    if (isRewind(options)) return;
    const phase = foundry.utils.getProperty(changed, "system.phase");
    const phaseChanged = typeof phase === "string";
    const roundChanged = "round" in changed && typeof changed.round === "number";
    if (!phaseChanged && !roundChanged) return;
    announceRoundPhase(this.round, phaseChanged ? phase : combatPhaseOf(this));
  }

  override _onDelete(...args: Parameters<OnDelete>): void {
    const started = this.started;
    super._onDelete(...args);
    if (started) announceCombatEnd();
  }
}

function isRewind(options: object): boolean {
  return "direction" in options && options.direction === -1;
}
