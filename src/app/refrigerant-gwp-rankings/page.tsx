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
          <h2>GWP by refrigerant family — the climate-driven transition</h2>
          <p>
            HVAC refrigerants cluster into four broad chemical families with characteristic GWP
            ranges. The history of refrigerant transitions tracks each family&apos;s
            environmental issues: chlorine-bearing CFCs and HCFCs phased out for ozone
            depletion (Montreal Protocol 1987, US EPA SNAP), then high-GWP HFCs phased down
            for climate impact (Kigali Amendment 2016, EU F-Gas 2014, EPA AIM Act 2020).
          </p>
          <ul>
            <li>
              <strong>HCFCs (ozone-depleting):</strong> R-22 (GWP 1810), R-123 (GWP 79). Being
              phased out worldwide under Montreal Protocol. Production stopped in developed
              countries 2020. R-22 service continues from reclaimed stock; new equipment
              uses HFC or HFO alternatives.
            </li>
            <li>
              <strong>HFCs (high-GWP, no ozone depletion):</strong> R-410A (GWP 2088), R-134a
              (GWP 1430), R-404A (GWP 3922). Currently being phased down under AIM Act
              (700 GWP cap for new residential AC equipment as of 2025) and EU F-Gas (150 GWP
              cap for most stationary refrigeration). Service supply persists during the
              wind-down via reclaimed and allocated production.
            </li>
            <li>
              <strong>HFCs / HFOs blends (low to medium GWP):</strong> R-32 (GWP 675), R-454B
              (GWP 466), R-454C (GWP 148), R-455A (GWP 148), R-448A (GWP 1387), R-449A (GWP
              1397). The AIM Act-compliant new-equipment refrigerants for the next decade.
              R-454C and R-455A sit below the EU F-Gas 150 threshold.
            </li>
            <li>
              <strong>HFOs (low-GWP, short atmospheric lifetime):</strong> R-1234yf (GWP 4),
              R-1234ze (GWP 7), R-1233zd (GWP 1), R-1336mzz (GWP 9). Engineered for very low
              GWP via short atmospheric lifetime. Used in mobile AC (R-1234yf) and chillers
              (R-1234ze, R-1233zd, R-1336mzz).
            </li>
            <li>
              <strong>Natural refrigerants (~zero GWP):</strong> R-744 (CO₂, GWP 1 by definition),
              R-717 (NH₃, GWP 0), R-290 (propane, GWP 3), R-1270 (propylene, GWP 2), R-600a
              (isobutane, GWP 3). Used in commercial refrigeration (R-744, R-290), industrial
              refrigeration (R-717), and small appliances (R-290, R-600a).
            </li>
          </ul>

          <h2>Sector-by-sector transition timeline (AIM Act + EU F-Gas)</h2>
          <p>
            The EPA AIM Act and EU F-Gas Regulation set sector-specific phase-down schedules
            with GWP caps for new equipment by category. Most major sectors have 2024-2026
            transition dates for new equipment; service of existing equipment continues
            indefinitely with declining refrigerant allocations.
          </p>
          <ul>
            <li>
              <strong>Residential / light commercial AC (US, 2025+):</strong> GWP cap 700. R-410A
              (GWP 2088) prohibited in new equipment. Replaced by R-32 (GWP 675) or R-454B
              (GWP 466).
            </li>
            <li>
              <strong>Commercial refrigeration MT / LT (US, 2025+):</strong> GWP cap 150-300
              depending on sub-sector. R-404A (GWP 3922) and R-507A (GWP 3985) prohibited in
              new equipment. Replaced by R-454C, R-455A, R-448A, R-449A, R-744 transcritical.
            </li>
            <li>
              <strong>Centrifugal chillers (US, 2025+):</strong> GWP cap 700. R-134a (GWP 1430)
              phasing out in new equipment. Replaced by R-513A (GWP 631), R-1234ze (GWP 7), or
              R-1233zd (GWP 1) depending on chiller manufacturer.
            </li>
            <li>
              <strong>Mobile AC (US, 2021+ per SNAP):</strong> GWP cap 150. R-134a (GWP 1430)
              prohibited in new vehicles. Replaced by R-1234yf (GWP 4). Most 2017+ vehicles in
              US already on R-1234yf.
            </li>
            <li>
              <strong>EU stationary refrigeration (most categories):</strong> GWP cap 150 since
              2022-2025. Tighter than AIM Act in most sectors — drove early adoption of R-454C,
              R-455A, R-744 in European markets.
            </li>
          </ul>

          <h2>AR5 vs AR6 — which one applies?</h2>
          <p>
            IPCC publishes updated GWP values with each Assessment Report. AR5 (2013) is the
            figure most regulations anchor to — including the EPA AIM Act, EU F-Gas Regulation,
            and the Kigali Amendment to the Montreal Protocol. AR6 (2021) provides updated
            values that are gradually being adopted in newer standards. Where the two differ
            meaningfully, both are shown.
          </p>
          <p>
            For regulatory compliance and reporting, the AR5 value is what you reference unless
            a specific regulation cites otherwise. AR6 values are typically slightly higher for
            HFCs (revised methodology accounts for additional atmospheric effects) and slightly
            lower for some HFOs. The methodology change does not affect the regulatory
            threshold positions — a refrigerant above 700 GWP per AR5 remains regulated by
            AIM Act regardless of its AR6 value.
          </p>

          <h2>TEWI and LCCP — beyond direct GWP</h2>
          <p>
            Total Equivalent Warming Impact (TEWI) and Life Cycle Climate Performance (LCCP)
            account for both direct refrigerant emissions (from leakage and end-of-life
            disposal) and indirect emissions from energy consumption over the equipment&apos;s
            lifetime. A high-GWP refrigerant in a hermetic system with very low leak rate and
            high efficiency can have a lower total impact than a low-GWP refrigerant in a
            leakier or less efficient system.
          </p>
          <p>
            For chillers, the indirect (energy) component typically dominates TEWI by 80-90%
            — meaning chiller efficiency matters more than refrigerant GWP for total climate
            impact. For residential AC and commercial refrigeration with higher leak rates,
            the balance shifts: a 5-10% annual leak rate over a 15-year equipment life can
            tip TEWI in favor of low-GWP refrigerants. The right metric depends on the
            application.
          </p>

          <h2>International regulatory landscape</h2>
          <p>
            The Kigali Amendment to the Montreal Protocol (signed 2016, entered force 2019)
            commits 198 countries to a coordinated HFC phase-down. The schedule differs by
            country group: developed countries (Article 5 non-parties) cut from 2019 with 85%
            reduction by 2036; developing countries follow a delayed schedule. The AIM Act
            (US) and EU F-Gas Regulation are the regional implementations of Kigali for those
            jurisdictions.
          </p>
          <p>
            Japan&apos;s Fluorocarbon Emissions Control Law (1998, amended several times) was
            an early national HFC management framework. China&apos;s implementation of Kigali
            started in 2024 with a freeze schedule. The international landscape continues
            to evolve; for current compliance, check the regulatory framework in your
            jurisdiction.
          </p>

          <h2>What&apos;s not in this table</h2>
          <p>
            Energy efficiency and operational emissions matter as much as direct refrigerant
            emissions for total climate impact (TEWI, LCCP). A high-GWP refrigerant in a
            hermetic system with very low leak rate can have a lower total impact than a
            low-GWP refrigerant in a leakier system with worse efficiency. GWP alone is
            necessary but not sufficient for environmental decision-making.
          </p>
        </section>

        <section className="mb-10 prose prose-zinc max-w-none dark:prose-invert">
          <h2>How GWP is actually computed</h2>
          <p>
            Global Warming Potential expresses the radiative forcing impact of a refrigerant
            relative to CO₂ over a chosen time horizon. The default for HVAC regulatory use
            is the 100-year value (GWP₁₀₀), though 20-year (GWP₂₀) is sometimes referenced
            for short-lived refrigerants where the short-term impact dominates. The
            calculation involves three factors: the refrigerant&apos;s radiative efficiency
            (how strongly it absorbs infrared per molecule), its atmospheric lifetime (how
            long it persists before decomposing), and the chosen integration horizon.
          </p>
          <p>
            Higher radiative efficiency + longer lifetime = higher GWP. R-23 (trifluoromethane)
            has a GWP of 14,800 because of its 222-year atmospheric lifetime; the much
            stronger absorber R-32 has GWP 675 because its lifetime is only 4.9 years; the
            HFOs (R-1234yf, R-1234ze) have very low GWP (1-7) primarily because of their
            short atmospheric lifetimes (10-13 days for R-1234yf).
          </p>
          <p>
            For zeotropic blends, GWP is computed as the mass-weighted average of the
            component GWPs per IPCC AR5 methodology. R-454B (68.9% R-32 + 31.1% R-1234yf):
            GWP = 0.689 × 675 + 0.311 × 4 = 466. R-454C (21.5% R-32 + 78.5% R-1234yf):
            GWP = 0.215 × 675 + 0.785 × 4 = 148. Same components, different proportions,
            very different GWPs.
          </p>

          <h2>Common GWP misconceptions</h2>
          <p>
            <strong>&quot;Low-GWP refrigerants are always better for the climate.&quot;</strong>{" "}
            Not necessarily. Total Equivalent Warming Impact (TEWI) accounts for both direct
            refrigerant emissions (leakage, end-of-life disposal) and indirect emissions
            from equipment energy consumption. For chillers with low annual leak rates and
            multi-decade equipment lifetimes, the indirect (energy) component dominates TEWI
            by 80-90% — meaning chiller efficiency matters more than refrigerant GWP for
            total climate impact. A 5% efficiency improvement on an R-134a chiller can offset
            the climate benefit of switching to R-513A.
          </p>
          <p>
            <strong>&quot;HFO refrigerants are zero-GWP.&quot;</strong> They&apos;re very low
            GWP, not zero. R-1234yf is GWP 4 (AR5) — small but not zero. The atmospheric
            decomposition product trifluoroacetic acid (TFA) is a separate environmental
            concern under active study; current regulatory consensus is that TFA from R-1234yf
            atmospheric breakdown is below ecotoxicity thresholds but ongoing monitoring
            continues.
          </p>
          <p>
            <strong>&quot;Natural refrigerants are GWP-free.&quot;</strong> Mostly true with
            caveats. R-744 (CO₂) is GWP 1 by definition (it&apos;s the reference compound).
            R-717 (NH₃) is GWP 0. R-290 (propane) is GWP 3 by AR5. R-1270 (propylene) is
            GWP 2. The handling and safety implications of natural refrigerants
            (flammability for hydrocarbons, toxicity for ammonia) shift the trade-off from
            climate to equipment design — they&apos;re not strictly better, just different
            constraints.
          </p>
          <p>
            <strong>&quot;The AIM Act bans R-410A.&quot;</strong> Imprecise. The AIM Act caps
            GWP at 700 for new residential AC equipment as of January 2025 — meaning
            equipment manufacturers can no longer ship new R-410A residential AC. Service of
            existing R-410A equipment continues indefinitely; refrigerant production is
            declining via allocation schedule, not banned outright. Plan refrigerant cost
            escalation over equipment lifetime.
          </p>

          <h2>Refrigerant lifetime context — why GWP differs from atmospheric persistence</h2>
          <p>
            Atmospheric lifetime is one of the three inputs to the GWP calculation but
            it&apos;s often the dominant one for high-GWP refrigerants. Examples from IPCC
            AR5: R-23 (HFC-23) has atmospheric lifetime 222 years and GWP 14,800; R-125 has
            lifetime 28.2 years and GWP 3,170; R-134a has lifetime 13.4 years and GWP 1,430;
            R-32 has lifetime 4.9 years and GWP 675; R-1234yf has lifetime 0.029 years
            (~10.6 days) and GWP 4.
          </p>
          <p>
            The dramatic drop in GWP from R-134a to R-1234yf comes primarily from the
            atmospheric lifetime collapse — both have similar radiative efficiency on a
            per-molecule basis, but R-1234yf decomposes in the atmosphere within weeks while
            R-134a persists for over a decade. This is why HFO chemistry is the path to
            ultra-low GWP refrigerants: short atmospheric lifetime drops the GWP arithmetic
            even if radiative efficiency is similar.
          </p>
          <p>
            For natural refrigerants, the lifetime argument is different. CO₂ has effectively
            infinite atmospheric lifetime (it&apos;s the reference compound with GWP 1 by
            definition); the climate impact of CO₂ is integrated into the GWP framework as
            the baseline rather than computed from lifetime. Ammonia (R-717) has very short
            atmospheric lifetime (decomposes rapidly), giving it GWP 0 in regulatory
            accounting. Hydrocarbons (R-290 propane, R-600a isobutane) have short atmospheric
            lifetimes giving low single-digit GWPs (3 for R-290 per AR5).
          </p>

          <h2>Methodology notes — IPCC AR5 vs AR6</h2>
          <p>
            IPCC publishes updated GWP values periodically as atmospheric chemistry
            understanding improves. The shift from AR5 (2013) to AR6 (2021) updated many
            HFC values slightly upward due to revised radiative-efficiency calculations that
            account for additional atmospheric effects not previously included. The shift
            from AR4 (2007) to AR5 was also non-trivial.
          </p>
          <p>
            Regulatory bodies typically lag the IPCC updates by 5-10 years for compliance
            stability. The EPA AIM Act, EU F-Gas Regulation, and Kigali Amendment all
            currently use AR5 values; AR6 adoption is gradual. For ground-truth regulatory
            compliance, use the value cited by the specific regulation. For scientific
            analysis or forward-looking planning, AR6 represents the current best estimate.
            The table on this page shows both where they differ meaningfully.
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
