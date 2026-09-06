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
