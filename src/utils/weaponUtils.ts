import { type TagColor } from "@/components/ui/Tag";
import type { DamageTypeValue } from "@/config/choices";
import { WEAPON_PROPERTIES } from "@/config/weaponProperties";
import type { ItemOf, WeaponProperties } from "@/models";

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

export function weaponAttackStats(weapon: ItemOf<"weapon">): WeaponAttackStats {
  const properties = weapon.system.properties;
  const penetration = properties.penetration;
  const multiplier = properties.multiplier;
  return {
    weaponName: weapon.name,
    damageType: properties.damage.type,
    armorPenetration: penetration.active ? penetration.value : 0,
    multiplier: multiplier.active ? multiplier.value : 1,
    multiplierTargetType: multiplier.active ? multiplier.targetType : null,
    tags: weaponPropertyTags(properties),
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
