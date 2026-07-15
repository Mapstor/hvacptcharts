import { useId } from "react";

export interface CycleTimelineDiagramProps {
  /**
   * Normal cycles per hour at 50% load, per Honeywell's CPH convention.
   * Drives the number of ON blocks on the top ("normal") timeline. Default
   * 3 (Honeywell's high-efficiency AC recommendation).
   */
  normalCph?: number;
  /**
   * Short-cycling cycle period in seconds — the diagram uses this to derive
   * the number of thin slivers on the bottom timeline (60 * 60 / seconds).
   * Default 90s = 40 cycles per hour.
   */
  shortCycleSeconds?: number;
  /**
   * Copeland scroll compressor minimum run time in minutes — labels the
   * bracket under the leftmost normal block. Default 3 min (per Copeland
   * knowledge base a_id/3662).
   */
  minRunMinutes?: number;
}

/**
 * Two horizontal 60-minute cycle timelines stacked. Top row: normal
 * residential AC cycling at the Honeywell CPH convention (3 fat ON blocks).
 * Bottom row: short cycling at ~40 thin slivers per hour. The visual
 * message ("top calm, bottom frantic — that's my unit") reads in ~2s and
 * is the primary confirmation moment on the B4 page.
 *
 * Animation: a single vertical playhead sweeps left→right across both
 * rows over 8s. A clip-path grows in sync, revealing the saturated ON
 * block colors as the playhead passes. `prefers-reduced-motion: reduce`
 * disables both animations and holds the clip-path fully open, so the
 * end-state (both timelines fully rendered) is visible without motion.
 *
 * Colors from the existing site palette: --c-bubble for calm (normal
 * cycling), --c-safe-a3 for alert (short cycling). Matches PT curve /
 * safety chip color language used elsewhere.
 */
