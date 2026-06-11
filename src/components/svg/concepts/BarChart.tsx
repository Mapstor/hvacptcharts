/**
 * Reusable bar chart for guide pages. Supports vertical/horizontal orientation,
 * single + grouped + stacked bars, configurable color per data point.
 */

interface BarDatum {
  label: string;
  value: number;
  /** Optional sub-label rendered below the value (e.g. "BTU/hr" or "% of total"). */
  sub?: string;
  color?: string;
  /** Optional emphasis — drawn with thicker stroke. */
  emphasis?: boolean;
}

export interface BarChartProps {
  title: string;
  data: BarDatum[];
  orientation?: "vertical" | "horizontal";
  /** Override default color palette. */
  defaultColor?: string;
  /** Y-axis label (vertical) or X-axis label (horizontal). */
  axisLabel?: string;
  /** Optional caption rendered below the SVG. */
  caption?: string;
  /** Optional reference value drawn as a dashed line. */
  reference?: { value: number; label: string; color?: string };
  /** Width/height — set to your container size, defaults are usually fine. */
  width?: number;
  height?: number;
}

const PALETTE = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

const formatValue = (v: number) => {
  if (Math.abs(v) >= 10000) return Math.round(v).toLocaleString();
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
};

export function BarChart({
  title,
  data,
  orientation = "vertical",
  defaultColor,
  axisLabel,
  caption,
  reference,
  width = 640,
  height,
}: BarChartProps) {
  const h = height ?? (orientation === "horizontal" ? Math.max(200, data.length * 38 + 60) : 280);

  if (orientation === "horizontal") {
    return <HorizontalBarChart title={title} data={data} defaultColor={defaultColor} axisLabel={axisLabel} caption={caption} reference={reference} width={width} height={h} />;
  }
  return <VerticalBarChart title={title} data={data} defaultColor={defaultColor} axisLabel={axisLabel} caption={caption} reference={reference} width={width} height={h} />;
}

function VerticalBarChart({ title, data, defaultColor, axisLabel, caption, reference, width, height }: BarChartProps & { width: number; height: number }) {
  const padding = { top: 30, right: 20, bottom: 60, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), reference?.value ?? 0) * 1.1;
  const barW = innerW / data.length;
  const gap = barW * 0.2;

  const yScale = (v: number) => padding.top + innerH - (v / max) * innerH;
  const refY = reference ? yScale(reference.value) : null;
  const yTicks = [0, max / 4, max / 2, (3 * max) / 4, max];

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        {/* Y-axis grid + ticks */}
        {yTicks.map((v, i) => (
          <g key={`yt-${i}`}>
            <line x1={padding.left} y1={yScale(v)} x2={width - padding.right} y2={yScale(v)} stroke="#e4e4e7" strokeDasharray="2,2" className="dark:stroke-zinc-700" />
            <text x={padding.left - 6} y={yScale(v) + 3} fontSize="9" textAnchor="end" fill="#71717a" className="dark:fill-zinc-400">{formatValue(v)}</text>
          </g>
        ))}
        {axisLabel ? (
          <text x={padding.left - 40} y={padding.top + innerH / 2} fontSize="10" fill="#52525b" transform={`rotate(-90, ${padding.left - 40}, ${padding.top + innerH / 2})`} textAnchor="middle" className="dark:fill-zinc-300">{axisLabel}</text>
        ) : null}

        {/* Reference line */}
        {refY !== null && reference ? (
          <g>
            <line x1={padding.left} y1={refY} x2={width - padding.right} y2={refY} stroke={reference.color ?? "#16a34a"} strokeWidth="1.5" strokeDasharray="4,3" className="dark:stroke-emerald-400" />
            <text x={width - padding.right - 4} y={refY - 4} fontSize="9" textAnchor="end" fill={reference.color ?? "#15803d"} className="dark:fill-emerald-300">{reference.label}</text>
          </g>
        ) : null}

        {/* Bars */}
        {data.map((d, i) => {
          const color = d.color ?? defaultColor ?? PALETTE[i % PALETTE.length];
          const x = padding.left + i * barW + gap / 2;
          const w = barW - gap;
          const y = yScale(d.value);
          const barH = padding.top + innerH - y;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={w} height={barH} fill={color} opacity={0.85} stroke={d.emphasis ? "#0c1525" : "none"} strokeWidth={d.emphasis ? 2 : 0} />
              <text x={x + w / 2} y={y - 6} fontSize="10" fontWeight="600" textAnchor="middle" fill="#1e293b" className="dark:fill-zinc-100">{formatValue(d.value)}</text>
              <text x={x + w / 2} y={padding.top + innerH + 16} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">{d.label}</text>
              {d.sub ? <text x={x + w / 2} y={padding.top + innerH + 30} fontSize="9" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">{d.sub}</text> : null}
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      {caption ? <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">{caption}</p> : null}
    </figure>
  );
}

function HorizontalBarChart({ title, data, defaultColor, axisLabel, caption, reference, width, height }: BarChartProps & { width: number; height: number }) {
  const padding = { top: 30, right: 80, bottom: 50, left: 160 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), reference?.value ?? 0) * 1.1;
  const barH = innerH / data.length;
  const gap = barH * 0.2;

  const xScale = (v: number) => padding.left + (v / max) * innerW;
  const refX = reference ? xScale(reference.value) : null;
  const xTicks = [0, max / 4, max / 2, (3 * max) / 4, max];

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        {/* X-axis grid + ticks */}
        {xTicks.map((v, i) => (
          <g key={`xt-${i}`}>
            <line x1={xScale(v)} y1={padding.top} x2={xScale(v)} y2={padding.top + innerH} stroke="#e4e4e7" strokeDasharray="2,2" className="dark:stroke-zinc-700" />
            <text x={xScale(v)} y={padding.top + innerH + 16} fontSize="9" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">{formatValue(v)}</text>
          </g>
        ))}
        {axisLabel ? (
          <text x={padding.left + innerW / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">{axisLabel}</text>
        ) : null}

        {/* Reference line */}
        {refX !== null && reference ? (
          <g>
            <line x1={refX} y1={padding.top} x2={refX} y2={padding.top + innerH} stroke={reference.color ?? "#16a34a"} strokeWidth="1.5" strokeDasharray="4,3" className="dark:stroke-emerald-400" />
            <text x={refX + 4} y={padding.top - 4} fontSize="9" fill={reference.color ?? "#15803d"} className="dark:fill-emerald-300">{reference.label}</text>
          </g>
        ) : null}

        {/* Bars */}
        {data.map((d, i) => {
          const color = d.color ?? defaultColor ?? PALETTE[i % PALETTE.length];
          const y = padding.top + i * barH + gap / 2;
          const h = barH - gap;
          const w = xScale(d.value) - padding.left;
          return (
            <g key={d.label}>
              <text x={padding.left - 8} y={y + h / 2 + 4} fontSize="11" textAnchor="end" fill="#52525b" className="dark:fill-zinc-300">{d.label}</text>
              <rect x={padding.left} y={y} width={w} height={h} fill={color} opacity={0.85} stroke={d.emphasis ? "#0c1525" : "none"} strokeWidth={d.emphasis ? 2 : 0} />
              <text x={padding.left + w + 6} y={y + h / 2 + 4} fontSize="11" fontWeight="600" fill="#1e293b" className="dark:fill-zinc-100">{formatValue(d.value)}{d.sub ? <tspan fontSize="9" fill="#71717a" className="dark:fill-zinc-400"> {d.sub}</tspan> : null}</text>
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      {caption ? <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">{caption}</p> : null}
    </figure>
  );
}
