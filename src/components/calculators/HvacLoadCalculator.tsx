"use client";

import { useState } from "react";
import { Calculator, Home, Sun, Snowflake, Users, Lightbulb, BarChart3, ArrowRight } from "lucide-react";
import {
  calculateLoad,
  CLIMATE_ZONES,
  CONSTRUCTION_ERAS,
  WINDOW_AREA_PRESETS,
  type LoadResult,
} from "@/lib/load-calc";

const r0 = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : "—");
const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");

type Snapshot = {
  inputs: {
    floorArea: number;
    stories: number;
    zoneId: string;
    eraId: string;
    windowId: string;
    occupants: number;
    equipment: string;
  };
  result: LoadResult;
};

export function HvacLoadCalculator() {
  const [floorArea, setFloorArea] = useState("2000");
  const [stories, setStories] = useState("1");
  const [zoneId, setZoneId] = useState("4A");
  const [eraId, setEraId] = useState("1980-2005");
  const [windowId, setWindowId] = useState("average");
  const [occupants, setOccupants] = useState("4");
  const [equipment, setEquipment] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  function handleCalculate() {
    const result = calculateLoad({
      floorAreaSqft: Number(floorArea) || 0,
      stories: Number(stories) || 1,
      climateZoneId: zoneId,
      constructionEraId: eraId,
      windowAreaId: windowId,
      occupants: Number(occupants) || 0,
      equipmentBtuHr: equipment === "" ? undefined : Number(equipment),
    });
    if (!result) return;
    setSnapshot({
      inputs: { floorArea: Number(floorArea), stories: Number(stories), zoneId, eraId, windowId, occupants: Number(occupants), equipment },
      result,
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          HVAC Load Calculator — Quick Manual J Estimate
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* FORM */}
        <div className="space-y-4">
          {/* Section 1: Building geometry */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">1. Building geometry</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="lc-area" className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <Home className="h-3.5 w-3.5 text-blue-600" /> Conditioned floor area (ft²)
                </label>
                <input
                  id="lc-area"
                  type="number"
                  step={100}
                  min={400}
                  value={floorArea}
                  onChange={(e) => setFloorArea(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label htmlFor="lc-stories" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Stories</label>
                <select id="lc-stories" value={stories} onChange={(e) => setStories(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <option value="1">1 story (slab or basement)</option>
                  <option value="2">2 stories</option>
                </select>
              </div>
              <div>
                <label htmlFor="lc-win" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Window area</label>
                <select id="lc-win" value={windowId} onChange={(e) => setWindowId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  {WINDOW_AREA_PRESETS.map((w) => (<option key={w.id} value={w.id}>{w.label}</option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Climate + construction */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">2. Climate + construction</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="lc-zone" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Climate zone (IECC)</label>
                <select id="lc-zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  {CLIMATE_ZONES.map((z) => (<option key={z.id} value={z.id}>{z.label} — cool {z.coolingDbF}°F, heat {z.heatingDbF}°F</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="lc-era" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Construction era</label>
                <select id="lc-era" value={eraId} onChange={(e) => setEraId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  {CONSTRUCTION_ERAS.map((e) => (<option key={e.id} value={e.id}>{e.label}</option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Internal gains */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">3. Internal gains</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="lc-occ" className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> Occupants
                </label>
                <input id="lc-occ" type="number" min={1} max={20} value={occupants} onChange={(e) => setOccupants(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900" />
              </div>
              <div>
                <label htmlFor="lc-equip" className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <Lightbulb className="h-3.5 w-3.5 text-blue-600" /> Equipment + lighting (BTU/hr — optional)
                </label>
                <input id="lc-equip" type="number" placeholder={`default ≈ ${r0(Number(floorArea) * 2.5)}`} value={equipment} onChange={(e) => setEquipment(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={handleCalculate} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
              <Calculator className="h-5 w-5" /> Calculate cooling + heating loads <ArrowRight className="h-4 w-4" />
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
            Enter your building specs and click <strong>Calculate cooling + heating loads</strong>.
          </div>
        )}

        <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/50 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">Methodology + accuracy</summary>
          <p className="mt-2">
            Simplified Manual J — accurate within ±20% of full Manual J for typical residential. Climate zones per <strong>IECC 2021</strong> with ASHRAE 1% cooling / 99% heating design temperatures. Construction-era U-values from IECC prescriptive R-values for the period. Component math from <strong>ACCA Manual J 8th edition</strong> and ASHRAE Handbook of Fundamentals 2021 Ch. 17. <strong>Not a substitute for a full Manual J report</strong> when specifying equipment for code compliance or permit application.
          </p>
        </details>
      </div>
    </div>
  );
}

function ResultsSection({ snapshot }: { snapshot: Snapshot }) {
  const r = snapshot.result;

  return (
    <>
      <div className="flex items-baseline gap-3">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Results</h3>
      </div>

      {/* Headline cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-950/30">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Sun className="h-3 w-3" /> Cooling load
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">{r0(r.cooling.totalBtuHr)}<span className="text-sm font-normal text-zinc-500"> BTU/hr</span></div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{r2(r.cooling.tons)} tons · {r0(r.cooling.sqftPerTon)} ft²/ton</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Sensible heat ratio</div>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{r2(r.cooling.shr)}</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Sensible {r0(r.cooling.sensibleBtuHr)} / Latent {r0(r.cooling.latentBtuHr)}</div>
        </div>
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50/60 p-4 dark:border-sky-700/60 dark:bg-sky-950/30">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Snowflake className="h-3 w-3" /> Heating load
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-sky-700 dark:text-sky-300">{r0(r.heating.totalBtuHr)}<span className="text-sm font-normal text-zinc-500"> BTU/hr</span></div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Furnace input ≈ {r0(r.heating.totalBtuHr / 0.92)} BTU/hr @ 92% AFUE</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 rounded-md border border-amber-300 bg-amber-50/60 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
        <strong>Sizing recommendation:</strong> {r.recommendation}
      </div>

      {/* SVG 1: Cooling load component breakdown */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <LoadComponentChart snapshot={snapshot} />
      </div>

      {/* SVG 2: Cooling vs heating comparison */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <CoolingHeatingComparison snapshot={snapshot} />
      </div>

      {/* Prose explanations */}
      <div className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">What every number means</h4>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why {r0(r.cooling.totalBtuHr)} BTU/hr cooling ({r2(r.cooling.tons)} tons)?</strong> Cooling load is the sum of all heat that must be removed from the conditioned space at design conditions. For your {r0(r.geometry.floorAreaSqft)} ft² home in IECC Zone {r.zone.id} ({r.zone.coolingDbF}°F outdoor design), summed across walls, windows (conduction + solar), roof, infiltration (sensible + latent), people, and equipment. The {r0(r.cooling.sqftPerTon)} ft²/ton ratio is a useful sanity check — typical residential ranges from 400 ft²/ton (older + leakier) to 800 ft²/ton (modern + tight + well-shaded).
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why SHR {r2(r.cooling.shr)}?</strong> Sensible Heat Ratio = sensible cooling / total cooling. The remaining fraction is latent (moisture removal). Higher SHR (closer to 1.0) = dry climate dominates (more temperature, less humidity). Lower SHR (closer to 0.7) = humid climate dominates (lots of dehumidification needed). Your SHR of {r2(r.cooling.shr)} means {Math.round(r.cooling.shr * 100)}% of equipment work goes to temperature reduction; {Math.round((1 - r.cooling.shr) * 100)}% goes to moisture removal. Equipment selection should match this SHR — variable-speed compressors with longer runtimes deliver low SHR; oversized single-stage units run short and miss latent load.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Why {r0(r.heating.totalBtuHr)} BTU/hr heating?</strong> At {r.zone.heatingDbF}°F outdoor design temperature, this is the heat that must be added to maintain {r.zone.id === r.zone.id ? "70°F" : "70°F"} indoor. The furnace OUTPUT must meet or exceed this; furnace INPUT must be higher by 1/AFUE (92% AFUE = 1.087× output). For heat pump sizing, this is the heating load at the heating balance point — auxiliary heat covers any gap below this temperature.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Cooling load component breakdown.</strong> Walls contribute {r0(r.cooling.components.walls)} BTU/hr ({Math.round(r.cooling.components.walls / r.cooling.sensibleBtuHr * 100)}% of sensible). Windows contribute {r0(r.cooling.components.windowsConduction + r.cooling.components.windowsSolar)} BTU/hr — the largest single source in most homes due to solar gain. Roof: {r0(r.cooling.components.roof)} BTU/hr. Infiltration: {r0(r.cooling.components.infiltrationSensible + r.cooling.components.infiltrationLatent)} BTU/hr (the biggest opportunity for envelope improvements). People + equipment add {r0(r.cooling.components.peopleSensible + r.cooling.components.peopleLatent + r.cooling.components.equipment)} BTU/hr.
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <strong className="text-zinc-900 dark:text-zinc-100">Manual S sizing — what to actually buy.</strong> Per ACCA Manual S, equipment cooling capacity must fall between 90% and 115% of the calculated load. For {r0(r.cooling.totalBtuHr)} BTU/hr ({r2(r.cooling.tons)} tons), look for nominal-rated equipment from {r2(r.cooling.totalBtuHr / 12000 * 0.9)} to {r2(r.cooling.totalBtuHr / 12000 * 1.15)} tons at AHRI-rated standard conditions. Variable-capacity equipment (modulating compressor) is more forgiving of size mismatch; single-stage equipment that&apos;s oversized will short-cycle, fail to dehumidify, and waste energy.
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 1: Stacked bar of cooling load components
// ────────────────────────────────────────────────────────────────────

function LoadComponentChart({ snapshot }: { snapshot: Snapshot }) {
  const r = snapshot.result;
  const width = 640;
  const height = 240;

  const components = [
    { label: "Walls", value: r.cooling.components.walls, color: "#3b82f6" },
    { label: "Windows (conduction)", value: r.cooling.components.windowsConduction, color: "#06b6d4" },
    { label: "Windows (solar gain)", value: r.cooling.components.windowsSolar, color: "#f59e0b" },
    { label: "Roof", value: r.cooling.components.roof, color: "#10b981" },
    { label: "Infiltration (sensible)", value: r.cooling.components.infiltrationSensible, color: "#8b5cf6" },
    { label: "Infiltration (latent)", value: r.cooling.components.infiltrationLatent, color: "#a78bfa" },
    { label: "People (sensible)", value: r.cooling.components.peopleSensible, color: "#ec4899" },
    { label: "People (latent)", value: r.cooling.components.peopleLatent, color: "#f472b6" },
    { label: "Equipment + lighting", value: r.cooling.components.equipment, color: "#ef4444" },
  ].filter((c) => c.value > 0);

  const total = components.reduce((acc, c) => acc + c.value, 0);
  const padding = { top: 20, right: 220, bottom: 20, left: 100 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  let xCursor = padding.left;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Cooling load component breakdown ({r0(total)} BTU/hr total)
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Stacked bar chart showing cooling load component breakdown">
        {/* Stacked bar */}
        <text x={padding.left - 8} y={padding.top + innerH / 2 + 4} fontSize="11" textAnchor="end" fill="#52525b" className="dark:fill-zinc-300">Cooling load</text>
        {components.map((c) => {
          const w = (c.value / total) * innerW;
          const x = xCursor;
          xCursor += w;
          return (
            <g key={c.label}>
              <rect x={x} y={padding.top + 20} width={w} height={innerH - 40} fill={c.color} opacity={0.85} />
              {w > 40 ? (
                <text x={x + w / 2} y={padding.top + innerH / 2 + 4} fontSize="10" fontWeight="600" textAnchor="middle" fill="white">
                  {Math.round((c.value / total) * 100)}%
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Legend */}
        {components.map((c, i) => (
          <g key={`legend-${c.label}`} transform={`translate(${padding.left + innerW + 20}, ${padding.top + i * 22})`}>
            <rect x={0} y={0} width={14} height={14} fill={c.color} opacity={0.85} />
            <text x={20} y={11} fontSize="10" fill="#52525b" className="dark:fill-zinc-300">{c.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Each segment shows that component&apos;s share of total cooling load. Windows and infiltration are typically the largest reducible loads — envelope improvements directly shrink equipment requirements.
      </p>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────
// SVG 2: Cooling vs heating side-by-side
// ────────────────────────────────────────────────────────────────────

function CoolingHeatingComparison({ snapshot }: { snapshot: Snapshot }) {
  const r = snapshot.result;
  const width = 640;
  const height = 240;
  const padding = { top: 30, right: 30, bottom: 50, left: 80 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(r.cooling.totalBtuHr, r.heating.totalBtuHr) * 1.1;
  const yScale = (v: number) => padding.top + innerH - (v / max) * innerH;
  const barW = innerW / 4;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Cooling vs heating loads — {r.zone.label}
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Cooling vs heating load comparison">
        {/* Y-axis ticks */}
        {[0, max / 4, max / 2, (3 * max) / 4, max].map((v, i) => (
          <g key={`y-${i}`}>
            <line x1={padding.left} y1={yScale(v)} x2={width - padding.right} y2={yScale(v)} stroke="#e4e4e7" strokeDasharray="2,2" className="dark:stroke-zinc-700" />
            <text x={padding.left - 6} y={yScale(v) + 3} fontSize="9" textAnchor="end" fill="#71717a" className="dark:fill-zinc-400">{r0(v)}</text>
          </g>
        ))}
        <text x={padding.left - 60} y={padding.top + innerH / 2} fontSize="10" fill="#52525b" transform={`rotate(-90, ${padding.left - 60}, ${padding.top + innerH / 2})`} textAnchor="middle" className="dark:fill-zinc-300">BTU/hr</text>

        {/* Cooling: stacked sensible + latent */}
        <g>
          <rect x={padding.left + barW * 0.5} y={yScale(r.cooling.sensibleBtuHr)} width={barW} height={padding.top + innerH - yScale(r.cooling.sensibleBtuHr)} fill="#3b82f6" opacity={0.85} />
          <rect x={padding.left + barW * 0.5} y={yScale(r.cooling.totalBtuHr)} width={barW} height={yScale(r.cooling.sensibleBtuHr) - yScale(r.cooling.totalBtuHr)} fill="#06b6d4" opacity={0.85} />
          <text x={padding.left + barW} y={yScale(r.cooling.totalBtuHr) - 6} fontSize="12" fontWeight="600" textAnchor="middle" fill="#1e40af" className="dark:fill-blue-300">{r0(r.cooling.totalBtuHr)}</text>
          <text x={padding.left + barW} y={padding.top + innerH + 16} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">Cooling</text>
          <text x={padding.left + barW} y={padding.top + innerH + 30} fontSize="9" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">at {r.zone.coolingDbF}°F design</text>
        </g>

        {/* Heating */}
        <g>
          <rect x={padding.left + barW * 2.5} y={yScale(r.heating.totalBtuHr)} width={barW} height={padding.top + innerH - yScale(r.heating.totalBtuHr)} fill="#0ea5e9" opacity={0.85} />
          <text x={padding.left + barW * 3} y={yScale(r.heating.totalBtuHr) - 6} fontSize="12" fontWeight="600" textAnchor="middle" fill="#0c4a6e" className="dark:fill-sky-300">{r0(r.heating.totalBtuHr)}</text>
          <text x={padding.left + barW * 3} y={padding.top + innerH + 16} fontSize="10" textAnchor="middle" fill="#52525b" className="dark:fill-zinc-300">Heating</text>
          <text x={padding.left + barW * 3} y={padding.top + innerH + 30} fontSize="9" textAnchor="middle" fill="#71717a" className="dark:fill-zinc-400">at {r.zone.heatingDbF}°F design</text>
        </g>

        {/* Legend for cooling */}
        <g transform={`translate(${padding.left + 20}, ${padding.top - 18})`}>
          <rect x={0} y={0} width={12} height={12} fill="#3b82f6" opacity={0.85} />
          <text x={16} y={10} fontSize="9" fill="#52525b" className="dark:fill-zinc-300">Sensible</text>
          <rect x={70} y={0} width={12} height={12} fill="#06b6d4" opacity={0.85} />
          <text x={86} y={10} fontSize="9" fill="#52525b" className="dark:fill-zinc-300">Latent</text>
        </g>

        {/* Axis lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#a1a1aa" className="dark:stroke-zinc-500" />
      </svg>
      <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        Comparison at design conditions for IECC Zone {r.zone.id}. {r.cooling.totalBtuHr > r.heating.totalBtuHr ? "Cooling-dominant" : "Heating-dominant"} climate — equipment sizing should match the larger load (this is the heat pump &quot;balance point&quot; consideration).
      </p>
    </figure>
  );
}
