import Link from "next/link";
import { getRefrigerant, type Refrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { PTCurveOverlay } from "@/components/svg/PTCurveOverlay";
import type { ComparisonFrontmatter } from "@/lib/mdx-comparison";

const SERIES_COLORS = ["var(--c-bubble)", "var(--c-safe-a3)"];

export interface ComparisonPageProps {
  fm: ComparisonFrontmatter;
  body?: string; // reserved for future MDX-body embedding
}

export function ComparisonPage({ fm }: ComparisonPageProps) {
  const a = getRefrigerant(fm.refrigerantA);
  const b = getRefrigerant(fm.refrigerantB);
  if (!a || !b) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold">Comparison data missing</h1>
        <p className="mt-4">Could not locate {fm.refrigerantA} or {fm.refrigerantB} in the dataset.</p>
      </article>
    );
  }

  const pageUrl = `${SITE_URL}/${fm.slug}/`;
  const schemaGraph = buildSchema(pageUrl, fm, a, b);

  const overlayData = [a, b].map((r, i) => ({
    name: r.displayName,
    points: r.ptChart,
    hasGlide: r.physical.hasSignificantGlide,
    color: SERIES_COLORS[i],
  })).filter((d) => d.points.length > 0);

  return (
    <>
      <JsonLd graph={schemaGraph} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{fm.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{fm.title}</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">{fm.introOneLiner}</p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <RefrigerantSummary r={a} color={SERIES_COLORS[0]} />
          <RefrigerantSummary r={b} color={SERIES_COLORS[1]} />
        </section>

        {overlayData.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">PT curves, overlaid</h2>
            <PTCurveOverlay
              refrigerants={overlayData}
              ariaLabel={`Saturation pressure-temperature overlay for ${a.displayName} versus ${b.displayName}`}
            />
            <p className="mt-2 text-xs text-zinc-500">
              {a.physical.hasSignificantGlide || b.physical.hasSignificantGlide
                ? "Solid line = bubble, dashed = dew where the refrigerant has significant temperature glide."
                : "Both refrigerants are pure or near-azeotropic — single curve per series."}
            </p>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Properties side by side</h2>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-zinc-500">Property</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">{a.displayName}</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">{b.displayName}</th>
                </tr>
              </thead>
              <tbody>
                <PropRow label="Type" valueA={a.type.replace("-", " ")} valueB={b.type.replace("-", " ")} />
                <PropRow label="ASHRAE class" valueA={a.safetyClass} valueB={b.safetyClass} />
                <PropRow
                  label="Composition"
                  valueA={a.composition.length === 0 ? "Pure" : a.composition.map((c) => `${(c.massFraction * 100).toFixed(1)}% ${c.component}`).join(" / ")}
                  valueB={b.composition.length === 0 ? "Pure" : b.composition.map((c) => `${(c.massFraction * 100).toFixed(1)}% ${c.component}`).join(" / ")}
                />
                <PropRow label="GWP (AR5)" valueA={String(a.environmental.gwp100Ar5 ?? "—")} valueB={String(b.environmental.gwp100Ar5 ?? "—")} />
                <PropRow label="ODP" valueA={String(a.environmental.odp ?? "—")} valueB={String(b.environmental.odp ?? "—")} />
                <PropRow label="Lubricant" valueA={a.lubricants.compatible.join(", ")} valueB={b.lubricants.compatible.join(", ")} />
                <PropRow
                  label="Boiling point @ 1 atm"
                  valueA={a.physical.boilingPointC !== null ? `${a.physical.boilingPointC.toFixed(1)}°C` : "—"}
                  valueB={b.physical.boilingPointC !== null ? `${b.physical.boilingPointC.toFixed(1)}°C` : "—"}
                />
                <PropRow
                  label="Critical point"
                  valueA={a.physical.critical.tempC !== null ? `${a.physical.critical.tempC.toFixed(1)}°C / ${a.physical.critical.pressurePsig?.toFixed(0)} PSIG` : "Blend (locus, not point)"}
                  valueB={b.physical.critical.tempC !== null ? `${b.physical.critical.tempC.toFixed(1)}°C / ${b.physical.critical.pressurePsig?.toFixed(0)} PSIG` : "Blend (locus, not point)"}
                />
                <PropRow
                  label="Temp glide"
                  valueA={`${a.physical.temperatureGlideF.toFixed(2)}°F`}
                  valueB={`${b.physical.temperatureGlideF.toFixed(2)}°F`}
                />
                <PropRow
                  label="AIM Act affected"
                  valueA={a.regulatoryStatus.aimActAffected ? "Yes" : "No"}
                  valueB={b.regulatoryStatus.aimActAffected ? "Yes" : "No"}
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Choose {a.displayName} if…</h2>
            <p className="mt-2 text-sm">{fm.chooseA}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Choose {b.displayName} if…</h2>
            <p className="mt-2 text-sm">{fm.chooseB}</p>
          </div>
        </section>

        {fm.whenNeither ? (
          <section className="mb-10 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">When neither is ideal</h2>
            <p className="mt-2 text-sm">{fm.whenNeither}</p>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Retrofit and transition</h2>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {fm.retrofitNotes.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>
        </section>

        {fm.faqs && fm.faqs.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
            <div className="space-y-4">
              {fm.faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                  <summary className="cursor-pointer list-none font-semibold">
                    <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                    {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10 grid gap-3 sm:grid-cols-2">
          <Link href={`/refrigerant/${a.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{a.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">PT chart, properties, retrofit guidance.</p>
          </Link>
          <Link href={`/refrigerant/${b.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{b.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">PT chart, properties, retrofit guidance.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources & provenance</h2>
          <p className="mt-2">
            Comparison values from the verified dataset: {a.dataSource.ptChartSource} ({a.displayName}),{" "}
            {b.dataSource.ptChartSource} ({b.displayName}). GWP per IPCC AR5; safety class per ANSI/ASHRAE Standard
            34-2022. Generated {a.dataSource.ptChartGeneratedAt.slice(0, 10)}.
          </p>
        </footer>
      </article>
    </>
  );
}

function RefrigerantSummary({ r, color }: { r: Refrigerant; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
        <Link href={`/refrigerant/${r.slug}/`} className="text-lg font-semibold text-blue-700 hover:underline dark:text-blue-300">
          {r.displayName}
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <TypeChip type={r.type} />
        <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
        <dt className="text-zinc-500">GWP (AR5)</dt>
        <dd className="font-mono">{r.environmental.gwp100Ar5 ?? "—"}</dd>
        <dt className="text-zinc-500">Lubricant</dt>
        <dd className="font-mono">{r.lubricants.compatible.join(", ")}</dd>
        <dt className="text-zinc-500">Glide @ 0°C</dt>
        <dd className="font-mono">{r.physical.temperatureGlideF.toFixed(1)}°F</dd>
      </dl>
    </div>
  );
}

function PropRow({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
  const differ = valueA !== valueB;
  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">{label}</td>
      <td className={`px-3 py-2 text-right ${differ ? "font-semibold" : ""}`}>{valueA}</td>
      <td className={`px-3 py-2 text-right ${differ ? "font-semibold" : ""}`}>{valueB}</td>
    </tr>
  );
}

function buildSchema(pageUrl: string, fm: ComparisonFrontmatter, a: Refrigerant, b: Refrigerant): object[] {
  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: fm.title,
      description: fm.metaDescription ?? fm.introOneLiner,
      url: pageUrl,
      datePublished: a.dataSource.ptChartGeneratedAt,
      dateModified: a.dataSource.ptChartGeneratedAt,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@id": `${SITE_URL}/refrigerant/${a.slug}/#refrigerant` },
        { "@id": `${SITE_URL}/refrigerant/${b.slug}/#refrigerant` },
      ],
    },
  ];

  if (fm.faqs && fm.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: fm.faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
      { "@type": "ListItem", position: 3, name: fm.title },
    ],
  });

  return graph;
}
