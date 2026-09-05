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
