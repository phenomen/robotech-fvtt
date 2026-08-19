import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";

import { SPACE_PAD, type Space } from "@/components/ui/space";
import { cn } from "@/utils";

interface GridSystemValue {
  guideWidth: number;
  dashedGuides: boolean;
  debug: boolean;
}

const GridSystemContext = createContext<GridSystemValue>({
  guideWidth: 1,
  dashedGuides: false,
  debug: false,
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
  return (
    <GridSystemContext.Provider value={{ guideWidth, dashedGuides, debug }}>
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
  vertical: [],
  horizontal: [],
  width: 0,
  height: 0,
});

function parseTrackSizes(template: string): number[] {
  return template
    .split(/(?<=px)\s+/)
    .map((part) => Number.parseFloat(part))
    .filter((size) => Number.isFinite(size));
}

function trackStops(sizes: number[], start: number, gap: number): number[] {
  const stops = [0];
  let acc = start;
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    if (size === undefined) continue;
    acc += size;
    stops.push(acc);
    if (i < sizes.length - 1) acc += gap;
  }
  return stops;
}

function readLines(el: HTMLElement): GridLines {
  const style = getComputedStyle(el);
  const padLeft = Number.parseFloat(style.paddingLeft) || 0;
  const padTop = Number.parseFloat(style.paddingTop) || 0;
  const colGap = Number.parseFloat(style.columnGap) || 0;
  const rowGap = Number.parseFloat(style.rowGap) || 0;
  const vertical = parseTrackSizes(style.gridTemplateColumns);
  const horizontal = parseTrackSizes(style.gridTemplateRows);
  return {
    vertical: vertical.length > 0 ? trackStops(vertical, padLeft, colGap) : [0, el.offsetWidth],
    horizontal: horizontal.length > 0 ? trackStops(horizontal, padTop, rowGap) : [0, el.offsetHeight],
    width: el.offsetWidth,
    height: el.offsetHeight,
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
    left: rect.left - gridRect.left,
    right: rect.right - gridRect.left,
    top: rect.top - gridRect.top,
    bottom: rect.bottom - gridRect.top,
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
  if (xs.length === 0 || ys.length === 0) return [];
  const boxes = [...grid.querySelectorAll("[data-grid-cell]")].map((cell) => cellBox(grid, cell));
  if (boxes.length === 0) return [];
  const points: { x: number; y: number }[] = [];
  for (const x of xs) {
    for (const y of ys) {
      if (spansAcross(boxes, x, y - 4) && spansAcross(boxes, x, y + 4)) continue;
      points.push({ x, y });
    }
  }
  return points;
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
    vertical: [],
    horizontal: [],
    width: 0,
    height: 0,
  });
  const [crosses, setCrosses] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (): void => {
      const next = readLines(el);
      setLines(next);
      setCrosses(hideGuides === undefined ? findCrosses(el, next) : []);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [columns, rows, children, hideGuides]);

  const style: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: rows !== undefined ? `repeat(${rows}, minmax(0, auto))` : undefined,
    columnGap: hideGuides === "column" ? 0 : guideWidth,
    rowGap: hideGuides === "row" ? 0 : guideWidth,
    padding: guideWidth,
    backgroundColor: dashedGuides ? undefined : debug ? "var(--rt-primary)" : "var(--rt-border)",
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
              left: lines.width > guideWidth ? Math.min(x, lines.width - guideWidth) : x,
              width: 0,
              borderLeftWidth: guideWidth,
              borderLeftStyle: stroke,
              borderLeftColor: color,
            }}
          />
        ))}
      {hideGuides !== "row" &&
        lines.horizontal.map((y) => (
          <div
            key={`h-${y}`}
            className="absolute left-0 w-full"
            style={{
              top: lines.height > guideWidth ? Math.min(y, lines.height - guideWidth) : y,
              height: 0,
              borderTopWidth: guideWidth,
              borderTopStyle: stroke,
              borderTopColor: color,
            }}
          />
        ))}
    </div>
  );
}

export type GridCellTone = "default" | "info" | "danger" | "hollow";

const TONE_MIX: Record<Exclude<GridCellTone, "default">, string> = {
  info: "color-mix(in srgb, var(--rt-primary) 10%, var(--rt-background))",
  danger: "color-mix(in srgb, var(--rt-danger) 10%, var(--rt-background))",
  hollow: "var(--rt-background)",
};

export interface GridCellProps {
  column?: string | number;
  row?: string | number;
  solid?: boolean;
  tone?: GridCellTone;
  pad?: Space;
  children?: ReactNode;
}

function gridLine(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return String(value);
}

export function GridCell({ column, row, solid = false, tone = "default", pad, children }: GridCellProps): JSX.Element {
  const toneFill = tone === "default" ? undefined : TONE_MIX[tone];
  return (
    <div
      data-grid-cell=""
      className={cn(
        "relative min-w-0",
        toneFill ? "bg-rt-background" : solid ? "bg-rt-secondary" : "bg-rt-background",
        pad !== undefined ? SPACE_PAD[pad] : undefined,
      )}
      style={{
        gridColumn: gridLine(column),
        gridRow: gridLine(row),
        backgroundColor: toneFill,
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
      <div className="bg-rt-primary absolute" style={{ left: -CROSS_ARM, top: 0, width: span, height: guideWidth }} />
      <div className="bg-rt-primary absolute" style={{ left: 0, top: -CROSS_ARM, width: guideWidth, height: span }} />
    </div>
  );
}

export function GridCross({ column, row }: GridCrossProps): JSX.Element | null {
  const { guideWidth } = useContext(GridSystemContext);
  const lines = useContext(GridLinesContext);
  const x = lines.vertical[column - 1];
  const y = lines.horizontal[row - 1];
  if (x === undefined || y === undefined) return null;
  return <CrossMark x={x} y={y} guideWidth={guideWidth} />;
}

export function GridPage({ children }: { children?: ReactNode }): JSX.Element {
  return <div className="relative w-full min-w-0 overflow-hidden">{children}</div>;
}
