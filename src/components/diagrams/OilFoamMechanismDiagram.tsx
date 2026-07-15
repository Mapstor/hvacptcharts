import { useId } from "react";

/**
 * Compressor crankcase cutaway animating the short-cycling oil-loss
 * mechanism per Copeland Application Engineering Bulletin AE17-1262 R2.
 * Left half: simplified hermetic compressor with sump oil pool visible.
 * Right half: three beat labels naming the beats of a single cycle.
 *
 * Timing model — single source of truth, all keyframes derive from it:
 *   TOTAL_S = 40  (animation-duration)
 *   LOOPS   = 4   (short-cycle iterations per full animation)
 *   LOOP_S  = 10  (per-loop duration: 9s action + 1s hold)
 *   BEAT_S  = 3   (beat duration inside the 9s action window)
 *
 * Percentages of the 40s cycle:
 *   Loop N (0-indexed) start:      N * 25%
 *   Loop N beat 1 (pressure drop): N * 25% + [0%, 7.5%]     → 0-3s
 *   Loop N beat 2 (foam + escape): N * 25% + [7.5%, 15%]    → 3-6s
 *   Loop N beat 3 (sump drop):     N * 25% + [15%, 22.5%]   → 6-9s
 *   Loop N hold (step visible):    N * 25% + [22.5%, 25%]   → 9-10s
 *   Refill fade (last iteration):  97.5% → 100%             → 39-40s
 *
 * Each of the four beat-3 windows steps the sump down by ~15% of its
 * original height (100% → 85% → 70% → 55% → 40%). At 97.5-100% the
 * sump ramps back to 100% before the animation loops.
 *
 * `prefers-reduced-motion: reduce` freezes every animation and renders
 * the meaningful end-state: sump at ~40% of original, foam bubbles
 * stationary along the discharge path, all three beat labels visible,
 * plus a bold static caption naming the mechanism.
 *
 * Palette: currentColor (inherits the parent zinc-* text color) for the
 * compressor shell + labels; text-amber-600 (light) / text-amber-400
 * (dark) via a wrapping <g> for the oil pool and foam bubbles. Amber
 * against zinc backgrounds reads ~5:1 on light and ~12:1 on dark.
 */
