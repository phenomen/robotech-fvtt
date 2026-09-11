import { expandChanges, numberAt, pathTouched } from "@/models/changePatch";

export interface Gauge {
  value: number;
  max: number;
}

export function gaugeSchema(initial = 0): foundry.data.fields.SchemaField {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    max: new fields.NumberField({ initial, integer: true, min: 0 }),
    value: new fields.NumberField({ initial, integer: true, min: 0 }),
  });
}

export function woundCategorySchema(initialMax: number): foundry.data.fields.SchemaField {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: initialMax, integer: true, min: 0 }),
    states: new fields.ArrayField(new fields.BooleanField({ initial: false })),
    value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
  });
}

/** Clamps `path.value` to `[0, path.max]` when either gauge field is in the patch. */
export function clampGauge(gauge: Gauge, changes: object, path: string): void {
  if (!pathTouched(changes, path)) {
    return;
  }
  const expanded = expandChanges(changes);
  const nextMax = Math.max(0, numberAt(expanded, `${path}.max`) ?? gauge.max);
  const requested = numberAt(expanded, `${path}.value`) ?? gauge.value;
  const nextValue = Math.min(Math.max(0, requested), nextMax);
  if (nextValue === requested) {
    return;
  }
  foundry.utils.setProperty(changes, `${path}.value`, nextValue);
}
