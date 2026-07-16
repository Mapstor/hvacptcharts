import { useId } from "react";
import {
  getPressureAtTempF,
  getRefrigerant,
} from "@/data/refrigerants";
import {
  isGaugeDiagramSupported,
  type GaugeOperatingPoint,
} from "@/data/gauge-operating-points";

export interface SystemGaugesDiagramProps {
  slug: string;
  evapTempF: number;
  condTempF: number;
  contextLabel: string;
  altDutyNote?: string;
}

/**
 * Two-gauge service view of a subcritical vapor-compression system for the
 * /what-pressure-should-{slug}/ pages. Renders the refrigeration cycle
 * schematic (compressor / condenser / metering device / evaporator) with a
 * low-side and a high-side gauge whose needles sweep to the fluid's
 * saturation pressures at the design point.
 *
 * SUPPORTED predicate governs whether we render at all:
 *  - B-class fluids (higher toxicity, gauge convention differs) — skip
 *  - Transcritical or near-critical at the head condition — skip
 *  - Either temp outside the ptTable range — skip
 *
 * When unsupported, returns null. Nothing to configure per-fluid; adding
 * a new fluid to the constants file exercises the predicate at build time.
 *
 * Animation: needles rotate from the zero-pressure rest position (7-o'clock,
 * -120°) to the settled angle over 1.8s ease-out, with a 0.2s delay on the
 * high side for visual separation. prefers-reduced-motion: reduce removes
 * the animation and renders the settled angle directly — same visual
 * end-state.
 *
 * Numbers come from getPressureAtTempF(slug, tempF), the same function the
 * WhatPressurePage answer copy calls with the same (slug, tempF). No PSIG
 * literal in the source.
 */
