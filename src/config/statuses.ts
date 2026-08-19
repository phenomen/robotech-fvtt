export const DEFEATED_STATUS_ID = "dead";
export const SLOWED_STATUS_ID = "slowed";
export const MENTAL_BREAK_STATUS_ID = "mental";

export const STATUS_EFFECTS = [
  {
    id: DEFEATED_STATUS_ID,
    name: "ROBOTECH.Status.Defeated",
    img: "systems/robotech/assets/icons/status-defeated.svg",
    order: 0,
  },
  {
    id: SLOWED_STATUS_ID,
    name: "ROBOTECH.Status.Slowed",
    img: "systems/robotech/assets/icons/status-slowed.svg",
    order: 1,
  },
  {
    id: MENTAL_BREAK_STATUS_ID,
    name: "ROBOTECH.Status.MentalBreak",
    img: "systems/robotech/assets/icons/status-mental.svg",
    order: 2,
  },
] as const;
