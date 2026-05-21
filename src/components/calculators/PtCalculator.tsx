"use client";

import { useMemo, useState } from "react";
import { getPressureAtTempF, getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";
import { cToF, fToC, kpagToPsig, psigToKpag } from "./shared/units";

type Direction = "tToP" | "pToT";
type TempUnit = "F" | "C";
type PUnit = "psig" | "kpag";

const TOGGLE_BASE =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0";
const TOGGLE_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function PtCalculator({ initialSlug = "r-410a" }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [direction, setDirection] = useState<Direction>("tToP");
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [pUnit, setPUnit] = useState<PUnit>("psig");
  const [tempInput, setTempInput] = useState("70");
  const [pressureInput, setPressureInput] = useState("200");

  const r = useMemo(() => getRefrigerant(slug), [slug]);
  const hasGlide = r?.physical.hasSignificantGlide ?? false;

  const result = useMemo(() => {
    if (!r || r.ptChart.length === 0) {
      return { kind: "no-data" as const };
    }
    if (direction === "tToP") {
      const rawTemp = Number(tempInput);
      if (!Number.isFinite(rawTemp)) return { kind: "invalid" as const };
      const tempF = tempUnit === "F" ? rawTemp : cToF(rawTemp);
      const p = getPressureAtTempF(slug, tempF);
      if (!p) return { kind: "out-of-range" as const };
      return {
        kind: "ok" as const,
        bubble: pUnit === "psig" ? p.bubble : psigToKpag(p.bubble),
        dew: pUnit === "psig" ? p.dew : psigToKpag(p.dew),
      };
    }
    const rawP = Number(pressureInput);
    if (!Number.isFinite(rawP)) return { kind: "invalid" as const };
    const pPsig = pUnit === "psig" ? rawP : kpagToPsig(rawP);
    // For P → T, show bubble (saturation start) AND dew (saturation end) for blends.
    const tBubble = getSaturationTempAtPsigF(slug, pPsig, "bubble");
    const tDew = getSaturationTempAtPsigF(slug, pPsig, "dew");
    if (tBubble === null && tDew === null) return { kind: "out-of-range" as const };
    return {
      kind: "ok-temp" as const,
      tBubbleF: tBubble,
      tDewF: tDew,
    };
  }, [r, slug, direction, tempInput, tempUnit, pressureInput, pUnit]);

  return (
    <div className="space-y-4">
      {/* Refrigerant */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="pt-refrig" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Refrigerant</label>
        <RefrigerantSelector id="pt-refrig" value={slug} onChange={setSlug} />
      </div>

      {/* Direction */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Compute</span>
        <div className="inline-flex" role="group" aria-label="Direction">
          <button
            type="button"
            onClick={() => setDirection("tToP")}
            aria-pressed={direction === "tToP"}
            className={`${TOGGLE_BASE} ${direction === "tToP" ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}
          >
            Pressure from temperature
          </button>
          <button
            type="button"
            onClick={() => setDirection("pToT")}
            aria-pressed={direction === "pToT"}
            className={`${TOGGLE_BASE} ${direction === "pToT" ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}
          >
            Temperature from pressure
          </button>
        </div>
      </div>

      {/* Unit toggles */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Temp</span>
          <div className="inline-flex" role="group" aria-label="Temperature unit">
            {(["F", "C"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setTempUnit(u)}
                aria-pressed={tempUnit === u}
                className={`${TOGGLE_BASE} ${tempUnit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}
              >°{u}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Pressure</span>
          <div className="inline-flex" role="group" aria-label="Pressure unit">
            {(["psig", "kpag"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setPUnit(u)}
                aria-pressed={pUnit === u}
                className={`${TOGGLE_BASE} ${pUnit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}
              >{u === "psig" ? "PSIG" : "kPa"}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pt-input" className="block text-xs uppercase tracking-wide text-zinc-500">
            {direction === "tToP" ? `Temperature (°${tempUnit})` : `Pressure (${pUnit === "psig" ? "PSIG" : "kPa gauge"})`}
          </label>
          <input
            id="pt-input"
            type="number"
            step={direction === "tToP" ? 1 : 0.1}
            value={direction === "tToP" ? tempInput : pressureInput}
            onChange={(e) => {
              const v = e.target.value;
              if (direction === "tToP") setTempInput(v);
              else setPressureInput(v);
            }}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-lg font-mono dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="rounded-md border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950/40">
          <span className="block text-xs uppercase tracking-wide text-zinc-500">Result</span>
          <ResultDisplay
            direction={direction}
            tempUnit={tempUnit}
            pUnit={pUnit}
            result={result}
            hasGlide={hasGlide}
          />
        </div>
      </div>

      {/* Reference card */}
      {r && r.ptChart.length > 0 ? (
        <p className="text-xs text-zinc-500">
          PT chart range for {r.displayName}: {r.ptChart[0].tempF}°F to {r.ptChart[r.ptChart.length - 1].tempF}°F.
          {hasGlide ? ` Zeotropic blend (glide ${r.physical.temperatureGlideF.toFixed(1)}°F at 0°C).` : null}
        </p>
      ) : null}
    </div>
  );
}

interface ResultDisplayProps {
  direction: Direction;
  tempUnit: TempUnit;
  pUnit: PUnit;
  hasGlide: boolean;
  result:
    | { kind: "no-data" }
    | { kind: "invalid" }
    | { kind: "out-of-range" }
    | { kind: "ok"; bubble: number; dew: number }
    | { kind: "ok-temp"; tBubbleF: number | null; tDewF: number | null };
}

function ResultDisplay({ direction, tempUnit, pUnit, hasGlide, result }: ResultDisplayProps) {
  if (result.kind === "no-data") return <span className="text-zinc-500">No PT data available (manual blend).</span>;
  if (result.kind === "invalid") return <span className="text-zinc-500">Enter a number.</span>;
  if (result.kind === "out-of-range") return <span className="text-zinc-500">Outside the chart range for this refrigerant.</span>;

  if (result.kind === "ok") {
    const unit = pUnit === "psig" ? "PSIG" : "kPa";
    return (
      <div className="mt-1 font-mono text-2xl">
        {hasGlide ? (
          <>
            <div>{result.bubble.toFixed(1)} <span className="text-base text-zinc-500">{unit} bubble</span></div>
            <div>{result.dew.toFixed(1)} <span className="text-base text-zinc-500">{unit} dew</span></div>
            <div className="mt-1 text-xs text-zinc-500">Glide {Math.abs(result.bubble - result.dew).toFixed(2)} {unit}</div>
          </>
        ) : (
          <>{result.bubble.toFixed(1)} <span className="text-base text-zinc-500">{unit}</span></>
        )}
      </div>
    );
  }
  // ok-temp
  const convert = (f: number | null) => f === null ? null : tempUnit === "F" ? f : fToC(f);
  const tB = convert(result.tBubbleF);
  const tD = convert(result.tDewF);
  return (
    <div className="mt-1 font-mono text-2xl">
      {hasGlide ? (
        <>
          {tB !== null ? <div>{tB.toFixed(1)} <span className="text-base text-zinc-500">°{tempUnit} bubble</span></div> : null}
          {tD !== null ? <div>{tD.toFixed(1)} <span className="text-base text-zinc-500">°{tempUnit} dew</span></div> : null}
          {tB !== null && tD !== null ? <div className="mt-1 text-xs text-zinc-500">Glide {Math.abs(tB - tD).toFixed(2)}°{tempUnit}</div> : null}
        </>
      ) : (
        <>{(tB ?? tD)?.toFixed(1)} <span className="text-base text-zinc-500">°{tempUnit}</span></>
      )}
    </div>
  );
}
