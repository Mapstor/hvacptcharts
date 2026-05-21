import { svgRound } from "@/lib/svg-tokens";

export interface GlideVisualizationProps {
  refrigerantName: string;
  /** Constant suction-side operating pressure (PSIG). */
  pressurePsig: number;
  /** Temperature at the bubble point — entry to evaporator after expansion. */
  bubbleTempF: number;
  /** Temperature at the dew point — vapor leaving the evaporator. */
  dewTempF: number;
  ariaLabel: string;
  className?: string;
}

const W = 760;
const H = 360;

export function GlideVisualization({
  refrigerantName,
  pressurePsig,
  bubbleTempF,
  dewTempF,
  ariaLabel,
  className = "",
}: GlideVisualizationProps) {
  const glide = Math.abs(dewTempF - bubbleTempF);
  const midTempF = (bubbleTempF + dewTempF) / 2;

  // Evaporator rectangle
  const coilX = 80;
  const coilY = 80;
  const coilW = W - 160;
  const coilH = 80;

  // Subchart geometry
  const subX = 80;
  const subY = 220;
  const subW = W - 160;
  const subH = 90;

  // Subchart y-scale (temperature)
  const yPad = Math.max(glide * 0.3, 2);
  const yMin = Math.min(bubbleTempF, dewTempF) - yPad;
  const yMax = Math.max(bubbleTempF, dewTempF) + yPad;
  const yScale = (t: number) => subY + subH - ((t - yMin) / (yMax - yMin)) * subH;
  const xScale = (frac: number) => subX + frac * subW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Color gradient: cold blue at left (bubble, just expanded) → warmer at right (dew, fully vaporized) */}
        <linearGradient id={`glide-grad-${refrigerantName.replace(/[^a-zA-Z0-9]/g, "_")}`} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#3a8ed1" />
          <stop offset="100%" stopColor="#d49a2b" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x={W / 2} y={32} textAnchor="middle" fontSize="14" fontWeight={600} fill="var(--c-text)">
        Temperature glide across evaporator at constant pressure
      </text>
      <text x={W / 2} y={50} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.6}>
        {refrigerantName} at {svgRound(pressurePsig).toFixed(0)} PSIG suction
      </text>

      {/* Evaporator coil with gradient */}
      <rect
        x={coilX}
        y={coilY}
        width={coilW}
        height={coilH}
        rx={6}
        fill={`url(#glide-grad-${refrigerantName.replace(/[^a-zA-Z0-9]/g, "_")})`}
        opacity={0.85}
        stroke="var(--c-axis)"
        strokeWidth={1.25}
      />
      {/* Flow direction arrow on coil */}
      <text x={W / 2} y={coilY + coilH / 2 + 5} textAnchor="middle" fontSize="13" fill="white" fontWeight={600}>
        →  refrigerant flow  →
      </text>

      {/* Entry / mid / exit temperature labels */}
      <text x={coilX} y={coilY - 10} textAnchor="middle" fontSize="12" fill="var(--c-bubble)" fontWeight={600}>
        Entry: {svgRound(bubbleTempF).toFixed(1)}°F
      </text>
      <text x={coilX + coilW / 2} y={coilY - 10} textAnchor="middle" fontSize="12" fill="var(--c-text)" opacity={0.7}>
        Mid: {svgRound(midTempF).toFixed(1)}°F
      </text>
      <text x={coilX + coilW} y={coilY - 10} textAnchor="middle" fontSize="12" fill="var(--c-dew)" fontWeight={600}>
        Exit: {svgRound(dewTempF).toFixed(1)}°F
      </text>

      {/* Glide bracket beneath the coil */}
      <g>
        <line x1={coilX} y1={coilY + coilH + 12} x2={coilX} y2={coilY + coilH + 22} stroke="var(--c-text)" strokeWidth={1} />
        <line x1={coilX + coilW} y1={coilY + coilH + 12} x2={coilX + coilW} y2={coilY + coilH + 22} stroke="var(--c-text)" strokeWidth={1} />
        <line x1={coilX} y1={coilY + coilH + 17} x2={coilX + coilW} y2={coilY + coilH + 17} stroke="var(--c-text)" strokeWidth={1} />
        <rect x={coilX + coilW / 2 - 70} y={coilY + coilH + 12} width={140} height={16} fill="var(--background)" />
        <text x={coilX + coilW / 2} y={coilY + coilH + 24} textAnchor="middle" fontSize="12" fontWeight={600} fill="var(--c-text)">
          Glide = {svgRound(glide).toFixed(1)}°F
        </text>
      </g>

      {/* Subchart axes */}
      <line x1={subX} y1={subY + subH} x2={subX + subW} y2={subY + subH} stroke="var(--c-axis)" strokeWidth={1.25} />
      <line x1={subX} y1={subY} x2={subX} y2={subY + subH} stroke="var(--c-axis)" strokeWidth={1.25} />

      {/* Subchart line: temperature profile across coil (linear approximation) */}
      <line
        x1={svgRound(xScale(0))}
        y1={svgRound(yScale(bubbleTempF))}
        x2={svgRound(xScale(1))}
        y2={svgRound(yScale(dewTempF))}
        stroke="var(--c-accent)"
        strokeWidth={2.5}
      />
      <circle cx={svgRound(xScale(0))} cy={svgRound(yScale(bubbleTempF))} r={4} fill="var(--c-bubble)" />
      <circle cx={svgRound(xScale(1))} cy={svgRound(yScale(dewTempF))} r={4} fill="var(--c-dew)" />

      {/* Subchart axis labels */}
      <text x={subX + subW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.7}>
        Position along evaporator coil
      </text>
      <text x={subX - 6} y={svgRound(yScale(bubbleTempF)) + 4} textAnchor="end" fontSize="10" fill="var(--c-text)" opacity={0.7}>
        {svgRound(bubbleTempF).toFixed(0)}°F
      </text>
      <text x={subX - 6} y={svgRound(yScale(dewTempF)) + 4} textAnchor="end" fontSize="10" fill="var(--c-text)" opacity={0.7}>
        {svgRound(dewTempF).toFixed(0)}°F
      </text>
    </svg>
  );
}
