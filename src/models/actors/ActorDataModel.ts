import type Actor from "@client/documents/actor.mjs";

import type { ActorType, ParentOf } from "@/models/documents";

type TypeDataModelBase = foundry.abstract.TypeDataModel;
type PreCreateData = Parameters<TypeDataModelBase["_preCreate"]>[0];
type PreCreateOptions = Parameters<TypeDataModelBase["_preCreate"]>[1];
type PreCreateUser = Parameters<TypeDataModelBase["_preCreate"]>[2];

const TOKEN_BARS: Record<ActorType, { bar1: string | null; bar2: string | null }> = {
  character: { bar1: "vitals.wounds", bar2: "vitals.stress" },
  vessel: { bar1: "structure", bar2: null },
  swarm: { bar1: "structure", bar2: "vessels" },
  conflict: { bar1: "tracker", bar2: null },
  plot_event: { bar1: null, bar2: null },
};

export class ActorDataModel extends foundry.abstract.TypeDataModel {
  declare parent: ParentOf<Actor>;

  declare description: string;

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ initial: "" }),
    };
  }

  override async _preCreate(
    data: PreCreateData,
    options: PreCreateOptions,
    user: PreCreateUser,
  ): Promise<boolean | void> {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    this.applyTokenDefaults(data);
  }

  private applyTokenDefaults(data: PreCreateData): void {
    if (!game.settings.get("robotech", "applyTokenDefaults")) return;

    const provided = prototypeTokenOf(data);
    const bars = TOKEN_BARS[this.parent.type];
    const patch: {
      displayBars?: number;
      bar1?: { attribute: string | null };
      bar2?: { attribute: string | null };
    } = {};

    if (!("displayBars" in provided)) {
      patch.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
    }
    if (!("bar1" in provided)) {
      patch.bar1 = { attribute: bars.bar1 };
    }
    if (!("bar2" in provided)) {
      patch.bar2 = { attribute: bars.bar2 };
    }
    if (Object.keys(patch).length === 0) return;

    this.parent.prototypeToken.updateSource(patch);
  }
}

function prototypeTokenOf(data: PreCreateData): object {
  if (!("prototypeToken" in data)) return {};
  const token = data.prototypeToken;
  if (!token || typeof token !== "object") return {};
  return token;
}
