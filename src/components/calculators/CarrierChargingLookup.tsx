"use client";

import { useMemo, useState } from "react";
import { Calculator, Wind, Thermometer } from "lucide-react";
import type { PTPoint } from "@/data/refrigerants";

export interface CarrierChargingLookupProps {
  /** R-410A PT chart from the data layer. */
  ptChart: PTPoint[];
}

/**
 * Standard Carrier R-410A fixed-orifice superheat chart values.
 *
 * Source: Carrier Service Bulletin "R-410A Charging — Fixed Orifice Devices",
 * also reprinted in the Carrier Residential AC Service Reference and Bryant
 * (same parent OEM) installation manuals. Values in °F target superheat.
 *
 * The chart is bounded: cells marked `null` are "do not operate / charge"
 * conditions (mild outdoor + low humidity → evaporator approach is too small
 * for meaningful superheat measurement, system should be off).
 *
 * NOTE: Specific Carrier equipment models may use updated charts. Always
 * verify against the unit's installation manual or data plate sticker.
 */
const SH_CHART: Record<number, Record<number, number | null>> = {
  // indoor wet-bulb °F : { outdoor dry-bulb °F : target superheat °F }
  50: { 65: 13, 75: 7, 85: null, 95: null, 105: null, 115: null },
  55: { 65: 21, 75: 16, 85: 11, 95: 6, 105: null, 115: null },
  60: { 65: 27, 75: 23, 85: 19, 95: 16, 105: 12, 115: 8 },
  65: { 65: 31, 75: 28, 85: 25, 95: 22, 105: 19, 115: 16 },
  70: { 65: 32, 75: 30, 85: 28, 95: 26, 105: 24, 115: 22 },
  75: { 65: 33, 75: 31, 85: 30, 95: 28, 105: 26, 115: 25 },
};

const WB_OPTIONS = [50, 55, 60, 65, 70, 75];
const OD_OPTIONS = [65, 75, 85, 95, 105, 115];

/** Linear interpolation in the 1D PT table at a given temperature. */
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

/**
 * Interactive lookup: indoor wet-bulb + outdoor dry-bulb → target superheat
 * with the corresponding R-410A suction saturation pressure. The suction
 * saturation temp comes from typical residential design (evaporator pulls
 * suction down to ~design-WB minus ~17°F approach in cooling mode, capped
 * at the lower limit of the chart).
 *
 * The PSIG cross-reference is what makes this widget different from a
 * static chart: technicians want one number — what should I see on the
 * manifold? — and the answer depends on both the chart target AND the
 * actual saturation pressure of R-410A at the implied evaporator temp.
 */
export function CarrierChargingLookup({ ptChart }: CarrierChargingLookupProps) {
  const [wb, setWb] = useState<number>(67);
  const [od, setOd] = useState<number>(95);

  const result = useMemo(() => {
    // Round wet-bulb and outdoor down to the nearest chart row/column.
    // The chart is bounded — clamping mirrors how a technician reads off
    // a printed grid.
    const wbRow = WB_OPTIONS.reduce((acc, v) => (v <= wb ? v : acc), WB_OPTIONS[0]);
    const odCol = OD_OPTIONS.reduce((acc, v) => (v <= od ? v : acc), OD_OPTIONS[0]);
    const targetSH = SH_CHART[wbRow]?.[odCol] ?? null;

    // Saturation evap temp ≈ indoor WB − 17°F (typical residential approach
    // for nominal coil sizing per ACCA Manual D guidance). This is an
    // approximation; the actual measured saturation depends on the system.
    const satEvapF = Math.max(wb - 17, ptChart[0]?.tempF ?? -40);
    const evapP = interpPressure(ptChart, satEvapF);

    // Saturation condensing temp ≈ outdoor DB + 25°F approach (cooling).
    const satCondF = Math.min(od + 25, ptChart[ptChart.length - 1]?.tempF ?? 150);
    const condP = interpPressure(ptChart, satCondF);

    return { wbRow, odCol, targetSH, satEvapF, evapP, satCondF, condP };
  }, [wb, od, ptChart]);

  const isExtreme = result.targetSH === null;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Interactive lookup — Carrier R-410A target superheat
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid items-end gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cc-wb" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Wind className="h-3 w-3" /> Indoor wet-bulb (°F)
            </label>
            <input
              id="cc-wb"
              type="number"
              min={50}
              max={75}
              step={1}
              value={wb}
              onChange={(e) => setWb(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Measure at the return-air grille with a sling or digital psychrometer. Typical residential cooling: 60-72°F WB.
            </p>
          </div>
          <div>
            <label htmlFor="cc-od" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Thermometer className="h-3 w-3" /> Outdoor dry-bulb (°F)
            </label>
            <input
              id="cc-od"
              type="number"
              min={65}
              max={115}
              step={1}
              value={od}
              onChange={(e) => setOd(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Measured at the condensing unit, in shade, away from radiant heat sources.
            </p>
          </div>
        </div>

        {isExtreme ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
            <strong>Outside chart range.</strong> Carrier&apos;s chart does not publish a target for {result.wbRow}°F WB × {result.odCol}°F OD — these conditions are typically too mild for meaningful charging. Wait for design or near-design outdoor temps (≥85°F) with normal indoor humidity (≥55°F WB).
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Target superheat</div>
              <div className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{result.targetSH}°F</div>
              <div className="mt-1 text-[11px] text-zinc-500">Chart row {result.wbRow}°F × column {result.odCol}°F</div>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expected suction pressure</div>
              <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {result.evapP ? result.evapP.bubble.toFixed(1) : "—"}<span className="text-sm font-normal text-zinc-500"> PSIG</span>
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">@ {result.satEvapF.toFixed(0)}°F sat. evap. (R-410A)</div>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expected high-side pressure</div>
              <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {result.condP ? result.condP.bubble.toFixed(0) : "—"}<span className="text-sm font-normal text-zinc-500"> PSIG</span>
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">@ {result.satCondF.toFixed(0)}°F sat. cond. (R-410A)</div>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          Suction saturation assumes a 17°F approach between indoor WB and evaporator saturated suction temperature (typical residential design per ACCA Manual D). High-side assumes a 25°F condenser approach. Actual values vary ±3-5°F by coil sizing, line set length, and system age. Saturation pressures generated from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS).
        </p>
      </div>
    </div>
  );
}
