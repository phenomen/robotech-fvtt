import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";

import { CombatTrackerApp } from "@/components/apps/CombatTrackerApp";
import type { CloseOptions } from "@/types/application";
import { createSheetContainer } from "@/utils";

type TrackerBase = foundry.applications.sidebar.tabs.CombatTracker;

// @ts-expect-error CombatTracker is typed as Handlebars parts; this class mounts React instead.
export class RobotechCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;

  static override DEFAULT_OPTIONS = {
    classes: ["robotech"],
  };

  static override PARTS = {};

  override async _renderHTML(..._args: Parameters<TrackerBase["_renderHTML"]>): Promise<Record<string, HTMLElement>> {
    this.container ??= createSheetContainer("robotech-combat-container");
    this.reactRoot ??= createRoot(this.container);

    flushSync(() => {
      this.reactRoot?.render(<CombatTrackerApp combat={this.viewed} />);
    });

    return { body: this.container };
  }

  override _replaceHTML(
    result: Record<string, HTMLElement>,
    content: HTMLElement,
    _options: Parameters<TrackerBase["_replaceHTML"]>[2],
  ): void {
    const rendered = result.body;
    if (rendered && !content.contains(rendered)) {
      content.replaceChildren(rendered);
    }
  }

  protected override async _onRender(...args: Parameters<TrackerBase["_onRender"]>): Promise<void> {
    await foundry.applications.sidebar.AbstractSidebarTab.prototype._onRender.call(this, ...args);
    this.element.querySelector(".combatant.active")?.scrollIntoView({ block: "nearest" });
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
