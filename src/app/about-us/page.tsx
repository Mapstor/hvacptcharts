import type { Metadata } from "next";
import Link from "next/link";
import { Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/about-us/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "About HVAC PT Charts",
  description:
    "About HVAC PT Charts: a field reference for HVAC professionals with verified pressure-temperature data for 61 refrigerants, calculators for daily service work, and structural guarantees that the data is correct.",
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
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">About</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About HVAC PT Charts</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            A field reference for HVAC professionals: verified pressure-temperature charts
            for {refrigerants.length} refrigerants, plus calculators and guides for the
            daily charging, diagnostic, and retrofit work that depends on them.
          </p>
        </header>

        <TechSection icon="composition" tone="blue" title="What HVAC PT Charts is">
          <p>
            HVAC PT Charts is a free reference and tooling resource for refrigerant
            service technicians, equipment specifiers, and HVAC engineers. The site
            covers every refrigerant a technician is likely to encounter in modern
            service — from current A2L refrigerants (R-32, R-454B, R-454C, R-1234yf) to
            legacy HCFCs still in service (R-22, R-123) to industrial naturals (R-717
            ammonia, R-744 CO₂, R-290 propane).
          </p>
          <Panel title="What's on the site" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-1.5 font-medium">Refrigerant detail pages</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">
                      {refrigerants.length}
                    </td>
                    <td className="py-1.5 text-xs text-zinc-500">
                      Full PT chart, properties, safety class, retrofit paths
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-1.5 font-medium">Calculators</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">9</td>
                    <td className="py-1.5 text-xs text-zinc-500">
                      PT, superheat, subcooling, combined, system diagnostic, charge,
                      saturation properties, PT comparison, retrofit compatibility
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-1.5 font-medium">Long-form guides</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">5</td>
                    <td className="py-1.5 text-xs text-zinc-500">
                      PT chart reading, SH/SC fundamentals, high head pressure
                      diagnosis, GWP rankings, safety classifications
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-1.5 font-medium">Operating-pressure references</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">9</td>
                    <td className="py-1.5 text-xs text-zinc-500">
                      R-410A, R-22, R-32, R-454B, R-134a, R-404A, R-407C, R-454C, R-744
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Pair comparisons</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">13</td>
                    <td className="py-1.5 text-xs text-zinc-500">
                      R-22 vs R-410A, R-32 vs R-410A, R-410A vs R-454B, plus 10 other
                      retrofit / transition decisions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <KeyInsight tone="emerald" icon="insight" title="Built for one thing">
            Refrigerant-side service measurement done correctly. Pressure values that
            trace to primary sources, calculators that handle bubble vs dew correctly for
            zeotropic blends, safety classifications that can&apos;t be misrepresented by
            templating errors.
          </KeyInsight>
        </TechSection>

        <TechSection icon="data" tone="purple" title="How the data is built">
          <p>
            Saturation data for the {refrigerants.length} refrigerants in the dataset
            comes from one of two primary-source paths.
          </p>
          <Panel title="Two data-source paths, both verified" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Source path</th>
                    <th className="py-1.5 text-left">Refrigerants</th>
                    <th className="py-1.5 text-left">Method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-1.5">
                      <strong>CoolProp 7.2.0</strong>
                      <br />
                      <span className="text-xs text-zinc-500">
                        REFPROP-compatible Helmholtz EOS
                      </span>
                    </td>
                    <td className="py-1.5 font-mono tabular-nums">~50</td>
                    <td className="py-1.5 text-xs">
                      Generator script computes saturation pressures at every °F from −40
                      to 150 (or the refrigerant&apos;s critical temperature, whichever is
                      lower). Output written to a committed JSON file.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5">
                      <strong>Manufacturer datasheets</strong>
                      <br />
                      <span className="text-xs text-zinc-500">
                        Honeywell, Chemours, Arkema, AGC
                      </span>
                    </td>
                    <td className="py-1.5 font-mono tabular-nums">~10</td>
                    <td className="py-1.5 text-xs">
                      For blends CoolProp doesn&apos;t model (R-448A, R-450A,
                      R-1336mzz(Z), etc.) values come from the named manufacturer
                      datasheet with the URL recorded per refrigerant. When transcription
                      is pending, the page displays an honest disclosure with the source
                      citation — never a fabricated value.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
          <p>
            A build-time verifier cross-checks the data against anchor values (R-22 =
            121.44 PSIG at 70°F, R-410A = 201.76 PSIG at 70°F, etc.). If any anchor
            drifts more than ±5%, or if any saturation pressure exceeds the critical
            pressure (physically impossible), the build fails. Direct edits to the
            generated JSON are a code smell — the fix belongs in the source config or
            the manufacturer-blend skeleton, and the data is regenerated.
          </p>
        </TechSection>

        <TechSection icon="shield" tone="emerald" title="Structural guarantees, not careful prose">
          <p>
            The data layer is Zod-validated at build time. Safety class is a typed enum;
            it&apos;s structurally impossible to render the wrong class for a refrigerant
            once the enum value is set correctly. Per-refrigerant prose lives in MDX
            files separate from templates — templates render structure and data only, so
            there is no path for refrigerant-A copy to accidentally appear on
            refrigerant-B&apos;s page.
          </p>
          <Panel title="What the structure guarantees" icon={TableIcon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>
                <strong>No fabricated PT values.</strong> Every saturation pressure comes
                from the data layer (CoolProp or named manufacturer datasheet). Refusal
                is structural: when source data isn&apos;t available, the page shows an
                honest disclosure naming the missing source, not a guess.
              </li>
              <li>
                <strong>No template-swap copy.</strong> Refrigerant-specific prose lives
                only in per-refrigerant MDX. Templates can&apos;t print
                refrigerant-specific copy from the dataset layer.
              </li>
              <li>
                <strong>Safety class is structural.</strong> Zod enum + dedicated
                component. R-32 cannot accidentally display A1; the data layer says A2L
                and the component renders the correct chip.
              </li>
              <li>
                <strong>Every claim has a source.</strong> Source registry in the repo;
                inline citations on each refrigerant page; provenance footer on every
                page.
              </li>
              <li>
                <strong>Anchor verifier blocks the build.</strong> If PT data drifts
                outside ±5% of anchored reference values, or if any saturation pressure
                exceeds the critical pressure, the build fails before deploy.
              </li>
            </ul>
          </Panel>
        </TechSection>

        <TechSection icon="composition" tone="amber" title="Editorial principles">
          <p>
            Per-refrigerant prose is written in MDX files — one per refrigerant —
            separate from the page templates. Templates render the structural sections
            (PT chart, properties grid, comparison cards) from the data layer; MDX
            provides the narrative context (history, applications, retrofit guidance,
            service notes). A page without MDX renders honestly: data sections appear,
            narrative sections are omitted — no substituted boilerplate.
          </p>
          <Panel title="House style rules" icon={TableIcon}>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>No paragraph over 3 sentences. Information density is high; text walls are not.</li>
              <li>Every factual claim cites a source from the source registry.</li>
              <li>Reference values (NBP, Tcrit, GWP, etc.) come from the data layer, not from prose retyping.</li>
              <li>No fake author personas. Author = the Organization.</li>
              <li>No emoji as decoration. Use icons (lucide-react) when a visual marker is needed.</li>
              <li>No paywalls, no signup, no email harvesting. Display advertising via Raptive supports the cost of keeping the dataset free.</li>
            </ol>
          </Panel>
        </TechSection>

        <TechSection icon="source" tone="emerald" title="Open data">
          <p>
            The full PT chart for every refrigerant is downloadable as CSV or JSON from
            the refrigerant&apos;s detail page footer. The complete dataset is licensed
            under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              rel="nofollow"
              className="underline"
            >
              Creative Commons Attribution 4.0
            </a>
            . Use it for HVAC service apps, training simulators, OEM internal tooling,
            academic research, building-energy modeling, or any other purpose —
            attribute the source and the underlying primary source for the specific
            values (CoolProp citation, manufacturer datasheet citation).
          </p>
          <p>
            The site itself is a Next.js 16 application, statically generated. Source
            data is committed to git; the calculator math is open in the page bundles.
            For bulk programmatic access, the master dataset is available at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
              /api/refrigerants.json
            </code>{" "}
            (also CC BY 4.0).
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="What this site is not">
          <p>
            HVAC PT Charts is reference material, not replacement for formal HVAC
            training, equipment OEM service literature, or jurisdictional code
            compliance. A few intentional non-features:
          </p>
          <Panel title="Limits and intentional non-features" icon={TableIcon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>
                <strong>Not a substitute for EPA Section 608 certification.</strong>{" "}
                Legal handling of refrigerants in the US requires Section 608
                certification. The site does not replace the formal training pathway.
              </li>
              <li>
                <strong>Not a substitute for equipment OEM service literature.</strong>{" "}
                Reference targets here (target superheat / subcooling, charge nameplate
                values) are generic. Always defer to the equipment OEM&apos;s charging
                procedure for the specific equipment.
              </li>
              <li>
                <strong>Not a Manual J load calculator.</strong> Heat load and equipment
                sizing belong in ACCA Manual J / S / D software (Wrightsoft, Elite,
                CoolCalc). This site covers refrigerant-side service measurement, not
                upstream load calculation.
              </li>
              <li>
                <strong>Not a live refrigerant price feed.</strong> Distributor pricing
                changes with AIM Act allocations, weather, and import dynamics. Use your
                distributor for current quotes.
              </li>
              <li>
                <strong>No user accounts, no signup, no chat AI bolted on top.</strong>{" "}
                The site is what it is: structured data, calculators, and reference
                guides. Visit, look up what you need, leave.
              </li>
            </ul>
          </Panel>
        </TechSection>

        <section className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link
            href="/contact-us/"
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Contact
          </Link>
          <Link
            href="/pt-charts-tools-hub/"
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            PT charts
          </Link>
          <Link
            href="/calculators-hub/"
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Calculators
          </Link>
          <Link
            href="/guides-hub/"
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Guides
          </Link>
        </section>
      </article>
    </>
  );
}
