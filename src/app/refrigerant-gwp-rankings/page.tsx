import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { GwpTable } from "@/components/reference/GwpTable";
import { GWP_SOURCES, GWP_METHOD } from "@/lib/gwp";
import { contentDates, UpdatedLine } from "@/lib/content-dates";

const PAGE_URL = `${SITE_URL}/refrigerant-gwp-rankings/`;
const { published: PUBLISHED, updated: MODIFIED } = contentDates("/refrigerant-gwp-rankings/");

const EPA_8454 = "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-84/subpart-B/section-84.54";
const KIGALI_RATIFICATIONS = "https://ozone.unep.org/all-ratifications";
const EU_FGAS_2024 = "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R0573";

export const metadata: Metadata = pageMetadata({
  title: "Refrigerant GWP Rankings: All 60 Compared (AR4/AR5/AR6)",
  description:
    "Sortable 100-year GWP table for 60 refrigerants on the US EPA basis, with IPCC AR4, AR5 and AR6 side by side, from R744 (1) to R503 (14560).",
  path: "/refrigerant-gwp-rankings/",
});

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Refrigerant Global Warming Potential (GWP) Rankings",
      description:
        "Sortable, filterable table of 60 common HVAC refrigerants by 100-year GWP on the US EPA basis, with IPCC AR4, AR5 and AR6 columns.",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "Dataset",
      "@id": `${PAGE_URL}#dataset`,
      name: "HVAC Refrigerant Global Warming Potential Rankings",
      description:
        "100-year GWP on the US EPA basis plus IPCC AR4, AR5 and AR6 for 60 common HVAC refrigerants, with ASHRAE 34 safety class and ODP.",
      url: PAGE_URL,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${SITE_URL}/#organization` },
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      isAccessibleForFree: true,
      citation: Object.values(GWP_SOURCES).map((s) => s.title),
      variableMeasured: [
        { "@type": "PropertyValue", name: "GWP (100-year, US EPA basis)", unitText: "ratio relative to CO2" },
        { "@type": "PropertyValue", name: "GWP (100-year, IPCC AR4)", unitText: "ratio relative to CO2" },
        { "@type": "PropertyValue", name: "GWP (100-year, IPCC AR5)", unitText: "ratio relative to CO2" },
        { "@type": "PropertyValue", name: "GWP (100-year, IPCC AR6)", unitText: "ratio relative to CO2" },
        { "@type": "PropertyValue", name: "Ozone Depletion Potential", unitText: "ratio relative to R-11" },
        { "@type": "PropertyValue", name: "ASHRAE 34 safety class" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "GWP Rankings" },
      ],
    },
  ];
}

