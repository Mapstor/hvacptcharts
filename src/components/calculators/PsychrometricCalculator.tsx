"use client";

import { useState } from "react";
import { Calculator, Thermometer, Droplet, Wind, Mountain, BarChart3, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  computePsychrometricState,
  atmPressureAtAltitudeFt,
  type PsychrometricInputMode,
  type PsychrometricState,
} from "@/lib/psychrometrics";

type Mode = PsychrometricInputMode;

const MODE_LABELS: Record<Mode, { label: string; first: string; second: string }> = {
  DB_RH: { label: "Dry-bulb + Relative humidity", first: "DB", second: "RH" },
  DB_WB: { label: "Dry-bulb + Wet-bulb", first: "DB", second: "WB" },
  DB_DP: { label: "Dry-bulb + Dew point", first: "DB", second: "DP" },
  WB_DP: { label: "Wet-bulb + Dew point", first: "WB", second: "DP" },
};

const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const r0 = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "—");
const r4 = (n: number) => (Number.isFinite(n) ? n.toFixed(4) : "—");

type Snapshot = {
  mode: Mode;
  state: PsychrometricState;
  pAtm: number;
  altitudeFt: number;
};

export function PsychrometricCalculator() {
  const [mode, setMode] = useState<Mode>("DB_RH");
  const [tempDb, setTempDb] = useState("78");
  const [tempWb, setTempWb] = useState("65");
  const [rh, setRh] = useState("50");
  const [tempDp, setTempDp] = useState("57");
  const [altitudeFt, setAltitudeFt] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const showFirst = MODE_LABELS[mode].first;
  const showSecond = MODE_LABELS[mode].second;

  function handleCalculate() {
    const pAtm = atmPressureAtAltitudeFt(Number(altitudeFt) || 0);
    const inputs = {
      mode,
      tempDbF: Number(tempDb),
      tempWbF: Number(tempWb),
      rhPercent: Number(rh),
      tempDpF: Number(tempDp),
      pAtmPsia: pAtm,
    };
    const state = computePsychrometricState(inputs);
    if (!state) return;
    setSnapshot({ mode, state, pAtm, altitudeFt: Number(altitudeFt) || 0 });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Psychrometric calculator — 7 air properties from any 2 inputs
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label htmlFor="psy-mode" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              1. Which two properties do you have?
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">Any two independent properties define the air state. Pick the pair you can measure.</p>
            <select
              id="psy-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {Object.entries(MODE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="psy-first" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <Thermometer className="h-4 w-4 text-blue-600" /> 2. {showFirst === "DB" ? "Dry-bulb temperature (°F)" : showFirst === "WB" ? "Wet-bulb temperature (°F)" : "Dew point (°F)"}
              </label>
              <input
                id="psy-first"
                type="number"
                step={0.1}
                value={showFirst === "DB" ? tempDb : showFirst === "WB" ? tempWb : tempDp}
                onChange={(e) => {
                  const v = e.target.value;
                  if (showFirst === "DB") setTempDb(v);
                  else if (showFirst === "WB") setTempWb(v);
                  else setTempDp(v);
                }}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="psy-second" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {showSecond === "RH" ? <Droplet className="h-4 w-4 text-blue-600" /> : <Thermometer className="h-4 w-4 text-blue-600" />}
                3. {showSecond === "RH" ? "Relative humidity (%)" : showSecond === "WB" ? "Wet-bulb temperature (°F)" : "Dew point (°F)"}
              </label>
              <input
                id="psy-second"
                type="number"
                step={0.1}
                value={showSecond === "RH" ? rh : showSecond === "WB" ? tempWb : tempDp}
                onChange={(e) => {
                  const v = e.target.value;
                  if (showSecond === "RH") setRh(v);
                  else if (showSecond === "WB") setTempWb(v);
                  else setTempDp(v);
                }}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-blue-700 dark:text-zinc-300 dark:hover:text-blue-300">
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Advanced — non-standard altitude
            </button>
            {showAdvanced ? (
              <div className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <label htmlFor="psy-alt" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  <Mountain className="h-4 w-4 text-zinc-600" /> Altitude (ft)
                </label>
                <input
                  id="psy-alt"
                  type="number"
                  step={50}
                  value={altitudeFt}
                  onChange={(e) => setAltitudeFt(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
                <p className="mt-1 text-xs text-zinc-500">Atmospheric pressure: <strong className="font-mono">{r2(atmPressureAtAltitudeFt(Number(altitudeFt) || 0))} psia</strong> (sea level = 14.696)</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={handleCalculate} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
              <Calculator className="h-5 w-5" /> Calculate psychrometric state <ArrowRight className="h-4 w-4" />
            </button>
            {snapshot ? <span className="text-xs text-zinc-500">Adjust inputs and click Calculate again to update.</span> : null}
          </div>
        </div>

        {/* RESULTS */}
        {snapshot ? (
          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <ResultsSection snapshot={snapshot} />
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30">
            Select your input pair, enter values, then click <strong>Calculate psychrometric state</strong>.
          </div>
        )}

        <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">Methodology + equations</summary>
          <p className="mt-2">
            Equations: <strong>ASHRAE Handbook of Fundamentals 2021, Chapter 1</strong>. Saturation vapor pressure via Magnus form (±0.3% in HVAC range). Wet-bulb solved by bisection of the psychrometric equation. Humidity ratio: W = 0.622 × (Pw / (P − Pw)). Enthalpy: h = 0.240 × T + W × (1061 + 0.444 × T) BTU/lb dry air. Standard atmosphere model for altitude correction.
          </p>
        </details>
      </div>
    </div>
  );
}

const COMFORT_ZONE = { dbMin: 68, dbMax: 78, hrMin: 0.004, hrMax: 0.012 }; // ASHRAE 55 winter+summer envelope, lb H₂O/lb dry air

function ResultsSection({ snapshot }: { snapshot: Snapshot }) {
  const { state, mode } = snapshot;
  const inComfort = state.tempDbF >= COMFORT_ZONE.dbMin && state.tempDbF <= COMFORT_ZONE.dbMax && state.humidityRatio >= COMFORT_ZONE.hrMin && state.humidityRatio <= COMFORT_ZONE.hrMax;

  return (
    <>
      <div className="flex items-baseline gap-3">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Results</h3>
      </div>

      {/* SVG 1: psychrometric chart */}
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <PsychrometricChart snapshot={snapshot} />
      </div>

      {/* Computed properties grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Stat label="Dry-bulb" value={`${r1(state.tempDbF)}°F`} sub="primary temperature" />
        <Stat label="Wet-bulb" value={`${r1(state.tempWbF)}°F`} sub="evap-cooled" highlight={mode !== "DB_WB" && mode !== "WB_DP"} />
        <Stat label="Dew point" value={`${r1(state.tempDpF)}°F`} sub="condensation threshold" highlight={mode !== "DB_DP" && mode !== "WB_DP"} />
        <Stat label="Relative humidity" value={`${r1(state.rhPercent)}%`} sub="Pw / Pws @ DB" highlight={mode !== "DB_RH"} />
        <Stat label="Humidity ratio" value={r4(state.humidityRatio)} sub="lb H₂O / lb dry air" />
        <Stat label="Grains H₂O" value={r1(state.grainsPerLb)} sub="gr / lb dry air" />
        <Stat label="Enthalpy" value={r2(state.enthalpyBtuPerLb)} sub="BTU / lb dry air" />
        <Stat label="Specific volume" value={r2(state.specificVolumeFt3PerLb)} sub="ft³ / lb dry air" />
      </div>

      {/* Comfort status banner */}
      <div className={`mt-4 rounded-md border p-3 text-sm ${inComfort ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/20" : "border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20"}`}>
        <strong>{inComfort ? "Within ASHRAE 55 thermal comfort envelope." : "Outside ASHRAE 55 thermal comfort envelope."}</strong>{" "}
        {inComfort
          ? `At ${r1(state.tempDbF)}°F DB and ${r1(state.rhPercent)}% RH, this state falls inside the comfort envelope for sedentary occupants in summer + winter clothing.`
          : `At ${r1(state.tempDbF)}°F DB and ${r1(state.rhPercent)}% RH, this state is outside the comfort envelope. ${state.tempDbF > COMFORT_ZONE.dbMax ? "Temperature is too high. " : state.tempDbF < COMFORT_ZONE.dbMin ? "Temperature is too low. " : ""}${state.humidityRatio > COMFORT_ZONE.hrMax ? "Humidity is too high (dehumidification needed). " : state.humidityRatio < COMFORT_ZONE.hrMin ? "Humidity is too low (humidification needed). " : ""}`}
      </div>

      {/* SVG 2: property comparison bars */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <PropertyComparison snapshot={snapshot} />
      </div>

      {/* Prose explanations */}
      <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">What every property means</h4>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Dry-bulb {r1(state.tempDbF)}°F.</strong> What a standard thermometer reads. The primary temperature most people refer to. Drives sensible heat transfer (warming + cooling without moisture change).
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Wet-bulb {r1(state.tempWbF)}°F.</strong> Lowest temperature achievable by evaporative cooling. Always ≤ DB; equals DB only at 100% RH. Wet-bulb drives evaporator coil sizing (the coil pulls suction temperature ~17°F below WB in residential design). Lower WB = drier air = more cooling capacity per CFM.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Dew point {r1(state.tempDpF)}°F.</strong> Temperature at which water vapor condenses. Cool any surface below this and you&apos;ll see condensation. Critical for: (1) evaporator coil sizing (cooling below DP = dehumidification), (2) window selection (low-E coating below DP causes condensation), (3) duct insulation (uninsulated supply ducts in humid attics sweat when surface is below DP).
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Relative humidity {r1(state.rhPercent)}%.</strong> Ratio of actual water vapor pressure to saturation vapor pressure at this DB. RH is what consumers think about (comfort: 30-60% per ASHRAE 55). RH depends on BOTH humidity ratio AND temperature — same humidity ratio at warmer DB = lower RH (warm air can hold more water). This is why heating dry air doesn&apos;t add moisture but reduces RH.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Humidity ratio {r4(state.humidityRatio)} lb H₂O / lb dry air.</strong> Actual mass of water vapor per pound of dry air. The TRUE measure of how much water is in the air, independent of temperature. Cooling air doesn&apos;t change W unless it drops below DP. {r1(state.grainsPerLb)} grains per pound is the same value expressed in the traditional HVAC unit (1 pound = 7000 grains).
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Enthalpy {r2(state.enthalpyBtuPerLb)} BTU / lb dry air.</strong> Total energy content per pound of dry air, combining sensible (temperature) and latent (moisture) energy. Cooling capacity is the enthalpy DIFFERENCE between supply and return air × airflow. Total room load = (return enthalpy − supply enthalpy) × CFM × 4.5.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Specific volume {r2(state.specificVolumeFt3PerLb)} ft³ / lb dry air.</strong> Volume occupied by one pound of dry air (plus its moisture). Used to convert volumetric (CFM) to mass (lb/min) airflow. Warmer + more humid air has higher specific volume (lower density). This is why high-altitude installations need duct sizing adjustment — lower density means less mass moves per CFM, reducing heat capacity.
        </div>

        {snapshot.altitudeFt > 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <strong className="text-zinc-900 dark:text-zinc-100">Altitude {snapshot.altitudeFt} ft.</strong> Atmospheric pressure is {r2(snapshot.pAtm)} psia at this altitude (sea level = 14.696 psia). Lower pressure shifts the saturation vapor curve, so the same humidity ratio gives a slightly different RH at altitude. HVAC design at altitudes above 2,000 ft should always use altitude-corrected psychrometrics.
          </div>
        ) : null}
      </div>
    </>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "border-blue-300 bg-blue-50/50 dark:border-blue-700/60 dark:bg-blue-950/20" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"}`}>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="mt-0.5 text-[10px] text-zinc-500">{sub}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 1: Psychrometric chart with user's point
// ────────────────────────────────────────────────────────────────────

function PsychrometricChart({ snapshot }: { snapshot: Snapshot }) {
  const { state } = snapshot;
  const width = 640;
  const height = 320;
  const padding = { top: 20, right: 50, bottom: 50, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const dbMin = 40;
  const dbMax = 110;
  const wMin = 0;
  const wMax = 0.030;

  function xScale(db: number) { return padding.left + ((db - dbMin) / (dbMax - dbMin)) * innerW; }
  function yScale(w: number) { return padding.top + (1 - (w - wMin) / (wMax - wMin)) * innerH; }

  // Saturation curve (W vs DB)
  function satW(tF: number): number {
    // Simplified saturation humidity ratio via Magnus
    const tC = (tF - 32) * 5 / 9;
    const Pws_kPa = 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3)); // kPa
    const Pws_psi = Pws_kPa * 0.145038;
    const P = snapshot.pAtm;
    const Pw = Math.min(Pws_psi, P * 0.99);
    return 0.622 * Pw / (P - Pw);
  }

  const satPoints: Array<[number, number]> = [];
  for (let t = dbMin; t <= dbMax; t += 1) {
    const w = satW(t);
    if (w <= wMax) satPoints.push([t, w]);
  }
  const satPath = satPoints.map(([t, w], i) => `${i === 0 ? "M" : "L"}${xScale(t).toFixed(1)},${yScale(w).toFixed(1)}`).join(" ");

  // RH curves: 20, 40, 60, 80%
  const rhCurves = [20, 40, 60, 80];

  // User point
  const userX = xScale(state.tempDbF);
  const userY = yScale(state.humidityRatio);

  // Comfort zone rectangle (ASHRAE 55 simplified)
  const cx1 = xScale(COMFORT_ZONE.dbMin);
  const cx2 = xScale(COMFORT_ZONE.dbMax);
  const cy1 = yScale(COMFORT_ZONE.hrMax);
  const cy2 = yScale(COMFORT_ZONE.hrMin);

  const xTicks = [40, 50, 60, 70, 80, 90, 100, 110];
  const yTicks = [0.000, 0.005, 0.010, 0.015, 0.020, 0.025, 0.030];

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Psychrometric chart — your air state at {r1(state.tempDbF)}°F DB / {r1(state.rhPercent)}% RH
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={`Psychrometric chart showing air state at ${r1(state.tempDbF)}°F dry-bulb and ${r1(state.rhPercent)}% relative humidity.`}>
        {/* Comfort zone */}
        <rect x={cx1} y={cy1} width={cx2 - cx1} height={cy2 - cy1} fill="#dcfce7" opacity={0.6} className="dark:fill-emerald-900/30" />
        <text x={(cx1 + cx2) / 2} y={cy1 + 12} fontSize="9" textAnchor="middle" fill="#15803d" className="dark:fill-emerald-300">ASHRAE 55 comfort</text>

        {/* Y-axis grid */}
        {yTicks.map((w) => (
          <g key={`y-${w}`}>
            <line x1={padding.left} y1={yScale(w)} x2={width - padding.right} y2={yScale(w)} stroke="#e4e4e7" strokeDasharray="2,2" className="dark:stroke-zinc-700" />
            <text x={padding.left - 6} y={yScale(w) + 3} fontSize="9" textAnchor="end" fill="#71717a" className="dark:fill-zinc-400">{w.toFixed(3)}</text>
          </g>
        ))}
        <text x={padding.left - 42} y={padding.top + innerH / 2} fontSize="10" fill="#52525b" transform={`rotate(-90, ${padding.left - 42}, ${padding.top + innerH / 2})`} textAnchor="middle" className="dark:fill-zinc-300">Humidity ratio (lb H₂O / lb dry air)</text>

        {/* X-axis ticks */}
        {xTicks.map((t) => (
          <g key={`x-${t}`}>
            <line x1={xScale(t)} y1={padding.top + innerH} x2={xScale(t)} y2={padding.top + innerH + 4} stroke="#71717a" className="dark:stroke-zinc-400" />
            <text x={xScale(t)} y={padding.top + innerH + 16} fontSize="10" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">{t}°F</text>
          </g>
        ))}
        <text x={padding.left + innerW / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">Dry-bulb temperature (°F)</text>

        {/* RH curves (fraction of saturation curve) */}
        {rhCurves.map((rhVal) => {
          const points: Array<[number, number]> = [];
          for (let t = dbMin; t <= dbMax; t += 1) {
            const wsat = satW(t);
            const w = wsat * (rhVal / 100);
            if (w <= wMax) points.push([t, w]);
          }
          const path = points.map(([t, w], i) => `${i === 0 ? "M" : "L"}${xScale(t).toFixed(1)},${yScale(w).toFixed(1)}`).join(" ");
          const last = points[points.length - 1];
          return (
            <g key={`rh-${rhVal}`}>
              <path d={path} stroke="#a78bfa" strokeWidth="1" strokeDasharray="3,2" fill="none" opacity={0.7} className="dark:stroke-violet-400" />
              {last ? <text x={xScale(last[0]) - 4} y={yScale(last[1]) - 4} fontSize="8" fill="#7c3aed" textAnchor="end" className="dark:fill-violet-300">{rhVal}% RH</text> : null}
            </g>
          );
        })}

        {/* Saturation curve (100% RH) */}
        <path d={satPath} stroke="#2563eb" strokeWidth="2" fill="none" className="dark:stroke-blue-400" />
        <text x={width - padding.right - 4} y={yScale(satW(dbMax)) + 12} fontSize="9" fill="#1e40af" textAnchor="end" className="dark:fill-blue-300">100% (saturation)</text>

        {/* User point */}
        <circle cx={userX} cy={userY} r="8" fill="#dc2626" stroke="white" strokeWidth="2" className="dark:fill-red-500" />
        <text x={userX + 12} y={userY + 4} fontSize="10" fontWeight="600" fill="#991b1b" className="dark:fill-red-300">{r1(state.tempDbF)}°F / {r1(state.rhPercent)}% RH</text>

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Blue curve: 100% RH saturation line (impossible to exceed). Purple dashed lines: 20/40/60/80% RH. Green zone: ASHRAE 55 thermal comfort envelope. Red dot: your air state. Cooling moves the point left at constant W until it hits the saturation curve (dew point), then follows the curve downward as moisture condenses out.
      </p>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 2: Property comparison vs comfort range
// ────────────────────────────────────────────────────────────────────

function PropertyComparison({ snapshot }: { snapshot: Snapshot }) {
  const { state } = snapshot;
  const width = 640;
  const height = 220;

  const bars = [
    { label: "Dry-bulb (°F)", value: state.tempDbF, comfort: [68, 78], min: 40, max: 100 },
    { label: "Wet-bulb (°F)", value: state.tempWbF, comfort: [55, 67], min: 30, max: 85 },
    { label: "Dew point (°F)", value: state.tempDpF, comfort: [45, 65], min: 20, max: 75 },
    { label: "Relative humidity (%)", value: state.rhPercent, comfort: [30, 60], min: 0, max: 100 },
    { label: "Enthalpy (BTU/lb)", value: state.enthalpyBtuPerLb, comfort: [20, 30], min: 10, max: 50 },
  ];

  const padding = { top: 10, right: 100, bottom: 10, left: 140 };
  const innerW = width - padding.left - padding.right;
  const barH = 28;
  const gap = 8;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">Your air state vs. typical comfort ranges</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Property comparison bars showing your air state vs typical comfort ranges">
        {bars.map((bar, i) => {
          const y = padding.top + i * (barH + gap);
          const xScale = (v: number) => padding.left + ((v - bar.min) / (bar.max - bar.min)) * innerW;
          const comfortX1 = xScale(bar.comfort[0]);
          const comfortX2 = xScale(bar.comfort[1]);
          const valueX = xScale(bar.value);
          const inRange = bar.value >= bar.comfort[0] && bar.value <= bar.comfort[1];
          return (
            <g key={bar.label}>
              <text x={padding.left - 8} y={y + barH / 2 + 4} fontSize="11" textAnchor="end" fill="#52525b" className="dark:fill-zinc-300">{bar.label}</text>
              {/* Background bar */}
              <rect x={padding.left} y={y + 8} width={innerW} height={barH - 16} fill="#f4f4f5" rx={3} className="dark:fill-zinc-800" />
              {/* Comfort range */}
              <rect x={comfortX1} y={y + 6} width={comfortX2 - comfortX1} height={barH - 12} fill="#bbf7d0" opacity={0.6} rx={2} className="dark:fill-emerald-800/40" />
              {/* Value marker */}
              <circle cx={valueX} cy={y + barH / 2} r="7" fill={inRange ? "#16a34a" : "#dc2626"} stroke="white" strokeWidth="2" />
              <text x={valueX} y={y + barH / 2 - 12} fontSize="10" fontWeight="600" textAnchor="middle" fill={inRange ? "#15803d" : "#991b1b"}>{r1(bar.value)}</text>
              {/* Range labels */}
              <text x={padding.left + innerW + 8} y={y + barH / 2 + 4} fontSize="9" fill="#71717a" className="dark:fill-zinc-400">{bar.comfort[0]}–{bar.comfort[1]} typical</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Green ranges: typical comfort/design targets (ASHRAE 55, design conditions). Green dot: your value is within range. Red dot: your value is outside the typical range — usually means heating, cooling, humidification, or dehumidification needed.
      </p>
    </figure>
  );
}
