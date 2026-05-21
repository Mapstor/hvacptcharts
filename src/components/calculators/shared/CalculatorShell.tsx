import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import type { FAQ } from "@/lib/mdx";
import { buildCalculatorSchema, type CalculatorSchemaInput } from "@/lib/schema/calculator";

export interface CalculatorShellProps {
  /** Schema input — also drives the breadcrumb + canonical URL. */
  schema: CalculatorSchemaInput;
  /** Renders inside the hero block, below the H1. */
  introOneLiner: string;
  /** Interactive calculator (client component, with `'use client'`). */
  children: React.ReactNode;
  /** How-to-use steps. */
  howTo?: { steps: string[]; commonErrors?: string[] };
  /** Underlying math notes (collapsed). */
  math?: { formula: string; sourceCitation: string; workedExample: string };
  /** Related tools — link cards. */
  relatedTools?: { href: string; label: string; blurb: string }[];
  /** FAQ items (also fed into schema). */
  faqs?: FAQ[];
  /** Generation date for provenance. */
  generatedDate: string;
}

export function CalculatorShell({
  schema,
  introOneLiner,
  children,
  howTo,
  math,
  relatedTools,
  faqs,
  generatedDate,
}: CalculatorShellProps) {
  const schemaGraph = buildCalculatorSchema({ ...schema, faqs });

  return (
    <>
      <JsonLd graph={schemaGraph} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/calculators-hub/" className="hover:underline">Calculators</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{schema.breadcrumbLabel ?? schema.name}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{schema.name}</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">{introOneLiner}</p>
        </header>

        <section className="mb-10 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30 sm:p-6">
          {children}
        </section>

        {howTo ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">How to use this calculator</h2>
            <ol className="list-decimal space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
              {howTo.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {howTo.commonErrors && howTo.commonErrors.length > 0 ? (
              <>
                <h3 className="mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Common errors</h3>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-600 dark:text-zinc-400">
                  {howTo.commonErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </>
            ) : null}
          </section>
        ) : null}

        {math ? (
          <section className="mb-10">
            <details className="rounded-lg border border-zinc-200 p-4 open:bg-zinc-50/50 dark:border-zinc-800 dark:open:bg-zinc-900/30">
              <summary className="cursor-pointer text-sm font-semibold">Underlying math</summary>
              <div className="mt-3 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <div>
                  <h3 className="font-semibold">Formula</h3>
                  <p className="mt-1 font-mono">{math.formula}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Source</h3>
                  <p className="mt-1">{math.sourceCitation}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Worked example</h3>
                  <p className="mt-1 whitespace-pre-wrap">{math.workedExample}</p>
                </div>
              </div>
            </details>
          </section>
        ) : null}

        {relatedTools && relatedTools.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Related tools</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTools.map((t) => (
                <Link key={t.href} href={t.href} className="block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <h3 className="font-semibold">{t.label}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {faqs && faqs.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                  <summary className="cursor-pointer list-none font-semibold">
                    <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <div className="prose prose-sm prose-zinc mt-3 dark:prose-invert max-w-none">
                    {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Data sources & provenance</h2>
          <p className="mt-2">
            All saturation calculations use the verified refrigerant dataset (CoolProp 7.2.0, HEOS backend +
            named manufacturer datasheets for unmodeled blends). Last regenerated {generatedDate}.
          </p>
          <p className="mt-3">
            This calculator is provided as a reference. Always verify pressure values against the equipment data
            plate and manufacturer service literature before charging or troubleshooting a specific system.
            Saturation pressure differs from operating pressure; see{" "}
            <Link href="/superheat-subcooling-fundamentals/" className="underline">
              superheat &amp; subcooling fundamentals
            </Link>.
          </p>
        </footer>
      </article>
    </>
  );
}
