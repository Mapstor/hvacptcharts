"use client";

import { useMemo, useState } from "react";
import { Calculator, Wind, Thermometer, AlertTriangle, Printer } from "lucide-react";

/**
 * Fixed-orifice / piston target-superheat matrix.
 *
 * Formula: TSH(WB, DB) = ((3 × WB) − 80 − DB) / 2
 *
 * Standard fixed-orifice charging method credited to ACCA Manual T and
 * OEM (Carrier / Trane / Lennox) service bulletins. Applies to fixed-
 * orifice, piston, and capillary-tube metering devices. TXV and EEV
 * systems charge by subcooling, not superheat — a target-superheat lookup
 * gives the wrong answer for those.
 *
 * Cells with TSH < 5°F render as "—". Industry charging charts (Trane and
 * Carrier bead charts) blank out targets under ~5°F because charging by
 * superheat is unreliable there: any moderate probe error swamps the
 * target, and the operating point is often outside the fixed-orifice
 * envelope. Clamp-at-zero alone would print misleading 0–4°F targets that
 * techs would then chase without success.
 */

export interface ChargingChartMatrixProps {
  /** Interactive lookup label, e.g. "R-410A target superheat". */
  label: string;
  /**
   * WB row values in °F. Default: 50–76 in 2°F steps (14 rows).
   */
  wbRows?: number[];
  /**
   * Outdoor DB column values in °F. Default: 55–115 in 5°F steps (13 cols).
   */
  dbCols?: number[];
}

const DEFAULT_WB_ROWS = [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76];
const DEFAULT_DB_COLS = [55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115];
const MIN_RELIABLE_TSH = 5;

/**
 * Target superheat in °F for a given indoor wet-bulb and outdoor dry-bulb.
 * Exported so build-time assertions and non-React consumers (e.g. static
 * matrix renderers) share the exact same computation as the client.
 */
export function targetSuperheatF(wb: number, db: number): number {
  return (3 * wb - 80 - db) / 2;
}

/**
 * Formatted target — "—" when below the reliability floor, else one decimal.
 * Same rounding convention as fmtPsigBubble so on-page numeric text is
 * uniformly presented.
 */
export function formatTarget(wb: number, db: number): string {
  const t = targetSuperheatF(wb, db);
  return t < MIN_RELIABLE_TSH ? "—" : t.toFixed(1);
}

// Build-time assertions: catch a bad refactor of the formula before ship.
// If any of these throw, the module fails to load and the build fails.
(function assertFormula() {
  const checks: Array<[number, number, number | "—"]> = [
    [64, 95, 8.5],   // the canonical spec assertion
    [70, 95, 17.5],  // middle of envelope
    [50, 115, -22.5], // low-WB high-DB corner (< 5 — displays as "—")
    [76, 55, 46.5],  // high-WB low-DB corner
  ];
  for (const [wb, db, expected] of checks) {
    const actual = targetSuperheatF(wb, db);
    if (Math.abs(actual - (expected as number)) > 0.0001) {
      throw new Error(
        `ChargingChartMatrix formula regression: TSH(${wb},${db}) = ${actual}, expected ${expected}`,
      );
    }
  }
})();

export function ChargingChartMatrix({
  label,
  wbRows = DEFAULT_WB_ROWS,
  dbCols = DEFAULT_DB_COLS,
}: ChargingChartMatrixProps) {
  const [wb, setWb] = useState<string>("67");
  const [db, setDb] = useState<string>("95");

  const result = useMemo(() => {
    const wbN = Number(wb);
    const dbN = Number(db);
    if (!Number.isFinite(wbN) || !Number.isFinite(dbN)) return null;
    const tsh = targetSuperheatF(wbN, dbN);
    return { wb: wbN, db: dbN, tsh };
  }, [wb, db]);

  const reliable = result !== null && result.tsh >= MIN_RELIABLE_TSH;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900/40 dark:from-blue-950/20 dark:to-zinc-950">
      <div className="flex items-center gap-2 border-b border-blue-200/60 bg-blue-100/40 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/30">
        <Calculator className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          Interactive lookup — {label}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* The two inputs stay side-by-side at every viewport including 360px —
            grid-cols-2 unconditionally, helper text wraps rather than stacking.
            Techs using this in the field on a phone need both fields visible at
            once for the WB × DB lookup. */}
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <label htmlFor="ccm-wb" className="flex items-start gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <Wind className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span className="min-w-0">1. Indoor wet-bulb (°F)</span>
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">Measured at the return-air grille with a wet-wick psychrometer. Typical cooling: 60–72°F WB.</p>
            <input
              id="ccm-wb"
              type="number"
              min={50}
              max={76}
              step={1}
              value={wb}
              onChange={(e) => setWb(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="ccm-db" className="flex items-start gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span className="min-w-0">2. Outdoor dry-bulb (°F)</span>
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">Shaded thermometer near the condenser. Design condition: 95°F.</p>
            <input
              id="ccm-db"
              type="number"
              min={55}
              max={115}
              step={1}
              value={db}
              onChange={(e) => setDb(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        {result ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-900/40 dark:bg-zinc-950">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Target superheat</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-blue-800 dark:text-blue-200">
              {formatTarget(result.wb, result.db)}{reliable ? "°F" : ""}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              TSH = ((3 × {result.wb}) − 80 − {result.db}) / 2 = {result.tsh.toFixed(2)}°F
            </div>
            {!reliable ? (
              <div className="mt-3 flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  Target below 5°F is unreliable — probe error swamps the setpoint. Verify indoor WB and outdoor DB. These conditions may mean the system is running outside its fixed-orifice charging envelope; consider whether the equipment is TXV/EEV (charge by subcooling instead).
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900">
                <th className="border-b border-r border-zinc-200 px-2 py-1.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">WB \ DB</th>
                {dbCols.map((db) => (
                  <th key={db} className="border-b border-zinc-200 px-2 py-1.5 text-right dark:border-zinc-800">{db}°F</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wbRows.map((wbRow) => (
                <tr key={wbRow} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                  <th className="border-r border-zinc-200 bg-zinc-50/50 px-2 py-1.5 text-right dark:border-zinc-800 dark:bg-zinc-900/50">{wbRow}°F</th>
                  {dbCols.map((dbCol) => {
                    const display = formatTarget(wbRow, dbCol);
                    const isPlaceholder = display === "—";
                    return (
                      <td key={dbCol} className={`px-2 py-1.5 text-right ${isPlaceholder ? "text-zinc-400 dark:text-zinc-600" : ""}`}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          — = target below 5°F; superheat charging not recommended at these conditions. Industry convention on Trane and Carrier bead charts.
        </p>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Printer className="h-3.5 w-3.5" /> Save / print as PDF
        </button>
      </div>
    </div>
  );
}
