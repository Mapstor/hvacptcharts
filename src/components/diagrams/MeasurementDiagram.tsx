import { useId } from "react";

interface Props {
  variant: "superheat" | "subcooling" | "both";
}

const FIGCAPTIONS: Record<Props["variant"], string> = {
  superheat:
    "Wet-wick psychrometer at the return grille; pipe-clamp thermometer on the suction line near the outdoor service valve; manifold gauge on the suction port. Superheat = suction-line temperature minus saturation temperature at the measured suction pressure.",
  subcooling:
    "Pipe-clamp thermometer on the liquid line at the outdoor service valve; manifold gauge on the liquid port. Subcooling = saturation temperature at the measured liquid pressure minus liquid-line temperature.",
  both:
    "Suction-side: wet-wick psychrometer at the return grille, pipe-clamp thermometer near the outdoor service valve, manifold gauge on the suction port. Liquid-side: pipe-clamp thermometer on the liquid line and manifold gauge on the liquid port at the outdoor unit. Superheat is measured on the suction side; subcooling on the liquid side.",
};

const DESC =
  "Simplified split-system HVAC layout showing an outdoor condensing unit on the left connected by a two-pipe line set (upper suction line, lower liquid line) to an indoor A-coil and return-air grille on the right. Probe callouts indicate where the technician places the pipe-clamp thermometer, manifold gauge, and (for superheat) wet-wick psychrometer to measure the values needed for a target-superheat or target-subcooling charge check.";

const TITLE_MAP: Record<Props["variant"], string> = {
  superheat: "Measurement locations for superheat on a split-system HVAC",
  subcooling: "Measurement locations for subcooling on a split-system HVAC",
  both: "Measurement locations for superheat and subcooling on a split-system HVAC",
};

const OUTDOOR_X = 40;
const OUTDOOR_Y = 90;
const OUTDOOR_W = 130;
const OUTDOOR_H = 200;
const INDOOR_COIL_X = 470;
const INDOOR_COIL_Y = 120;
const INDOOR_COIL_W = 110;
const INDOOR_COIL_H = 140;
const RETURN_GRILLE_X = 470;
const RETURN_GRILLE_Y = 265;
const RETURN_GRILLE_W = 110;
const RETURN_GRILLE_H = 24;
const SUCTION_Y = 160;
const LIQUID_Y = 220;
const LINE_START_X = OUTDOOR_X + OUTDOOR_W;
const LINE_END_X = INDOOR_COIL_X;

