import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import { TALENT_CATEGORY_OPTIONS } from "@/config/options";
import type { Option } from "@/config/options";
import { WEAPON_PROPERTIES } from "@/config/weaponProperties";
import type { WeaponPropertyDef } from "@/config/weaponProperties";
import type { ItemOf, WeaponProperties } from "@/models";
import type { ChatCardField, DescriptionCardInput } from "@/utils/actionChat";
import { isItemOf } from "@/utils/documents";

/** Chat payload for an item: name, enriched description, and subtype fields. */
export function itemCardOf(item: Item): DescriptionCardInput {
  return {
    actor: actorOf(item),
    description: item.system.description,
    fields: chatFieldsOf(item),
    name: item.name,
    relativeTo: item,
  };
}

function chatFieldsOf(item: Item): ChatCardField[] {
  if (isItemOf(item, "talent")) {
    return talentFields(item);
  }
  if (isItemOf(item, "skill")) {
    return skillFields(item);
  }
  if (isItemOf(item, "gear")) {
    return gearFields(item);
  }
  if (isItemOf(item, "equipment_suite")) {
    return suiteFields(item);
  }
  if (isItemOf(item, "feature")) {
    return featureFields(item);
  }
  if (isItemOf(item, "career")) {
    return careerFields(item);
  }
  if (isItemOf(item, "race")) {
    return raceFields(item);
  }
  if (isItemOf(item, "element")) {
    return elementFields(item);
  }
  if (isItemOf(item, "weapon")) {
    return weaponFields(item);
  }
  if (isItemOf(item, "upgrade")) {
    return upgradeFields(item);
  }
  return [];
}

function actorOf(item: Item): Actor | undefined {
  return item.actor ?? undefined;
}

function talentFields(item: ItemOf<"talent">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.Category"), optionLabel(TALENT_CATEGORY_OPTIONS, item.system.category)),
    chatField(game.i18n.localize("ROBOTECH.Item.Prerequisites"), item.system.prerequisite),
    chatField(game.i18n.localize("ROBOTECH.Item.Uses"), item.system.uses)
  );
}

function skillFields(item: ItemOf<"skill">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.Value"), item.system.value),
    chatField(game.i18n.localize("ROBOTECH.Item.Benefit"), item.system.benefit),
    chatField(game.i18n.localize("ROBOTECH.Item.Cost"), item.system.cost)
  );
}

function gearFields(item: ItemOf<"gear">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.Quantity"), item.system.quantity),
    chatField(game.i18n.localize("ROBOTECH.Item.Category"), item.system.category)
  );
}

function suiteFields(item: ItemOf<"equipment_suite">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.Skill"), item.system.skill),
    chatField(game.i18n.localize("ROBOTECH.Item.Uses"), suiteUsesOf(item)),
    chatField(game.i18n.localize("ROBOTECH.Item.HardwarePoints"), item.system.hardware.value)
  );
}

function featureFields(item: ItemOf<"feature">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.Bonus"), item.system.bonus),
    chatField(game.i18n.localize("ROBOTECH.Item.HardwarePoints"), item.system.hardware.value)
  );
}

function careerFields(item: ItemOf<"career">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Character.Rank"), item.system.rank),
    chatField(game.i18n.localize("ROBOTECH.Item.RankTitle"), item.system.rankTitle),
    chatField(game.i18n.localize("ROBOTECH.Character.Fame"), item.system.fame),
    chatField(game.i18n.localize("ROBOTECH.Item.FameTitle"), item.system.fameTitle)
  );
}

function raceFields(item: ItemOf<"race">): ChatCardField[] {
  return collectFields(chatField(game.i18n.localize("ROBOTECH.Race.Form"), item.system.form));
}

function elementFields(item: ItemOf<"element">): ChatCardField[] {
  return collectFields(
    chatField(game.i18n.localize("ROBOTECH.Item.StartingRank"), item.system.rank),
    chatField(game.i18n.localize("ROBOTECH.Item.ElementTalent"), item.system.talent)
  );
}

function upgradeFields(item: ItemOf<"upgrade">): ChatCardField[] {
  return collectFields(chatField(game.i18n.localize("ROBOTECH.Item.RequiredRank"), item.system.requiredRank));
}

function weaponFields(item: ItemOf<"weapon">): ChatCardField[] {
  const fields: ChatCardField[] = [];
  const properties = item.system.properties;

  for (const def of WEAPON_PROPERTIES) {
    const property = properties[def.key];
    const active = typeof property === "boolean" ? property : property.active;
    if (!active) {
      continue;
    }
    const field = chatField(game.i18n.localize(def.nameKey), weaponValueOf(def, properties));
    if (field) {
      fields.push(field);
    }
  }

  return fields;
}

function weaponValueOf(def: WeaponPropertyDef, properties: WeaponProperties): string {
  if (def.key === "ammunition") {
    const ammo = properties.ammunition;
    return `${ammo.current} / ${ammo.value}`;
  }
  if (def.formatTag) {
    const formatted = def.formatTag(properties);
    return Array.isArray(formatted) ? String(formatted.length) : formatted;
  }
  const property = properties[def.key];
  return typeof property === "object" && "value" in property ? String(property.value) : "";
}

function suiteUsesOf(item: ItemOf<"equipment_suite">): string {
  const { value, max } = item.system.uses;
  if (max === null) {
    return game.i18n.localize("ROBOTECH.Item.Unlimited");
  }
  return `${value} / ${max}`;
}

function optionLabel(options: readonly Option[], value: string): string {
  const option = options.find((entry) => entry.value === value);
  return option ? game.i18n.localize(option.labelKey) : value;
}

function chatField(label: string, value: string | number | null | undefined): ChatCardField | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const text = typeof value === "number" ? String(value) : value.trim();
  if (text === "") {
    return undefined;
  }
  return { label, value: text };
}

function collectFields(...entries: (ChatCardField | undefined)[]): ChatCardField[] {
  const fields: ChatCardField[] = [];
  for (const entry of entries) {
    if (entry) {
      fields.push(entry);
    }
  }
  return fields;
}
