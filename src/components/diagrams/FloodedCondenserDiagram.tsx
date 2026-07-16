import { useId } from "react";

/**
 * Condenser cutaway showing progressive liquid flooding from sustained
 * overcharge. Three-loop stepped animation — same TOTAL_S / N × loop
 * structure as OilFoamMechanismDiagram — with a subcooling readout that
 * steps through discrete values (12 → 16 → 20°F) so the climb reads
 * against a printed target band.
 *
 * Timing model (single source of truth):
 *   TOTAL_S = 30, LOOPS = 3, LOOP_S = 10 (9s action + 1s hold)
 *   Liquid fill:    25% → 45% → 70% → 90% of coil, then reset
 *   SC readout:     12°F → 16°F → 20°F, stepped, target band "8–12°F" printed static
 *
 * Colors: refrigerant liquid is BLUE (hardcoded, does not invert per the
 * physical-color rule). Amber is reserved for oil (see B4 OilFoamMechanism).
 * Structural rule pattern-wide.
 *
 * Reduced-motion end-state: liquid at 90%, SC readout at 20°F, target band
 * visible. Full signature legible without motion.
 */

const TOTAL_S = 30;
const LOOP_S = 10;
const HOLD_S = 1;
const ACTION_S = LOOP_S - HOLD_S; // 9

const LIQUID_LIGHT_HEX = "#3b82f6"; // Tailwind blue-500 — refrigerant liquid
const LIQUID_DARK_HEX = "#60a5fa"; // Tailwind blue-400 — dark-mode variant
const REFRIGERANT_BLUE_ACCENT = "#1d4ed8"; // blue-700 for text/rail accents

