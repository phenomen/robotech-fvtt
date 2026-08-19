import { type DragEvent, type JSX, type ReactNode } from "react";

import { Card, type CardTone } from "@/components/ui/Card";
import { cn } from "@/utils";

export interface CombatantFrameProps {
  combatantId: string;
  active?: boolean;
  hidden?: boolean;
  defeated?: boolean;
  tone?: CardTone;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
  children?: ReactNode;
}

export function CombatantFrame({
  combatantId,
  active = false,
  hidden = false,
  defeated = false,
  tone = "secondary",
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}: CombatantFrameProps): JSX.Element {
  return (
    <div
      className={cn("combatant min-w-0", active && "active", hidden && "hide", defeated && "defeated")}
      data-combatant-id={combatantId}
      data-action="activateCombatant"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Card pad={2} gap={2} bordered tone={tone} grow>
        {children}
      </Card>
    </div>
  );
}
