import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import { dieSuccessGradation, modifierLabelOf } from "@/config";
import { ACTION_OPTIONS, isConflictAction } from "@/config/options";
import type { ActionValue, DamageTypeValue, RollModifierValue } from "@/config/options";
import type { Ad6DieResult } from "@/utils/AD6Roll";
import { enrichHtml, escapeHtml } from "@/utils/html";
import type { IncomingAttack, WeaponTag } from "@/utils/weaponUtils";

const TAG_COLOR_CLASS: Record<WeaponTag["color"], string> = {
  amber: "rt-chat-tag--amber",
  blue: "rt-chat-tag--blue",
  default: "rt-chat-tag--default",
  green: "rt-chat-tag--green",
  pink: "rt-chat-tag--pink",
  primary: "rt-chat-tag--primary",
  purple: "rt-chat-tag--purple",
  red: "rt-chat-tag--red",
  teal: "rt-chat-tag--teal",
};

export type { IncomingAttack } from "@/utils/weaponUtils";

export type ActionChatKind = "action" | "attack" | "defend";
export type SynergyRole = "source" | "child";

export interface ActionChatSnapshot {
  title: string;
  modifier: RollModifierValue;
  diceCount: number;
  dice: Ad6DieResult[];
  rolledSuccesses: number;
  bonusSuccesses: number;
  skillNames: string[];
  speed?: number;
}

export interface ActionSynergyFlags {
  role: SynergyRole;
  partnerId?: string;
}

export interface ActionChatFlags {
  kind: ActionChatKind;
  action: ActionValue;
  contextUuid: string;
  successes: number;
  incoming?: IncomingAttack;
  pushed?: boolean;
  snapshot?: ActionChatSnapshot;
  synergy?: ActionSynergyFlags;
  fatigueNotice?: boolean;
}

export interface ActionCardInput {
  actor: Actor;
  action: ActionValue;
  title: string;
  modifier: RollModifierValue;
  diceCount: number;
  dice: Ad6DieResult[];
  rolledSuccesses: number;
  bonusSuccesses: number;
  successes: number;
  roll?: foundry.dice.Roll;
  skillNames: string[];
  incoming?: IncomingAttack;
  pushed?: boolean;
  speed?: number;
  synergy?: ActionSynergyFlags;
  fatigueNotice?: boolean;
}

export function actionFlagsOf(message: foundry.documents.ChatMessage): ActionChatFlags | null {
  const flags = message.getFlag("robotech", "action");
  if (!isChatFlags(flags)) {
    return null;
  }
  return flags;
}

/** Whether this card can still open the Synergy split. */
export function canSynergize(flags: ActionChatFlags): boolean {
  if (!flags.snapshot) {
    return false;
  }
  if (flags.successes < 1) {
    return false;
  }
  if (!isConflictAction(flags.action)) {
    return false;
  }
  if (flags.synergy?.role === "child") {
    return false;
  }
  return !flags.synergy?.partnerId;
}

export function actionCardTitle(actor: Actor, action: ActionValue, pushed: boolean, synergy = false): string {
  const fallbackKey = ACTION_OPTIONS[0]?.labelKey ?? "";
  const actionLabel = game.i18n.localize(
    ACTION_OPTIONS.find((option) => option.value === action)?.labelKey ?? fallbackKey
  );
  const key = titleKeyOf(pushed, synergy);
  return game.i18n.localize(key, { action: actionLabel, name: actor.name });
}

export async function postActionCard(input: ActionCardInput): Promise<foundry.documents.ChatMessage | undefined> {
  const flags = flagsFromInput(input);
  const created = await foundry.documents.ChatMessage.create({
    content: cardHtmlOf(flags),
    flags: { robotech: { action: flags } },
    ...(input.roll ? { rolls: [input.roll] } : {}),
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    user: game.user?.id,
  });
  if (created instanceof foundry.documents.ChatMessage) {
    return created;
  }
  if (Array.isArray(created)) {
    const first = created[0];
    return first instanceof foundry.documents.ChatMessage ? first : undefined;
  }
  return undefined;
}

export async function updateActionCard(message: foundry.documents.ChatMessage, flags: ActionChatFlags): Promise<void> {
  await message.update({
    content: cardHtmlOf(flags),
    "flags.robotech.action": flags,
  });
}

