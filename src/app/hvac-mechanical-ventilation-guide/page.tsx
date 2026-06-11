import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Wind, Droplet, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Filter, Thermometer, Gauge, Snowflake, Sun } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-mechanical-ventilation-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Mechanical Ventilation Guide — ASHRAE 62.2 Sizing, ERV vs HRV, Climate Strategy, Installation",
  description:
    "Complete residential mechanical ventilation guide: ASHRAE Standard 62.2 detailed sizing calculation, the 4 ventilation strategy types (exhaust-only, supply-only, balanced, balanced with heat/energy recovery), ERV vs HRV technology deep-dive, heat-exchanger types (fixed-plate, rotary, polymer membrane), local exhaust for kitchens and bathrooms, make-up air for high-CFM range hoods, ductwork integration with central HVAC, climate-zone strategy, commissioning + balancing, maintenance schedule, IECC + IRC requirements, IRA tax credit eligibility, and ROI analysis. Sourced from ASHRAE Standards 62.2 + 84, AHRI Standard 1060, HVI Certification Program, IRC 2021 M1505, IECC 2021 R403.6.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Mechanical Ventilation Guide — ASHRAE 62.2 + ERV vs HRV + Climate Strategy",
    description: "ASHRAE 62.2 detailed sizing, ERV/HRV selection, ductwork integration, commissioning. Companion to the IAQ guide.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Mechanical Ventilation Guide — ASHRAE 62.2 + ERV/HRV",
    description: "Complete residential ventilation methodology with primary sourcing.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the difference between ERV and HRV?",
    a: "Both ERVs (Energy Recovery Ventilators) and HRVs (Heat Recovery Ventilators) transfer heat between incoming outdoor air and outgoing exhaust air, recovering 60-85% of the heating/cooling energy that would otherwise be lost to ventilation. The difference: HRVs transfer only SENSIBLE heat (temperature); ERVs transfer BOTH sensible heat AND LATENT energy (moisture). In summer cooling: ERVs reduce both incoming heat and humidity, lowering AC load substantially. In winter heating: ERVs retain indoor humidity (preventing the very dry air that pure HRVs allow) while still recovering heat. The catch: ERVs that transfer moisture in both directions can also transfer pollutants if the exchanger media is permeable to specific contaminants — high-quality polymer membrane exchangers are highly selective (water vapor permeable, pollutants restricted). HRV recommended for: very cold climates with low outdoor humidity (Zones 6-8) where moisture transfer in winter would over-humidify; homes with high indoor moisture loads (lots of bathing, cooking, plants). ERV recommended for: hot/humid climates (Zones 1-4A) where summer latent recovery is large savings; cold/dry climates where winter humidity retention is valuable. Most US residential favors ERV.",
  },
  {
    q: "How do I calculate the required ventilation rate for my home?",
    a: "Per ASHRAE Standard 62.2-2022: total continuous ventilation rate (CFM) = (0.03 × conditioned floor area in ft²) + (7.5 × number of bedrooms + 1). For a 2,000 ft² home with 3 bedrooms: 0.03 × 2,000 + 7.5 × 4 = 60 + 30 = 90 CFM continuous. ASHRAE 62.2 also specifies local exhaust requirements: kitchen 100 CFM intermittent OR 25 CFM continuous; bathrooms 50 CFM intermittent OR 20 CFM continuous each. The total ventilation rate is met by some combination of: natural infiltration credit (per 62.2 calculation based on home tightness and climate), local exhaust running continuously, and dedicated mechanical ventilation system. The simplification: design the mechanical ventilation system to deliver the full 62.2 rate; treat any natural infiltration as a bonus rather than a credit. This produces a robust ventilation strategy that doesn't depend on the home being as leaky as assumed.",
  },
  {
    q: "Do I need a make-up air system for my range hood?",
    a: "Depends on the range hood's CFM and your home's tightness. IRC 2021 Section M1503.4 requires make-up air for any range hood exhaust rated 400 CFM or higher; some local jurisdictions lower the threshold to 300 CFM. The mechanism: high-CFM range hoods create substantial negative pressure indoors when running. In tight construction (≤3 ACH50), the negative pressure can pull combustion byproducts back down the gas water heater or furnace flue (backdrafting), creating CO hazards. Make-up air systems provide a controlled outdoor air pathway to neutralize the negative pressure when the hood runs. Two strategies: (1) Passive make-up air — a damper opens automatically when the range hood activates, allowing outdoor air in (cheapest but introduces unconditioned air); (2) Active make-up air — a fan supplies tempered outdoor air through a HVAC integration (more expensive but maintains comfort). Critical for any home with gas water heater + gas furnace + atmospherically-vented combustion appliances near the range hood. Discuss with the HVAC contractor at install.",
  },
  {
    q: "Can my existing HVAC system handle adding mechanical ventilation?",
    a: "Yes, with planning. Three integration patterns: (1) STANDALONE: dedicated ERV/HRV with its own ductwork and fans, completely independent of HVAC. Best for retrofits where central HVAC ductwork can't be easily modified. (2) PARALLEL: ERV/HRV ductwork run in parallel with HVAC; supply air dumps into supply trunks; exhaust air pulled from exhaust grilles in baths. Requires HVAC and ventilation to coordinate. (3) INTEGRATED: ERV/HRV outdoor-air duct supplies into HVAC return plenum; HVAC blower handles distribution. Simpler ductwork but requires HVAC blower to run continuously (or at least when ventilation runs). For new construction, integrated is usually most efficient. For retrofit, standalone is often easiest. Manufacturers (Panasonic, Broan, Lifebreath, Renewaire, Greenheck, Fantech) publish installation guides for each integration pattern. Capacity considerations: typical residential ERV/HRV is 100-300 CFM continuous, well within most residential HVAC system airflow capacity.",
  },
  {
    q: "Does ERV/HRV save enough energy to pay for itself?",
    a: "Depends on climate severity and ventilation hours. Math example: 2,000 ft² home in Zone 5 (Boston) running 90 CFM continuous ventilation (per ASHRAE 62.2). Without ERV, that 90 CFM × 7,200 cooling degree-days/year × 1.08 BTU/hr/CFM/°F × 0.000293 kWh/BTU = significant cooling+heating load. With 75% effective ERV, recover ~75% of that energy. For typical Zone 5 climate the energy savings are typically $150-400/year. ERV equipment + install cost typically $1,500-4,000 ($2,500 average residential). Simple payback: 6-15 years, dropping faster with rising energy prices. IRA 25C tax credit (covered as part of heat pump category in some installations) can apply if the ERV is part of a qualifying heat pump installation. For mild climates (Zones 1-2 dry) the ERV math is weaker — minimal latent and modest sensible recovery, longer payback. For severe climates (Zones 5-7) ERV math is strongest. Beyond direct savings: ERV preserves IAQ in tight construction where natural infiltration is inadequate, which has health and comfort value beyond direct dollars.",
  },
  {
    q: "What's the difference between a balanced and exhaust-only ventilation system?",
    a: "EXHAUST-ONLY (the cheapest 62.2-compliant option): a continuously-running fan (often a bathroom exhaust on a low-speed timer) pulls air out of the home; outdoor air infiltrates passively through whatever leakage paths exist to replace it. Cost: $50-200 to retrofit. Cons: negative indoor pressure pulls outdoor air through random locations including foundation (radon), soil contamination, attic, walls (insulation off-gassing). Not recommended for tight construction or radon-zone homes. BALANCED VENTILATION: equal supply and exhaust airflow, maintained by a fan delivering outdoor air and a matched fan removing indoor air. No net pressure change indoors. Cost: $300-1,000 for basic balanced; $1,500-4,000 for ERV/HRV. Pros: controlled supply air entry (from a designated location, filtered before entry); no random infiltration paths; preserves envelope integrity. Recommended for: any tight construction (post-2010 typical), radon-zone homes, homes with attached garages, IAQ-conscious households. ASHRAE 62.2 permits both strategies; ENERGY STAR Single-Family New Homes requires balanced for higher tier certifications.",
  },
  {
    q: "How loud is a residential ERV/HRV?",
    a: "Typical residential ERV/HRV operates at 30-45 dBA at the indoor head unit when running at design CFM — quieter than typical bathroom exhaust fan (which is 45-65 dBA), about the level of light rainfall. The fan is the only noise source; the heat exchanger itself is silent. ERV/HRV manufacturer data sheets publish sound power values; the better units operate below 1.0 sone at the indoor diffuser. For comparison: HVAC blowers typically produce 45-55 dBA at supply registers. ERV is usually quieter than HVAC. Considerations: locate the ERV/HRV away from bedrooms or living spaces where noise is unwelcome (attic, mechanical room, garage). Acoustic-rated duct between equipment and indoor diffusers reduces noise transmission. For occupants who notice equipment noise, ASHRAE 62.2 allows lower CFM intermittent operation as long as effective CFM (averaged across the day) meets the rate.",
  },
  {
    q: "What maintenance does an ERV/HRV need?",
    a: "Modest but specific. (1) FILTERS: typically a coarse pre-filter on the outdoor supply side (every 3-6 months) and sometimes a higher-MERV filter on the indoor exhaust side (every 6-12 months). Manufacturer data sheets specify. Skipping filter changes leads to coil/exchanger fouling. (2) HEAT EXCHANGER: annual visual inspection; clean with vacuum or mild detergent every 1-3 years depending on use. Polymer membrane exchangers should not be saturated with cleaners — follow manufacturer instructions. (3) CONDENSATE DRAIN (ERV models with condensate provision): check drain operation seasonally. (4) FAN MOTORS: typically maintenance-free for 10-15 years; replace at end of service life. (5) CONTROLS: verify thermostat or controller programming annually. Total annual maintenance time: 30-60 minutes for typical residential. Maintenance cost (if professional): $100-200/year if added to regular HVAC contract.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Mechanical Ventilation Guide — ASHRAE 62.2 Sizing, ERV vs HRV, Climate Strategy, Installation",
      description:
        "Complete residential mechanical ventilation methodology: ASHRAE 62.2 detailed sizing, ERV vs HRV technology, heat-exchanger types, local exhaust, make-up air, ductwork integration, climate-zone strategy, commissioning, maintenance, code requirements, ROI math.",
      proficiencyLevel: "Intermediate to Advanced",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "ASHRAE 62.2 mechanical ventilation" },
        { "@type": "Thing", name: "Energy Recovery Ventilator (ERV)" },
        { "@type": "Thing", name: "Heat Recovery Ventilator (HRV)" },
        { "@type": "Thing", name: "Residential ventilation systems" },
        { "@type": "Thing", name: "Balanced ventilation" },
      ],
      keywords: [
        "mechanical ventilation",
        "ashrae 62.2",
        "erv vs hrv",
        "residential ventilation",
        "balanced ventilation",
        "energy recovery ventilator",
        "heat recovery ventilator",
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
        { "@type": "ListItem", position: 3, name: "HVAC Mechanical Ventilation Guide" },
      ],
    },
  ];
}

export default function HvacMechanicalVentilationGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Mechanical Ventilation Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Mechanical Ventilation Guide — ASHRAE 62.2 Sizing, ERV vs HRV, Climate Strategy, Installation
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            The deep companion to our <Link href="/hvac-indoor-air-quality-guide/" className="underline">IAQ guide</Link> — covering the ventilation pillar in detail. This guide walks through ASHRAE Standard 62.2 sizing calculations, the four ventilation strategy types (exhaust-only, supply-only, balanced, balanced with heat/energy recovery), ERV vs HRV technology selection by climate, heat exchanger types and their tradeoffs, local exhaust requirements for kitchens and bathrooms, make-up air strategies for high-CFM range hoods, ductwork integration patterns with central HVAC, climate-zone strategy recommendations, commissioning + balancing procedure, maintenance schedule, IECC and IRC code requirements, IRA tax credit eligibility, and ROI analysis. Sourced throughout from ASHRAE Standards 62.2 + 84, AHRI Standard 1060, HVI (Home Ventilating Institute) Certification Program, IRC 2021 Section M1505, IECC 2021 R403.6, and ENERGY STAR Single-Family New Homes Program v3.2.
          </p>
        </header>

        {/* SECTION 01 — Why mechanical ventilation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why mechanical ventilation is required in modern construction
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Pre-2000 US homes were leaky enough that natural infiltration (air leakage driven by wind and temperature differences) typically provided 0.5-1.0 air changes per hour (ACH) naturally — more than enough to dilute typical indoor pollutants without explicit mechanical ventilation. Energy code improvements (IECC 2009 onward) and high-performance construction (Passive House) dramatically reduced envelope leakage to 0.10-0.25 ACH natural. The same construction that saves 30-50% on heating and cooling bills also eliminates the natural ventilation path that previously kept IAQ acceptable.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Natural infiltration rate by construction era — ACH at natural conditions"
              orientation="vertical"
              data={[
                { label: "Pre-1980", value: 1.0, sub: "ACHnat", color: "#10b981" },
                { label: "1980-2000", value: 0.6, sub: "ACHnat", color: "#3b82f6" },
                { label: "2000-2015", value: 0.3, sub: "ACHnat", color: "#f59e0b" },
                { label: "2015+ (IECC)", value: 0.2, sub: "ACHnat", color: "#ef4444" },
                { label: "Passive House", value: 0.05, sub: "ACHnat", color: "#dc2626", emphasis: true },
              ]}
              axisLabel="Natural infiltration (ACH)"
              caption="Tight construction eliminates natural ventilation. Pre-1980 homes were leaky enough (~1.0 ACHnat) for natural IAQ; 2015+ IECC code reduces leakage 5×; Passive House 20×. Mechanical ventilation per ASHRAE 62.2 is now mandatory to maintain IAQ at modern envelope tightness."
            />
          </div>

          <KeyInsight tone="blue" title="The IAQ-vs-envelope tradeoff">
            Tight construction provides better thermal performance but worse natural IAQ. The resolution is mechanical ventilation: deliberately bring in outdoor air through a controlled location (usually filtered, possibly conditioned via ERV/HRV) rather than relying on uncontrolled infiltration. This combination — tight envelope + mechanical ventilation — provides better thermal performance AND better IAQ than leaky construction. ASHRAE 62.2 codifies the minimum mechanical ventilation rates required to compensate for the loss of natural infiltration. IRC 2021 Section M1505 references 62.2 in adopting jurisdictions.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Without mechanical ventilation in tight construction, indoor CO₂ regularly exceeds 1,500-2,000 ppm during occupied hours (CDC and ASHRAE recommend &lt;1,000 ppm); indoor VOCs accumulate from construction materials, furnishings, and household products; indoor humidity becomes problematic (too high in summer, too low in winter); and biological contamination grows in unmonitored zones. The cost of not ventilating: documented IAQ-related health effects (asthma exacerbation, respiratory inflammation, sleep quality, cognitive performance) plus elevated material aging from chronic humidity issues.
          </p>
        </section>

        {/* SECTION 02 — ASHRAE 62.2 sizing */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            ASHRAE 62.2 sizing — the formula and worked examples
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ANSI/ASHRAE Standard 62.2-2022 specifies the residential ventilation rate via a simple formula:
          </p>

          <pre className="my-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">{`Required mechanical ventilation (CFM) =
    (0.03 × conditioned floor area in ft²)
    + (7.5 × (number of bedrooms + 1))

The +1 accounts for one additional default occupant
beyond the bedroom count.`}</pre>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Worked examples</strong> for typical residential sizes:
          </p>

          <ComparisonTable
            headers={["Home", "Floor area", "Bedrooms", "Default occupancy", "ASHRAE 62.2 CFM"]}
            rows={[
              { label: "1-bedroom condo", cells: ["800 ft²", "1", "2", "39 CFM"] },
              { label: "2-bedroom townhouse", cells: ["1,200 ft²", "2", "3", "59 CFM"] },
              { label: "3-bedroom single-family", cells: ["1,800 ft²", "3", "4", "84 CFM"] },
              { label: "4-bedroom single-family", cells: ["2,500 ft²", "4", "5", "113 CFM"] },
              { label: "5-bedroom large home", cells: ["3,500 ft²", "5", "6", "150 CFM"] },
              { label: "Custom 6-bedroom estate", cells: ["5,000 ft²", "6", "7", "203 CFM"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Local exhaust requirements</strong> (separate from the total CFM above): kitchen 100 CFM intermittent OR 25 CFM continuous; each bathroom 50 CFM intermittent OR 20 CFM continuous; clothes dryers exhaust to outdoors per IRC M1502. Local exhaust runs only when needed (cooking, showering); the total ventilation rate runs continuously to dilute baseline indoor sources.
          </p>

          <KeyInsight tone="amber" title="The 'infiltration credit' option">
            ASHRAE 62.2 permits crediting natural infiltration toward the total ventilation rate based on home tightness and climate zone. For tight construction (3 ACH50 or less per IECC R402.4.1.2), the credit is small or zero. For leakier existing homes, infiltration may provide much of the required ventilation, reducing the mechanical fan requirement. The simplified approach: design the mechanical ventilation system to deliver the FULL 62.2 rate, treating any natural infiltration as a bonus. This produces a robust system that doesn&apos;t depend on the home being as leaky as assumed at design time.
          </KeyInsight>
        </section>

        {/* SECTION 03 — Four strategy types */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            The four ventilation strategy types
          </h2>

          <TechSection icon="insight" tone="blue" title="Strategy 1 — Exhaust-only">
            A continuously-running fan pulls air out of the home; outdoor air infiltrates passively through whatever leakage paths exist. Often implemented as a bathroom exhaust fan on a continuous low-speed timer. <strong>Pros:</strong> cheapest 62.2-compliant option ($50-200 retrofit); uses existing equipment; no additional ductwork. <strong>Cons:</strong> creates negative indoor pressure, pulling outdoor air through random locations (foundation, soil, attic, walls); not recommended for tight construction or radon-zone homes. Suitable for: existing-home retrofits with limited budget; moderate-tightness construction; non-radon-zone homes.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Strategy 2 — Supply-only">
            A dedicated supply fan pulls outdoor air through a filter into the home; exhaust occurs passively through bathroom fans (when in use) and envelope leakage. <strong>Pros:</strong> outdoor air enters through a controlled, filtered path; positive indoor pressure keeps soil gas and pollutants from infiltrating through envelope. <strong>Cons:</strong> positive pressure can drive moist indoor air into wall cavities in winter (potential moisture damage in cold climates); higher equipment cost than exhaust-only ($300-1,000). Suitable for: warm/humid climates where winter moisture-in-wall concerns are minimal; radon-zone homes (positive pressure suppresses radon).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Strategy 3 — Balanced (without heat recovery)">
            Equal supply and exhaust airflow via two dedicated fans, maintaining neutral indoor pressure. <strong>Pros:</strong> controlled supply air entry; controlled exhaust location; no envelope-driven pressure issues; predictable performance. <strong>Cons:</strong> no energy recovery — full ventilation load passes to HVAC; higher cost than single-fan strategies ($1,000-2,500). Suitable for: moderate climates where ventilation energy load is small; budget-conscious tight construction retrofits.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Strategy 4 — Balanced with heat/energy recovery (ERV or HRV)">
            Balanced supply and exhaust with a heat exchanger transferring 60-85% of energy from exhaust air to incoming outdoor air. <strong>Pros:</strong> recovers most ventilation energy; controlled supply + exhaust; preserved indoor humidity (ERV); reduces HVAC sizing requirement; ENERGY STAR + Passive House standard. <strong>Cons:</strong> highest equipment cost ($1,500-4,000 installed); requires periodic maintenance; ductwork integration planning. Suitable for: most modern residential new construction; tight retrofits; severe-climate installations (Zones 4-8); any household seeking ENERGY STAR or HERS certification.
          </TechSection>

          <ComparisonTable
            headers={["Strategy", "Equipment cost", "Operating cost", "Indoor pressure", "Recommended for"]}
            rows={[
              { label: "Exhaust-only", cells: ["$50-200", "$5-20/year fan power", "Negative", "Non-radon-zone existing homes; tight budget"] },
              { label: "Supply-only", cells: ["$300-1,000", "$10-30/year fan power", "Positive", "Warm/humid climates; radon-zone homes"] },
              { label: "Balanced (no recovery)", cells: ["$1,000-2,500", "$20-50/year fan power", "Neutral", "Moderate climates; tight retrofits on a budget"] },
              { label: "Balanced ERV/HRV", cells: ["$1,500-4,000", "$30-60/year fan power, but saves $150-400/year ventilation conditioning", "Neutral", "Most modern new construction; severe climates"] },
            ]}
          />
        </section>

        {/* SECTION 04 — ERV vs HRV */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            ERV vs HRV — technology deep dive
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ERV (Energy Recovery Ventilator) and HRV (Heat Recovery Ventilator) both transfer energy between incoming and outgoing air streams via a heat exchanger. The fundamental difference: HRVs transfer ONLY sensible heat (temperature); ERVs transfer BOTH sensible heat AND latent energy (moisture).
          </p>

          <ComparisonTable
            headers={["Characteristic", "HRV", "ERV"]}
            rows={[
              { label: "Sensible recovery efficiency", cells: ["70-85% typical", "65-80% typical"] },
              { label: "Latent (moisture) recovery", cells: ["~0% (no moisture transfer)", "60-75% typical"] },
              { label: "Summer cooling benefit", cells: ["Reduces incoming heat only", "Reduces incoming heat AND humidity"] },
              { label: "Winter heating benefit", cells: ["Reduces heat loss; outdoor air entry dries indoor air", "Reduces heat loss AND preserves indoor humidity"] },
              { label: "Pollutant cross-transfer risk", cells: ["Very low (sealed metal/plastic exchanger)", "Low-moderate (membrane permits water + some gases)"] },
              { label: "Cost premium vs HRV", cells: ["Baseline", "+15-30% typical"] },
              { label: "Optimal climate", cells: ["Very cold + low outdoor humidity (Zones 6-8)", "Hot/humid OR cold/dry climates with humidity preservation goals"] },
              { label: "Equipment manufacturers", cells: ["Lifebreath, Greentek, Renewaire (model overlap with ERV)", "Panasonic, Broan, Renewaire, Greenheck, many"] },
            ]}
          />

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="ERV vs HRV recovery efficiency — typical models"
              orientation="horizontal"
              data={[
                { label: "HRV — Sensible recovery", value: 75, sub: "% efficient", color: "#3b82f6" },
                { label: "HRV — Latent recovery", value: 0, sub: "no moisture transfer", color: "#71717a" },
                { label: "ERV — Sensible recovery", value: 70, sub: "% efficient", color: "#10b981" },
                { label: "ERV — Latent recovery", value: 55, sub: "% (Zones 2-5)", color: "#10b981", emphasis: true },
                { label: "ERV — Latent recovery (cold)", value: 40, sub: "% (Zone 6+)", color: "#f59e0b" },
              ]}
              caption="ERVs (energy recovery ventilators) transfer both sensible heat AND latent moisture between airstreams; HRVs (heat recovery ventilators) only transfer sensible. ERVs win in cooling-dominant + humid climates; HRVs win in very cold climates where moisture transfer would over-humidify in winter."
            />
          </div>

          <KeyInsight tone="blue" title="Climate-zone selection rule">
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><strong>Zones 1-3 (hot/humid):</strong> ERV strongly recommended — summer latent recovery is substantial savings; humidity preservation in winter is small concern.</li>
              <li><strong>Zone 4 (mixed/humid):</strong> ERV typically optimal; some installations choose HRV if natural humidity is high year-round.</li>
              <li><strong>Zone 5 (cool/humid):</strong> ERV typically optimal; balanced summer + winter performance.</li>
              <li><strong>Zone 6 (cold):</strong> ERV with care — verify the chosen ERV operates correctly at low outdoor temperatures (no frost on the exchanger).</li>
              <li><strong>Zones 7-8 (very cold + subarctic):</strong> HRV often optimal — very dry outdoor winter air would over-humidify indoors through ERV moisture transfer; HRV recovers heat without moisture issue.</li>
            </ul>
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Performance is tested per AHRI Standard 1060 (Performance Rating of Air-to-Air Heat Exchangers for Energy Recovery Ventilation) and ASHRAE Standard 84 (Method of Testing Air-to-Air Heat/Energy Exchangers). HVI (Home Ventilating Institute) certifies equipment performance and publishes a directory of certified models at hvi.org.
          </p>
        </section>

        {/* SECTION 05 — Heat exchanger types */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Heat exchanger types and their tradeoffs
          </h2>

          <ComparisonTable
            headers={["Exchanger type", "Sensible efficiency", "Latent transfer", "Pros", "Cons"]}
            rows={[
              { label: "Fixed-plate aluminum (HRV)", cells: ["70-85%", "0% (HRV only)", "Cheapest; durable; no maintenance", "No moisture transfer; can frost in very cold weather"] },
              { label: "Fixed-plate polymer membrane (ERV)", cells: ["65-80%", "60-75%", "Excellent moisture transfer; no moving parts; durable", "Higher cost than aluminum; replacement cost if degraded"] },
              { label: "Rotary enthalpy wheel (ERV)", cells: ["75-85%", "65-80%", "Highest combined efficiency; large equipment scaling", "Moving parts (motor + bearings); larger physical footprint"] },
              { label: "Counterflow polymer membrane (ERV)", cells: ["70-85%", "60-75%", "High efficiency in compact size; quiet", "More expensive than crossflow; limited model availability"] },
              { label: "Heat pipe (HRV-style)", cells: ["50-70%", "0%", "No moving parts; works passively", "Limited efficiency; rarely used in residential"] },
              { label: "Run-around coil (HRV-style)", cells: ["40-65%", "0%", "Allows physically separate supply + exhaust", "Pump required; complex; rare in residential"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For typical residential, fixed-plate polymer membrane ERV is the most common choice — compact, no moving parts in the exchanger (the only motors are the two fans), good combined efficiency, and reasonable cost. Rotary enthalpy wheels are common in commercial; rare in residential except for high-end Passive House installations. Counterflow polymer membrane is increasingly available for premium residential where compact size matters.
          </p>
        </section>

        {/* SECTION 06 — Local exhaust */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Local exhaust — kitchen + bathroom requirements
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ASHRAE 62.2 requires LOCAL exhaust in kitchens and bathrooms beyond the whole-home ventilation rate. These zones produce substantial moisture and pollutants (cooking creates PM2.5 + NO₂ + grease + water vapor; bathing creates large moisture pulses) that need point-of-source removal.
          </p>

          <ComparisonTable
            headers={["Space", "ASHRAE 62.2 requirement", "Typical implementation"]}
            rows={[
              { label: "Kitchen", cells: ["100 CFM intermittent (vented hood) OR 25 CFM continuous", "Range hood vented outside; some homes add 25 CFM continuous exhaust as bypass"] },
              { label: "Bathroom (each)", cells: ["50 CFM intermittent OR 20 CFM continuous", "Bathroom exhaust fan with humidity sensor or timer"] },
              { label: "Laundry/utility", cells: ["Not explicitly required by 62.2 (dryer venting per IRC M1502)", "Dryer venting to outside; optional exhaust fan"] },
              { label: "Garage", cells: ["Not part of conditioned space (separate exhaust per local code)", "Garage exhaust per local building code"] },
            ]}
          />

          <FixCallout>
            <strong>The recirculating range hood problem:</strong> some range hoods recirculate filtered air back into the kitchen rather than venting outside. These do NOT count toward 62.2 local exhaust because they don&apos;t remove cooking pollutants from the home (only filter visible smoke). Range hoods must be VENTED TO OUTSIDE per ASHRAE 62.2 to count as local exhaust. Replace recirculating hoods with vented hoods during kitchen remodels; verify the duct termination is at the exterior wall or roof, not in an attic.
          </FixCallout>
        </section>

        {/* SECTION 07 — Make-up air */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Make-up air for high-CFM range hoods
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            High-CFM range hoods (400+ CFM, increasingly common for high-end residential and professional-style ranges) create substantial negative pressure indoors when running. In tight construction, this negative pressure can:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>Pull combustion gases back down atmospheric-vent appliance flues (gas water heater, gas furnace, fireplace), creating CO poisoning risk</li>
            <li>Pull soil gas (radon) up through foundation cracks at higher rates</li>
            <li>Pull outdoor air through doors and windows in directions that defeat door seals (whistling)</li>
            <li>Reduce other exhaust fan effectiveness (bathroom fans can&apos;t move air against the negative pressure)</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            IRC 2021 Section M1503.4 requires make-up air for any range hood exhaust rated 400 CFM or higher; some jurisdictions lower to 300 CFM. Make-up air options:
          </p>

          <ComparisonTable
            headers={["Make-up air strategy", "How it works", "Cost", "Notes"]}
            rows={[
              { label: "Passive damper-only", cells: ["Damper opens automatically when hood runs; outdoor air pulled in passively", "$50-200", "Cheapest; introduces unconditioned outdoor air"] },
              { label: "Passive with HVAC return integration", cells: ["Make-up air enters HVAC return; partially conditioned before reaching kitchen", "$200-500", "Better comfort than damper-only; reduced cold draft"] },
              { label: "Active tempered make-up air", cells: ["Dedicated fan + heater (electric resistance) tempers outdoor air before introducing", "$500-2,000", "Best comfort; highest cost; uses energy"] },
              { label: "Active integrated with HVAC", cells: ["Make-up air ducted to HVAC supply; HVAC blower conditions before delivery", "$1,000-3,000", "Most sophisticated; requires HVAC integration design"] },
            ]}
          />

          <FixCallout>
            <strong>Critical for homes with atmospheric-vent gas equipment:</strong> if you have a gas water heater, gas furnace, or fireplace that vents via natural draft (no power vent or condensing design), make-up air is essential to prevent backdrafting when the range hood runs. Many newer homes have power-vented or condensing equipment (sealed combustion, doesn&apos;t backdraft); these are less dependent on make-up air. Have your contractor verify the venting type before specifying make-up air.
          </FixCallout>
        </section>

        {/* SECTION 08 — Ductwork integration */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Ductwork integration with central HVAC
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ERV/HRV systems need three duct connections: outdoor air supply, indoor exhaust pickup, indoor fresh supply distribution. Three common integration patterns:
          </p>

          <TechSection icon="insight" tone="blue" title="Pattern 1 — Fully independent (standalone)">
            ERV/HRV has its own dedicated ductwork running to indoor diffusers (typically bedrooms and living spaces for supply, bathrooms for exhaust). No connection to central HVAC. Pros: simplest design; works independently of HVAC operation. Cons: more ductwork; supply air comes in unconditioned (cool in winter, warm in summer) — though ERV/HRV pre-tempers the outdoor air through the heat exchanger.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pattern 2 — Supply to HVAC return">
            ERV/HRV fresh supply ducted into the central HVAC return plenum. HVAC blower mixes the ventilation air with returns and distributes through central supplies. Exhaust side runs independently to bathroom pickups. Pros: leverages existing HVAC ductwork; outdoor air conditioned with the rest before delivery. Cons: requires HVAC blower to run when ventilation is active (some setups use ECM blowers at low speed continuously).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pattern 3 — Full HVAC integration">
            ERV/HRV supply and exhaust both connected to HVAC ductwork; supply to return plenum, exhaust pulled from supply return paths. Pros: single ductwork system; outdoor air fully conditioned. Cons: requires careful sizing to avoid air-balance issues; more complex commissioning.
          </TechSection>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For most modern residential, Pattern 2 (supply to HVAC return) is the optimal compromise — outdoor air is conditioned by HVAC; ventilation runs reliably regardless of HVAC heating/cooling demand; ductwork complexity is moderate. ERV/HRV manufacturers (Panasonic, Broan, Lifebreath, Renewaire, Greenheck, Fantech, and others) publish detailed installation guides for each integration pattern.
          </p>
        </section>

        {/* SECTION 09 — Climate strategy */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Climate-zone strategy
          </h2>

          <ComparisonTable
            headers={["Climate zone", "Recommended strategy", "Why", "Equipment notes"]}
            rows={[
              { label: "Zone 1 (Miami, Honolulu)", cells: ["ERV strongly recommended", "Summer latent recovery is substantial savings; minimal heating concerns", "Standard ERV; verify A2L refrigerant compatibility for new equipment"] },
              { label: "Zone 2A (Houston, New Orleans)", cells: ["ERV strongly recommended", "Hot/humid; ERV provides substantial latent savings", "ERV with high-efficiency latent transfer (membrane or wheel)"] },
              { label: "Zone 3A (Atlanta, Dallas)", cells: ["ERV typically optimal", "Moderate heating + cooling load; balanced ERV math", "Standard residential ERV"] },
              { label: "Zone 4 (DC, NYC, St. Louis)", cells: ["ERV recommended; balanced budget option also viable", "Both heating and cooling significant; ERV pays back well", "ERV; verify frost-resistance for winter operation"] },
              { label: "Zone 5 (Chicago, Boston)", cells: ["ERV strongly recommended for new; HRV acceptable", "Significant heating load; humidity preservation valuable", "ERV with frost prevention or HRV (compare savings)"] },
              { label: "Zone 6 (Minneapolis)", cells: ["HRV often preferred; ERV viable with frost prevention", "Very cold heating; lower outdoor humidity in winter limits ERV benefit", "HRV with defrost cycle; or ERV with active frost prevention"] },
              { label: "Zones 7-8 (Duluth, Fairbanks)", cells: ["HRV strongly recommended", "Subarctic; very dry outdoor winter air would over-humidify indoors through ERV", "HRV with robust defrost cycle"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Climate strategy is a starting point; specific equipment selection should account for: actual local humidity profile (humid vs dry subzones — 2B Phoenix vs 2A Houston have different needs), expected indoor humidity load (bathing frequency, indoor plants, cooking type), envelope tightness, and budget. For deep performance optimization, consult a Passive House Institute US (PHIUS) certified contractor; for typical residential, work with an HVI-certified equipment installer.
          </p>
        </section>

        {/* SECTION 10 — Commissioning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Commissioning + balancing for mechanical ventilation
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Ventilation commissioning is part of the broader HVAC commissioning process (see our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link>). Ventilation-specific commissioning steps:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Measure outdoor air supply CFM</strong> at the supply diffuser with a balometer (capture hood + anemometer). Should match ASHRAE 62.2 design CFM within ±10%.</li>
            <li><strong>Measure exhaust CFM</strong> at the exhaust pickups (bathroom grilles) similarly. For balanced systems, sum of exhaust should match sum of supply within ±10%.</li>
            <li><strong>Verify balanced operation</strong> using a pressure-differential gauge between indoor and outdoor at the building envelope. Net pressure should be neutral (zero) within typical instrument resolution (±2 Pa).</li>
            <li><strong>Measure local exhaust CFM</strong> at the kitchen range hood and each bathroom fan. Should meet ASHRAE 62.2 local exhaust rates with measurement at fan capacity.</li>
            <li><strong>Verify heat exchanger sensible efficiency</strong> (for ERV/HRV) by measuring supply + return temperatures and using the manufacturer&apos;s efficiency formula. Should be within ±5% of rated efficiency at design conditions.</li>
            <li><strong>Verify ERV latent efficiency</strong> (ERV only) by measuring incoming + outgoing humidity and computing the latent recovery efficiency.</li>
            <li><strong>Verify controls operation</strong> — continuous mode, boost mode (often triggered by humidity sensor), schedule programming, timer behavior.</li>
            <li><strong>Document all measurements</strong> on commissioning sheet; deliver to homeowner.</li>
          </ol>

          <FixCallout>
            <strong>Common ventilation commissioning failure:</strong> supply CFM at the design diffuser is significantly less than the equipment&apos;s rated CFM. Cause: ductwork friction higher than design; multiple supply diffusers competing for the same supply path; or supply ductwork length exceeding manufacturer&apos;s installation envelope. Fix: re-verify ductwork sizing per manufacturer manual; address any obvious restrictions; verify static pressure is within equipment specification at design CFM.
          </FixCallout>
        </section>

        {/* SECTION 11 — Maintenance */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Maintenance for ERV/HRV systems
          </h2>

          <ComparisonTable
            headers={["Maintenance task", "Frequency", "Procedure", "Cost"]}
            rows={[
              { label: "Outdoor supply pre-filter", cells: ["Every 3-6 months", "Inspect; replace or wash per manufacturer", "$10-30 per filter"] },
              { label: "Indoor exhaust filter (if equipped)", cells: ["Every 6-12 months", "Inspect; replace per manufacturer", "$15-40 per filter"] },
              { label: "Heat exchanger inspection + cleaning", cells: ["Annual (visual); deep clean every 1-3 years", "Vacuum or wash per manufacturer; some membranes need specific cleaner", "$0 DIY or $50-150 service"] },
              { label: "Condensate drain (ERV models)", cells: ["Seasonal", "Inspect drain flow; clear blockage if present", "Free DIY"] },
              { label: "Fan motor inspection", cells: ["Annual visual; replace at end of service life", "Listen for unusual sounds; verify smooth operation", "$0 DIY; $300-800 replacement at end of life"] },
              { label: "Controls + thermostat verification", cells: ["Annual", "Verify continuous mode, boost trigger, schedule", "Free DIY"] },
              { label: "Outdoor intake screen", cells: ["Annual", "Clean debris from outdoor intake; check for nesting", "Free DIY"] },
              { label: "Indoor exhaust grille cleaning", cells: ["Annual", "Vacuum bathroom exhaust grilles", "Free DIY"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Total annual ERV/HRV maintenance time: 30-60 minutes DIY for typical residential. Add to regular HVAC service contract for $100-200/year if preferred. Skipping maintenance degrades exchanger efficiency (dirty heat exchanger loses 10-30% efficiency over 2-3 years of neglect), increases fan motor load, and ultimately shortens equipment service life. Properly maintained ERV/HRV typically lasts 20-25 years.
          </p>
        </section>

        {/* SECTION 12 — Cost analysis */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Cost analysis + IRA tax credits
          </h2>

          <ComparisonTable
            headers={["Strategy", "Equipment + install", "Annual operating cost", "Annual savings vs no ventilation", "Net benefit"]}
            rows={[
              { label: "Exhaust-only (existing fan continuous)", cells: ["$50-200", "$5-20", "Marginal — depends on natural infiltration", "Code compliance for tight construction"] },
              { label: "Supply-only", cells: ["$300-1,000", "$15-30", "Modest IAQ improvement", "Suitable for radon-zone homes"] },
              { label: "Balanced (no recovery)", cells: ["$1,000-2,500", "$30-50", "Modest IAQ improvement; neutral pressure", "Balanced operation; no energy recovery"] },
              { label: "ERV (Zone 2-4)", cells: ["$1,500-3,000", "$30-60", "$200-400 (recovered ventilation energy)", "5-10 year simple payback; preserves humidity"] },
              { label: "ERV (Zone 5-6)", cells: ["$2,000-4,000", "$40-70", "$300-500", "6-12 year simple payback; recommended for tight construction"] },
              { label: "HRV (Zone 7-8)", cells: ["$2,000-4,000", "$40-70", "$300-500", "6-12 year simple payback; required for very cold"] },
            ]}
          />

          <FixCallout>
            <strong>IRA tax credit eligibility:</strong> ERV/HRV systems may qualify for IRA 25C tax credit when installed as part of a qualifying heat pump installation (HEEHRA program if income-qualified). Standalone ERV/HRV installation does not currently qualify under IRA 25C, but state-level rebates may apply. ENERGY STAR Single-Family New Homes Program v3.2 references ERV/HRV as a recommended whole-home certification component. Check current IRS Form 5695 instructions and state energy office for specific eligibility.
          </FixCallout>
        </section>

        {/* SECTION 13 — Code requirements */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Code requirements
          </h2>

          <ComparisonTable
            headers={["Code / Standard", "What it requires", "Applies to"]}
            rows={[
              { label: "IRC 2021 Section M1505", cells: ["Mechanical ventilation per ASHRAE 62.2", "All new residential construction in IRC-adopting jurisdictions"] },
              { label: "IRC 2021 Section M1503.4", cells: ["Make-up air for range hoods ≥400 CFM", "New construction; major remodels"] },
              { label: "IRC 2021 Section M1502", cells: ["Dryer duct termination + cleanout", "All residential clothes dryers"] },
              { label: "IECC 2021 Section R403.6", cells: ["Mechanical ventilation fan efficiency limits", "All new residential construction"] },
              { label: "ASHRAE 62.2-2022", cells: ["Total + local ventilation rates; equipment performance", "Referenced by IRC and IECC; required by ENERGY STAR + RESNET"] },
              { label: "ASHRAE 62.1-2022", cells: ["Commercial/institutional ventilation", "Non-residential (covered separately)"] },
              { label: "ENERGY STAR Single-Family v3.2", cells: ["ASHRAE 62.2 compliance + recommended balanced ventilation", "ENERGY STAR certified residential new construction"] },
              { label: "Passive House (PHIUS / PHI)", cells: ["Balanced ventilation with ERV required; higher efficiency standards", "Passive House certified construction"] },
              { label: "California Title 24 Part 6", cells: ["State-specific mechanical ventilation requirements", "California new residential construction"] },
              { label: "AHRI 1060 + ASHRAE 84", cells: ["ERV/HRV performance testing methodology", "Equipment certification (HVI program)"] },
            ]}
          />
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
              <strong>ASHRAE Standards:</strong> ANSI/ASHRAE Standard 62.2-2022, Ventilation and Acceptable Indoor Air Quality in Low-Rise Residential Buildings (primary methodology). ANSI/ASHRAE Standard 62.1-2022 (commercial/institutional ventilation). ANSI/ASHRAE Standard 84-2020, Method of Testing Air-to-Air Heat/Energy Exchangers. ASHRAE Standard 90.1-2022 (commercial energy + ventilation efficiency). ASHRAE Position Document on Air Cleaning and Filtration.
            </p>
            <p className="mt-3">
              <strong>Equipment standards + certification:</strong> AHRI Standard 1060-2018, Performance Rating of Air-to-Air Heat Exchangers for Energy Recovery Ventilation. HVI (Home Ventilating Institute) Certification Program — equipment performance database at hvi.org. UL 1995 + UL 60335-2-80 — Heating and Ventilating Equipment safety standards.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Residential Code (IRC) 2021 — Section M1505 (mechanical ventilation), M1503.4 (range hood make-up air), M1502 (dryer venting), R315 (CO alarms). International Energy Conservation Code (IECC) 2021 — Section R403.6 (mechanical ventilation fan efficiency). California Title 24 Part 6 (state-specific). State and local code amendments per jurisdiction.
            </p>
            <p className="mt-3">
              <strong>Certification programs:</strong> ENERGY STAR Single-Family New Homes Program v3.2 Technical Requirements (Whole-House Verification section includes ventilation). RESNET HERS Standards. Passive House Institute US (PHIUS) certification requirements. Passive House Institute (PHI, Germany) PHPP.
            </p>
            <p className="mt-3">
              <strong>Make-up air + combustion safety:</strong> NFPA 54 National Fuel Gas Code. ANSI Z21.13 (gas-fired hot-water boilers). ANSI Z83.8 (gas-fired duct furnaces). Local jurisdictional requirements for atmospheric-vent appliance protection.
            </p>
            <p className="mt-3">
              <strong>IRA tax credits + rebates:</strong> Internal Revenue Code Section 25C (Energy Efficient Home Improvement Credit) — when ERV/HRV is part of qualifying heat pump installation. HEEHRA (High-Efficiency Electric Home Rebate Program) state-administered. ENERGY STAR Most Efficient ventilation equipment list at energystar.gov.
            </p>
            <p className="mt-3">
              <strong>Research references:</strong> NREL (National Renewable Energy Laboratory) residential ventilation studies. ORNL (Oak Ridge National Laboratory) heat exchanger performance research. LBNL (Lawrence Berkeley National Laboratory) IAQ + ventilation research. NIST + EPA Indoor Air Quality program studies. NEEP (Northeast Energy Efficiency Partnerships) cold-climate ventilation guidance.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific equipment recommendations (consult HVI Certified Products List at hvi.org; consider ENERGY STAR Most Efficient list for current top performers). Specific installation pricing (varies by region, equipment, ductwork complexity — typical residential install $1,500-4,000). Local jurisdiction-specific code requirements (consult local building department). For Passive House certification, work with PHIUS-certified consultant.
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
            <Link href="/hvac-indoor-air-quality-guide/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><Wind className="h-4 w-4" /> IAQ Guide (parent)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pollutant categories + EPA 3-pillar IAQ strategy + filtration + radon + mold.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> HVAC Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Ventilation load is part of Manual J — include in sizing.</p>
            </Link>
            <Link href="/hvac-duct-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Duct Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Ventilation ductwork integration with central HVAC ductwork.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Verify ventilation CFM, balance, and energy recovery at install.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ERV/HRV filter + exchanger maintenance schedule.</p>
            </Link>
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2 + how ERV/HRV recovery reduces HVAC ventilation load.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Droplet, AlertTriangle, ShieldCheck, ListChecks, Filter, Thermometer, Snowflake, Sun, Lookups, Panel, ServiceProblem, VerdictBanner];
