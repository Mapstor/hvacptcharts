import { useMemo } from "react";
import type { PTPoint } from "@/data/refrigerants";
import { niceTicks, svgPath, svgRound } from "@/lib/svg-tokens";
import type { PTUnit, TempUnit } from "./PTCurve";

export interface OverlayRefrigerant {
  /** Slug or display key; used for the legend label. */
  name: string;
  points: PTPoint[];
  hasGlide: boolean;
  /** CSS color or var() reference. */
  color: string;
}

export interface PTCurveOverlayProps {
  refrigerants: OverlayRefrigerant[];
  unit?: PTUnit;
  tempUnit?: TempUnit;
  ariaLabel: string;
  className?: string;
}

const W = 800;
const H = 480;
const PAD_L = 64;
const PAD_R = 24;
const PAD_T = 36;
const PAD_B = 56;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const TEMP_FIELD: Record<TempUnit, "tempF" | "tempC"> = { F: "tempF", C: "tempC" };
const BUBBLE_FIELD: Record<PTUnit, "bubblePsig" | "bubbleKpag"> = { psig: "bubblePsig", kpag: "bubbleKpag" };
const DEW_FIELD: Record<PTUnit, "dewPsig" | "dewKpag"> = { psig: "dewPsig", kpag: "dewKpag" };

export function PTCurveOverlay({
  refrigerants,
  unit = "psig",
  tempUnit = "F",
  ariaLabel,
  className = "",
}: PTCurveOverlayProps) {
  const scaled = useMemo(() => {
    const tKey = TEMP_FIELD[tempUnit];
    const bKey = BUBBLE_FIELD[unit];
    const dKey = DEW_FIELD[unit];

    const all = refrigerants.flatMap((r) => r.points);
    if (all.length === 0) return null;

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const p of all) {
      const x = p[tKey];
      const yB = p[bKey];
      const yD = p[dKey];
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      if (yB < yMin) yMin = yB;
      if (yB > yMax) yMax = yB;
      if (yD < yMin) yMin = yD;
      if (yD > yMax) yMax = yD;
    }
    const yPad = Math.max((yMax - yMin) * 0.05, 1);
    yMin -= yPad;
    yMax += yPad;

    const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
    const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

    const series = refrigerants.map((r) => {
      const bubblePath = svgPath(r.points, (p) => xScale(p[tKey]), (p) => yScale(p[bKey]));
      const dewPath = r.hasGlide
        ? svgPath(r.points, (p) => xScale(p[tKey]), (p) => yScale(p[dKey]))
        : null;
      return { name: r.name, color: r.color, bubblePath, dewPath, hasGlide: r.hasGlide };
    });

    return {
      xScale, yScale,
      xTicks: niceTicks(xMin, xMax, 8),
      yTicks: niceTicks(yMin, yMax, 6),
      series,
    };
  }, [refrigerants, unit, tempUnit]);

  if (!scaled) {
    return (
      <div className={`flex h-64 items-center justify-center rounded-md border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 ${className}`} role="img" aria-label={ariaLabel}>
        Pick at least one refrigerant with PT data.
      </div>
    );
  }

  const tempLabel = tempUnit === "F" ? "°F" : "°C";
  const pressureLabel = unit === "psig" ? "PSIG" : "kPa (gauge)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid */}
      <g aria-hidden="true">
        {scaled.xTicks.map((t) => (
          <line key={`gx-${t}`} x1={svgRound(scaled.xScale(t))} y1={PAD_T} x2={svgRound(scaled.xScale(t))} y2={PAD_T + PLOT_H} stroke="var(--c-grid)" strokeDasharray="2 3" strokeWidth={1} />
        ))}
        {scaled.yTicks.map((t) => (
          <line key={`gy-${t}`} x1={PAD_L} y1={svgRound(scaled.yScale(t))} x2={PAD_L + PLOT_W} y2={svgRound(scaled.yScale(t))} stroke="var(--c-grid)" strokeDasharray="2 3" strokeWidth={1} />
        ))}
        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="var(--c-axis)" strokeWidth={1.25} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--c-axis)" strokeWidth={1.25} />
      </g>

      {/* Tick labels */}
      <g aria-hidden="true" fill="var(--c-text)" fontSize="11">
        {scaled.xTicks.map((t) => (
          <text key={`tx-${t}`} x={svgRound(scaled.xScale(t))} y={PAD_T + PLOT_H + 16} textAnchor="middle">{t}</text>
        ))}
        {scaled.yTicks.map((t) => (
          <text key={`ty-${t}`} x={PAD_L - 8} y={svgRound(scaled.yScale(t)) + 4} textAnchor="end">{Math.round(t * 10) / 10}</text>
        ))}
      </g>

      {/* Axis titles */}
      <g aria-hidden="true" fill="var(--c-text)" fontSize="12" fontWeight={500}>
        <text x={PAD_L + PLOT_W / 2} y={H - 12} textAnchor="middle">Temperature ({tempLabel})</text>
        <text x={-(PAD_T + PLOT_H / 2)} y={16} textAnchor="middle" transform="rotate(-90)">Saturation pressure ({pressureLabel})</text>
      </g>

      {/* Curves */}
      {scaled.series.map((s) => (
        <g key={s.name}>
          <path d={s.bubblePath} stroke={s.color} strokeWidth={2.25} fill="none" />
          {s.dewPath ? <path d={s.dewPath} stroke={s.color} strokeWidth={2} strokeDasharray="6 3" fill="none" /> : null}
        </g>
      ))}

      {/* Legend top */}
      <g aria-hidden="true" fontSize="11" fill="var(--c-text)">
        {scaled.series.map((s, i) => (
          <g key={`leg-${s.name}`} transform={`translate(${PAD_L + i * 150}, ${10})`}>
            <line x1={0} y1={8} x2={20} y2={8} stroke={s.color} strokeWidth={2.5} />
            <text x={26} y={12} fontWeight={500}>{s.name}{s.hasGlide ? " (bubble / dew)" : ""}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
