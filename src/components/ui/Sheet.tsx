import { type JSX, type ReactNode } from "react";

export interface SheetProps {
  children?: ReactNode;
}

export function Sheet({ children }: SheetProps): JSX.Element {
  return <div className="robotech flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">{children}</div>;
}

export function SheetBody({ children }: SheetProps): JSX.Element {
  return <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>;
}

export function SheetHeader({ children }: SheetProps): JSX.Element {
  return <div className="min-w-0 shrink-0 overflow-x-hidden">{children}</div>;
}