function flagsFromInput(input: ActionCardInput): ActionChatFlags {
  return {
    action: input.action,
    contextUuid: input.actor.uuid ?? "",
    fatigueNotice: input.fatigueNotice,
    incoming: input.incoming,
    kind: cardKindOf(input.action, input.incoming),
    pushed: input.pushed,
    snapshot: {
      bonusSuccesses: input.bonusSuccesses,
      dice: input.dice,
      diceCount: input.diceCount,
      modifier: input.modifier,
      rolledSuccesses: input.rolledSuccesses,
      skillNames: input.skillNames,
      speed: input.speed,
      title: input.title,
    },
    successes: input.successes,
    synergy: input.synergy,
  };
}

function titleKeyOf(pushed: boolean, synergy: boolean): string {
  if (synergy && pushed) {
    return "ROBOTECH.Roll.PushedSynergyTitle";
  }
  if (synergy) {
    return "ROBOTECH.Roll.SynergyTitleCard";
  }
  if (pushed) {
    return "ROBOTECH.Roll.PushedTitle";
  }
  return "ROBOTECH.Roll.RollTitle";
}

function cardHtmlOf(flags: ActionChatFlags): string {
  const snapshot = flags.snapshot;
  if (!snapshot) {
    return "";
  }
  return actionCardHtml(flags, snapshot);
}

export interface PoolCardInput {
  actor: Actor;
  title: string;
  modifier: RollModifierValue;
  diceCount: number;
  dice: Ad6DieResult[];
  successes: number;
  roll: foundry.dice.Roll;
}

export async function postPoolCard(input: PoolCardInput): Promise<void> {
  await foundry.documents.ChatMessage.create({
    content: poolCardHtml(input),
    rolls: [input.roll],
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    user: game.user?.id,
  });
}

export async function postDamageCard(breakdown: DamageBreakdown): Promise<void> {
  await foundry.documents.ChatMessage.create({
    content: damageCardHtml(breakdown),
    speaker: foundry.documents.ChatMessage.getSpeaker(),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    user: game.user?.id,
  });
}

export interface ChatCardField {
  label: string;
  value: string;
}

export interface DescriptionCardInput {
  actor?: Actor;
  name: string;
  description: string;
  fields?: ChatCardField[];
  relativeTo?: Actor | Item;
}

