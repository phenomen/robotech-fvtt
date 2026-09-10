import type { JSX } from "react";

import { createReactMount, renderReactMount, replaceReactContent, unmountReactMount } from "@/sheets/reactMount";
import type { ReactMount } from "@/sheets/reactMount";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";

/** An ApplicationV2 window whose body is a React tree; subclasses only supply the content. */
export abstract class ReactDialog extends foundry.applications.api.ApplicationV2 {
  private readonly mount: ReactMount = createReactMount();
  private lastAutoHeight = -1;
  private heightFrame = 0;

  protected abstract renderContent(): JSX.Element;

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    return renderReactMount(this.mount, "robotech-dialog-container", this.renderContent());
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    replaceReactContent(result, content);
  }

  protected override async _onRender(context: RenderContext, options: RenderOptions): Promise<void> {
    await super._onRender(context, options);
    // React commits non-initial renders asynchronously, so measure after the next frame.
    this.heightFrame = requestAnimationFrame(() => {
      this.fitHeight();
    });
  }

  private fitHeight(): void {
    const content = this.element?.querySelector(".window-content");
    const scrollHeight = content instanceof HTMLElement ? content.scrollHeight : -1;
    if (scrollHeight !== this.lastAutoHeight) {
      this.lastAutoHeight = scrollHeight;
      this.setPosition({ height: "auto" });
    }
  }

  override _onClose(options: CloseOptions): void {
    cancelAnimationFrame(this.heightFrame);
    unmountReactMount(this.mount);
    super._onClose(options);
  }
}
