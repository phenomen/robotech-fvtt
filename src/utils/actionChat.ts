import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import { dieSuccessGradation } from "@/config";
import type { ActionValue, DamageTypeValue, SystemRatingValue } from "@/config/choices";
import type { Ad6DieResult } from "@/utils/AD6Roll";
import { enrichHtml, escapeHtml } from "@/utils/html";
import type { WeaponAttackStats, WeaponTag } from "@/utils/weaponUtils";

const TAG_COLOR_CLASS: Record<WeaponTag["color"], string> = {
  amber: "rt-chat-tag--amber",
  blue: "rt-chat-tag--blue",
  red: "rt-chat-tag--red",
  green: "rt-chat-tag--green",
  teal: "rt-chat-tag--teal",
  purple: "rt-chat-tag--purple",
  pink: "rt-chat-tag--pink",
  primary: "rt-chat-tag--primary",
  default: "rt-chat-tag--default",
};

export type ActionChatKind = "action" | "attack" | "defend";

export interface IncomingAttack extends WeaponAttackStats {
  attackSuccesses: number;
  calledShot: boolean;
}

export interface ActionChatFlags {
  kind: ActionChatKind;
  action: ActionValue;
  contextUuid: string;
  successes: number;
  incoming?: IncomingAttack;
}

export interface ActionCardInput {
  actor: Actor;
  action: ActionValue;
  title: string;
  modifier: SystemRatingValue;
  diceCount: number;
  dice: Ad6DieResult[];
  rolledSuccesses: number;
  bonusSuccesses: number;
  successes: number;
  roll: foundry.dice.Roll;
  skillNames: string[];
  incoming?: IncomingAttack;
  heightened?: boolean;
}

export function actionFlagsOf(message: foundry.documents.ChatMessage): ActionChatFlags | null {
  const flags = message.getFlag("robotech", "action");
  if (!isChatFlags(flags)) return null;
  return flags;
}

export async function postActionCard(input: ActionCardInput): Promise<void> {
  const kind = cardKindOf(input.action, input.incoming);
  const flags: ActionChatFlags = {
    kind,
    action: input.action,
    contextUuid: input.actor.uuid ?? "",
    successes: input.successes,
    incoming: input.incoming,
  };

  await foundry.documents.ChatMessage.create({
    user: game.user?.id,
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    content: actionCardHtml(input, kind),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    rolls: [input.roll],
    flags: { robotech: { action: flags } },
  });
}

export interface PoolCardInput {
  actor: Actor;
  title: string;
  modifier: SystemRatingValue;
  diceCount: number;
  dice: Ad6DieResult[];
  successes: number;
  roll: foundry.dice.Roll;
}

export async function postPoolCard(input: PoolCardInput): Promise<void> {
  await foundry.documents.ChatMessage.create({
    user: game.user?.id,
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    content: poolCardHtml(input),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    rolls: [input.roll],
  });
}

