import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { createSheetContainer } from "@/utils/sheetContainer";

export interface ReactMount {
  container: HTMLElement | null;
  root: Root | null;
}

/** Per-application React root state. The container is created lazily and reused across renders. */
export function createReactMount(): ReactMount {
  return { container: null, root: null };
}

/**
 * Renders into the application's persistent container. Only the first mount commits synchronously so
 * Foundry receives a populated node; later Foundry renders (one per document update) reconcile
 * asynchronously, avoiding a forced synchronous relayout of the whole sheet on every keystroke.
 */
export function renderReactMount(mount: ReactMount, containerClass: string, element: ReactNode): HTMLElement {
  mount.container ??= createSheetContainer(containerClass);
  if (mount.root === null) {
    mount.root = createRoot(mount.container);
    flushSync(() => {
      mount.root?.render(element);
    });
  } else {
    mount.root.render(element);
  }
  return mount.container;
}

export function replaceReactContent(result: HTMLElement, content: HTMLElement): void {
  if (!content.contains(result)) {
    content.replaceChildren(result);
  }
}

export function unmountReactMount(mount: ReactMount): void {
  mount.root?.unmount();
  mount.root = null;
  mount.container = null;
}
