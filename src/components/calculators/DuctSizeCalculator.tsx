"use client";

import { useMemo, useState } from "react";
import { Calculator, Wind, Gauge, Mountain, Thermometer } from "lucide-react";
import {
  sizeDuct,
  APPLICATION_PRESETS,
  type ApplicationPreset,
} from "@/lib/duct-sizing";

const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const r0 = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "—");
const r3 = (n: number) => (Number.isFinite(n) ? n.toFixed(3) : "—");

const WARNING_STYLES = {
  ok: { tone: "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-900/20", label: "Within recommended range" },
  elevated: { tone: "border-amber-300 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-900/20", label: "Approaching velocity limit" },
  exceeds: { tone: "border-red-300 bg-red-50/60 dark:border-red-700/60 dark:bg-red-900/20", label: "Exceeds velocity limit — upsize duct" },
};

export function DuctSizeCalculator() {
  const [presetId, setPresetId] = useState<string>("res-supply-trunk");
  const [cfm, setCfm] = useState("400");
  const [frictionOverride, setFrictionOverride] = useState("");
  const [altitudeFt, setAltitudeFt] = useState("0");
  const [tempF, setTempF] = useState("70");

  const preset: ApplicationPreset = APPLICATION_PRESETS.find((p) => p.id === presetId) ?? APPLICATION_PRESETS[0];
  const friction = frictionOverride === "" ? preset.friction : Number(frictionOverride);

  const result = useMemo(() => {
    return sizeDuct({
      cfm: Number(cfm),
      frictionTarget: friction,
      tempF: Number(tempF) || 70,
      altitudeFt: Number(altitudeFt) || 0,
      maxVelocity: preset.maxVelocity,
    });
  }, [cfm, friction, tempF, altitudeFt, preset.maxVelocity]);

  const warningTone = result?.velocityWarning ? WARNING_STYLES[result.velocityWarning] : null;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Duct size calculator — equal-friction method
        </span>
      </div>

      <div className="p-3 sm:p-4">
        {/* Application preset */}
        <div className="mb-3">
          <label htmlFor="duct-preset" className="block text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Application
          </label>
          <select
            id="duct-preset"
            value={presetId}
            onChange={(e) => { setPresetId(e.target.value); setFrictionOverride(""); }}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {APPLICATION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label} — {r2(p.friction)} in.w.c./100ft, max {p.maxVelocity} fpm</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-zinc-500">{preset.notes}</p>
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="duct-cfm" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Wind className="h-3 w-3" /> CFM
            </label>
            <input
              id="duct-cfm"
              type="number"
              step={10}
              min={1}
              value={cfm}
              onChange={(e) => setCfm(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="duct-friction" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Gauge className="h-3 w-3" /> Friction (in.w.c./100ft)
            </label>
            <input
              id="duct-friction"
              type="number"
              step={0.01}
              min={0.01}
              placeholder={`${preset.friction}`}
              value={frictionOverride}
              onChange={(e) => setFrictionOverride(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[10px] text-zinc-500">Default from preset: {preset.friction}</p>
          </div>
          <div>
            <label htmlFor="duct-alt" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Mountain className="h-3 w-3" /> Altitude (ft)
            </label>
            <input
              id="duct-alt"
              type="number"
              step={100}
              value={altitudeFt}
              onChange={(e) => setAltitudeFt(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="duct-temp" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Thermometer className="h-3 w-3" /> Air temp (°F)
            </label>
            <input
              id="duct-temp"
              type="number"
              step={5}
              value={tempF}
              onChange={(e) => setTempF(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[10px] text-zinc-500">ρ = {r3(result?.density ?? 0.075)} lb/ft³</p>
          </div>
        </div>

        {result ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border-2 border-blue-300 bg-blue-50/60 p-3 dark:border-blue-700/60 dark:bg-blue-950/30">
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Standard round duct</div>
                <div className="mt-1 font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">{result.standardDiameter}″</div>
                <div className="mt-1 text-[11px] text-zinc-500">exact calc: {r1(result.exactDiameter)}″ — rounded up to standard size</div>
              </div>
              <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Velocity at standard size</div>
                <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">{r0(result.velocityAtStandard)}<span className="text-sm font-normal text-zinc-500"> fpm</span></div>
                <div className="mt-1 text-[11px] text-zinc-500">limit: {preset.maxVelocity} fpm</div>
              </div>
              <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Friction at standard size</div>
                <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">{r3(result.frictionAtStandard)}<span className="text-sm font-normal text-zinc-500"> in.w.c./100ft</span></div>
                <div className="mt-1 text-[11px] text-zinc-500">target: {r2(result.frictionTarget)}</div>
              </div>
            </div>

            {warningTone ? (
              <div className={`mt-3 rounded-md border p-3 text-sm ${warningTone.tone}`}>
                <strong>{warningTone.label}.</strong>{" "}
                {result.velocityWarning === "exceeds" && `Velocity ${r0(result.velocityAtStandard)} fpm exceeds the ${preset.maxVelocity} fpm limit for ${preset.label.toLowerCase()}. Upsize to the next standard duct.`}
                {result.velocityWarning === "elevated" && `Velocity is within 10% of the ${preset.maxVelocity} fpm limit — consider upsizing for quieter operation.`}
                {result.velocityWarning === "ok" && `Velocity comfortably within ${preset.label.toLowerCase()} limits.`}
              </div>
            ) : null}

            {result.rectangularEquivalents.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Rectangular equivalents (Huebscher — same friction at same CFM)
                </h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {result.rectangularEquivalents.map((r) => (
                    <div key={`${r.width}x${r.height}`} className="rounded-md border border-zinc-200 bg-white p-2 text-center text-xs dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">{r.width}″ × {r.height}″</div>
                      <div className="text-[10px] text-zinc-500">aspect {r1(r.aspectRatio)}:1 · D_eq {r1(r.equivDiameter)}″</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
            Enter a positive CFM and friction rate.
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          Equal-friction method per ACCA Manual D / ASHRAE Handbook Fundamentals 2021 Chapter 21. Friction equation: ΔP/100ft = 0.0307 × (V/100)^1.9 / D^1.22 (galvanized steel, ε = 0.0003 ft). Velocity: V = 576 × Q / (π × D²). Huebscher rectangular equivalent: D_eq = 1.30 × (a·b)^0.625 / (a+b)^0.25. Standard round duct sizes per SMACNA. Aspect ratios over 4:1 are excluded; per Manual D they suffer friction penalties beyond Huebscher prediction.
        </p>
      </div>
    </div>
  );
}
