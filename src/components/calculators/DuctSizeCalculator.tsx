"use client";

import { useState } from "react";
import { Calculator, Wind, Gauge, Mountain, Thermometer, ChevronDown, ChevronUp, BarChart3, ArrowRight } from "lucide-react";
import {
  sizeDuct,
  velocityFpm,
  frictionLossPerHundredFt,
  airDensity,
  APPLICATION_PRESETS,
  type ApplicationPreset,
  type DuctSizingResult,
} from "@/lib/duct-sizing";

const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const r0 = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "—");
const r3 = (n: number) => (Number.isFinite(n) ? n.toFixed(3) : "—");

type Snapshot = {
  presetLabel: string;
  presetMaxVelocity: number;
  presetNotes: string;
  cfm: number;
  frictionTarget: number;
  altitudeFt: number;
  tempF: number;
  result: DuctSizingResult;
};

const STATUS_COPY = {
  ok: { tone: "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-900/20", label: "Sized correctly" },
  elevated: { tone: "border-amber-300 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-900/20", label: "Approaching velocity limit" },
  exceeds: { tone: "border-red-300 bg-red-50/60 dark:border-red-700/60 dark:bg-red-900/20", label: "Exceeds velocity limit — upsize duct" },
};

export function DuctSizeCalculator() {
  // Form state
  const [presetId, setPresetId] = useState<string>("res-supply-trunk");
  const [cfm, setCfm] = useState("400");
  const [frictionOverride, setFrictionOverride] = useState("");
  const [altitudeFt, setAltitudeFt] = useState("0");
  const [tempF, setTempF] = useState("70");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Snapshot of computed results — only set when Calculate is clicked
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const preset: ApplicationPreset = APPLICATION_PRESETS.find((p) => p.id === presetId) ?? APPLICATION_PRESETS[0];
  const friction = frictionOverride === "" ? preset.friction : Number(frictionOverride);

  function handleCalculate() {
    const cfmN = Number(cfm);
    const tempFN = Number(tempF) || 70;
    const altFN = Number(altitudeFt) || 0;
    if (cfmN <= 0 || friction <= 0) return;
    const result = sizeDuct({
      cfm: cfmN,
      frictionTarget: friction,
      tempF: tempFN,
      altitudeFt: altFN,
      maxVelocity: preset.maxVelocity,
    });
    if (!result) return;
    setSnapshot({
      presetLabel: preset.label,
      presetMaxVelocity: preset.maxVelocity,
      presetNotes: preset.notes,
      cfm: cfmN,
      frictionTarget: friction,
      altitudeFt: altFN,
      tempF: tempFN,
      result,
    });
  }

  const status = snapshot?.result.velocityWarning ? STATUS_COPY[snapshot.result.velocityWarning] : null;
  const previewDensity = airDensity(Number(tempF) || 70, Number(altitudeFt) || 0);

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Duct size calculator — equal-friction method
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* ─────────────────────────── FORM ─────────────────────────── */}
        <div className="space-y-4">
          {/* Application preset */}
          <div>
            <label htmlFor="duct-preset" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              1. Application
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">Determines target friction rate and maximum velocity per ACCA Manual D / SMACNA.</p>
            <select
              id="duct-preset"
              value={presetId}
              onChange={(e) => { setPresetId(e.target.value); setFrictionOverride(""); }}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {APPLICATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label} — {r2(p.friction)} in.w.c./100ft, max {p.maxVelocity} fpm</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs italic text-zinc-600 dark:text-zinc-400">{preset.notes}</p>
          </div>

          {/* Primary inputs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="duct-cfm" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <Wind className="h-4 w-4 text-blue-600" /> 2. Airflow (CFM)
              </label>
              <p className="mt-0.5 text-xs text-zinc-500">Cubic feet per minute for this duct run.</p>
              <input
                id="duct-cfm"
                type="number"
                step={10}
                min={1}
                value={cfm}
                onChange={(e) => setCfm(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="duct-friction" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <Gauge className="h-4 w-4 text-blue-600" /> 3. Target friction (in.w.c./100ft)
              </label>
              <p className="mt-0.5 text-xs text-zinc-500">Leave blank to use preset default ({preset.friction}).</p>
              <input
                id="duct-friction"
                type="number"
                step={0.01}
                min={0.01}
                placeholder={`${preset.friction}`}
                value={frictionOverride}
                onChange={(e) => setFrictionOverride(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-base dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          {/* Advanced (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-blue-700 dark:text-zinc-300 dark:hover:text-blue-300"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Advanced — non-standard altitude or temperature
            </button>
            {showAdvanced ? (
              <div className="mt-2 grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div>
                  <label htmlFor="duct-alt" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <Mountain className="h-4 w-4 text-zinc-600" /> Altitude (ft)
                  </label>
                  <input
                    id="duct-alt"
                    type="number"
                    step={100}
                    value={altitudeFt}
                    onChange={(e) => setAltitudeFt(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label htmlFor="duct-temp" className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <Thermometer className="h-4 w-4 text-zinc-600" /> Air temp (°F)
                  </label>
                  <input
                    id="duct-temp"
                    type="number"
                    step={5}
                    value={tempF}
                    onChange={(e) => setTempF(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <div className="sm:col-span-2 text-xs text-zinc-500">
                  Resulting air density: <strong className="font-mono">{r3(previewDensity)} lb/ft³</strong> (standard = 0.075 at 70°F + sea level).
                </div>
              </div>
            ) : null}
          </div>

          {/* Calculate button */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              <Calculator className="h-5 w-5" />
              Calculate duct size
              <ArrowRight className="h-4 w-4" />
            </button>
            {snapshot ? (
              <span className="text-xs text-zinc-500">Adjust inputs above and click Calculate again to update.</span>
            ) : null}
          </div>
        </div>

        {/* ─────────────────────────── RESULTS ─────────────────────────── */}
        {snapshot ? (
          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <ResultsSection snapshot={snapshot} status={status} />
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30">
            Enter your airflow + application, then click <strong>Calculate duct size</strong>.
          </div>
        )}

        {/* ─────────────────────────── METHODOLOGY ─────────────────────────── */}
        <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">Methodology + equations</summary>
          <p className="mt-2">
            Equal-friction method per <strong>ACCA Manual D / ASHRAE Handbook of Fundamentals 2021 Ch. 21</strong>. Friction equation: <code className="font-mono">ΔP/100ft = 0.0307 × (V/100)^1.9 / D^1.22</code> (galvanized steel, ε = 0.0003 ft). Velocity: <code className="font-mono">V = 576 × Q / (π × D²)</code>. Huebscher rectangular equivalent: <code className="font-mono">D_eq = 1.30 × (a·b)^0.625 / (a+b)^0.25</code>. Standard round duct sizes per SMACNA HVAC Duct Construction Standards. Aspect ratios over 4:1 are excluded — Manual D notes they suffer friction penalties beyond Huebscher prediction.
          </p>
        </details>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Results section — SVG chart + summary cards + prose explanations
// ────────────────────────────────────────────────────────────────────

function ResultsSection({ snapshot, status }: { snapshot: Snapshot; status: typeof STATUS_COPY[keyof typeof STATUS_COPY] | null }) {
  const r = snapshot.result;
  const overTarget = r.frictionAtStandard - snapshot.frictionTarget;
  const overTargetPct = (overTarget / snapshot.frictionTarget) * 100;
  const velocityHeadroomPct = ((snapshot.presetMaxVelocity - r.velocityAtStandard) / snapshot.presetMaxVelocity) * 100;

  return (
    <>
      {/* Headline result */}
      <div className="flex items-baseline gap-3">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Results</h3>
      </div>

      {/* SVG visualization */}
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <DuctFrictionChart snapshot={snapshot} />
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-950/30">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Standard round duct</div>
          <div className="mt-1 font-mono text-4xl font-bold text-blue-700 dark:text-blue-300">{r.standardDiameter}″</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Calculated exact diameter: {r1(r.exactDiameter)}″</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Air velocity</div>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{r0(r.velocityAtStandard)}<span className="text-sm font-normal text-zinc-500"> fpm</span></div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Limit: {snapshot.presetMaxVelocity} fpm ({r0(velocityHeadroomPct)}% headroom)</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Actual friction loss</div>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{r3(r.frictionAtStandard)}<span className="text-sm font-normal text-zinc-500"> in.w.c./100ft</span></div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Target: {r2(snapshot.frictionTarget)} ({overTarget < 0 ? `${r0(Math.abs(overTargetPct))}% below` : `${r0(overTargetPct)}% above`})</div>
        </div>
      </div>

      {/* Status banner */}
      {status ? (
        <div className={`mt-3 rounded-md border p-3 text-sm ${status.tone}`}>
          <strong>{status.label}.</strong>{" "}
          {r.velocityWarning === "exceeds" && `At ${r0(r.velocityAtStandard)} fpm, velocity exceeds the ${snapshot.presetMaxVelocity} fpm limit for ${snapshot.presetLabel.toLowerCase()} systems. Upsize to the next standard round duct (${nextStandardDuct(r.standardDiameter)}″) to bring velocity below the limit + reduce noise + reduce static pressure losses.`}
          {r.velocityWarning === "elevated" && `Velocity is within 10% of the ${snapshot.presetMaxVelocity} fpm limit for ${snapshot.presetLabel.toLowerCase()}. Acceptable per the equal-friction method, but consider upsizing for quieter operation.`}
          {r.velocityWarning === "ok" && `Velocity sits comfortably below the ${snapshot.presetMaxVelocity} fpm limit for ${snapshot.presetLabel.toLowerCase()} systems.`}
        </div>
      ) : null}

      {/* Rectangular equivalents */}
      {r.rectangularEquivalents.length > 0 ? (
        <div className="mt-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Rectangular equivalents (same friction at same CFM — Huebscher equation)
          </h4>
          <p className="mt-0.5 text-xs text-zinc-500">Useful when ceiling height or framing width forces a non-round duct shape.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {r.rectangularEquivalents.map((re) => (
              <div key={`${re.width}x${re.height}`} className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
                <div className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">{re.width}″ × {re.height}″</div>
                <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">Aspect ratio {r1(re.aspectRatio)}:1 · Equivalent round {r1(re.equivDiameter)}″</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Prose explanations */}
      <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">What every number means</h4>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why {r.standardDiameter}″ round?</strong> The exact mathematical diameter for {snapshot.cfm} CFM at {r2(snapshot.frictionTarget)} in.w.c./100ft target friction is <strong>{r1(r.exactDiameter)}″</strong>. Standard sheet-metal sizes per SMACNA come in even-inch increments (4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20...), so we round UP to the next standard size — <strong>{r.standardDiameter}″</strong>. Rounding down would exceed your friction target; rounding up gives you a small margin of safety.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why {r0(r.velocityAtStandard)} fpm at the standard size?</strong> Air velocity is determined by CFM divided by cross-sectional area: V = 576 × Q / (π × D²). For {snapshot.cfm} CFM through a {r.standardDiameter}″ round duct, velocity = 576 × {snapshot.cfm} / (π × {r.standardDiameter}²) = <strong>{r0(r.velocityAtStandard)} fpm</strong>. The {snapshot.presetLabel.toLowerCase()} preset limits velocity to {snapshot.presetMaxVelocity} fpm to control noise + minimize register throw issues + keep system static pressure manageable. Your design sits {r0(velocityHeadroomPct)}% below that ceiling.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why {r3(r.frictionAtStandard)} in.w.c./100ft actual friction?</strong> When you round up from {r1(r.exactDiameter)}″ to {r.standardDiameter}″, the actual duct has more cross-sectional area than the mathematical minimum, so air moves more slowly + creates less friction. Actual friction at {r.standardDiameter}″ is <strong>{r3(r.frictionAtStandard)} in.w.c./100ft</strong>, which is {overTarget < 0 ? `${r0(Math.abs(overTargetPct))}% BELOW` : `${r0(overTargetPct)}% above`} your {r2(snapshot.frictionTarget)} target. {overTarget < 0 ? "Lower than target is good — it gives you headroom for fittings + accessories that add additional pressure drop." : "Slightly above target — typically fine, but watch your Total External Static Pressure budget."}
        </div>

        {r.rectangularEquivalents.length > 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <strong className="text-zinc-900 dark:text-zinc-100">Why the rectangular equivalents?</strong> Same airflow + same friction loss, just different shape. The Huebscher equation (ASHRAE Handbook Ch. 21) gives the round diameter that creates the same friction as a rectangular duct of given width + height. The {r.standardDiameter}″ round is the friction baseline; the rectangular options give you the same performance when shape is constrained by joists, ceiling cavities, or chase dimensions. Aspect ratios above 4:1 are intentionally not shown — Manual D notes those suffer friction penalties beyond what Huebscher predicts.
          </div>
        ) : null}

        {snapshot.altitudeFt > 0 || snapshot.tempF !== 70 ? (
          <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <strong className="text-zinc-900 dark:text-zinc-100">Why the density adjustment?</strong> Standard air density is 0.075 lb/ft³ at sea level + 70°F. At your specified altitude ({snapshot.altitudeFt} ft) + temperature ({snapshot.tempF}°F), air density is <strong>{r3(r.density)} lb/ft³</strong>. Friction loss scales linearly with density, so the calculation adjusts target diameter accordingly. Thinner air (high altitude, hot temp) = lower friction per fpm but reduced cooling/heating capacity per CFM.
          </div>
        ) : null}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG friction chart
// ────────────────────────────────────────────────────────────────────

function nextStandardDuct(currentSize: number): number {
  const sizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 42, 48];
  const next = sizes.find((s) => s > currentSize);
  return next ?? currentSize + 2;
}

function DuctFrictionChart({ snapshot }: { snapshot: Snapshot }) {
  const r = snapshot.result;

  // Chart dimensions
  const width = 640;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // X-axis: diameter range, dynamically centered around the standard size
  const xMin = Math.max(4, r.standardDiameter - 8);
  const xMax = Math.min(48, r.standardDiameter + 12);

  // Y-axis: friction loss, log scale
  const yMin = 0.01;
  const yMax = 1.0;

  function xScale(d: number) {
    return padding.left + ((d - xMin) / (xMax - xMin)) * innerW;
  }
  function yScale(f: number) {
    const logF = Math.log10(Math.max(f, yMin));
    const logMin = Math.log10(yMin);
    const logMax = Math.log10(yMax);
    return padding.top + (1 - (logF - logMin) / (logMax - logMin)) * innerH;
  }

  // Compute friction curve at user's CFM across diameter range
  const curvePoints: Array<[number, number]> = [];
  const step = 0.2;
  for (let d = xMin; d <= xMax; d += step) {
    const v = velocityFpm(snapshot.cfm, d);
    const f = frictionLossPerHundredFt(d, v, r.density);
    if (f > 0 && Number.isFinite(f)) {
      curvePoints.push([d, f]);
    }
  }
  const curvePath = curvePoints
    .map(([d, f], i) => `${i === 0 ? "M" : "L"}${xScale(d).toFixed(1)},${yScale(Math.min(Math.max(f, yMin), yMax)).toFixed(1)}`)
    .join(" ");

  // X-axis ticks (standard sizes within range)
  const xTicks = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36].filter((d) => d >= xMin && d <= xMax);

  // Y-axis ticks (log scale)
  const yTicks = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];

  // Compute velocity-limit-equivalent diameter
  const minDForVelocity = Math.sqrt((576 * snapshot.cfm) / (Math.PI * snapshot.presetMaxVelocity));
  const showVelocityZone = minDForVelocity >= xMin && minDForVelocity <= xMax;

  // Target friction at standard diameter
  const stdX = xScale(r.standardDiameter);
  const stdY = yScale(Math.min(Math.max(r.frictionAtStandard, yMin), yMax));
  const exactX = xScale(r.exactDiameter);
  const exactY = yScale(Math.min(Math.max(snapshot.frictionTarget, yMin), yMax));
  const targetY = yScale(snapshot.frictionTarget);

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Friction loss vs duct diameter at {snapshot.cfm} CFM
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Friction loss chart for ${snapshot.cfm} CFM. Standard duct size ${r.standardDiameter} inches gives ${r3(r.frictionAtStandard)} in.w.c. per 100 ft friction.`}
      >
        {/* Velocity-limit zone (left of min diameter) */}
        {showVelocityZone ? (
          <rect
            x={padding.left}
            y={padding.top}
            width={xScale(minDForVelocity) - padding.left}
            height={innerH}
            fill="#fef2f2"
            opacity={0.6}
            className="dark:fill-red-950/30"
          />
        ) : null}
        {showVelocityZone ? (
          <text
            x={padding.left + 4}
            y={padding.top + 14}
            fontSize="9"
            fill="#991b1b"
            className="dark:fill-red-300"
          >
            exceeds {snapshot.presetMaxVelocity} fpm velocity limit
          </text>
        ) : null}

        {/* Y-axis grid + ticks */}
        {yTicks.map((y) => (
          <g key={`y-${y}`}>
            <line
              x1={padding.left}
              y1={yScale(y)}
              x2={width - padding.right}
              y2={yScale(y)}
              stroke="#e4e4e7"
              strokeDasharray="2,2"
              className="dark:stroke-zinc-700"
            />
            <text
              x={padding.left - 6}
              y={yScale(y) + 3}
              fontSize="9"
              textAnchor="end"
              fill="#71717a"
              className="dark:fill-zinc-400"
            >
              {y < 0.1 ? y.toFixed(2) : y.toFixed(1)}
            </text>
          </g>
        ))}
        <text
          x={padding.left - 38}
          y={padding.top + innerH / 2}
          fontSize="10"
          fill="#52525b"
          transform={`rotate(-90, ${padding.left - 38}, ${padding.top + innerH / 2})`}
          textAnchor="middle"
          className="dark:fill-zinc-300"
        >
          Friction loss (in.w.c./100ft)
        </text>

        {/* X-axis ticks */}
        {xTicks.map((d) => (
          <g key={`x-${d}`}>
            <line
              x1={xScale(d)}
              y1={padding.top + innerH}
              x2={xScale(d)}
              y2={padding.top + innerH + 4}
              stroke="#71717a"
              className="dark:stroke-zinc-400"
            />
            <text
              x={xScale(d)}
              y={padding.top + innerH + 16}
              fontSize="10"
              textAnchor="middle"
              fill="#71717a"
              className="dark:fill-zinc-400"
            >
              {d}″
            </text>
          </g>
        ))}
        <text
          x={padding.left + innerW / 2}
          y={height - 8}
          fontSize="10"
          textAnchor="middle"
          fill="#52525b"
          className="dark:fill-zinc-300"
        >
          Round duct diameter (inches)
        </text>

        {/* Friction curve */}
        <path d={curvePath} stroke="#2563eb" strokeWidth="2" fill="none" className="dark:stroke-blue-400" />

        {/* Target friction (horizontal line) */}
        <line
          x1={padding.left}
          y1={targetY}
          x2={width - padding.right}
          y2={targetY}
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          className="dark:stroke-emerald-400"
        />
        <text
          x={width - padding.right - 4}
          y={targetY - 4}
          fontSize="9"
          fill="#15803d"
          textAnchor="end"
          className="dark:fill-emerald-300"
        >
          target {r2(snapshot.frictionTarget)} in.w.c./100ft
        </text>

        {/* Exact diameter marker */}
        <circle cx={exactX} cy={exactY} r="4" fill="#16a34a" className="dark:fill-emerald-400" />
        <text
          x={exactX}
          y={exactY - 8}
          fontSize="9"
          textAnchor="middle"
          fill="#15803d"
          className="dark:fill-emerald-300"
        >
          exact {r1(r.exactDiameter)}″
        </text>

        {/* Standard diameter marker (where calculation lands) */}
        <circle cx={stdX} cy={stdY} r="6" fill="#dc2626" stroke="white" strokeWidth="2" className="dark:fill-red-500" />
        <text
          x={stdX}
          y={stdY - 12}
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          fill="#991b1b"
          className="dark:fill-red-300"
        >
          {r.standardDiameter}″ standard
        </text>

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Blue curve: friction at {snapshot.cfm} CFM as a function of diameter. Green dashed line: your target friction. Green dot: exact calculated diameter ({r1(r.exactDiameter)}″). Red marker: standard rounded duct size ({r.standardDiameter}″) — the actionable result. Pink zone: diameters that would exceed your {snapshot.presetMaxVelocity} fpm velocity limit.
      </p>
    </figure>
  );
}
