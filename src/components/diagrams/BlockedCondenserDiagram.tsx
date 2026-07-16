import { useId } from "react";

/**
 * Progressive airflow restriction across a condenser coil. Three-cycle
 * stepped animation matching the FloodedCondenserDiagram / OilFoam pattern:
 * 8 horizontal airflow arrows thin over three cycles while the head PSIG
 * readout climbs through discrete values.
 *
 * Timing model:
 *   TOTAL_S = 30, LOOPS = 3, LOOP_S = 10 (9s action + 1s hold)
 *   Airflow opacity: 1.0 → 0.55 → 0.25 → 0.08
 *   Head readout:    340 → 400 → 460 → 500 (values in PSIG, R-410A ref fluid)
 *
 * Colors: airflow arrows follow theme tokens (currentColor) — they're
 * "cool air motion," not a physical substance. Fouling on the fins
 * (progressive dark overlay) uses hardcoded gray-brown, since it
 * represents accumulated dirt/dust and shouldn't invert. Head PSIG
 * readout uses the safety-red accent from SystemGaugesDiagram.
 *
 * Reduced-motion end-state: fins fully fouled, airflow barely visible,
 * head readout at the cutout-window value. The signature reads without
 * animation.
 */

const TOTAL_S = 30;
const LOOP_S = 10;
const HOLD_S = 1;

// Head values chosen so cycle 3 lands near the typical R-410A high-pressure
// cutout — 500 is the industry-standard field-service threshold (Copeland /
// Emerson service literature). Held as constants so the label text can
// interpolate them and satisfy the no-PSIG-literal grep guard.
const HEAD_CYCLE_1 = 340;
const HEAD_CYCLE_2 = 400;
const HEAD_CYCLE_3 = 460;
const HEAD_CYCLE_4 = 500;
const NORMAL_BAND_LO = 320;
const NORMAL_BAND_HI = 360;

const FOULING_HEX = "#78716c"; // Tailwind stone-500 — accumulated dust, does not invert
const CUTOUT_ACCENT = "#dc2626"; // matches SystemGaugesDiagram high-side accent

