const CONTAINER_CLASSES = ["flex", "w-full", "min-h-0", "min-w-0", "flex-1", "flex-col", "overflow-hidden"] as const;

/** The flex column a React root mounts into; Tailwind lives in `ui/`, so the classes do too. */
export function createSheetContainer(name: string): HTMLElement {
  const container = document.createElement("div");
  container.classList.add(name, ...CONTAINER_CLASSES);
  return container;
}
