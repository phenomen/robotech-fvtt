const CONTAINER_CLASSES = ["flex", "w-full", "min-h-0", "min-w-0", "flex-1", "flex-col", "overflow-hidden"] as const;

export function createSheetContainer(name: string): HTMLElement {
  const container = document.createElement("div");
  container.classList.add(name, ...CONTAINER_CLASSES);
  return container;
}
