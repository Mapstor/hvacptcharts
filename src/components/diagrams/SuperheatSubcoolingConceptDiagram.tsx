import { useId } from "react";

const FIGCAPTION =
  "Refrigerant flows left-to-right through a straightened evaporator (top) and condenser (bottom). In the evaporator the entering saturated mixture boils progressively; the point where the last liquid droplet vaporizes is where the refrigerant reaches saturation temperature, and every degree of temperature rise past that point is superheat. In the condenser the entering superheated vapor condenses progressively; the point where the last vapor bubble condenses is saturation temperature again, and every degree of temperature drop past that point is subcooling. Superheat is measured on the suction side, subcooling on the liquid side; both are computed relative to the saturation temperature that corresponds to the measured pressure.";

const DESC =
  "Superheat is the temperature difference between refrigerant vapor in the suction line and the saturation temperature that corresponds to the measured suction pressure. It exists because after all the liquid refrigerant has evaporated in the evaporator, additional heat absorption raises the vapor temperature above the saturation reference. Subcooling is the counterpart quantity on the high side: the temperature difference between the liquid refrigerant in the liquid line and the saturation temperature that corresponds to the measured liquid-line (high-side) pressure. It exists because after all the vapor has condensed in the condenser, additional heat rejection lowers the liquid temperature below the saturation reference. The saturation temperature is the pressure-dependent phase-change temperature; superheat and subcooling together tell the technician how far the refrigerant is from the phase boundary on each side of the system.";

// Named timing constants — one shared value each per user directive.
const FLOW_LOOP_S = 10;
const PULSE_LOOP_S = 4;

// Layout constants (viewBox 720 x 440)
const TUBE_START_X = 60;
const TUBE_END_X = 660;
const TUBE_LEN = TUBE_END_X - TUBE_START_X;
const EVAP_Y = 100;
const EVAP_H = 60;
const COND_Y = 300;
const COND_H = 60;
// Boundary positions per user fix #4: phase-change region dominates (~72%),
// leaving the superheat and subcooling zones as the final quarter of each tube.
const EVAP_BOUNDARY_X = TUBE_START_X + Math.round(TUBE_LEN * 0.72);
const COND_BOUNDARY_X = TUBE_START_X + Math.round(TUBE_LEN * 0.72);

const DOT_COUNT = 10;
const DOT_XS = Array.from(
  { length: DOT_COUNT },
  (_, i) => TUBE_START_X + (TUBE_LEN * (i + 0.5)) / DOT_COUNT,
);
// Reduced-motion end-state: flow arrow parked at midpoint.
const FLOW_ARROW_TRAVEL = TUBE_LEN - 40;
const FLOW_ARROW_MID = Math.round(FLOW_ARROW_TRAVEL / 2);

