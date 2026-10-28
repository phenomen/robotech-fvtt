import { ARMOR_CLASS_VALUES, WEALTH_VALUES } from "@/config/options";
import type { ArmorClassValue, WealthValue } from "@/config/options";
import { MENTAL_BREAK_STATUS_ID } from "@/config/statuses";
import {
  MAX_BRAWL_WOUNDS,
  MAX_CRITICAL_WOUNDS,
  MENTAL_BREAK_THRESHOLD,
  STRESS_BOX_COUNT,
  woundBaselines,
} from "@/config/wounds";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import { gaugeSchema } from "@/models/actors/gaugeSchema";
import type { Gauge } from "@/models/actors/gaugeSchema";
import { expandChanges, numberAt, pathTouched } from "@/models/changePatch";
import { findItemOf } from "@/utils/documents";
import { syncBoxTracker } from "@/utils/trackers";
import type { BoxTracker } from "@/utils/trackers";

export type WoundCategory = BoxTracker;

export interface VitalsSettings {
  brawl: number | null;
  critical: number | null;
  isTriumvirateWounds: boolean;
}

export interface StressData {
  value: number;
  drama: number;
  fatigue: number;
  dramas: string[];
  boxes: string[];
}

export interface CharacterNature {
  disposition: string;
  demeanor: string;
}

export interface HeroicMove {
  name: string;
  used: boolean;
  description: string;
}

export interface VitalBar {
  value: number;
  max: number;
}

export interface CharacterVitals {
  wounds: VitalBar;
  stress: VitalBar;
}

export class CharacterDataModel extends ActorDataModel {
  declare level: number;
  declare experience: number;
  declare buildPoints: number;
  declare armor: Gauge;
  declare armorClass: ArmorClassValue;
  declare resistance: number;
  declare callsign: string;
  declare organization: string;
  declare nature: CharacterNature;
  declare burnout: number;
  declare speed: number;
  declare wealth: WealthValue;
  declare vitalsSettings: VitalsSettings;
  declare wounds: { brawl: WoundCategory; critical: WoundCategory };
  declare vitals: CharacterVitals;
  declare stress: StressData;
  declare heroicMove: HeroicMove;
  declare proficiencies: string[];
  /** Which wound counts came from the baseline rather than an explicit override. */
  declare woundDefaults: { baseline: { brawl: number; critical: number }; brawl: boolean; critical: boolean };

