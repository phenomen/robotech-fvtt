import { WEALTH_VALUES, type WealthValue } from "@/config/choices";
import {
  MAX_BRAWL_WOUNDS,
  MAX_CRITICAL_WOUNDS,
  MENTAL_BREAK_THRESHOLD,
  STRESS_BOX_COUNT,
  woundBaselines,
} from "@/config/wounds";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import { findItemOf } from "@/utils/documents";

export interface WoundCategory {
  value: number;
  max: number;
  states: boolean[];
}

export interface VitalsSettings {
  brawl: number | null;
  critical: number | null;
  isMechaWounds: boolean;
  isTriumvirateWounds: boolean;
}

export interface StressData {
  value: number;
  drama: number;
  fatigue: number;
  drama1: string;
  drama2: string;
  drama3: string;
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
  declare armor: number;
  declare career: string;
  declare element: string;
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
  declare skills: Record<string, unknown>;

  declare rank: number;
  declare rankTitle: string;
  declare fame: number;
  declare fameTitle: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      level: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
      experience: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      buildPoints: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      armor: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      career: new fields.StringField({ initial: "" }),
      element: new fields.StringField({ initial: "" }),
      nature: new fields.SchemaField({
        disposition: new fields.StringField({ initial: "" }),
        demeanor: new fields.StringField({ initial: "" }),
      }),
      burnout: new fields.NumberField({ initial: 5, integer: true, min: 1 }),
      speed: new fields.NumberField({ initial: 3, integer: true, min: 0 }),
      wealth: new fields.StringField({
        initial: WEALTH_VALUES[1], // "standard"
        choices: WEALTH_VALUES,
      }),
      vitalsSettings: new fields.SchemaField({
        brawl: new fields.NumberField({
          integer: true,
          min: 0,
          max: MAX_BRAWL_WOUNDS,
          nullable: true,
        }),
        critical: new fields.NumberField({
          integer: true,
          min: 0,
          max: MAX_CRITICAL_WOUNDS,
          nullable: true,
        }),
        isMechaWounds: new fields.BooleanField({ initial: false }),
        isTriumvirateWounds: new fields.BooleanField({ initial: false }),
      }),
      vitals: new fields.SchemaField({
        wounds: new fields.SchemaField({
          value: new fields.NumberField({ initial: 4, integer: true, min: 0 }),
          max: new fields.NumberField({ initial: 4, integer: true, min: 0 }),
        }),
        stress: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
          max: new fields.NumberField({
            initial: STRESS_BOX_COUNT,
            integer: true,
            min: 0,
          }),
        }),
      }),
      wounds: new fields.SchemaField({
        brawl: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
          max: new fields.NumberField({ initial: 3, integer: true, min: 0 }),
          states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
        }),
        critical: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
          max: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
          states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
        }),
      }),
      stress: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0,
          integer: true,
          min: 0,
          max: STRESS_BOX_COUNT,
        }),
        drama: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        fatigue: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        drama1: new fields.StringField({ initial: "" }),
        drama2: new fields.StringField({ initial: "" }),
        drama3: new fields.StringField({ initial: "" }),
        boxes: new fields.ArrayField(new fields.StringField({ initial: "" })),
      }),
      heroicMove: new fields.SchemaField({
        name: new fields.StringField({ initial: "" }),
        used: new fields.BooleanField({ initial: false }),
        description: new fields.StringField({ initial: "" }),
      }),
      proficiencies: new fields.ArrayField(new fields.StringField()),
      skills: new fields.ObjectField({ initial: {} }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.prepareCareerInfo();
    this.prepareWounds();
    this.prepareStress();
    this.prepareVitals();
  }

  private prepareCareerInfo() {
    const career = findItemOf(this.parent, "career");
    this.rank = career?.system.rank ?? 0;
    this.rankTitle = career?.system.rankTitle ?? "";
    this.fame = career?.system.fame ?? 0;
    this.fameTitle = career?.system.fameTitle ?? "";
  }

  private prepareWounds() {
    const settings = this.vitalsSettings;
    const wounds = this.wounds;
    const baseline = woundBaselines(settings.isTriumvirateWounds);

    syncWoundCategory(wounds.brawl, clampMax(settings.brawl ?? baseline.brawl, MAX_BRAWL_WOUNDS));
    syncWoundCategory(wounds.critical, clampMax(settings.critical ?? baseline.critical, MAX_CRITICAL_WOUNDS));
  }

  private prepareVitals() {
    const { vitals, wounds, stress } = this;
    const maxWounds = wounds.brawl.max + wounds.critical.max;
    const checkedWounds = wounds.brawl.value + wounds.critical.value;
    vitals.wounds.max = maxWounds;
    vitals.wounds.value = Math.max(0, maxWounds - checkedWounds);
    vitals.stress.max = STRESS_BOX_COUNT;
    vitals.stress.value = stress.value;
  }

  private prepareStress() {
    const stress = this.stress;
    stress.boxes = syncStressBoxes(stress.boxes, stress.value);
    stress.fatigue = stress.boxes.filter((box) => box === "F").length;
    stress.drama = stress.boxes.filter((box) => box === "D").length;
    stress.value = stress.boxes.filter(Boolean).length;
  }

  get totalStress(): number {
    return this.stress.value;
  }

  get isMentalBreak(): boolean {
    return this.stress.value >= MENTAL_BREAK_THRESHOLD;
  }
}

function clampMax(value: number, ceiling: number): number {
  return Math.min(ceiling, Math.max(0, value));
}

function syncWoundCategory(category: WoundCategory, max: number) {
  category.max = max;
  const previous = category.states;
  if (previous.length !== max) {
    category.states = Array.from({ length: max }, (_unused, index) => {
      if (index < previous.length) return previous[index] ?? false;
      return previous.length === 0 && index < category.value;
    });
  }
  category.value = category.states.filter(Boolean).length;
}

function syncStressBoxes(boxes: string[], value: number): string[] {
  if (boxes.length === STRESS_BOX_COUNT) return boxes;
  return Array.from({ length: STRESS_BOX_COUNT }, (_unused, index) => {
    if (index < boxes.length) return boxes[index] ?? "";
    return boxes.length === 0 && index < value ? "F" : "";
  });
}
