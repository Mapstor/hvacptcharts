"use client";

import { useMemo, useState } from "react";
import { getPressureAtTempF, getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";
import { cToF, fToC, kpagToPsig, psigToKpag, deltaFtoC } from "./shared/units";

type TempUnit = "F" | "C";
type PUnit = "psig" | "kpag";

const TOGGLE_BASE =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0";
const TOGGLE_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function CombinedCalculator({ initialSlug = "r-410a" }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [pUnit, setPUnit] = useState<PUnit>("psig");

  const [suctionP, setSuctionP] = useState("130");
  const [suctionT, setSuctionT] = useState("60");
  const [liquidP, setLiquidP] = useState("380");
  const [liquidT, setLiquidT] = useState("95");

  const r = useMemo(() => getRefrigerant(slug), [slug]);
  const hasGlide = r?.physical.hasSignificantGlide ?? false;

  const sh = useMemo(() => {
    if (!r) return null;
    const p = Number(suctionP);
    const t = Number(suctionT);
    if (!Number.isFinite(p) || !Number.isFinite(t)) return null;
    const psig = pUnit === "psig" ? p : kpagToPsig(p);
    const measuredF = tempUnit === "F" ? t : cToF(t);
    const satF = getSaturationTempAtPsigF(slug, psig, "dew");
    if (satF === null) return { satF: null, superheatF: null, psig, measuredF };
    return { satF, superheatF: measuredF - satF, psig, measuredF };
  }, [r, slug, suctionP, suctionT, pUnit, tempUnit]);

  const sc = useMemo(() => {
    if (!r) return null;
    const p = Number(liquidP);
    const t = Number(liquidT);
    if (!Number.isFinite(p) || !Number.isFinite(t)) return null;
    const psig = pUnit === "psig" ? p : kpagToPsig(p);
    const measuredF = tempUnit === "F" ? t : cToF(t);
    const satF = getSaturationTempAtPsigF(slug, psig, "bubble");
    if (satF === null) return { satF: null, subcoolingF: null, psig, measuredF };
    return { satF, subcoolingF: satF - measuredF, psig, measuredF };
  }, [r, slug, liquidP, liquidT, pUnit, tempUnit]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="cb-refrig" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Refrigerant</label>
        <RefrigerantSelector id="cb-refrig" value={slug} onChange={setSlug} />
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

      {/* Suction side */}
      <div className="rounded-md border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
        <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">Low side — suction line (superheat)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cb-sp" className="block text-xs uppercase tracking-wide text-zinc-500">Suction PSIG</label>
            <input id="cb-sp" type="number" step={0.1} value={suctionP} onChange={(e) => setSuctionP(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
          <div>
            <label htmlFor="cb-st" className="block text-xs uppercase tracking-wide text-zinc-500">Suction line temp</label>
            <input id="cb-st" type="number" step={0.1} value={suctionT} onChange={(e) => setSuctionT(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
          <ResultBox label="Superheat" valueF={sh?.superheatF ?? null} tempUnit={tempUnit} />
        </div>
        {sh && sh.satF !== null ? (
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Saturation temp at suction P: {(tempUnit === "F" ? sh.satF : fToC(sh.satF)).toFixed(1)}°{tempUnit}
            {hasGlide ? " (dew curve)" : null}
          </p>
        ) : null}
      </div>

      {/* High side */}
      <div className="rounded-md border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <h3 className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-100">High side — liquid line (subcooling)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cb-lp" className="block text-xs uppercase tracking-wide text-zinc-500">Liquid PSIG</label>
            <input id="cb-lp" type="number" step={0.1} value={liquidP} onChange={(e) => setLiquidP(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
          <div>
            <label htmlFor="cb-lt" className="block text-xs uppercase tracking-wide text-zinc-500">Liquid line temp</label>
            <input id="cb-lt" type="number" step={0.1} value={liquidT} onChange={(e) => setLiquidT(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900" />
          </div>
          <ResultBox label="Subcooling" valueF={sc?.subcoolingF ?? null} tempUnit={tempUnit} />
        </div>
        {sc && sc.satF !== null ? (
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Saturation temp at liquid P: {(tempUnit === "F" ? sc.satF : fToC(sc.satF)).toFixed(1)}°{tempUnit}
            {hasGlide ? " (bubble curve)" : null}
          </p>
        ) : null}
      </div>

      {/* Combined diagnostic */}
      {sh?.superheatF !== null && sh?.superheatF !== undefined && sc?.subcoolingF !== null && sc?.subcoolingF !== undefined ? (
        <CombinedDiagnostic superheatF={sh.superheatF} subcoolingF={sc.subcoolingF} />
      ) : null}
    </div>
  );
}

function ResultBox({ label, valueF, tempUnit }: { label: string; valueF: number | null; tempUnit: TempUnit }) {
  return (
    <div className="rounded-md border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950/40">
      <span className="block text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      {valueF === null ? (
        <span className="text-zinc-500">—</span>
      ) : (
        <span className="font-mono text-2xl font-bold">
          {(tempUnit === "F" ? valueF : deltaFtoC(valueF)).toFixed(1)}
          <span className="ml-1 text-base font-normal text-zinc-500">°{tempUnit}</span>
        </span>
      )}
    </div>
  );
}

function CombinedDiagnostic({ superheatF, subcoolingF }: { superheatF: number; subcoolingF: number }) {
  // Classic interpretation matrix.
  let label = "";
  let note = "";
  let tone = "";

  if (superheatF < 0 || subcoolingF < 0) {
    label = "Out-of-range condition";
    note = "Negative superheat (slugging) or negative subcooling (vapor in liquid line) — stop and diagnose before continuing.";
    tone = "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100";
  } else if (superheatF < 8 && subcoolingF > 15) {
    label = "Likely overcharge";
    note = "Low superheat + high subcooling is the classic overcharge fingerprint. Verify condenser airflow and coil cleanliness first, then recover refrigerant in measured amounts.";
    tone = "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
  } else if (superheatF > 25 && subcoolingF < 3) {
    label = "Likely undercharge";
    note = "High superheat + low subcooling is the undercharge fingerprint. Check for leaks before adding refrigerant.";
    tone = "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
  } else if (superheatF >= 8 && superheatF <= 25 && subcoolingF >= 3 && subcoolingF <= 15) {
    label = "Charge appears correct";
    note = "Both superheat and subcooling fall in typical ranges. Cross-check against the equipment manufacturer's charging spec for the specific setpoint.";
    tone = "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
  } else {
    label = "Mixed indicators";
    note = "Neither classic overcharge nor undercharge fingerprint. Consider system-side factors: low indoor airflow (high evaporator temperature inflating superheat), restricted condenser (high subcooling without overcharge), incorrect metering device sizing.";
    tone = "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300";
  }

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${tone}`}>
      <strong className="font-semibold">{label}</strong>
      <span> · {note}</span>
    </div>
  );
}