  declare rank: number;
  declare rankTitle: string;
  declare fame: number;
  declare fameTitle: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      armor: gaugeSchema(),
      armorClass: new fields.StringField({
        choices: ARMOR_CLASS_VALUES,
        // "light"
        initial: ARMOR_CLASS_VALUES[0],
      }),
      buildPoints: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      burnout: new fields.NumberField({ initial: 5, integer: true, min: 1 }),
      callsign: new fields.StringField({ initial: "" }),
      experience: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      heroicMove: new fields.SchemaField({
        description: new fields.StringField({ initial: "" }),
        name: new fields.StringField({ initial: "" }),
        used: new fields.BooleanField({ initial: false }),
      }),
      level: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
      nature: new fields.SchemaField({
        demeanor: new fields.StringField({ initial: "" }),
        disposition: new fields.StringField({ initial: "" }),
      }),
      organization: new fields.StringField({ initial: "" }),
      proficiencies: new fields.ArrayField(new fields.StringField()),
      resistance: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      speed: new fields.NumberField({ initial: 3, integer: true, min: 0 }),
      stress: new fields.SchemaField({
        boxes: new fields.ArrayField(new fields.StringField({ initial: "" })),
        dramas: new fields.ArrayField(new fields.StringField({ initial: "" }), {
          initial: () => Array.from({ length: STRESS_BOX_COUNT }, () => ""),
        }),
      }),
      vitalsSettings: new fields.SchemaField({
        brawl: new fields.NumberField({
          integer: true,
          max: MAX_BRAWL_WOUNDS,
          min: 0,
          nullable: true,
        }),
        critical: new fields.NumberField({
          integer: true,
          max: MAX_CRITICAL_WOUNDS,
          min: 0,
          nullable: true,
        }),
        isTriumvirateWounds: new fields.BooleanField({ initial: false }),
      }),
      wealth: new fields.StringField({
        choices: WEALTH_VALUES,
        // "standard"
        initial: WEALTH_VALUES[1],
      }),
      wounds: new fields.SchemaField({
        brawl: woundStatesSchema(),
        critical: woundStatesSchema(),
      }),
    };
  }

  /**
   * Resolves unset wound counts to the baseline before Active Effects run, so an "add" change raises
   * the baseline instead of replacing a null.
   */
  override prepareBaseData(): void {
    super.prepareBaseData();
    const settings = this.vitalsSettings,
      baseline = woundBaselines(settings.isTriumvirateWounds);
    this.woundDefaults = {
      baseline,
      brawl: settings.brawl === null,
      critical: settings.critical === null,
    };
    settings.brawl ??= baseline.brawl;
    settings.critical ??= baseline.critical;
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.armor.value = this.armor.max;
    this.prepareCareerInfo();
    this.prepareWounds();
    this.prepareStress();
    this.prepareVitals();
  }

  override async _preUpdate(
    changes: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[1],
    user: Parameters<foundry.abstract.TypeDataModel["_preUpdate"]>[2]
  ): Promise<boolean | void> {
    syncArmorValue(this.armor, changes);
    return await super._preUpdate(changes, options, user);
  }

  private prepareCareerInfo() {
    const career = findItemOf(this.parent, "career");
    this.rank = career?.system.rank ?? 0;
    this.rankTitle = career?.system.rankTitle ?? "";
    this.fame = career?.system.fame ?? 0;
    this.fameTitle = career?.system.fameTitle ?? "";
  }

  private prepareWounds() {
    const settings = this.vitalsSettings,
      { wounds, woundDefaults } = this,
      // An effect may toggle Triumvirate after the baseline was resolved; move defaulted counts with it.
      baseline = woundBaselines(settings.isTriumvirateWounds),
      brawlShift = woundDefaults.brawl ? baseline.brawl - woundDefaults.baseline.brawl : 0,
      criticalShift = woundDefaults.critical ? baseline.critical - woundDefaults.baseline.critical : 0,
      brawl = (settings.brawl ?? 0) + brawlShift,
      critical = (settings.critical ?? 0) + criticalShift;

    syncBoxTracker(Object.assign(wounds.brawl, { max: clampMax(brawl, MAX_BRAWL_WOUNDS) }));
    syncBoxTracker(Object.assign(wounds.critical, { max: clampMax(critical, MAX_CRITICAL_WOUNDS) }));
  }

  private prepareVitals() {
    const { wounds, stress } = this,
      maxWounds = wounds.brawl.max + wounds.critical.max,
      checkedWounds = wounds.brawl.value + wounds.critical.value;
    this.vitals = {
      stress: { max: STRESS_BOX_COUNT, value: stress.value },
      wounds: { max: maxWounds, value: Math.max(0, maxWounds - checkedWounds) },
    };
  }

  private prepareStress() {
    const stress = this.stress;
    stress.boxes = syncStressBoxes(stress.boxes);
    stress.dramas = syncDramaLines(stress.dramas);
    stress.fatigue = stress.boxes.filter((box) => box === "F").length;
    stress.drama = stress.boxes.filter((box) => box === "D").length;
    stress.value = stress.boxes.filter(Boolean).length;
  }

  get isMentalBreak(): boolean {
    return this.parent.statuses.has(MENTAL_BREAK_STATUS_ID);
  }

  override _onUpdate(
    changed: Parameters<foundry.abstract.TypeDataModel["_onUpdate"]>[0],
    options: Parameters<foundry.abstract.TypeDataModel["_onUpdate"]>[1],
    userId: Parameters<foundry.abstract.TypeDataModel["_onUpdate"]>[2]
  ): void {
    super._onUpdate(changed, options, userId);
    if (game.user?.id !== userId) {
      return;
    }
    applyMentalBreak(this, changed);
  }
}

/** Only the box states persist; `max` and `value` are derived in `prepareWounds`. */
function woundStatesSchema(): foundry.data.fields.SchemaField {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
  });
}

function clampMax(value: number, ceiling: number): number {
  return Math.min(ceiling, Math.max(0, value));
}

function syncStressBoxes(boxes: string[]): string[] {
  if (boxes.length === STRESS_BOX_COUNT) {
    return boxes;
  }
  return Array.from({ length: STRESS_BOX_COUNT }, (_unused, index) => boxes[index] ?? "");
}

function syncDramaLines(dramas: string[]): string[] {
  if (dramas.length === STRESS_BOX_COUNT) {
    return dramas;
  }
  return Array.from({ length: STRESS_BOX_COUNT }, (_unused, index) => dramas[index] ?? "");
}

function applyMentalBreak(system: CharacterDataModel, changed: object): void {
  if (system.stress.value < MENTAL_BREAK_THRESHOLD) {
    return;
  }
  if (!stressChanged(changed)) {
    return;
  }
  const actor = system.parent;
  if (actor.statuses.has(MENTAL_BREAK_STATUS_ID)) {
    return;
  }
  void actor.toggleStatusEffect(MENTAL_BREAK_STATUS_ID, { active: true });
}

function stressChanged(changed: object): boolean {
  return Object.keys(foundry.utils.flattenObject(changed)).some(
    (key) => key === "system.stress" || key.startsWith("system.stress.")
  );
}

function syncArmorValue(armor: Gauge, changes: object): void {
  if (!pathTouched(changes, "system.armor")) {
    return;
  }
  const expanded = expandChanges(changes),
    nextMax = numberAt(expanded, "system.armor.max") ?? armor.max;
  foundry.utils.setProperty(changes, "system.armor.value", Math.max(0, nextMax));
}
