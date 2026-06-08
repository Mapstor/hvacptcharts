"use client";

import { useState } from "react";
import { ArrowRight, Calculator, Thermometer } from "lucide-react";
import type { PTPoint } from "@/data/refrigerants";

export interface QuickPTLookupProps {
  displayName: string;
  slug: string;
  ptChart: PTPoint[];
  hasGlide: boolean;
}

type Unit = "F" | "C";

/**
 * Inline mini PT calculator on the per-refrigerant page. Enter a temperature
 * in °F or °C; get the saturation pressure in PSIG / kPa. Bubble + dew shown
 * for zeotropic blends.
 */
export function QuickPTLookup({ displayName, slug, ptChart, hasGlide }: QuickPTLookupProps) {
  const [unit, setUnit] = useState<Unit>("F");
  const [input, setInput] = useState("70");

  // No manual memoization here — React 19's compiler auto-memoizes pure
  // derivations. Adding useMemo here causes the compiler to bail on this
  // component (see react-hooks/preserve-manual-memoization). The work is
  // cheap (one sort of ~191 entries, one linear scan) so even an un-memoized
  // recompute on every keystroke is well under a frame.
  const sorted = [...ptChart].sort((a, b) => a.tempF - b.tempF);
  const minF = sorted[0]?.tempF;
  const maxF = sorted[sorted.length - 1]?.tempF;

  const result = (() => {
    if (sorted.length === 0) return null;
    const raw = Number(input);
    if (!Number.isFinite(raw)) return null;
    const f = unit === "F" ? raw : (raw * 9) / 5 + 32;
    if (f < (minF ?? -Infinity) || f > (maxF ?? Infinity)) return { outOfRange: true as const };
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (a.tempF <= f && f <= b.tempF) {
        const t = b.tempF === a.tempF ? 0 : (f - a.tempF) / (b.tempF - a.tempF);
        return {
          outOfRange: false as const,
          bubblePsig: a.bubblePsig + t * (b.bubblePsig - a.bubblePsig),
          dewPsig: a.dewPsig + t * (b.dewPsig - a.dewPsig),
          bubbleKpag: a.bubbleKpag + t * (b.bubbleKpag - a.bubbleKpag),
          dewKpag: a.dewKpag + t * (b.dewKpag - a.dewKpag),
          tempF: f,
        };
      }
    }
    return null;
  })();

  const inputRange =
    unit === "F"
      ? `${minF?.toFixed(0) ?? "?"} to ${maxF?.toFixed(0) ?? "?"}°F`
      : `${minF !== undefined ? Math.ceil(((minF - 32) * 5) / 9) : "?"} to ${
          maxF !== undefined ? Math.floor(((maxF - 32) * 5) / 9) : "?"
        }°C`;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Quick lookup — {displayName}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid items-end gap-3 sm:grid-cols-[auto_1fr_auto_auto]">
          <div className="inline-flex rounded-md border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setUnit("F")}
              aria-pressed={unit === "F"}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                unit === "F"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              °F
            </button>
            <button
              type="button"
              onClick={() => setUnit("C")}
              aria-pressed={unit === "C"}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                unit === "C"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              °C
            </button>
          </div>

          <label className="flex items-center gap-2">
            <span className="sr-only">Temperature in {unit === "F" ? "Fahrenheit" : "Celsius"}</span>
            <span className="text-xs text-zinc-500">Temp:</span>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={unit === "F" ? "70" : "21"}
              className="w-24 rounded-md border border-zinc-300 px-2.5 py-1.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-xs text-zinc-500">°{unit}</span>
          </label>

          <ArrowRight className="hidden h-4 w-4 text-zinc-400 sm:block" aria-hidden />

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {result === null ? (
              <span className="text-xs text-zinc-500">Enter a number</span>
            ) : result.outOfRange ? (
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Out of range ({inputRange})
              </span>
            ) : hasGlide ? (
              <>
                <span className="font-mono text-sm">
                  <span className="text-blue-700 dark:text-blue-300">{result.bubblePsig.toFixed(1)}</span>
                  <span className="text-zinc-400"> / </span>
                  <span className="text-purple-700 dark:text-purple-300">{result.dewPsig.toFixed(1)}</span>
                  <span className="ml-1 text-[11px] text-zinc-500">PSIG</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  ({formatKpa(result.bubbleKpag)} / {formatKpa(result.dewKpag)} kPa)
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-sm">
                  <span className="font-semibold">{result.bubblePsig.toFixed(1)}</span>
                  <span className="ml-1 text-[11px] text-zinc-500">PSIG</span>
                </span>
                <span className="text-[11px] text-zinc-500">({formatKpa(result.bubbleKpag)} kPa)</span>
              </>
            )}
          </div>
        </div>

        {hasGlide ? (
          <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Bubble
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Dew
            </span>
            <span>· zeotropic blend</span>
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="h-2.5 w-2.5" /> Range: {inputRange}
          </span>
          <a
            href={`/pt-calculator/?refrigerant=${slug}`}
            className="text-blue-700 hover:underline dark:text-blue-300"
          >
            Open full PT calculator →
          </a>
        </div>
      </div>
    </div>
  );
}

function formatKpa(v: number): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
