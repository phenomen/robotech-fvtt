import type Actor from "@client/documents/actor.mjs";

import type { IconTone } from "@/components/ui/Icon";
import type { ArmorClassValue } from "@/config/options";
import type { ActorOf } from "@/models";
import { syncDestroyedSlots } from "@/models/items/hardwareSlots";
import { postDamageCard } from "@/utils/actionChat";
import type { DamageBreakdown, DamageDistribution, IncomingAttack } from "@/utils/actionChat";
import { controlledTokenActor, isActorOf } from "@/utils/documents";
import {
  destroyedPathOf,
  hardwareItemsOf,
  hardwareSlotsOf,
  intactSlotsOf,
  isHardwareItem,
  markDestroyedSlots,
} from "@/utils/hardwareUtils";
import { applySwarmDamage } from "@/utils/swarmUtils";
import { countCheckedBoxes } from "@/utils/trackers";
import { appliedPenetrationOf, calcDamageCascade, effectiveArmorOf } from "@/utils/vesselUtils";
import type { CascadeResult } from "@/utils/vesselUtils";
import { flatWoundGroup, filledWoundStates } from "@/utils/woundUtils";

interface DamageTarget {
  armorClass: ArmorClassValue;
  resistance: number;
  targetArmor: number;
}

export interface DamageSink {
  id: string;
  kind: "structure" | "armor" | "wounds" | "hardware";
  labelKey: string;
  name?: string;
  icon: string;
  iconTone: IconTone;
  capacity: number;
  maxAssign: number;
  destroyed?: boolean[];
}

export interface DamageAmounts {
  structure: number;
  armor: number;
  wounds: number;
  hardware: Record<string, number[]>;
}

export interface DamagePreview {
  actor: Actor;
  incoming: IncomingAttack;
  defendSuccesses: number;
  cascade: CascadeResult;
  breakdown: DamageBreakdown;
  sinks: DamageSink[];
}

function emptyDamageAmounts(): DamageAmounts {
  return { armor: 0, hardware: {}, structure: 0, wounds: 0 };
}

export function assignedDamageOf(amounts: DamageAmounts): number {
  let total = amounts.structure + amounts.armor + amounts.wounds;
  for (const indexes of Object.values(amounts.hardware)) {
    total += indexes.length;
  }
  return total;
}

export function amountOf(sink: DamageSink, amounts: DamageAmounts): number {
  if (sink.kind === "hardware") {
    return amounts.hardware[sink.id]?.length ?? 0;
  }
  return amounts[sink.kind];
}

export function selectedSlotsOf(sink: DamageSink, amounts: DamageAmounts): number[] {
  return amounts.hardware[sink.id] ?? [];
}

export function damageSinksOf(actor: Actor, damage: number): DamageSink[] {
  if (isActorOf(actor, "character")) {
    return [
      {
        capacity: emptyWoundBoxes(actor),
        icon: "brawl-wound",
        iconTone: "danger",
        id: "wounds",
        kind: "wounds",
        labelKey: "ROBOTECH.Damage.Assign.Wounds",
        maxAssign: damage,
      },
    ];
  }
  if (isActorOf(actor, "swarm")) {
    return [
      {
        capacity: actor.system.structure.value,
        icon: "structure",
        iconTone: "green",
        id: "structure",
        kind: "structure",
        labelKey: "ROBOTECH.Damage.Assign.Structure",
        maxAssign: damage,
      },
    ];
  }
  if (isActorOf(actor, "vessel")) {
    const sinks: DamageSink[] = [
      {
        capacity: actor.system.structure.value,
        icon: "structure",
        iconTone: "green",
        id: "structure",
        kind: "structure",
        labelKey: "ROBOTECH.Damage.Assign.Structure",
        maxAssign: actor.system.structure.value,
      },
      {
        capacity: actor.system.armor.value,
        icon: "armor",
        iconTone: "teal",
        id: "armor",
        kind: "armor",
        labelKey: "ROBOTECH.Damage.Assign.Armor",
        maxAssign: actor.system.armor.value,
      },
    ];
    for (const item of hardwareItemsOf(actor)) {
      const id = item.id;
      if (!id) {
        continue;
      }
      const slots = hardwareSlotsOf(item);
      if (!slots) {
        continue;
      }
      const destroyed = syncDestroyedSlots(slots.value, slots.destroyed);
      const capacity = intactSlotsOf(item);
      sinks.push({
        capacity,
        destroyed,
        icon: "hardware-point",
        iconTone: "amber",
        id,
        kind: "hardware",
        labelKey: "ROBOTECH.Damage.Assign.Hardware",
        maxAssign: capacity,
        name: item.name,
      });
    }
    return sinks;
  }
  return [];
}

export function initialAmountsOf(): DamageAmounts {
  return emptyDamageAmounts();
}

