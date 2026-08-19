import { applyCombatType } from "@/utils/combat";

type CombatantBase = foundry.documents.Combatant;
type InitSource = CombatantBase["_initializeSource"];

export class RobotechCombatant extends foundry.documents.Combatant {
  protected override _initializeSource(...args: Parameters<InitSource>): ReturnType<InitSource> {
    const data = args[0];
    if (data && typeof data === "object") applyCombatType(data);
    return super._initializeSource(...args);
  }
}
