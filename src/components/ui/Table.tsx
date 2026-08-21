import { createContext, useContext, type JSX, type ReactNode } from "react";

import { cn } from "@/utils";

export type TableWidth = "grow" | "auto" | "10" | "12" | "16" | "20" | "32";
export type TableAlign = "start" | "center" | "end";
export type TableTone = "default" | "danger";

const InHeaderContext = createContext(false);

const WIDTH_CLASS: Record<TableWidth, string> = {
  grow: "w-full min-w-0",
  auto: "w-px whitespace-nowrap",
  "10": "w-10 whitespace-nowrap",
  "12": "w-12 whitespace-nowrap",
  "16": "w-16 whitespace-nowrap",
  "20": "w-20 whitespace-nowrap",
  "32": "w-32 min-w-32",
};

const ALIGN_CLASS: Record<TableAlign, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

export interface TableProps {
  children?: ReactNode;
}

export function Table({ children }: TableProps): JSX.Element {
  return (
    <div className="max-h-72 min-w-0 overflow-x-hidden overflow-y-auto">
      <table className="m-0! w-full min-w-0 border-separate! border-spacing-x-0 border-spacing-y-1 border-none! bg-transparent!">
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps {
  hidden?: boolean;
  children?: ReactNode;
}

export function TableHeader({ hidden = false, children }: TableHeaderProps): JSX.Element {
  return (
    <InHeaderContext.Provider value={true}>
      <thead hidden={hidden} className={cn("font-rt-mono items-center bg-transparent!", hidden && "hidden!")}>
        {children}
      </thead>
    </InHeaderContext.Provider>
  );
}

export function TableBody({ children }: TableProps): JSX.Element {
  return <tbody>{children}</tbody>;
}

export interface TableRowProps {
  tone?: TableTone;
  children?: ReactNode;
}

export function TableRow({ tone = "default", children }: TableRowProps): JSX.Element {
  const header = useContext(InHeaderContext);

  return (
    <tr className={cn(header ? "bg-transparent!" : tone === "danger" ? "bg-rt-danger/5!" : "bg-rt-background!")}>
      {children}
    </tr>
  );
}

export interface TableCellProps {
  width: TableWidth;
  align?: TableAlign;
  children?: ReactNode;
}

export function TableCell({ width, align = "start", children }: TableCellProps): JSX.Element {
  const header = useContext(InHeaderContext);
  const Tag = header ? "th" : "td";

  return (
    <Tag
      className={cn(
        "border-none! px-2 py-1 align-middle",
        header && "bg-transparent!",
        WIDTH_CLASS[width],
        ALIGN_CLASS[align],
      )}
    >
      {children}
    </Tag>
  );
}
