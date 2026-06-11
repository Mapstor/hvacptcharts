"use client";

import { useState } from "react";
import { Calculator, Wind, Thermometer, BarChart3, ArrowRight } from "lucide-react";
import type { PTPoint } from "@/data/refrigerants";

export interface CarrierChargingLookupProps {
  /** R-410A PT chart from the data layer. */
  ptChart: PTPoint[];
}

/**
 * Standard Carrier R-410A fixed-orifice superheat chart values.
 * Source: Carrier Service Bulletin "R-410A Charging — Fixed Orifice Devices",
 * reprinted in the Carrier Residential AC Service Reference and Bryant
 * installation manuals. Values in °F target superheat.
 */
const SH_CHART: Record<number, Record<number, number | null>> = {
  50: { 65: 13, 75: 7, 85: null, 95: null, 105: null, 115: null },
  55: { 65: 21, 75: 16, 85: 11, 95: 6, 105: null, 115: null },
  60: { 65: 27, 75: 23, 85: 19, 95: 16, 105: 12, 115: 8 },
  65: { 65: 31, 75: 28, 85: 25, 95: 22, 105: 19, 115: 16 },
  70: { 65: 32, 75: 30, 85: 28, 95: 26, 105: 24, 115: 22 },
  75: { 65: 33, 75: 31, 85: 30, 95: 28, 105: 26, 115: 25 },
};

const WB_OPTIONS = [50, 55, 60, 65, 70, 75];
const OD_OPTIONS = [65, 75, 85, 95, 105, 115];

function interpPressure(chart: PTPoint[], tempF: number): { bubble: number; dew: number } | null {
  if (chart.length === 0) return null;
  if (tempF < chart[0].tempF || tempF > chart[chart.length - 1].tempF) return null;
  for (let i = 0; i < chart.length - 1; i++) {
    const a = chart[i];
    const b = chart[i + 1];
    if (a.tempF <= tempF && tempF <= b.tempF) {
      const t = b.tempF === a.tempF ? 0 : (tempF - a.tempF) / (b.tempF - a.tempF);
      return {
        bubble: a.bubblePsig + t * (b.bubblePsig - a.bubblePsig),
        dew: a.dewPsig + t * (b.dewPsig - a.dewPsig),
      };
    }
  }
  return null;
}

type Snapshot = {
  inputs: { wb: number; od: number };
  wbRow: number;
  odCol: number;
  targetSH: number | null;
  satEvapF: number;
  evapP: { bubble: number; dew: number } | null;
  satCondF: number;
  condP: { bubble: number; dew: number } | null;
};

