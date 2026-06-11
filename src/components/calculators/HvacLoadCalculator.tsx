"use client";

import { useMemo, useState } from "react";
import { Calculator, Home, Sun, Snowflake, Users, Lightbulb } from "lucide-react";
import {
  calculateLoad,
  CLIMATE_ZONES,
  CONSTRUCTION_ERAS,
  WINDOW_AREA_PRESETS,
} from "@/lib/load-calc";

const r0 = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : "—");
const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");

export function HvacLoadCalculator() {
  const [floorArea, setFloorArea] = useState("2000");
  const [stories, setStories] = useState("1");
  const [zoneId, setZoneId] = useState("4A");
  const [eraId, setEraId] = useState("1980-2005");
  const [windowId, setWindowId] = useState("average");
  const [occupants, setOccupants] = useState("4");
  const [equipment, setEquipment] = useState("");

  const result = useMemo(() => {
    return calculateLoad({
      floorAreaSqft: Number(floorArea) || 0,
      stories: Number(stories) || 1,
      climateZoneId: zoneId,
      constructionEraId: eraId,
      windowAreaId: windowId,
      occupants: Number(occupants) || 0,
      equipmentBtuHr: equipment === "" ? undefined : Number(equipment),
    });
  }, [floorArea, stories, zoneId, eraId, windowId, occupants, equipment]);

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          HVAC Load Calculator — Quick Manual J Estimate
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid items-end gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="lc-area" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Home className="h-3 w-3" /> Conditioned floor area (ft²)
            </label>
            <input
              id="lc-area"
              type="number"
              step={100}
              min={400}
              value={floorArea}
              onChange={(e) => setFloorArea(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="lc-stories" className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Stories</label>
            <select id="lc-stories" value={stories} onChange={(e) => setStories(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              <option value="1">1 story (slab or basement)</option>
              <option value="2">2 stories</option>
            </select>
          </div>
          <div>
            <label htmlFor="lc-occ" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Users className="h-3 w-3" /> Occupants
            </label>
            <input id="lc-occ" type="number" min={1} max={20} value={occupants} onChange={(e) => setOccupants(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
        </div>

        <div className="mt-3 grid items-end gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="lc-zone" className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Climate zone (IECC)</label>
            <select id="lc-zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              {CLIMATE_ZONES.map((z) => (
                <option key={z.id} value={z.id}>{z.label} — cool {z.coolingDbF}°F, heat {z.heatingDbF}°F</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lc-era" className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Construction era</label>
            <select id="lc-era" value={eraId} onChange={(e) => setEraId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              {CONSTRUCTION_ERAS.map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lc-win" className="text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Window area</label>
            <select id="lc-win" value={windowId} onChange={(e) => setWindowId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              {WINDOW_AREA_PRESETS.map((w) => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="lc-equip" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="h-3 w-3" /> Equipment + lighting (BTU/hr) — optional, blank uses default
          </label>
          <input id="lc-equip" type="number" placeholder={`default ≈ ${r0(Number(floorArea) * 2.5)} BTU/hr (2.5 × ft²)`} value={equipment} onChange={(e) => setEquipment(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        </div>

        {result ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border-2 border-blue-300 bg-blue-50/60 p-3 dark:border-blue-700/60 dark:bg-blue-950/30">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <Sun className="h-3 w-3" /> Total cooling load
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{r0(result.cooling.totalBtuHr)} <span className="text-sm font-normal">BTU/hr</span></div>
                <div className="mt-1 text-[11px] text-zinc-500">= {r2(result.cooling.tons)} tons · {r0(result.cooling.sqftPerTon)} ft²/ton</div>
              </div>
              <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Sensible / Latent split</div>
                <div className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">{r0(result.cooling.sensibleBtuHr)} / {r0(result.cooling.latentBtuHr)}</div>
                <div className="mt-1 text-[11px] text-zinc-500">SHR = {r2(result.cooling.shr)} (sensible / total)</div>
              </div>
              <div className="rounded-md border-2 border-sky-300 bg-sky-50/60 p-3 dark:border-sky-700/60 dark:bg-sky-950/30">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <Snowflake className="h-3 w-3" /> Total heating load
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-sky-700 dark:text-sky-300">{r0(result.heating.totalBtuHr)} <span className="text-sm font-normal">BTU/hr</span></div>
                <div className="mt-1 text-[11px] text-zinc-500">furnace input ÷ AFUE ≈ {r0(result.heating.totalBtuHr / 0.92)} BTU/hr at 92% AFUE</div>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-amber-300 bg-amber-50/60 p-3 text-xs dark:border-amber-700/60 dark:bg-amber-900/20">
              <strong>Sizing recommendation:</strong> {result.recommendation}
            </div>

            <details className="mt-3 rounded-md border border-zinc-200 p-3 text-xs open:bg-zinc-50/40 dark:border-zinc-800 dark:open:bg-zinc-900/30">
              <summary className="cursor-pointer font-semibold">Cooling-load component breakdown</summary>
              <table className="mt-2 w-full font-mono text-xs">
                <tbody>
                  <tr><td className="py-1">Walls ({r0(result.geometry.wallAreaSqft)} ft²)</td><td className="py-1 text-right">{r0(result.cooling.components.walls)} BTU/hr</td></tr>
                  <tr><td className="py-1">Windows — conduction ({r0(result.geometry.windowAreaSqft)} ft²)</td><td className="py-1 text-right">{r0(result.cooling.components.windowsConduction)} BTU/hr</td></tr>
                  <tr><td className="py-1">Windows — solar gain</td><td className="py-1 text-right">{r0(result.cooling.components.windowsSolar)} BTU/hr</td></tr>
                  <tr><td className="py-1">Roof ({r0(result.geometry.roofAreaSqft)} ft²)</td><td className="py-1 text-right">{r0(result.cooling.components.roof)} BTU/hr</td></tr>
                  <tr><td className="py-1">Infiltration — sensible ({r0(result.geometry.infiltrationCfm)} CFM)</td><td className="py-1 text-right">{r0(result.cooling.components.infiltrationSensible)} BTU/hr</td></tr>
                  <tr><td className="py-1">Infiltration — latent</td><td className="py-1 text-right">{r0(result.cooling.components.infiltrationLatent)} BTU/hr</td></tr>
                  <tr><td className="py-1">People — sensible ({Number(occupants) || 0} occupants)</td><td className="py-1 text-right">{r0(result.cooling.components.peopleSensible)} BTU/hr</td></tr>
                  <tr><td className="py-1">People — latent</td><td className="py-1 text-right">{r0(result.cooling.components.peopleLatent)} BTU/hr</td></tr>
                  <tr><td className="py-1">Equipment + lighting</td><td className="py-1 text-right">{r0(result.cooling.components.equipment)} BTU/hr</td></tr>
                  <tr className="border-t border-zinc-300 dark:border-zinc-700"><td className="py-1 font-semibold">Sensible total</td><td className="py-1 text-right font-semibold">{r0(result.cooling.sensibleBtuHr)} BTU/hr</td></tr>
                  <tr><td className="py-1 font-semibold">Latent total (+ 500 misc)</td><td className="py-1 text-right font-semibold">{r0(result.cooling.latentBtuHr)} BTU/hr</td></tr>
                </tbody>
              </table>
            </details>
          </>
        ) : (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
            Enter valid inputs to compute load.
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          Simplified Manual J — accurate within ±20% of full Manual J for typical residential. Climate zones per IECC 2021 with ASHRAE 1% cooling / 99% heating design temperatures. Construction-era U-values from IECC prescriptive R-values for the period. Component math from ACCA Manual J 8th edition and ASHRAE Handbook of Fundamentals 2021, Chapter 17. <strong>Not a substitute for a full Manual J report</strong> when specifying equipment for code compliance or permit application.
        </p>
      </div>
    </div>
  );
}
