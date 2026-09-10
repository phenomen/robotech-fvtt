import type React from "react";

import { EffectSheetApp } from "@/components/apps/EffectSheetApp";
import { createReactMount, renderReactMount, replaceReactContent, unmountReactMount } from "@/sheets/reactMount";
import type { ReactMount } from "@/sheets/reactMount";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";

export class RobotechEffectSheet extends foundry.applications.api.DocumentSheetV2 {
  private readonly mount: ReactMount = createReactMount();

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "sheet", "effect"],
    position: { height: "auto", width: 650 },
    window: { ...super.DEFAULT_OPTIONS.window, resizable: true },
  };

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    return renderReactMount(this.mount, "robotech-effect-container", this.renderSheetApp());
  }

  private renderSheetApp(): React.JSX.Element | null {
    const effect = this.document;
    if (!(effect instanceof foundry.documents.ActiveEffect)) {
      return null;
    }
    return <EffectSheetApp effect={effect} />;
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    replaceReactContent(result, content);
  }

  override _onClose(options: CloseOptions): void {
    unmountReactMount(this.mount);
    super._onClose(options);
  }
}
