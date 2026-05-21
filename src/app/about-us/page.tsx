import type { Metadata } from "next";
import Link from "next/link";
import { refrigerants } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

const PAGE_URL = `${SITE_URL}/about-us/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "About HVAC PT Charts",
  description: "About HVAC PT Charts: the mission, the technical approach, and the structural defenses against the failure modes that took down the previous version of this site.",
  alternates: { canonical: PAGE_URL },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORG,
          WEBSITE,
          {
            "@type": "AboutPage",
            "@id": `${PAGE_URL}#aboutpage`,
            url: PAGE_URL,
            name: "About HVAC PT Charts",
            datePublished: PUBLISHED,
            mainEntity: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${PAGE_URL}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "About" },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">About</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About HVAC PT Charts</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            A field reference for HVAC professionals: verified pressure-temperature charts for {refrigerants.length}{" "}
            refrigerants, plus calculators for the daily charging and diagnostic work that depends on them.
          </p>
        </header>

        <section className="prose prose-zinc max-w-none dark:prose-invert">
          <h2>Why this site exists</h2>
          <p>
            The previous version of HVAC PT Charts shipped with ~25,000 fabricated quantitative errors. PT values were
            wrong by 2–15×; several exceeded the refrigerants&apos; critical pressures (physically impossible). The
            single page template told every refrigerant page that the refrigerant was a 50/50 blend of R-32 and R-125
            — including R-22, R-290 (propane), R-717 (ammonia), and R-744 (CO₂). Safety classifications were equally
            templated; R-32 (A2L), R-290 (A3), and R-717 (B2L) all rendered as &quot;A1 non-flammable&quot;.
          </p>
          <p>
            This rebuild is structural defense. Every PT value comes from a single source. Every safety classification
            comes from a single source. Every claim cites a source. The failure modes that wrecked the previous
            version are now structurally impossible — not impossible because a careful person wrote the prose, but
            impossible because the architecture refuses to compile or render the wrong values.
          </p>

          <h2>How the data is built</h2>
          <p>
            PT data for {refrigerants.length} refrigerants is generated from{" "}
            <a href="http://www.coolprop.org/" rel="nofollow">CoolProp 7.2.0</a>, an open-source thermodynamic library
            with REFPROP-compatible Helmholtz energy equations of state. For each of 49 refrigerants modeled by
            CoolProp, the site&apos;s generator computes saturation pressures at every °F from -40 to 150 and writes
            them to a committed JSON file. For 11 manufacturer blends not modeled by CoolProp (R-448A, R-450A,
            R-1336mzz(Z), etc.), values are transcribed from named manufacturer datasheets — Honeywell, Chemours,
            Arkema, AGC — with a TODO marker in the repo until the transcription is verified.
          </p>
          <p>
            A build-time verifier cross-checks the data against 10 anchor values (R-22 = 121.44 PSIG at 70°F, R-410A =
            201.76, etc.). If any anchor drifts more than ±5%, or if any saturation pressure exceeds its critical
            pressure (the impossible-pressure bug the legacy site shipped with), the build fails. Direct edits to the
            generated JSON are a code smell — the fix belongs in the source config or the manufacturer-blend skeleton,
            and the data should be regenerated.
          </p>

          <h2>How the editorial is built</h2>
          <p>
            Per-refrigerant prose lives in MDX files, one per refrigerant, separate from the templates. Templates
            render structural elements — hero, properties grid, PT chart, comparison cards — from the data layer
            only. Refrigerant-specific prose can only appear via the MDX overlay. A page without MDX renders all the
            data-driven sections honestly and omits the prose; it never substitutes templated copy from another
            refrigerant.
          </p>
          <p>
            Safety class on every page comes from a Zod-validated enum on the refrigerant record, rendered through a
            structural <code>{"<SafetyClassChip>"}</code> component. R-32 cannot accidentally display A1; the data
            layer says A2L and the component renders the corresponding chip.
          </p>

          <h2>Open data</h2>
          <p>
            The full PT chart for every refrigerant is downloadable as CSV or JSON from the refrigerant&apos;s detail
            page footer. Data is released under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow">Creative Commons Attribution 4.0</a>.
            Use it for tooling, education, or your own service materials — attribute the source.
          </p>
          <p>
            The site itself is a Next.js 16 application, statically generated. No user accounts, no advertising (in
            v1), no user tracking beyond aggregate page-view analytics. Source data is committed to git; the calculator
            math is open in the page bundles.
          </p>

          <h2>Quality bar</h2>
          <p>The rebuild is governed by an explicit set of structural rules:</p>
          <ol>
            <li>No fabricated PT values. Every saturation pressure comes from the data layer.</li>
            <li>No template-swap copy. Refrigerant-specific prose lives only in per-refrigerant MDX.</li>
            <li>Safety class is structural, never narrated. Rendered from the Zod enum.</li>
            <li>Every factual claim cites a source from the source registry.</li>
            <li>Anchor verifier blocks the build if PT data drifts.</li>
            <li>No paragraph over 3 sentences. No fake author personas. No emoji as decoration.</li>
          </ol>

          <h2>What&apos;s next</h2>
          <p>
            Per-refrigerant editorial is the largest remaining work — 5 of 61 MDX files are complete as of this
            writing; the rest render with data + structure pending editorial. The 17 long-form HVAC guides from the
            legacy site are scheduled for port-as-is with light cleanup. Three calculators (refrigerant charge,
            retrofit compatibility, system pressure diagnostic) are in the planned set; the simpler PT and
            superheat/subcooling calculators are live.
          </p>
        </section>

        <section className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/contact-us/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Contact</Link>
          <Link href="/pt-charts-tools-hub/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">PT charts</Link>
          <Link href="/calculators-hub/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Calculators</Link>
        </section>
      </article>
    </>
  );
}