function writeAmount(amounts: DamageAmounts, sink: DamageSink, value: number): DamageAmounts {
  if (sink.kind === "hardware") {
    return amounts;
  }
  return { ...amounts, [sink.kind]: Math.max(0, value) };
}

/** Assigns up to `requested` on a sink, taking leftover from unassigned points, then from structure. */
export function assignToSink(
  amounts: DamageAmounts,
  sink: DamageSink,
  requested: number,
  damage: number
): DamageAmounts {
  if (sink.kind === "hardware") {
    return amounts;
  }
  const current = amountOf(sink, amounts);
  const target = Math.max(0, Math.min(sink.maxAssign, requested));
  if (target <= current) {
    return writeAmount(amounts, sink, target);
  }

  let remaining = target - current;
  const unassigned = Math.max(0, damage - assignedDamageOf(amounts));
  const fromPool = Math.min(remaining, unassigned);
  remaining -= fromPool;

  let next = amounts;
  if (remaining > 0 && sink.kind !== "structure") {
    const stolen = Math.min(remaining, next.structure);
    next = { ...next, structure: next.structure - stolen };
    remaining -= stolen;
  }

  return writeAmount(next, sink, target - remaining);
}

export function toggleHardwareSlot(
  amounts: DamageAmounts,
  sink: DamageSink,
  index: number,
  checked: boolean,
  damage: number
): DamageAmounts {
  const slots = sink.destroyed;
  if (!slots || index < 0 || index >= slots.length || slots[index]) {
    return amounts;
  }

  const selected = amounts.hardware[sink.id] ?? [];
  const assigned = selected.includes(index);
  if (checked === assigned) {
    return amounts;
  }

  if (!checked) {
    return {
      ...amounts,
      hardware: { ...amounts.hardware, [sink.id]: selected.filter((slot) => slot !== index) },
    };
  }

  let next = amounts;
  const unassigned = Math.max(0, damage - assignedDamageOf(amounts));
  if (unassigned < 1) {
    if (next.structure < 1) {
      return amounts;
    }
    next = { ...next, structure: next.structure - 1 };
  }

  return {
    ...next,
    hardware: { ...next.hardware, [sink.id]: [...selected, index] },
  };
}

export function canApplyDamage(amounts: DamageAmounts, damage: number): boolean {
  return assignedDamageOf(amounts) <= damage;
}

export function damagePreviewOf(incoming: IncomingAttack, defendSuccesses: number): DamagePreview | null {
  const actor = controlledTokenActor();
  if (!actor) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SelectOneToken"));
    return null;
  }
  if (!game.user?.isGM && !actor.isOwner) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.NoPermission"));
    return null;
  }

  const target = damageTargetOf(actor);
  if (!target) {
    ui.notifications.error(game.i18n.localize("ROBOTECH.Roll.SelectOneToken"));
    return null;
  }

  const cascade = calcDamageCascade({
    armorClass: target.armorClass,
    armorPenetration: incoming.armorPenetration,
    attackHits: incoming.attackSuccesses,
    attackType: incoming.damageType,
    defendHits: defendSuccesses,
    multiplier: Math.max(1, incoming.multiplier),
    resistance: isActorOf(actor, "swarm") ? 0 : target.resistance,
    targetArmor: isActorOf(actor, "swarm") ? 0 : target.targetArmor,
  });

  return {
    actor,
    breakdown: damageBreakdownOf(incoming, defendSuccesses, target, cascade, actor),
    cascade,
    defendSuccesses,
    incoming,
    sinks: damageSinksOf(actor, cascade.damageInflicted),
  };
}

export async function commitDamage(preview: DamagePreview, amounts: DamageAmounts): Promise<void> {
  const { actor, cascade } = preview;
  const distribution = distributionOf(preview, amounts);

  if (cascade.damageInflicted > 0) {
    if (isActorOf(actor, "character")) {
      await applyCharacterWounds(actor, amounts.wounds);
    } else if (isActorOf(actor, "swarm")) {
      await applySwarmHits(actor, preview, amounts.structure);
    } else if (isActorOf(actor, "vessel")) {
      await applyVesselDamage(actor, amounts);
    }
  }

  await postDamageCard({ ...preview.breakdown, distribution });
}

function damageTargetOf(actor: Actor): DamageTarget | null {
  if (isActorOf(actor, "character")) {
    return {
      armorClass: actor.system.armorClass,
      resistance: actor.system.resistance,
      targetArmor: actor.system.armor,
    };
  }
  if (isActorOf(actor, "vessel")) {
    return {
      armorClass: actor.system.armorClass,
      resistance: actor.system.resistance,
      targetArmor: actor.system.armor.value,
    };
  }
  if (isActorOf(actor, "swarm")) {
    return {
      armorClass: actor.system.armorClass,
      resistance: 0,
      targetArmor: 0,
    };
  }
  return null;
}

