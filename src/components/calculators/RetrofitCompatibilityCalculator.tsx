"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getRefrigerant } from "@/data/refrigerants";
import { evaluateRetrofit, type Check, type RetrofitEvaluation } from "@/lib/retrofit";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";

const TONE_CLASSES: Record<RetrofitEvaluation["verdictTone"], string> = {
  good: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  ok: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
  warn: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  bad: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
  neutral: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
};

const CHECK_TONE: Record<Check["severity"], string> = {
  ok: "text-emerald-700 dark:text-emerald-300",
  warn: "text-amber-700 dark:text-amber-300",
  fail: "text-red-700 dark:text-red-300",
};

const CHECK_ICON: Record<Check["severity"], string> = {
  ok: "✓",
  warn: "⚠",
  fail: "✗",
};

const CHECK_LABELS: Array<{ key: keyof RetrofitEvaluation["checks"]; label: string }> = [
  { key: "lubricant", label: "Lubricant compatibility" },
  { key: "safetyClass", label: "Safety class transition" },
  { key: "pressure", label: "Pressure envelope" },
  { key: "glide", label: "Temperature glide" },
  { key: "application", label: "Application family" },
];

export function RetrofitCompatibilityCalculator({
  initialFrom = "r-22",
  initialTo = "r-407c",
}: {
  initialFrom?: string;
  initialTo?: string;
}) {
  const [fromSlug, setFromSlug] = useState(initialFrom);
  const [toSlug, setToSlug] = useState(initialTo);

  const evaluation = useMemo(() => {
    const a = getRefrigerant(fromSlug);
    const b = getRefrigerant(toSlug);
    if (!a || !b) return null;
    return { a, b, eval: evaluateRetrofit(a, b) };
  }, [fromSlug, toSlug]);

  const swap = () => {
    setFromSlug(toSlug);
    setToSlug(fromSlug);
  };

  return (
    <div className="space-y-5">
      {/* Selectors */}
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label htmlFor="retrofit-from" className="block text-xs uppercase tracking-wide text-zinc-500">
            Existing refrigerant
          </label>
          <RefrigerantSelector id="retrofit-from" value={fromSlug} onChange={setFromSlug} onlyWithPtData={false} className="mt-1 w-full" />
        </div>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap from/to refrigerants"
          className="self-end rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          ⇄
        </button>
        <div>
          <label htmlFor="retrofit-to" className="block text-xs uppercase tracking-wide text-zinc-500">
            Target refrigerant
          </label>
          <RefrigerantSelector id="retrofit-to" value={toSlug} onChange={setToSlug} onlyWithPtData={false} className="mt-1 w-full" />
        </div>
      </div>

      {/* Verdict */}
      {evaluation ? (
        <div className={`rounded-md border px-4 py-3 ${TONE_CLASSES[evaluation.eval.verdictTone]}`}>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-lg font-bold">{evaluation.eval.verdictLabel}</strong>
            <span className="font-mono text-xs">
              {evaluation.a.displayName} → {evaluation.b.displayName}
            </span>
          </div>
          <p className="mt-2 text-sm">{evaluation.eval.summary}</p>
        </div>
      ) : null}

      {/* Per-criterion table */}
      {evaluation ? (
        <section>
          <h2 className="mb-2 text-base font-semibold">Per-criterion analysis</h2>
          <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <tbody>
                {CHECK_LABELS.map((row) => {
                  const c = evaluation.eval.checks[row.key];
                  return (
                    <tr key={row.key} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="w-48 px-3 py-2.5 align-top text-xs uppercase tracking-wide text-zinc-500">{row.label}</td>
                      <td className="px-3 py-2.5 align-top">
                        <span className={`mr-2 inline-block font-bold ${CHECK_TONE[c.severity]}`}>{CHECK_ICON[c.severity]}</span>
                        <span>{c.note}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Recommendations */}
      {evaluation && evaluation.eval.recommendations.length > 0 ? (
        <section>
          <h2 className="mb-2 text-base font-semibold">Recommendations</h2>
          <ol className="list-decimal space-y-2 pl-6 text-sm">
            {evaluation.eval.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </section>
      ) : null}

      {/* Per-refrigerant links */}
      {evaluation ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/refrigerant/${evaluation.a.slug}/`} className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            {evaluation.a.displayName} reference page
          </Link>
          <Link href={`/refrigerant/${evaluation.b.slug}/`} className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            {evaluation.b.displayName} reference page
          </Link>
          <Link href="/refrigerant-pt-comparison-tool/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            Overlay PT curves
          </Link>
        </div>
      ) : null}

      <p className="text-xs text-zinc-500">
        The verdict is derived from the data layer (lubricants, safety class, composition, PT chart) plus the
        editorial comparison groups. It is decision-support, not a substitute for verifying the specific equipment
        OEM&apos;s approved refrigerant list before any retrofit work.
      </p>
    </div>
  );
}
