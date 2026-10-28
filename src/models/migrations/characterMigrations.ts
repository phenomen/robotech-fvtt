import { STRESS_BOX_COUNT } from "@/config/wounds";

type SourceRecord = Record<string, unknown>;

function isRecord(value: unknown): value is SourceRecord {
  return foundry.utils.isPlainObject(value);
}

/**
 * Character sources from releases up to 2.0.0 may store a wound or stress count without the boxes behind
 * it; those releases rebuilt the boxes while preparing data. The counts are now derived from the boxes and
 * no longer persisted, so the boxes are rebuilt here instead. Each step only fires when the old count is
 * present and the boxes are missing, so it is safe on the partial sources Foundry migrates during updates.
 */
export function migrateCharacterSource(source: object): void {
  if (!isRecord(source)) {
    return;
  }
  const { stress, wounds } = source;
  if (isRecord(wounds)) {
    migrateWoundCategory(wounds.brawl);
    migrateWoundCategory(wounds.critical);
  }
  if (isRecord(stress)) {
    migrateStressBoxes(stress);
  }
}

/** `{ value: 2 }` → `{ states: [true, true] }`; preparation pads the states up to the wound maximum. */
function migrateWoundCategory(category: unknown): void {
  if (!isRecord(category) || !hasCountWithoutBoxes(category.value, category.states)) {
    return;
  }
  category.states = Array.from({ length: category.value }, () => true);
}

/** `{ value: 2 }` → `{ boxes: ["F", "F"] }`; old counts could not tell Fatigue from Drama, so both read as Fatigue. */
function migrateStressBoxes(stress: SourceRecord): void {
  if (!hasCountWithoutBoxes(stress.value, stress.boxes)) {
    return;
  }
  stress.boxes = Array.from({ length: Math.min(stress.value, STRESS_BOX_COUNT) }, () => "F");
}

function hasCountWithoutBoxes(count: unknown, boxes: unknown): count is number {
  const isEmpty = boxes === undefined || (Array.isArray(boxes) && boxes.length === 0);
  return typeof count === "number" && count > 0 && isEmpty;
}
