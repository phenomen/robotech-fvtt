import type React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { EffectSheetApp } from "@/components/apps/EffectSheetApp";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { createSheetContainer } from "@/utils";

export class RobotechEffectSheet extends foundry.applications.api.DocumentSheetV2 {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "sheet", "effect"],
    position: { width: 620, height: "auto" },
    window: { ...super.DEFAULT_OPTIONS.window, resizable: true },
  };

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    if (!this.container) {
      this.container = createSheetContainer("robotech-effect-container");
    }

    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.container);
    }

    flushSync(() => {
      this.reactRoot?.render(this.renderSheetApp());
    });

    return this.container;
  }

  private renderSheetApp(): React.JSX.Element | null {
    const effect = this.document;
    if (!(effect instanceof foundry.documents.ActiveEffect)) return null;
    return <EffectSheetApp effect={effect} />;
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
