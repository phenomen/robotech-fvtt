import type Actor from "@client/documents/actor.mjs";
import type Item from "@client/documents/item.mjs";

import type {
  CharacterDataModel,
  ConflictDataModel,
  PlotEventDataModel,
  SwarmDataModel,
  VesselDataModel,
} from "@/models/actors";
import type {
  CareerDataModel,
  EquipmentSuiteDataModel,
  FeatureDataModel,
  GearDataModel,
  RaceDataModel,
  SkillDataModel,
  TalentDataModel,
  UpgradeDataModel,
  WeaponDataModel,
} from "@/models/items";

/** Maps each registered Actor subtype to the data model that backs its `system` data. */
export interface ActorSystemMap {
  character: CharacterDataModel;
  vessel: VesselDataModel;
  swarm: SwarmDataModel;
  conflict: ConflictDataModel;
  plot_event: PlotEventDataModel;
}

/** Maps each registered Item subtype to the data model that backs its `system` data. */
export interface ItemSystemMap {
  career: CareerDataModel;
  race: RaceDataModel;
  gear: GearDataModel;
  skill: SkillDataModel;
  talent: TalentDataModel;
  equipment_suite: EquipmentSuiteDataModel;
  weapon: WeaponDataModel;
  feature: FeatureDataModel;
  upgrade: UpgradeDataModel;
}

export type ActorType = keyof ActorSystemMap;
export type ItemType = keyof ItemSystemMap;

export type ActorSystem = ActorSystemMap[ActorType];
export type ItemSystem = ItemSystemMap[ItemType];

export type CombatType = "robotech";
export type CombatantType = "robotech";

/** An Actor whose `system` data is known because its subtype is known. */
export interface ActorOf<T extends ActorType> extends Actor {
  type: T;
  system: ActorSystemMap[T];
}

/** An Item whose `system` data is known because its subtype is known. */
export interface ItemOf<T extends ItemType> extends Item {
  type: T;
  system: ItemSystemMap[T];
}

/** Every Actor subtype as a union, so that `type` discriminates `system`. */
export type RobotechActor = { [T in ActorType]: ActorOf<T> }[ActorType];

/** Every Item subtype as a union, so that `type` discriminates `system`. */
export type RobotechItem = { [T in ItemType]: ItemOf<T> }[ItemType];

/** A value written to a single field path of a document update payload. */
export type FieldValue = string | number | boolean | null;

/**
 * Foundry types `DataModel#parent` as a DataModel, and a Document does not structurally satisfy
 * that because the two classes document `_initializationOrder` with different JSDoc. Pinning a data
 * model's parent as both keeps the narrowed declaration assignable to the base class.
 */
export type ParentOf<T> = T & NonNullable<foundry.abstract.DataModel["parent"]>;
