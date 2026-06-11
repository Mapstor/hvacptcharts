"use client";

import { useMemo, useState } from "react";
import { Calculator, Thermometer, Droplet, Wind, Mountain } from "lucide-react";
import {
  computePsychrometricState,
  atmPressureAtAltitudeFt,
  type PsychrometricInputMode,
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

export function PsychrometricCalculator() {
  const [mode, setMode] = useState<Mode>("DB_RH");
  const [tempDb, setTempDb] = useState("78");
  const [tempWb, setTempWb] = useState("65");
  const [rh, setRh] = useState("50");
  const [tempDp, setTempDp] = useState("57");
  const [altitudeFt, setAltitudeFt] = useState("0");

  const pAtm = atmPressureAtAltitudeFt(Number(altitudeFt) || 0);

  const state = useMemo(() => {
    const inputs = {
      mode,
      tempDbF: Number(tempDb),
      tempWbF: Number(tempWb),
      rhPercent: Number(rh),
      tempDpF: Number(tempDp),
      pAtmPsia: pAtm,
    };
    return computePsychrometricState(inputs);
  }, [mode, tempDb, tempWb, rh, tempDp, pAtm]);

  const showFirst = MODE_LABELS[mode].first;
  const showSecond = MODE_LABELS[mode].second;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Psychrometric calculator — 7 air properties from any 2 inputs
        </span>
      </div>

      <div className="p-3 sm:p-4">
        {/* Mode selector */}
        <div className="mb-4">
          <label htmlFor="psy-mode" className="block text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Which two properties do you have?
          </label>
          <select
            id="psy-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {Object.entries(MODE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-3">
          {/* First input */}
          <div>
            <label htmlFor="psy-first" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Thermometer className="h-3 w-3" /> {showFirst === "DB" ? "Dry-bulb (°F)" : showFirst === "WB" ? "Wet-bulb (°F)" : "Dew point (°F)"}
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
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {/* Second input */}
          <div>
            <label htmlFor="psy-second" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              {showSecond === "RH" ? <Droplet className="h-3 w-3" /> : <Thermometer className="h-3 w-3" />}
              {showSecond === "RH" ? "Relative humidity (%)" : showSecond === "WB" ? "Wet-bulb (°F)" : "Dew point (°F)"}
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
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {/* Altitude */}
          <div>
            <label htmlFor="psy-alt" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Mountain className="h-3 w-3" /> Altitude (ft)
            </label>
            <input
              id="psy-alt"
              type="number"
              step={50}
              value={altitudeFt}
              onChange={(e) => setAltitudeFt(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[10px] text-zinc-500">P = {r2(pAtm)} psia</p>
          </div>
        </div>

        {state ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Stat label="Dry-bulb" value={`${r1(state.tempDbF)}°F`} sub="primary temperature" />
            <Stat label="Wet-bulb" value={`${r1(state.tempWbF)}°F`} sub="evaporation-cooled" highlight={mode !== "DB_WB" && mode !== "WB_DP"} />
            <Stat label="Dew point" value={`${r1(state.tempDpF)}°F`} sub="condensation threshold" highlight={mode !== "DB_DP" && mode !== "WB_DP"} />
            <Stat label="Relative humidity" value={`${r1(state.rhPercent)}%`} sub="Pw / Pws @ DB" highlight={mode !== "DB_RH"} />
            <Stat label="Humidity ratio" value={`${r4(state.humidityRatio)}`} sub="lb H₂O / lb dry air" />
            <Stat label="Grains H₂O" value={`${r1(state.grainsPerLb)}`} sub="grains / lb dry air" />
            <Stat label="Enthalpy" value={`${r2(state.enthalpyBtuPerLb)}`} sub="BTU / lb dry air" />
            <Stat label="Specific volume" value={`${r2(state.specificVolumeFt3PerLb)}`} sub="ft³ / lb dry air" />
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
            <strong>Cannot solve.</strong> Check that inputs are consistent and within physical limits (DP ≤ WB ≤ DB; RH 0-100%).
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          Equations: ASHRAE Handbook of Fundamentals 2021, Chapter 1. Saturation vapor pressure via Magnus form (±0.3% in HVAC range). Wet-bulb solved by bisection of the psychrometric equation. Highlighted values are computed (not entered).
        </p>
      </div>
    </div>
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
