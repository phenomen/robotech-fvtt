import type { ActorOf } from "@/models";
import { countCheckedBoxes } from "@/utils/trackers";

export type WoundType = "brawl" | "critical";

export interface WoundRef {
  type: WoundType;
  index: number;
}

const TRIUMVIRATE_MEMBERS = 3;

function memberShareOf(total: number, member: number): number {
  return Math.floor(total / TRIUMVIRATE_MEMBERS) + (total % TRIUMVIRATE_MEMBERS > member ? 1 : 0);
}

function woundRefsOf(type: WoundType, offset: number, count: number): WoundRef[] {
  return Array.from({ length: count }, (_unused, i) => ({ index: offset + i, type }));
}

/** Wound boxes split across the three triumvirate members; brawl boxes precede critical ones within a member. */
export function triumvirateGroupsOf(brawlMax: number, criticalMax: number): WoundRef[][] {
  const groups: WoundRef[][] = [];
  let brawlOffset = 0;
  let criticalOffset = 0;
  for (let member = 0; member < TRIUMVIRATE_MEMBERS; member += 1) {
    const brawlCount = memberShareOf(brawlMax, member);
    const criticalCount = memberShareOf(criticalMax, member);
    groups.push([
      ...woundRefsOf("brawl", brawlOffset, brawlCount),
      ...woundRefsOf("critical", criticalOffset, criticalCount),
    ]);
    brawlOffset += brawlCount;
    criticalOffset += criticalCount;
  }
  return groups;
}

/** The single group used without triumvirate splitting: all brawl boxes, then all critical. */
export function flatWoundGroup(brawlMax: number, criticalMax: number): WoundRef[] {
  return [...woundRefsOf("brawl", 0, brawlMax), ...woundRefsOf("critical", 0, criticalMax)];
}

/** Fills up to `count` empty boxes following group order, skipping already-filled ones. */
export function filledWoundStates(
  group: readonly WoundRef[],
  count: number,
  brawl: readonly boolean[],
  critical: readonly boolean[]
): { brawl: boolean[]; critical: boolean[] } {
  const nextBrawl = [...brawl];
  const nextCritical = [...critical];
  let remaining = count;
  for (const ref of group) {
    if (remaining <= 0) {
      break;
    }
    if (ref.type === "brawl") {
      if (nextBrawl[ref.index]) {
        continue;
      }
      nextBrawl[ref.index] = true;
    } else {
      if (nextCritical[ref.index]) {
        continue;
      }
      nextCritical[ref.index] = true;
    }
    remaining -= 1;
  }
  return { brawl: nextBrawl, critical: nextCritical };
}

/** Clears up to `count` filled boxes, walking group order in reverse. */
export function emptiedWoundStates(
  group: readonly WoundRef[],
  count: number,
  brawl: readonly boolean[],
  critical: readonly boolean[]
): { brawl: boolean[]; critical: boolean[] } {
  const nextBrawl = [...brawl];
  const nextCritical = [...critical];
  let remaining = count;
  for (let index = group.length - 1; index >= 0; index -= 1) {
    if (remaining <= 0) {
      break;
    }
    const ref = group[index];
    if (!ref) {
      continue;
    }
    if (ref.type === "brawl") {
      if (!nextBrawl[ref.index]) {
        continue;
      }
      nextBrawl[ref.index] = false;
    } else {
      if (!nextCritical[ref.index]) {
        continue;
      }
      nextCritical[ref.index] = false;
    }
    remaining -= 1;
  }
  return { brawl: nextBrawl, critical: nextCritical };
}

export function woundGroupOf(actor: ActorOf<"character">): WoundRef[] {
  const { brawl, critical } = actor.system.wounds;
  if (actor.system.vitalsSettings.isTriumvirateWounds) {
    return triumvirateGroupsOf(brawl.max, critical.max).flat();
  }
  return flatWoundGroup(brawl.max, critical.max);
}

/** Token-bar remaining empty boxes → wound state update. */
export function woundUpdatesForBar(actor: ActorOf<"character">, remaining: number): Record<string, unknown> {
  const { brawl, critical } = actor.system.wounds;
  const group = woundGroupOf(actor);
  const filled = countCheckedBoxes(brawl.states) + countCheckedBoxes(critical.states);
  const targetFilled = Math.max(0, brawl.max + critical.max - remaining);
  const next =
    targetFilled > filled
      ? filledWoundStates(group, targetFilled - filled, brawl.states, critical.states)
      : emptiedWoundStates(group, filled - targetFilled, brawl.states, critical.states);
  return {
    "system.wounds.brawl.states": next.brawl,
    "system.wounds.brawl.value": countCheckedBoxes(next.brawl),
    "system.wounds.critical.states": next.critical,
    "system.wounds.critical.value": countCheckedBoxes(next.critical),
  };
}

/** Token-bar filled stress boxes → stress box update. Empty boxes fill as fatigue. */
export function stressUpdatesForBar(actor: ActorOf<"character">, filled: number): Record<string, unknown> {
  const boxes = [...actor.system.stress.boxes];
  const current = boxes.filter(Boolean).length;
  if (filled > current) {
    let need = filled - current;
    for (let index = 0; index < boxes.length && need > 0; index += 1) {
      if (!boxes[index]) {
        boxes[index] = "F";
        need -= 1;
      }
    }
  } else if (filled < current) {
    let need = current - filled;
    for (let index = boxes.length - 1; index >= 0 && need > 0; index -= 1) {
      if (boxes[index]) {
        boxes[index] = "";
        need -= 1;
      }
    }
  }
  return { "system.stress.boxes": boxes };
}
