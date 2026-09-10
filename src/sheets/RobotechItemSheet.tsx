import { ItemSheetApp } from "@/components/apps/ItemSheetApp";
import { createReactMount, renderReactMount, replaceReactContent, unmountReactMount } from "@/sheets/reactMount";
import type { ReactMount } from "@/sheets/reactMount";
import type { CloseOptions, RenderContext, RenderOptions } from "@/types/application";
import { itemCardOf, sendToChat } from "@/utils";

export class RobotechItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  private readonly mount: ReactMount = createReactMount();

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    actions: {
      sendToChat: onSendChat,
    },
    classes: ["robotech", "sheet", "item"],
    position: { height: "auto", width: 550 },
    window: {
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

  override async _renderHTML(_context: RenderContext, _options: RenderOptions): Promise<HTMLElement> {
    return renderReactMount(this.mount, "robotech-item-container", <ItemSheetApp item={this.item} />);
  }

  override _replaceHTML(result: HTMLElement, content: HTMLElement, _options: RenderOptions): void {
    replaceReactContent(result, content);
  }

  override _onClose(options: CloseOptions): void {
    unmountReactMount(this.mount);
    super._onClose(options);
  }
}

function onSendChat(this: RobotechItemSheet): void {
  void sendToChat(itemCardOf(this.item));
}
