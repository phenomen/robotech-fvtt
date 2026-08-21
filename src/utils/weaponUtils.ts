import { type TagColor } from "@/components/ui/Tag";
import type { DamageTypeValue } from "@/config/options";
import { WEAPON_PROPERTIES } from "@/config/weaponProperties";
import type { ItemOf, WeaponAmount, WeaponProperties } from "@/models";

export interface WeaponTag {
  id: string;
  label: string;
  color: TagColor;
  title?: string;
}

export interface WeaponAttackStats {
  weaponName: string;
  damageType: DamageTypeValue;
  armorPenetration: number;
  multiplier: number;
  multiplierTargetType: DamageTypeValue | null;
  tags: WeaponTag[];
}

export function weaponAttackStats(weapon: ItemOf<"weapon">, penetration?: WeaponAmount): WeaponAttackStats {
  const properties = weapon.system.properties;
  const nextPenetration = penetration ?? properties.penetration;
  const tagged: WeaponProperties = { ...properties, penetration: nextPenetration };
  const multiplier = properties.multiplier;
  return {
    weaponName: weapon.name,
    damageType: properties.damage.type,
    armorPenetration: nextPenetration.active ? nextPenetration.value : 0,
    multiplier: multiplier.active ? multiplier.value : 1,
    multiplierTargetType: multiplier.active ? multiplier.targetType : null,
    tags: weaponPropertyTags(tagged),
  };
}

function isPropertyActive(value: WeaponProperties[keyof WeaponProperties]): boolean {
  return typeof value === "boolean" ? value : value.active;
}

/** Builds the tag list shown for a weapon, in the order the properties are configured. */
export function weaponPropertyTags(properties: WeaponProperties): WeaponTag[] {
  const tags: WeaponTag[] = [];

  for (const def of WEAPON_PROPERTIES) {
    if (!def.formatTag || !isPropertyActive(properties[def.key])) continue;

    const title = game.i18n.localize(def.nameKey);
    const formatted = def.formatTag(properties);

    if (Array.isArray(formatted)) {
      formatted.forEach((label, index) => {
        tags.push({
          id: `${def.key}-${index}`,
          label,
          color: def.tagColor,
          title: game.i18n.localize("ROBOTECH.Item.TagCount", {
            name: title,
            current: index + 1,
            total: formatted.length,
          }),
        });
      });
    } else {
      tags.push({ id: def.key, label: formatted, color: def.tagColor, title });
    }
  }

  return tags;
}
