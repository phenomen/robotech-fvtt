import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { ItemSheetApp } from "@/components/apps/ItemSheetApp";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { createSheetContainer, itemCardOf, sendToChat } from "@/utils";

export class RobotechItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    actions: {
      sendToChat: RobotechItemSheet.#onSendChat,
    },
    classes: ["robotech", "sheet", "item"],
    position: { height: "auto", width: 550 },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      controls: [
        {
          action: "sendToChat",
          icon: "fa-solid fa-comment",
          label: "ROBOTECH.Buttons.SendToChat",
        },
      ],
      resizable: true,
    },
  };

  static #onSendChat(this: RobotechItemSheet): void {
    void sendToChat(itemCardOf(this.item));
  }

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    this.container ??= createSheetContainer("robotech-item-container");

    this.reactRoot ??= createRoot(this.container);

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
