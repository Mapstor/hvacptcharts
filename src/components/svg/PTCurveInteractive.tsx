"use client";

import { useMemo, useState } from "react";
import type { PTPoint } from "@/data/refrigerants";
import { PTCurve, type PTUnit, type TempUnit } from "./PTCurve";

export interface PTCurveInteractiveProps {
  points: PTPoint[];
  hasGlide: boolean;
  /** Initial pressure unit. */
  initialUnit?: PTUnit;
  /** Initial temperature unit. */
  initialTempUnit?: TempUnit;
  /** Optional highlight value in °F. */
  highlightTempF?: number;
  ariaLabel: string;
  className?: string;
}

const TOGGLE_BTN =
  "px-2.5 py-1 text-xs font-medium border border-zinc-300 dark:border-zinc-700 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 transition-colors";
const TOGGLE_BTN_ACTIVE = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const TOGGLE_BTN_IDLE = "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function PTCurveInteractive({
  points,
  hasGlide,
  initialUnit = "psig",
  initialTempUnit = "F",
  highlightTempF,
  ariaLabel,
  className = "",
}: PTCurveInteractiveProps) {
  const [unit, setUnit] = useState<PTUnit>(initialUnit);
  const [tempUnit, setTempUnit] = useState<TempUnit>(initialTempUnit);

  // Highlight value at 70°F by default if not specified; toggle independently.
  const [highlight, setHighlight] = useState<number | undefined>(highlightTempF ?? 70);

  const minTempF = useMemo(() => Math.min(...points.map((p) => p.tempF)), [points]);
  const maxTempF = useMemo(() => Math.max(...points.map((p) => p.tempF)), [points]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Pressure</span>
          <div className="inline-flex" role="group" aria-label="Pressure unit">
            {(["psig", "kpag"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`${TOGGLE_BTN} ${unit === u ? TOGGLE_BTN_ACTIVE : TOGGLE_BTN_IDLE}`}
              >
                {u === "psig" ? "PSIG" : "kPa"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Temperature</span>
          <div className="inline-flex" role="group" aria-label="Temperature unit">
            {(["F", "C"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setTempUnit(u)}
                aria-pressed={tempUnit === u}
                className={`${TOGGLE_BTN} ${tempUnit === u ? TOGGLE_BTN_ACTIVE : TOGGLE_BTN_IDLE}`}
              >
                °{u}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pt-highlight" className="text-xs uppercase tracking-wide text-zinc-500">
            Highlight at
          </label>
          <input
            id="pt-highlight"
            type="number"
            step={1}
            min={minTempF}
            max={maxTempF}
            value={highlight ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setHighlight(v === "" ? undefined : Number(v));
            }}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Highlight temperature in degrees Fahrenheit"
          />
          <span className="text-xs text-zinc-500">°F</span>
        </div>
      </div>
      <PTCurve
        points={points}
        hasGlide={hasGlide}
        unit={unit}
        tempUnit={tempUnit}
        highlightTempF={highlight}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
