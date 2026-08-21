import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/utils";

export interface ProseMirrorFieldProps {
  name?: string;
  value: string;
  enriched?: string;
  toggled?: boolean;
  disabled?: boolean;
  documentUUID?: string;
  collaborate?: boolean;
  height?: number;
  minHeight?: "default" | "tall";
  initialToolbarOpen?: boolean;
  spellCheck?: boolean;
  onChange?: (value: string) => void;
}

export const ProseMirrorField = React.memo(function ProseMirrorField({
  name = "description",
  value,
  enriched = "",
  toggled = false,
  disabled = false,
  documentUUID,
  collaborate,
  height,
  minHeight = "default",
  initialToolbarOpen = false,
  spellCheck = false,
  onChange,
}: ProseMirrorFieldProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorElRef = useRef<HTMLElement | null>(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(initialToolbarOpen);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const emittedRef = useRef<string>("");
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    if (typeof foundry !== "undefined" && foundry.applications?.elements?.HTMLProseMirrorElement?.create) {
      const editorEl: HTMLElement = foundry.applications.elements.HTMLProseMirrorElement.create({
        name,
        value: value ?? "",
        enriched: enriched || value || "",
        toggled,
        disabled,
        ...(height !== undefined ? { height } : {}),
        documentUUID: documentUUID ?? "",
        collaborate: collaborate ?? false,
      });

      editorEl.setAttribute("spellcheck", String(spellCheck));

      const handleSave = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const next = target.value ?? "";
        if (syncingRef.current) {
          emittedRef.current = next;
          return;
        }
        if (!onChangeRef.current || next === emittedRef.current) return;
        emittedRef.current = next;
        onChangeRef.current(next);
      };

      editorEl.addEventListener("save", handleSave);
      editorEl.addEventListener("change", handleSave);

      editorRef.current.innerHTML = "";
      editorRef.current.appendChild(editorEl);
      editorElRef.current = editorEl;
      emittedRef.current = value ?? "";

      return () => {
        editorEl.removeEventListener("save", handleSave);
        editorEl.removeEventListener("change", handleSave);
        editorElRef.current = null;
      };
    }
  }, [name, toggled, disabled, documentUUID, collaborate, height, spellCheck]);

  useEffect(() => {
    const editorEl = editorElRef.current;
    if (!editorEl || value === undefined || value === emittedRef.current) return;
    emittedRef.current = value;
    syncingRef.current = true;
    try {
      (editorEl as HTMLInputElement).value = value;
    } finally {
      syncingRef.current = false;
    }
  }, [value]);

  const handleToggleToolbar = useCallback(() => {
    setIsToolbarOpen((prev) => !prev);
  }, []);

  return (
    <div
      spellCheck={spellCheck}
      data-toolbar-open={isToolbarOpen}
      className={cn(
        "prosemirror-react-wrapper relative flex h-full w-full min-h-30 flex-col overflow-auto border bg-rt-input text-rt-foreground",
        minHeight === "tall" && "min-h-48",
      )}
    >
      <div className="absolute right-1.5 bottom-1.5 z-20">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={handleToggleToolbar}
          title={
            isToolbarOpen
              ? game.i18n.localize("ROBOTECH.Editor.HideToolbar")
              : game.i18n.localize("ROBOTECH.Editor.ShowToolbar")
          }
          aria-label={game.i18n.localize("ROBOTECH.Editor.ToggleToolbar")}
        >
          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </Button>
      </div>

      <div ref={editorRef} className="flex h-full min-h-0 w-full flex-1 flex-col" />
    </div>
  );
});

export { ProseMirrorField as ProseMirror };
