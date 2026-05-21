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
  /** ISO date to use as "today" — defaults to runtime now. Pass an explicit date for testing or to render at build time. */
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
  if (milestones.length === 0) return null;

  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  const minYear = Math.floor(yearOf(sorted[0].date));
  const maxYear = Math.ceil(yearOf(sorted[sorted.length - 1].date)) + 1;

  // Include "now" in the range if showing the current-date marker
  const now = asOfDate ?? new Date().toISOString().slice(0, 10);
  const nowYear = yearOf(now);
  const rangeMin = Math.min(minYear, Math.floor(nowYear) - 1);
  const rangeMax = Math.max(maxYear, Math.ceil(nowYear) + 1);

  const xScale = (year: number) => PAD_L + ((year - rangeMin) / (rangeMax - rangeMin)) * (W - PAD_L - PAD_R);

  const years: number[] = [];
  for (let y = rangeMin; y <= rangeMax; y += 1) years.push(y);

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
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  const yearStart = new Date(d.getFullYear(), 0, 1).getTime();
  const yearEnd = new Date(d.getFullYear() + 1, 0, 1).getTime();
  const frac = (d.getTime() - yearStart) / (yearEnd - yearStart);
  return d.getFullYear() + frac;
}
