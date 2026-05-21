"use client";

import { useMemo, useState } from "react";
import { getRefrigerant, refrigerants } from "@/data/refrigerants";
import { PTCurveOverlay, type OverlayRefrigerant } from "@/components/svg/PTCurveOverlay";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";
import type { PTUnit, TempUnit } from "@/components/svg/PTCurve";

const SERIES_COLORS = [
  "var(--c-bubble)", // blue
  "var(--c-safe-a3)", // red
  "var(--c-dew)", // purple
  "var(--c-safe-a2l)", // amber
];

const TOGGLE_BASE =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0";
const TOGGLE_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

const DEFAULT_PICKS = ["r-22", "r-410a", "r-32", "r-454b"];

export function RefrigerantPtComparison() {
  const [slugs, setSlugs] = useState<string[]>(DEFAULT_PICKS);
  const [unit, setUnit] = useState<PTUnit>("psig");
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");

  const overlay = useMemo<OverlayRefrigerant[]>(() => {
    return slugs
      .map((slug, idx): OverlayRefrigerant | null => {
        const r = getRefrigerant(slug);
        if (!r || r.ptChart.length === 0) return null;
        return {
          name: r.displayName,
          points: r.ptChart,
          hasGlide: r.physical.hasSignificantGlide,
          color: SERIES_COLORS[idx % SERIES_COLORS.length],
        };
      })
      .filter((r): r is OverlayRefrigerant => r !== null);
  }, [slugs]);

  const setSlugAt = (idx: number, slug: string) => {
    setSlugs((prev) => prev.map((s, i) => (i === idx ? slug : s)));
  };

  const addSlot = () => {
    if (slugs.length >= 4) return;
    const remaining = refrigerants.find((r) => r.ptChart.length > 0 && !slugs.includes(r.slug));
    if (remaining) setSlugs((s) => [...s, remaining.slug]);
  };

  const removeSlot = (idx: number) => {
    if (slugs.length <= 2) return;
    setSlugs((s) => s.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
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
              <button key={u} type="button" onClick={() => setUnit(u)} aria-pressed={unit === u} className={`${TOGGLE_BASE} ${unit === u ? TOGGLE_ACTIVE : TOGGLE_IDLE}`}>{u === "psig" ? "PSIG" : "kPa"}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slugs.map((slug, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-sm shrink-0"
              aria-hidden="true"
              style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }}
            />
            <RefrigerantSelector value={slug} onChange={(s) => setSlugAt(idx, s)} className="flex-1" />
            {slugs.length > 2 ? (
              <button type="button" onClick={() => removeSlot(idx)} className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900" aria-label={`Remove ${slug}`}>
                ×
              </button>
            ) : null}
          </div>
        ))}
        {slugs.length < 4 ? (
          <button type="button" onClick={addSlot} className="self-start rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
            + Add a refrigerant
          </button>
        ) : null}
      </div>

      <PTCurveOverlay
        refrigerants={overlay}
        unit={unit}
        tempUnit={tempUnit}
        ariaLabel={`Saturation pressure-temperature overlay for ${overlay.map((r) => r.name).join(", ")}`}
      />

      {overlay.length > 0 ? (
        <p className="text-xs text-zinc-500">
          Solid line = bubble curve, dashed line = dew curve (zeotropic blends only). Charts of refrigerants with very
          different pressure ranges (e.g. R-744 vs anything else) compress; toggle to log scale support is pending.
        </p>
      ) : null}
    </div>
  );
}
