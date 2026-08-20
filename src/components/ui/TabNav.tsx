import React, { useRef, type KeyboardEvent } from "react";

import { typoClass } from "@/components/ui/typo";
import { cn } from "@/utils";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
}

interface TabNavProps<T extends string = string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: TabItem<T>[];
}

function TabNavInner<T extends string = string>({ activeTab, onTabChange, tabs }: TabNavProps<T>): React.JSX.Element {
  const listRef = useRef<HTMLDivElement>(null);

  const moveFocus = (index: number): void => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = tabs.length - 1;
    let next: number | undefined;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === undefined) return;
    event.preventDefault();
    moveFocus(next);
  };

  return (
    <nav className="border-rt-border w-full shrink-0 border-b">
      <div
        ref={listRef}
        role="tablist"
        aria-label={game.i18n.localize("ROBOTECH.Tabs.AriaLabel")}
        className="flex justify-center"
      >
        {tabs.map((t, index) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              data-slot="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                typoClass("mono"),
                "font-rt-mono relative flex h-10! min-h-0! cursor-pointer items-center justify-center px-3! tracking-wider! uppercase",
                "border-none! bg-transparent! shadow-none!",
                isActive ? "text-rt-primary" : "text-rt-muted hover:text-rt-primary",
                isActive &&
                  "after:bg-rt-primary after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:content-['']",
              )}
              onClick={() => onTabChange(t.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const TabNav = React.memo(TabNavInner) as typeof TabNavInner;