export function FloodedCondenserDiagram() {
  const titleId = useId();
  const descId = useId();
  const uniq = titleId.replace(/[:]/g, "");

  const titleText =
    "Condenser flooding from sustained R-410A overcharge";
  const descText =
    "Cutaway of a horizontal condenser tube bank showing the fill level of liquid refrigerant rising over three consecutive overcharge cycles from about a quarter of coil capacity to nearly full. Subcooling readout on the right side steps 12°F, 16°F, 20°F against a printed TXV target of 8 to 12°F. As liquid backs up in the condenser, active heat-rejection surface shrinks and head pressure climbs; the diagnostic signature is elevated subcooling paired with high head.";

  const CX = `flood-${uniq}`;

  return (
    <figure className="my-6 mx-auto max-w-3xl">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full text-zinc-700 dark:text-zinc-300"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>{titleText}</title>
        <desc id={descId}>{descText}</desc>
        <style>{`
          .${CX}-liquid   { animation: ${CX}-fill  ${TOTAL_S}s steps(1, end) infinite; transform-origin: center bottom; }
          .${CX}-sc-1     { animation: ${CX}-sc1   ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-sc-2     { animation: ${CX}-sc2   ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-sc-3     { animation: ${CX}-sc3   ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-caption-live { animation: ${CX}-fade ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-static-caption { display: none; }
          .${CX}-liquid-fill-dark { display: none; }

          @keyframes ${CX}-fill {
            0%                                  { transform: scaleY(0.25); }
            ${((HOLD_S / TOTAL_S) * 100).toFixed(2)}%   { transform: scaleY(0.25); }
            ${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%  { transform: scaleY(0.45); }
            ${(((LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}% { transform: scaleY(0.45); }
            ${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { transform: scaleY(0.70); }
            ${(((2 * LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}% { transform: scaleY(0.70); }
            ${((3 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { transform: scaleY(0.90); }
            97%                                 { transform: scaleY(0.90); }
            100%                                { transform: scaleY(0.25); }
          }
          @keyframes ${CX}-sc1 {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%    { opacity: 1; }
            ${(((LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 0; }
          }
          @keyframes ${CX}-sc2 {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%    { opacity: 0; }
            ${(((LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 1; }
            ${(((2 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 0; }
          }
          @keyframes ${CX}-sc3 {
            0%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}%   { opacity: 0; }
            ${(((2 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 1; }
          }
          @keyframes ${CX}-fade {
            0%,95% { opacity: 1; } 100% { opacity: 0; }
          }

          @media (prefers-color-scheme: dark) {
            .${CX}-liquid-fill-light { display: none; }
            .${CX}-liquid-fill-dark  { display: inline; }
          }
          @media (prefers-reduced-motion: reduce) {
            .${CX}-liquid   { animation: none; transform: scaleY(0.90); }
            .${CX}-sc-1     { animation: none; opacity: 0; }
            .${CX}-sc-2     { animation: none; opacity: 0; }
            .${CX}-sc-3     { animation: none; opacity: 1; }
            .${CX}-caption-live   { display: none; }
            .${CX}-static-caption { display: inline; }
          }
        `}</style>

        {/* ─────────── Left panel: condenser cutaway ─────────── */}
        <g className="text-zinc-600 dark:text-zinc-400">
          {/* Outer coil casing */}
          <rect
            x="40"
            y="60"
            width="420"
            height="200"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <text
            x="250"
            y="52"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="1"
          >
            CONDENSER CUTAWAY (side view)
          </text>

          {/* Vertical fins */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
            <line
              key={`fin-${i}`}
              x1={60 + i * 27}
              y1={60}
              x2={60 + i * 27}
              y2={260}
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.35"
            />
          ))}

          {/* Horizontal tube rails (5 passes) */}
          {[85, 125, 165, 205, 245].map((y, i) => (
            <line
              key={`tube-${i}`}
              x1={40}
              y1={y}
              x2={460}
              y2={y}
              stroke="currentColor"
              strokeWidth="1.25"
              opacity="0.55"
            />
          ))}

          {/* Vapor-in port (top) */}
          <line x1="30" y1="80" x2="40" y2="80" stroke="currentColor" strokeWidth="1.5" />
          <text x="26" y="76" textAnchor="end" fontSize="9" fill="currentColor" opacity="0.75">vapor in</text>
          <text x="26" y="87" textAnchor="end" fontSize="8" fill={REFRIGERANT_BLUE_ACCENT} opacity="0.75">(from comp)</text>

          {/* Liquid-out port (bottom) */}
          <line x1="460" y1="240" x2="470" y2="240" stroke="currentColor" strokeWidth="1.5" />
          <text x="474" y="238" fontSize="9" fill="currentColor" opacity="0.75">liquid out</text>
          <text x="474" y="249" fontSize="8" fill={REFRIGERANT_BLUE_ACCENT} opacity="0.75">(to metering)</text>
        </g>

        {/* ─────────── Refrigerant liquid pool — hardcoded blue (light + dark variants) ─────────── */}
        <clipPath id={`${CX}-clip`}>
          <rect x="42" y="62" width="416" height="196" rx="4" />
        </clipPath>
        <g clipPath={`url(#${CX}-clip)`}>
          <g className={`${CX}-liquid`}>
            <rect
              className={`${CX}-liquid-fill-light`}
              x="42"
              y="62"
              width="416"
              height="196"
              fill={LIQUID_LIGHT_HEX}
              opacity="0.65"
            />
            <rect
              className={`${CX}-liquid-fill-dark`}
              x="42"
              y="62"
              width="416"
              height="196"
              fill={LIQUID_DARK_HEX}
              opacity="0.55"
            />
          </g>
        </g>

        {/* Liquid-level label ("liquid refrigerant") */}
        <text
          x="60"
          y="255"
          fontSize="9"
          fontWeight="600"
          fill="#ffffff"
          opacity="0.9"
          style={{ mixBlendMode: "difference" as const }}
        >
          liquid refrigerant
        </text>

        {/* ─────────── Right panel: subcooling readout + target band ─────────── */}
        <g className="text-zinc-700 dark:text-zinc-200">
          <rect
            x="500"
            y="80"
            width="200"
            height="180"
            rx="8"
            className="fill-white dark:fill-zinc-900"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="600"
            y="102"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="currentColor"
            opacity="0.7"
            letterSpacing="1.5"
          >
            SUBCOOLING
          </text>

          {/* Static "TXV target 8–12°F" band */}
          <rect x="520" y="115" width="160" height="18" rx="3" fill="#16a34a" opacity="0.18" />
          <text
            x="600"
            y="128"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="#16a34a"
          >
            TXV target 8–12°F
          </text>

          {/* Stepped SC readouts — only one is visible at a time */}
          <g className={`${CX}-sc-1`}>
            <text
              x="600"
              y="185"
              textAnchor="middle"
              fontSize="42"
              fontWeight="800"
              fill="#f59e0b"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              12°F
            </text>
            <text
              x="600"
              y="212"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.7"
            >
              cycle 1 — edge of target
            </text>
          </g>
          <g className={`${CX}-sc-2`}>
            <text
              x="600"
              y="185"
              textAnchor="middle"
              fontSize="42"
              fontWeight="800"
              fill="#ea580c"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              16°F
            </text>
            <text
              x="600"
              y="212"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.7"
            >
              cycle 2 — above target
            </text>
          </g>
          <g className={`${CX}-sc-3`}>
            <text
              x="600"
              y="185"
              textAnchor="middle"
              fontSize="42"
              fontWeight="800"
              fill="#dc2626"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              20°F
            </text>
            <text
              x="600"
              y="212"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.7"
            >
              cycle 3 — overcharge zone
            </text>
          </g>

          {/* Loop indicator dots */}
          <g fill="currentColor" opacity="0.5">
            <circle cx="574" cy="240" r="3" className={`${CX}-sc-1`} />
            <circle cx="600" cy="240" r="3" className={`${CX}-sc-2`} />
            <circle cx="626" cy="240" r="3" className={`${CX}-sc-3`} />
          </g>
        </g>

        {/* Live caption ("watching …") and static reduced-motion caption */}
        <text
          x="360"
          y="300"
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.7"
          className={`${CX}-caption-live`}
        >
          three cycles of sustained overcharge — liquid backs up, subcooling climbs into fault territory
        </text>
        <text
          x="360"
          y="300"
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.75"
          className={`${CX}-static-caption`}
        >
          sustained overcharge floods the condenser — subcooling settles at 20°F, well above the TXV target
        </text>
      </svg>
      <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Repeated overcharge floods the R-410A condenser — subcooling climbs
        from a healthy 12°F past 16°F to 20°F over three cycles, with liquid
        backed up in the last third of the coil. Elevated subcooling paired
        with elevated head is the diagnostic overcharge signature.
      </figcaption>
    </figure>
  );
}
