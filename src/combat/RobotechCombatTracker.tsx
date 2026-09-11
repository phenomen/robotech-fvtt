import { CombatTrackerApp } from "@/components/apps/CombatTrackerApp";
import { createReactMount, renderReactMount, replaceReactContent, unmountReactMount } from "@/sheets/reactMount";
import type { ReactMount } from "@/sheets/reactMount";
import type { CloseOptions } from "@/types/application";

type TrackerBase = foundry.applications.sidebar.tabs.CombatTracker;

// @ts-expect-error CombatTracker is typed as Handlebars parts; this class mounts React instead.
export class RobotechCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  private readonly mount: ReactMount = createReactMount();
  private scrollFrame = 0;

  static override DEFAULT_OPTIONS = {
    classes: ["robotech"],
  };

  static override PARTS = {};

  override async _renderHTML(..._args: Parameters<TrackerBase["_renderHTML"]>): Promise<Record<string, HTMLElement>> {
    const body = renderReactMount(this.mount, "robotech-combat-container", <CombatTrackerApp combat={this.viewed} />);
    return { body };
  }

  override _replaceHTML(
    result: Record<string, HTMLElement>,
    content: HTMLElement,
    _options: Parameters<TrackerBase["_replaceHTML"]>[2]
  ): void {
    const rendered = result.body;
    if (rendered) {
      replaceReactContent(rendered, content);
    }
  }

  protected override async _onRender(...args: Parameters<TrackerBase["_onRender"]>): Promise<void> {
    await foundry.applications.sidebar.AbstractSidebarTab.prototype._onRender.call(this, ...args);
    this.scrollFrame = requestAnimationFrame(() => {
      this.element.querySelector(".combatant.active")?.scrollIntoView({ block: "nearest" });
    });
  }

  override _onClose(options: CloseOptions): void {
    cancelAnimationFrame(this.scrollFrame);
    unmountReactMount(this.mount);
    super._onClose(options);
  }
}
