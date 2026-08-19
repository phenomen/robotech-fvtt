export interface HardwareSlots {
  value: number;
  destroyed: boolean[];
}

export function hardwareSlotsFields(options?: { initialValue?: number; min?: number }): {
  value: foundry.data.fields.NumberField;
  destroyed: foundry.data.fields.ArrayField<foundry.data.fields.BooleanField>;
} {
  const fields = foundry.data.fields;
  return {
    value: new fields.NumberField({
      initial: options?.initialValue ?? 0,
      integer: true,
      min: options?.min ?? 0,
    }),
    destroyed: new fields.ArrayField(new fields.BooleanField({ initial: false }), { initial: [] }),
  };
}

export function hardwareSlotsSchema(options?: {
  initialValue?: number;
  min?: number;
}): foundry.data.fields.SchemaField {
  const fields = foundry.data.fields;
  return new fields.SchemaField(hardwareSlotsFields(options));
}

export function syncDestroyedSlots(value: number, destroyed: boolean[]): boolean[] {
  const count = Math.max(0, value);
  const next = destroyed.slice(0, count).map(Boolean);
  while (next.length < count) next.push(false);
  return next;
}

export function capHardwareDestroyed(hardware: HardwareSlots, changes: object, path: string): void {
  const patch = foundry.utils.getProperty(changes, path);
  if (!isHardwarePatch(patch)) return;

  const nextValue = typeof patch.value === "number" ? patch.value : hardware.value;
  const sourceDestroyed = Array.isArray(patch.destroyed) ? patch.destroyed : hardware.destroyed;
  const nextDestroyed = syncDestroyedSlots(nextValue, sourceDestroyed);

  if (
    destroyedEquals(nextDestroyed, hardware.destroyed) &&
    (patch.destroyed === undefined || destroyedEquals(patch.destroyed, nextDestroyed))
  ) {
    return;
  }

  foundry.utils.setProperty(changes, `${path}.destroyed`, nextDestroyed);
}

function isHardwarePatch(value: unknown): value is Partial<HardwareSlots> {
  return typeof value === "object" && value !== null;
}

function destroyedEquals(left: boolean[], right: boolean[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}
