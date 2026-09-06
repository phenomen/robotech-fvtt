import type { DamageTypeValue, ArmorClassValue } from "@/config/options";
import type { SwarmMember } from "@/models";
import { appliedPenetrationOf, calcDamageCascade } from "@/utils/vesselUtils";
import type { CascadeResult } from "@/utils/vesselUtils";

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
  armorClass: ArmorClassValue;
  armorPenetration: number;
  multiplier?: number;
}

export interface SwarmAttackResult extends SwarmDamageResult {
  cascade: CascadeResult;
}

/**
 * The swarm is attacked as a single entity, so defence and class scaling resolve against the
 * swarm as a whole. Armor stays out of the cascade because each vessel must be bypassed in turn as
 * the surviving successes carry down the stack.
 */
export function resolveSwarmAttack(members: SwarmMember[], attack: SwarmAttack): SwarmAttackResult {
  const cascade = calcDamageCascade({
    armorClass: attack.armorClass,
    attackHits: attack.attackSuccesses,
    attackType: attack.attackType,
    defendHits: attack.defendSuccesses,
    multiplier: attack.multiplier,
    targetArmor: 0,
  });

  const damage = applySwarmDamage(
    members,
    cascade.damageInflicted,
    appliedPenetrationOf(attack.armorPenetration, attack.attackType, attack.armorClass)
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
  let stopped = false;

  for (const member of next) {
    if (stopped) {
      break;
    }
    while (remaining > 0 && isMemberAlive(member)) {
      const hit = resolveVesselHit(member, remaining, penetration);
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

function resolveVesselHit(member: SwarmMember, remaining: number, penetration: number): VesselHit {
  const armor = Math.max(0, member.armor - penetration);
  if (remaining <= armor) {
    return { destroyed: 0, remaining: 0, stopped: true };
  }

  const structureHits = remaining - armor;
  if (structureHits >= member.currentStructure) {
    const leftover = structureHits - member.currentStructure;
    member.count -= 1;
    member.currentStructure = member.count > 0 ? member.reducedStructure : 0;
    return { destroyed: 1, remaining: leftover, stopped: false };
  }

  member.currentStructure -= structureHits;
  return { destroyed: 0, remaining: 0, stopped: true };
}