export function CycleTimelineDiagram({
  normalCph = 3,
  shortCycleSeconds = 90,
  minRunMinutes = 3,
}: CycleTimelineDiagramProps) {
  const titleId = useId();
  const descId = useId();

  // Timeline geometry. 60 min → 600 px wide (10 px/min), inset 60 px from
  // left for row labels, ending at x=660. Total viewBox width 720 leaves
  // a right margin.
  const X0 = 60;
  const X1 = 660;
  const W = X1 - X0; // 600
  const NORMAL_Y = 40;
  const SHORT_Y = 130;
  const ROW_H = 30;

  // Normal row: normalCph cycles per hour → cycle length in minutes.
  // Assume 50% load convention (Honeywell CPH definition) so ON = OFF.
  const normalCycleMin = 60 / normalCph;
  const normalOnPx = (normalCycleMin / 2) * 10; // ON width in px
  const normalOnBlocks = Array.from({ length: normalCph }, (_, i) => ({
    x: X0 + i * (normalCycleMin * 10),
    w: normalOnPx,
  }));

  // Short cycling row: cycle every shortCycleSeconds. Derive count and
  // block widths so 40 thin slivers span 600 px with a ~5px ON + ~10px
  // OFF picket-fence look.
  const shortCyclesPerHour = 3600 / shortCycleSeconds;
  const shortCycleWidthPx = W / shortCyclesPerHour; // 15 px at defaults
  const shortOnPx = shortCycleWidthPx / 3; // 5 px at defaults
  const shortBlocks = Array.from({ length: shortCyclesPerHour }, (_, i) => ({
    x: X0 + i * shortCycleWidthPx,
    w: shortOnPx,
  }));

  // Bracket geometry — under the leftmost normal block. minRunMinutes
  // is annotated but the bracket spans the full block (which represents
  // a full ON cycle, always ≥ the minimum run time on a healthy system).
  const bracketY = NORMAL_Y + ROW_H + 8;
  const bracketPath = `M ${normalOnBlocks[0].x} ${bracketY}
    L ${normalOnBlocks[0].x} ${bracketY + 4}
    L ${normalOnBlocks[0].x + normalOnBlocks[0].w} ${bracketY + 4}
    L ${normalOnBlocks[0].x + normalOnBlocks[0].w} ${bracketY}`;
  const bracketLabelX = normalOnBlocks[0].x + normalOnBlocks[0].w / 2;
  const bracketLabelY = bracketY + 16;

  // Reveal clip-path is a rect that starts fully offset to the left (hiding
  // the saturated ON blocks) and slides right over 8s to reveal them.
  // The offset technique works reliably across browsers without needing
  // SMIL or JS.
  const revealClipId = `reveal-${titleId.replace(/[:]/g, "-")}`;
  const playheadId = `playhead-${titleId.replace(/[:]/g, "-")}`;

  return (
    <figure className="my-6 mx-auto max-w-3xl">
      <svg
        viewBox="0 0 720 220"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="w-full h-auto text-zinc-700 dark:text-zinc-300"
      >
        <title id={titleId}>
          Normal AC cycling versus short cycling on a 60-minute timeline
        </title>
        <desc id={descId}>
          Two 60-minute cycle timelines: normal residential AC cycling of about {normalCph} starts per hour at 50% load on the top row (calm color, {normalCph} wide ON blocks), versus short cycling with starts every {shortCycleSeconds} seconds on the bottom row (alert color, {shortCyclesPerHour} thin slivers). A bracket under the first normal block marks Copeland&apos;s {minRunMinutes}-minute minimum run time for scroll compressors.
        </desc>
        <style>{`
          .cycle-reveal { transform: translateX(-${W + 2}px); animation: cycle-reveal 8s linear infinite; }
          .cycle-playhead { transform: translateX(-${W}px); animation: cycle-playhead 8s linear infinite; }
          @keyframes cycle-reveal {
            0%   { transform: translateX(-${W + 2}px); }
            100% { transform: translateX(0); }
          }
          @keyframes cycle-playhead {
            0%   { transform: translateX(-${W}px); opacity: 0.9; }
            100% { transform: translateX(0);       opacity: 0.9; }
          }
          @media (prefers-reduced-motion: reduce) {
            .cycle-reveal   { animation: none; transform: translateX(0); }
            .cycle-playhead { animation: none; opacity: 0; }
          }
        `}</style>

        <defs>
          <clipPath id={revealClipId}>
            <rect className="cycle-reveal" x={X0} y={30} width={W + 2} height={160} />
          </clipPath>
        </defs>

        {/* Row labels */}
        <text x={X0 - 8} y={NORMAL_Y + ROW_H / 2 + 4} textAnchor="end" fontSize="11" fontWeight={600} fill="currentColor">
          Normal
        </text>
        <text x={X0 - 8} y={NORMAL_Y + ROW_H / 2 + 18} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.7">
          ~{normalCph} cycles/hr
        </text>
        <text x={X0 - 8} y={SHORT_Y + ROW_H / 2 + 4} textAnchor="end" fontSize="11" fontWeight={600} fill="currentColor">
          Short cycling
        </text>
        <text x={X0 - 8} y={SHORT_Y + ROW_H / 2 + 18} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.7">
          every ~{shortCycleSeconds}s
        </text>

        {/* Normal row — muted base */}
        <g opacity="0.32">
          {normalOnBlocks.map((b, i) => (
            <rect key={`n-base-${i}`} x={b.x} y={NORMAL_Y} width={b.w} height={ROW_H} rx={2} fill="var(--c-bubble)" />
          ))}
          <line x1={X0} y1={NORMAL_Y + ROW_H} x2={X1} y2={NORMAL_Y + ROW_H} stroke="currentColor" strokeWidth={0.75} opacity="0.5" />
        </g>
        {/* Normal row — saturated overlay (revealed by clip) */}
        <g clipPath={`url(#${revealClipId})`}>
          {normalOnBlocks.map((b, i) => (
            <rect key={`n-lit-${i}`} x={b.x} y={NORMAL_Y} width={b.w} height={ROW_H} rx={2} fill="var(--c-bubble)" />
          ))}
        </g>

        {/* Bracket + label under first normal block */}
        <path d={bracketPath} fill="none" stroke="currentColor" strokeWidth={1} opacity="0.65" />
        <text x={bracketLabelX} y={bracketLabelY} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.75">
          run ≥ {minRunMinutes} min (Copeland scroll minimum)
        </text>

        {/* Short cycling row — muted base */}
        <g opacity="0.32">
          {shortBlocks.map((b, i) => (
            <rect key={`s-base-${i}`} x={b.x} y={SHORT_Y} width={b.w} height={ROW_H} rx={0.5} fill="var(--c-safe-a3)" />
          ))}
          <line x1={X0} y1={SHORT_Y + ROW_H} x2={X1} y2={SHORT_Y + ROW_H} stroke="currentColor" strokeWidth={0.75} opacity="0.5" />
        </g>
        {/* Short cycling row — saturated overlay (revealed by clip) */}
        <g clipPath={`url(#${revealClipId})`}>
          {shortBlocks.map((b, i) => (
            <rect key={`s-lit-${i}`} x={b.x} y={SHORT_Y} width={b.w} height={ROW_H} rx={0.5} fill="var(--c-safe-a3)" />
          ))}
        </g>

        {/* Playhead — a single vertical line spanning both rows */}
        <g id={playheadId}>
          <line
            className="cycle-playhead"
            x1={X1}
            y1={NORMAL_Y - 6}
            x2={X1}
            y2={SHORT_Y + ROW_H + 6}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity="0.9"
          />
        </g>

        {/* Bottom axis: 0 / 30 / 60 min + "1 hour" caption */}
        <line x1={X0} y1={185} x2={X1} y2={185} stroke="currentColor" strokeWidth={0.5} opacity="0.4" />
        {[0, 15, 30, 45, 60].map((min) => {
          const x = X0 + min * 10;
          return (
            <g key={`tick-${min}`}>
              <line x1={x} y1={185} x2={x} y2={189} stroke="currentColor" strokeWidth={0.5} opacity="0.6" />
              <text x={x} y={200} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
                {min === 0 ? "0" : min === 60 ? "60 min" : `${min}`}
              </text>
            </g>
          );
        })}
        <text x={(X0 + X1) / 2} y={215} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55">
          1 hour
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Two 60-minute cycle timelines: normal residential AC cycling of about {normalCph} starts per hour at 50% load (top, calm) versus short cycling with starts every ~{shortCycleSeconds} seconds (bottom, alert). The bracket marks Copeland&apos;s {minRunMinutes}-minute minimum run time — cycles shorter than that strand oil in the system.
      </figcaption>
    </figure>
  );
}
