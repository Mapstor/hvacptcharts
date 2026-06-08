"use client";

import { useMemo, useRef, useState } from "react";
import { Printer, Table as TableIcon } from "lucide-react";
import type { PTPoint } from "@/data/refrigerants";

export interface PTDataTableProps {
  displayName: string;
  ptChart: PTPoint[];
  hasGlide: boolean;
  /** Primary application group — drives application-specific highlights. */
  applicationGroup?: string | null;
}

type Unit = "F" | "C";
type Tone = "amber" | "sky" | "emerald" | "rose" | "violet";

interface RowHighlight {
  label: string;
  tone: Tone;
}

const TONE_BG: Record<Tone, string> = {
  amber: "bg-amber-100/60 dark:bg-amber-950/40",
  sky: "bg-sky-100/60 dark:bg-sky-950/40",
  emerald: "bg-emerald-100/60 dark:bg-emerald-950/40",
  rose: "bg-rose-100/60 dark:bg-rose-950/40",
  violet: "bg-violet-100/60 dark:bg-violet-950/40",
};

const TONE_TAG: Record<Tone, string> = {
  amber: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200",
  sky: "bg-sky-200 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200",
  emerald: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200",
  rose: "bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200",
  violet: "bg-violet-200 text-violet-900 dark:bg-violet-900/60 dark:text-violet-200",
};

interface RefTemp {
  tempF: number;
  label: string;
  tone: Tone;
}

/** Universal landmarks applied regardless of application family. */
const UNIVERSAL_REFS: RefTemp[] = [
  { tempF: 32, label: "H₂O freeze", tone: "sky" },
];

/** Application-specific operating-temperature landmarks. */
const APP_REFS: Record<string, RefTemp[]> = {
  "residential-ac": [
    { tempF: 40, label: "AC evap target", tone: "violet" },
    { tempF: 70, label: "Room T", tone: "emerald" },
    { tempF: 95, label: "AHRI design ambient", tone: "amber" },
    { tempF: 110, label: "Typical cond saturation", tone: "rose" },
  ],
  "commercial-refrigeration-medium-temp": [
    { tempF: 20, label: "MT evap target", tone: "violet" },
    { tempF: 35, label: "MT box temp", tone: "emerald" },
    { tempF: 95, label: "AHRI design ambient", tone: "amber" },
    { tempF: 110, label: "Cond saturation", tone: "rose" },
  ],
  "commercial-refrigeration-low-temp": [
    { tempF: -40, label: "Deep freeze evap", tone: "violet" },
    { tempF: -20, label: "LT evap target", tone: "violet" },
    { tempF: 0, label: "LT box temp", tone: "emerald" },
    { tempF: 95, label: "AHRI design ambient", tone: "amber" },
    { tempF: 110, label: "Cond saturation", tone: "rose" },
  ],
  "centrifugal-chillers-low-pressure": [
    { tempF: 40, label: "Chiller evap LCHW", tone: "violet" },
    { tempF: 100, label: "Cond saturation", tone: "amber" },
    { tempF: 130, label: "High-side limit", tone: "rose" },
  ],
  "centrifugal-chillers-medium-pressure": [
    { tempF: 40, label: "Chiller evap LCHW", tone: "violet" },
    { tempF: 100, label: "Cond saturation", tone: "amber" },
    { tempF: 130, label: "High-side limit", tone: "rose" },
  ],
  "mobile-ac": [
    { tempF: 35, label: "MAC evap target", tone: "violet" },
    { tempF: 100, label: "Cabin ambient", tone: "amber" },
    { tempF: 140, label: "Engine bay cond", tone: "rose" },
  ],
  "industrial-refrigeration": [
    { tempF: -40, label: "Industrial LT evap", tone: "violet" },
    { tempF: 0, label: "Industrial MT evap", tone: "emerald" },
    { tempF: 95, label: "Ambient", tone: "amber" },
  ],
  "domestic-refrigeration": [
    { tempF: 0, label: "Freezer compartment", tone: "violet" },
    { tempF: 40, label: "Fridge compartment", tone: "emerald" },
    { tempF: 90, label: "Hot day ambient", tone: "amber" },
  ],
  "r-22-retrofits": [
    { tempF: 40, label: "AC evap target", tone: "violet" },
    { tempF: 70, label: "Room T", tone: "emerald" },
    { tempF: 95, label: "AHRI design ambient", tone: "amber" },
    { tempF: 110, label: "Typical cond saturation", tone: "rose" },
  ],
};

