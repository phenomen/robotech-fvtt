import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";

import { SPACE_PAD } from "@/components/ui/space";
import type { Space } from "@/components/ui/space";
import { cn } from "@/utils";

interface GridSystemValue {
  guideWidth: number;
  dashedGuides: boolean;
  debug: boolean;
}

const GridSystemContext = createContext<GridSystemValue>({
  dashedGuides: false,
  debug: false,
  guideWidth: 1,
});

export interface GridSystemProps {
  children?: ReactNode;
  guideWidth?: number;
  dashedGuides?: boolean;
  debug?: boolean;
}

export function GridSystem({
  children,
  guideWidth = 1,
  dashedGuides = false,
  debug = false,
}: GridSystemProps): JSX.Element {
  const value = useMemo(() => ({ dashedGuides, debug, guideWidth }), [dashedGuides, debug, guideWidth]);
  return (
    <GridSystemContext.Provider value={value}>
      <div className="relative w-full min-w-0 overflow-hidden">{children}</div>
    </GridSystemContext.Provider>
  );
}

interface GridLines {
  vertical: number[];
  horizontal: number[];
  width: number;
  height: number;
}

const GridLinesContext = createContext<GridLines>({
  height: 0,
  horizontal: [],
  vertical: [],
  width: 0,
});

/** Computed style values such as `"12.5px"`. `Number("12.5px")` is NaN. */
function cssPx(value: string): number {
  // oxlint-disable-next-line unicorn/prefer-number-coercion
  return Number.parseFloat(value);
}

function parseTrackSizes(template: string): number[] {
  return template
    .split(/(?<=px)\s+/u)
    .map(cssPx)
    .filter((size) => Number.isFinite(size));
}

function trackStops(sizes: number[], start: number, gap: number): number[] {
  const stops = [0];
  let acc = start;
  for (let i = 0; i < sizes.length; i += 1) {
    const size = sizes[i];
    if (size === undefined) {
      continue;
    }
    acc += size;
    stops.push(acc);
    if (i < sizes.length - 1) {
      acc += gap;
    }
  }
  return stops;
}

function readLines(el: HTMLElement): GridLines {
  const style = getComputedStyle(el);
  const padLeft = cssPx(style.paddingLeft) || 0;
  const padTop = cssPx(style.paddingTop) || 0;
  const colGap = cssPx(style.columnGap) || 0;
  const rowGap = cssPx(style.rowGap) || 0;
  const vertical = parseTrackSizes(style.gridTemplateColumns);
  const horizontal = parseTrackSizes(style.gridTemplateRows);
  return {
    height: el.offsetHeight,
    horizontal: horizontal.length > 0 ? trackStops(horizontal, padTop, rowGap) : [0, el.offsetHeight],
    vertical: vertical.length > 0 ? trackStops(vertical, padLeft, colGap) : [0, el.offsetWidth],
    width: el.offsetWidth,
  };
}

interface CellBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function cellBox(grid: HTMLElement, cell: Element): CellBox {
  const gridRect = grid.getBoundingClientRect();
  const rect = cell.getBoundingClientRect();
  return {
    bottom: rect.bottom - gridRect.top,
    left: rect.left - gridRect.left,
    right: rect.right - gridRect.left,
    top: rect.top - gridRect.top,
  };
}

function contains(box: CellBox, x: number, y: number): boolean {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

function spansAcross(boxes: CellBox[], x: number, y: number): boolean {
  return boxes.some((box) => contains(box, x - 4, y) && contains(box, x + 4, y));
}

function findCrosses(grid: HTMLElement, lines: GridLines): { x: number; y: number }[] {
  const xs = lines.vertical.slice(1, -1);
  const ys = lines.horizontal.slice(1, -1);
  if (xs.length === 0 || ys.length === 0) {
    return [];
  }
  const boxes = [...grid.querySelectorAll("[data-grid-cell]")].map((cell) => cellBox(grid, cell));
  if (boxes.length === 0) {
    return [];
  }
  const points: { x: number; y: number }[] = [];
  for (const x of xs) {
    for (const y of ys) {
      if (spansAcross(boxes, x, y - 4) && spansAcross(boxes, x, y + 4)) {
        continue;
      }
      points.push({ x, y });
    }
  }
  return points;
}

function sameLines(a: GridLines, b: GridLines): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.vertical.length === b.vertical.length &&
    a.horizontal.length === b.horizontal.length &&
    a.vertical.every((stop, i) => stop === b.vertical[i]) &&
    a.horizontal.every((stop, i) => stop === b.horizontal[i])
  );
}

function sameCrosses(a: { x: number; y: number }[], b: { x: number; y: number }[]): boolean {
  return a.length === b.length && a.every((point, i) => point.x === b[i]?.x && point.y === b[i]?.y);
}

export type HideGuides = "row" | "column";

export interface GridProps {
  columns: number;
  rows?: number;
  hideGuides?: HideGuides;
  children?: ReactNode;
}

