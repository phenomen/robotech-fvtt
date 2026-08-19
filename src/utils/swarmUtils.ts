import type { DamageTypeValue } from "@/config/choices";
import type { SwarmMember } from "@/models";
import { appliedPenetrationOf, calcDamageCascade, type CascadeResult } from "@/utils/vesselUtils";

/** Every part of 3 structure grants a swarm member 1 structure: 3 becomes 1, 4 becomes 2. */
export function calcReducedStructure(originalStructure: number): number {
  return Math.max(1, Math.ceil(originalStructure / 3));
}

export function isMemberAlive(member: SwarmMember): boolean {
  return member.count > 0 && member.currentStructure > 0;
}

export function hasLivingMember(members: SwarmMember[]): boolean {
  return members.some(isMemberAlive);
}

export interface SwarmDamageResult {
  members: SwarmMember[];
  destroyed: number;
  absorbed: boolean;
}

export interface SwarmAttack {
  attackType: DamageTypeValue;
  attackSuccesses: number;
  defendSuccesses: number;
  swarmClass: DamageTypeValue;
  armorPenetration: number;
  multiplier?: number;
}

export interface SwarmAttackResult extends SwarmDamageResult {
  cascade: CascadeResult;
}

/**
 * The swarm is attacked as a single entity, so defence and damage-class scaling resolve against the
 * swarm as a whole. Armor stays out of the cascade because each vessel must be bypassed in turn as
 * the surviving successes carry down the stack.
 */
export function resolveSwarmAttack(members: SwarmMember[], attack: SwarmAttack): SwarmAttackResult {
  const cascade = calcDamageCascade({
    attackType: attack.attackType,
    attackHits: attack.attackSuccesses,
    defendHits: attack.defendSuccesses,
    targetType: attack.swarmClass,
    targetArmor: 0,
    multiplier: attack.multiplier,
  });

  const damage = applySwarmDamage(
    members,
    cascade.damageInflicted,
    appliedPenetrationOf(attack.armorPenetration, attack.attackType, attack.swarmClass),
  );
  return { ...damage, cascade };
}

interface VesselHit {
  remaining: number;
  destroyed: number;
  stopped: boolean;
}

export function applySwarmDamage(members: SwarmMember[], successes: number, penetration: number): SwarmDamageResult {
  let remaining = successes;
  let destroyed = 0;
  const next = members.map((member) => ({ ...member }));

  outer: for (const member of next) {
    while (remaining > 0 && isMemberAlive(member)) {
      const hit = resolveVesselHit(member, remaining, penetration);
      remaining = hit.remaining;
      destroyed += hit.destroyed;
      if (hit.stopped) break outer;
    }
  }

  return {
    members: next,
    destroyed,
    absorbed: successes > 0 && hasLivingMember(members) && !didMembersChange(members, next),
  };
}

function didMembersChange(before: SwarmMember[], after: SwarmMember[]): boolean {
  return after.some((member, index) => {
    const orig = before[index];
    return !orig || orig.count !== member.count || orig.currentStructure !== member.currentStructure;
  });
}

function resolveVesselHit(member: SwarmMember, remaining: number, penetration: number): VesselHit {
  const armor = Math.max(0, member.armor - penetration);
  if (remaining <= armor) {
    return { remaining: 0, destroyed: 0, stopped: true };
  }

  const structureHits = remaining - armor;
  if (structureHits >= member.currentStructure) {
    const leftover = structureHits - member.currentStructure;
    member.count -= 1;
    member.currentStructure = member.count > 0 ? member.reducedStructure : 0;
    return { remaining: leftover, destroyed: 1, stopped: false };
  }

  member.currentStructure -= structureHits;
  return { remaining: 0, destroyed: 0, stopped: true };
}
