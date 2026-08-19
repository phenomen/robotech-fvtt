import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { ItemSheetApp } from "@/components/apps/ItemSheetApp";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { createSheetContainer } from "@/utils";

export class RobotechItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  static override DEFAULT_OPTIONS = {
    classes: ["robotech", "sheet", "item"],
    position: { width: 550, height: "auto" },
    window: { resizable: true },
  };

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    if (!this.container) {
      this.container = createSheetContainer("robotech-item-container");
    }

    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.container);
    }

    flushSync(() => {
      this.reactRoot?.render(<ItemSheetApp item={this.item} />);
    });

    return this.container;
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    if (!content.contains(result)) {
      content.replaceChildren(result);
    }
  }

  override _onClose(options: CloseOptions): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.container = null;
    super._onClose(options);
  }
}