export default function GwpRankingsPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">GWP Rankings</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refrigerant GWP Rankings</h1>
          <UpdatedLine route="/refrigerant-gwp-rankings/" />
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Global Warming Potential (GWP) expresses the radiative forcing of a refrigerant relative to CO₂ over a
            100-year horizon. The <strong>headline value</strong> is the one the US EPA uses (see the method note
            below); the IPCC AR4, AR5 and AR6 columns are the raw assessment-report values. Lower is better.
          </p>
        </header>

        <section className="mb-10 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">US regulatory status (GWP-based)</h2>
          <p className="mt-1">
            US EPA restricts the manufacture and import of new self-contained residential and light-commercial air
            conditioners and heat pumps that use a refrigerant with a GWP of 700 or more, effective January 1, 2025{" "}
            (<a href={EPA_8454} className="underline" target="_blank" rel="nofollow noopener">40 CFR 84.54(a)(1)</a>).
            Limits for other equipment types differ; see the full section at{" "}
            <a href={EPA_8454} className="underline" target="_blank" rel="nofollow noopener">40 CFR 84.54</a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">All refrigerants by GWP</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Default sort is descending by the headline 100-year GWP (US EPA basis). Click any column heading to sort;
            use the filters to narrow to a family or safety class. Columns: Refrigerant · GWP (100-yr, US EPA basis) ·
            AR4 · AR5 · AR6 · Basis.
          </p>
          <GwpTable />
        </section>

        <section className="mb-10 prose prose-zinc max-w-none dark:prose-invert">
          <h2>How the headline GWP is chosen</h2>
          <p>{GWP_METHOD.headline}</p>
          <p>
            The AR4, AR5 and AR6 columns are the raw IPCC values. A blend gets a value in one of those columns only
            when every constituent is listed in that report. IPCC AR5 lists some low-GWP fluids as &quot;&lt;1&quot;;
            that is shown as &quot;&lt;1&quot; for pure substances and counted as 1 in blend sums. Blend headlines are
            rounded to a whole number.
          </p>

          <h2>GWP by refrigerant family</h2>
          <p>
            HVAC refrigerants cluster into families with characteristic GWP ranges, tracking the history of
            transitions: chlorine-bearing CFCs and HCFCs phased out for ozone depletion (Montreal Protocol 1987),
            then high-GWP HFCs phased down for climate impact (Kigali Amendment 2016, EU F-Gas, US AIM Act 2020).
          </p>
          <ul>
            <li>
              <strong>HCFCs (ozone-depleting):</strong> R-22 (1810), R-123 (77). R-22: US production and import ended
              January 1, 2020, and service continues from reclaimed stock. R-123: production for servicing existing
              equipment continues until January 1, 2030.
            </li>
            <li>
              <strong>HFCs (high-GWP, no ozone depletion):</strong> R-410A (2088), R-134a (1430), R-404A (3922),
              R-507A (3985). Being phased down under the AIM Act and EU F-Gas Regulation; service supply persists via
              reclaimed and allocated production.
            </li>
            <li>
              <strong>HFC/HFO blends (low to medium GWP):</strong> R-32 (675), R-454B (465), R-454C (146),
              R-455A (146), R-448A (1386), R-449A (1396), R-513A (630). The A2L/low-GWP new-equipment family.
            </li>
            <li>
              <strong>HFOs and HCFOs (very low GWP):</strong> R-1234yf (1), R-1234ze(E) (1), R-1233zd(E) (4),
              R-1336mzz(Z) (2). Very low GWP from short atmospheric lifetimes; used in mobile AC and chillers.
            </li>
            <li>
              <strong>Natural refrigerants (near-zero GWP):</strong> R-744 (CO₂, 1 by definition), R-717 (NH₃, 1),
              R-290 (propane, 3.3), R-1270 (propylene, 1.8), R-600a (isobutane, 1). Used in commercial and industrial
              refrigeration and small appliances.
            </li>
          </ul>

          <h2>US equipment restrictions by category</h2>
          <p>
            The AIM Act Technology Transitions rule restricts new equipment by GWP, but the limit and effective date
            differ by equipment type. Rather than reproduce each figure here (they were revised in 2026), consult the
            controlling text directly:{" "}
            <a href={EPA_8454} className="underline" target="_blank" rel="nofollow noopener">40 CFR 84.54</a>. The one
            limit stated on this page is the residential / light-commercial self-contained AC and heat-pump limit of
            700, effective January 1, 2025 (§84.54(a)(1)). Service of existing equipment continues; refrigerant
            production declines on an allowance schedule rather than being banned outright.
          </p>

          <h2>Which assessment report applies?</h2>
          <p>
            US AIM Act exchange values are the IPCC AR4 values. The EU&apos;s 2024 F-gas Regulation uses AR4 for HFCs
            and AR6 for other fluorinated gases (
            <a href={EU_FGAS_2024} className="underline" target="_blank" rel="nofollow noopener">Regulation (EU)
            2024/573</a>, recital 8). Because different regimes cite different reports, this table shows all three IPCC
            columns alongside the US EPA headline; for a specific regulation, use the value that regulation cites.
          </p>

          <h2>Beyond direct GWP — TEWI and LCCP</h2>
          <p>
            Total Equivalent Warming Impact (TEWI) and Life Cycle Climate Performance (LCCP) account for both direct
            refrigerant emissions (leakage, end-of-life) and indirect emissions from energy use over the equipment
            lifetime. For chillers, the indirect (energy) component typically dominates TEWI by 80–90%, so efficiency
            can matter more than refrigerant GWP. For higher-leak-rate equipment the balance shifts toward low-GWP
            refrigerants. GWP alone is necessary but not sufficient for environmental decisions.
          </p>

          <h2>Lifetime context — why GWP tracks atmospheric persistence</h2>
          <p>
            Atmospheric lifetime is one of the three inputs to GWP (with radiative efficiency and the integration
            horizon) and often the dominant one. Per IPCC AR5 WG1 Table 8.A.1: HFC-23 has a 222-year lifetime;
            HFC-125, 28.2 years; HFC-134a, 13.4 years; HFC-32, 5.2 years; HFO-1234yf, 10.5 days. The collapse from
            HFC-134a to HFO-1234yf comes almost entirely from the shorter atmospheric lifetime — the basis of HFO
            chemistry.
          </p>

          <h2>International regulatory landscape</h2>
          <p>
            The Montreal Protocol has 198 parties; 174 of them have ratified the Kigali Amendment (as of 10 August
            2026,{" "}
            <a href={KIGALI_RATIFICATIONS} className="underline" target="_blank" rel="nofollow noopener">UNEP Ozone
            Secretariat</a>). Kigali coordinates an HFC phase-down; the US AIM Act and the EU F-Gas Regulation are the
            regional implementations. Schedules differ by country group and continue to evolve, so check the framework
            in your jurisdiction for current compliance.
          </p>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Method &amp; sources</h2>
          <p className="mt-2">{GWP_METHOD.headline} {GWP_METHOD.ar5}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {Object.values(GWP_SOURCES).map((s) => (
              <li key={s.url}>
                <a href={s.url} className="underline" target="_blank" rel="nofollow noopener">{s.title}</a>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <strong>Atmospheric lifetimes</strong> are from IPCC AR5 WG1 Table 8.A.1 (not the US EPA basis used for
            the headline GWP column).
          </p>
          <p className="mt-2">
            <strong>ODP for the near-zero HCFOs.</strong> R-1233zd(E): 0.00024–0.00034 per EPA SNAP Determination 29
            (October 21, 2014); the table shows the conservative upper bound, 0.00034. R-1224yd(Z): 0.00012 per EPA
            SNAP Determination 35 (84 FR 64765, November 25, 2019).
          </p>
        </footer>
      </article>
    </>
  );
}
