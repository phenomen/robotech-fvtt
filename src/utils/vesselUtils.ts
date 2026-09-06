import type { DamageTypeValue, ArmorClassValue } from "@/config/options";

export interface CascadeInput {
  attackType: DamageTypeValue;
  attackHits: number;
  defendHits: number;
  armorClass: ArmorClassValue;
  targetArmor: number;
  armorPenetration?: number;
  multiplier?: number;
  resistance?: number;
}

/** Penetration only reduces armor of the same class as the weapon's damage. */
export function appliedPenetrationOf(
  armorPenetration: number,
  attackType: DamageTypeValue,
  armorClass: ArmorClassValue,
  resistance: number
): number {
  if (attackType !== armorClass) {
    return 0;
  }
  return Math.max(0, armorPenetration - resistance);
}

export function effectiveArmorOf(
  targetArmor: number,
  armorPenetration: number,
  attackType: DamageTypeValue,
  armorClass: ArmorClassValue,
  resistance: number
): number {
  return Math.max(0, targetArmor - appliedPenetrationOf(armorPenetration, attackType, armorClass, resistance));
}

export interface CascadeResult {
  netHits: number;
  hitsOverArmor: number;
  damageInflicted: number;
  damageTypeInflicted: ArmorClassValue;
  isOverkill: boolean;
  isImmune: boolean;
  summaryKey: string;
}

export function calcDamageCascade(input: CascadeInput): CascadeResult {
  const {
    attackType,
    attackHits,
    defendHits,
    armorClass,
    targetArmor,
    armorPenetration = 0,
    multiplier = 1,
    resistance = 0,
  } = input;

  const netHits = Math.max(0, attackHits - defendHits);
  if (netHits <= 0) {
    return {
      damageInflicted: 0,
      damageTypeInflicted: armorClass,
      hitsOverArmor: 0,
      isImmune: false,
      isOverkill: false,
      netHits: 0,
      summaryKey: "ROBOTECH.Damage.Defended",
    };
  }

  const effectiveHits = netHits * Math.max(1, multiplier);
  const effectiveArmor = effectiveArmorOf(targetArmor, armorPenetration, attackType, armorClass, resistance);
  const hitsOverArmor = Math.max(0, effectiveHits - effectiveArmor);

  if (hitsOverArmor <= 0) {
    return {
      damageInflicted: 0,
      damageTypeInflicted: armorClass,
      hitsOverArmor: 0,
      isImmune: false,
      isOverkill: false,
      netHits,
      summaryKey: "ROBOTECH.Damage.ArmorAbsorbed",
    };
  }

  if (attackType === "light" && armorClass === "naval") {
    return {
      damageInflicted: 0,
      damageTypeInflicted: "naval",
      hitsOverArmor,
      isImmune: true,
      isOverkill: false,
      netHits,
      summaryKey: "ROBOTECH.Damage.ImmuneLightVsNaval",
    };
  }

  let damageInflicted = 0;
  let isOverkill = false;

  if (attackType === armorClass) {
    damageInflicted = hitsOverArmor;
  } else if (attackType === "light" && armorClass === "mecha") {
    damageInflicted = Math.floor(hitsOverArmor / 10);
  } else if (attackType === "mecha" && armorClass === "naval") {
    damageInflicted = Math.floor(hitsOverArmor / 10);
  } else if (attackType === "mecha" && armorClass === "light") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 10;
  } else if (attackType === "naval" && armorClass === "mecha") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 10;
  } else if (attackType === "naval" && armorClass === "light") {
    isOverkill = true;
    damageInflicted = hitsOverArmor * 100;
  }

  return {
    damageInflicted,
    damageTypeInflicted: armorClass,
    hitsOverArmor,
    isImmune: false,
    isOverkill,
    netHits,
    summaryKey: isOverkill ? "ROBOTECH.Damage.OverkillSuccess" : "ROBOTECH.Damage.DirectHit",
  };
}

export function calcEngineSpeed(baseSpeed: number, engineLevel: number): number {
  const level = Math.max(0, Math.min(4, engineLevel));
  return Math.floor(baseSpeed * (level / 4));
}
