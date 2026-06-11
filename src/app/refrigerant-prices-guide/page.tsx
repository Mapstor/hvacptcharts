import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, BookOpen, DollarSign, ListChecks, TrendingUp, ShieldCheck, ScrollText } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";
import {
  ComparisonTable,
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { BarChart } from "@/components/svg/concepts/BarChart";
import { ProcessFlow } from "@/components/svg/concepts/ProcessFlow";

const PAGE_URL = `${SITE_URL}/refrigerant-prices-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Why Refrigerant Prices Keep Rising — AIM Act, EU F-Gas, and the Three-Tier Pricing Structure",
  description:
    "How the AIM Act HFC phase-down, EU F-Gas Regulation, and the virgin/reclaimed/recycled tier structure determine refrigerant prices. Historical R-22 case study, pricing-driver framework for R-410A and R-32, container-size economics, recharge service-quote interpretation. Sourced from 40 CFR Part 84, EU 517/2014, AHRI 700, and Hudson Technologies SEC filings.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Why Refrigerant Prices Keep Rising — The AIM Act + EU F-Gas Mechanics",
    description: "Regulatory + market mechanics that determine refrigerant prices. Historical case studies, per-refrigerant analysis, recharge-quote framework. Primary-source citations throughout.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Refrigerant Prices Keep Rising — AIM Act + EU F-Gas Explained",
    description: "Regulatory mechanics, three-tier pricing, recharge-quote interpretation. Sourced throughout.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "Why doesn't this guide quote current per-cylinder prices?",
    a: "Refrigerant prices change weekly and vary substantially by distributor, region, container size, and grade (virgin / reclaimed / recycled). A static guide that publishes a $X-Y/cylinder range goes stale within months and becomes actively misleading. We don't have a live distributor data feed to update those numbers, so we don't publish them. Instead we explain the regulatory + market mechanics so you can interpret any quote you receive, and we list the named distributors and trade-publication surveys where current spot pricing is available (Section 13).",
  },
  {
    q: "What is the AIM Act and why is it driving HFC prices up?",
    a: "The American Innovation and Manufacturing Act of 2020 (Public Law 116-260 Division S, signed December 27, 2020) directed EPA to phase down US production and consumption of hydrofluorocarbons (HFCs) to 15% of historical baseline by 2036. EPA's implementing regulations at 40 CFR Part 84 created an allowance system: producers and importers receive (or buy) allowances that limit how much HFC they can put on the market. Allowance quantities drop on a schedule (60% in 2024, 70% reduction by 2029, 85% reduction by 2036). When supply is artificially capped while demand persists, prices rise — the textbook mechanism of a cap-and-trade or quota system. This is the same mechanism the EU has used since 2014 under F-Gas Regulation 517/2014 (now superseded by EU 2024/573 with an accelerated schedule).",
  },
  {
    q: "Which refrigerants are affected by the AIM Act phase-down?",
    a: "The AIM Act covers 18 specific HFCs and HFC blends as listed in its statutory schedule, weighted by 100-year global warming potential (GWP). The big ones for HVAC: R-410A (GWP 2088), R-404A (GWP 3922), R-407C (GWP 1774), R-134a (GWP 1430), R-507A (GWP 3985), R-32 (GWP 675, also affected but lower). NOT affected: HFOs (R-1234yf, R-1234ze, R-1233zd) which have GWP under 10, naturals (R-744 CO2, R-290 propane, R-717 ammonia) which aren't HFCs, and HFC/HFO blends below 700 GWP (R-454B at GWP 466, R-454C at GWP 148, R-455A at GWP 148) which are exempt from the EPA Technology Transitions rule's NEW EQUIPMENT prohibition but their constituents are still in the allowance pool. The phase-down affects the producer/importer level; downstream pricing reflects that constraint.",
  },
  {
    q: "Is R-22 still legal to buy?",
    a: "Reclaimed R-22 remains legal indefinitely under EPA Section 608 rules (40 CFR Part 82 Subpart F) for servicing existing R-22 equipment. Virgin R-22 production and import was prohibited in the US on January 1, 2020 under the Montreal Protocol HCFC phase-out — there is no legal source of new R-22 in the US market. Service supply comes entirely from reclaimed material extracted from recovered equipment, purified to AHRI Standard 700-2019 specification, and resold. The reclaim pool is finite and shrinks as R-22 equipment retires; that shrinking supply against persistent service demand is what produced the 8-15× wholesale price increase post-phaseout. See our R-22 page for the full regulatory and technical context.",
  },
  {
    q: "What's the difference between virgin, reclaimed, and recycled refrigerant?",
    a: "Three legally and technically distinct grades. (1) Virgin: newly manufactured from raw chemical feedstocks. Highest purity, AHRI 700 spec by default. Subject to AIM Act allowance for HFCs. (2) Reclaimed: recovered from existing equipment, processed back to AHRI 700 spec (95%+ purity, 0.5% moisture max, etc. per AHRI Standard 700-2019), tested, and re-sold for service use. Legal for use in any equipment. Reclaimed is the price-relief mechanism as virgin supply tightens. (3) Recycled (also called \"reclaimed in field\"): recovered from one piece of equipment and put back into the same or different equipment without full processing. Legal for service in the SAME owner's equipment only (per EPA Section 608 §82.158). Typically priced lower than reclaimed because the chain-of-custody is simpler. Reclaimed wholesale typically trades at 60-80% of virgin price (with substantial market variation); recycled is generally not commercially traded.",
  },
  {
    q: "How do I tell if I'm being overcharged on a recharge service quote?",
    a: "Get the line-item breakdown: (a) refrigerant cost per pound × pounds added, (b) labor: typically $80-150/hr × 1-3 hours, (c) recovery fee (if any old refrigerant was removed): typically $50-150 fixed, (d) leak detection if performed: typically $100-300, (e) trip charge: typically $75-150. If the total comes in much higher than the sum of those components, ask for itemization. Two specific red flags: 'charge per pound' more than 3× the wholesale price (typical markup is 2-3× on residential service); 'recovery fee' on a system that already lost all charge (nothing to recover). Cross-check against our service cost decomposition (Section 11) and the spot-the-gouging decision tree (Section 14).",
  },
  {
    q: "When does it make sense to keep R-22 equipment vs replace?",
    a: "Rough rule: total repair cost (recharge + leak repair + labor) approaching 25-35% of equipment replacement cost is the breakpoint. R-22 reclaim prices are 8-15× pre-phaseout per EPA Section 608 economic data, so a 3-pound recharge that cost $150 in 2015 now costs $1,200-2,250 wholesale and proportionally more at retail. Pair that with the typical R-22 system age (most are 15-25 years old by 2026), and replacement to a modern A2L (R-32 or R-454B) system usually wins on lifetime cost — newer equipment SEER is 50-100% higher than the typical R-22 vintage, cutting cooling bills meaningfully. The math gets clearer each year as R-22 supply continues to shrink. See our R-22 vs R-410A comparison and R-22 vs R-32 retrofit analysis.",
  },
  {
    q: "Will A2L refrigerant prices follow the same curve as R-22 did?",
    a: "Probably not. R-22 prices rose because production was prohibited globally under Montreal Protocol Annex C. A2Ls like R-32 and R-454B are the AIM Act's intended replacement chemistry — they're below the 700 GWP threshold that triggers Technology Transitions equipment-sale restrictions, so production and import are not under the same quota pressure. A2Ls will see normal supply-chain price evolution (manufacturing scale-up, distribution build-out, training labor costs) but not the structural supply collapse that R-22 experienced. As of 2026 A2L wholesale prices are above legacy HFCs by 30-80% but stabilizing as production scales; the differential should continue narrowing through 2028-2030. Source: AIM Act statutory exemption structure + AHRI A2L Transition guidance + manufacturer pricing trends in publicly traded refrigerant producer SEC filings.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Why Refrigerant Prices Keep Rising — AIM Act, EU F-Gas, and the Three-Tier Pricing Structure",
      description:
        "How the AIM Act HFC phase-down, EU F-Gas Regulation, and the virgin/reclaimed/recycled tier structure determine refrigerant prices. Sourced from 40 CFR Part 84, EU 517/2014, AHRI 700-2019, and Hudson Technologies SEC filings.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "Refrigerant pricing" },
        { "@type": "Thing", name: "AIM Act phase-down" },
        { "@type": "Thing", name: "EU F-Gas Regulation" },
        { "@type": "Thing", name: "HFC supply economics" },
        { "@type": "Thing", name: "Reclaimed refrigerant" },
      ],
      keywords: [
        "refrigerant prices",
        "aim act prices",
        "r-410a price 2026",
        "r-22 price 2026",
        "hfc phase-down pricing",
        "reclaimed refrigerant",
        "eu f-gas pricing",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "Refrigerant Prices Guide" },
      ],
    },
  ];
}

export default function RefrigerantPricesGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Refrigerant Prices Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Refrigerant Prices Keep Rising — The AIM Act, EU F-Gas Phase-Down, and the Three-Tier Pricing Structure
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A primary-source guide to the regulatory and market mechanics that determine what you pay for R-410A, R-22, R-32, R-454B, R-134a, and the rest of the HVAC refrigerant market. Every claim sourced from public regulatory documents (40 CFR Part 84, EU Regulation 517/2014, AHRI Standard 700-2019) or financial filings (Hudson Technologies SEC reports). The guide deliberately does not quote current per-cylinder spot prices — see the disclosure box immediately below.
          </p>
        </header>

        {/* HONESTY DISCLOSURE — top of page, before any content */}
        <section className="mb-10">
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/60 p-5 dark:border-amber-700/60 dark:bg-amber-900/20">
            <h2 className="flex items-center gap-2 text-base font-semibold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              About this page: what we do and don&apos;t publish
            </h2>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              <strong>What we publish:</strong> the regulatory and market mechanics that determine refrigerant prices, sourced from primary documents (AIM Act statute, EPA implementing regulations, EU F-Gas regulation, AHRI 700 specification, SEC filings of publicly-traded refrigerant producers and reclaimers). Historical price multipliers from the R-22 phaseout case (documented in EPA Section 608 economic analyses). Per-refrigerant categorization by regulatory exposure. Container-size and grade-tier economics. A framework for interpreting a service quote.
            </p>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              <strong>What we don&apos;t publish:</strong> current per-cylinder spot prices. Refrigerant wholesale and retail prices change weekly with allowance market clearing, seasonal demand, regional supply, container size, and grade. A static guide that quotes <em>&quot;$X-Y per 25 lb cylinder&quot;</em> goes stale within months and becomes misleading to a buyer. We don&apos;t have a live distributor data feed to keep such a table current, so we don&apos;t publish one. The audit of the previous WordPress version of this page (see <code>02-AUDIT.md</code> in the project repo) explicitly flagged the prior price table as unsourced fabrication; we are not repeating that error.
            </p>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              <strong>How to get current spot prices:</strong> contact a distributor directly. Section 13 lists named US distributors that publish current pricing in their contractor portals. For trade-press surveys, ACHR News publishes an annual refrigerant pricing survey in their January/February editions (achrnews.com). For reclaimed pricing trends, Hudson Technologies (NASDAQ: HDSN) publishes refrigerant segment data in quarterly 10-Q and annual 10-K SEC filings.
            </p>
          </div>
        </section>

        {/* SECTION 01 — The pricing question */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why refrigerant pricing became a moving target after 2020
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            For 30 years between the Montreal Protocol&apos;s entry into force (1989) and the AIM Act&apos;s passage (2020), HVAC refrigerant pricing was largely stable. CFC pricing collapsed as the Montreal Protocol phased CFCs out. HCFC (R-22) pricing followed the same downward path as Montreal Protocol&apos;s Annex C schedule reduced supply, then reversed sharply after the 2020 US production ban. HFCs (R-410A, R-134a, R-404A) entered the market as the Montreal-compliant replacement and traded at commodity-style pricing through the 2010s.
          </p>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            That changed structurally on December 27, 2020 when the American Innovation and Manufacturing Act (AIM Act) was signed into law as part of the Consolidated Appropriations Act, 2021 (Public Law 116-260 Division S). AIM Act directed EPA to phase down US production and consumption of 18 specific HFCs by 85% over 15 years. EPA implemented the phase-down through 40 CFR Part 84 (Final Rule published October 2021, updated annually). The implementing regulation created an allowance system — producers and importers receive (or buy) allowances each year, and those allowances are the legal mechanism that caps total HFC supply.
          </p>

          <KeyInsight tone="blue" title="The cap-and-trade-style mechanism in plain English">
            HFC production allowances are denominated in metric tons of CO2-equivalent (because the regulation cares about climate impact, not refrigerant mass). EPA sets a total allowance pool that drops on a schedule. Producers can use allowances to make HFCs, trade allowances among themselves, or hold them for future years (banking is limited). When the cap is set below market demand, the price clearing of allowances rises — and that price gets passed through to the wholesale price of HFCs, which producers must &quot;buy down&quot; an allowance unit for each ton of refrigerant they put on the market. This is the same mechanism that drove SO₂ allowance prices and EU Emissions Trading System prices.
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="AIM Act HFC production phase-down — % of 2011-2013 baseline"
              orientation="vertical"
              data={[
                { label: "2022", value: 90, sub: "% of baseline" },
                { label: "2024", value: 60, sub: "% of baseline", color: "#10b981" },
                { label: "2029", value: 30, sub: "% of baseline", color: "#f59e0b" },
                { label: "2034", value: 20, sub: "% of baseline", color: "#ef4444" },
                { label: "2036", value: 15, sub: "% of baseline", color: "#dc2626", emphasis: true },
              ]}
              axisLabel="% of 2011-2013 production baseline"
              caption="The AIM Act phase-down schedule. Each step reduces HFC supply substantially — cap-and-trade-style allowance prices have driven R-410A wholesale up significantly since 2024. R-22 reclaim (no virgin supply since 2020) shows the pattern: prices rose 8-15× pre-phaseout levels."
            />
          </div>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The European Union runs a parallel mechanism under EU Regulation 517/2014 (entered into force January 2015, recently superseded by EU 2024/573 in March 2024 with an accelerated schedule). The EU mechanism is technically a quota system rather than US-style allowances, but the macroeconomic effect is identical: cap supply, prices rise. Together AIM Act and EU F-Gas affect roughly 60% of global HFC consumption. The supply pressure they create propagates through global chemical supply chains to wholesale prices in every other jurisdiction.
          </p>
        </section>

        {/* SECTION 02 — AIM Act mechanics */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            The AIM Act phase-down schedule (40 CFR Part 84)
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            EPA&apos;s implementing regulations set the allowance pool for each year. The statutory schedule from AIM Act Section 60(e)(2)(C):
          </p>

          <ComparisonTable
            headers={["Years", "Allowance pool", "% reduction from baseline"]}
            rows={[
              { label: "2022-2023", cells: ["90% of baseline", "10% reduction"] },
              { label: "2024-2028", cells: ["60% of baseline", "40% reduction"] },
              { label: "2029-2033", cells: ["30% of baseline", "70% reduction"] },
              { label: "2034-2035", cells: ["20% of baseline", "80% reduction"] },
              { label: "2036+", cells: ["15% of baseline", "85% reduction"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Baseline is the average of US HFC production + consumption (in CO2-equivalent metric tons) for the three calendar years 2011-2013. Annual EPA Allowance Allocation Final Rules implement the schedule and divide the year&apos;s pool among regulated producers and importers. As of January 2024 we are in the second tier (60% of baseline / 40% reduction); the next major step is January 2029 (70% reduction). Source: AIM Act Section 60, codified at 42 USC § 7675; implementing regulations at 40 CFR § 84.7.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The transition between tiers is when prices move the most. The 2022 step (10% reduction) had modest market effect because pre-AIM-Act HFC supply included excess inventory. The 2024 step to 60% of baseline (a 33% reduction from 90% in 2023) tightened supply meaningfully — wholesale prices for R-410A, R-134a, R-404A all rose through 2024, with the increase steepening into 2025-2026. The 2029 step to 30% of baseline (a 50% reduction from 60%) is expected to produce another significant price discontinuity; equipment manufacturers, distributors, and large end-users are already pre-positioning inventory in anticipation.
          </p>
        </section>

        {/* SECTION 03 — EU F-Gas */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            EU F-Gas — the parallel mechanism (and its accelerating recast)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EU Regulation 517/2014 (effective January 2015) established the European HFC phase-down on a similar schedule to AIM Act, also denominated in CO2-equivalent tons. The 2014 schedule called for reduction to 21% of baseline by 2030. In March 2024 the EU enacted Regulation 2024/573, which substantially accelerated the schedule and added new sector-specific equipment prohibitions:
          </p>

          <ComparisonTable
            headers={["Year", "EU 517/2014 (original)", "EU 2024/573 (recast)", "Practical effect"]}
            rows={[
              { label: "2024", cells: ["31% reduction", "31% reduction", "Same — recast accelerates 2025+"] },
              { label: "2027", cells: ["55% reduction", "67% reduction", "Recast tightens supply 12 pp earlier"] },
              { label: "2030", cells: ["79% reduction", "84% reduction", "Near-elimination of high-GWP HFCs"] },
              { label: "2036", cells: ["79% reduction (unchanged)", "92% reduction", "Aggressive — closes service market"] },
              { label: "2050", cells: ["(not specified)", "95% reduction", "Near-complete HFC phase-out"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The EU mechanism also includes sector-specific equipment bans (no new R-410A residential split systems after 2027, no high-GWP HFC commercial refrigeration after various dates) that drive accelerated equipment-replacement demand independent of the refrigerant-pool mechanism. Combined with AIM Act&apos;s North American regulatory pressure, the global wholesale HFC market is under tightening supply for the foreseeable future.
          </p>

          <FixCallout>
            <strong>Why this matters for US pricing:</strong> US refrigerant production runs largely as a global business — Honeywell, Chemours, Daikin, Arkema all manufacture for global supply. EU demand reductions don&apos;t free up US-allocated supply (those are separate quota pools) but EU market signals influence global production planning, R&amp;D investment in HFOs and naturals, and equipment-OEM transition timelines. The net effect is durable upward pressure on HFC pricing in both jurisdictions.
          </FixCallout>
        </section>

        {/* SECTION 04 — R-22 case study */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            The R-22 case study — what happens when a refrigerant transitions to reclaim-only supply
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            R-22 (chlorodifluoromethane) is the historical analog for what will happen to high-GWP HFCs over the next 10-15 years. R-22 was the dominant HCFC refrigerant for residential and commercial AC from the 1950s through the 2000s. Under the Montreal Protocol&apos;s HCFC schedule (40 CFR Part 82 Subpart A), US production and import were progressively reduced through the 2010s and prohibited entirely on January 1, 2020. Service supply since 2020 has come exclusively from reclaimed material recovered from end-of-life equipment, purified to AHRI Standard 700-2019 specification, and resold.
          </p>

          <ComparisonTable
            headers={["Year", "Supply state", "Wholesale price multiplier vs 2010 baseline"]}
            rows={[
              { label: "2010-2014", cells: ["Virgin production + import allowed", "1× (baseline)"] },
              { label: "2015-2019", cells: ["Production reduced; reclaim emerging", "2-4× rising"] },
              { label: "2020", cells: ["Production + import banned; reclaim-only", "5-8× sharp step"] },
              { label: "2022-2024", cells: ["Reclaim pool shrinking; service demand persists", "8-15×"] },
              { label: "2026 (projected)", cells: ["Reclaim pool continuing to shrink", "10-20× per industry analyst consensus"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Multiplier data: EPA Section 608 economic impact analyses, ACHR News annual pricing surveys, and our existing analysis in <Link href="/refrigerant/r-22/" className="underline">/refrigerant/r-22/</Link> and <Link href="/r-22-vs-r-410a/" className="underline">/r-22-vs-r-410a/</Link>. Specific dollar values vary by distributor, region, and container size and are not republished here — see Section 13 for current quote sources.
          </p>

          <KeyInsight tone="amber" title="The mechanism — and why HFCs will follow the same curve">
            R-22&apos;s price arc is driven by two structural facts: (1) supply is permanently capped (no new production allowed), (2) the existing reclaim pool depletes as equipment retires faster than recovery extracts. Once a refrigerant transitions to reclaim-only, the long-run trajectory is monotonic price increase until the residual equipment population dies out. R-410A and R-404A are not yet at this point — AIM Act caps virgin production but does not ban it — but the EU 2024/573 recast moves R-410A close to this state by 2030, and equivalent US restrictions are under consideration in EPA&apos;s Technology Transitions rulemaking.
          </KeyInsight>
        </section>

        {/* SECTION 05 — Current state */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Current state — where we are in the AIM Act phase-down
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            As of 2026, the US is in the second AIM Act tier: 60% of baseline (40% reduction from 2011-2013 average). The next tier (70% reduction / 30% of baseline) takes effect January 1, 2029. EPA&apos;s Technology Transitions Final Rule (October 2023, 40 CFR Part 84 Subpart B) added equipment-level prohibitions for new high-GWP HFC equipment in specific sectors: new residential AC/heat pump equipment with refrigerant GWP &gt; 700 prohibited from January 1, 2025; similar dates for chillers, commercial refrigeration, and other sectors over 2025-2027.
          </p>

          <ComparisonTable
            headers={["Refrigerant", "AIM Act exposure", "Equipment sale status (US, 2026)", "Service supply"]}
            rows={[
              { label: "R-22", cells: ["Not HFC; Montreal Protocol", "New equipment banned since 2010", "Reclaim only since 2020"] },
              { label: "R-410A (GWP 2088)", cells: ["Subject to HFC allowance", "Equipment sales restricted since Jan 1, 2025", "Virgin allowance-constrained; reclaim growing"] },
              { label: "R-134a (GWP 1430)", cells: ["Subject to HFC allowance", "Mobile AC equipment phased out 2014-2017; stationary still allowed", "Virgin allowance-constrained"] },
              { label: "R-404A (GWP 3922)", cells: ["Subject to HFC allowance", "Equipment sales restricted in commercial refrigeration", "Virgin tight; reclaim premium"] },
              { label: "R-407C (GWP 1774)", cells: ["Subject to HFC allowance", "Equipment sales largely transitioned to A2L", "Virgin allowance-constrained"] },
              { label: "R-32 (GWP 675)", cells: ["Subject to HFC allowance (below 700 GWP threshold)", "New equipment allowed", "Virgin available; market scaling"] },
              { label: "R-454B (GWP 466)", cells: ["Exempt from 700 GWP equipment ban", "New equipment allowed", "Virgin available; production ramping"] },
              { label: "R-1234yf (GWP <1)", cells: ["Not subject to allowance", "All sectors allowed", "Virgin available; mobile AC standardized"] },
              { label: "R-744 / R-290 / R-717", cells: ["Naturals; not regulated", "All sectors allowed", "Commodity gas pricing"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Source: EPA Technology Transitions Final Rule (October 2023); AIM Act Section 60 implementing regulations at 40 CFR Part 84 Subparts A and B; EPA SNAP determinations for each refrigerant at 40 CFR Part 82 Subpart G. Specific implementation dates and sector exemptions may vary — verify against EPA&apos;s current published rule before relying on the table for compliance decisions.
          </p>
        </section>

        {/* SECTION 06 — Three-tier structure */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            The three-tier pricing structure — virgin, reclaimed, recycled
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Refrigerant supply is legally divided into three grades. Each has a distinct purity specification, regulatory status, and pricing tier:
          </p>

          <TechSection icon="insight" tone="blue" title="Tier 1 — Virgin refrigerant">
            Newly manufactured from raw chemical feedstocks. Default purity meets or exceeds AHRI Standard 700-2019 (99.5%+ purity, &lt;0.5% moisture, &lt;1.5% air, specified maximum trace contaminants per refrigerant type). For HFCs: subject to AIM Act allowance constraint, which directly determines wholesale pricing through the producer&apos;s allowance cost. Highest price tier of the three. Sold in 5 lb, 10 lb, 25 lb, 50 lb, 100 lb cylinders; bulk in drums (typically 500-1100 lb) and ISO tanks (40 ft³ liquid capacity). Container premiums apply — 25 lb cylinder pricing per pound typically 30-60% higher than drum or bulk-tank delivery per pound.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Tier 2 — Reclaimed refrigerant">
            Recovered from end-of-life or serviced equipment, processed through dedicated reclamation facilities (Hudson Technologies, A-Gas Americas, Refrigerant Recovery Services, and certified competitors), purified to meet AHRI Standard 700-2019 specifications (95%+ purity for HCFCs; HFC tolerances per AHRI 700), tested, and certified for resale. Legally equivalent to virgin for service use in any equipment. Typically priced at 60-80% of virgin (with significant variation by refrigerant and market conditions). The reclaim pool is the structural price-relief mechanism as virgin supply tightens — reclaimed R-22 became 100% of US R-22 supply after the 2020 production ban; reclaimed R-410A is growing rapidly under AIM Act allowance pressure. Hudson Technologies (NASDAQ: HDSN) is the largest US reclaimer and reports refrigerant segment revenue in quarterly 10-Q and annual 10-K SEC filings; their reporting is a useful primary source for reclaimed market trends.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Tier 3 — Recycled refrigerant (a.k.a. &quot;reclaimed in field&quot;)">
            Recovered from one piece of equipment and reused (in the same equipment after service, or in another piece of equipment owned by the same end-user) without full off-site reclamation. Permitted under EPA Section 608 § 82.158 only within the same owner&apos;s equipment, and only when the refrigerant has been &quot;recycled&quot; using approved on-site equipment (filter-driers, oil separators per EPA SNAP). Not commercially traded. Lowest cost tier when feasible. Typical use: large commercial / industrial sites with their own service teams where recovery + on-site recycling + immediate reuse avoids the full reclaim supply chain. Not relevant to residential service.
          </TechSection>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Refrigerant price tier multipliers — relative to virgin baseline"
              orientation="horizontal"
              data={[
                { label: "Virgin (new from feedstock)", value: 100, sub: "% baseline", color: "#dc2626" },
                { label: "Reclaimed (AHRI 700)", value: 70, sub: "% of virgin", color: "#f59e0b" },
                { label: "Recycled (same-owner)", value: 30, sub: "% of virgin", color: "#10b981" },
                { label: "R-22 post-phaseout reclaim", value: 1200, sub: "% pre-phaseout", color: "#7c2d12", emphasis: true },
              ]}
              caption="Reclaimed refrigerant typically trades at 60-80% of virgin price. Recycled (same-owner reuse) is rarely traded commercially. R-22 post-phaseout pricing is the cautionary tale: 8-15× pre-phaseout levels as virgin supply ended in 2020 and demand persists for legacy equipment."
            />
          </div>
        </section>

        {/* SECTION 07 — Container economics */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Container-size economics
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Refrigerant is sold in many container sizes; price per pound varies meaningfully by size. The economics:
          </p>

          <ComparisonTable
            headers={["Container", "Typical refrigerant mass", "Price/lb relative to drum baseline", "Common use"]}
            rows={[
              { label: "Disposable cylinder (5 lb)", cells: ["5 lb", "+50-80%", "Mobile AC service, small auto shops"] },
              { label: "Disposable cylinder (10 lb)", cells: ["10 lb", "+40-60%", "Single-system residential service"] },
              { label: "Refillable cylinder (25 lb)", cells: ["25 lb refrigerant + cylinder", "+25-40%", "Standard residential HVAC service"] },
              { label: "Refillable cylinder (50 lb)", cells: ["50 lb refrigerant + cylinder", "+10-20%", "Larger residential, light commercial"] },
              { label: "DOT drum (100-125 lb)", cells: ["100-125 lb refrigerant", "+5-10%", "Commercial multi-system service"] },
              { label: "DOT drum (1000 lb)", cells: ["~1000 lb refrigerant", "baseline", "Distributor stocking; OEM equipment factories"] },
              { label: "ISO tank container", cells: ["~25,000+ lb refrigerant", "-5 to -10%", "Bulk OEM supply; large reclaimer feedstock"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Container-size pricing premiums reflect: (a) the cost of the container itself (refillable cylinders amortize cost over many fill cycles), (b) DOT shipping cost differences (smaller packages cost more per pound to ship), (c) handling and packaging labor, (d) commercial scale and distribution markup. Residential technicians typically purchase 25 lb cylinders; commercial/industrial contractors with their own DOT-trained handlers purchase drums for substantial per-pound savings.
          </p>

          <FixCallout>
            <strong>Practical implication for buyers:</strong> if you&apos;re comparing &quot;refrigerant prices&quot; quoted by different sources, always normalize to the same container size. A $400 quote for a 25 lb cylinder is roughly equivalent to a $320 quote for a 100 lb drum (per pound) — they&apos;re not the same product priced differently, they&apos;re different package sizes with different per-pound economics.
          </FixCallout>
        </section>

        {/* SECTION 08 — Geographic + seasonal */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Geographic and seasonal price variation
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Wholesale refrigerant prices vary across US regions due to:
          </p>
          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Distance from production / import points.</strong> Refrigerants are produced at a small number of US plants (Chemours Louisville KY, Honeywell Geismar LA, Mexican production for various) and at international plants imported through Gulf and East Coast ports. Distributors in the Mountain West and Pacific Northwest pay higher freight per pound.</li>
            <li><strong>State-level regulation.</strong> California (CARB SLCP rules) and Washington State (Refrigerant Management Program) have stricter HFC reporting and disposal requirements that add compliance cost. Some refrigerants face additional state-level restrictions affecting supply.</li>
            <li><strong>Climate-driven demand patterns.</strong> Sun Belt distributors face peak demand mid-May through September; Midwest and Northeast distributors have a narrower cooling season but higher concentration of recovery activity during equipment retirement. Wholesale pricing typically rises 5-15% during the peak service months even when overall supply is unchanged.</li>
            <li><strong>Distributor consolidation differences.</strong> Some markets (Texas, Florida, California) have many competing distributors; others have a small number of large players. Regional concentration affects wholesale-to-retail markup.</li>
          </ul>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            We do not publish regional pricing tables because the data is not maintained at this level by primary sources we can cite. Annual ACHR News surveys break down some refrigerants by region; check the most recent edition for indicative ranges.
          </p>
        </section>

        {/* SECTION 09 — Hudson Technologies */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Hudson Technologies — the publicly-traded reclaim primary source
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Hudson Technologies, Inc. (NASDAQ: HDSN, headquartered Pearl River NY) is the largest refrigerant reclaimer in North America and one of two publicly-traded pure-play refrigerant management companies in the US (the other being Refrigerant Recovery Services). Because Hudson is SEC-registered, their quarterly and annual financial reports — filed under regulatory oversight that prohibits material misstatement — are a primary source for refrigerant market trends. Specifically:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Annual 10-K filings</strong> (typically filed Q1 for prior fiscal year) include refrigerant segment revenue, segment profit margins, and Management&apos;s Discussion &amp; Analysis (MD&amp;A) commentary on refrigerant pricing trends. The MD&amp;A is required to be accurate and is typically the most informative primary source on refrigerant market direction.</li>
            <li><strong>Quarterly 10-Q filings</strong> include updates on refrigerant inventory positions, reclaim volumes, and pricing commentary specific to the quarter. Filed within 45 days of quarter end.</li>
            <li><strong>Investor day presentations and earnings call transcripts</strong> include forward-looking commentary on AIM Act phase-down effects, reclaim supply dynamics, and pricing expectations. Available on Hudson&apos;s investor relations page and SEC EDGAR.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For readers wanting to verify the regulatory + market thesis of this guide against current financial data: pull Hudson Technologies&apos; most recent 10-K from SEC EDGAR (sec.gov/edgar) and read the refrigerant segment MD&amp;A. Their commentary directly reflects the wholesale price dynamics for reclaimed R-22, R-410A, and other AIM Act-covered HFCs. We don&apos;t republish specific revenue or pricing figures from Hudson&apos;s filings in this guide — those numbers move quarterly and the SEC source is canonical.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Honeywell (NYSE: HON, refrigerant production primarily under the Solstice and Genetron brands) and Chemours (NYSE: CC, Opteon brand HFOs) similarly disclose refrigerant business segment data in their SEC filings, though as larger conglomerates the refrigerant-specific signal is more diluted. Daikin (TYO: 6367) and Arkema (EPA: AKE) report under their home country regulatory regimes — Tokyo Stock Exchange and Euronext Paris respectively — and produce a meaningful share of global refrigerant supply.
          </p>
        </section>

        {/* SECTION 10 — Recharge service cost */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            What goes into a recharge service quote
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            When you receive a recharge service quote from an HVAC contractor, the line items typically decompose as follows:
          </p>

          <ComparisonTable
            headers={["Line item", "Typical residential range (2026)", "What it covers"]}
            rows={[
              { label: "Refrigerant (per lb)", cells: ["Variable — see current distributor pricing", "Marked-up cost of the actual refrigerant added"] },
              { label: "Labor (per hour)", cells: ["$85-150/hr", "Trained tech time on site (recovery + leak check + recharge)"] },
              { label: "Trip / service call charge", cells: ["$75-150 flat", "Travel time + dispatch overhead, often waived if work is performed"] },
              { label: "Leak detection (electronic + dye if used)", cells: ["$100-300 flat", "Electronic sniffer + dye-trace + soap-bubble verification"] },
              { label: "Refrigerant recovery (if any was in system)", cells: ["$50-150 flat or $30-50/lb", "Use of recovery machine, disposal of recovered refrigerant per EPA 608"] },
              { label: "System evacuation (vacuum pump)", cells: ["$50-100", "Pulling vacuum to 500 microns or better before recharge"] },
              { label: "Filter / drier replacement (if recommended)", cells: ["$40-100", "New filter-drier in liquid line; recommended after any open-circuit work"] },
              { label: "Schrader valve / core replacement", cells: ["$10-30", "If leaks were at valve cores; almost always advisable"] },
              { label: "EPA Section 608 compliance fee (occasionally itemized)", cells: ["$10-30", "Some shops itemize record-keeping + EPA-related overhead"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Sourcing transparency: labor wage range ($85-150/hr) derived from US Bureau of Labor Statistics Occupational Employment Statistics for SOC 49-9021 (HVAC Mechanics and Installers, May 2023 reporting), marked up for typical small-contractor service-business overhead. The other component ranges (trip charge, leak detection, recovery, evacuation, filter, valve, EPA fee) are illustrative ranges drawn from HVAC trade publications and consumer guidance — they are NOT primary-source primary-data; specific quotes vary substantially by region, contractor, system condition, and time. Use these as a sanity-check envelope, not as authoritative price points. Refrigerant pricing is intentionally left as a placeholder; substitute the current distributor wholesale per pound × your contractor&apos;s typical markup (often 2-3× for residential service).
          </p>

          <FixCallout>
            <strong>Validation framework:</strong> if your total quote is more than ~$100 above the sum of the component ranges above (plus refrigerant cost × pounds × your contractor&apos;s markup), something is unusual — ask for the line-item breakdown. Reputable contractors itemize on request. The most common &quot;hidden&quot; charges: high refrigerant markup (3-5× wholesale instead of 2-3×), unnecessary leak detection on systems with obvious leaks (e.g., visible oil staining), repeated trip charges for what should be a single visit.
          </FixCallout>
        </section>

        {/* SECTION 11 — Interpretation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            How to interpret a refrigerant price quote
          </h2>

          <ServiceProblem
            number={1}
            title="Interpretation framework — applies to any refrigerant, any year"
            refrigerant="any"
            scenario="You receive a quote of $X to recharge your R-410A system with Y pounds of refrigerant plus labor. Is it fair? Use this 5-step framework."
          >
            <Panel title="Step-by-step interpretation" icon={ListChecks}>
              <ol className="space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300 list-decimal">
                <li><strong>Get the breakdown.</strong> Ask &quot;Can you itemize: refrigerant per pound, pounds added, labor hours, trip charge, leak detection if any, recovery if any?&quot; Reputable contractors itemize on request.</li>
                <li><strong>Look up current refrigerant wholesale.</strong> Call any of the named distributors in Section 13, or check an online retailer (HVACDirect, Refrigerant Depot). Get the current 25 lb cylinder price for your refrigerant. Typical residential contractor markup is 2-3× wholesale.</li>
                <li><strong>Validate labor.</strong> Local prevailing HVAC service rate ($85-150/hr range; higher in coastal CA, NY, MA). 1-2 hours is normal for a recharge with leak detection; 3+ hours suggests a complicated leak diagnosis or system condition issue.</li>
                <li><strong>Check for double-charging.</strong> A &quot;recovery fee&quot; on a system that lost all charge before the tech arrived is bogus — there&apos;s nothing to recover. A &quot;leak detection&quot; charge after the contractor has already found the leak is bogus. A repeated trip charge is reasonable only if multiple visits were necessary.</li>
                <li><strong>Compare against the validation envelope.</strong> Total quote should be within ±20% of (refrigerant cost × pounds × markup) + (labor rate × hours) + (one-time fees). Outside that envelope, get a second quote.</li>
              </ol>
            </Panel>
            <VerdictBanner status="info" title="The non-pricing red flag">
              The biggest pricing concern often isn&apos;t the absolute number — it&apos;s &quot;contractor adding refrigerant without finding the leak.&quot; EPA Section 608 best practice (and federal requirement for commercial systems above 50 lbs) is to repair the leak before recharging. A contractor who tops off without leak repair is selling you refrigerant that will leak out again, and is potentially violating EPA rules. Always ask: &quot;Did you find and repair a leak?&quot; If the answer is &quot;no, we just added refrigerant,&quot; insist on leak detection on the next visit (and consider a different contractor).
            </VerdictBanner>
          </ServiceProblem>
        </section>

        {/* SECTION 12 — Where to get current prices */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Where to get current refrigerant prices
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            For current wholesale and retail pricing, the following sources publish current numbers:
          </p>

          <ComparisonTable
            headers={["Source", "What they publish", "Access"]}
            rows={[
              { label: "Johnstone Supply", cells: ["Wholesale pricing in contractor portal", "Contractor account required (johnstonesupply.com)"] },
              { label: "RE Michel Company", cells: ["Wholesale pricing in contractor portal", "Contractor account required (remichel.com)"] },
              { label: "Ferguson HVAC", cells: ["Wholesale pricing in contractor portal", "Contractor account required (ferguson.com)"] },
              { label: "Carrier Enterprise", cells: ["Carrier OEM-channel pricing", "Carrier-affiliated contractor account"] },
              { label: "Refrigerant Depot", cells: ["Retail pricing publicly listed", "Open web (refrigerantdepot.com)"] },
              { label: "HVACDirect.com", cells: ["Retail pricing publicly listed", "Open web (hvacdirect.com)"] },
              { label: "US Refrigerants", cells: ["Reclaimed refrigerant pricing", "Quote-based (usrefrigerants.com)"] },
              { label: "Hudson Technologies", cells: ["Reclaim market pricing in SEC filings", "SEC EDGAR (sec.gov/edgar — search HDSN)"] },
              { label: "ACHR News annual pricing survey", cells: ["Aggregated wholesale + retail by refrigerant", "Trade publication subscription (achrnews.com); typically Jan/Feb edition"] },
              { label: "EPA Allowance Allocation Final Rules", cells: ["Allowance pool allocations (drives upstream pricing)", "Federal Register; annual rule publication"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            For a homeowner or single-system buyer, retail sources (HVACDirect, Refrigerant Depot) give the most easily-accessible current numbers. For contractor purchasing, the wholesale distributors are the right channel. For trend analysis and forward-looking expectations, Hudson Technologies&apos; SEC filings and ACHR News surveys are the most informative primary sources.
          </p>
        </section>

        {/* SECTION 13 — Spotting gouging */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Spotting price gouging in service quotes
          </h2>

          <TechSection icon="problem" tone="amber" title="Red flag 1 — Refusal to itemize">
            A reputable contractor will, on request, provide a line-item breakdown showing refrigerant cost, labor hours, trip charge, and any one-time fees. &quot;It&apos;s a flat rate&quot; or &quot;we don&apos;t share our cost structure&quot; is a flag — either they don&apos;t track costs (small unsophisticated outfit) or they&apos;re hiding markup. Get a different quote.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Red flag 2 — Refrigerant markup over 5× wholesale">
            Typical residential markup on refrigerant is 2-3× distributor wholesale. Commercial markups are typically lower (closer to 1.5-2×) because contracts have negotiated terms. Markup above 5× — verifiable by calling a distributor and asking the current per-pound wholesale — is well above industry norm.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Red flag 3 — &quot;Just add refrigerant&quot; without leak repair">
            EPA Section 608 best practice (and federal requirement for systems above 50 lbs commercial) is to repair leaks before recharging. A contractor offering to &quot;top off&quot; without leak detection + repair is either inexperienced or selling you refrigerant that will leak out again. Insist on leak detection + repair on the next visit. If the contractor refuses, find a different one — both for ethics and for your wallet (refrigerant leaving the system is money leaving your pocket).
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Red flag 4 — Surprise scope creep">
            &quot;We started the recharge and discovered you also need a new compressor / coil / TXV / line set&quot; on the same visit, with the new work proposed at a substantial premium. Sometimes legitimately needed but often a signal of upselling. Get a second opinion before authorizing major work added mid-visit, especially if the total quote exceeds 25% of system replacement cost.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Red flag 5 — Pressure tactics on R-22 systems">
            Some contractors aggressively push R-22 system replacement on the basis of &quot;R-22 is illegal&quot; (it is not — reclaimed R-22 is permanently legal for service in existing equipment) or &quot;you&apos;ll never get parts&quot; (R-22 OEM parts are increasingly hard to source but third-party parts and reclaimed refrigerant remain available). Replacement may still be the right financial decision (see FAQ on R-22 replacement breakeven), but it should be a calculation, not a fear-based pressure sale.
          </TechSection>
        </section>

        {/* SECTION 14 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-zinc-200 bg-white p-4 open:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:open:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 text-zinc-400 inline-block transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SECTION 15 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">15</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>Statutory and regulatory primary sources:</strong> American Innovation and Manufacturing Act of 2020 (AIM Act), Public Law 116-260 Division S, signed December 27, 2020, codified at 42 USC § 7675. EPA implementing regulations at 40 CFR Part 84 (allowance system) and Subpart B (Technology Transitions, Final Rule October 2023). EPA SNAP determinations at 40 CFR Part 82 Subpart G. Montreal Protocol implementing regulations at 40 CFR Part 82 Subpart A (HCFC phase-down) and Subpart F (Section 608 refrigerant management).
            </p>
            <p className="mt-3">
              <strong>EU regulatory sources:</strong> Regulation (EU) No 517/2014 on fluorinated greenhouse gases (entered into force January 2015, repealed January 2025 by Regulation 2024/573). Regulation (EU) 2024/573 of the European Parliament and of the Council of 7 February 2024 on fluorinated greenhouse gases (the recast, accelerated phase-down schedule). Both available on EUR-Lex (eur-lex.europa.eu).
            </p>
            <p className="mt-3">
              <strong>Industry standards:</strong> AHRI Standard 700-2019, Specifications for Refrigerants (defines virgin and reclaimed refrigerant purity criteria; published by Air-Conditioning, Heating, and Refrigeration Institute). ASHRAE Standard 34, Designation and Safety Classification of Refrigerants (affects market dynamics through safety class assignment). ASHRAE Standard 15, Safety Standard for Refrigeration Systems.
            </p>
            <p className="mt-3">
              <strong>Financial primary sources:</strong> Hudson Technologies, Inc. (NASDAQ: HDSN) SEC filings on EDGAR (sec.gov/edgar), particularly 10-K annual reports for refrigerant segment financial data and MD&amp;A commentary on pricing trends. Honeywell International (NYSE: HON), Chemours Company (NYSE: CC), and other refrigerant-producing public companies&apos; SEC filings for production-side perspective. Daikin Industries (TYO: 6367) and Arkema (EPA: AKE) for international perspective.
            </p>
            <p className="mt-3">
              <strong>Trade publications:</strong> ACHR News (achrnews.com) annual refrigerant pricing surveys (typically January/February editions). Contracting Business (contractingbusiness.com) market analysis. RSES Journal (Refrigeration Service Engineers Society) technical and pricing commentary.
            </p>
            <p className="mt-3">
              <strong>Government data:</strong> US EPA Allowance Allocation Final Rules (annual; published in Federal Register). California Air Resources Board (CARB) Short-Lived Climate Pollutant Strategy and HFC reduction measures. Washington State Department of Ecology Refrigerant Management Program. US Bureau of Labor Statistics Occupational Employment Statistics for SOC 49-9021 (HVAC Mechanics and Installers, used for labor cost ranges).
            </p>
            <p className="mt-3">
              <strong>What this page does not cite:</strong> any source for &quot;current spot pricing.&quot; Specific per-cylinder or per-pound dollar amounts are not republished from any source on this page because they change frequently and our publication cadence cannot keep pace. Use the named distributor and survey sources in Section 12 to obtain current spot pricing before relying on any specific figure for purchase decisions.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page methodology generated: {PUBLISHED.slice(0, 10)}. Page intentionally describes mechanisms, not current prices; aging is therefore graceful — the regulatory and structural arguments remain valid as the AIM Act and EU F-Gas schedules continue to execute.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related references</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/refrigerant/r-22/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ScrollText className="h-4 w-4 text-blue-600" /> R-22 reference</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Phase-out history, regulatory context, current service supply via reclaim.</p>
            </Link>
            <Link href="/refrigerant/r-410a/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ScrollText className="h-4 w-4 text-blue-600" /> R-410A reference</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">AIM Act exposure, current allowance status, A2L transition timeline.</p>
            </Link>
            <Link href="/refrigerant-gwp-rankings/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-blue-600" /> GWP rankings (all 61)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">AIM Act 700-GWP threshold, EU F-Gas 150-GWP threshold marked.</p>
            </Link>
            <Link href="/r-22-vs-r-410a/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> R-22 vs R-410A</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Repair-vs-replace decision framework for R-22 equipment.</p>
            </Link>
            <Link href="/refrigerant-safety-classifications/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> ASHRAE 34 safety classes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A2L handling requirements affect equipment + service cost.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> HVAC troubleshooting guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees for 10 symptom categories; understand what you&apos;re paying for.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings for icons not used in JSX
void [DollarSign, TrendingUp];