export function CarrierChargingLookup({ ptChart }: CarrierChargingLookupProps) {
  const [wb, setWb] = useState<string>("67");
  const [od, setOd] = useState<string>("95");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  function handleCalculate() {
    const wbN = Number(wb);
    const odN = Number(od);
    if (!Number.isFinite(wbN) || !Number.isFinite(odN)) return;
    const wbRow = WB_OPTIONS.reduce((acc, v) => (v <= wbN ? v : acc), WB_OPTIONS[0]);
    const odCol = OD_OPTIONS.reduce((acc, v) => (v <= odN ? v : acc), OD_OPTIONS[0]);
    const targetSH = SH_CHART[wbRow]?.[odCol] ?? null;
    const satEvapF = Math.max(wbN - 17, ptChart[0]?.tempF ?? -40);
    const evapP = interpPressure(ptChart, satEvapF);
    const satCondF = Math.min(odN + 25, ptChart[ptChart.length - 1]?.tempF ?? 150);
    const condP = interpPressure(ptChart, satCondF);
    setSnapshot({ inputs: { wb: wbN, od: odN }, wbRow, odCol, targetSH, satEvapF, evapP, satCondF, condP });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Interactive lookup — Carrier R-410A target superheat
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* FORM */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cc-wb" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <Wind className="h-4 w-4 text-blue-600" /> 1. Indoor wet-bulb (°F)
              </label>
              <p className="mt-0.5 text-xs text-zinc-500">Measured at the return-air grille. Typical cooling: 60-72°F WB.</p>
              <input
                id="cc-wb"
                type="number"
                min={50}
                max={75}
                step={1}
                value={wb}
                onChange={(e) => setWb(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="cc-od" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <Thermometer className="h-4 w-4 text-blue-600" /> 2. Outdoor dry-bulb (°F)
              </label>
              <p className="mt-0.5 text-xs text-zinc-500">At condensing unit, in shade. Typical design: 85-105°F.</p>
              <input
                id="cc-od"
                type="number"
                min={65}
                max={115}
                step={1}
                value={od}
                onChange={(e) => setOd(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              <Calculator className="h-5 w-5" /> Calculate target superheat <ArrowRight className="h-4 w-4" />
            </button>
            {snapshot ? <span className="text-xs text-zinc-500">Adjust inputs and click Calculate again to update.</span> : null}
          </div>
        </div>

        {/* RESULTS */}
        {snapshot ? (
          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <ResultsSection snapshot={snapshot} ptChart={ptChart} />
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30">
            Enter your wet-bulb + outdoor temp, then click <strong>Calculate target superheat</strong>.
          </div>
        )}

        <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">Methodology + assumptions</summary>
          <p className="mt-2">
            Target superheat values from <strong>Carrier Service Bulletin &quot;R-410A Charging — Fixed Orifice Devices&quot;</strong>. Suction saturation assumes 17°F approach between indoor WB and evaporator saturated suction (typical residential per ACCA Manual D). High-side assumes 25°F condenser approach. Actual values vary ±3-5°F by coil sizing, line set length, system age. Saturation pressures from <strong>CoolProp 7.2.0</strong> (REFPROP-compatible Helmholtz EOS).
          </p>
        </details>
      </div>
    </div>
  );
}

function ResultsSection({ snapshot, ptChart }: { snapshot: Snapshot; ptChart: PTPoint[] }) {
  const isExtreme = snapshot.targetSH === null;

  return (
    <>
      <div className="flex items-baseline gap-3">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Results</h3>
      </div>

      {/* SVG 1: WB×OD heatmap with input point */}
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <ChargingChartHeatmap snapshot={snapshot} />
      </div>

      {isExtreme ? (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
          <strong>Outside chart range.</strong> Carrier&apos;s chart does not publish a target for {snapshot.wbRow}°F WB × {snapshot.odCol}°F OD — these conditions are typically too mild for meaningful charging. Wait for design or near-design outdoor temps (≥85°F) with normal indoor humidity (≥55°F WB).
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-950/30">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Target superheat</div>
            <div className="mt-1 font-mono text-4xl font-bold text-blue-700 dark:text-blue-300">{snapshot.targetSH}°F</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Chart row {snapshot.wbRow}°F × column {snapshot.odCol}°F</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expected suction pressure</div>
            <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {snapshot.evapP ? snapshot.evapP.bubble.toFixed(1) : "—"}<span className="text-sm font-normal text-zinc-500"> PSIG</span>
            </div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">@ {snapshot.satEvapF.toFixed(0)}°F sat. evap.</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expected high-side pressure</div>
            <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {snapshot.condP ? snapshot.condP.bubble.toFixed(0) : "—"}<span className="text-sm font-normal text-zinc-500"> PSIG</span>
            </div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">@ {snapshot.satCondF.toFixed(0)}°F sat. cond.</div>
          </div>
        </div>
      )}

      {/* SVG 2: R-410A PT curve with operating points */}
      {!isExtreme && snapshot.evapP && snapshot.condP ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <R410aPTCurve snapshot={snapshot} ptChart={ptChart} />
        </div>
      ) : null}

      {/* Prose explanations */}
      <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">What every number means</h4>

        {!isExtreme ? (
          <>
            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <strong className="text-zinc-900 dark:text-zinc-100">Why {snapshot.targetSH}°F target superheat?</strong> Carrier&apos;s chart maps every operating condition to the target. At {snapshot.wbRow}°F indoor wet-bulb (which is what the evaporator &quot;sees&quot; as latent + sensible load) and {snapshot.odCol}°F outdoor dry-bulb (which determines condenser pressure), Carrier&apos;s fixed-orifice metering devices are designed to operate with <strong>{snapshot.targetSH}°F</strong> of suction superheat. Lower humidity + hot outdoor = lower superheat target (system absorbs less moisture but works harder on the high side); higher humidity + cool outdoor = higher superheat target (more latent load, larger temperature spread across coil).
            </div>

            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <strong className="text-zinc-900 dark:text-zinc-100">Why {snapshot.evapP?.bubble.toFixed(1)} PSIG expected suction?</strong> The evaporator coil operates {Math.round(snapshot.inputs.wb - snapshot.satEvapF)}°F below the indoor wet-bulb (typical residential approach). At {snapshot.satEvapF.toFixed(0)}°F saturated suction temperature, R-410A has a saturation pressure of <strong>{snapshot.evapP?.bubble.toFixed(1)} PSIG</strong>. This is what you should see on the low-side manifold gauge. Actual will vary ±3-5 PSIG by coil sizing, line set length, and system age. If you see much higher, the system is overcharged or has airflow problems; much lower indicates undercharge or restricted refrigerant flow.
            </div>

            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <strong className="text-zinc-900 dark:text-zinc-100">Why {snapshot.condP?.bubble.toFixed(0)} PSIG expected high-side?</strong> The condenser must reject heat at a temperature above ambient — typically 25°F above outdoor (the &quot;condenser approach&quot;). At {snapshot.satCondF.toFixed(0)}°F saturated condensing temperature, R-410A saturation pressure is <strong>{snapshot.condP?.bubble.toFixed(0)} PSIG</strong>. This is your discharge manifold reading. High readings suggest overcharge, restricted condenser coil, or excessive non-condensable gases. Low readings suggest undercharge or weak compressor.
            </div>

            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <strong className="text-zinc-900 dark:text-zinc-100">How to use these numbers in the field.</strong> Measure actual superheat at the suction service port: suction line temp − suction saturation temp (from your manifold pressure reading). If actual SH = {snapshot.targetSH}°F ±2°F, the system is properly charged. If higher, add refrigerant. If lower, recover refrigerant. Always verify indoor airflow first (400 CFM/ton is typical) — incorrect airflow makes superheat readings meaningless.
            </div>
          </>
        ) : (
          <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <strong className="text-zinc-900 dark:text-zinc-100">Why no target value?</strong> Carrier&apos;s chart deliberately leaves cells blank for combinations of low humidity + cool outdoor temperature. At those conditions, the evaporator coil&apos;s temperature approach is too small for superheat measurement to be meaningful, and the system should not be charged. Wait for conditions where outdoor exceeds 85°F and indoor wet-bulb is at least 55°F.
          </div>
        )}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 1: Carrier chart heatmap (WB × OD → superheat)
// ────────────────────────────────────────────────────────────────────

function superheatColor(sh: number | null): string {
  if (sh === null) return "#e4e4e7"; // gray for null
  // Color scale: cool (high SH) = blue, hot (low SH) = red
  const min = 5;
  const max = 33;
  const t = Math.max(0, Math.min(1, (sh - min) / (max - min)));
  // Interpolate from red (low) through yellow/green to blue (high)
  if (t < 0.5) {
    const r = 220;
    const g = Math.round(80 + 175 * (t * 2));
    const b = 80;
    return `rgb(${r},${g},${b})`;
  } else {
    const r = Math.round(220 - 180 * ((t - 0.5) * 2));
    const g = Math.round(180 + 25 * ((t - 0.5) * 2));
    const b = Math.round(80 + 160 * ((t - 0.5) * 2));
    return `rgb(${r},${g},${b})`;
  }
}

function ChargingChartHeatmap({ snapshot }: { snapshot: Snapshot }) {
  const width = 640;
  const height = 280;
  const padding = { top: 30, right: 100, bottom: 50, left: 80 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const cellW = innerW / OD_OPTIONS.length;
  const cellH = innerH / WB_OPTIONS.length;

  // Find user's position on the chart
  const wbIndex = WB_OPTIONS.findIndex((v) => v === snapshot.wbRow);
  const odIndex = OD_OPTIONS.findIndex((v) => v === snapshot.odCol);
  const userX = padding.left + odIndex * cellW + cellW / 2;
  const userY = padding.top + (WB_OPTIONS.length - 1 - wbIndex) * cellH + cellH / 2;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Carrier R-410A charging chart — target superheat at {snapshot.wbRow}°F WB × {snapshot.odCol}°F OD
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Carrier R-410A charging chart heatmap. At ${snapshot.wbRow}°F wet-bulb and ${snapshot.odCol}°F outdoor, target superheat is ${snapshot.targetSH ?? "out of range"}.`}
      >
        {/* Heatmap cells */}
        {WB_OPTIONS.map((wbValue, wbI) =>
          OD_OPTIONS.map((odValue, odI) => {
            const sh = SH_CHART[wbValue]?.[odValue] ?? null;
            const x = padding.left + odI * cellW;
            const y = padding.top + (WB_OPTIONS.length - 1 - wbI) * cellH;
            return (
              <g key={`${wbValue}-${odValue}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellW - 1}
                  height={cellH - 1}
                  fill={superheatColor(sh)}
                  opacity={0.85}
                />
                <text
                  x={x + cellW / 2}
                  y={y + cellH / 2 + 4}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  fill={sh === null ? "#71717a" : "#111827"}
                >
                  {sh ?? "—"}
                </text>
              </g>
            );
          })
        )}

        {/* User input marker */}
        <circle
          cx={userX}
          cy={userY}
          r="14"
          fill="none"
          stroke="#0c1525"
          strokeWidth="3"
        />
        <circle
          cx={userX}
          cy={userY}
          r="14"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* X-axis labels */}
        {OD_OPTIONS.map((odValue, odI) => (
          <text
            key={`x-${odValue}`}
            x={padding.left + odI * cellW + cellW / 2}
            y={padding.top + innerH + 16}
            fontSize="10"
            textAnchor="middle"
            fill="#71717a"
            className="dark:fill-zinc-400"
          >
            {odValue}°F
          </text>
        ))}
        <text
          x={padding.left + innerW / 2}
          y={height - 8}
          fontSize="10"
          textAnchor="middle"
          fill="#52525b"
          className="dark:fill-zinc-300"
        >
          Outdoor dry-bulb (°F)
        </text>

        {/* Y-axis labels */}
        {WB_OPTIONS.map((wbValue, wbI) => (
          <text
            key={`y-${wbValue}`}
            x={padding.left - 6}
            y={padding.top + (WB_OPTIONS.length - 1 - wbI) * cellH + cellH / 2 + 4}
            fontSize="10"
            textAnchor="end"
            fill="#71717a"
            className="dark:fill-zinc-400"
          >
            {wbValue}°F
          </text>
        ))}
        <text
          x={padding.left - 56}
          y={padding.top + innerH / 2}
          fontSize="10"
          fill="#52525b"
          transform={`rotate(-90, ${padding.left - 56}, ${padding.top + innerH / 2})`}
          textAnchor="middle"
          className="dark:fill-zinc-300"
        >
          Indoor wet-bulb (°F)
        </text>

        {/* Color legend */}
        <text x={width - padding.right + 10} y={padding.top - 6} fontSize="9" fill="#71717a" className="dark:fill-zinc-400">Target SH (°F)</text>
        {[33, 25, 15, 8].map((sh, i) => (
          <g key={`legend-${sh}`}>
            <rect x={width - padding.right + 10} y={padding.top + i * 22} width={18} height={18} fill={superheatColor(sh)} opacity={0.85} />
            <text x={width - padding.right + 33} y={padding.top + i * 22 + 13} fontSize="10" fill="#52525b" className="dark:fill-zinc-300">{sh}°F</text>
          </g>
        ))}
        <rect x={width - padding.right + 10} y={padding.top + 4 * 22} width={18} height={18} fill="#e4e4e7" />
        <text x={width - padding.right + 33} y={padding.top + 4 * 22 + 13} fontSize="10" fill="#52525b" className="dark:fill-zinc-300">N/A</text>
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Each cell shows the target superheat (°F) for that combination of indoor wet-bulb (rows) and outdoor dry-bulb (columns). Black circle marks your input position. Gray cells are operating conditions where Carrier does not publish a target — system should not be charged. Colors shift from red (low SH, hot+dry) to blue (high SH, cool+humid).
      </p>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 2: R-410A PT curve with suction + discharge operating points
