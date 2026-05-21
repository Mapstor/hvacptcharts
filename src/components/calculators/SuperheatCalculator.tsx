"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";
import { cToF, fToC, kpagToPsig, psigToKpag, deltaFtoC } from "./shared/units";

type TempUnit = "F" | "C";
type PUnit = "psig" | "kpag";

const TOGGLE_BASE =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0";
const TOGGLE_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function SuperheatCalculator({ initialSlug = "r-410a" }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [pUnit, setPUnit] = useState<PUnit>("psig");
  // Defaults: R-410A residential AC at ~95°F outdoor — 130 PSIG suction, 60°F suction line.
  const [pressureInput, setPressureInput] = useState("130");
  const [tempInput, setTempInput] = useState("60");

  const r = useMemo(() => getRefrigerant(slug), [slug]);
  const hasGlide = r?.physical.hasSignificantGlide ?? false;

  const computation = useMemo(() => {
    if (!r || r.ptChart.length === 0) return { kind: "no-data" as const };
    const rawP = Number(pressureInput);
    const rawT = Number(tempInput);
    if (!Number.isFinite(rawP) || !Number.isFinite(rawT)) return { kind: "invalid" as const };

    const psig = pUnit === "psig" ? rawP : kpagToPsig(rawP);
    const measuredF = tempUnit === "F" ? rawT : cToF(rawT);

    // Superheat is measured on the suction line where the refrigerant has fully passed
    // through evaporation — the relevant saturation boundary is the DEW curve.
    const satF = getSaturationTempAtPsigF(slug, psig, "dew");
    if (satF === null) return { kind: "out-of-range" as const };

    const superheatF = measuredF - satF;
    return { kind: "ok" as const, superheatF, satF, measuredF, psig };
  }, [r, slug, pressureInput, tempInput, pUnit, tempUnit]);

  const diagnostic = computation.kind === "ok" ? diagnoseSuperheat(computation.superheatF) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="sh-refrig" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Refrigerant</label>
        <RefrigerantSelector id="sh-refrig" value={slug} onChange={setSlug} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Temp</span>
          <div className="inline-flex" role="group" aria-label="Temperature unit">
            {(["F", "C"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setTempUnit(u)} aria-pressed={tempUnit === u} className={`${TOGGLE_BASE} ${tempUnit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}>°{u}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Pressure</span>
          <div className="inline-flex" role="group" aria-label="Pressure unit">
            {(["psig", "kpag"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setPUnit(u)} aria-pressed={pUnit === u} className={`${TOGGLE_BASE} ${pUnit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}>{u === "psig" ? "PSIG" : "kPa"}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sh-p" className="block text-xs uppercase tracking-wide text-zinc-500">
            Suction-line pressure ({pUnit === "psig" ? "PSIG" : "kPa gauge"})
          </label>
          <input
            id="sh-p"
            type="number"
            step={0.1}
            value={pressureInput}
            onChange={(e) => setPressureInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-lg font-mono dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="sh-t" className="block text-xs uppercase tracking-wide text-zinc-500">
            Suction-line temperature (°{tempUnit})
          </label>
          <input
            id="sh-t"
            type="number"
            step={0.1}
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-lg font-mono dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
        <span className="block text-xs uppercase tracking-wide text-zinc-500">Superheat</span>
        {computation.kind === "no-data" ? (
          <span className="text-zinc-500">No PT data available for this refrigerant (manual blend).</span>
        ) : computation.kind === "invalid" ? (
          <span className="text-zinc-500">Enter both pressure and temperature.</span>
        ) : computation.kind === "out-of-range" ? (
          <span className="text-zinc-500">Suction pressure is outside this refrigerant&apos;s chart range.</span>
        ) : (
          <div>
            <div className="mt-1 font-mono text-4xl font-bold">
              {tempUnit === "F" ? computation.superheatF.toFixed(1) : deltaFtoC(computation.superheatF).toFixed(1)}
              <span className="ml-2 text-xl font-normal text-zinc-500">°{tempUnit}</span>
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Saturation temp at {(pUnit === "psig" ? computation.psig : psigToKpag(computation.psig)).toFixed(1)} {pUnit === "psig" ? "PSIG" : "kPa"}:{" "}
              <span className="font-mono">{(tempUnit === "F" ? computation.satF : fToC(computation.satF)).toFixed(1)}°{tempUnit}</span>{" "}
              {hasGlide ? <span className="text-xs">(dew curve — correct for zeotropic blends)</span> : null}
            </div>
            {diagnostic ? (
              <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${diagnostic.toneClass}`}>
                <strong className="font-semibold">{diagnostic.label}</strong>
                <span> · {diagnostic.note}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <details className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">Target superheat reference</summary>
        <div className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
          <p>Target superheat depends on the metering device. These ranges are general guidance; always defer to the equipment manufacturer&apos;s charging procedure.</p>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-left dark:border-zinc-700">
                <th className="py-1.5">System type</th>
                <th>Target superheat</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5">Fixed orifice (residential AC)</td><td>8–25°F (chart-based)</td><td className="font-sans text-zinc-500">ACCA Manual T charging chart</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5">TXV (residential / commercial AC)</td><td>8–15°F (often 10°F setpoint)</td><td className="font-sans text-zinc-500">Manufacturer spec; ACCA Manual T</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5">EXV</td><td>8–15°F (controlled to setpoint)</td><td className="font-sans text-zinc-500">Equipment controls</td>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5">Refrigeration — medium temp</td><td>10–20°F</td><td className="font-sans text-zinc-500">ASHRAE Refrigeration Handbook 2022</td>
              </tr>
              <tr>
                <td className="py-1.5">Refrigeration — low temp</td><td>10–20°F at evap; higher across suction line</td><td className="font-sans text-zinc-500">ASHRAE Refrigeration Handbook 2022</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-zinc-500">
            For fixed-orifice systems use the manufacturer&apos;s charging chart with outdoor dry-bulb and indoor
            wet-bulb temperatures rather than a single setpoint. See{" "}
            <Link href="/carrier-410a-charging-chart/" className="underline">Carrier R-410A charging chart</Link> for an example.
          </p>
        </div>
      </details>

      {r && r.ptChart.length > 0 ? (
        <p className="text-xs text-zinc-500">
          Chart range for {r.displayName}: {r.ptChart[0].tempF}°F to {r.ptChart[r.ptChart.length - 1].tempF}°F.
          {hasGlide ? ` Zeotropic blend — superheat math uses the dew curve.` : null}
        </p>
      ) : null}
    </div>
  );
}

function diagnoseSuperheat(superheatF: number): { label: string; note: string; toneClass: string } | null {
  if (superheatF < 0) {
    return {
      label: "Negative superheat (liquid in suction line)",
      note: "The suction-line temperature reads below saturation — liquid refrigerant is reaching the compressor. Slugging risk. Stop and investigate before continuing operation.",
      toneClass: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
    };
  }
  if (superheatF < 5) {
    return {
      label: "Very low superheat",
      note: "Below 5°F leaves little margin against flooding the compressor. Check for overcharge, a stuck TXV, or low evaporator load before increasing charge.",
      toneClass: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    };
  }
  if (superheatF <= 25) {
    return {
      label: "Within typical operating range",
      note: "5–25°F covers fixed-orifice (chart-based) and TXV (8–15°F target) operation under most ambient conditions. Verify against your equipment&apos;s charging chart.",
      toneClass: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    };
  }
  return {
    label: "High superheat",
    note: "Above 25°F suggests undercharge, a TXV that is over-controlling, an air-flow problem on the evaporator, or a liquid-line restriction starving the evaporator. Check subcooling and indoor airflow before adjusting charge.",
    toneClass: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  };
}
