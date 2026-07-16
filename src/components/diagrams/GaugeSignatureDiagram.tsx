import { useId } from "react";
import {
  getPressureAtTempF,
  getRefrigerant,
} from "@/data/refrigerants";
import { isGaugeDiagramSupported } from "@/data/gauge-operating-points";

/**
 * Diagnostic-signature version of the two-gauge service view. Where
 * SystemGaugesDiagram (Tier 1) shows "typical running" pressures, this
 * component shows the FAULT signature — needles static at their fault-zone
 * positions with ghost markers at the normal-band position so the deviation
 * is the message.
 *
 * The direction language follows field diagnostic vocabulary:
 *   up / down                     — clearly in fault territory (±25% of normal)
 *   normal-to-up / normal-to-down — at the edge of the ±15% normal band
 *   normal                        — no deviation on this side
 *
 * NO oscillation, NO drift, NO ±deg wobble. Static needle positions only.
 * A fluttering needle IS a diagnostic signature to a service tech (compressor
 * valve problems, restriction hunting) — animating one for polish would
 * accidentally teach a different fault. If ambiguity needs signaling, use
 * the faultLabel text ("head normal to slightly elevated").
 *
 * Both needles reveal via a single 1.8s ease-out sweep from the normal
 * angle to the fault angle, with a brief hold at normal so the reader
 * registers "normal → fault". Reduced-motion: needles rendered at fault
 * position, ghost markers at normal position. No motion, same signature.
 */

export type FaultDirection =
  | "up"
  | "down"
  | "normal"
  | "normal-to-up"
  | "normal-to-down";

export interface GaugeSignatureDiagramProps {
  slug: string;
  normalEvapTempF: number;
  normalCondTempF: number;
  faultLow: FaultDirection;
  faultHigh: FaultDirection;
  faultLabel: string;
  faultShiftLowPct?: number;
  faultShiftHighPct?: number;
}

const FAULT_SHIFT_DEFAULTS: Record<FaultDirection, number> = {
  up: 25,
  down: -25,
  "normal-to-up": 15,
  "normal-to-down": -15,
  normal: 0,
};

const NORMAL_BAND_PCT = 15; // ±15% — matches Tier 1 SystemGaugesDiagram