// ────────────────────────────────────────────────────────────────────

function R410aPTCurve({ snapshot, ptChart }: { snapshot: Snapshot; ptChart: PTPoint[] }) {
  const width = 640;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Filter to a useful operating range
  const filtered = ptChart.filter((p) => p.tempF >= -20 && p.tempF <= 140);
  const xMin = -20;
  const xMax = 140;
  const yMin = 0;
  const yMax = Math.max(500, ...filtered.map((p) => p.bubblePsig));

  function xScale(t: number) {
    return padding.left + ((t - xMin) / (xMax - xMin)) * innerW;
  }
  function yScale(p: number) {
    return padding.top + (1 - p / yMax) * innerH;
  }

  const curvePath = filtered
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.tempF).toFixed(1)},${yScale(p.bubblePsig).toFixed(1)}`)
    .join(" ");

  const evapX = xScale(snapshot.satEvapF);
  const evapY = yScale(snapshot.evapP?.bubble ?? 0);
  const condX = xScale(snapshot.satCondF);
  const condY = yScale(snapshot.condP?.bubble ?? 0);

  const xTicks = [-20, 0, 20, 40, 60, 80, 100, 120, 140];
  const yTicks = [0, 100, 200, 300, 400, 500].filter((p) => p <= yMax);

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        R-410A saturation curve with your operating points
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`R-410A saturation pressure-temperature curve showing suction saturation at ${snapshot.satEvapF.toFixed(0)}°F and condensing saturation at ${snapshot.satCondF.toFixed(0)}°F.`}
      >
        {/* Y-axis grid */}
        {yTicks.map((p) => (
          <g key={`y-${p}`}>
            <line x1={padding.left} y1={yScale(p)} x2={width - padding.right} y2={yScale(p)} stroke="#e4e4e7" strokeDasharray="2,2" className="dark:stroke-zinc-700" />
            <text x={padding.left - 6} y={yScale(p) + 3} fontSize="9" textAnchor="end" fill="#71717a" className="dark:fill-zinc-400">{p}</text>
          </g>
        ))}
        <text x={padding.left - 40} y={padding.top + innerH / 2} fontSize="10" fill="#52525b" transform={`rotate(-90, ${padding.left - 40}, ${padding.top + innerH / 2})`} textAnchor="middle" className="dark:fill-zinc-300">Pressure (PSIG)</text>

        {/* X-axis ticks */}
        {xTicks.map((t) => (
          <g key={`x-${t}`}>
            <line x1={xScale(t)} y1={padding.top + innerH} x2={xScale(t)} y2={padding.top + innerH + 4} stroke="#71717a" className="dark:stroke-zinc-400" />
            <text x={xScale(t)} y={padding.top + innerH + 16} fontSize="10" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">{t}°F</text>
          </g>
        ))}
        <text x={padding.left + innerW / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">Saturation temperature (°F)</text>

        {/* Saturation curve */}
        <path d={curvePath} stroke="#2563eb" strokeWidth="2" fill="none" className="dark:stroke-blue-400" />

        {/* Suction (evap) operating point */}
        <line x1={evapX} y1={padding.top + innerH} x2={evapX} y2={evapY} stroke="#16a34a" strokeWidth="1" strokeDasharray="3,2" className="dark:stroke-emerald-400" />
        <line x1={padding.left} y1={evapY} x2={evapX} y2={evapY} stroke="#16a34a" strokeWidth="1" strokeDasharray="3,2" className="dark:stroke-emerald-400" />
        <circle cx={evapX} cy={evapY} r="6" fill="#16a34a" stroke="white" strokeWidth="2" className="dark:fill-emerald-500" />
        <text x={evapX + 10} y={evapY - 6} fontSize="10" fontWeight="600" fill="#15803d" className="dark:fill-emerald-300">
          Suction: {snapshot.satEvapF.toFixed(0)}°F → {snapshot.evapP?.bubble.toFixed(1)} PSIG
        </text>

        {/* Discharge (condensing) operating point */}
        <line x1={condX} y1={padding.top + innerH} x2={condX} y2={condY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,2" className="dark:stroke-red-400" />
        <line x1={padding.left} y1={condY} x2={condX} y2={condY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,2" className="dark:stroke-red-400" />
        <circle cx={condX} cy={condY} r="6" fill="#dc2626" stroke="white" strokeWidth="2" className="dark:fill-red-500" />
        <text x={condX - 10} y={condY - 6} fontSize="10" fontWeight="600" textAnchor="end" fill="#991b1b" className="dark:fill-red-300">
          Discharge: {snapshot.satCondF.toFixed(0)}°F → {snapshot.condP?.bubble.toFixed(0)} PSIG
        </text>

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Blue curve: R-410A saturation pressure as a function of temperature. Green dot: low-side (suction) operating point — what you should see on the low-side manifold gauge. Red dot: high-side (discharge) operating point — what you should see on the high-side manifold gauge. Both pressures are interpolated from CoolProp-generated R-410A data.
      </p>
    </figure>
  );
}