export function MeasurementDiagram({ variant }: Props) {
  const titleId = useId();
  const descId = useId();
  const showSuction = variant === "superheat" || variant === "both";
  const showLiquid = variant === "subcooling" || variant === "both";
  const showPsychro = variant === "superheat" || variant === "both";
  const computeBoxH = variant === "both" ? 46 : 30;
  const computeBoxW = variant === "both" ? 360 : 300;

  return (
    <figure className="my-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <svg
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox="0 0 640 360"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id={titleId}>{TITLE_MAP[variant]}</title>
          <desc id={descId}>{DESC}</desc>

          {/* Compute box (top) */}
          <rect
            x={30}
            y={20}
            width={computeBoxW}
            height={computeBoxH}
            rx={4}
            className="fill-zinc-50 stroke-zinc-400 dark:fill-zinc-900 dark:stroke-zinc-500"
            strokeWidth={1}
          />
          {variant === "superheat" && (
            <text x={40} y={40} className="fill-zinc-700 font-mono text-[11px] dark:fill-zinc-200">
              SH = T_suction − T_sat(P_suction)
            </text>
          )}
          {variant === "subcooling" && (
            <text x={40} y={40} className="fill-zinc-700 font-mono text-[11px] dark:fill-zinc-200">
              SC = T_sat(P_liquid) − T_liquid
            </text>
          )}
          {variant === "both" && (
            <>
              <text x={40} y={36} className="fill-zinc-700 font-mono text-[11px] dark:fill-zinc-200">
                SH = T_suction − T_sat(P_suction)
              </text>
              <text x={40} y={54} className="fill-zinc-700 font-mono text-[11px] dark:fill-zinc-200">
                SC = T_sat(P_liquid) − T_liquid
              </text>
            </>
          )}

          {/* Outdoor condensing unit */}
          <rect
            x={OUTDOOR_X}
            y={OUTDOOR_Y}
            width={OUTDOOR_W}
            height={OUTDOOR_H}
            rx={6}
            className="fill-zinc-100 stroke-zinc-500 dark:fill-zinc-800 dark:stroke-zinc-400"
            strokeWidth={2}
          />
          {/* Fan grille */}
          <circle
            cx={OUTDOOR_X + OUTDOOR_W / 2}
            cy={OUTDOOR_Y + 65}
            r={40}
            className="fill-none stroke-zinc-400 dark:stroke-zinc-500"
            strokeWidth={1.5}
          />
          <line
            x1={OUTDOOR_X + OUTDOOR_W / 2 - 40}
            y1={OUTDOOR_Y + 65}
            x2={OUTDOOR_X + OUTDOOR_W / 2 + 40}
            y2={OUTDOOR_Y + 65}
            className="stroke-zinc-400 dark:stroke-zinc-500"
            strokeWidth={1.5}
          />
          <line
            x1={OUTDOOR_X + OUTDOOR_W / 2}
            y1={OUTDOOR_Y + 25}
            x2={OUTDOOR_X + OUTDOOR_W / 2}
            y2={OUTDOOR_Y + 105}
            className="stroke-zinc-400 dark:stroke-zinc-500"
            strokeWidth={1.5}
          />
          <text
            x={OUTDOOR_X + OUTDOOR_W / 2}
            y={OUTDOOR_Y + OUTDOOR_H + 16}
            textAnchor="middle"
            className="fill-zinc-600 text-[11px] dark:fill-zinc-300"
          >
            Outdoor condensing unit
          </text>

          {/* Service valve stubs */}
          <rect
            x={LINE_START_X - 6}
            y={SUCTION_Y - 8}
            width={10}
            height={16}
            className="fill-zinc-500 dark:fill-zinc-400"
          />
          <rect
            x={LINE_START_X - 6}
            y={LIQUID_Y - 8}
            width={10}
            height={16}
            className="fill-zinc-500 dark:fill-zinc-400"
          />

          {/* Suction line (top rail) — cool blue */}
          <line
            x1={LINE_START_X}
            y1={SUCTION_Y}
            x2={LINE_END_X}
            y2={SUCTION_Y}
            className="stroke-[#3b82f6] dark:stroke-[#60a5fa]"
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* Liquid line (bottom rail) — warm orange */}
          <line
            x1={LINE_START_X}
            y1={LIQUID_Y}
            x2={LINE_END_X}
            y2={LIQUID_Y}
            className="stroke-[#f97316] dark:stroke-[#fb923c]"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <text
            x={(LINE_START_X + LINE_END_X) / 2}
            y={SUCTION_Y - 10}
            textAnchor="middle"
            className="fill-[#3b82f6] font-mono text-[10px] dark:fill-[#60a5fa]"
          >
            suction (vapor)
          </text>
          <text
            x={(LINE_START_X + LINE_END_X) / 2}
            y={LIQUID_Y + 20}
            textAnchor="middle"
            className="fill-[#f97316] font-mono text-[10px] dark:fill-[#fb923c]"
          >
            liquid
          </text>

          {/* Indoor A-coil */}
          <polygon
            points={`${INDOOR_COIL_X},${INDOOR_COIL_Y + INDOOR_COIL_H} ${INDOOR_COIL_X + INDOOR_COIL_W / 2},${INDOOR_COIL_Y} ${INDOOR_COIL_X + INDOOR_COIL_W},${INDOOR_COIL_Y + INDOOR_COIL_H}`}
            className="fill-zinc-100 stroke-zinc-500 dark:fill-zinc-800 dark:stroke-zinc-400"
            strokeWidth={2}
          />
          <text
            x={INDOOR_COIL_X + INDOOR_COIL_W / 2}
            y={INDOOR_COIL_Y - 8}
            textAnchor="middle"
            className="fill-zinc-600 text-[11px] dark:fill-zinc-300"
          >
            Indoor coil
          </text>

          {/* Return grille */}
          <rect
            x={RETURN_GRILLE_X}
            y={RETURN_GRILLE_Y}
            width={RETURN_GRILLE_W}
            height={RETURN_GRILLE_H}
            className="fill-zinc-50 stroke-zinc-500 dark:fill-zinc-900 dark:stroke-zinc-400"
            strokeWidth={1.5}
          />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={RETURN_GRILLE_X + 5}
              y1={RETURN_GRILLE_Y + 5 + i * 5}
              x2={RETURN_GRILLE_X + RETURN_GRILLE_W - 5}
              y2={RETURN_GRILLE_Y + 5 + i * 5}
              className="stroke-zinc-400 dark:stroke-zinc-500"
              strokeWidth={1}
            />
          ))}
          <text
            x={RETURN_GRILLE_X + RETURN_GRILLE_W / 2}
            y={RETURN_GRILLE_Y + RETURN_GRILLE_H + 14}
            textAnchor="middle"
            className="fill-zinc-600 text-[10px] dark:fill-zinc-300"
          >
            Return grille
          </text>

          {/* Suction probes (T + P) */}
          {showSuction && (
            <g>
              {/* T-clamp on suction line */}
              <rect
                x={LINE_START_X + 30}
                y={SUCTION_Y - 15}
                width={22}
                height={10}
                rx={2}
                className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
                strokeWidth={1.5}
              />
              <text
                x={LINE_START_X + 41}
                y={SUCTION_Y - 20}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[9px] dark:fill-zinc-300"
              >
                T
              </text>
              {/* P-gauge on suction port */}
              <circle
                cx={LINE_START_X - 6}
                cy={SUCTION_Y - 22}
                r={10}
                className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
                strokeWidth={1.5}
              />
              <text
                x={LINE_START_X - 6}
                y={SUCTION_Y - 19}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[8px] dark:fill-zinc-300"
              >
                P
              </text>
              <line
                x1={LINE_START_X - 6}
                y1={SUCTION_Y - 12}
                x2={LINE_START_X - 2}
                y2={SUCTION_Y - 4}
                className="stroke-zinc-500 dark:stroke-zinc-400"
                strokeWidth={1}
              />
            </g>
          )}

          {/* Liquid probes (T + P) */}
          {showLiquid && (
            <g>
              <rect
                x={LINE_START_X + 30}
                y={LIQUID_Y + 5}
                width={22}
                height={10}
                rx={2}
                className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
                strokeWidth={1.5}
              />
              <text
                x={LINE_START_X + 41}
                y={LIQUID_Y + 26}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[9px] dark:fill-zinc-300"
              >
                T
              </text>
              <circle
                cx={LINE_START_X - 6}
                cy={LIQUID_Y + 22}
                r={10}
                className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
                strokeWidth={1.5}
              />
              <text
                x={LINE_START_X - 6}
                y={LIQUID_Y + 26}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[8px] dark:fill-zinc-300"
              >
                P
              </text>
              <line
                x1={LINE_START_X - 6}
                y1={LIQUID_Y + 12}
                x2={LINE_START_X - 2}
                y2={LIQUID_Y + 4}
                className="stroke-zinc-500 dark:stroke-zinc-400"
                strokeWidth={1}
              />
            </g>
          )}

          {/* Wet-bulb psychrometer at return grille */}
          {showPsychro && (
            <g>
              <rect
                x={RETURN_GRILLE_X - 32}
                y={RETURN_GRILLE_Y + 2}
                width={22}
                height={20}
                rx={3}
                className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
                strokeWidth={1.5}
              />
              <line
                x1={RETURN_GRILLE_X - 26}
                y1={RETURN_GRILLE_Y + 5}
                x2={RETURN_GRILLE_X - 26}
                y2={RETURN_GRILLE_Y + 19}
                className="stroke-[#3b82f6] dark:stroke-[#60a5fa]"
                strokeWidth={1.5}
              />
              <line
                x1={RETURN_GRILLE_X - 16}
                y1={RETURN_GRILLE_Y + 5}
                x2={RETURN_GRILLE_X - 16}
                y2={RETURN_GRILLE_Y + 19}
                className="stroke-zinc-500 dark:stroke-zinc-400"
                strokeWidth={1.5}
              />
              <text
                x={RETURN_GRILLE_X - 21}
                y={RETURN_GRILLE_Y - 2}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[8px] dark:fill-zinc-300"
              >
                WB
              </text>
            </g>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {FIGCAPTIONS[variant]}
      </figcaption>
    </figure>
  );
}
