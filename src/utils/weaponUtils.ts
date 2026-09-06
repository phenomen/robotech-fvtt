import type Actor from "@client/documents/actor.mjs";

import type { TagColor } from "@/components/ui/Tag";
import type { ActionValue, DamageTypeValue } from "@/config/options";
import { damageTagLabel, WEAPON_PROPERTIES } from "@/config/weaponProperties";
import type { ItemOf, WeaponAmount, WeaponProperties } from "@/models";
import { isActorOf } from "@/utils/documents";

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

export interface IncomingAttack extends WeaponAttackStats {
  attackSuccesses: number;
  calledShot: boolean;
}

/** Attack/defend payload for a chat card: weapon stats, swarm default, or an existing incoming defend. */
export function incomingAttackOf(
  action: ActionValue,
  successes: number,
  incoming: IncomingAttack | undefined,
  weapon: ItemOf<"weapon"> | undefined,
  contextActor: Actor,
  calledShot: boolean,
  penetration: WeaponAmount
): IncomingAttack | undefined {
  if (action === "defend") {
    return incoming;
  }
  if (action !== "attack") {
    return undefined;
  }
  if (weapon) {
    return { ...weaponAttackStats(weapon, penetration), attackSuccesses: successes, calledShot };
  }
  if (isActorOf(contextActor, "swarm")) {
    const damageType = contextActor.system.armorClass;
    const tags: WeaponTag[] = [
      {
        color: "red",
        id: "damage",
        label: damageTagLabel(1, damageType),
        title: game.i18n.localize("ROBOTECH.Item.Property.Damage.name"),
      },
    ];
    if (penetration.active) {
      tags.push({
        color: "amber",
        id: "penetration",
        label: game.i18n.localize("ROBOTECH.Item.Property.Penetration.tag", { val: penetration.value }),
        title: game.i18n.localize("ROBOTECH.Item.Property.Penetration.name"),
      });
    }
    return {
      armorPenetration: penetration.active ? penetration.value : 0,
      attackSuccesses: successes,
      calledShot,
      damageType,
      multiplier: 1,
      tags,
      weaponName: contextActor.name,
    };
  }
  return undefined;
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
