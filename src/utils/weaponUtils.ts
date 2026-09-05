import type { TagColor } from "@/components/ui/Tag";
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
  tags: WeaponTag[];
}

export function weaponAttackStats(weapon: ItemOf<"weapon">, penetration?: WeaponAmount): WeaponAttackStats {
  const properties = weapon.system.properties;
  const nextPenetration = penetration ?? properties.penetration;
  const tagged: WeaponProperties = { ...properties, penetration: nextPenetration };
  return {
    armorPenetration: nextPenetration.active ? nextPenetration.value : 0,
    damageType: properties.damage.type,
    multiplier: Math.max(1, properties.damage.multiplier),
    tags: weaponPropertyTags(tagged),
    weaponName: weapon.name,
  };
}

function isPropertyActive(value: WeaponProperties[keyof WeaponProperties]): boolean {
  return typeof value === "boolean" ? value : value.active;
}

/** Builds the tag list shown for a weapon, in the order the properties are configured. */
export function weaponPropertyTags(properties: WeaponProperties): WeaponTag[] {
  const tags: WeaponTag[] = [];

  for (const def of WEAPON_PROPERTIES) {
    if (!def.formatTag || !isPropertyActive(properties[def.key])) {
      continue;
    }

    const title = game.i18n.localize(def.nameKey);
    const formatted = def.formatTag(properties);

    if (Array.isArray(formatted)) {
      for (const [index, label] of formatted.entries()) {
        tags.push({
          color: def.tagColor,
          id: `${def.key}-${index}`,
          label,
          title: game.i18n.localize("ROBOTECH.Item.TagCount", {
            current: index + 1,
            name: title,
            total: formatted.length,
          }),
        });
      }
    } else {
      tags.push({ color: def.tagColor, id: def.key, label: formatted, title });
    }
  }

  return tags;
}