function buildFHighlights(
  rows: PTPoint[],
  applicationGroup?: string | null,
): { map: Map<number, RowHighlight>; legend: string[] } {
  const map = new Map<number, RowHighlight>();
  const legend: string[] = [];
  if (rows.length === 0) return { map, legend };

  // NBP — only mark when bubblePsig crosses from < 0 to >= 0 INSIDE the
  // chart range. Refrigerants whose NBP is below -40°F (R-1150, R-744, R-32,
  // R-410A, etc.) don't get this highlight.
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];
    if (prev.bubblePsig < 0 && curr.bubblePsig >= 0) {
      map.set(curr.tempF, { label: "NBP (atmospheric)", tone: "amber" });
      legend.push("NBP atmospheric crossover");
      break;
    }
  }

  // Combined list: universal + application-specific (if app group resolved)
  const appRefs = applicationGroup ? APP_REFS[applicationGroup] ?? [] : [];
  const combined: RefTemp[] = [...UNIVERSAL_REFS, ...appRefs];

  const seen = new Set<number>(map.keys());
  for (const ref of combined) {
    if (seen.has(ref.tempF)) continue;
    if (rows.some((r) => r.tempF === ref.tempF)) {
      map.set(ref.tempF, { label: ref.label, tone: ref.tone });
      legend.push(`${ref.tempF}°F ${ref.label}`);
      seen.add(ref.tempF);
    }
  }
  return { map, legend };
}

function buildCHighlights(rows: CRow[], fHighlights: Map<number, RowHighlight>): Map<number, RowHighlight> {
  // Map F-indexed highlights to closest C-indexed row
  const map = new Map<number, RowHighlight>();
  for (const [fTemp, hl] of fHighlights.entries()) {
    const targetC = Math.round(((fTemp - 32) * 5) / 9);
    if (rows.some((r) => r.tempC === targetC)) {
      map.set(targetC, hl);
    }
  }
  return map;
}