export function Grid({ columns, rows, hideGuides, children }: GridProps): JSX.Element {
  const { guideWidth, dashedGuides, debug } = useContext(GridSystemContext);
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<GridLines>({
    height: 0,
    horizontal: [],
    vertical: [],
    width: 0,
  });
  const [crosses, setCrosses] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return () => {
        /* grid not mounted */
      };
    }
    const update = (): void => {
      const next = readLines(el);
      setLines((prev) => (sameLines(prev, next) ? prev : next));
      if (hideGuides === undefined) {
        const nextCrosses = findCrosses(el, next);
        setCrosses((prev) => (sameCrosses(prev, nextCrosses) ? prev : nextCrosses));
      } else {
        setCrosses((prev) => (prev.length > 0 ? [] : prev));
      }
    };
    let frame = 0;
    const scheduleUpdate = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(el);
    const mutation = new MutationObserver(scheduleUpdate);
    mutation.observe(el, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
    };
    // columns/rows change track counts without always resizing the grid element.
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [columns, hideGuides, rows]);

  const style: CSSProperties = {
    backgroundColor: guideColor(dashedGuides, debug),
    columnGap: hideGuides === "column" ? 0 : guideWidth,
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: rows === undefined ? undefined : `repeat(${rows}, minmax(0, auto))`,
    padding: guideWidth,
    rowGap: hideGuides === "row" ? 0 : guideWidth,
  };

  return (
    <GridLinesContext.Provider value={lines}>
      <div className="relative isolate z-0 w-full min-w-0 overflow-hidden">
        <div ref={ref} className="relative grid w-full min-w-0" style={style}>
          {dashedGuides && (
            <GuideOverlay
              lines={lines}
              hideGuides={hideGuides}
              guideWidth={guideWidth}
              dashed={dashedGuides}
              debug={debug}
            />
          )}
          {children}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
          {crosses.map((point) => (
            <CrossMark key={`cross-${point.x}-${point.y}`} x={point.x} y={point.y} guideWidth={guideWidth} />
          ))}
        </div>
      </div>
    </GridLinesContext.Provider>
  );
}

interface GuideOverlayProps {
  lines: GridLines;
  hideGuides?: HideGuides;
  guideWidth: number;
  dashed: boolean;
  debug: boolean;
}

function GuideOverlay({ lines, hideGuides, guideWidth, dashed, debug }: GuideOverlayProps): JSX.Element {
  const stroke = dashed ? "dashed" : "solid";
  const color = debug ? "var(--rt-primary)" : "var(--rt-border)";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}
    >
      {hideGuides !== "column" &&
        lines.vertical.map((x) => (
          <div
            key={`v-${x}`}
            className="absolute top-0 h-full"
            style={{
              borderLeftColor: color,
              borderLeftStyle: stroke,
              borderLeftWidth: guideWidth,
              left: lines.width > guideWidth ? Math.min(x, lines.width - guideWidth) : x,
              width: 0,
            }}
          />
        ))}
      {hideGuides !== "row" &&
        lines.horizontal.map((y) => (
          <div
            key={`h-${y}`}
            className="absolute left-0 w-full"
            style={{
              borderTopColor: color,
              borderTopStyle: stroke,
              borderTopWidth: guideWidth,
              height: 0,
              top: lines.height > guideWidth ? Math.min(y, lines.height - guideWidth) : y,
            }}
          />
        ))}
    </div>
  );
}

export type GridCellTone = "default" | "info" | "danger" | "hollow";

const TONE_MIX: Record<Exclude<GridCellTone, "default">, string> = {
  danger: "color-mix(in srgb, var(--rt-danger) 10%, var(--rt-background))",
  hollow: "var(--rt-background)",
  info: "color-mix(in srgb, var(--rt-primary) 10%, var(--rt-background))",
};

export interface GridCellProps {
  column?: string | number;
  row?: string | number;
  solid?: boolean;
  tone?: GridCellTone;
  pad?: Space;
  children?: ReactNode;
}

function guideColor(dashedGuides: boolean, debug: boolean): string | undefined {
  if (dashedGuides) {
    return undefined;
  }
  if (debug) {
    return "var(--rt-primary)";
  }
  return "var(--rt-border)";
}

function cellSurfaceClass(toneFill: string | undefined, solid: boolean): string {
  if (toneFill || !solid) {
    return "bg-rt-background";
  }
  return "bg-rt-secondary";
}

function gridLine(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return String(value);
}

export function GridCell({ column, row, solid = false, tone = "default", pad, children }: GridCellProps): JSX.Element {
  const toneFill = tone === "default" ? undefined : TONE_MIX[tone];
  return (
    <div
      data-grid-cell=""
      className={cn(
        "relative min-w-0",
        cellSurfaceClass(toneFill, solid),
        pad === undefined ? undefined : SPACE_PAD[pad]
      )}
      style={{
        backgroundColor: toneFill,
        gridColumn: gridLine(column),
        gridRow: gridLine(row),
      }}
    >
      {children}
    </div>
  );
}

export interface GridCrossProps {
  column: number;
  row: number;
}

const CROSS_ARM = 6;

interface CrossMarkProps {
  x: number;
  y: number;
  guideWidth: number;
}

function CrossMark({ x, y, guideWidth }: CrossMarkProps): JSX.Element {
  const span = CROSS_ARM * 2 + guideWidth;
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y }}>
      <div className="bg-rt-primary absolute" style={{ height: guideWidth, left: -CROSS_ARM, top: 0, width: span }} />
      <div className="bg-rt-primary absolute" style={{ height: span, left: 0, top: -CROSS_ARM, width: guideWidth }} />
    </div>
  );
}

export function GridCross({ column, row }: GridCrossProps): JSX.Element | null {
  const { guideWidth } = useContext(GridSystemContext);
  const lines = useContext(GridLinesContext);
  const x = lines.vertical[column - 1];
  const y = lines.horizontal[row - 1];
  if (x === undefined || y === undefined) {
    return null;
  }
  return <CrossMark x={x} y={y} guideWidth={guideWidth} />;
}

export function GridPage({ children }: { children?: ReactNode }): JSX.Element {
  return <div className="relative w-full min-w-0 overflow-hidden">{children}</div>;
}