export function GaugeSignatureDiagram({
  slug,
  normalEvapTempF,
  normalCondTempF,
  faultLow,
  faultHigh,
  faultLabel,
  faultShiftLowPct,
  faultShiftHighPct,
}: GaugeSignatureDiagramProps) {
  const titleId = useId();
  const descId = useId();
  const uniq = titleId.replace(/[:]/g, "");
  const r = getRefrigerant(slug);
  if (!r) return null;
  if (!isGaugeDiagramSupported(r, normalEvapTempF, normalCondTempF)) return null;

  const evapSat = getPressureAtTempF(slug, normalEvapTempF);
  const condSat = getPressureAtTempF(slug, normalCondTempF);
  if (!evapSat || !condSat) return null;

  const normalLowPsig = evapSat.dew;
  const normalHighPsig = condSat.bubble;
  const shiftLow = faultShiftLowPct ?? FAULT_SHIFT_DEFAULTS[faultLow];
  const shiftHigh = faultShiftHighPct ?? FAULT_SHIFT_DEFAULTS[faultHigh];
  const faultLowPsig = normalLowPsig * (1 + shiftLow / 100);
  const faultHighPsig = normalHighPsig * (1 + shiftHigh / 100);

  const lowMax = chooseGaugeMax(Math.max(normalLowPsig, faultLowPsig), "low");
  const highMax = chooseGaugeMax(Math.max(normalHighPsig, faultHighPsig), "high");

  const normalLowAngle = psigToAngle(normalLowPsig, lowMax);
  const normalHighAngle = psigToAngle(normalHighPsig, highMax);
  const faultLowAngle = psigToAngle(faultLowPsig, lowMax);
  const faultHighAngle = psigToAngle(faultHighPsig, highMax);

  // Normal-range band = ±NORMAL_BAND_PCT of normal PSIG, clamped to gauge scale.
  const lowBandLo = clamp(normalLowPsig * (1 - NORMAL_BAND_PCT / 100), 0, lowMax);
  const lowBandHi = clamp(normalLowPsig * (1 + NORMAL_BAND_PCT / 100), 0, lowMax);
  const highBandLo = clamp(normalHighPsig * (1 - NORMAL_BAND_PCT / 100), 0, highMax);
  const highBandHi = clamp(normalHighPsig * (1 + NORMAL_BAND_PCT / 100), 0, highMax);

  const cssLow = `sl-${uniq}`;
  const cssHigh = `sh-${uniq}`;

  const titleText = `${faultLabel} — R-410A gauge signature diagram`;
  const descText = `Two manifold gauges showing a ${faultLabel.toLowerCase()} on ${r.displayName}. Low-side needle sits at ${faultLowPsig.toFixed(1)} PSIG (${signPct(shiftLow)}% versus a normal ${normalLowPsig.toFixed(1)} PSIG at ${normalEvapTempF}°F evap saturation, dew line). High-side needle sits at ${faultHighPsig.toFixed(1)} PSIG (${signPct(shiftHigh)}% versus a normal ${normalHighPsig.toFixed(1)} PSIG at ${normalCondTempF}°F cond saturation, bubble line). Ghost markers on each face show the normal-position anchor.`;

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
          .${cssLow}  { transform: rotate(${normalLowAngle.toFixed(2)}deg); animation: ${cssLow}-a 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .${cssHigh} { transform: rotate(${normalHighAngle.toFixed(2)}deg); animation: ${cssHigh}-a 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
          @keyframes ${cssLow}-a {
            0%   { transform: rotate(${normalLowAngle.toFixed(2)}deg); }
            15%  { transform: rotate(${normalLowAngle.toFixed(2)}deg); }
            100% { transform: rotate(${faultLowAngle.toFixed(2)}deg); }
          }
          @keyframes ${cssHigh}-a {
            0%   { transform: rotate(${normalHighAngle.toFixed(2)}deg); }
            15%  { transform: rotate(${normalHighAngle.toFixed(2)}deg); }
            100% { transform: rotate(${faultHighAngle.toFixed(2)}deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .${cssLow}  { animation: none; transform: rotate(${faultLowAngle.toFixed(2)}deg); }
            .${cssHigh} { animation: none; transform: rotate(${faultHighAngle.toFixed(2)}deg); }
          }
        `}</style>

        {/* Central fault-label plate */}
        <g className="text-zinc-700 dark:text-zinc-200">
          <rect
            x="235"
            y="80"
            width="250"
            height="160"
            rx="8"
            className="fill-white dark:fill-zinc-900"
            stroke="currentColor"
            strokeWidth="1.25"
            opacity="0.9"
          />
          <text
            x="360"
            y="110"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="currentColor"
            opacity="0.7"
            letterSpacing="1.5"
          >
            SIGNATURE
          </text>
          {splitLabelForSvg(faultLabel).map((line, i) => (
            <text
              key={`fl-${i}`}
              x="360"
              y={135 + i * 16}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="currentColor"
            >
              {line}
            </text>
          ))}
          <text
            x="360"
            y="220"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
            opacity="0.6"
          >
            Reference fluid: R-410A · {normalEvapTempF}°F evap · {normalCondTempF}°F cond
          </text>
        </g>

        {/* Left gauge (low side) */}
        <SignatureGauge
          cx={110}
          cy={175}
          radius={70}
          maxPsig={lowMax}
          normalPsig={normalLowPsig}
          faultPsig={faultLowPsig}
          faultShiftPct={shiftLow}
          bandLoPsig={lowBandLo}
          bandHiPsig={lowBandHi}
          tempF={normalEvapTempF}
          curve="dew"
          headerLine="LOW SIDE"
          subHeaderLine="SUCTION"
          needleClass={cssLow}
          accentHex="#2563eb"
        />

        {/* Right gauge (high side) */}
        <SignatureGauge
          cx={610}
          cy={175}
          radius={70}
          maxPsig={highMax}
          normalPsig={normalHighPsig}
          faultPsig={faultHighPsig}
          faultShiftPct={shiftHigh}
          bandLoPsig={highBandLo}
          bandHiPsig={highBandHi}
          tempF={normalCondTempF}
          curve="bubble"
          headerLine="HIGH SIDE"
          subHeaderLine="DISCHARGE"
          needleClass={cssHigh}
          accentHex="#dc2626"
        />
      </svg>
      <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        {faultLabel} on {r.displayName} at design conditions (
        {normalEvapTempF}°F evap / {normalCondTempF}°F cond). Suction reads ~
        {faultLowPsig.toFixed(1)} PSIG versus {normalLowPsig.toFixed(1)} PSIG
        normal; head reads ~{faultHighPsig.toFixed(1)} PSIG versus{" "}
        {normalHighPsig.toFixed(1)} PSIG normal. Ghost markers on each face
        show the normal-position anchor for reference.
      </figcaption>
    </figure>
  );
}

/* ─────────── Shared helpers (parallel to SystemGaugesDiagram) ─────────── */

function psigToAngle(psig: number, maxPsig: number): number {
  const clamped = Math.max(0, Math.min(psig, maxPsig));
  return -120 + (clamped / maxPsig) * 240;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(v, hi));
}

function signPct(pct: number): string {
  if (pct === 0) return "±0";
  return pct > 0 ? `+${pct}` : `${pct}`;
}

/**
 * Break a faultLabel into up to 3 lines for SVG rendering. Prefers to split
 * at " — " (em-dash separator we use in labels), then falls back to
 * word-wrap at ~34 chars. Labels above that length get truncated to fit —
 * page authors should keep faultLabel under ~90 chars for legibility.
 */
function splitLabelForSvg(label: string, maxCharsPerLine = 34): string[] {
  const dashSplit = label.split(" — ");
  if (dashSplit.length === 2 && dashSplit[0].length <= maxCharsPerLine + 4 && dashSplit[1].length <= maxCharsPerLine + 4) {
    return [dashSplit[0] + " —", dashSplit[1]];
  }
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
    if (lines.length >= 3) break;
  }
  if (current && lines.length < 3) lines.push(current.trim());
  return lines.slice(0, 3);
}

function chooseGaugeMax(psig: number, side: "low" | "high"): number {
  if (side === "low") {
    if (psig < 50) return 100;
    if (psig < 100) return 150;
    if (psig < 150) return 200;
    return 250;
  }
  if (psig < 150) return 200;
  if (psig < 250) return 300;
  if (psig < 350) return 500;
  if (psig < 450) return 600;
  return 800;
}

function polarPoint(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const p1 = polarPoint(cx, cy, r, startAngle);
  const p2 = polarPoint(cx, cy, r, endAngle);
  const large = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

interface SignatureGaugeProps {
  cx: number;
  cy: number;
  radius: number;
  maxPsig: number;
  normalPsig: number;
  faultPsig: number;
  faultShiftPct: number;
  bandLoPsig: number;
  bandHiPsig: number;
  tempF: number;
  curve: "bubble" | "dew";
  headerLine: string;
  subHeaderLine: string;
  needleClass: string;
  accentHex: string;
}

function SignatureGauge({
  cx,
  cy,
  radius,
  maxPsig,
  normalPsig,
  faultPsig,
  faultShiftPct,
  bandLoPsig,
  bandHiPsig,
  tempF,
  curve,
  headerLine,
  subHeaderLine,
  needleClass,
  accentHex,
}: SignatureGaugeProps) {
  const startAngle = -120;
  const endAngle = 120;

  const sweepArc = arcPath(cx, cy, radius, startAngle, endAngle);
  const normalArc = arcPath(
    cx,
    cy,
    radius - 8,
    psigToAngle(bandLoPsig, maxPsig),
    psigToAngle(bandHiPsig, maxPsig),
  );

  // Ghost normal marker — thin ring segment at the exact normal angle
  const normalAngle = psigToAngle(normalPsig, maxPsig);
  const ghost = polarPoint(cx, cy, radius - 3, normalAngle);
  const ghostInner = polarPoint(cx, cy, radius - 12, normalAngle);

  const majorTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const a = startAngle + f * (endAngle - startAngle);
    const inner = polarPoint(cx, cy, radius - 3, a);
    const outer = polarPoint(cx, cy, radius, a);
    const label = polarPoint(cx, cy, radius - 15, a);
    return { a, inner, outer, label, psig: Math.round(maxPsig * f) };
  });

  const minorTicks: { inner: { x: number; y: number }; outer: { x: number; y: number } }[] = [];
  for (let i = 1; i <= 9; i++) {
    if (i % 2.5 === 0) continue;
    const f = i / 10;
    const a = startAngle + f * (endAngle - startAngle);
    minorTicks.push({
      inner: polarPoint(cx, cy, radius - 1.5, a),
      outer: polarPoint(cx, cy, radius, a),
    });
  }

  const isFault = faultShiftPct !== 0;

  return (
    <g>
      <text
        x={cx}
        y={cy - radius - 22}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="1"
      >
        {headerLine}
      </text>
      <text
        x={cx}
        y={cy - radius - 8}
        textAnchor="middle"
        fontSize="9"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.5"
      >
        {subHeaderLine}
      </text>

      <circle
        cx={cx}
        cy={cy}
        r={radius + 4}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        className="fill-white dark:fill-zinc-900"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.9"
      />

      {/* Sweep track */}
      <path
        d={sweepArc}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.12"
      />

      {/* Normal-range green band */}
      <path
        d={normalArc}
        fill="none"
        stroke="#16a34a"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Ghost normal marker — dashed radial at the normal angle */}
      <line
        x1={ghost.x}
        y1={ghost.y}
        x2={ghostInner.x}
        y2={ghostInner.y}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 2"
        opacity="0.55"
      />

      {minorTicks.map((t, i) => (
        <line
          key={`mn-${i}`}
          x1={t.inner.x}
          y1={t.inner.y}
          x2={t.outer.x}
          y2={t.outer.y}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.55"
        />
      ))}
      {majorTicks.map((t, i) => (
        <g key={`mj-${i}`}>
          <line
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <text
            x={t.label.x}
            y={t.label.y + 3}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            opacity="0.75"
          >
            {t.psig}
          </text>
        </g>
      ))}

      <text
        x={cx}
        y={cy + radius * 0.55}
        textAnchor="middle"
        fontSize="8"
        fontWeight="600"
        fill="currentColor"
        opacity="0.55"
        letterSpacing="1"
      >
        PSIG
      </text>

      <g transform={`translate(${cx} ${cy})`}>
        <g className={needleClass} style={{ transformOrigin: "0 0" }}>
          <polygon
            points={`0,${-radius + 8} -3,4 3,4`}
            fill={accentHex}
            stroke={accentHex}
            strokeWidth="0.5"
          />
        </g>
        <circle cx="0" cy="0" r="5" fill="currentColor" opacity="0.9" />
        <circle cx="0" cy="0" r="2.5" className="fill-white dark:fill-zinc-900" />
      </g>

      {/* Twin-line readout: NORMAL vs FAULT */}
      <text
        x={cx}
        y={cy + radius + 20}
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        opacity="0.7"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        NORMAL: {normalPsig.toFixed(1)} PSIG @ {tempF}°F {curve}
      </text>
      <text
        x={cx}
        y={cy + radius + 34}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={isFault ? accentHex : "currentColor"}
        opacity={isFault ? 1 : 0.7}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        FAULT: {faultPsig.toFixed(1)} PSIG ({signPct(faultShiftPct)}%)
      </text>
    </g>
  );
}