export function PTDataTable({ displayName, ptChart, hasGlide, applicationGroup }: PTDataTableProps) {
  const [unit, setUnit] = useState<Unit>("F");
  const containerRef = useRef<HTMLDivElement>(null);

  const fRows = useMemo(
    () => [...ptChart].sort((a, b) => a.tempF - b.tempF),
    [ptChart],
  );

  const cRows = useMemo(() => interpolateCelsiusRows(ptChart), [ptChart]);

  const { map: fHighlights, legend } = useMemo(
    () => buildFHighlights(fRows, applicationGroup),
    [fRows, applicationGroup],
  );
  const cHighlights = useMemo(() => buildCHighlights(cRows, fHighlights), [cRows, fHighlights]);

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    const target = containerRef.current;
    if (!target) {
      window.print();
      return;
    }
    // Portal-clone the table to a top-level wrapper at body root so we can
    // display:none everything else (visibility:hidden leaves layout intact and
    // causes blank trailing pages in print output).
    const portal = document.createElement("div");
    portal.id = "pt-print-portal";
    portal.innerHTML = target.outerHTML;
    document.body.appendChild(portal);
    document.body.classList.add("printing-pt-only");
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        portal.remove();
        document.body.classList.remove("printing-pt-only");
      }, 300);
    });
  };

  if (fRows.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="pt-print-target rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Print-only header — hidden on screen, shown in print/PDF output.
          Uses h2 (not h1) so the page maintains a single canonical h1 for
          SEO/accessibility; the printed PDF's prominent header style is
          handled entirely by inline font-size, not by heading level. */}
      <div className="pt-print-heading-only border-b border-zinc-200 px-3 py-3">
        <h2 style={{ fontSize: "16pt", fontWeight: 700, margin: 0 }}>
          {displayName} PT Chart — Pressure-Temperature Saturation Table
        </h2>
        <p style={{ fontSize: "9pt", marginTop: "4px", color: "#555" }}>
          1° increments · Source: CoolProp 7.2.0 / manufacturer datasheet · hvacptcharts.com
        </p>
      </div>

      {/* Header / controls — compact single row */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <TableIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-mono text-xs font-semibold">
            {displayName} · 1° increments · {unit === "F" ? "°F / PSIG" : "°C / kPa"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            role="tablist"
            aria-label="Unit system"
            className="inline-flex rounded-md border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <button
              type="button"
              role="tab"
              aria-selected={unit === "F"}
              onClick={() => setUnit("F")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                unit === "F"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              °F / PSIG
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={unit === "C"}
              onClick={() => setUnit("C")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                unit === "C"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              °C / kPa
            </button>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 print:hidden"
            aria-label={`Print or save as PDF — ${displayName} PT chart only`}
            title={`Print or save the ${displayName} PT chart as PDF`}
          >
            <Printer className="h-3 w-3" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Legend — dynamic, lists only highlights that are actually shown on this page */}
      {legend.length > 0 ? (
        <div className="no-print border-b border-zinc-200 bg-zinc-50/40 px-3 py-2 text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
          <span className="font-semibold uppercase tracking-wider">Tinted rows:</span>{" "}
          {legend.join(" · ")}
        </div>
      ) : null}

      {/* Tables — both in DOM for SEO, one visible at a time */}
      <div className={unit === "F" ? "block overflow-x-auto" : "hidden overflow-x-auto print:block"}>
        <FahrenheitTable rows={fRows} hasGlide={hasGlide} displayName={displayName} highlights={fHighlights} />
      </div>
      <div className={unit === "C" ? "block overflow-x-auto" : "hidden overflow-x-auto print:block"}>
        <CelsiusTable rows={cRows} hasGlide={hasGlide} displayName={displayName} highlights={cHighlights} />
      </div>

      <div className="border-t border-zinc-200 px-3 py-1.5 text-[10px] text-zinc-500 dark:border-zinc-800 print:hidden">
        CoolProp 7.2.0 · PSIG/kPa = gauge · PSIA = PSIG + 14.696 · kPa(abs) = kPa(gauge) + 101.325
      </div>
    </div>
  );
}

/* ──────────────── tables ──────────────── */

function FahrenheitTable({
  rows,
  hasGlide,
  displayName,
  highlights,
}: {
  rows: PTPoint[];
  hasGlide: boolean;
  displayName: string;
  highlights: Map<number, RowHighlight>;
}) {
  return (
    <table className="mx-auto w-full max-w-md text-sm sm:w-auto sm:min-w-[360px]">
      <caption className="sr-only">
        {displayName} pressure-temperature saturation table in Fahrenheit and PSIG
      </caption>
      <thead className="sticky top-0 z-10 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 shadow-[0_1px_0_0_var(--tw-border-color)] dark:bg-zinc-900">
        <tr>
          <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-left font-medium dark:border-zinc-800">
            Temp (°F)
          </th>
          {hasGlide ? (
            <>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Bubble (PSIG)
                </span>
              </th>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Dew (PSIG)
                </span>
              </th>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                Glide (PSI)
              </th>
            </>
          ) : (
            <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
              Pressure (PSIG)
            </th>
          )}
        </tr>
      </thead>
      <tbody className="font-mono">
        {rows.map((p) => {
          const hl = highlights.get(p.tempF);
          const bg = hl ? TONE_BG[hl.tone] : "odd:bg-white even:bg-zinc-50/40 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/30";
          return (
            <tr key={p.tempF} className={bg}>
              <td className="border-b border-zinc-100 px-3 py-1 font-semibold dark:border-zinc-900">
                <span className="inline-flex items-center gap-1.5">
                  <span>{p.tempF.toFixed(0)}°F</span>
                  {hl ? (
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TONE_TAG[hl.tone]}`}>
                      {hl.label}
                    </span>
                  ) : null}
                </span>
              </td>
              {hasGlide ? (
                <>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-blue-700 dark:border-zinc-900 dark:text-blue-300">
                    {p.bubblePsig.toFixed(1)}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-purple-700 dark:border-zinc-900 dark:text-purple-300">
                    {p.dewPsig.toFixed(1)}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-zinc-500 dark:border-zinc-900">
                    {Math.abs(p.bubblePsig - p.dewPsig).toFixed(1)}
                  </td>
                </>
              ) : (
                <td className="border-b border-zinc-100 px-3 py-1 text-right dark:border-zinc-900">
                  {p.bubblePsig.toFixed(1)}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface CRow {
  tempC: number;
  bubbleKpag: number;
  dewKpag: number;
}

function CelsiusTable({
  rows,
  hasGlide,
  displayName,
  highlights,
}: {
  rows: CRow[];
  hasGlide: boolean;
  displayName: string;
  highlights: Map<number, RowHighlight>;
}) {
  return (
    <table className="mx-auto w-full max-w-md text-sm sm:w-auto sm:min-w-[360px]">
      <caption className="sr-only">
        {displayName} pressure-temperature saturation table in Celsius and kPa
      </caption>
      <thead className="sticky top-0 z-10 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
        <tr>
          <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-left font-medium dark:border-zinc-800">
            Temp (°C)
          </th>
          {hasGlide ? (
            <>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Bubble (kPa)
                </span>
              </th>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Dew (kPa)
                </span>
              </th>
              <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
                Glide (kPa)
              </th>
            </>
          ) : (
            <th scope="col" className="border-b border-zinc-200 px-3 py-1.5 text-right font-medium dark:border-zinc-800">
              Pressure (kPa)
            </th>
          )}
        </tr>
      </thead>
      <tbody className="font-mono">
        {rows.map((p) => {
          const hl = highlights.get(p.tempC);
          const bg = hl ? TONE_BG[hl.tone] : "odd:bg-white even:bg-zinc-50/40 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/30";
          return (
            <tr key={p.tempC} className={bg}>
              <td className="border-b border-zinc-100 px-3 py-1 font-semibold dark:border-zinc-900">
                <span className="inline-flex items-center gap-1.5">
                  <span>{p.tempC.toFixed(0)}°C</span>
                  {hl ? (
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TONE_TAG[hl.tone]}`}>
                      {hl.label}
                    </span>
                  ) : null}
                </span>
              </td>
              {hasGlide ? (
                <>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-blue-700 dark:border-zinc-900 dark:text-blue-300">
                    {formatKpa(p.bubbleKpag)}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-purple-700 dark:border-zinc-900 dark:text-purple-300">
                    {formatKpa(p.dewKpag)}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-1 text-right text-zinc-500 dark:border-zinc-900">
                    {formatKpa(Math.abs(p.bubbleKpag - p.dewKpag))}
                  </td>
                </>
              ) : (
                <td className="border-b border-zinc-100 px-3 py-1 text-right dark:border-zinc-900">
                  {formatKpa(p.bubbleKpag)}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ──────────────── helpers ──────────────── */

function formatKpa(v: number): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Linearly interpolate the F-indexed PT chart to 1°C rows. Skips Celsius
 * values whose corresponding Fahrenheit falls outside the chart range.
 */
function interpolateCelsiusRows(ptChart: PTPoint[]): CRow[] {
  if (ptChart.length === 0) return [];
  const sorted = [...ptChart].sort((a, b) => a.tempF - b.tempF);
  const minF = sorted[0].tempF;
  const maxF = sorted[sorted.length - 1].tempF;
  const minC = Math.ceil((minF - 32) * 5 / 9);
  const maxC = Math.floor((maxF - 32) * 5 / 9);

  const out: CRow[] = [];
  for (let c = minC; c <= maxC; c++) {
    const f = (c * 9) / 5 + 32;
    let lo = sorted[0];
    let hi = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].tempF <= f && f <= sorted[i + 1].tempF) {
        lo = sorted[i];
        hi = sorted[i + 1];
        break;
      }
    }
    if (hi.tempF === lo.tempF) {
      out.push({ tempC: c, bubbleKpag: lo.bubbleKpag, dewKpag: lo.dewKpag });
      continue;
    }
    const t = (f - lo.tempF) / (hi.tempF - lo.tempF);
    out.push({
      tempC: c,
      bubbleKpag: lo.bubbleKpag + t * (hi.bubbleKpag - lo.bubbleKpag),
      dewKpag: lo.dewKpag + t * (hi.dewKpag - lo.dewKpag),
    });
  }
  return out;
}