export async function postDamageCard(breakdown: DamageBreakdown): Promise<void> {
  await foundry.documents.ChatMessage.create({
    user: game.user?.id,
    speaker: foundry.documents.ChatMessage.getSpeaker(),
    content: damageCardHtml(breakdown),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

export interface DescriptionCardInput {
  actor?: Actor;
  title: string;
  description: string;
  relativeTo?: Actor | Item;
}

export async function sendToChat(input: DescriptionCardInput): Promise<void> {
  const description = await enrichHtml(input.description, { relativeTo: input.relativeTo });
  await foundry.documents.ChatMessage.create({
    user: game.user?.id,
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    content: descriptionCardHtml(input.title, description),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

export interface DamageDistribution {
  structure: number;
  armor: number;
  wounds: number;
  hardware: { name: string; amount: number }[];
  unassigned: number;
}

export interface DamageBreakdown {
  targetName: string;
  attackType: DamageTypeValue;
  attackSuccesses: number;
  defendSuccesses: number;
  netHits: number;
  multiplier: number;
  multiplierTargetType: DamageTypeValue | null;
  multiplierApplied: boolean;
  multipliedHits: number;
  armor: number;
  armorPenetration: number;
  effectiveArmor: number;
  hitsOverArmor: number;
  damageInflicted: number;
  damageType: DamageTypeValue;
  summaryKey: string;
  calledShot: boolean;
  swarmArmor: boolean;
  isOverkill: boolean;
  distribution?: DamageDistribution;
}

function descriptionCardHtml(title: string, description: string): string {
  return `
    <div class="rt-chat-card">
      <div class="rt-chat-header">${escapeHtml(title)}</div>
      ${description ? `<div class="rt-chat-description">${description}</div>` : ""}
    </div>
  `;
}

function cardKindOf(action: ActionValue, incoming?: IncomingAttack): ActionChatKind {
  if (action === "attack") return "attack";
  if (action === "defend" && incoming) return "defend";
  return "action";
}

function actionCardHtml(input: ActionCardInput, kind: ActionChatKind): string {
  const modifierLabel = game.i18n.localize("ROBOTECH.Roll.Modifier");
  const dicePoolLabel = game.i18n.localize("ROBOTECH.Roll.DicePool");
  const skills = input.skillNames.map((name) => `<div class="rt-chat-skill">${escapeHtml(name)}</div>`).join("");

  const diceHtml = input.dice
    .map((result) => {
      const variant = dieSuccessGradation(result.successes).dieClass;
      return `<span class="rt-die-box ${variant}">${result.die}</span>`;
    })
    .join("");

  const headerClass = input.heightened ? "rt-chat-header rt-chat-header--danger" : "rt-chat-header";

  return `
    <div class="rt-chat-card">
      <div class="${headerClass}">${escapeHtml(input.title)}</div>
      ${skills ? `<div class="rt-chat-skills">${skills}</div>` : ""}
      <div class="rt-chat-meta">
        <span>${modifierLabel}: <strong class="rt-chat-meta-value">${escapeHtml(input.modifier)}</strong></span>
        <span>${dicePoolLabel}: <strong class="rt-chat-meta-value">${input.diceCount}d6</strong></span>
      </div>
      ${weaponBlockHtml(input.incoming)}
      ${opposedBlockHtml(kind, input)}
      <div class="rt-dice-grid">${diceHtml}${bonusChipHtml(input.bonusSuccesses)}</div>
      ${successFooterHtml(input.successes, input.rolledSuccesses, input.bonusSuccesses)}
      ${actionButtonsHtml(kind)}
    </div>
  `;
}

function poolCardHtml(input: PoolCardInput): string {
  const modifierLabel = game.i18n.localize("ROBOTECH.Roll.Modifier");
  const dicePoolLabel = game.i18n.localize("ROBOTECH.Roll.DicePool");
  const modifierName = game.i18n.localize("ROBOTECH.Roll.Modifiers.Nominal");
  const diceHtml = input.dice
    .map((result) => {
      const variant = dieSuccessGradation(result.successes).dieClass;
      return `<span class="rt-die-box ${variant}">${result.die}</span>`;
    })
    .join("");

  return `
    <div class="rt-chat-card">
      <div class="rt-chat-header">${escapeHtml(input.title)}</div>
      <div class="rt-chat-meta">
        <span>${modifierLabel}: <strong class="rt-chat-meta-value">${escapeHtml(modifierName)}</strong></span>
        <span>${dicePoolLabel}: <strong class="rt-chat-meta-value">${input.diceCount}d6</strong></span>
      </div>
      <div class="rt-dice-grid">${diceHtml}</div>
      ${successFooterHtml(input.successes, input.successes, 0)}
    </div>
  `;
}

function bonusChipHtml(bonus: number): string {
  if (bonus === 0) return "";
  const signed = bonus > 0 ? `+${bonus}` : String(bonus);
  const label = game.i18n.localize("ROBOTECH.Roll.ManualSuccesses");
  const tone = bonus > 0 ? "rt-success-bonus--gain" : "rt-success-bonus--loss";
  return `<span class="rt-success-bonus ${tone}" title="${escapeHtml(label)}">${escapeHtml(signed)}</span>`;
}

function successFooterHtml(total: number, rolled: number, bonus: number): string {
  const successClass = total > 0 ? "rt-chat-total-value--success" : "rt-chat-total-value--failure";
  const totalLabel = game.i18n.localize("ROBOTECH.Roll.TotalSuccesses");
  const detail = bonus === 0 ? "" : `<span class="rt-chat-total-detail">${successDetailHtml(rolled, bonus)}</span>`;
  return `<div class="rt-chat-footer">
    <span class="rt-chat-total-copy">
      <span class="rt-chat-total-label">${escapeHtml(totalLabel)}:</span>
      ${detail}
    </span>
    <span class="rt-chat-total-value ${successClass}">${total}</span>
  </div>`;
}

function successDetailHtml(rolled: number, bonus: number): string {
  const rolledLabel = game.i18n.localize("ROBOTECH.Roll.Rolled");
  const bonusLabel = game.i18n.localize("ROBOTECH.Roll.Added");
  const bonusValue = bonus > 0 ? `+${bonus}` : String(bonus);
  return `${successPartHtml(rolledLabel, String(rolled))}<span class="rt-chat-total-sep">·</span>${successPartHtml(bonusLabel, bonusValue)}`;
}

function successPartHtml(label: string, value: string): string {
  return `<span class="rt-chat-success-part">${escapeHtml(label)} <strong>${escapeHtml(value)}</strong></span>`;
}

function weaponBlockHtml(incoming?: IncomingAttack): string {
  if (!incoming) return "";
  const called = incoming.calledShot
    ? `<div class="rt-chat-called">${escapeHtml(game.i18n.localize("ROBOTECH.Roll.CalledShotYes"))}</div>`
    : "";
  return `<div class="rt-chat-weapon">
    <div class="rt-chat-weapon-name">${escapeHtml(incoming.weaponName)}</div>
    ${weaponTagsHtml(incoming.tags)}
    ${called}
  </div>`;
}

function weaponTagsHtml(tags: WeaponTag[] | undefined): string {
  if (!tags?.length) return "";
  const chips = tags
    .map((tag) => {
      const colorClass = TAG_COLOR_CLASS[tag.color] ?? TAG_COLOR_CLASS.default;
      const title = tag.title ? ` title="${escapeHtml(tag.title)}"` : "";
      return `<span class="rt-chat-tag ${colorClass}"${title}>${escapeHtml(tag.label)}</span>`;
    })
    .join("");
  return `<div class="rt-chat-tags">${chips}</div>`;
}

function damageCardHtml(breakdown: DamageBreakdown): string {
  const typeLabel = game.i18n.localize(`ROBOTECH.Damage.DamageClass.${breakdown.damageType}`);
  const summary = game.i18n.localize(breakdown.summaryKey, {
    damage: breakdown.damageInflicted,
    type: typeLabel,
    name: breakdown.targetName,
  });
  const summaryClass = breakdown.isOverkill ? "rt-chat-summary rt-chat-summary--danger" : "rt-chat-summary";
  return `<div class="rt-chat-card">
    <div class="rt-chat-header">${escapeHtml(game.i18n.localize("ROBOTECH.Damage.Title"))}</div>
    <div class="rt-chat-target">${escapeHtml(breakdown.targetName)}</div>
    <div class="rt-chat-breakdown">${damageRowsHtml(breakdown)}</div>
    <div class="${summaryClass}">${escapeHtml(summary)}</div>
    ${distributionHtml(breakdown.distribution)}
  </div>`;
}

function damageRowsHtml(breakdown: DamageBreakdown): string {
  const rows = [
    damageRow("ROBOTECH.Damage.Breakdown.Opposed", {
      attack: breakdown.attackSuccesses,
      defend: breakdown.defendSuccesses,
      net: breakdown.netHits,
    }),
  ];
  if (breakdown.calledShot) {
    rows.push(damageRow("ROBOTECH.Roll.CalledShotYes", {}));
  }
  if (breakdown.netHits <= 0) return rows.join("");

  rows.push(multiplierRow(breakdown), armorRow(breakdown), armorHitsRow(breakdown));
  rows.push(classScaleRow(breakdown));
  return rows.join("");
}

function multiplierRow(breakdown: DamageBreakdown): string {
  if (breakdown.multiplier <= 1 || !breakdown.multiplierTargetType) return "";
  const type = classLabel(breakdown.multiplierTargetType);
  if (breakdown.multiplierApplied) {
    return damageRow("ROBOTECH.Damage.Breakdown.MultiplierApplied", {
      value: breakdown.multiplier,
      type,
      hits: breakdown.multipliedHits,
    });
  }
  return damageRow("ROBOTECH.Damage.Breakdown.MultiplierSkipped", {
    value: breakdown.multiplier,
    type,
    target: classLabel(breakdown.damageType),
  });
}

function armorRow(breakdown: DamageBreakdown): string {
  const penetrationApplies = breakdown.attackType === breakdown.damageType;
  if (breakdown.swarmArmor) {
    if (breakdown.armorPenetration > 0 && !penetrationApplies) {
      return damageRow("ROBOTECH.Damage.Breakdown.SwarmArmorSkipped", {
        ap: breakdown.armorPenetration,
        target: classLabel(breakdown.damageType),
      });
    }
    return damageRow("ROBOTECH.Damage.Breakdown.SwarmArmor", {
      ap: breakdown.armorPenetration,
    });
  }
  if (breakdown.armorPenetration > 0 && !penetrationApplies) {
    return damageRow("ROBOTECH.Damage.Breakdown.ArmorSkipped", {
      armor: breakdown.armor,
      ap: breakdown.armorPenetration,
      target: classLabel(breakdown.damageType),
    });
  }
  return damageRow("ROBOTECH.Damage.Breakdown.Armor", {
    armor: breakdown.armor,
    ap: breakdown.armorPenetration,
    effective: breakdown.effectiveArmor,
  });
}

function armorHitsRow(breakdown: DamageBreakdown): string {
  if (breakdown.swarmArmor || breakdown.netHits <= 0) return "";
  return damageRow("ROBOTECH.Damage.Breakdown.HitsOverArmor", {
    hits: breakdown.hitsOverArmor,
  });
}

function classScaleRow(breakdown: DamageBreakdown): string {
  if (breakdown.netHits <= 0) return "";
  const key = classScaleKey(breakdown.attackType, breakdown.damageType);
  if (!key) return "";
  return damageRow(key, {
    attack: classLabel(breakdown.attackType),
    target: classLabel(breakdown.damageType),
  });
}

function classScaleKey(attack: DamageTypeValue, target: DamageTypeValue): string | null {
  if (attack === target) return "ROBOTECH.Damage.Breakdown.ClassSame";
  if ((attack === "light" && target === "mecha") || (attack === "mecha" && target === "naval")) {
    return "ROBOTECH.Damage.Breakdown.ClassReduce";
  }
  if ((attack === "mecha" && target === "light") || (attack === "naval" && target === "mecha")) {
    return "ROBOTECH.Damage.Breakdown.ClassOverkill";
  }
  if (attack === "naval" && target === "light") return "ROBOTECH.Damage.Breakdown.ClassOverkillHeavy";
  if (attack === "light" && target === "naval") return "ROBOTECH.Damage.Breakdown.ClassImmune";
  return null;
}

function classLabel(type: DamageTypeValue): string {
  return game.i18n.localize(`ROBOTECH.Damage.DamageClass.${type}`);
}

function damageRow(key: string, data: Record<string, string | number>): string {
  return `<div class="rt-chat-breakdown-row">${escapeHtml(game.i18n.localize(key, data))}</div>`;
}

function distributionHtml(distribution: DamageDistribution | undefined): string {
  if (!distribution) return "";
  const rows = [
    distribution.structure > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Structure", distribution.structure) : "",
    distribution.armor > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Armor", distribution.armor) : "",
    distribution.wounds > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Wounds", distribution.wounds) : "",
    ...distribution.hardware.map((entry) =>
      assignedRow("ROBOTECH.Damage.Distribution.Hardware", entry.amount, {
        name: entry.name,
        suffixKey: "ROBOTECH.Damage.Distribution.HardwareUnit",
      }),
    ),
    distribution.unassigned > 0
      ? `<div class="rt-chat-breakdown-row">${signedDamage(distribution.unassigned)} ${escapeHtml(
          game.i18n.localize("ROBOTECH.Damage.Distribution.Unassigned"),
        )}</div>`
      : "",
  ].filter(Boolean);
  if (rows.length === 0) return "";
  return `<div class="rt-chat-distribution">
    <div class="rt-chat-distribution-title">${escapeHtml(
      game.i18n.localize("ROBOTECH.Damage.Distribution.Title"),
    )}</div>
    ${rows.join("")}
  </div>`;
}

function assignedRow(key: string, amount: number, data?: { name?: string; suffixKey?: string }): string {
  const label = escapeHtml(game.i18n.localize(key, { name: data?.name ?? "" }));
  const suffix = data?.suffixKey ? ` ${escapeHtml(game.i18n.localize(data.suffixKey))}` : "";
  return `<div class="rt-chat-breakdown-row">${label} ${signedDamage(amount)}${suffix}</div>`;
}

function signedDamage(amount: number): string {
  return `<span class="rt-chat-damage">−${amount}</span>`;
}

function opposedBlockHtml(kind: ActionChatKind, input: ActionCardInput): string {
  if (kind !== "defend" || !input.incoming) return "";
  return `<div class="rt-chat-opposed">${metaRow(
    "ROBOTECH.Roll.AttackSuccesses",
    String(input.incoming.attackSuccesses),
  )}${metaRow("ROBOTECH.Roll.DefendSuccesses", String(input.successes))}</div>`;
}

function actionButtonsHtml(kind: ActionChatKind): string {
  if (kind !== "attack" && kind !== "defend") return "";

  const apply = `<button type="button" class="rt-chat-button" data-rt-action="apply-damage">${escapeHtml(
    game.i18n.localize("ROBOTECH.Roll.ApplyDamage"),
  )}</button>`;

  if (kind === "defend") return `<div class="rt-chat-actions">${apply}</div>`;

  const defend = `<button type="button" class="rt-chat-button rt-chat-button--ghost" data-rt-action="defend">${escapeHtml(
    game.i18n.localize("ROBOTECH.Roll.DefendButton"),
  )}</button>`;
  return `<div class="rt-chat-actions">${defend}${apply}</div>`;
}

function metaRow(labelKey: string, value: string): string {
  return `<div class="rt-chat-meta"><span>${escapeHtml(game.i18n.localize(labelKey))}: <strong class="rt-chat-meta-value">${escapeHtml(value)}</strong></span></div>`;
}

function isChatFlags(value: unknown): value is ActionChatFlags {
  if (!value || typeof value !== "object") return false;
  if (!("kind" in value) || !("action" in value) || !("contextUuid" in value) || !("successes" in value)) {
    return false;
  }
  return (
    (value.kind === "action" || value.kind === "attack" || value.kind === "defend") &&
    typeof value.action === "string" &&
    typeof value.contextUuid === "string" &&
    typeof value.successes === "number"
  );
}
