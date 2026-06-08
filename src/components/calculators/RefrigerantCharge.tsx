"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  adjustCharge,
  LIQUID_LINE_IDS_IN,
  OZ_PER_FT_LIQUID_R410A_BASELINE,
  type LiquidLineOD,
} from "@/lib/charge";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";

const LIQUID_LINE_ODS: LiquidLineOD[] = ["1/4", "5/16", "3/8", "1/2", "5/8", "3/4", "7/8"];

export function RefrigerantCharge() {
  const [slug, setSlug] = useState("r-410a");
  const [nameplateLb, setNameplateLb] = useState("8.5");
  const [standardLengthFt, setStandardLengthFt] = useState("15");
  const [actualLengthFt, setActualLengthFt] = useState("45");
  const [liquidLineOD, setLiquidLineOD] = useState<LiquidLineOD>("3/8");
  const [verticalRise, setVerticalRise] = useState("");

  const result = useMemo(() => {
    const inputs = {
      slug,
      nameplateChargeLb: Number(nameplateLb),
      standardLineLengthFt: Number(standardLengthFt),
      actualLineLengthFt: Number(actualLengthFt),
      liquidLineOD,
      verticalRiseFt: verticalRise === "" ? undefined : Number(verticalRise),
    };
    const numeric = [inputs.nameplateChargeLb, inputs.standardLineLengthFt, inputs.actualLineLengthFt];
    if (numeric.some((n) => !Number.isFinite(n))) return null;
    return adjustCharge(inputs);
  }, [slug, nameplateLb, standardLengthFt, actualLengthFt, liquidLineOD, verticalRise]);

  return (
    <div className="space-y-5">
      {/* Refrigerant + nameplate */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ch-refrig" className="block text-xs uppercase tracking-wide text-zinc-500">Refrigerant</label>
          <RefrigerantSelector id="ch-refrig" value={slug} onChange={setSlug} className="mt-1 w-full" />
        </div>
        <div>
          <label htmlFor="ch-namp" className="block text-xs uppercase tracking-wide text-zinc-500">
            Nameplate charge (lb)
          </label>
          <input
            id="ch-namp"
            type="number"
            step={0.1}
            value={nameplateLb}
            onChange={(e) => setNameplateLb(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-[11px] text-zinc-500">From the unit&apos;s data plate. If listed in oz, divide by 16.</p>
        </div>
      </div>

      {/* Line set */}
      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-3 text-sm font-semibold">Line-set configuration</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ch-std" className="block text-xs uppercase tracking-wide text-zinc-500">
              Standard reference length (ft)
            </label>
            <input
              id="ch-std"
              type="number"
              step={1}
              value={standardLengthFt}
              onChange={(e) => setStandardLengthFt(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[11px] text-zinc-500">OEM&apos;s reference (typically 15 ft for residential, 25 ft for some heat pumps).</p>
          </div>
          <div>
            <label htmlFor="ch-act" className="block text-xs uppercase tracking-wide text-zinc-500">
              Actual one-way line length (ft)
            </label>
            <input
              id="ch-act"
              type="number"
              step={1}
              value={actualLengthFt}
              onChange={(e) => setActualLengthFt(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="ch-od" className="block text-xs uppercase tracking-wide text-zinc-500">
              Liquid-line OD (Type L copper)
            </label>
            <select
              id="ch-od"
              value={liquidLineOD}
              onChange={(e) => setLiquidLineOD(e.target.value as LiquidLineOD)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {LIQUID_LINE_ODS.map((od) => (
                <option key={od} value={od}>
                  {od}″ (ID {LIQUID_LINE_IDS_IN[od]}″)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ch-rise" className="block text-xs uppercase tracking-wide text-zinc-500">
              Vertical rise (ft, optional)
            </label>
            <input
              id="ch-rise"
              type="number"
              step={1}
              value={verticalRise}
              onChange={(e) => setVerticalRise(e.target.value)}
              placeholder="leave blank if &lt;50 ft"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-[11px] text-zinc-500">Evaporator above condenser. Above 50 ft triggers a warning.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <h3 className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-100">Adjusted charge</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-emerald-900/70 dark:text-emerald-100/70">Total charge</dt>
              <dd className="mt-0.5 font-mono">
                <span className="text-xl font-bold">{result.totalChargeLb.toFixed(2)}</span>
                <span className="ml-1 text-xs">lb</span>
                <div className="text-[11px] text-emerald-900/70 dark:text-emerald-100/70">
                  {result.totalChargeOz.toFixed(1)} oz
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-emerald-900/70 dark:text-emerald-100/70">
                {result.adjustmentLb >= 0 ? "Add" : "Excess (recover)"}
              </dt>
              <dd className="mt-0.5 font-mono">
                <span className="text-xl font-bold">
                  {Math.abs(result.adjustmentLb).toFixed(2)}
                </span>
                <span className="ml-1 text-xs">lb</span>
                <div className="text-[11px] text-emerald-900/70 dark:text-emerald-100/70">
                  {Math.abs(result.adjustmentOz).toFixed(1)} oz
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-emerald-900/70 dark:text-emerald-100/70">Per-foot rate</dt>
              <dd className="mt-0.5 font-mono">
                <span className="text-xl font-bold">{result.adjustedOzPerFt.toFixed(2)}</span>
                <span className="ml-1 text-xs">oz/ft</span>
                <div className="text-[11px] text-emerald-900/70 dark:text-emerald-100/70">
                  base {result.baseOzPerFt.toFixed(2)} × factor {result.refrigerantFactor.toFixed(2)}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-emerald-900/70 dark:text-emerald-100/70">Δ length</dt>
              <dd className="mt-0.5 font-mono">
                <span className="text-xl font-bold">
                  {result.deltaLengthFt >= 0 ? "+" : ""}
                  {result.deltaLengthFt.toFixed(0)}
                </span>
                <span className="ml-1 text-xs">ft</span>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {/* Warnings */}
      {result && result.warnings.length > 0 ? (
        <section className="rounded-md border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h3 className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-100">Notes &amp; cautions</h3>
          <ul className="space-y-1 text-sm text-amber-900 dark:text-amber-100">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Per-OD baseline reference table */}
      <details className="rounded-md border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Reference: R-410A baseline oz/ft by liquid-line OD
        </summary>
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="py-1 pr-3">OD</th>
                <th className="py-1 pr-3">ID (Type L)</th>
                <th className="py-1 pr-3">R-410A oz/ft</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {LIQUID_LINE_ODS.map((od) => (
                <tr key={od} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1 pr-3">{od}″</td>
                  <td className="py-1 pr-3">{LIQUID_LINE_IDS_IN[od].toFixed(3)}″</td>
                  <td className="py-1 pr-3">{OZ_PER_FT_LIQUID_R410A_BASELINE[od].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-zinc-500">
            Baseline values calculated from Type L copper IDs × CoolProp 7.2.0 R-410A
            saturated-liquid density at 100°F (64.24 lb/ft³). For other
            refrigerants the calculator applies a density-ratio multiplier; see{" "}
            <Link href="/refrigerant-comparison-guide/" className="underline">refrigerant
            comparison guide</Link> for liquid-density data.
          </p>
        </div>
      </details>

      <p className="text-xs text-zinc-500">
        Adjusted charge is a starting point. Always verify with{" "}
        <Link href="/superheat-calculator/" className="underline">superheat</Link>{" "}
        (and{" "}
        <Link href="/subcooling-calculator/" className="underline">subcooling</Link>{" "}
        on TXV/EXV systems) under steady-state operation after charging. For unusual installations
        (very long line set, large vertical rise, multi-evap manifolds) consult the
        equipment installation manual — it is the authoritative source for that specific system.
      </p>
    </div>
  );
}