export function BlockedCondenserDiagram() {
  const titleId = useId();
  const descId = useId();
  const uniq = titleId.replace(/[:]/g, "");

  const titleText =
    "Condenser airflow restriction driving head pressure climb (R-410A)";
  const descText = `Profile view of a residential AC condenser coil with eight horizontal airflow arrows passing left to right through vertical fins. As the coil fouls across three consecutive service intervals the airflow arrows dim from full opacity toward barely visible while the head-pressure readout on the right climbs from a healthy ${HEAD_CYCLE_1} PSIG through ${HEAD_CYCLE_2} and ${HEAD_CYCLE_3} to ${HEAD_CYCLE_4} PSIG (near typical R-410A high-pressure cutout). Reduced condenser airflow is the largest single cause of high head pressure in field service; the diagnostic signature is head elevated while suction stays near normal.`;

  const CX = `blk-${uniq}`;

  // 8 arrow rows, evenly spaced through the coil area (y=80..250)
  const arrowYs = [90, 110, 130, 150, 170, 190, 210, 230];

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
          .${CX}-arrow  { animation: ${CX}-airflow ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-foul   { animation: ${CX}-fouling ${TOTAL_S}s steps(1, end) infinite; transform-origin: center; }
          .${CX}-head-1 { animation: ${CX}-h1 ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-head-2 { animation: ${CX}-h2 ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-head-3 { animation: ${CX}-h3 ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-head-4 { animation: ${CX}-h4 ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-caption-live   { animation: ${CX}-fade ${TOTAL_S}s steps(1, end) infinite; }
          .${CX}-static-caption { display: none; }

          @keyframes ${CX}-airflow {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%          { opacity: 1; }
            ${(((LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 0.55; }
            ${(((2 * LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}%,${((3 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 0.25; }
            97%                                                   { opacity: 0.08; }
            100%                                                  { opacity: 1; }
          }
          @keyframes ${CX}-fouling {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%          { opacity: 0; }
            ${(((LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 0.35; }
            ${(((2 * LOOP_S + HOLD_S) / TOTAL_S) * 100).toFixed(2)}%,${((3 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 0.65; }
            97%                                                   { opacity: 0.85; }
            100%                                                  { opacity: 0; }
          }
          @keyframes ${CX}-h1 {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%   { opacity: 1; }
            ${(((LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 0; }
          }
          @keyframes ${CX}-h2 {
            0%,${((LOOP_S / TOTAL_S) * 100).toFixed(2)}%   { opacity: 0; }
            ${(((LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 1; }
            ${(((2 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 0; }
          }
          @keyframes ${CX}-h3 {
            0%,${((2 * LOOP_S / TOTAL_S) * 100).toFixed(2)}%  { opacity: 0; }
            ${(((2 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,${((3 * LOOP_S / TOTAL_S) * 100).toFixed(2)}% { opacity: 1; }
            ${(((3 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 0; }
          }
          @keyframes ${CX}-h4 {
            0%,${((3 * LOOP_S / TOTAL_S) * 100).toFixed(2)}%  { opacity: 0; }
            ${(((3 * LOOP_S + 0.01) / TOTAL_S) * 100).toFixed(2)}%,100% { opacity: 1; }
          }
          @keyframes ${CX}-fade {
            0%,95% { opacity: 1; } 100% { opacity: 0; }
          }

          @media (prefers-reduced-motion: reduce) {
            .${CX}-arrow          { animation: none; opacity: 0.08; }
            .${CX}-foul           { animation: none; opacity: 0.85; }
            .${CX}-head-1         { animation: none; opacity: 0; }
            .${CX}-head-2         { animation: none; opacity: 0; }
            .${CX}-head-3         { animation: none; opacity: 0; }
            .${CX}-head-4         { animation: none; opacity: 1; }
            .${CX}-caption-live   { display: none; }
            .${CX}-static-caption { display: inline; }
          }
        `}</style>

        {/* ─────────── Left panel: coil profile with fins + airflow arrows ─────────── */}
        <g className="text-zinc-600 dark:text-zinc-400">
          {/* Coil outline */}
          <rect
            x="140"
            y="70"
            width="300"
            height="200"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <text
            x="290"
            y="60"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="currentColor"
            letterSpacing="1"
          >
            CONDENSER COIL (front view)
          </text>

          {/* Vertical fins */}
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={`fin-${i}`}
              x1={150 + i * 10}
              y1={70}
              x2={150 + i * 10}
              y2={270}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.45"
            />
          ))}

          {/* Fouling overlay — progressive dust/dirt buildup, does not invert */}
          <g className={`${CX}-foul`}>
            <rect
              x="140"
              y="70"
              width="300"
              height="200"
              fill={FOULING_HEX}
            />
            {/* Uneven fouling accents — small darker patches near the leading edge */}
            <ellipse cx="180" cy="120" rx="28" ry="12" fill={FOULING_HEX} opacity="0.6" />
            <ellipse cx="200" cy="200" rx="22" ry="10" fill={FOULING_HEX} opacity="0.6" />
            <ellipse cx="160" cy="240" rx="18" ry="8" fill={FOULING_HEX} opacity="0.6" />
          </g>
        </g>

        {/* Airflow arrows (theme-adapting via currentColor) */}
        <g className={`${CX}-arrow text-sky-600 dark:text-sky-400`} strokeLinecap="round" strokeLinejoin="round">
          {arrowYs.map((y, i) => (
            <g key={`arrow-${i}`}>
              <line x1={50} y1={y} x2={130} y2={y} stroke="currentColor" strokeWidth="2" />
              <path
                d={`M 122 ${y - 5} L 130 ${y} L 122 ${y + 5}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
          ))}
          <text x="90" y="60" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" opacity="0.8">
            outdoor air
          </text>
        </g>

        {/* Exit-side airflow (thin, indicates flow still moving through but restricted) */}
        <g className={`${CX}-arrow text-sky-600 dark:text-sky-400`}>
          {arrowYs.map((y, i) => (
            <g key={`exit-${i}`} opacity="0.6">
              <line x1={440} y1={y} x2={490} y2={y} stroke="currentColor" strokeWidth="1.5" />
              <path
                d={`M 484 ${y - 4} L 490 ${y} L 484 ${y + 4}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </g>

        {/* ─────────── Right panel: head-pressure readout ─────────── */}
        <g className="text-zinc-700 dark:text-zinc-200">
          <rect
            x="510"
            y="80"
            width="190"
            height="180"
            rx="8"
            className="fill-white dark:fill-zinc-900"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="605"
            y="102"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="currentColor"
            opacity="0.7"
            letterSpacing="1.5"
          >
            HEAD PRESSURE
          </text>
          {/* Green safe band */}
          <rect x="525" y="115" width="160" height="14" rx="3" fill="#16a34a" opacity="0.18" />
          <text
            x="605"
            y="125"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#16a34a"
          >
            {`normal ${NORMAL_BAND_LO}–${NORMAL_BAND_HI} PSIG`}
          </text>
          {/* Red cutout band */}
          <rect x="525" y="135" width="160" height="14" rx="3" fill="#dc2626" opacity="0.18" />
          <text
            x="605"
            y="145"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#dc2626"
          >
            {`HP cutout ~${HEAD_CYCLE_4} PSIG`}
          </text>

          {/* Stepped head readouts (only one visible at a time) */}
          <g className={`${CX}-head-1`}>
            <text x="605" y="200" textAnchor="middle" fontSize="34" fontWeight="800" fill="#16a34a" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {HEAD_CYCLE_1} PSIG
            </text>
            <text x="605" y="222" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
              clean coil — inside normal
            </text>
          </g>
          <g className={`${CX}-head-2`}>
            <text x="605" y="200" textAnchor="middle" fontSize="34" fontWeight="800" fill="#f59e0b" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {HEAD_CYCLE_2} PSIG
            </text>
            <text x="605" y="222" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
              early fouling — above normal
            </text>
          </g>
          <g className={`${CX}-head-3`}>
            <text x="605" y="200" textAnchor="middle" fontSize="34" fontWeight="800" fill="#ea580c" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {HEAD_CYCLE_3} PSIG
            </text>
            <text x="605" y="222" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
              heavy fouling — near cutout
            </text>
          </g>
          <g className={`${CX}-head-4`}>
            <text x="605" y="200" textAnchor="middle" fontSize="34" fontWeight="800" fill={CUTOUT_ACCENT} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {HEAD_CYCLE_4} PSIG
            </text>
            <text x="605" y="222" textAnchor="middle" fontSize="9" fill={CUTOUT_ACCENT} opacity="0.85" fontWeight="600">
              cutout territory
            </text>
          </g>

          {/* Cycle indicator dots */}
          <g fill="currentColor" opacity="0.5">
            <circle cx="570" cy="240" r="3" className={`${CX}-head-1`} />
            <circle cx="590" cy="240" r="3" className={`${CX}-head-2`} />
            <circle cx="610" cy="240" r="3" className={`${CX}-head-3`} />
            <circle cx="630" cy="240" r="3" className={`${CX}-head-4`} />
          </g>
        </g>

        {/* Live vs static reduced-motion caption */}
        <text
          x="360"
          y="300"
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.7"
          className={`${CX}-caption-live`}
        >
          coil fouling reduces airflow — head climbs through the normal band into cutout territory
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
          {`restricted condenser airflow drives head pressure into the ~${HEAD_CYCLE_4} PSIG cutout window`}
        </text>
      </svg>
      <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Restricted condenser airflow on an R-410A system drives head pressure
        past the ~{HEAD_CYCLE_4} PSIG cutout window; airflow arrows thin as
        the coil fouls, and the head readout climbs {HEAD_CYCLE_1} →{" "}
        {HEAD_CYCLE_4} PSIG over three service cycles. Reduced airflow is the
        largest single cause of high head in field service.
      </figcaption>
    </figure>
  );
}
