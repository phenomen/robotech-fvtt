export const DEFEATED_STATUS_ID = "dead";
export const SLOWED_STATUS_ID = "slowed";
export const MENTAL_BREAK_STATUS_ID = "mental";

export const STATUS_EFFECTS = [
  {
    id: DEFEATED_STATUS_ID,
    img: "systems/robotech/assets/icons/status-defeated.svg",
    name: "ROBOTECH.Status.Defeated",
    order: 0,
  },
  {
    id: SLOWED_STATUS_ID,
    img: "systems/robotech/assets/icons/status-slowed.svg",
    name: "ROBOTECH.Status.Slowed",
    order: 1,
  },
  {
    id: MENTAL_BREAK_STATUS_ID,
    img: "systems/robotech/assets/icons/status-mental.svg",
    name: "ROBOTECH.Status.MentalBreak",
    order: 2,
  },
] as const;
