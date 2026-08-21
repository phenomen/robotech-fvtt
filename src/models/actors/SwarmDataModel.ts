import { DAMAGE_TYPE_VALUES, type DamageTypeValue } from "@/config/options";
import { ActorDataModel } from "@/models/actors/ActorDataModel";
import type { VesselGauge } from "@/models/actors/VesselDataModel";
import { isMemberAlive } from "@/utils/swarmUtils";

export interface SwarmMember {
  id: string;
  actorUuid: string;
  name: string;
  img: string;
  armor: number;
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
  declare damageClass: DamageTypeValue;

  declare vessels: VesselGauge;
  declare structure: VesselGauge;
  declare minSpeed: number;
  declare maxSpeed: number;
  declare averageSpeed: number;
  declare speed: number;

  static override defineSchema() {
    const fields = foundry.data.fields;

    const swarmMemberSchema = () =>
      new fields.SchemaField({
        id: new fields.StringField({ initial: "" }),
        actorUuid: new fields.StringField({ initial: "" }),
        name: new fields.StringField({ initial: "" }),
        img: new fields.StringField({ initial: "icons/svg/item-bag.svg" }),
        armor: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        originalStructure: new fields.NumberField({ initial: 3, integer: true, min: 1 }),
        reducedStructure: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
        currentStructure: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        count: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        maxCount: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        speed: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      });

    return {
      ...super.defineSchema(),
      members: new fields.ArrayField(swarmMemberSchema(), { initial: [] }),
      damageClass: new fields.StringField({
        initial: DAMAGE_TYPE_VALUES[1], // "mecha"
        choices: DAMAGE_TYPE_VALUES,
      }),
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

  private computeVessels(): VesselGauge {
    let value = 0;
    let max = 0;
    for (const member of this.members) {
      if (isMemberAlive(member)) value += member.count;
      max += member.maxCount;
    }
    return { value, max };
  }

  private computeStructure(): VesselGauge {
    let value = 0;
    let max = 0;
    for (const member of this.members) {
      max += member.reducedStructure * member.maxCount;
      if (isMemberAlive(member)) {
        value += member.currentStructure + member.reducedStructure * (member.count - 1);
      }
    }
    return { value, max };
  }

  private computeSpeeds(): SwarmSpeeds {
    const speeds = this.members.filter(isMemberAlive).map((member) => member.speed);
    if (speeds.length === 0) return { min: 0, max: 0, average: 0 };

    const sum = speeds.reduce((acc, value) => acc + value, 0);
    return {
      min: Math.min(...speeds),
      max: Math.max(...speeds),
      average: Math.round(sum / speeds.length),
    };
  }
}
