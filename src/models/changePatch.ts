/** Expands dotted update keys so `getProperty` can read nested and dotted patches alike. */
export function expandChanges(changes: object): object {
  return foundry.utils.expandObject(foundry.utils.deepClone(changes));
}

export function pathTouched(changes: object, prefix: string): boolean {
  return Object.keys(foundry.utils.flattenObject(changes)).some(
    (key) => key === prefix || key.startsWith(`${prefix}.`)
  );
}

export function numberAt(source: object, path: string): number | undefined {
  const value = foundry.utils.getProperty(source, path);
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
