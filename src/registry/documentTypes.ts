import {
  CharacterDataModel,
  ConflictDataModel,
  PlotEventDataModel,
  SwarmDataModel,
  VesselDataModel,
} from "@/models/actors";
import { CombatDataModel, CombatantDataModel } from "@/models/combat";
import type { ActorType, ItemType } from "@/models/documents";
import {
  CareerDataModel,
  ElementDataModel,
  EquipmentSuiteDataModel,
  FeatureDataModel,
  GearDataModel,
  RaceDataModel,
  SkillDataModel,
  TalentDataModel,
  UpgradeDataModel,
  WeaponDataModel,
} from "@/models/items";

/** Every Actor subtype's backing data model. The key set must match `system.json` `documentTypes`. */
export const ACTOR_DATA_MODELS = {
  character: CharacterDataModel,
  conflict: ConflictDataModel,
  plot_event: PlotEventDataModel,
  swarm: SwarmDataModel,
  vessel: VesselDataModel,
} satisfies Record<ActorType, unknown>;

/** Every Item subtype's backing data model. The key set must match `system.json` `documentTypes`. */
export const ITEM_DATA_MODELS = {
  career: CareerDataModel,
  element: ElementDataModel,
  equipment_suite: EquipmentSuiteDataModel,
  feature: FeatureDataModel,
  gear: GearDataModel,
  race: RaceDataModel,
  skill: SkillDataModel,
  talent: TalentDataModel,
  upgrade: UpgradeDataModel,
  weapon: WeaponDataModel,
} satisfies Record<ItemType, unknown>;

export const COMBAT_DATA_MODELS = { robotech: CombatDataModel } as const;
export const COMBATANT_DATA_MODELS = { robotech: CombatantDataModel } as const;

export function registerDataModels(): void {
  Object.assign(CONFIG.Actor.dataModels, ACTOR_DATA_MODELS);
  Object.assign(CONFIG.Item.dataModels, ITEM_DATA_MODELS);
  Object.assign(CONFIG.Combat.dataModels, COMBAT_DATA_MODELS);
  Object.assign(CONFIG.Combatant.dataModels, COMBATANT_DATA_MODELS);
}
