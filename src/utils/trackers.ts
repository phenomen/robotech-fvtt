/** Shared shape of the boolean-box trackers (conflict ticks, character wounds). */
export interface BoxTracker {
  max: number;
  value: number;
  states: boolean[];
}

export function countCheckedBoxes(states: readonly boolean[]): number {
  return states.reduce((count, state) => count + (state ? 1 : 0), 0);
}

/** Resizes a states array to `length`, preserving existing values and padding with false. */
export function resizeBoxStates(states: readonly boolean[], length: number): boolean[] {
  return Array.from({ length }, (_unused, index) => states[index] ?? false);
}

/** In-place sync for `prepareDerivedData`: clamps max, resizes states, re-derives value. */
export function syncBoxTracker(tracker: BoxTracker): void {
  tracker.max = Math.max(0, tracker.max);
  if (tracker.states.length !== tracker.max) {
    tracker.states = resizeBoxStates(tracker.states, tracker.max);
  }
  tracker.value = countCheckedBoxes(tracker.states);
}
