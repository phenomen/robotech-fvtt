import { ARMOR_CLASS_VALUES } from "@/config/options";
import type { ArmorClassValue } from "@/config/options";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import type { Gauge } from "@/models/actors/gauges";
import { isMemberAlive, leadStructureOf, memberStructureOf } from "@/utils/swarmUtils";

export interface SwarmMember {
  id: string;
  actorUuid: string;
  name: string;
  img: string;
  armor: number;
  resistance: number;
  originalStructure: number;
  reducedStructure: number;
  currentStructure: number;
  count: number;
  maxCount: number;
  speed: number;
}

interface SwarmSpeeds {
  min: number;
  max: number;
  average: number;
}

export class SwarmDataModel extends ActorDataModel {
  declare members: SwarmMember[];
  declare armorClass: ArmorClassValue;
  declare hardened: boolean;

  declare vessels: Gauge;
  declare structure: Gauge;
  declare minSpeed: number;
  declare maxSpeed: number;
  declare averageSpeed: number;
  declare speed: number;

  static override defineSchema() {
    const fields = foundry.data.fields;

    const swarmMemberSchema = () =>
      new fields.SchemaField({
        actorUuid: new fields.StringField({ initial: "" }),
        armor: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        count: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        currentStructure: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        id: new fields.StringField({ initial: "" }),
        img: new fields.StringField({ initial: "icons/svg/item-bag.svg" }),
        maxCount: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        name: new fields.StringField({ initial: "" }),
        originalStructure: new fields.NumberField({ initial: 3, integer: true, min: 1 }),
        reducedStructure: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
        resistance: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        speed: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      });

    return {
      ...super.defineSchema(),
      armorClass: new fields.StringField({
        choices: ARMOR_CLASS_VALUES,
        // "mecha"
        initial: ARMOR_CLASS_VALUES[1],
      }),
      hardened: new fields.BooleanField({ initial: false }),
      members: new fields.ArrayField(swarmMemberSchema(), { initial: [] }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    this.vessels = this.computeVessels();
    this.structure = this.computeStructure();

    const speeds = this.computeSpeeds();
    this.minSpeed = speeds.min;
    this.maxSpeed = speeds.max;
    this.averageSpeed = speeds.average;
    this.speed = speeds.average;
  }

  private computeVessels(): Gauge {
    let value = 0;
    let max = 0;
    for (const member of this.members) {
      if (isMemberAlive(member)) {
        value += member.count;
      }
      max += member.maxCount;
    }
    return { max, value };
  }

  private computeStructure(): Gauge {
    let value = 0;
    let max = 0;
    for (const member of this.members) {
      const structure = memberStructureOf(member, this.hardened);
      max += structure * member.maxCount;
      if (isMemberAlive(member)) {
        value += leadStructureOf(member, this.hardened) + structure * (member.count - 1);
      }
    }
    return { max, value };
  }

  private computeSpeeds(): SwarmSpeeds {
    const speeds: number[] = [];
    for (const member of this.members) {
      if (isMemberAlive(member)) {
        speeds.push(member.speed);
      }
    }
    if (speeds.length === 0) {
      return { average: 0, max: 0, min: 0 };
    }

    const sum = speeds.reduce((acc, value) => acc + value, 0);
    return {
      average: Math.round(sum / speeds.length),
      max: Math.max(...speeds),
      min: Math.min(...speeds),
    };
  }
}
