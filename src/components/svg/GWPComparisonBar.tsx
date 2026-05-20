import type { SafetyClass } from "@/data/refrigerants";
import { niceTicks, safetyClassColor, svgRound } from "@/lib/svg-tokens";

export interface GWPBar {
  /** Display name (e.g. "R-410A"). */
  name: string;
  /** GWP value, 100-year horizon. */
  gwp: number;
  safetyClass: SafetyClass;
  /** True highlights this bar (the refrigerant being viewed on a detail page). */
  isCurrent?: boolean;
}

export interface GWPReferenceLine {
  value: number;
  label: string;
}

export interface GWPComparisonBarProps {
  bars: GWPBar[];
  referenceLines?: GWPReferenceLine[];
  /** Required for accessibility. */
  ariaLabel: string;
  /** Force linear (default) or log x-axis. Log helps when one bar is much larger than the others. */
  scale?: "linear" | "log";
  className?: string;
}

const W = 800;
const ROW_H = 32;
const PAD_T = 24;
const PAD_B = 56;
const PAD_L = 92; // room for refrigerant names
const PAD_R = 80; // room for GWP value at end of bar
const BAR_H = 18; // visible bar height; rows are taller to leave breathing room

export function GWPComparisonBar({
  bars,
  referenceLines = [],
  ariaLabel,
  scale = "linear",
  className = "",
}: GWPComparisonBarProps) {
  if (bars.length === 0) {
    return (
      <div className={`rounded-md border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 ${className}`} role="img" aria-label={ariaLabel}>
        No comparison data available.
      </div>
    );
  }

  // Sort ascending by GWP; missing GWP (null) goes to the bottom but we only get numbers here.
  const sorted = [...bars].sort((a, b) => a.gwp - b.gwp);
  const H = PAD_T + PAD_B + sorted.length * ROW_H;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = sorted.length * ROW_H;

  // Domain: include 0 (or 1 for log) and the largest of bars + reference lines.
  const refMax = referenceLines.reduce((m, r) => Math.max(m, r.value), 0);
  const dataMax = sorted.reduce((m, b) => Math.max(m, b.gwp), 0);
  const domainMax = Math.max(dataMax, refMax) * 1.08 + 1;
  const domainMin = scale === "log" ? Math.max(0.5, Math.min(...sorted.map((b) => Math.max(b.gwp, 0.5))) * 0.5) : 0;

  const xScale = (v: number): number => {
    if (scale === "log") {
      const clamped = Math.max(v, domainMin);
      const lMin = Math.log10(domainMin);
      const lMax = Math.log10(domainMax);
      return PAD_L + ((Math.log10(clamped) - lMin) / (lMax - lMin)) * PLOT_W;
    }
    return PAD_L + ((v - domainMin) / (domainMax - domainMin)) * PLOT_W;
  };

  const xTicks =
    scale === "log"
      ? logTicks(domainMin, domainMax)
      : niceTicks(domainMin, domainMax, 6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Plot area background */}
      <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill="transparent" />

      {/* Vertical grid */}
      <g aria-hidden="true">
        {xTicks.map((t) => (
          <line
            key={`gx-${t}`}
            x1={svgRound(xScale(t))}
            y1={PAD_T}
            x2={svgRound(xScale(t))}
            y2={PAD_T + PLOT_H}
            stroke="var(--c-grid)"
            strokeDasharray="2 3"
            strokeWidth={1}
          />
        ))}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--c-axis)" strokeWidth={1.25} />
      </g>

      {/* Bars */}
      {sorted.map((b, i) => {
        const cy = PAD_T + i * ROW_H + ROW_H / 2;
        const yBar = cy - BAR_H / 2;
        const startX = PAD_L;
        const endX = xScale(b.gwp);
        const width = Math.max(endX - startX, 1);
        return (
          <g key={`bar-${b.name}-${i}`}>
            <text
              x={PAD_L - 8}
              y={cy + 4}
              textAnchor="end"
              fontSize="13"
              fontWeight={b.isCurrent ? 700 : 500}
              fill="var(--c-text)"
            >
              {b.name}
            </text>
            <rect
              x={startX}
              y={yBar}
              width={svgRound(width)}
              height={BAR_H}
              fill={safetyClassColor(b.safetyClass)}
              stroke={b.isCurrent ? "var(--c-text)" : "none"}
              strokeWidth={b.isCurrent ? 2 : 0}
              rx={2}
            />
            <text
              x={svgRound(endX) + 8}
              y={cy + 4}
              fontSize="12"
              fill="var(--c-text)"
              fontWeight={b.isCurrent ? 600 : 400}
            >
              {formatGwp(b.gwp)}
            </text>
          </g>
        );
      })}

      {/* Reference lines (drawn on top of bars) */}
      {referenceLines.map((r, i) => {
        if (r.value < domainMin || r.value > domainMax) return null;
        const x = svgRound(xScale(r.value));
        return (
          <g key={`ref-${i}`}>
            <line
              x1={x}
              y1={PAD_T}
              x2={x}
              y2={PAD_T + PLOT_H}
              stroke="var(--c-accent)"
              strokeWidth={1.25}
              strokeDasharray="6 3"
            />
            <text
              x={x}
              y={PAD_T - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--c-accent)"
              fontWeight={600}
            >
              {r.label} ({r.value})
            </text>
          </g>
        );
      })}

      {/* X-axis ticks + labels */}
      <g aria-hidden="true" fill="var(--c-text)" fontSize="11">
        {xTicks.map((t) => (
          <text key={`tx-${t}`} x={svgRound(xScale(t))} y={PAD_T + PLOT_H + 16} textAnchor="middle">
            {formatGwp(t)}
          </text>
        ))}
        <text x={PAD_L + PLOT_W / 2} y={H - 14} textAnchor="middle" fontSize="12" fontWeight={500}>
          Global Warming Potential (100-year, IPCC AR5)
        </text>
      </g>
    </svg>
  );
}

function formatGwp(v: number): string {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

function logTicks(lo: number, hi: number): number[] {
  const startMag = Math.floor(Math.log10(Math.max(lo, 0.5)));
  const endMag = Math.ceil(Math.log10(hi));
  const ticks: number[] = [];
  for (let m = startMag; m <= endMag; m++) {
    ticks.push(Math.pow(10, m));
  }
  return ticks;
}
