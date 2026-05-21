import type { Metadata } from "next";
import Link from "next/link";
import { refrigerants } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { GwpTable } from "@/components/reference/GwpTable";

const PAGE_URL = `${SITE_URL}/refrigerant-gwp-rankings/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Refrigerant GWP Rankings — IPCC AR5 100-Year Values",
  description:
    "Sortable table of HVAC refrigerant Global Warming Potential values per IPCC AR5 (and AR6 where different). Filter by type, safety class, or GWP bucket. Includes EU F-Gas and AIM Act threshold markers.",
  alternates: { canonical: PAGE_URL },
};

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Refrigerant Global Warming Potential (GWP) Rankings",
      description:
        "Sortable, filterable table of 61 common HVAC refrigerants by Global Warming Potential. IPCC AR5 (the EPA AIM Act figure) and AR6 columns. Cross-reference for EU F-Gas Regulation and AIM Act thresholds.",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
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
        "100-year GWP (IPCC AR5 and AR6) for 61 common HVAC refrigerants, with ASHRAE 34 safety class, ODP, and current EPA regulatory status.",
      url: PAGE_URL,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      citation: [
        "IPCC AR5 Working Group I (2013), Climate Change 2013: The Physical Science Basis, Table 8.A.1",
        "IPCC AR6 Working Group I (2021), Chapter 7 Supplementary Material",
        "ANSI/ASHRAE Standard 34-2022",
        "US EPA AIM Act (American Innovation and Manufacturing Act of 2020) final rule",
        "EU Regulation 517/2014 (F-Gas Regulation)",
      ],
      variableMeasured: [
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
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Global Warming Potential expresses the radiative forcing of a refrigerant relative to CO₂ over a fixed
            time horizon (100 years for AIM Act and EU F-Gas accounting). Lower is better; the AIM Act gates new
            equipment at 700, and the EU F-Gas Regulation gates much of new stationary refrigeration at 150.
          </p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">AIM Act threshold — 700</h2>
            <p className="mt-1 text-sm">
              Production and import of HFCs with GWP above 700 in new residential AC equipment was prohibited by the US
              EPA AIM Act effective January 1, 2025. R-410A (2088), R-404A (3922), and R-507A (3985) are well above
              this threshold and being displaced in new equipment.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">EU F-Gas threshold — 150</h2>
            <p className="mt-1 text-sm">
              EU Regulation 517/2014 prohibits placing new stationary refrigeration equipment containing fluorinated
              gases with GWP above 150 on the EU market for most categories. The very-low-GWP HFOs and natural
              refrigerants (R-744, R-290, R-1234yf, R-454C, R-455A, R-516A) sit below this line.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">All refrigerants by GWP</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Default sort is ascending by AR5 (the EPA-published figure for AIM Act accounting). Click any column heading
            to sort. Use the filters to narrow to a category. Rows are tinted green below the EU F-Gas 150 line and
            amber above the AIM Act 700 line.
          </p>
          <GwpTable />
        </section>

        <section className="mb-10 prose prose-zinc max-w-none dark:prose-invert">
          <h2>AR5 vs AR6 — which one applies?</h2>
          <p>
            IPCC publishes updated GWP values with each Assessment Report. AR5 (2013) is the figure most regulations
            anchor to — including the EPA AIM Act, EU F-Gas Regulation, and the Kigali Amendment to the Montreal
            Protocol. AR6 (2021) provides updated values that are gradually being adopted in newer standards. Where
            the two differ meaningfully, both are shown.
          </p>
          <p>
            For regulatory compliance and reporting, the AR5 value is what you reference unless a specific regulation
            cites otherwise. AR6 values are typically slightly higher for HFCs (revised methodology accounts for
            additional atmospheric effects) and slightly lower for some HFOs.
          </p>
          <h2>What's not in this table</h2>
          <p>
            Energy efficiency and operational emissions matter as much as direct refrigerant emissions for total
            climate impact (TEWI — Total Equivalent Warming Impact, and LCCP — Life Cycle Climate Performance). A
            high-GWP refrigerant in a hermetic system with very low leak rate can have a lower total impact than a
            low-GWP refrigerant in a leakier system with worse efficiency. GWP alone is necessary but not sufficient
            for environmental decision-making.
          </p>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>IPCC AR5 Working Group I (2013), Chapter 8 Appendix 8.A.1</li>
            <li>IPCC AR6 Working Group I (2021), Chapter 7 Supplementary Material Table 7.SM.7</li>
            <li>US EPA AIM Act final rule (2021) and subsequent technology transition rules</li>
            <li>EU Regulation 517/2014 on fluorinated greenhouse gases</li>
            <li>Kigali Amendment to the Montreal Protocol (2016) — HFC phase-down baseline</li>
          </ul>
          <p className="mt-3">
            GWP values for blends are mass-weighted from component values per IPCC AR5 methodology. Values shown to
            zero decimal places to match published EPA / IPCC figures; precision beyond this is not meaningful given
            the underlying scientific uncertainty.
          </p>
        </footer>
      </article>
    </>
  );
}
