import { useMemo } from "react";
import type { PTPoint } from "@/data/refrigerants";
import { niceTicks, svgClosedRegion, svgPath, svgRound } from "@/lib/svg-tokens";

export type PTUnit = "psig" | "kpag";
export type TempUnit = "F" | "C";

export interface PTCurveProps {
  /** PT points; typically 191 entries (-40 to 150°F at 1°F). */
  points: PTPoint[];
  /** True for zeotropes (R-407C, R-454C, R-455A). Draws both bubble and dew. */
  hasGlide: boolean;
  /** Y-axis unit. */
  unit?: PTUnit;
  /** X-axis unit. */
  tempUnit?: TempUnit;
  /** Optional vertical-line highlight (in °F). */
  highlightTempF?: number;
  /** Required for accessibility. */
  ariaLabel: string;
  className?: string;
}

const W = 800;
const H = 480;
const PAD_L = 64;
const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 56;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const TEMP_FIELD: Record<TempUnit, "tempF" | "tempC"> = { F: "tempF", C: "tempC" };
const BUBBLE_FIELD: Record<PTUnit, "bubblePsig" | "bubbleKpag"> = {
  psig: "bubblePsig",
  kpag: "bubbleKpag",
};
const DEW_FIELD: Record<PTUnit, "dewPsig" | "dewKpag"> = {
  psig: "dewPsig",
  kpag: "dewKpag",
};

const TEMP_UNIT_LABEL: Record<TempUnit, string> = { F: "°F", C: "°C" };
const PRESSURE_UNIT_LABEL: Record<PTUnit, string> = { psig: "PSIG", kpag: "kPa (gauge)" };