export function SuperheatSubcoolingConceptDiagram() {
  const titleId = useId();
  const descId = useId();

  return (
    <figure className="my-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <style>{`
          @keyframes shsc-flow {
            0%   { transform: translateX(0); opacity: 0.85; }
            85%  { opacity: 0.85; }
            100% { transform: translateX(${FLOW_ARROW_TRAVEL}px); opacity: 0; }
          }
          @keyframes shsc-zone-pulse {
            0%, 100% { opacity: 0.55; }
            50%      { opacity: 0.85; }
          }
          .shsc-flow-anim {
            animation: shsc-flow ${FLOW_LOOP_S}s linear infinite;
          }
          .shsc-zone-anim {
            animation: shsc-zone-pulse ${PULSE_LOOP_S}s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .shsc-flow-anim {
              animation: none;
              transform: translateX(${FLOW_ARROW_MID}px);
              opacity: 0.85;
            }
            .shsc-zone-anim {
              animation: none;
              opacity: 0.85;
            }
          }
        `}</style>
        <svg
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox="0 0 720 440"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id={titleId}>
            Superheat and subcooling defined by refrigerant phase transitions in the evaporator and
            condenser
          </title>
          <desc id={descId}>{DESC}</desc>

          {/* ==================== EVAPORATOR ==================== */}
          <text
            x={TUBE_START_X}
            y={EVAP_Y - 44}
            className="fill-zinc-700 text-[13px] font-semibold dark:fill-zinc-200"
          >
            Evaporator (low-pressure side)
          </text>
          <text
            x={TUBE_START_X}
            y={EVAP_Y - 28}
            className="fill-zinc-500 text-[10px] dark:fill-zinc-400"
          >
            Saturated mixture in → boiling → superheated vapor out
          </text>

          {/* Superheat zone tint (behind tube) */}
          <rect
            className="shsc-zone-anim"
            x={EVAP_BOUNDARY_X}
            y={EVAP_Y}
            width={TUBE_END_X - EVAP_BOUNDARY_X}
            height={EVAP_H}
            fill="#f59e0b"
          />

          {/* Evap tube outline */}
          <rect
            x={TUBE_START_X}
            y={EVAP_Y}
            width={TUBE_LEN}
            height={EVAP_H}
            rx={EVAP_H / 2}
            className="fill-none stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth={2}
          />

          {/* Evap dots */}
          {DOT_XS.map((x, i) => {
            const isVapor = x > EVAP_BOUNDARY_X;
            return isVapor ? (
              <circle
                key={i}
                cx={x}
                cy={EVAP_Y + EVAP_H / 2}
                r={4}
                className="fill-white stroke-[#a1a1aa] dark:fill-transparent dark:stroke-[#71717a]"
                strokeWidth={1.5}
              />
            ) : (
              <circle
                key={i}
                cx={x}
                cy={EVAP_Y + EVAP_H / 2}
                r={4}
                className="fill-[#3b82f6] dark:fill-[#60a5fa]"
              />
            );
          })}

          {/* Evap flow arrow (animated) */}
          <g className="shsc-flow-anim">
            <path
              d={`M ${TUBE_START_X + 10} ${EVAP_Y + EVAP_H / 2 + 26} l 36 0 M ${TUBE_START_X + 46} ${EVAP_Y + EVAP_H / 2 + 26} l -6 -4 M ${TUBE_START_X + 46} ${EVAP_Y + EVAP_H / 2 + 26} l -6 4`}
              className="fill-none stroke-zinc-500 dark:stroke-zinc-400"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Boundary line + labels */}
          <line
            x1={EVAP_BOUNDARY_X}
            y1={EVAP_Y - 4}
            x2={EVAP_BOUNDARY_X}
            y2={EVAP_Y + EVAP_H + 4}
            className="stroke-zinc-600 dark:stroke-zinc-300"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={EVAP_BOUNDARY_X}
            y={EVAP_Y + EVAP_H + 46}
            textAnchor="middle"
            className="fill-zinc-700 text-[10px] dark:fill-zinc-200"
          >
            Last liquid droplet
          </text>
          <text
            x={EVAP_BOUNDARY_X}
            y={EVAP_Y + EVAP_H + 60}
            textAnchor="middle"
            className="fill-zinc-600 text-[9px] dark:fill-zinc-400"
          >
            refrigerant at saturation temperature
          </text>

          {/* SH zone label */}
          <text
            x={(EVAP_BOUNDARY_X + TUBE_END_X) / 2}
            y={EVAP_Y - 8}
            textAnchor="middle"
            className="fill-[#c2410c] text-[11px] font-semibold dark:fill-[#fbbf24]"
          >
            SUPERHEAT ZONE
          </text>
          <text
            x={(EVAP_BOUNDARY_X + TUBE_END_X) / 2}
            y={EVAP_Y + EVAP_H / 2 + 4}
            textAnchor="middle"
            className="fill-[#7c2d12] font-mono text-[10px] dark:fill-[#fef3c7]"
          >
            SH = T_suction − T_sat
          </text>
          <text
            x={TUBE_END_X + 6}
            y={EVAP_Y + EVAP_H / 2 + 4}
            className="fill-zinc-600 text-[9px] dark:fill-zinc-300"
          >
            suction vapor →
          </text>

          {/* ==================== CONDENSER ==================== */}
          <text
            x={TUBE_START_X}
            y={COND_Y - 44}
            className="fill-zinc-700 text-[13px] font-semibold dark:fill-zinc-200"
          >
            Condenser (high-pressure side)
          </text>
          <text
            x={TUBE_START_X}
            y={COND_Y - 28}
            className="fill-zinc-500 text-[10px] dark:fill-zinc-400"
          >
            Superheated vapor in → condensing → subcooled liquid out
          </text>

          {/* Subcooling zone tint */}
          <rect
            className="shsc-zone-anim"
            x={COND_BOUNDARY_X}
            y={COND_Y}
            width={TUBE_END_X - COND_BOUNDARY_X}
            height={COND_H}
            fill="#14b8a6"
          />

          {/* Cond tube outline */}
          <rect
            x={TUBE_START_X}
            y={COND_Y}
            width={TUBE_LEN}
            height={COND_H}
            rx={COND_H / 2}
            className="fill-none stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth={2}
          />

          {/* Cond dots — vapor before boundary, liquid after */}
          {DOT_XS.map((x, i) => {
            const isLiquid = x > COND_BOUNDARY_X;
            return isLiquid ? (
              <circle
                key={i}
                cx={x}
                cy={COND_Y + COND_H / 2}
                r={4}
                className="fill-[#3b82f6] dark:fill-[#60a5fa]"
              />
            ) : (
              <circle
                key={i}
                cx={x}
                cy={COND_Y + COND_H / 2}
                r={4}
                className="fill-white stroke-[#a1a1aa] dark:fill-transparent dark:stroke-[#71717a]"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Cond flow arrow */}
          <g className="shsc-flow-anim">
            <path
              d={`M ${TUBE_START_X + 10} ${COND_Y + COND_H / 2 + 26} l 36 0 M ${TUBE_START_X + 46} ${COND_Y + COND_H / 2 + 26} l -6 -4 M ${TUBE_START_X + 46} ${COND_Y + COND_H / 2 + 26} l -6 4`}
              className="fill-none stroke-zinc-500 dark:stroke-zinc-400"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Boundary line + labels */}
          <line
            x1={COND_BOUNDARY_X}
            y1={COND_Y - 4}
            x2={COND_BOUNDARY_X}
            y2={COND_Y + COND_H + 4}
            className="stroke-zinc-600 dark:stroke-zinc-300"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={COND_BOUNDARY_X}
            y={COND_Y + COND_H + 46}
            textAnchor="middle"
            className="fill-zinc-700 text-[10px] dark:fill-zinc-200"
          >
            Last vapor bubble
          </text>
          <text
            x={COND_BOUNDARY_X}
            y={COND_Y + COND_H + 60}
            textAnchor="middle"
            className="fill-zinc-600 text-[9px] dark:fill-zinc-400"
          >
            refrigerant at saturation temperature
          </text>

          {/* SC zone label */}
          <text
            x={(COND_BOUNDARY_X + TUBE_END_X) / 2}
            y={COND_Y - 8}
            textAnchor="middle"
            className="fill-[#0f766e] text-[11px] font-semibold dark:fill-[#2dd4bf]"
          >
            SUBCOOLING ZONE
          </text>
          <text
            x={(COND_BOUNDARY_X + TUBE_END_X) / 2}
            y={COND_Y + COND_H / 2 + 4}
            textAnchor="middle"
            className="fill-[#134e4a] font-mono text-[10px] dark:fill-[#ccfbf1]"
          >
            SC = T_sat − T_liquid
          </text>
          <text
            x={TUBE_START_X - 6}
            y={COND_Y + COND_H / 2 + 4}
            textAnchor="end"
            className="fill-zinc-600 text-[9px] dark:fill-zinc-300"
          >
            ← discharge vapor
          </text>
          <text
            x={TUBE_END_X + 6}
            y={COND_Y + COND_H / 2 + 4}
            className="fill-zinc-600 text-[9px] dark:fill-zinc-300"
          >
            liquid →
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {FIGCAPTION}
      </figcaption>
    </figure>
  );
}