export function OilFoamMechanismDiagram() {
  const titleId = useId();
  const descId = useId();

  // Geometry: compressor cutaway occupies the left ~430 px of a 720 viewBox
  // (leaves 280 px for beat labels + attribution on the right).
  const COMPRESSOR_X = 60;
  const COMPRESSOR_W = 360;
  const COMPRESSOR_Y = 40;
  const COMPRESSOR_H = 240; // 40-280 vertically
  const SUMP_TOP = 200;
  const SUMP_BOTTOM = 260;
  const SUMP_H = SUMP_BOTTOM - SUMP_TOP; // 60

  // Right-side beat labels stack
  const LABEL_X = 470;
  const BEAT_LABELS = [
    { key: "beat1", title: "Start → pressure drops", body: "Suction pressure crashes on start." },
    { key: "beat2", title: "Oil foams & escapes", body: "Refrigerant flashes out of the oil, carrying oil into discharge." },
    { key: "beat3", title: "Sump level falls", body: "A share of the crankcase oil is now downstream in the evaporator or lines." },
  ];

  return (
    <figure className="my-6 mx-auto max-w-3xl">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="w-full h-auto text-zinc-700 dark:text-zinc-300"
      >
        <title id={titleId}>
          Compressor crankcase oil-loss mechanism from short cycling
        </title>
        <desc id={descId}>
          Compressor crankcase cutaway from Copeland AE17-1262 R2: each rapid start drops crankcase pressure, the oil-refrigerant mixture flashes into foam and exits with discharge gas, and the sump oil level steps down one notch per cycle. The animation shows four consecutive short-cycle starts progressively draining the sump from full to about forty percent of its original level.
        </desc>
        <style>{`
          /* Timing derives from a single 40s animation-duration —
             all keyframe percentages are pre-computed from it above. */

          /* Sump oil level: shrinks from scaleY(1) → 0.40 over four
             loops via transform-origin at the sump BOTTOM. */
          .ofm-sump {
            transform-origin: 0 ${SUMP_BOTTOM}px;
            animation: ofm-sump 40s steps(1, end) infinite;
          }
          @keyframes ofm-sump {
            0%, 15%          { transform: scaleY(1); }
            22.5%, 40%       { transform: scaleY(0.85); }
            47.5%, 65%       { transform: scaleY(0.70); }
            72.5%, 90%       { transform: scaleY(0.55); }
            97.5%            { transform: scaleY(0.40); }
            100%             { transform: scaleY(1); }
          }

          /* Pressure-drop arrow: brief flash at each beat-1 window.
             Beat 1 windows: 0-3s, 10-13s, 20-23s, 30-33s
             = 0-7.5%, 25-32.5%, 50-57.5%, 75-82.5% of 40s cycle. */
          .ofm-pressure {
            opacity: 0;
            animation: ofm-pressure 40s linear infinite;
          }
          @keyframes ofm-pressure {
            0%, 7.5%    { opacity: 1; }
            8%          { opacity: 0; }
            25%, 32.5%  { opacity: 1; }
            33%         { opacity: 0; }
            50%, 57.5%  { opacity: 1; }
            58%         { opacity: 0; }
            75%, 82.5%  { opacity: 1; }
            83%, 100%   { opacity: 0; }
          }

          /* Foam bubbles: emerge from sump surface, rise + fade during
             each loop's beat 2 window (7.5-15%, 32.5-40%, 57.5-65%,
             82.5-90% of the 40s cycle). Individual bubbles get staggered
             animation-delay via the .ofm-bubble-{n} classes. */
          .ofm-bubble {
            opacity: 0;
            animation: ofm-bubble 40s ease-out infinite;
          }
          @keyframes ofm-bubble {
            0%, 7.5%     { opacity: 0; transform: translateY(0) translateX(0); }
            10%          { opacity: 0.85; transform: translateY(-10px) translateX(-2px); }
            13%          { opacity: 0.7;  transform: translateY(-40px) translateX(-8px); }
            15%, 25%     { opacity: 0;    transform: translateY(-70px) translateX(-14px); }
            25.01%       { transform: translateY(0) translateX(0); }
            32.5%        { opacity: 0; transform: translateY(0); }
            35%          { opacity: 0.85; transform: translateY(-10px) translateX(-2px); }
            38%          { opacity: 0.7;  transform: translateY(-40px) translateX(-8px); }
            40%, 50%     { opacity: 0;    transform: translateY(-70px) translateX(-14px); }
            50.01%       { transform: translateY(0); }
            57.5%        { opacity: 0; transform: translateY(0); }
            60%          { opacity: 0.85; transform: translateY(-10px) translateX(-2px); }
            63%          { opacity: 0.7;  transform: translateY(-40px) translateX(-8px); }
            65%, 75%     { opacity: 0;    transform: translateY(-70px) translateX(-14px); }
            75.01%       { transform: translateY(0); }
            82.5%        { opacity: 0; transform: translateY(0); }
            85%          { opacity: 0.85; transform: translateY(-10px) translateX(-2px); }
            88%          { opacity: 0.7;  transform: translateY(-40px) translateX(-8px); }
            90%, 100%    { opacity: 0;    transform: translateY(-70px) translateX(-14px); }
          }
          .ofm-bubble-2 { animation-delay: -0.4s; }
          .ofm-bubble-3 { animation-delay: -0.8s; }
          .ofm-bubble-4 { animation-delay: -0.2s; }
          .ofm-bubble-5 { animation-delay: -0.6s; }

          /* Beat labels: highlight the active beat during its window.
             Beat 1 active: 0-7.5%, 25-32.5%, 50-57.5%, 75-82.5%
             Beat 2 active: 7.5-15%, 32.5-40%, 57.5-65%, 82.5-90%
             Beat 3 active: 15-25%, 40-50%, 65-75%, 90-100%
             (Beat 3 window folds the "hold" into its highlight window.) */
          .ofm-label { opacity: 0.35; animation: none; }
          .ofm-label-1 { animation: ofm-label-1 40s linear infinite; }
          .ofm-label-2 { animation: ofm-label-2 40s linear infinite; }
          .ofm-label-3 { animation: ofm-label-3 40s linear infinite; }
          @keyframes ofm-label-1 {
            0%, 7.5%    { opacity: 1; }
            8%, 24.99%  { opacity: 0.35; }
            25%, 32.5%  { opacity: 1; }
            33%, 49.99% { opacity: 0.35; }
            50%, 57.5%  { opacity: 1; }
            58%, 74.99% { opacity: 0.35; }
            75%, 82.5%  { opacity: 1; }
            83%, 100%   { opacity: 0.35; }
          }
          @keyframes ofm-label-2 {
            0%, 7.49%   { opacity: 0.35; }
            7.5%, 15%   { opacity: 1; }
            16%, 32.49% { opacity: 0.35; }
            32.5%, 40%  { opacity: 1; }
            41%, 57.49% { opacity: 0.35; }
            57.5%, 65%  { opacity: 1; }
            66%, 82.49% { opacity: 0.35; }
            82.5%, 90%  { opacity: 1; }
            91%, 100%   { opacity: 0.35; }
          }
          @keyframes ofm-label-3 {
            0%, 14.99%  { opacity: 0.35; }
            15%, 25%    { opacity: 1; }
            26%, 39.99% { opacity: 0.35; }
            40%, 50%    { opacity: 1; }
            51%, 64.99% { opacity: 0.35; }
            65%, 75%    { opacity: 1; }
            76%, 89.99% { opacity: 0.35; }
            90%, 100%   { opacity: 1; }
          }

          /* Reduced motion — freeze in the informative end-state:
             sump at 40% (final loop), foam static along the discharge
             path, pressure arrow off, all three beat labels visible.
             The static caption below picks up the rest. */
          @media (prefers-reduced-motion: reduce) {
            .ofm-sump      { animation: none; transform: scaleY(0.40); }
            .ofm-pressure  { animation: none; opacity: 0; }
            .ofm-bubble    { animation: none; opacity: 0.6; transform: translateY(-50px) translateX(-10px); }
            .ofm-label     { opacity: 1; animation: none; }
            .ofm-label-1, .ofm-label-2, .ofm-label-3 { opacity: 1; animation: none; }
            .ofm-static-caption { display: block; }
          }
          .ofm-static-caption { display: none; }
        `}</style>

        {/* ═══ COMPRESSOR CUTAWAY (left half) ═══ */}

        {/* Compressor outer shell — rounded rect for hermetic can */}
        <rect
          x={COMPRESSOR_X}
          y={COMPRESSOR_Y}
          width={COMPRESSOR_W}
          height={COMPRESSOR_H}
          rx={30}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          opacity="0.7"
        />

        {/* Suction port (left side) */}
        <g>
          <line x1={COMPRESSOR_X - 30} y1={80} x2={COMPRESSOR_X} y2={80} stroke="currentColor" strokeWidth={2} opacity="0.6" />
          <text x={COMPRESSOR_X - 34} y={72} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.6">
            suction
          </text>
          {/* Pressure-drop arrow — flashes at each beat 1 */}
          <g className="ofm-pressure">
            <path
              d={`M ${COMPRESSOR_X - 24} 92 L ${COMPRESSOR_X - 24} 108 M ${COMPRESSOR_X - 30} 102 L ${COMPRESSOR_X - 24} 108 L ${COMPRESSOR_X - 18} 102`}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              opacity="0.85"
            />
            <text x={COMPRESSOR_X - 24} y={124} textAnchor="middle" fontSize="10" fontWeight={600} fill="currentColor" opacity="0.85">
              ΔP↓
            </text>
          </g>
        </g>

        {/* Discharge port (upper right of shell) */}
        <g>
          <line x1={COMPRESSOR_X + COMPRESSOR_W} y1={70} x2={COMPRESSOR_X + COMPRESSOR_W + 30} y2={70} stroke="currentColor" strokeWidth={2} opacity="0.6" />
          <text x={COMPRESSOR_X + COMPRESSOR_W + 34} y={64} textAnchor="start" fontSize="9" fill="currentColor" opacity="0.6">
            discharge
          </text>
          {/* Discharge arrow */}
          <path
            d={`M ${COMPRESSOR_X + COMPRESSOR_W + 34} 74 L ${COMPRESSOR_X + COMPRESSOR_W + 44} 70 L ${COMPRESSOR_X + COMPRESSOR_W + 34} 66`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            opacity="0.7"
          />
        </g>

        {/* Motor / cylinder body (schematic — inside the shell) */}
        <rect
          x={COMPRESSOR_X + 90}
          y={COMPRESSOR_Y + 30}
          width={180}
          height={130}
          rx={6}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity="0.4"
        />
        <text
          x={COMPRESSOR_X + 180}
          y={COMPRESSOR_Y + 100}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.5"
        >
          motor / cylinder
        </text>

        {/* Sump baseline + label */}
        <line x1={COMPRESSOR_X + 20} y1={SUMP_BOTTOM} x2={COMPRESSOR_X + COMPRESSOR_W - 20} y2={SUMP_BOTTOM} stroke="currentColor" strokeWidth={0.5} opacity="0.4" strokeDasharray="2 3" />
        <text x={COMPRESSOR_X + 6} y={SUMP_BOTTOM - 4} fontSize="9" fill="currentColor" opacity="0.5">
          sump
        </text>

        {/* Oil pool + foam bubbles — wrapped in amber-toned <g> */}
        <g className="text-amber-600 dark:text-amber-400">
          <rect
            className="ofm-sump"
            x={COMPRESSOR_X + 20}
            y={SUMP_TOP}
            width={COMPRESSOR_W - 40}
            height={SUMP_H}
            fill="currentColor"
            opacity="0.55"
            rx={3}
          />
          {/* Reference marker at original full level */}
          <line
            x1={COMPRESSOR_X + 20}
            y1={SUMP_TOP}
            x2={COMPRESSOR_X + COMPRESSOR_W - 20}
            y2={SUMP_TOP}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity="0.35"
            strokeDasharray="1 2"
          />

          {/* Foam bubbles — 5 circles rising from sump surface toward discharge */}
          {[
            { x: COMPRESSOR_X + 200, r: 3.5, cls: "" },
            { x: COMPRESSOR_X + 220, r: 2.5, cls: "ofm-bubble-2" },
            { x: COMPRESSOR_X + 180, r: 3.0, cls: "ofm-bubble-3" },
            { x: COMPRESSOR_X + 240, r: 2.5, cls: "ofm-bubble-4" },
            { x: COMPRESSOR_X + 210, r: 4.0, cls: "ofm-bubble-5" },
          ].map((b, i) => (
            <circle
              key={i}
              className={`ofm-bubble ${b.cls}`}
              cx={b.x}
              cy={SUMP_TOP - 6}
              r={b.r}
              fill="currentColor"
              opacity="0.8"
            />
          ))}

          {/* Escape-path arrow: from bubble region toward discharge port */}
          <path
            d={`M ${COMPRESSOR_X + 250} ${SUMP_TOP - 20} Q ${COMPRESSOR_X + 320} 100, ${COMPRESSOR_X + COMPRESSOR_W - 8} 74`}
            stroke="currentColor"
            strokeWidth={1}
            fill="none"
            opacity="0.45"
            strokeDasharray="3 3"
          />
        </g>

        {/* ═══ BEAT LABELS (right half) ═══ */}
        {BEAT_LABELS.map((beat, i) => {
          const y = 70 + i * 70;
          return (
            <g key={beat.key} className={`ofm-label ofm-label-${i + 1}`}>
              <circle cx={LABEL_X} cy={y} r={11} fill="none" stroke="currentColor" strokeWidth={1} opacity="0.6" />
              <text x={LABEL_X} y={y + 4} textAnchor="middle" fontSize="11" fontWeight={700} fill="currentColor">
                {i + 1}
              </text>
              <text x={LABEL_X + 22} y={y - 4} fontSize="11" fontWeight={600} fill="currentColor">
                {beat.title}
              </text>
              <text x={LABEL_X + 22} y={y + 12} fontSize="9" fill="currentColor" opacity="0.75">
                {beat.body}
              </text>
            </g>
          );
        })}

        {/* Reduced-motion caption — hidden by default, revealed by the
            @media (prefers-reduced-motion: reduce) rule above. */}
        <text
          x={COMPRESSOR_X + COMPRESSOR_W / 2}
          y={SUMP_BOTTOM + 30}
          textAnchor="middle"
          fontSize="10"
          fontWeight={600}
          fill="currentColor"
          opacity="0.85"
          className="ofm-static-caption"
        >
          repeated short starts pump crankcase oil out into the system
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Compressor crankcase cutaway showing the short-cycling oil-loss mechanism from Copeland AE17-1262 R2: each rapid start drops crankcase pressure, the oil-refrigerant mixture flashes into foam and exits with discharge gas, and the sump level steps down over repeated cycles. Four consecutive starts drain the sump to about 40% of the starting level before the animation resets.
      </figcaption>
    </figure>
  );
}
