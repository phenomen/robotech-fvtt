/** Keep Foundry's special DEFEATED id so combatant overlays and `isDefeated` still work. */
export const DEFEATED_STATUS_ID = "dead";
export const SLOWED_STATUS_ID = "slowed";

export const STATUS_EFFECTS = [
  {
    id: DEFEATED_STATUS_ID,
    name: "ROBOTECH.Status.Defeated",
    img: "systems/robotech/assets/icons/status-destroyed.svg",
    order: 0,
  },
  {
    id: SLOWED_STATUS_ID,
    name: "ROBOTECH.Status.Slowed",
    img: "systems/robotech/assets/icons/status-slowed.svg",
    order: 1,
  },
] as const;
