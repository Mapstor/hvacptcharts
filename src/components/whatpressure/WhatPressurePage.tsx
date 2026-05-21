import Link from "next/link";
import { notFound } from "next/navigation";
import { getRefrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { loadWhatPressure } from "@/lib/mdx-what-pressure";

export interface WhatPressurePageProps {
  id: string;
}

export function WhatPressurePage({ id }: WhatPressurePageProps) {
  const mdx = loadWhatPressure(id);
  if (!mdx) return <ContentComingSoon id={id} />;

  const fm = mdx.frontmatter;
  const r = getRefrigerant(fm.refrigerantSlug);
  if (!r) notFound();

  const pageUrl = `${SITE_URL}/what-pressure-should-${id}/`;
  const schemaGraph = buildSchema(pageUrl, fm, r);

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

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{fm.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Link href={`/refrigerant/${r.slug}/`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
              {r.displayName}
            </Link>
            <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
          </div>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">{fm.introOneLiner}</p>
        </header>

        <section className="mb-10 rounded-md border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Saturation pressure ≠ operating pressure</h2>
          <p className="mt-1 text-sm">
            The numbers below are <strong>operating</strong> pressures — what your manifold gauges read on a running
            system at a given outdoor ambient. Operating pressures depend on charge, ambient, indoor load, superheat,
            and subcooling. The {r.displayName} <em>saturation</em> pressures are different — those are
            thermodynamic equilibrium values you can look up on the{" "}
            <Link href={`/refrigerant/${r.slug}/`} className="underline">{r.displayName} PT chart</Link>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Operating pressure ranges</h2>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 font-medium">Condition</th>
                  <th className="px-3 py-2 font-medium text-right">Suction (low side)</th>
                  <th className="px-3 py-2 font-medium text-right">Discharge (high side)</th>
                  <th className="px-3 py-2 font-medium text-right">Superheat target</th>
                  <th className="px-3 py-2 font-medium text-right">Subcooling target</th>
                </tr>
              </thead>
              <tbody>
                {fm.operatingRanges.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-2">{row.application}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.suctionPsigLow}–{row.suctionPsigHigh} PSIG</td>
                    <td className="px-3 py-2 text-right font-mono">{row.dischargePsigLow}–{row.dischargePsigHigh} PSIG</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{row.superheatTargetF ? `${row.superheatTargetF[0]}–${row.superheatTargetF[1]}°F` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{row.subcoolingTargetF ? `${row.subcoolingTargetF[0]}–${row.subcoolingTargetF[1]}°F` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Source: {fm.operatingRangesSource}</p>
        </section>

        {fm.narrativeIntro ? (
          <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
            {fm.narrativeIntro.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Diagnostic procedure</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Step-by-step procedure to interpret {r.displayName} pressure readings on a service call. Emitted as
            HowTo structured data for search-engine rich results.
          </p>
          <ol className="space-y-4">
            {fm.diagnosticSteps.map((step, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-semibold">
                  <span className="mr-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{step.text}</p>
                {step.tools && step.tools.length > 0 ? (
                  <p className="mt-2 text-xs text-zinc-500"><strong>Tools:</strong> {step.tools.join(", ")}</p>
                ) : null}
              </li>
            ))}
          </ol>
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

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          <Link href={`/refrigerant/${r.slug}/`} className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">{r.displayName} full reference</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Saturation chart, properties, retrofit guidance.</p>
          </Link>
          <Link href="/superheat-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Superheat Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Suction PSIG + line °F → superheat.</p>
          </Link>
          <Link href="/subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Subcooling Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Liquid PSIG + line °F → subcooling.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources & provenance</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Operating pressure ranges: {fm.operatingRangesSource}</li>
            <li>Saturation pressures referenced: CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS)</li>
            <li>{r.displayName} record generated {r.dataSource.ptChartGeneratedAt.slice(0, 10)}</li>
          </ul>
          <p className="mt-3">
            Operating pressure varies with charge, ambient, indoor load, airflow, and equipment condition. Use these
            ranges as a starting reference; always defer to the equipment manufacturer&apos;s charging procedure for the
            specific system. See <Link href="/superheat-subcooling-fundamentals/" className="underline">superheat &amp;
            subcooling fundamentals</Link> for the distinction between saturation and operating pressures.
          </p>
        </footer>
      </article>
    </>
  );
}

function ContentComingSoon({ id }: { id: string }) {
  const pageUrl = `${SITE_URL}/what-pressure-should-${id}/`;
  const placeholderSchema = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: `Operating-pressure reference for ${id.toUpperCase()} — editorial pending`,
      description: `Operating-pressure ranges and diagnostic procedure for ${id.toUpperCase()}. Editorial pass pending; the page renders rather than 404ing so internal links stay live.`,
      url: pageUrl,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
        { "@type": "ListItem", position: 3, name: `What pressure should ${id.toUpperCase()} be?` },
      ],
    },
  ];
  return (
    <>
      <JsonLd graph={placeholderSchema} />
      <article className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Operating-pressure reference coming soon</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Per-refrigerant operating-pressure data for <code>{id}</code> hasn&apos;t been compiled yet. The page renders
        rather than 404ing so internal links stay live; sourced operating ranges land in a follow-up editorial pass.
      </p>
      <p className="mt-4 text-sm">
        In the meantime, see the{" "}
        <Link href={`/refrigerant/${id.startsWith("r") ? id : `r-${id}`}/`} className="underline">
          {id.toUpperCase()} reference page
        </Link>{" "}
        for the saturation chart and properties.
      </p>
    </article>
    </>
  );
}

function buildSchema(pageUrl: string, fm: NonNullable<ReturnType<typeof loadWhatPressure>>["frontmatter"], r: NonNullable<ReturnType<typeof getRefrigerant>>) {
  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: fm.title,
      description: fm.metaDescription ?? fm.introOneLiner,
      url: pageUrl,
      datePublished: r.dataSource.ptChartGeneratedAt,
      dateModified: r.dataSource.ptChartGeneratedAt,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/refrigerant/${r.slug}/#refrigerant` },
    },
    {
      "@type": "HowTo",
      "@id": `${pageUrl}#howto`,
      name: `How to interpret ${r.displayName} system pressures`,
      description: `Step-by-step diagnostic procedure for reading and interpreting ${r.displayName} suction and discharge pressures.`,
      totalTime: "PT15M",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set rated for the refrigerant" },
        { "@type": "HowToTool", name: "Contact or clamp-on temperature probe (+/-1°F accuracy)" },
        { "@type": "HowToTool", name: "EPA Section 608 certification (Type II or Universal)" },
      ],
      step: fm.diagnosticSteps.map((s) => ({
        "@type": "HowToStep",
        name: s.title,
        text: s.text,
      })),
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

export function buildWhatPressureMetadata(id: string) {
  const mdx = loadWhatPressure(id);
  if (!mdx) {
    return {
      title: `What Pressure Should ${id.toUpperCase()} Be?`,
      description: "Operating pressure reference for HVAC refrigerants.",
    };
  }
  return {
    title: mdx.frontmatter.metaTitle ?? mdx.frontmatter.title,
    description: mdx.frontmatter.metaDescription ?? mdx.frontmatter.introOneLiner,
    alternates: { canonical: `${SITE_URL}/what-pressure-should-${id}/` },
  };
}
