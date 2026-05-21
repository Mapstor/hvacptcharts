"use client";

import { useMemo, useState } from "react";
import { getPressureAtTempF, getRefrigerant } from "@/data/refrigerants";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";
import { cToF, fToC, psigToKpag } from "./shared/units";

type TempUnit = "F" | "C";

const TOGGLE_BASE =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0";
const TOGGLE_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function SaturationPropertiesCalculator({ initialSlug = "r-410a" }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [tempInput, setTempInput] = useState("40");

  const r = useMemo(() => getRefrigerant(slug), [slug]);

  const computation = useMemo(() => {
    if (!r || r.ptChart.length === 0) return { kind: "no-data" as const };
    const raw = Number(tempInput);
    if (!Number.isFinite(raw)) return { kind: "invalid" as const };
    const tempF = tempUnit === "F" ? raw : cToF(raw);
    const p = getPressureAtTempF(slug, tempF);
    if (!p) return { kind: "out-of-range" as const };
    return {
      kind: "ok" as const,
      tempF,
      tempC: tempUnit === "F" ? fToC(tempF) : raw,
      bubblePsig: p.bubble,
      dewPsig: p.dew,
      bubbleKpag: psigToKpag(p.bubble),
      dewKpag: psigToKpag(p.dew),
      glidePsi: Math.abs(p.bubble - p.dew),
    };
  }, [r, slug, tempInput, tempUnit]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="sp-refrig" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Refrigerant</label>
        <RefrigerantSelector id="sp-refrig" value={slug} onChange={setSlug} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Temp unit</span>
        <div className="inline-flex" role="group" aria-label="Temperature unit">
          {(["F", "C"] as const).map((u) => (
            <button key={u} type="button" onClick={() => setTempUnit(u)} aria-pressed={tempUnit === u} className={`${TOGGLE_BASE} ${tempUnit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}>°{u}</button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="sp-t" className="block text-xs uppercase tracking-wide text-zinc-500">
          Saturation temperature (°{tempUnit})
        </label>
        <input
          id="sp-t"
          type="number"
          step={0.5}
          value={tempInput}
          onChange={(e) => setTempInput(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-lg font-mono dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
        {computation.kind === "no-data" ? (
          <span className="text-zinc-500">No PT data available (manual blend).</span>
        ) : computation.kind === "invalid" ? (
          <span className="text-zinc-500">Enter a temperature.</span>
        ) : computation.kind === "out-of-range" ? (
          <span className="text-zinc-500">Outside chart range for this refrigerant.</span>
        ) : (
          <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
            <Prop label="Bubble pressure" valuePsig={computation.bubblePsig} valueKpag={computation.bubbleKpag} />
            <Prop label="Dew pressure" valuePsig={computation.dewPsig} valueKpag={computation.dewKpag} />
            <Prop label="Glide" valuePsig={computation.glidePsi} valueKpag={psigToKpag(computation.glidePsi)} />
          </dl>
        )}
      </div>

      {r ? (
        <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <h3 className="text-sm font-semibold">Refrigerant properties at standard conditions</h3>
          <dl className="mt-2 grid grid-cols-1 gap-y-1 text-xs font-mono sm:grid-cols-2 sm:gap-x-6">
            {r.physical.boilingPointC !== null ? (
              <div>
                <dt className="font-sans uppercase tracking-wide text-zinc-500">Boiling point @ 1 atm</dt>
                <dd>{r.physical.boilingPointC.toFixed(1)}°C / {r.physical.boilingPointF?.toFixed(1)}°F</dd>
              </div>
            ) : null}
            {r.physical.critical.tempC !== null ? (
              <div>
                <dt className="font-sans uppercase tracking-wide text-zinc-500">Critical point</dt>
                <dd>{r.physical.critical.tempC.toFixed(1)}°C, {r.physical.critical.pressurePsig?.toFixed(0)} PSIG</dd>
              </div>
            ) : (
              <div>
                <dt className="font-sans uppercase tracking-wide text-zinc-500">Critical point</dt>
                <dd className="font-sans text-zinc-500">No single point (blend critical locus)</dd>
              </div>
            )}
            {r.physical.molarMassGPerMol !== null ? (
              <div>
                <dt className="font-sans uppercase tracking-wide text-zinc-500">Molar mass</dt>
                <dd>{r.physical.molarMassGPerMol.toFixed(2)} g/mol</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-sans uppercase tracking-wide text-zinc-500">Temperature glide at 0°C</dt>
              <dd>{r.physical.temperatureGlideF.toFixed(2)}°F ({r.physical.hasSignificantGlide ? "significant" : "negligible"})</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <details className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">About density and enthalpy</summary>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Liquid density, vapor density, and enthalpy of vaporization are available from CoolProp for pure refrigerants
          but require an extension to the data generator. Pending that work, this calculator returns saturation
          pressures and the reference properties stored in the dataset. For enthalpy and density today, query CoolProp
          directly with the refrigerant identifier shown on the refrigerant&apos;s detail page.
        </p>
      </details>
    </div>
  );
}

function Prop({ label, valuePsig, valueKpag }: { label: string; valuePsig: number; valueKpag: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 font-mono">
        <span className="text-xl font-semibold">{valuePsig.toFixed(2)}</span>
        <span className="ml-1 text-sm text-zinc-500">PSIG</span>
        <span className="ml-3 text-sm">{valueKpag.toFixed(1)}</span>
        <span className="ml-1 text-xs text-zinc-500">kPa</span>
      </dd>
    </div>
  );
}
