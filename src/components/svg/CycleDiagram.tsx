import { svgRound } from "@/lib/svg-tokens";

export interface CycleConditions {
  /** Suction line (evaporator outlet → compressor inlet). Low-pressure side. */
  suctionPsig: number;
  suctionTempF: number;
  /** Discharge line (compressor outlet → condenser inlet). High-pressure side. */
  dischargePsig: number;
  dischargeTempF: number;
  /** Liquid line (condenser outlet → expansion device). */
  liquidPsig: number;
  liquidTempF: number;
  /** Evaporator inlet (post-expansion two-phase mix). */
  evapInletPsig: number;
  evapInletTempF: number;
}

export interface CycleDiagramProps {
  refrigerantName: string;
  conditions: CycleConditions;
  /** Required for accessibility. */
  ariaLabel: string;
  className?: string;
}

const W = 760;
const H = 460;

const pipeColors = {
  hotVapor: "#c0392b", // hot gas: compressor → condenser
  warmLiquid: "#d49a2b", // condensed liquid: condenser → expansion
  coldMix: "#3a8ed1", // expanded mix: expansion → evaporator
  coolVapor: "#3aa3c2", // cool vapor: evaporator → compressor
};

export function CycleDiagram({
  refrigerantName,
  conditions,
  ariaLabel,
  className = "",
}: CycleDiagramProps) {
  const c = conditions;

  // Geometry
  const boxW = 180;
  const boxH = 120;
  const margin = 56;
  const compressor = { x: margin, y: margin };
  const condenser = { x: W - margin - boxW, y: margin };
  const expansion = { x: W - margin - boxW, y: H - margin - boxH };
  const evaporator = { x: margin, y: H - margin - boxH };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Pipes — drawn first so component boxes render on top */}
      {/* Hot vapor: compressor TOP → condenser TOP */}
      <path
        d={`M${compressor.x + boxW},${compressor.y + boxH / 3} L${condenser.x},${condenser.y + boxH / 3}`}
        stroke={pipeColors.hotVapor}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Warm liquid: condenser RIGHT → expansion RIGHT (down the right side) */}
      <path
        d={`M${condenser.x + boxW - 20},${condenser.y + boxH} L${condenser.x + boxW - 20},${expansion.y}`}
        stroke={pipeColors.warmLiquid}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Cold mix: expansion BOTTOM → evaporator BOTTOM */}
      <path
        d={`M${expansion.x},${expansion.y + (2 * boxH) / 3} L${evaporator.x + boxW},${evaporator.y + (2 * boxH) / 3}`}
        stroke={pipeColors.coldMix}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Cool vapor: evaporator LEFT → compressor LEFT */}
      <path
        d={`M${evaporator.x + 20},${evaporator.y} L${evaporator.x + 20},${compressor.y + boxH}`}
        stroke={pipeColors.coolVapor}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Stage boxes */}
      {[
        { ...compressor, title: "Compressor", subtitle: "Raises pressure" },
        { ...condenser, title: "Condenser", subtitle: "Rejects heat to outdoors" },
        { ...expansion, title: "Expansion device", subtitle: "Drops pressure" },
        { ...evaporator, title: "Evaporator", subtitle: "Absorbs heat from indoors" },
      ].map((b) => (
        <g key={b.title}>
          <rect
            x={b.x}
            y={b.y}
            width={boxW}
            height={boxH}
            rx={8}
            fill="var(--background)"
            stroke="var(--c-axis)"
            strokeWidth={1.5}
          />
          <text x={b.x + boxW / 2} y={b.y + 26} textAnchor="middle" fontSize="15" fontWeight={600} fill="var(--c-text)">
            {b.title}
          </text>
          <text x={b.x + boxW / 2} y={b.y + 46} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.6}>
            {b.subtitle}
          </text>
        </g>
      ))}

      {/* Operating-condition labels on each pipe */}
      {/* Discharge (top center) */}
      <g>
        <rect
          x={W / 2 - 90}
          y={compressor.y + boxH / 3 - 28}
          width={180}
          height={20}
          fill="var(--background)"
          rx={3}
        />
        <text x={W / 2} y={svgRound(compressor.y + boxH / 3 - 13)} textAnchor="middle" fontSize="11" fontWeight={600} fill={pipeColors.hotVapor}>
          Discharge: {svgRound(c.dischargePsig).toFixed(0)} PSIG, {svgRound(c.dischargeTempF).toFixed(0)}°F
        </text>
      </g>
      {/* Liquid line (right side) */}
      <g>
        <rect
          x={condenser.x + boxW - 100}
          y={H / 2 - 10}
          width={140}
          height={20}
          fill="var(--background)"
          rx={3}
        />
        <text x={condenser.x + boxW - 30} y={svgRound(H / 2 + 5)} textAnchor="middle" fontSize="11" fontWeight={600} fill={pipeColors.warmLiquid}>
          Liquid: {svgRound(c.liquidPsig).toFixed(0)} PSIG, {svgRound(c.liquidTempF).toFixed(0)}°F
        </text>
      </g>
      {/* Evap inlet (bottom center) */}
      <g>
        <rect
          x={W / 2 - 110}
          y={expansion.y + (2 * boxH) / 3 + 6}
          width={220}
          height={20}
          fill="var(--background)"
          rx={3}
        />
        <text x={W / 2} y={svgRound(expansion.y + (2 * boxH) / 3 + 21)} textAnchor="middle" fontSize="11" fontWeight={600} fill={pipeColors.coldMix}>
          Evap inlet: {svgRound(c.evapInletPsig).toFixed(0)} PSIG, {svgRound(c.evapInletTempF).toFixed(0)}°F (two-phase)
        </text>
      </g>
      {/* Suction (left side) */}
      <g>
        <rect
          x={evaporator.x - 30}
          y={H / 2 - 10}
          width={140}
          height={20}
          fill="var(--background)"
          rx={3}
        />
        <text x={evaporator.x + 40} y={svgRound(H / 2 + 5)} textAnchor="middle" fontSize="11" fontWeight={600} fill={pipeColors.coolVapor}>
          Suction: {svgRound(c.suctionPsig).toFixed(0)} PSIG, {svgRound(c.suctionTempF).toFixed(0)}°F
        </text>
      </g>

      {/* Direction arrows on pipes — small chevrons */}
      <g aria-hidden="true">
        <Chevron x={W / 2 + 30} y={compressor.y + boxH / 3} fill={pipeColors.hotVapor} dir="right" />
        <Chevron x={condenser.x + boxW - 20} y={H / 2 + 30} fill={pipeColors.warmLiquid} dir="down" />
        <Chevron x={W / 2 - 30} y={expansion.y + (2 * boxH) / 3} fill={pipeColors.coldMix} dir="left" />
        <Chevron x={evaporator.x + 20} y={H / 2 - 30} fill={pipeColors.coolVapor} dir="up" />
      </g>

      {/* Footer label */}
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--c-text)" opacity={0.6}>
        Typical residential cooling cycle for {refrigerantName} (40°F evap, 110°F condenser, 10°F superheat, 10°F subcooling)
      </text>
    </svg>
  );
}

function Chevron({ x, y, fill, dir }: { x: number; y: number; fill: string; dir: "up" | "down" | "left" | "right" }) {
  const size = 8;
  let points: string;
  switch (dir) {
    case "right":
      points = `${x - size},${y - size} ${x + size},${y} ${x - size},${y + size}`;
      break;
    case "left":
      points = `${x + size},${y - size} ${x - size},${y} ${x + size},${y + size}`;
      break;
    case "down":
      points = `${x - size},${y - size} ${x},${y + size} ${x + size},${y - size}`;
      break;
    case "up":
      points = `${x - size},${y + size} ${x},${y - size} ${x + size},${y + size}`;
      break;
  }
  return <polygon points={points} fill={fill} />;
}