/** Posts a description card: name, optional label/value fields, and an enriched description. */
export async function sendToChat(input: DescriptionCardInput): Promise<void> {
  const description = await enrichHtml(input.description, { relativeTo: input.relativeTo });
  await foundry.documents.ChatMessage.create({
    content: descriptionCardHtml(input.name, description, input.fields ?? []),
    speaker: foundry.documents.ChatMessage.getSpeaker({ actor: input.actor }),
    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    user: game.user?.id,
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
  multipliedHits: number;
  armor: number;
  armorPenetration: number;
  resistance: number;
  effectiveArmor: number;
  hitsOverArmor: number;
  damageInflicted: number;
  damageType: DamageTypeValue;
  summaryKey: string;
  calledShot: boolean;
  swarmArmor: boolean;
  hardened: boolean;
  isOverkill: boolean;
  distribution?: DamageDistribution;
}

function descriptionCardHtml(name: string, description: string, fields: ChatCardField[]): string {
  return `
    <div class="rt-chat-card">
      <div class="rt-chat-header">${escapeHtml(name)}</div>
      ${fieldsHtml(fields)}
      ${description ? `<div class="rt-chat-description">${description}</div>` : ""}
    </div>
  `;
}

function fieldsHtml(fields: ChatCardField[]): string {
  const rows = fields.filter((field) => field.value.trim() !== "");
  if (rows.length === 0) {
    return "";
  }
  return `<div class="rt-chat-fields">${rows.map(fieldRowHtml).join("")}</div>`;
}

function fieldRowHtml(field: ChatCardField): string {
  return `<div class="rt-chat-field"><span class="rt-chat-field-label">${escapeHtml(field.label)}</span><strong class="rt-chat-field-value">${escapeHtml(field.value)}</strong></div>`;
}

function cardKindOf(action: ActionValue, incoming?: IncomingAttack): ActionChatKind {
  if (action === "attack") {
    return "attack";
  }
  if (action === "defend" && incoming) {
    return "defend";
  }
  return "action";
}

function actionCardHtml(flags: ActionChatFlags, snapshot: ActionChatSnapshot): string {
  const isChild = flags.synergy?.role === "child";
  const skills = snapshot.skillNames.map((name) => `<div class="rt-chat-skill">${escapeHtml(name)}</div>`).join("");
  const headerClass = flags.pushed ? "rt-chat-header rt-chat-header--danger" : "rt-chat-header";

  return `
    <div class="rt-chat-card">
      <div class="${headerClass}">${escapeHtml(snapshot.title)}</div>
      ${skills ? `<div class="rt-chat-skills">${skills}</div>` : ""}
      ${isChild ? "" : metaBlockHtml(flags.action, snapshot)}
      ${weaponBlockHtml(flags.incoming)}
      ${opposedBlockHtml(flags)}
      ${isChild ? "" : diceBlockHtml(snapshot)}
      ${successFooterHtml(flags.successes, snapshot.rolledSuccesses, snapshot.bonusSuccesses, Boolean(flags.synergy?.partnerId))}
      ${fatigueNoticeHtml(flags)}
      ${actionButtonsHtml(flags)}
    </div>
  `;
}

function metaBlockHtml(action: ActionValue, snapshot: ActionChatSnapshot): string {
  const modifierLabel = game.i18n.localize("ROBOTECH.Roll.Modifier");
  const dicePoolLabel = game.i18n.localize("ROBOTECH.Roll.DicePool");
  return `<div class="rt-chat-meta">
        <span>${modifierLabel}: <strong class="rt-chat-meta-value">${modifierLabelOf(snapshot.modifier)}</strong></span>
        <span>${dicePoolLabel}: <strong class="rt-chat-meta-value">${snapshot.diceCount}d6</strong></span>
        ${initiativeSpeedHtml(action, snapshot.speed)}
      </div>`;
}

function diceBlockHtml(snapshot: ActionChatSnapshot): string {
  const diceHtml = snapshot.dice
    .map((result) => {
      const variant = dieSuccessGradation(result.successes).dieClass;
      return `<span class="rt-die-box ${variant}">${result.die}</span>`;
    })
    .join("");
  return `<div class="rt-dice-grid">${diceHtml}${bonusChipHtml(snapshot.bonusSuccesses)}</div>`;
}

function initiativeSpeedHtml(action: ActionValue, speed: number | undefined): string {
  if (action !== "initiative" || speed === undefined) {
    return "";
  }
  const speedLabel = game.i18n.localize("ROBOTECH.Roll.Speed");
  return `<span>${speedLabel}: <strong class="rt-chat-meta-value">${speed}</strong></span>`;
}

function poolCardHtml(input: PoolCardInput): string {
  const modifierLabel = game.i18n.localize("ROBOTECH.Roll.Modifier");
  const dicePoolLabel = game.i18n.localize("ROBOTECH.Roll.DicePool");
  const modifierName = modifierLabelOf(input.modifier);
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
        <span>${modifierLabel}: <strong class="rt-chat-meta-value">${modifierName}</strong></span>
        <span>${dicePoolLabel}: <strong class="rt-chat-meta-value">${input.diceCount}d6</strong></span>
      </div>
      <div class="rt-dice-grid">${diceHtml}</div>
      ${successFooterHtml(input.successes, input.successes, 0)}
    </div>
  `;
}

function bonusChipHtml(bonus: number): string {
  if (bonus === 0) {
    return "";
  }
  const signed = bonus > 0 ? `+${bonus}` : String(bonus);
  const label = game.i18n.localize("ROBOTECH.Roll.ManualSuccesses");
  const tone = bonus > 0 ? "rt-success-bonus--gain" : "rt-success-bonus--loss";
  return `<span class="rt-success-bonus ${tone}" title="${label}">${signed}</span>`;
}

function successFooterHtml(total: number, rolled: number, bonus: number, hideDetail = false): string {
  const successClass = total > 0 ? "rt-chat-total-value--success" : "rt-chat-total-value--failure";
  const totalLabel = game.i18n.localize("ROBOTECH.Roll.TotalSuccesses");
  const showDetail = !hideDetail && bonus !== 0;
  const detail = showDetail ? `<span class="rt-chat-total-detail">${successDetailHtml(rolled, bonus)}</span>` : "";
  return `<div class="rt-chat-footer">
    <span class="rt-chat-total-copy">
      <span class="rt-chat-total-label">${totalLabel}:</span>
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
  return `<span class="rt-chat-success-part">${label} <strong>${value}</strong></span>`;
}

function weaponBlockHtml(incoming?: IncomingAttack): string {
  if (!incoming) {
    return "";
  }
  const called = incoming.calledShot
    ? `<div class="rt-chat-called">${game.i18n.localize("ROBOTECH.Roll.CalledShotYes")}</div>`
    : "";
  return `<div class="rt-chat-weapon">
    <div class="rt-chat-weapon-name">${escapeHtml(incoming.weaponName)}</div>
    ${weaponTagsHtml(incoming.tags)}
    ${called}
  </div>`;
}

function weaponTagsHtml(tags: WeaponTag[] | undefined): string {
  if (!tags?.length) {
    return "";
  }
  const chips = tags
    .map((tag) => {
      const colorClass = TAG_COLOR_CLASS[tag.color] ?? TAG_COLOR_CLASS.default;
      const title = tag.title ? ` title="${tag.title}"` : "";
      return `<span class="rt-chat-tag ${colorClass}"${title}>${tag.label}</span>`;
    })
    .join("");
  return `<div class="rt-chat-tags">${chips}</div>`;
}

function damageCardHtml(breakdown: DamageBreakdown): string {
  const typeLabel = game.i18n.localize(`ROBOTECH.Damage.DamageClass.${breakdown.damageType}`);
  const summary = game.i18n.localize(breakdown.summaryKey, {
    damage: breakdown.damageInflicted,
    name: breakdown.targetName,
    type: typeLabel,
  });
  const summaryClass = breakdown.isOverkill ? "rt-chat-summary rt-chat-summary--danger" : "rt-chat-summary";
  return `<div class="rt-chat-card">
    <div class="rt-chat-header">${game.i18n.localize("ROBOTECH.Damage.Title")}</div>
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
  if (breakdown.netHits <= 0) {
    return rows.join("");
  }

  rows.push(multiplierRow(breakdown), armorRow(breakdown), armorHitsRow(breakdown), classScaleRow(breakdown));
  return rows.join("");
}

function multiplierRow(breakdown: DamageBreakdown): string {
  if (breakdown.multiplier <= 1) {
    return "";
  }
  return damageRow("ROBOTECH.Damage.Breakdown.MultiplierApplied", {
    hits: breakdown.multipliedHits,
    value: breakdown.multiplier,
  });
}

function armorRow(breakdown: DamageBreakdown): string {
  if (breakdown.hardened) {
    return damageRow("ROBOTECH.Damage.Breakdown.HardenedSwarm", {});
  }
  const penetrationApplies = breakdown.attackType === breakdown.damageType;
  if (breakdown.swarmArmor) {
    if (breakdown.armorPenetration > 0 && !penetrationApplies) {
      return damageRow("ROBOTECH.Damage.Breakdown.SwarmArmorSkipped", {
        ap: breakdown.armorPenetration,
        target: classLabel(breakdown.damageType),
      });
    }
    if (breakdown.armorPenetration > 0 && breakdown.resistance > 0) {
      return damageRow("ROBOTECH.Damage.Breakdown.SwarmArmorResisted", {
        ap: breakdown.armorPenetration,
      });
    }
    return damageRow("ROBOTECH.Damage.Breakdown.SwarmArmor", {
      ap: breakdown.armorPenetration,
    });
  }
  if (breakdown.armorPenetration > 0 && !penetrationApplies) {
    return damageRow("ROBOTECH.Damage.Breakdown.ArmorSkipped", {
      ap: breakdown.armorPenetration,
      armor: breakdown.armor,
      target: classLabel(breakdown.damageType),
    });
  }
  if (breakdown.armorPenetration > 0 && breakdown.resistance > 0) {
    return damageRow("ROBOTECH.Damage.Breakdown.ArmorResisted", {
      ap: breakdown.armorPenetration,
      armor: breakdown.armor,
      effective: breakdown.effectiveArmor,
      resist: breakdown.resistance,
    });
  }
  return damageRow("ROBOTECH.Damage.Breakdown.Armor", {
    ap: breakdown.armorPenetration,
    armor: breakdown.armor,
    effective: breakdown.effectiveArmor,
  });
}

function armorHitsRow(breakdown: DamageBreakdown): string {
  if (breakdown.swarmArmor || breakdown.netHits <= 0) {
    return "";
  }
  return damageRow("ROBOTECH.Damage.Breakdown.HitsOverArmor", {
    hits: breakdown.hitsOverArmor,
  });
}

function classScaleRow(breakdown: DamageBreakdown): string {
  if (breakdown.netHits <= 0) {
    return "";
  }
  const key = classScaleKey(breakdown.attackType, breakdown.damageType);
  if (!key) {
    return "";
  }
  return damageRow(key, {
    attack: classLabel(breakdown.attackType),
    target: classLabel(breakdown.damageType),
  });
}

function classScaleKey(attack: DamageTypeValue, target: DamageTypeValue): string | null {
  if (attack === target) {
    return "ROBOTECH.Damage.Breakdown.ClassSame";
  }
  if ((attack === "light" && target === "mecha") || (attack === "mecha" && target === "naval")) {
    return "ROBOTECH.Damage.Breakdown.ClassReduce";
  }
  if ((attack === "mecha" && target === "light") || (attack === "naval" && target === "mecha")) {
    return "ROBOTECH.Damage.Breakdown.ClassOverkill";
  }
  if (attack === "naval" && target === "light") {
    return "ROBOTECH.Damage.Breakdown.ClassOverkillHeavy";
  }
  if (attack === "light" && target === "naval") {
    return "ROBOTECH.Damage.Breakdown.ClassImmune";
  }
  return null;
}

function classLabel(type: DamageTypeValue): string {
  return game.i18n.localize(`ROBOTECH.Damage.DamageClass.${type}`);
}

function damageRow(key: string, data: Record<string, string | number>): string {
  return `<div class="rt-chat-breakdown-row">${game.i18n.localize(key, data)}</div>`;
}

function distributionHtml(distribution: DamageDistribution | undefined): string {
  if (!distribution) {
    return "";
  }
  const rows = [
    distribution.structure > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Structure", distribution.structure) : "",
    distribution.armor > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Armor", distribution.armor) : "",
    distribution.wounds > 0 ? assignedRow("ROBOTECH.Damage.Distribution.Wounds", distribution.wounds) : "",
    ...distribution.hardware.map((entry) =>
      assignedRow("ROBOTECH.Damage.Distribution.Hardware", entry.amount, {
        name: entry.name,
        suffixKey: "ROBOTECH.Damage.Distribution.HardwareUnit",
      })
    ),
    distribution.unassigned > 0
      ? `<div class="rt-chat-breakdown-row">${signedDamage(distribution.unassigned)} ${game.i18n.localize(
          "ROBOTECH.Damage.Distribution.Unassigned"
        )}</div>`
      : "",
  ].filter(Boolean);
  if (rows.length === 0) {
    return "";
  }
  return `<div class="rt-chat-distribution">
    <div class="rt-chat-distribution-title">${game.i18n.localize("ROBOTECH.Damage.Distribution.Title")}</div>
    ${rows.join("")}
  </div>`;
}

function assignedRow(key: string, amount: number, data?: { name?: string; suffixKey?: string }): string {
  const interpolated = data?.name ? escapeHtml(game.i18n.localize(key, { name: data.name })) : game.i18n.localize(key);
  const suffix = data?.suffixKey ? ` ${game.i18n.localize(data.suffixKey)}` : "";
  return `<div class="rt-chat-breakdown-row">${interpolated} ${signedDamage(amount)}${suffix}</div>`;
}

function signedDamage(amount: number): string {
  return `<span class="rt-chat-damage">−${amount}</span>`;
}

function opposedBlockHtml(flags: ActionChatFlags): string {
  if (flags.kind !== "defend" || !flags.incoming) {
    return "";
  }
  return `<div class="rt-chat-opposed">${metaRow(
    "ROBOTECH.Roll.AttackSuccesses",
    String(flags.incoming.attackSuccesses)
  )}${metaRow("ROBOTECH.Roll.DefendSuccesses", String(flags.successes))}</div>`;
}

function fatigueNoticeHtml(flags: ActionChatFlags): string {
  if (!flags.fatigueNotice) {
    return "";
  }
  return `<div class="rt-chat-summary rt-chat-summary--danger">${game.i18n.localize(
    "ROBOTECH.Roll.PushedSynergyFatigue"
  )}</div>`;
}

function actionButtonsHtml(flags: ActionChatFlags): string {
  const buttons: string[] = [];
  if (canSynergize(flags)) {
    buttons.push(
      `<button type="button" class="rt-chat-button rt-chat-button--ghost" data-rt-action="synergy">${game.i18n.localize(
        "ROBOTECH.Roll.SynergyButton"
      )}</button>`
    );
  }
  if (flags.kind === "attack" || flags.kind === "defend") {
    if (flags.kind === "attack") {
      buttons.push(
        `<button type="button" class="rt-chat-button rt-chat-button--ghost" data-rt-action="defend">${game.i18n.localize(
          "ROBOTECH.Roll.DefendButton"
        )}</button>`
      );
    }
    buttons.push(
      `<button type="button" class="rt-chat-button" data-rt-action="apply-damage">${game.i18n.localize(
        "ROBOTECH.Roll.ApplyDamage"
      )}</button>`
    );
  }
  if (buttons.length === 0) {
    return "";
  }
  return `<div class="rt-chat-actions">${buttons.join("")}</div>`;
}

function metaRow(labelKey: string, value: string): string {
  return `<div class="rt-chat-meta"><span>${game.i18n.localize(labelKey)}: <strong class="rt-chat-meta-value">${value}</strong></span></div>`;
}

function isChatFlags(value: unknown): value is ActionChatFlags {
  if (!value || typeof value !== "object") {
    return false;
  }
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
