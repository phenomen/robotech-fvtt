import type { JSX } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { createSheetContainer } from "@/utils";

/** An ApplicationV2 window whose body is a React tree; subclasses only supply the content. */
export abstract class ReactDialog extends foundry.applications.api.ApplicationV2 {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  protected abstract renderContent(): JSX.Element;

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    this.container ??= createSheetContainer("robotech-dialog-container");
    this.reactRoot ??= createRoot(this.container);

    const content = this.renderContent();
    flushSync(() => {
      this.reactRoot?.render(content);
    });

    return this.container;
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    if (!content.contains(result)) {
      content.replaceChildren(result);
    }
  }

  protected override async _onRender(context: RenderContext, options: RenderOptions): Promise<void> {
    await super._onRender(context, options);
    this.setPosition({ height: "auto" });
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
