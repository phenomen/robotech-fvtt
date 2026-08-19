import type { DamageTypeValue, VesselTypeValue } from "@/config/choices";

/** The damage class a vessel is hit in, which follows from how big the vessel itself is. */
export const VESSEL_DAMAGE_CLASS: Record<VesselTypeValue, DamageTypeValue> = {
  infantry: "light",
  vehicle: "mecha",
  mecha: "mecha",
  naval: "naval",
};

export interface CascadeInput {
  attackType: DamageTypeValue;
  attackHits: number;
  defendHits: number;
  targetType: DamageTypeValue;
  targetArmor: number;
  armorPenetration?: number;
  multiplier?: number;
}

/** Penetration only reduces armor of the same class as the weapon's damage. */
export function appliedPenetrationOf(
  armorPenetration: number,
  attackType: DamageTypeValue,
  targetType: DamageTypeValue,
): number {
  if (attackType !== targetType) return 0;
  return Math.max(0, armorPenetration);
}

export function effectiveArmorOf(
  targetArmor: number,
  armorPenetration: number,
  attackType: DamageTypeValue,
  targetType: DamageTypeValue,
): number {
  return Math.max(0, targetArmor - appliedPenetrationOf(armorPenetration, attackType, targetType));
}

export interface CascadeResult {
  netHits: number;
  hitsOverArmor: number;
  damageInflicted: number;
  damageTypeInflicted: DamageTypeValue;
  isOverkill: boolean;
  isImmune: boolean;
  summaryKey: string;
}

export function calcDamageCascade(input: CascadeInput): CascadeResult {
  const { attackType, attackHits, defendHits, targetType, targetArmor, armorPenetration = 0, multiplier = 1 } = input;

  const netHits = Math.max(0, attackHits - defendHits);
  if (netHits <= 0) {
    return {
      netHits: 0,
      hitsOverArmor: 0,
      damageInflicted: 0,
      damageTypeInflicted: targetType,
      isOverkill: false,
      isImmune: false,
      summaryKey: "ROBOTECH.Damage.Defended",
    };
  }

  const effectiveHits = netHits * Math.max(1, multiplier);
  const effectiveArmor = effectiveArmorOf(targetArmor, armorPenetration, attackType, targetType);
  const hitsOverArmor = Math.max(0, effectiveHits - effectiveArmor);

  if (hitsOverArmor <= 0) {
    return {
      netHits,
      hitsOverArmor: 0,
      damageInflicted: 0,
      damageTypeInflicted: targetType,
      isOverkill: false,
      isImmune: false,
      summaryKey: "ROBOTECH.Damage.ArmorAbsorbed",
    };
  }

  if (attackType === "light" && targetType === "naval") {
    return {
      netHits,
      hitsOverArmor,
      damageInflicted: 0,
      damageTypeInflicted: "naval",
      isOverkill: false,
      isImmune: true,
      summaryKey: "ROBOTECH.Damage.ImmuneLightVsNaval",
    };
  }

  let damageInflicted = 0;
  let isOverkill = false;

  if (attackType === targetType) {
    damageInflicted = hitsOverArmor;
  } else if (attackType === "light" && targetType === "mecha") {
    damageInflicted = Math.floor(hitsOverArmor / 10);
  } else if (attackType === "mecha" && targetType === "naval") {
    damageInflicted = Math.floor(hitsOverArmor / 10);
  } else if (attackType === "mecha" && targetType === "light") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 10;
  } else if (attackType === "naval" && targetType === "mecha") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 10;
  } else if (attackType === "naval" && targetType === "light") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 100;
  }

  return {
    netHits,
    hitsOverArmor,
    damageInflicted,
    damageTypeInflicted: targetType,
    isOverkill,
    isImmune: false,
    summaryKey: isOverkill ? "ROBOTECH.Damage.OverkillSuccess" : "ROBOTECH.Damage.DirectHit",
  };
}

export function calcEngineSpeed(baseSpeed: number, engineLevel: number): number {
  const level = Math.max(0, Math.min(4, engineLevel));
  return Math.floor(baseSpeed * (level / 4));
}
