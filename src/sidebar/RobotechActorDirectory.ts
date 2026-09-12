import { openLieutenantGenerator } from "@/components/apps/LieutenantGeneratorDialog";
import { canCreateActor } from "@/utils/createLieutenant";

type DirectoryBase = foundry.applications.sidebar.tabs.ActorDirectory;

export class RobotechActorDirectory extends foundry.applications.sidebar.tabs.ActorDirectory {
  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    actions: {
      createLieutenant: () => {
        openLieutenantGenerator();
      },
    },
  } as typeof foundry.applications.sidebar.tabs.ActorDirectory.DEFAULT_OPTIONS;

  override async _onRender(...args: Parameters<DirectoryBase["_onRender"]>): Promise<void> {
    await super._onRender(...args);
    this.injectLieutenantButton();
  }

  private injectLieutenantButton(): void {
    if (!canCreateActor()) {
      return;
    }
    if (this.element.querySelector("[data-action='createLieutenant']")) {
      return;
    }
    const createEntry = this.element.querySelector("[data-action='createEntry']");
    if (!(createEntry instanceof HTMLElement)) {
      return;
    }
    const button = createEntry.cloneNode(true);
    if (!(button instanceof HTMLElement)) {
      return;
    }
    button.dataset.action = "createLieutenant";
    relabelButton(button, game.i18n.localize("ROBOTECH.Lieutenant.Create"));
    createEntry.after(button);
  }
}

function relabelButton(button: HTMLElement, label: string): void {
  button.dataset.tooltip = label;
  button.setAttribute("aria-label", label);
  button.title = label;
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
  if (textNode) {
    textNode.textContent = ` ${label}`;
    return;
  }
  const span = button.querySelector("span");
  if (span) {
    span.textContent = label;
    return;
  }
  button.append(` ${label}`);
}
