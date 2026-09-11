import type { ArmorClassValue } from "@/config/options";
import type { SwarmMember } from "@/models";

/** Hardened Swarm members count as 1 Mecha-Class Structure and 0 Mecha-Class Armor. */
export const HARDENED_ARMOR = 0;
export const HARDENED_STRUCTURE = 1;
export const HARDENED_ARMOR_CLASS = "mecha" as const satisfies ArmorClassValue;

/** Every part of 3 structure grants a swarm member 1 structure: 3 becomes 1, 4 becomes 2. */
export function calcReducedStructure(originalStructure: number): number {
  return Math.max(1, Math.ceil(originalStructure / 3));
}

export function isMemberAlive(member: SwarmMember): boolean {
  return member.count > 0 && member.currentStructure > 0;
}

export function swarmArmorClassOf(armorClass: ArmorClassValue, hardened: boolean): ArmorClassValue {
  return hardened ? HARDENED_ARMOR_CLASS : armorClass;
}

export function memberArmorOf(member: SwarmMember, hardened: boolean): number {
  return hardened ? HARDENED_ARMOR : member.armor;
}

export function memberStructureOf(member: SwarmMember, hardened: boolean): number {
  return hardened ? HARDENED_STRUCTURE : member.reducedStructure;
}

export function leadStructureOf(member: SwarmMember, hardened: boolean): number {
  if (!isMemberAlive(member)) {
    return 0;
  }
  return Math.min(member.currentStructure, memberStructureOf(member, hardened));
}

export function remainingSwarmDice(living: number, spent: number): number {
  return Math.max(0, living - spent);
}

export function hasLivingMember(members: SwarmMember[]): boolean {
  return members.some(isMemberAlive);
}

export interface SwarmDamageResult {
  members: SwarmMember[];
  destroyed: number;
  absorbed: boolean;
}

interface VesselHit {
  remaining: number;
  destroyed: number;
  stopped: boolean;
}

export function applySwarmDamage(
  members: SwarmMember[],
  successes: number,
  penetration: number,
  hardened = false
): SwarmDamageResult {
  let remaining = successes;
  let destroyed = 0;
  const next = members.map((member) => ({ ...member }));
  let stopped = false;

  for (const member of next) {
    if (stopped) {
      break;
    }
    while (remaining > 0 && isMemberAlive(member)) {
      const hit = resolveVesselHit(member, remaining, penetration, hardened);
      remaining = hit.remaining;
      destroyed += hit.destroyed;
      if (hit.stopped) {
        stopped = true;
        break;
      }
    }
  }

  return {
    absorbed: successes > 0 && hasLivingMember(members) && !didMembersChange(members, next),
    destroyed,
    members: next,
  };
}

function didMembersChange(before: SwarmMember[], after: SwarmMember[]): boolean {
  return after.some((member, index) => {
    const orig = before[index];
    return !orig || orig.count !== member.count || orig.currentStructure !== member.currentStructure;
  });
}

function resolveVesselHit(member: SwarmMember, remaining: number, penetration: number, hardened: boolean): VesselHit {
  const armor = hardened ? HARDENED_ARMOR : Math.max(0, member.armor - Math.max(0, penetration - member.resistance));
  if (remaining <= armor) {
    return { destroyed: 0, remaining: 0, stopped: true };
  }

  const currentStructure = leadStructureOf(member, hardened);
  const structureHits = remaining - armor;
  if (structureHits >= currentStructure) {
    const leftover = structureHits - currentStructure;
    member.count -= 1;
    member.currentStructure = member.count > 0 ? member.reducedStructure : 0;
    return { destroyed: 1, remaining: leftover, stopped: false };
  }

  member.currentStructure -= structureHits;
  return { destroyed: 0, remaining: 0, stopped: true };
}
