/**
 * Foundry describes document data with JSDoc `@mixes` tags, which TypeScript does not carry over
 * onto the document classes. The subtype-specific `system` data is a system concern anyway, so the
 * fields this system relies on are merged onto the shipped document classes here.
 */

import type ActiveEffect from "@client/documents/active-effect.mjs";
import type Actor from "@client/documents/actor.mjs";
import type Combatant from "@client/documents/combatant.mjs";
import type Item from "@client/documents/item.mjs";
import type EmbeddedCollection from "@common/abstract/embedded-collection.mjs";

import type {
  ActorSystem,
  ActorType,
  CombatantType,
  CombatType,
  EffectChange,
  ItemSystem,
  ItemType,
  RobotechItem,
} from "@/models";
import type { CombatantDataModel, CombatDataModel } from "@/models/combat";

declare module "@client/documents/active-effect.mjs" {
  export default interface ActiveEffect {
    name: string;
    img: string;
    disabled: boolean;
    transfer: boolean;
    description: string;
    system: { changes: EffectChange[] };
    sheet: foundry.applications.api.ApplicationV2 | null;
    readonly actor: Actor | null;
    readonly item: Item | null;
    readonly isOwner: boolean;
  }
}

declare module "@client/documents/actor.mjs" {
  export default interface Actor {
    name: string;
    img: string;
    type: ActorType;
    system: ActorSystem;
    items: EmbeddedCollection<RobotechItem>;
    effects: EmbeddedCollection<ActiveEffect>;
    allApplicableEffects(): Generator<ActiveEffect, void, void>;
    prototypeToken: foundry.data.PrototypeToken;
    sheet: foundry.applications.api.ApplicationV2 | null;
    readonly isOwner: boolean;
    statuses: Set<string>;
    toggleStatusEffect(
      statusId: string,
      options?: { active?: boolean; overlay?: boolean },
    ): Promise<foundry.documents.ActiveEffect | boolean | undefined>;
  }
}

declare module "@client/documents/item.mjs" {
  export default interface Item {
    name: string;
    img: string;
    type: ItemType;
    system: ItemSystem;
    effects: EmbeddedCollection<ActiveEffect>;
    sheet: foundry.applications.api.ApplicationV2 | null;
  }
}

declare module "@client/documents/user.mjs" {
  export default interface User {
    role: number;
    readonly isGM: boolean;
  }
}

declare module "@client/documents/combat.mjs" {
  export default interface Combat {
    type: CombatType;
    system: CombatDataModel;
    round: number;
    turn: number | null;
    started: boolean;
    combatants: EmbeddedCollection<Combatant>;
    turns: Combatant[];
    combatant: Combatant | null;
    activate(options?: object): Promise<this>;
    startCombat(): Promise<this>;
    nextTurn(): Promise<this>;
    previousTurn(): Promise<this>;
    nextRound(): Promise<this>;
    previousRound(): Promise<this>;
    getCombatantsByActor(actor: Actor | string): Combatant[];
    getTimeDelta(fromRound: number, fromTurn: number | null, toRound: number, toTurn: number | null): number;
    _playCombatSound(announcement: string): void;
    _onUpdate(changed: object, options: object, userId: string): void;
    _onDelete(options: object, userId: string): void;
    update(data: object, operation?: object): Promise<this | undefined>;
    updateEmbeddedDocuments(embeddedName: "Combatant", updates: object[], operation?: object): Promise<Combatant[]>;
  }
}

declare module "@client/documents/combatant.mjs" {
  export default interface Combatant {
    type: CombatantType;
    system: CombatantDataModel;
    id: string | null;
    name: string;
    img: string | undefined;
    initiative: number | null;
    hidden: boolean;
    defeated: boolean;
    actor: Actor | null;
    isDefeated: boolean;
    visible: boolean;
    readonly isOwner: boolean;
  }
}