export function PTCurve({
  points,
  hasGlide,
  unit = "psig",
  tempUnit = "F",
  highlightTempF,
  ariaLabel,
  className = "",
}: PTCurveProps) {
  const scaled = useMemo(() => {
    if (points.length === 0) return null;
    const tKey = TEMP_FIELD[tempUnit];
    const bKey = BUBBLE_FIELD[unit];
    const dKey = DEW_FIELD[unit];

    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    for (const p of points) {
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
    // Pad y range slightly so the curve isn't pinned to the top/bottom edge.
    const yPad = Math.max((yMax - yMin) * 0.04, 1);
    yMin -= yPad;
    yMax += yPad;

    const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
    const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

    const bubblePath = svgPath(points, (p) => xScale(p[tKey]), (p) => yScale(p[bKey]));
    const dewPath = hasGlide
      ? svgPath(points, (p) => xScale(p[tKey]), (p) => yScale(p[dKey]))
      : null;
    const glideRegion =
      hasGlide
        ? svgClosedRegion(
            points,
            points,
            (p) => xScale(p[tKey]),
            (p) => yScale(p[bKey]),
            (p) => yScale(p[dKey])
          )
        : null;

    const xTicks = niceTicks(xMin, xMax, 8);
    const yTicks = niceTicks(yMin, yMax, 6);

    let highlight: { x: number; bubbleY: number; dewY: number; bubbleVal: number; dewVal: number } | null = null;
    if (highlightTempF !== undefined) {
      const targetX = tempUnit === "F" ? highlightTempF : (highlightTempF - 32) * 5 / 9;
      // Linear interpolate in source data to get bubble/dew at the highlight temp.
      const sorted = [...points].sort((a, b) => a[tKey] - b[tKey]);
      let lo = sorted[0], hi = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i][tKey] <= targetX && targetX <= sorted[i + 1][tKey]) {
          lo = sorted[i];
          hi = sorted[i + 1];
          break;
        }
      }
      if (targetX >= xMin && targetX <= xMax && hi[tKey] !== lo[tKey]) {
        const t = (targetX - lo[tKey]) / (hi[tKey] - lo[tKey]);
        const bubbleVal = lo[bKey] + t * (hi[bKey] - lo[bKey]);
        const dewVal = lo[dKey] + t * (hi[dKey] - lo[dKey]);
        highlight = {
          x: xScale(targetX),
          bubbleY: yScale(bubbleVal),
          dewY: yScale(dewVal),
          bubbleVal,
          dewVal,
        };
      }
    }

    return { xMin, xMax, yMin, yMax, xScale, yScale, bubblePath, dewPath, glideRegion, xTicks, yTicks, highlight };
  }, [points, unit, tempUnit, hasGlide, highlightTempF]);

  if (!scaled) {
    return (
      <div className={`flex h-64 items-center justify-center rounded-md border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 ${className}`} role="img" aria-label={ariaLabel}>
        No PT data available — see manufacturer datasheet.
      </div>
    );
  }

  const { xScale, yScale, bubblePath, dewPath, glideRegion, xTicks, yTicks, highlight } = scaled;
  const tempLabel = TEMP_UNIT_LABEL[tempUnit];
  const pressureLabel = PRESSURE_UNIT_LABEL[unit];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Plot background — subtle, helps glide region read */}
      <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill="transparent" />

      {/* Grid */}
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
        {yTicks.map((t) => (
          <line
            key={`gy-${t}`}
            x1={PAD_L}
            y1={svgRound(yScale(t))}
            x2={PAD_L + PLOT_W}
            y2={svgRound(yScale(t))}
            stroke="var(--c-grid)"
            strokeDasharray="2 3"
            strokeWidth={1}
          />
        ))}
      </g>

      {/* Axes */}
      <g aria-hidden="true">
        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="var(--c-axis)" strokeWidth={1.25} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--c-axis)" strokeWidth={1.25} />
      </g>

      {/* Tick labels */}
      <g aria-hidden="true" fill="var(--c-text)" fontSize="11">
        {xTicks.map((t) => (
          <text key={`tx-${t}`} x={svgRound(xScale(t))} y={PAD_T + PLOT_H + 16} textAnchor="middle">
            {t}
          </text>
        ))}
        {yTicks.map((t) => (
          <text key={`ty-${t}`} x={PAD_L - 8} y={svgRound(yScale(t)) + 4} textAnchor="end">
            {Math.round(t * 10) / 10}
          </text>
        ))}
      </g>

      {/* Axis titles */}
      <g aria-hidden="true" fill="var(--c-text)" fontSize="12" fontWeight={500}>
        <text x={PAD_L + PLOT_W / 2} y={H - 12} textAnchor="middle">
          Temperature ({tempLabel})
        </text>
        <text
          x={-(PAD_T + PLOT_H / 2)}
          y={16}
          textAnchor="middle"
          transform="rotate(-90)"
        >
          Saturation pressure ({pressureLabel})
        </text>
      </g>

      {/* Glide region — shaded fill between bubble and dew */}
      {hasGlide && glideRegion ? (
        <path d={glideRegion} fill="var(--c-dew)" fillOpacity={0.1} stroke="none" />
      ) : null}

      {/* Bubble curve */}
      <path d={bubblePath} stroke="var(--c-bubble)" strokeWidth={2} fill="none" />

      {/* Dew curve (only for zeotropes) */}
      {hasGlide && dewPath ? (
        <path d={dewPath} stroke="var(--c-dew)" strokeWidth={2} strokeDasharray="6 3" fill="none" />
      ) : null}

      {/* Highlight at specific temperature */}
      {highlight ? (
        <g>
          <line
            x1={svgRound(highlight.x)}
            y1={PAD_T}
            x2={svgRound(highlight.x)}
            y2={PAD_T + PLOT_H}
            stroke="var(--c-accent)"
            strokeWidth={1.25}
            strokeDasharray="4 2"
          />
          <circle cx={svgRound(highlight.x)} cy={svgRound(highlight.bubbleY)} r={4} fill="var(--c-accent)" />
          {hasGlide ? (
            <circle cx={svgRound(highlight.x)} cy={svgRound(highlight.dewY)} r={4} fill="var(--c-accent)" />
          ) : null}
          <g fontSize="11" fill="var(--c-accent)" fontWeight={600}>
            <text x={svgRound(highlight.x) + 6} y={svgRound(highlight.bubbleY) - 6}>
              {highlightTempF}{TEMP_UNIT_LABEL.F}: {highlight.bubbleVal.toFixed(1)} {pressureLabel}
              {hasGlide ? ` (bubble)` : ""}
            </text>
            {hasGlide ? (
              <text x={svgRound(highlight.x) + 6} y={svgRound(highlight.dewY) + 14}>
                {highlight.dewVal.toFixed(1)} {pressureLabel} (dew)
              </text>
            ) : null}
          </g>
        </g>
      ) : null}

      {/* Legend */}
      <g aria-hidden="true" fontSize="12" fill="var(--c-text)">
        <g transform={`translate(${PAD_L + PLOT_W - 152}, ${PAD_T + 8})`}>
          <rect x={0} y={0} width={148} height={hasGlide ? 44 : 24} fill="var(--background)" fillOpacity={0.85} stroke="var(--c-grid)" rx={3} />
          <line x1={8} y1={14} x2={24} y2={14} stroke="var(--c-bubble)" strokeWidth={2} />
          <text x={30} y={18}>Bubble point</text>
          {hasGlide ? (
            <g>
              <line x1={8} y1={34} x2={24} y2={34} stroke="var(--c-dew)" strokeWidth={2} strokeDasharray="6 3" />
              <text x={30} y={38}>Dew point</text>
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
