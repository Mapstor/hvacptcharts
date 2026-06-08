"use client";

import { useEffect, useState } from "react";
import { svgRound } from "@/lib/svg-tokens";

export interface PhaseDownMilestone {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  label: string;
  severity: "info" | "warning" | "critical";
  /** Source ID in data/sources.json. */
  citation?: string;
}

export interface PhaseDownTimelineProps {
  refrigerantName: string;
  milestones: PhaseDownMilestone[];
  /** Render a dashed vertical line at the current date. Default true. */
  showCurrentDate?: boolean;
  /** ISO date fallback to use as "today" during SSR before client hydrates with the actual current date. */
  asOfDate?: string;
  ariaLabel: string;
  className?: string;
}

const SEVERITY_COLORS = {
  info: "var(--c-bubble)",
  warning: "#d49a2b",
  critical: "var(--c-safe-a3)",
};

const W = 800;
const H = 260;
const AXIS_Y = H / 2;
const PAD_L = 40;
const PAD_R = 40;

export function PhaseDownTimeline({
  refrigerantName,
  milestones,
  showCurrentDate = true,
  asOfDate,
  ariaLabel,
  className = "",
}: PhaseDownTimelineProps) {
  // Dynamic "today" — SSR renders with asOfDate so the markup is deterministic
  // and matches initial client hydration (both produce the same SVG positions
  // when yearOf() is timezone-stable, which it is). After mount, swap in the
  // real today so the marker doesn't go stale as the build date ages.
  const [clientToday, setClientToday] = useState<string | null>(null);
  useEffect(() => {
    // Intentional: one-shot post-hydration refresh of an SSR fallback value.
    // No cascade — the effect has [] deps so it runs exactly once after the
    // initial paint, triggering a single re-render with the live "today".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClientToday(new Date().toISOString().slice(0, 10));
  }, []);

  if (milestones.length === 0) return null;

  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  const minYear = Math.floor(yearOf(sorted[0].date));
  const maxYear = Math.ceil(yearOf(sorted[sorted.length - 1].date)) + 1;

  // Include "now" in the range. Use client-computed today if available, else fall back to server-passed asOfDate.
  const now = clientToday ?? asOfDate ?? new Date().toISOString().slice(0, 10);
  const nowYear = yearOf(now);
  const rangeMin = Math.min(minYear, Math.floor(nowYear) - 1);
  const rangeMax = Math.max(maxYear, Math.ceil(nowYear) + 1);

  const xScale = (year: number) => PAD_L + ((year - rangeMin) / (rangeMax - rangeMin)) * (W - PAD_L - PAD_R);

  // Adaptive tick density: every year if range ≤ 12; every 5 years (aligned to multiples of 5) otherwise.
  const spanYears = rangeMax - rangeMin;
  const step = spanYears <= 12 ? 1 : 5;
  const years: number[] = [];
  if (step === 1) {
    for (let y = rangeMin; y <= rangeMax; y += 1) years.push(y);
  } else {
    // Anchor to multiples of 5 inside the range
    const start = Math.ceil(rangeMin / 5) * 5;
    for (let y = start; y <= rangeMax; y += 5) years.push(y);
    if (years[0] !== rangeMin && years[0] - rangeMin >= 2) years.unshift(rangeMin);
    if (years[years.length - 1] !== rangeMax && rangeMax - years[years.length - 1] >= 2) years.push(rangeMax);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Axis */}
      <line x1={PAD_L} y1={AXIS_Y} x2={W - PAD_R} y2={AXIS_Y} stroke="var(--c-axis)" strokeWidth={1.5} />
      {/* Year ticks */}
      {years.map((y) => (
        <g key={`tick-${y}`}>
          <line x1={svgRound(xScale(y))} y1={AXIS_Y - 5} x2={svgRound(xScale(y))} y2={AXIS_Y + 5} stroke="var(--c-axis)" strokeWidth={1} />
          <text x={svgRound(xScale(y))} y={AXIS_Y + 22} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.7}>
            {y}
          </text>
        </g>
      ))}

      {/* Current-date marker */}
      {showCurrentDate ? (
        <g>
          <line
            x1={svgRound(xScale(nowYear))}
            y1={20}
            x2={svgRound(xScale(nowYear))}
            y2={H - 20}
            stroke="var(--c-accent)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text x={svgRound(xScale(nowYear))} y={14} textAnchor="middle" fontSize="11" fontWeight={600} fill="var(--c-accent)">
            today ({now})
          </text>
        </g>
      ) : null}

      {/* Milestone markers — alternate above/below to avoid label overlap */}
      {sorted.map((m, i) => {
        const x = xScale(yearOf(m.date));
        const isAbove = i % 2 === 0;
        const labelY = isAbove ? AXIS_Y - 28 : AXIS_Y + 60;
        const labelAnchorY = isAbove ? AXIS_Y - 12 : AXIS_Y + 12;
        const color = SEVERITY_COLORS[m.severity];
        return (
          <g key={`m-${i}`}>
            <line x1={svgRound(x)} y1={AXIS_Y} x2={svgRound(x)} y2={labelAnchorY} stroke={color} strokeWidth={1.5} />
            <circle cx={svgRound(x)} cy={AXIS_Y} r={6} fill={color} stroke="var(--background)" strokeWidth={1.5} />
            <foreignObject x={svgRound(x) - 90} y={isAbove ? labelY - 38 : labelY - 14} width={180} height={56}>
              <div
                style={{
                  fontSize: "11px",
                  lineHeight: "1.3",
                  color: "var(--c-text)",
                  textAlign: "center",
                  fontFamily: "inherit",
                }}
              >
                <strong style={{ color }}>{m.date}</strong>
                <div style={{ marginTop: "2px" }}>{m.label}</div>
              </div>
            </foreignObject>
          </g>
        );
      })}

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.6}>
        Regulatory timeline for {refrigerantName}
      </text>
    </svg>
  );
}

function yearOf(iso: string): number {
  // Timezone-stable: parse YYYY-MM-DD components directly and compute in UTC
  // so server (UTC) and client (any timezone) produce identical results.
  // (`new Date("2021-01-01")` parses as UTC midnight but `.getFullYear()`
  // returns local-time year — that mismatch causes SSR hydration errors.)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return Number.NaN;
  const y = Number(m[1]);
  const mon = Number(m[2]) - 1;
  const day = Number(m[3]);
  const t = Date.UTC(y, mon, day);
  const yearStart = Date.UTC(y, 0, 1);
  const yearEnd = Date.UTC(y + 1, 0, 1);
  const frac = (t - yearStart) / (yearEnd - yearStart);
  return y + frac;
}