function maxMemberResistance(actor: ActorOf<"swarm">): number {
  let max = 0;
  for (const member of actor.system.members) {
    if (member.resistance > max) {
      max = member.resistance;
    }
  }
  return max;
}

async function applyVesselDamage(actor: ActorOf<"vessel">, amounts: DamageAmounts): Promise<void> {
  const structure = Math.max(0, actor.system.structure.value - amounts.structure);
  const armor = Math.max(0, actor.system.armor.value - amounts.armor);
  await actor.update({
    "system.armor.value": armor,
    "system.structure.value": structure,
  });
  await applyHardwareDamage(actor, amounts.hardware);
}

async function applyHardwareDamage(actor: ActorOf<"vessel">, hardware: Record<string, number[]>): Promise<void> {
  const updates: Record<string, unknown>[] = [];
  for (const [id, indexes] of Object.entries(hardware)) {
    if (indexes.length === 0) {
      continue;
    }
    const item = actor.items.get(id);
    if (!item || !isHardwareItem(item)) {
      continue;
    }
    const destroyed = markDestroyedSlots(item, indexes);
    if (!destroyed) {
      continue;
    }
    updates.push({ _id: id, [destroyedPathOf(item)]: destroyed });
  }
  if (updates.length === 0) {
    return;
  }
  await actor.updateEmbeddedDocuments("Item", updates);
}

async function applySwarmHits(actor: ActorOf<"swarm">, preview: DamagePreview, hits: number): Promise<void> {
  if (hits <= 0) {
    return;
  }
  const outcome = applySwarmDamage(actor.system.members, hits, appliedPenetration(preview));
  await actor.update({ "system.members": outcome.members });
}

function appliedPenetration(preview: DamagePreview): number {
  const { incoming, breakdown } = preview;
  return appliedPenetrationOf(incoming.armorPenetration, incoming.damageType, breakdown.damageType, 0);
}

async function applyCharacterWounds(actor: ActorOf<"character">, damage: number): Promise<void> {
  const boxes = actor.system.vitalsSettings.isTriumvirateWounds ? Math.floor(damage / 5) : damage;
  if (boxes <= 0) {
    return;
  }

  const { wounds } = actor.system;
  const next = filledWoundStates(
    flatWoundGroup(wounds.brawl.max, wounds.critical.max),
    boxes,
    wounds.brawl.states,
    wounds.critical.states
  );

  await actor.update({
    "system.wounds.brawl.states": next.brawl,
    "system.wounds.brawl.value": countCheckedBoxes(next.brawl),
    "system.wounds.critical.states": next.critical,
    "system.wounds.critical.value": countCheckedBoxes(next.critical),
  });
}

function emptyCount(states: boolean[]): number {
  return states.reduce((count, filled) => count + (filled ? 0 : 1), 0);
}

function emptyWoundBoxes(actor: ActorOf<"character">): number {
  return emptyCount(actor.system.wounds.brawl.states) + emptyCount(actor.system.wounds.critical.states);
}

function distributionOf(preview: DamagePreview, amounts: DamageAmounts): DamageDistribution {
  const hardware: DamageDistribution["hardware"] = [];
  for (const sink of preview.sinks) {
    if (sink.kind !== "hardware") {
      continue;
    }
    const amount = amounts.hardware[sink.id]?.length ?? 0;
    if (amount <= 0) {
      continue;
    }
    hardware.push({ amount, name: sink.name ?? sink.id });
  }
  return {
    armor: amounts.armor,
    hardware,
    structure: amounts.structure,
    unassigned: Math.max(0, preview.cascade.damageInflicted - assignedDamageOf(amounts)),
    wounds: amounts.wounds,
  };
}

function damageBreakdownOf(
  incoming: IncomingAttack,
  defendSuccesses: number,
  target: DamageTarget,
  cascade: CascadeResult,
  actor: Actor
): DamageBreakdown {
  const multiplier = Math.max(1, incoming.multiplier);
  return {
    armor: target.targetArmor,
    armorPenetration: incoming.armorPenetration,
    attackSuccesses: incoming.attackSuccesses,
    attackType: incoming.damageType,
    calledShot: incoming.calledShot,
    damageInflicted: cascade.damageInflicted,
    damageType: cascade.damageTypeInflicted,
    defendSuccesses,
    effectiveArmor: effectiveArmorOf(
      target.targetArmor,
      incoming.armorPenetration,
      incoming.damageType,
      target.armorClass,
      target.resistance
    ),
    hitsOverArmor: cascade.hitsOverArmor,
    isOverkill: cascade.isOverkill,
    multipliedHits: cascade.netHits * multiplier,
    multiplier,
    netHits: cascade.netHits,
    resistance: isActorOf(actor, "swarm") ? maxMemberResistance(actor) : target.resistance,
    summaryKey: cascade.summaryKey,
    swarmArmor: isActorOf(actor, "swarm"),
    targetName: actor.name,
  };
}