export function SystemGaugesDiagram({
  slug,
  evapTempF,
  condTempF,
  contextLabel,
  altDutyNote,
}: SystemGaugesDiagramProps) {
  const titleId = useId();
  const descId = useId();
  const uniq = titleId.replace(/[:]/g, "");
  const r = getRefrigerant(slug);
  if (!r) return null;
  if (!isGaugeDiagramSupported(r, evapTempF, condTempF)) return null;

  const evapSat = getPressureAtTempF(slug, evapTempF);
  const condSat = getPressureAtTempF(slug, condTempF);
  if (!evapSat || !condSat) return null;

  const lowPsig = evapSat.dew;
  const highPsig = condSat.bubble;

  const lowMax = chooseGaugeMax(lowPsig, "low");
  const highMax = chooseGaugeMax(highPsig, "high");

  const lowAngle = psigToAngle(lowPsig, lowMax);
  const highAngle = psigToAngle(highPsig, highMax);

  // Normal-range band spans ±15% of the settled saturation value — the
  // approximate range a well-charged system moves through as outdoor
  // ambient sweeps its design envelope. Bounded to gauge scale.
  const lowNormalLo = clamp(lowPsig * 0.85, 0, lowMax);
  const lowNormalHi = clamp(lowPsig * 1.15, 0, lowMax);
  const highNormalLo = clamp(highPsig * 0.85, 0, highMax);
  const highNormalHi = clamp(highPsig * 1.15, 0, highMax);

  const hasFlammabilityBand =
    r.safetyClass.startsWith("A2") || r.safetyClass.startsWith("A3");

  const titleText = `Typical ${r.displayName} system pressures at design conditions`;
  const descText = `Refrigeration-cycle schematic with two service gauges for ${r.displayName}. Low-side gauge reads ${lowPsig.toFixed(1)} PSIG (evaporator saturation ${evapTempF}°F, dew line). High-side gauge reads ${highPsig.toFixed(1)} PSIG (condenser saturation ${condTempF}°F, bubble line). Context: ${contextLabel}. ASHRAE 34 safety class ${r.safetyClass}${hasFlammabilityBand ? " — flammable, service gauges must be A2L/A3-rated" : ""}.`;

  const cssLow = `nl-${uniq}`;
  const cssHigh = `nh-${uniq}`;

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
          .${cssLow}  { transform: rotate(-120deg); animation: ${cssLow}-a 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .${cssHigh} { transform: rotate(-120deg); animation: ${cssHigh}-a 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
          @keyframes ${cssLow}-a  { to { transform: rotate(${lowAngle.toFixed(2)}deg); } }
          @keyframes ${cssHigh}-a { to { transform: rotate(${highAngle.toFixed(2)}deg); } }
          @media (prefers-reduced-motion: reduce) {
            .${cssLow}  { animation: none; transform: rotate(${lowAngle.toFixed(2)}deg); }
            .${cssHigh} { animation: none; transform: rotate(${highAngle.toFixed(2)}deg); }
          }
        `}</style>

        {/* ─────────── Refrigeration cycle schematic ─────────── */}
        <g className="text-zinc-600 dark:text-zinc-400">
          {/* Condenser at top */}
          <rect
            x="240"
            y="46"
            width="260"
            height="44"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="370"
            y="72"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="currentColor"
          >
            CONDENSER
          </text>
          {/* Condenser fins (visual detail) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line
              key={`cfin-${i}`}
              x1={260 + i * 24}
              y1={52}
              x2={260 + i * 24}
              y2={84}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}

          {/* Compressor circle */}
          <circle
            cx="298"
            cy="168"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <text
            x="298"
            y="172"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="currentColor"
          >
            COMP
          </text>

          {/* Metering device — TXV symbol */}
          <path
            d="M 485 155 L 505 168 L 485 181 Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M 505 155 L 485 168 L 505 181 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <text
            x="495"
            y="200"
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            opacity="0.75"
          >
            TXV
          </text>

          {/* Evaporator at bottom */}
          <rect
            x="240"
            y="240"
            width="260"
            height="44"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="370"
            y="266"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="currentColor"
          >
            EVAPORATOR
          </text>
          {/* Evap fins */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line
              key={`efin-${i}`}
              x1={260 + i * 24}
              y1={246}
              x2={260 + i * 24}
              y2={278}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}
        </g>

        {/* Flow lines (thicker warm tone for discharge/hot side, cool for suction) */}
        {/* Discharge: comp top → up → cond bottom-left */}
        <g stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.85">
          <line x1="298" y1="138" x2="298" y2="90" />
          <line x1="500" y1="90" x2="500" y2="155" />
          <path d="M 294 100 L 298 90 L 302 100" strokeLinejoin="round" />
          <path d="M 496 145 L 500 155 L 504 145" strokeLinejoin="round" />
        </g>
        {/* Suction / low side: metering → down → evap → left → up → comp */}
        <g stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.85">
          <line x1="490" y1="181" x2="490" y2="240" />
          <line x1="250" y1="240" x2="250" y2="198" />
          <path d="M 486 230 L 490 240 L 494 230" strokeLinejoin="round" />
          <path d="M 246 208 L 250 198 L 254 208" strokeLinejoin="round" />
          <line x1="250" y1="198" x2="270" y2="180" />
        </g>

        {/* Gauge tap markers on the schematic */}
        <g className="text-zinc-500 dark:text-zinc-500">
          <circle cx="298" cy="105" r="3" fill="#dc2626" />
          <circle cx="250" cy="220" r="3" fill="#2563eb" />
        </g>

        {/* ─────────── Low side (suction) gauge ─────────── */}
        <Gauge
          cx={110}
          cy={175}
          radius={70}
          maxPsig={lowMax}
          valuePsig={lowPsig}
          normalLoPsig={lowNormalLo}
          normalHiPsig={lowNormalHi}
          tempF={evapTempF}
          curve="dew"
          headerLine="LOW SIDE"
          subHeaderLine="SUCTION"
          needleClass={cssLow}
          accentHex="#2563eb"
          uniq={`l-${uniq}`}
        />

        {/* ─────────── High side (discharge) gauge ─────────── */}
        <Gauge
          cx={610}
          cy={175}
          radius={70}
          maxPsig={highMax}
          valuePsig={highPsig}
          normalLoPsig={highNormalLo}
          normalHiPsig={highNormalHi}
          tempF={condTempF}
          curve="bubble"
          headerLine="HIGH SIDE"
          subHeaderLine="DISCHARGE"
          needleClass={cssHigh}
          accentHex="#dc2626"
          uniq={`h-${uniq}`}
        />
      </svg>
      <figcaption className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Typical running {r.displayName} system at the design point ({contextLabel}):
        suction gauge ~{lowPsig.toFixed(1)} PSIG ({evapTempF}°F evaporator saturation),
        head gauge ~{highPsig.toFixed(1)} PSIG ({condTempF}°F condenser saturation).
        {" "}Real manifold readings shift with outdoor ambient — see the operating-range
        table above.
        {altDutyNote ? <> {altDutyNote}</> : null}
      </figcaption>
    </figure>
  );
}

/* ─────────── Helpers ─────────── */

function psigToAngle(psig: number, maxPsig: number): number {
  const clamped = Math.max(0, Math.min(psig, maxPsig));
  return -120 + (clamped / maxPsig) * 240;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(v, hi));
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

interface GaugeProps {
  cx: number;
  cy: number;
  radius: number;
  maxPsig: number;
  valuePsig: number;
  normalLoPsig: number;
  normalHiPsig: number;
  tempF: number;
  curve: "bubble" | "dew";
  headerLine: string;
  subHeaderLine: string;
  needleClass: string;
  accentHex: string;
  uniq: string;
}

function Gauge({
  cx,
  cy,
  radius,
  maxPsig,
  valuePsig,
  normalLoPsig,
  normalHiPsig,
  tempF,
  curve,
  headerLine,
  subHeaderLine,
  needleClass,
  accentHex,
}: GaugeProps) {
  const startAngle = -120;
  const endAngle = 120;

  const sweepArc = arcPath(cx, cy, radius, startAngle, endAngle);
  const normalArc = arcPath(
    cx,
    cy,
    radius - 8,
    psigToAngle(normalLoPsig, maxPsig),
    psigToAngle(normalHiPsig, maxPsig),
  );

  // Major ticks at 0, 25%, 50%, 75%, 100% of the sweep
  const majorTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const a = startAngle + f * (endAngle - startAngle);
    const inner = polarPoint(cx, cy, radius - 3, a);
    const outer = polarPoint(cx, cy, radius, a);
    const label = polarPoint(cx, cy, radius - 15, a);
    return { a, inner, outer, label, psig: Math.round(maxPsig * f) };
  });

  // Minor ticks between majors (10% increments)
  const minorTicks = [];
  for (let i = 1; i <= 9; i++) {
    if (i % 2.5 === 0) continue;
    const f = i / 10;
    const a = startAngle + f * (endAngle - startAngle);
    const inner = polarPoint(cx, cy, radius - 1.5, a);
    const outer = polarPoint(cx, cy, radius, a);
    minorTicks.push({ a, inner, outer });
  }

  return (
    <g>
      {/* Header labels above gauge */}
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

      {/* Gauge outer ring */}
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

      {/* Sweep track (subtle background) */}
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

      {/* Minor tick marks */}
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

      {/* Major tick marks + numeric labels */}
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

      {/* Unit label at bottom of face */}
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

      {/* Needle group — translated to (cx, cy), rotated by CSS class */}
      <g transform={`translate(${cx} ${cy})`}>
        <g className={needleClass} style={{ transformOrigin: "0 0" }}>
          <polygon
            points={`0,${-radius + 8} -3,4 3,4`}
            fill={accentHex}
            stroke={accentHex}
            strokeWidth="0.5"
          />
        </g>
        {/* Center pivot */}
        <circle cx="0" cy="0" r="5" fill="currentColor" opacity="0.9" />
        <circle cx="0" cy="0" r="2.5" className="fill-white dark:fill-zinc-900" />
      </g>

      {/* Digital readout below gauge */}
      <text
        x={cx}
        y={cy + radius + 22}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill={accentHex}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {valuePsig.toFixed(1)} PSIG
      </text>
      <text
        x={cx}
        y={cy + radius + 36}
        textAnchor="middle"
        fontSize="9"
        fill="currentColor"
        opacity="0.7"
      >
        {tempF}°F {curve} saturation
      </text>
    </g>
  );
}
