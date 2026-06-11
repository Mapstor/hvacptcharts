import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, Sun, Snowflake, DollarSign, TrendingUp, ListChecks, Zap, Wind, FileCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-energy-efficiency-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Energy Efficiency Guide — SEER2, HSPF2, AFUE Explained + Heat Pump vs Furnace Economics + IRA Tax Credits",
  description:
    "Complete HVAC efficiency guide: SEER2 and HSPF2 (DOE's 2023 metric updates), AFUE for gas furnaces, EER/COP instantaneous metrics, climate-dependent heat pump performance, the rated-vs-actual gap, variable-capacity vs single-stage tradeoffs, sizing and duct impact on real-world efficiency, ENERGY STAR criteria, IRA 25C tax credits and HOMES/HEEHRA rebates. Sourced from 10 CFR Part 430, AHRI Standards 210/240 and 1380, IRS 25C, ENERGY STAR program criteria.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Energy Efficiency Guide — SEER2, HSPF2, AFUE + Heat Pump Economics",
    description: "DOE 2023 metric transition + heat pump vs furnace economics + IRA tax credits. Sourced from federal standards.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Energy Efficiency Guide — SEER2, HSPF2, AFUE",
    description: "Complete efficiency metrics + heat pump economics + IRA tax credits.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What changed between SEER and SEER2 in 2023?",
    a: "DOE's Final Rule on Central Air Conditioner and Heat Pump Energy Conservation Standards (effective January 1, 2023, codified at 10 CFR Part 430) updated the test method from M1 to M1.1 to better reflect real-world ducted-system performance. The key change: AHRI Standard 210/240 (2023 update) increased the external static pressure (ESP) assumption in testing from 0.10 in.w.c. to 0.50 in.w.c. — a more realistic duct-system load. Result: at the same rated capacity, SEER2 values are typically 4-5% lower than SEER would have been under the old test. A 16 SEER unit translates to approximately 15.2 SEER2; 18 SEER becomes about 17.1 SEER2. The DOE published a conversion ratio (multiply old SEER by 0.95 for approximate SEER2) but the actual relationship varies by equipment class. SEER2 minimums took effect January 2023: 14.3 SEER2 (15 SEER equivalent) for split AC south of 36th parallel; 13.8 SEER2 (15 SEER) in the North. Equipment manufactured before 2023 with old SEER ratings remained legal for installation through transition deadlines that vary by region.",
  },
  {
    q: "What's the difference between SEER and EER?",
    a: "SEER (Seasonal Energy Efficiency Ratio) is the seasonal-average efficiency calculated by integrating performance across the full cooling-season operating envelope per AHRI Standard 210/240. SEER2 is the post-2023 version. EER (Energy Efficiency Ratio) is the instantaneous efficiency at one specific operating point — typically 95°F outdoor, 80°F indoor return DB, 67°F indoor return WB. EER is more useful for predicting performance at design conditions; SEER is more useful for estimating annual energy use. The ratio between them depends on equipment: single-stage AC has SEER/EER ratio ~1.3 (the seasonal average is meaningfully better than the design-day rating); variable-capacity equipment has SEER/EER ratio closer to 1.5-1.7 because the part-load efficiency advantage compounds across the season. Both numbers belong on equipment data sheets; for tonnage decisions use SEER, for design-day capacity verification use EER.",
  },
  {
    q: "Is a heat pump worth it in cold climates?",
    a: "Increasingly yes. Cold-climate heat pump (CCHP) technology has improved substantially through the 2020s. Modern variable-capacity inverter heat pumps maintain meaningful capacity at 0°F to -15°F outdoor temperatures — what NEEP (Northeast Energy Efficiency Partnerships) certifies as 'cold-climate heat pump' status requires sustained performance at +5°F to -15°F. ROI vs gas furnace depends on: (1) electricity price vs gas price in your region — heat pump favored where electricity is under $0.15/kWh and gas is above $1.20/therm, (2) climate severity — colder climates with shorter heat-pump-only operation favor hybrid (heat pump + gas furnace switchover), (3) home envelope quality — tighter homes have lower peak heating loads making heat pumps adequate, (4) IRA tax credits + utility rebates — 30% federal credit up to $2,000 for ENERGY STAR cold-climate heat pumps under IRA 25C dramatically improves payback. For typical 2026 conditions in IECC Zones 4-5, a properly-sized variable-capacity cold-climate heat pump pays back in 7-12 years vs continuing gas furnace; in Zones 6-7 hybrid systems (heat pump for moderate cold, gas furnace below balance point) are often optimal.",
  },
  {
    q: "Why is my new high-SEER equipment not saving as much as advertised?",
    a: "Four common reasons. (1) Oversizing: a 16 SEER unit oversized by 25% short-cycles and operates at well below its rated SEER (rated efficiency assumes typical part-load operation; oversizing pushes equipment to constant-on or constant-off cycles that miss the seasonal-average sweet spot). (2) Bad ductwork: ducts leaking 25% of airflow into unconditioned attic, or undersized returns starving the blower, lose 15-35% of net delivered efficiency. Equipment SEER assumes 0.50 in.w.c. external static (SEER2 standard) with sealed ducts — actual conditions can be 2× higher. (3) Wrong refrigerant charge: undercharged systems lose 15-20% capacity; even small undercharge (10% low) cuts efficiency 5-8%. Recharge to nameplate weight + line-set adjustment. (4) Dirty coils, dirty filter: build up of dirt on indoor and outdoor coils raises pressures and degrades efficiency 8-15%. Schedule annual maintenance. Together these four factors easily account for 30-50% efficiency loss from nameplate. Manual J + Manual S + Manual D + commissioning + maintenance recover most of the gap.",
  },
  {
    q: "What's the IRA 25C tax credit and how much can I claim?",
    a: "The Inflation Reduction Act of 2022 (effective 2023, extended through 2032 per IRC 25C) provides a 30% federal income tax credit for qualifying residential energy efficiency improvements. For HVAC specifically: heat pumps qualify up to $2,000 credit (30% of cost capped at $2,000); central AC up to $600 credit; gas furnaces qualify up to $600 (must meet specific ENERGY STAR criteria — 97% AFUE or higher in most cases). Annual cap is $3,200 total across all 25C-eligible improvements including insulation, windows, etc., with the heat pump $2,000 being separate from the $1,200 cap on other improvements. To claim: keep manufacturer certification statement showing model meets criteria; complete IRS Form 5695 with your return. HEEHRA (High-Efficiency Electric Home Rebate Program) and HOMES Rebate Program are point-of-sale rebates administered by states; up to $8,000 for heat pumps for income-qualified households, $14,000 total across electrification. Implementation timing varies by state — check energystar.gov/about/federal_tax_credits for current state-by-state availability. For high-cost equipment, the IRA credit changes the financial math substantially.",
  },
  {
    q: "What does AFUE mean for gas furnaces?",
    a: "Annual Fuel Utilization Efficiency — the fraction of fuel input that becomes useful heat in the conditioned space, averaged across a heating season. Tested per 10 CFR Part 430 Subpart B Appendix N. AFUE 80 means 80% of fuel energy becomes useful heat, 20% is lost (mostly through the flue). The two main classes: (1) Standard-efficiency (80% AFUE): atmospheric-vent gas furnaces; require a chimney vent. Cost less to install; less expensive equipment. (2) High-efficiency (90-98% AFUE): condensing furnaces that recover heat from flue gas water vapor; require PVC venting and condensate drain; cost $1,500-3,000 more than standard but save 10-18% on gas bills depending on climate. The DOE Final Rule in late 2023 required all newly-manufactured non-weatherized gas furnaces to meet 95% AFUE minimum starting December 18, 2028 — effectively phasing out 80% AFUE furnaces for residential. IRA 25C tax credit for furnaces requires 97% AFUE or higher.",
  },
  {
    q: "How does duct loss affect my actual SEER?",
    a: "Substantially. AHRI 210/240 tests assume sealed ductwork at 0.50 in.w.c. external static. Actual residential duct systems frequently have: (a) 15-25% duct leakage to unconditioned space; (b) undersized returns creating 0.8-1.0 in.w.c. ESP (twice the test assumption); (c) uninsulated or under-insulated ducts in 130-150°F summer attics gaining 10-15% capacity loss. Real-world EER can be 15-35% below rated value as a result. ENERGY STAR's whole-home performance approach addresses this by requiring duct testing and sealing as part of certification. The practical mitigation: locate ducts inside the conditioned envelope when possible, seal to IECC 2021 R403.3.5 standard (≤4 CFM25 per 100 ft² conditioned floor area), insulate to at least R-8 supply / R-6 return when in unconditioned space. See our duct design guide for the methodology. Without these fixes, paying for 18+ SEER equipment on a leaky duct system delivers performance closer to a properly-installed 14 SEER unit.",
  },
  {
    q: "Should I get a variable-capacity / inverter heat pump or single-stage?",
    a: "Variable-capacity equipment delivers part-load efficiency that single-stage cannot match. The seasonal energy savings advantage typically pays back the $1,500-3,000 price premium in 5-10 years depending on usage. Three specific reasons variable-capacity excels: (1) Part-load efficiency: most cooling/heating hours are at 30-70% of peak load. Single-stage equipment running at peak capacity during mild conditions is fundamentally inefficient; variable-capacity modulates down to 25-30% of peak and stays at part-load for hours. (2) Humidity control: longer run times at lower capacity remove more latent heat per BTU of sensible cooling, producing dramatically better dehumidification. (3) Comfort: gentle continuous operation vs aggressive on-off cycles. Variable-capacity is essentially required for cold-climate heat pumps (Zones 5+) because it maintains capacity through wide temperature swings without aux-heat strip dependency. Recommended for: hot/humid climates (latent control), variable-occupancy homes (high part-load fraction), heat pump applications in any climate, anyone planning to stay in the home 7+ years. Not necessary for: simple single-stage gas furnace + AC in mild climates with short cooling season.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Energy Efficiency Guide — SEER2, HSPF2, AFUE Explained + Heat Pump vs Furnace Economics",
      description:
        "Complete HVAC efficiency guide covering SEER2/HSPF2/AFUE metrics, the 2023 DOE metric transition, climate-dependent heat pump performance, real-world vs rated efficiency, variable-capacity benefits, IRA tax credits, utility rebate programs, ENERGY STAR criteria.",
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
        { "@type": "Thing", name: "SEER and SEER2 efficiency ratings" },
        { "@type": "Thing", name: "Heat pump efficiency" },
        { "@type": "Thing", name: "Gas furnace AFUE" },
        { "@type": "Thing", name: "IRA Inflation Reduction Act tax credits" },
        { "@type": "Thing", name: "ENERGY STAR HVAC criteria" },
      ],
      keywords: [
        "hvac energy efficiency",
        "seer2 explained",
        "hspf2 vs hspf",
        "afue gas furnace",
        "heat pump vs furnace",
        "ira heat pump tax credit",
        "cold climate heat pump",
        "energy star hvac",
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
        { "@type": "ListItem", position: 3, name: "HVAC Energy Efficiency Guide" },
      ],
    },
  ];
}

export default function HvacEnergyEfficiencyGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Energy Efficiency Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Energy Efficiency Guide — SEER2, HSPF2, AFUE Explained + Heat Pump vs Furnace Economics + IRA Tax Credits
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A primary-source guide to HVAC efficiency: the four ratings (SEER2, HSPF2, AFUE, UEF) and what each one means, the 2023 DOE metric transition from SEER to SEER2, instantaneous metrics (EER, COP) vs seasonal averages, climate-dependent heat pump performance, the real-world vs nameplate gap (the &quot;duct loss multiplier&quot;), variable-capacity vs single-stage tradeoffs, system sizing and maintenance impact on actual efficiency, ENERGY STAR criteria, IRA 25C tax credits, HEEHRA + HOMES point-of-sale rebates, and the heat pump vs gas furnace decision framework by climate. Sourced throughout from 10 CFR Part 430 (DOE federal appliance efficiency standards), AHRI Standards 210/240 + 1380, IRS Code 25C, ENERGY STAR program criteria, and IECC 2021.
          </p>
        </header>

        {/* SECTION 01 — Why efficiency matters now */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why HVAC efficiency matters now (more than it used to)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Three converging shifts have made HVAC efficiency the most consequential financial decision in residential mechanical work over the equipment&apos;s 15-20 year service life. First: DOE&apos;s 2023 SEER2/HSPF2 transition raised minimum equipment efficiency standards. Second: the Inflation Reduction Act&apos;s 25C tax credits and HEEHRA/HOMES rebates change the upfront cost math substantially — a $7,000 cold-climate heat pump installation can become $4,500 net after IRA credits, comparable to a high-efficiency gas furnace + AC replacement. Third: electricity and natural gas price dynamics through 2024-2026 have shifted the heat-pump vs gas-furnace economics in heat pumps&apos; favor across more US climate zones.
          </p>

          <KeyInsight tone="blue" title="What's actually at stake">
            HVAC accounts for 40-50% of typical residential energy bills. The difference between a properly-sized 16 SEER2 / 9.0 HSPF2 heat pump installed on tight, sealed ductwork and a poorly-sized 14 SEER2 unit on leaky ductwork can be 30-50% in annual energy cost — $800-1,500/year for a typical 2,000 sq ft home. Compounded over 15 years, that&apos;s $12,000-22,500 in lifetime energy difference. Equipment efficiency, sizing, ductwork, and maintenance all compound: getting any one wrong cuts the realized benefit substantially.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            This guide explains what each efficiency metric measures, what the recent SEER2/HSPF2 transition changed, where the gap between rated and actual performance comes from, and how to evaluate heat pump vs gas furnace economics for your specific climate and electricity/gas prices. Every claim is sourced to federal regulations, AHRI test standards, or DOE/EPA technical documents.
          </p>
        </section>

        {/* SECTION 02 — Four ratings */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            The four core HVAC efficiency ratings explained
          </h2>

          <ComparisonTable
            headers={["Metric", "What it measures", "Equipment type", "Test standard"]}
            rows={[
              { label: "SEER2", cells: ["Seasonal Energy Efficiency Ratio (2023+ test method)", "Central AC + heat pump cooling mode", "AHRI 210/240 (2023 update); 10 CFR Part 430 Subpart B Appendix M1.1"] },
              { label: "HSPF2", cells: ["Heating Seasonal Performance Factor (2023+ test method)", "Heat pump heating mode", "AHRI 210/240 (2023 update); 10 CFR Part 430"] },
              { label: "EER / EER2", cells: ["Instantaneous Energy Efficiency Ratio at 95°F outdoor", "AC + heat pump cooling design-point", "AHRI 210/240"] },
              { label: "COP", cells: ["Coefficient of Performance — heating output ÷ electrical input", "Heat pump heating at specified outdoor T", "AHRI 210/240; ASHRAE Standard 116"] },
              { label: "AFUE", cells: ["Annual Fuel Utilization Efficiency", "Gas + oil furnaces", "10 CFR Part 430 Subpart B Appendix N; ANSI/ASHRAE 103"] },
              { label: "UEF", cells: ["Uniform Energy Factor — successor to EF for water heaters", "Storage + tankless water heaters", "10 CFR Part 430 Subpart B Appendix E"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For HVAC equipment specifically, the three you&apos;ll see most often: <strong>SEER2</strong> on AC and heat pump cooling-mode data sheets, <strong>HSPF2</strong> on heat pump heating-mode data sheets (a single heat pump shows both — SEER2 + HSPF2), and <strong>AFUE</strong> on furnace data sheets. Each is a single number, but each measures a substantially different thing — confusing them produces wrong financial decisions.
          </p>

          <FixCallout>
            <strong>Quick comparison rule:</strong> bigger is better for all of them. SEER2 14.3 is the post-2023 minimum for central AC south of the 36th parallel; 18+ is high-efficiency. HSPF2 7.5 is current minimum; 9.0+ is high-efficiency cold-climate. AFUE 80% is the legacy minimum; 95-98% is high-efficiency condensing. UEF 0.81+ is ENERGY STAR for water heaters.
          </FixCallout>
        </section>

        {/* SECTION 03 — SEER vs SEER2 */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            SEER vs SEER2 — the 2023 DOE metric transition
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            DOE&apos;s January 1, 2023 Final Rule on Central Air Conditioner and Heat Pump Energy Conservation Standards (codified at 10 CFR Part 430) updated the test method to better reflect real-world performance. The key change: AHRI Standard 210/240 (2023 update) raised the External Static Pressure (ESP) assumption used in efficiency testing from 0.10 in.w.c. to 0.50 in.w.c. — a more realistic load representing actual ducted-system pressure drop. The result: SEER2 values are typically 4-5% lower than the SEER they replaced for the same equipment.
          </p>

          <ComparisonTable
            headers={["Region", "Equipment type", "Pre-2023 SEER minimum", "2023+ SEER2 minimum", "Approximate equivalent"]}
            rows={[
              { label: "Northern US (north of 36th parallel)", cells: ["Split AC", "14 SEER", "13.4 SEER2", "Equivalent to old 14 SEER"] },
              { label: "Northern US", cells: ["Split heat pump", "14 SEER / 8.8 HSPF", "14.3 SEER2 / 7.5 HSPF2", "Slight increase in heating standard"] },
              { label: "Southeastern US (south of 36th parallel except SW)", cells: ["Split AC", "14 SEER", "14.3 SEER2", "Equivalent to old 15 SEER"] },
              { label: "Southwestern US (AZ, NV, NM, CA, parts of TX)", cells: ["Split AC", "14 SEER + 12.2 EER", "14.3 SEER2 + 11.7 EER2", "Maintains regional design-day requirement"] },
              { label: "All regions", cells: ["Packaged AC", "14 SEER", "13.4 SEER2", "Roughly equivalent at the regional standard"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Practical implication for shopping:</strong> when comparing equipment manufactured before 2023 (with SEER ratings) to equipment manufactured after January 2023 (with SEER2 ratings), multiply old SEER × 0.95 to estimate the SEER2 equivalent. A 16 SEER unit becomes approximately 15.2 SEER2; an 18 SEER unit becomes approximately 17.1 SEER2. The DOE published exact conversion factors for individual equipment classes; the 5% rule is a useful first approximation.
          </p>

          <KeyInsight tone="amber" title="Why DOE changed the test method">
            The old 0.10 in.w.c. ESP test assumption was unrealistically low — actual ducted systems run 0.40-0.80 in.w.c. ESP at design CFM. Equipment that tested well at 0.10 ESP often underperformed in real ducted installations because the higher actual ESP cut blower CFM and degraded efficiency. The 0.50 ESP test more accurately captures real installation conditions, producing SEER2 numbers that better predict actual annual energy use. ENERGY STAR criteria and the IRA tax credit eligibility tiers were both restated in SEER2 terms after 2023.
          </KeyInsight>
        </section>

        {/* SECTION 04 — HSPF2 */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            HSPF vs HSPF2 — heat pump heating mode
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HSPF (Heating Seasonal Performance Factor) is the heating-mode counterpart to SEER. It measures total heating output across a representative cold season divided by total electrical input, in BTU per Wh. The 2023 transition updated to HSPF2 with the same 0.50 in.w.c. ESP test assumption — same direction, same magnitude of reduction (typically 4-5% lower number for the same equipment).
          </p>

          <ComparisonTable
            headers={["HSPF2", "Equivalent old HSPF", "Class"]}
            rows={[
              { label: "7.5 HSPF2 (post-2023 minimum)", cells: ["7.7-8.0 HSPF", "Federal minimum for split heat pumps"] },
              { label: "8.0 HSPF2", cells: ["8.2-8.5 HSPF", "Standard high-efficiency"] },
              { label: "8.5 HSPF2", cells: ["8.7-9.0 HSPF", "Above-standard efficiency"] },
              { label: "9.0+ HSPF2", cells: ["9.2+ HSPF", "Cold-climate heat pump / NEEP certified"] },
              { label: "10.0+ HSPF2", cells: ["10.5+ HSPF", "Variable-capacity inverter heat pump"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Interpretation: a heat pump with HSPF2 8.0 produces 8.0 BTU of heating for every 1 Wh of electrical input across the rated heating season. To compare with electric resistance heat (COP = 1.0 = 3.412 BTU/Wh by definition): HSPF2 8.0 is 2.3× more efficient than electric resistance. To compare with gas furnace heat: the comparison depends on electricity vs gas price per usable BTU.
          </p>
        </section>

        {/* SECTION 05 — AFUE */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            AFUE for gas + oil furnaces
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Annual Fuel Utilization Efficiency measures the fraction of fuel energy that becomes useful heat in the conditioned space, averaged across a heating season. Tested per 10 CFR Part 430 Subpart B Appendix N. AFUE 80% means 80% of fuel energy becomes useful heat, 20% is lost to flue gas, chimney standby losses, and pilot light.
          </p>

          <ComparisonTable
            headers={["AFUE class", "Range", "Construction type", "Typical installed cost premium"]}
            rows={[
              { label: "Standard efficiency", cells: ["80-83%", "Atmospheric vent; chimney required", "Baseline"] },
              { label: "Mid-efficiency", cells: ["85-89%", "Power-vented; PVC sidewall vent", "+$300-700"] },
              { label: "High-efficiency (condensing)", cells: ["90-94%", "Condensing; PVC venting + drain", "+$1,500-2,500"] },
              { label: "Premium high-efficiency", cells: ["95-97%", "Condensing + ECM blower + modulating gas valve", "+$2,500-3,500"] },
              { label: "Premium condensing", cells: ["98-98.7%", "Modulating + variable-speed + premium materials", "+$3,000-4,500"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            DOE&apos;s 2023 Final Rule established a 95% AFUE minimum for non-weatherized gas furnaces (the common residential type) effective December 18, 2028. The rulemaking effectively phases out the 80% AFUE atmospheric-vent furnace from new residential installation; existing units can remain in service indefinitely. For IRA 25C tax credit qualification, gas furnaces must meet 97% AFUE or higher (a higher bar than DOE&apos;s minimum), which limits credit eligibility to top-tier condensing equipment.
          </p>

          <FixCallout>
            <strong>The AFUE arithmetic of going condensing:</strong> moving from 80% to 95% AFUE saves 16% on gas use (since you&apos;re recovering more energy per cubic foot of fuel). On a typical $1,200/yr gas bill, that&apos;s $190/yr savings. The $1,500-2,500 cost premium pays back in 7-13 years. With IRA 25C&apos;s 30% credit (up to $600 for furnaces, requires 97% AFUE), the payback compresses to 4-9 years. For homes planning to stay 10+ years, condensing is almost always the right choice; the math gets stronger every year as gas prices rise.
          </FixCallout>
        </section>

        {/* SECTION 06 — EER and COP */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            EER and COP — the instantaneous metrics
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            SEER2 and HSPF2 are seasonal averages. For specific-condition analysis you need instantaneous efficiency: EER (Energy Efficiency Ratio) for cooling, COP (Coefficient of Performance) for heating.
          </p>

          <pre className="my-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">{`EER = Cooling capacity (BTU/hr) / Electrical input (W)
    at AHRI standard 95°F outdoor / 80°F indoor DB / 67°F indoor WB

COP = Heating output (Watts equivalent) / Electrical input (Watts)
    Dimensionless; COP 3.0 = 3 BTU heating per BTU electrical input
    Equivalent EER ≈ COP × 3.412

For heat pumps in cooling:
SEER2 ≈ EER × 1.2-1.4 (single-stage)
SEER2 ≈ EER × 1.4-1.7 (variable-capacity inverter)`}</pre>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>When to use EER vs SEER2:</strong> for sizing decisions at design conditions (will this equipment have enough capacity at 95°F outdoor?), use EER. For annual energy estimation (how much electricity will this equipment use over a year?), use SEER2. Most equipment data sheets publish both; if only one is given, the other can be approximated by the SEER2/EER ratio for the equipment class.
          </p>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>COP-vs-temperature curve:</strong> heat pump COP drops as outdoor temperature falls — at 47°F the COP might be 3.5-4.0; at 17°F it drops to 2.5-3.0; at -5°F it falls to 1.8-2.5 (and conventional heat pumps below cut-out temperature switch to electric resistance with COP = 1.0). Cold-climate heat pumps maintain COP &gt;2.0 down to -15°F or lower. AHRI Standard 1380 (2019) provides standardized test methods for variable-capacity heat pumps that capture this curve properly; data sheets for ENERGY STAR-certified cold-climate heat pumps publish the full temperature-vs-COP relationship.
          </p>
        </section>

        {/* SECTION 07 — Climate-dependent */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Climate-dependent heat pump performance
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Heat pump performance varies dramatically with outdoor temperature. Two metrics matter beyond HSPF2 average: capacity at low outdoor temperatures (does it produce enough BTU/hr?) and COP at low outdoor temperatures (is it more efficient than electric resistance?).
          </p>

          <ComparisonTable
            headers={["Outdoor temp", "Typical SS heat pump capacity", "Typical CCHP capacity", "Typical CCHP COP"]}
            rows={[
              { label: "47°F (AHRI 'A' point)", cells: ["100%", "100%", "3.5-4.5"] },
              { label: "35°F", cells: ["75-85%", "90-100%", "3.0-3.8"] },
              { label: "17°F (AHRI low-T point)", cells: ["50-60%", "75-90%", "2.3-3.0"] },
              { label: "5°F", cells: ["35-45% (often aux heat required)", "65-80%", "1.8-2.5"] },
              { label: "-5°F", cells: ["0-20% (aux heat dominant)", "55-70%", "1.5-2.2"] },
              { label: "-15°F", cells: ["0% (heat pump locked out)", "45-60%", "1.2-1.8 (still better than COP 1.0 electric)"] },
              { label: "-25°F", cells: ["0%", "0-30% (some CCHPs continue)", "1.0-1.5"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Data ranges from NEEP (Northeast Energy Efficiency Partnerships) cold-climate heat pump specification and AHRI Standard 1380 test data. CCHP = Cold-Climate Heat Pump (NEEP-certified). Standard single-stage (SS) heat pumps have lockout temperatures typically 0-10°F; below that the system runs on auxiliary electric resistance with COP = 1.0.
          </p>

          <KeyInsight tone="blue" title="The cold-climate heat pump revolution">
            Through the 2010s, heat pumps below the &quot;balance point&quot; (typically 25-35°F for legacy single-stage equipment) had unacceptable capacity and efficiency; gas furnace + AC was the standard solution. Inverter-driven variable-capacity heat pumps developed in the 2020s maintain useful capacity and efficiency far lower — NEEP-certified cold-climate equipment maintains operation through -15°F and below. As of 2026, electrification of heating in Zones 5-7 with a single cold-climate heat pump (no gas backup) has become technically viable and increasingly economical, particularly with IRA tax credits making the upfront cost competitive. For Zone 7+ and remote/utility-cost-sensitive locations, hybrid systems (heat pump + gas furnace switching at balance point) remain optimal.
          </KeyInsight>
        </section>

        {/* SECTION 08 — Real-world gap */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            The real-world vs nameplate gap — and how to close it
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Rated SEER2 / HSPF2 / AFUE numbers assume installation conditions that are uncommon in real homes. The gap between rated and actual efficiency is typically 15-40% — for a 16 SEER2 unit, actual performance can be closer to 11-14 SEER2 if multiple installation problems compound.
          </p>

          <ComparisonTable
            headers={["Problem", "Typical efficiency loss", "Fix"]}
            rows={[
              { label: "Oversized equipment", cells: ["10-20% (short-cycling)", "Manual J load calculation + Manual S equipment selection"] },
              { label: "Undersized return ducts", cells: ["10-25%", "Manual D return sizing at 0.05 in.w.c./100ft friction"] },
              { label: "Leaky ductwork (>10% leakage)", cells: ["10-25%", "IECC R403.3.5 sealing to ≤4 CFM25/100 ft²"] },
              { label: "Ducts in unconditioned attic, under-insulated", cells: ["10-20%", "IECC R-8 supply / R-6 return minimum; consider conditioned attic"] },
              { label: "Wrong refrigerant charge (>5% off)", cells: ["5-15%", "Recharge to nameplate weight + line-set adjustment"] },
              { label: "Dirty condenser coil", cells: ["8-15%", "Annual maintenance + cleaning"] },
              { label: "Dirty / clogged filter", cells: ["5-10%", "Filter replacement on schedule"] },
              { label: "Old / dirty evaporator coil", cells: ["5-15%", "Annual maintenance + cleaning"] },
              { label: "Aux heat strips activating during normal heat pump operation", cells: ["20-40% in heating", "Thermostat configuration + correct balance point"] },
              { label: "TOTAL realistic gap", cells: ["15-40% depending on installation", "Manual J + S + D + commissioning + maintenance recovers most"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The compound effect:</strong> these losses multiply rather than add. A system with three concurrent problems (oversized + leaky ducts + dirty coil) can lose 30-45% of rated efficiency. The practical implication: paying a premium for high-SEER2 equipment without addressing installation quality and maintenance is wasted money. Manual J sizing + Manual D ductwork + commissioning + annual maintenance combined recover most of the gap and deliver close to the equipment&apos;s rated efficiency.
          </p>
        </section>

        {/* SECTION 09 — Heat pump vs furnace economics */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Heat pump vs gas furnace — the economic decision framework
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The heat pump vs gas furnace decision turns on five variables:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Electricity price per kWh in your area.</strong> Under $0.13/kWh strongly favors heat pump; $0.13-0.18 is competitive; above $0.18 favors gas in cold climates.</li>
            <li><strong>Natural gas price per therm.</strong> Under $1.00 strongly favors gas; $1.00-1.50 is competitive; above $1.50 favors heat pump.</li>
            <li><strong>Climate zone severity.</strong> Zones 1-4: heat pump wins by big margin. Zones 5-6: heat pump wins with cold-climate equipment, hybrid system optimal. Zones 7-8: hybrid required; sometimes gas-dominant.</li>
            <li><strong>Equipment efficiency.</strong> 9 HSPF2 cold-climate heat pump vs 95% AFUE condensing furnace is the closest fair comparison. Lower-efficiency tiers shift the math.</li>
            <li><strong>IRA tax credits + utility rebates.</strong> 30% credit up to $2,000 on cold-climate heat pumps under IRA 25C; state HEEHRA rebates up to $8,000 for income-qualified households. These can shift breakeven dramatically.</li>
          </ol>

          <ComparisonTable
            headers={["Climate zone", "Heat pump-only viable?", "Hybrid recommendation", "Pure gas furnace"]}
            rows={[
              { label: "Zone 1 (Miami, Honolulu)", cells: ["Strongly recommended", "Unnecessary", "Wasteful — no winter load to justify"] },
              { label: "Zone 2 (Houston, Phoenix)", cells: ["Strongly recommended", "Unnecessary in 2A; consider in 2B desert nights", "Acceptable if gas is very cheap"] },
              { label: "Zone 3 (Atlanta, Dallas)", cells: ["Recommended", "Optional with CCHP", "Loses on electricity prices"] },
              { label: "Zone 4 (DC, NYC, St. Louis)", cells: ["Recommended with CCHP", "Optimal in many cases", "Competitive with low gas prices"] },
              { label: "Zone 5 (Chicago, Boston)", cells: ["Viable with NEEP CCHP", "Strongly recommended", "Still competitive — depends on prices"] },
              { label: "Zone 6 (Minneapolis)", cells: ["Marginal — Mitsubishi Hyper Heat and similar work", "Strongly recommended", "Often optimal until prices shift"] },
              { label: "Zone 7 (Duluth)", cells: ["Very marginal", "Best available choice", "Often optimal"] },
              { label: "Zone 8 (Fairbanks)", cells: ["Not viable as primary heat", "CCHP for shoulder + gas/oil for deep cold", "Often only choice"] },
            ]}
          />

          <FixCallout>
            <strong>The decision framework in one sentence:</strong> in IECC Zones 1-5, a properly-sized cold-climate heat pump with high HSPF2 (9.0+) and IRA tax credit applied is typically the most economical choice over 15-year service life; in Zones 6-7, hybrid systems (heat pump + gas furnace switching at balance point) typically win; in Zone 8 and remote/off-grid applications, dual-fuel or pure fossil-fuel heating remains optimal. Calculate your specific case with current local electricity and gas prices, factoring in IRA + utility rebates available in your state.
          </FixCallout>
        </section>

        {/* SECTION 10 — Variable-capacity */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Variable-capacity vs single-stage — the part-load advantage
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Single-stage equipment runs at one capacity (100% on or 0% off). Two-stage equipment runs at 100% or 65-70%. Variable-capacity inverter equipment modulates continuously from 25-30% to 100%. The efficiency consequences are substantial because most cooling and heating hours are at part-load, not peak.
          </p>

          <ComparisonTable
            headers={["Equipment type", "Cooling capacity range", "Typical SEER2 range", "Typical SEER2/EER ratio"]}
            rows={[
              { label: "Single-stage (legacy)", cells: ["100% only", "13.4-15.5 SEER2", "1.2-1.3"] },
              { label: "Two-stage", cells: ["65-100%", "15.5-18.0 SEER2", "1.35-1.45"] },
              { label: "Variable-capacity inverter", cells: ["25-100% continuous", "17.0-26+ SEER2", "1.45-1.70"] },
              { label: "Ductless mini-split (variable)", cells: ["20-100% continuous", "20-30+ SEER2", "1.50-1.80"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Why variable-capacity wins on part-load:</strong> at 50% load, a single-stage 16 SEER2 unit runs at full capacity for half the time and idle for half — efficiency penalty from frequent on-off cycling reduces effective efficiency to ~13-14 SEER2. A variable-capacity unit modulates to 50% capacity continuously, running at near-optimal efficiency point throughout. The advantage compounds across hundreds of hours of part-load operation.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Other variable-capacity advantages:</strong> better humidity control (longer run times at lower capacity remove more latent heat per BTU sensible), quieter operation (lower fan speeds at part load), gentler temperature control (no aggressive cycling), and dramatically reduced electrical demand peaks. Cold-climate heat pump applications essentially require variable-capacity because it maintains useful capacity across a wide temperature range without auxiliary heat dependence.
          </p>
        </section>

        {/* SECTION 11 — Sizing impact */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            System sizing impact on actual efficiency
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Equipment efficiency ratings assume operation near the design point. Oversizing pushes equipment into short-cycle operation that misses the SEER2/HSPF2 sweet spot. ACCA Manual S codifies the sizing window for this reason — see our <Link href="/hvac-load-calculation-guide/" className="underline">load calculation guide</Link> for the Manual J + S sequence.
          </p>

          <ComparisonTable
            headers={["Sizing", "Single-stage SEER2 hit", "Variable-capacity SEER2 hit", "Notes"]}
            rows={[
              { label: "Right-sized (100% of Manual J)", cells: ["100% of rated", "100% of rated", "Target"] },
              { label: "115% of Manual J (Manual S window)", cells: ["95% of rated", "98% of rated", "Acceptable; ACCA-approved"] },
              { label: "125% oversized", cells: ["85% of rated", "92% of rated", "Single-stage loses meaningfully; VC tolerates"] },
              { label: "150% oversized", cells: ["70% of rated", "85% of rated", "Single-stage short-cycles; humidity problems"] },
              { label: "200% oversized (rule-of-thumb sizing)", cells: ["55% of rated", "75% of rated", "Both lose; comfort suffers; bills don't go down with higher SEER"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The practical implication:</strong> paying for high-SEER2 equipment that&apos;s oversized destroys most of the efficiency premium. The first dollar of efficiency investment should go to right-sizing (Manual J + S); only after that does upgrading to higher SEER2 deliver proportional benefit. A correctly-sized 16 SEER2 unit on Manual D ductwork outperforms an oversized 20 SEER2 unit by 10-15% in annual energy use, despite the lower nominal rating.
          </p>
        </section>

        {/* SECTION 12 — Maintenance */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Maintenance impact on actual efficiency
          </h2>

          <ComparisonTable
            headers={["Maintenance issue", "Annual efficiency loss", "Recovery procedure"]}
            rows={[
              { label: "Dirty condenser coil (outdoor)", cells: ["8-15%", "Garden hose + coil cleaner; annual schedule"] },
              { label: "Dirty evaporator coil (indoor)", cells: ["5-15%", "Professional cleaning; biannual on heavy use"] },
              { label: "Clogged air filter", cells: ["5-10%", "Replace per manufacturer schedule (1-3 months for typical MERV 8)"] },
              { label: "Wrong refrigerant charge (>5% off)", cells: ["5-15%", "Verify with superheat + subcooling; recharge to nameplate weight"] },
              { label: "Failed run capacitor (still operating)", cells: ["10-20%", "Replace with measured µF matching nameplate"] },
              { label: "Aging compressor (10+ years)", cells: ["10-20% over service life", "Plan replacement near end of expected lifespan"] },
              { label: "Refrigerant slow leak (3-6 month decline)", cells: ["10-20% cumulative", "Leak detection + repair + recharge"] },
              { label: "Cumulative untreated", cells: ["20-35%", "Annual maintenance schedule recovers most"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Maintenance ROI:</strong> a $200-300/year maintenance contract that recovers 15-25% of degraded efficiency on a system with $1,500/year cooling+heating cost pays for itself many times over. The compound effect of skipped maintenance across 15 years is substantial — many failed compressors and coil leaks would have been prevented by basic annual service. See our <Link href="/hvac-troubleshooting-guide/" className="underline">HVAC troubleshooting guide</Link> for diagnostic decision trees that identify these problems early.
          </p>
        </section>

        {/* SECTION 13 — ENERGY STAR */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            ENERGY STAR criteria for HVAC equipment
          </h2>

          <ComparisonTable
            headers={["Equipment type", "ENERGY STAR criterion (2026)", "DOE minimum"]}
            rows={[
              { label: "Central AC (split, Southeast)", cells: ["15.2 SEER2 / 12.0 EER2", "14.3 SEER2"] },
              { label: "Central AC (split, North)", cells: ["15.2 SEER2 / 12.0 EER2", "13.4 SEER2"] },
              { label: "Heat pump (standard)", cells: ["15.2 SEER2 / 8.1 HSPF2 / 12.0 EER2", "14.3 SEER2 / 7.5 HSPF2"] },
              { label: "Cold-climate heat pump (split)", cells: ["15.2 SEER2 / 9.0 HSPF2 + 1.75 COP at 5°F", "14.3 SEER2 / 7.5 HSPF2"] },
              { label: "Gas furnace", cells: ["97% AFUE (non-weatherized)", "95% AFUE effective 12/18/2028"] },
              { label: "Ductless mini-split", cells: ["20.0 SEER2 / 12.5 EER2 / 9.5 HSPF2", "Same DOE minimums"] },
              { label: "Air-to-water heat pump (hydronic)", cells: ["8.0 HSPF2 + specific COP at design", "Separate DOE standard category"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: ENERGY STAR Program Requirements for Central Air Conditioners and Heat Pumps; specific criteria updated annually. Check energystar.gov for current values. ENERGY STAR criteria typically exceed DOE federal minimum by 10-15% on the efficiency dimension, and ENERGY STAR certification is required for IRA 25C tax credit eligibility on most equipment types.
          </p>
        </section>

        {/* SECTION 14 — IRA credits */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            IRA tax credits + utility rebates
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The Inflation Reduction Act of 2022 (effective 2023, programs extended through 2032) created substantial federal incentives for residential energy efficiency upgrades. Three programs apply to HVAC:
          </p>

          <ComparisonTable
            headers={["Program", "Benefit", "Eligibility", "How to claim"]}
            rows={[
              { label: "IRC 25C — Energy Efficient Home Improvement Credit", cells: ["30% credit up to $2,000 (heat pump); up to $600 (AC, furnace)", "ENERGY STAR equipment; annual limits", "IRS Form 5695 with annual tax return"] },
              { label: "IRC 25D — Residential Clean Energy Credit", cells: ["30% credit for renewable + GSHP installations", "Geothermal heat pumps qualify; air-source do not under 25D", "IRS Form 5695"] },
              { label: "HEEHRA (High-Efficiency Electric Home Rebate)", cells: ["Up to $8,000 (heat pump) for income-qualified households; $14,000 total program", "Up to 80% AMI (full benefit); 80-150% AMI (50% benefit)", "Point-of-sale rebate; state-administered; check state energy office"] },
              { label: "HOMES Rebate Program", cells: ["$2,000-8,000 based on energy savings achieved", "Whole-home energy modeling required", "State-administered; performance-based"] },
              { label: "State utility rebates", cells: ["$100-1,500 varies widely by utility", "Equipment efficiency tier specific", "Utility website or contractor coordination"] },
            ]}
          />

          <FixCallout>
            <strong>How the credits stack:</strong> IRA 25C federal tax credit + HEEHRA state rebate + utility rebate can stack for income-qualified households, dramatically reducing net cost. Example: a $9,000 cold-climate heat pump installation could become $2,500 net after stacking $2,000 (25C) + $4,000 (HEEHRA) + $500 (utility rebate). Implementation timing varies by state — HEEHRA was funded through state agencies in 2024-2025; some states launched 2024, others delayed to 2026-2027. Check your state energy office and energystar.gov for current availability.
          </FixCallout>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The financial planning point:</strong> for any homeowner considering HVAC equipment replacement in 2026-2032, the IRA credits change the financial math substantially. Cold-climate heat pumps that would have been marginal investments without credits become clear winners with credits applied. Whole-home electrification with heat pump + heat pump water heater + induction range + EV charging now has federal financial support that makes the lifetime ROI positive in most US climates.
          </p>
        </section>

        {/* SECTION 15 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">15</span>
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

        {/* SECTION 16 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">16</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>Federal efficiency standards:</strong> 10 CFR Part 430 Subpart B Appendix M1.1 (SEER2 test method for central AC + heat pumps, effective 2023). 10 CFR Part 430 Subpart B Appendix N (AFUE for furnaces). 10 CFR Part 430 Subpart B Appendix E (UEF for water heaters). DOE Final Rule on Central Air Conditioner and Heat Pump Energy Conservation Standards (effective January 2023). DOE Final Rule on Residential Furnace Energy Conservation Standards (95% AFUE minimum effective December 2028).
            </p>
            <p className="mt-3">
              <strong>Industry test standards:</strong> AHRI Standard 210/240 (2023 update — Performance Rating of Unitary Air-Conditioning &amp; Air-Source Heat Pump Equipment). AHRI Standard 1380 (2019 — Test Method for Performance Rating of Variable-Capacity Heat Pumps). AHRI Standard 1230 (Variable Refrigerant Flow Multi-Split). AHRI Standard 880 (Air Terminals). ANSI/ASHRAE Standard 103 (gas furnace testing). ASHRAE Standard 116 (heat pump testing).
            </p>
            <p className="mt-3">
              <strong>Tax credits + rebates:</strong> Internal Revenue Code Section 25C (Energy Efficient Home Improvement Credit). IRC Section 25D (Residential Clean Energy Credit). Inflation Reduction Act of 2022 (Public Law 117-169). HEEHRA (High-Efficiency Electric Home Rebate Program) administered by state energy offices under DOE oversight. HOMES Rebate Program (Home Energy Performance-Based, Whole-House) administered by state energy offices. IRS Form 5695 (Residential Energy Credits) instructions for claim procedure.
            </p>
            <p className="mt-3">
              <strong>ENERGY STAR program:</strong> ENERGY STAR Program Requirements for Central Air Conditioners and Heat Pumps (Version 6.1 + subsequent updates). ENERGY STAR Cold Climate Heat Pump Specification. ENERGY STAR Most Efficient annual list. NEEP Cold Climate Heat Pump Product List (neep.org).
            </p>
            <p className="mt-3">
              <strong>Building codes + standards:</strong> International Energy Conservation Code (IECC) 2021, especially Section R403 (HVAC efficiency and duct requirements). ASHRAE Standard 90.1 (commercial) and 90.2 (residential). California Title 24 (state-specific compliance with efficiency requirements above federal minimums).
            </p>
            <p className="mt-3">
              <strong>Research + technical references:</strong> National Renewable Energy Laboratory (NREL) heat pump performance studies. Oak Ridge National Laboratory (ORNL) heat pump research. Pacific Northwest National Laboratory (PNNL) building energy codes research. DOE Building America Solution Center. DOE Better Buildings program technical resources. DOE Building Energy Codes Program (BECP) IECC adoption tracking.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> specific equipment recommendations (depends on your climate, envelope, load, and budget — use our <Link href="/hvac-load-calculator/" className="underline">load calculator</Link> for sizing and consult a Manual S professional for equipment selection). Specific electricity/gas pricing (varies by region; use your most recent utility bills). State-specific tax credit / rebate availability (varies; check state energy office and ENERGY STAR website). Investment advice on payback period (do your own math with local prices). For accurate financial modeling consult a Building Performance Institute (BPI) certified analyst or HERS rater.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related tools and references</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> HVAC Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Right-size equipment per Manual J — the foundation of realized efficiency.</p>
            </Link>
            <Link href="/hvac-load-calculation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Load Calculation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J explainer including Manual S equipment sizing window for efficiency.</p>
            </Link>
            <Link href="/hvac-duct-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Duct Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Bad ducts kill efficiency — Manual D + IECC sealing requirements.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic decision trees for efficiency-degrading problems.</p>
            </Link>
            <Link href="/refrigerant-gwp-rankings/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Snowflake className="h-4 w-4 text-blue-600" /> Refrigerant GWP Rankings</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">AIM Act 700 GWP threshold drives the A2L transition that affects efficiency.</p>
            </Link>
            <Link href="/refrigerant-prices-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4 text-blue-600" /> Refrigerant Prices Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Refrigerant supply economics affect future maintenance costs.</p>
            </Link>
            <Link href="/hvac-ductless-mini-split-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Snowflake className="h-4 w-4 text-blue-600" /> Ductless Mini-Split Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cold-climate mini-split deep dive — Hyper-Heat, LV Series, BHP capability.</p>
            </Link>
            <Link href="/hvac-retrofitting-upgrades-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Retrofitting & Upgrades Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Heat pump conversion + A2L transition + IRA tax credit framework.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Sun, TrendingUp, Zap, ListChecks, FileCheck, Lookups, Panel, ServiceProblem, VerdictBanner];
