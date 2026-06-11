import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Sun, Snowflake, Home, Users, AlertTriangle, ListChecks, Gauge, Wind, Thermometer, FileCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-load-calculation-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Load Calculation Guide — Manual J Explained, Climate Zones to Equipment Sizing",
  description:
    "Complete guide to Manual J residential load calculation: the 8 load components, block vs room-by-room methods, climate zone design conditions, envelope inputs (U-values, fenestration, infiltration), sensible/latent split, the Manual S equipment-sizing sequence, code requirements, and DIY vs professional decision logic. Sourced from ACCA Manual J 8th edition, ASHRAE Handbook of Fundamentals 2021, IECC 2021, and IRC 2021.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Load Calculation Guide — Manual J Explained Top to Bottom",
    description: "How Manual J residential load calculation works, from climate zones through equipment selection. Cross-references the interactive load calculator.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Load Calculation Guide — Manual J Explained",
    description: "Complete Manual J methodology + climate zones + sizing sequence. Companion to the interactive load calculator.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What is Manual J and why is it the standard for residential HVAC sizing?",
    a: "Manual J is ACCA's (Air Conditioning Contractors of America) residential load calculation standard, currently in its 8th edition (published 2016, codified as ANSI/ACCA 2 Manual J — 2016). It is the referenced load calculation methodology in the IRC (International Residential Code) Section M1401.3 for sizing space-conditioning equipment in one- and two-family dwellings, and is required by code in most US jurisdictions. The 8th edition runs ~600 pages and walks through every input that contributes to heat gain (cooling load) or heat loss (heating load) for a residence — wall, roof, window, door conduction; window solar gain; floor heat transfer; air-infiltration sensible and latent; ventilation; internal gains from people, lighting, equipment; duct gains/losses if ducts are in unconditioned space. The reason it's the standard: it produces a single defensible cooling tonnage and heating BTU/hr that maps directly into Manual S equipment-selection criteria, and the methodology has been validated against measured performance over 35+ years of field application.",
  },
  {
    q: "How is Manual J different from a rule-of-thumb estimate like '500 sq ft per ton'?",
    a: "Rules of thumb apply a single coefficient to floor area without regard to climate, envelope quality, occupancy, or orientation. They were derived from average residential construction practice in the 1960s-1970s and have not been updated for the dramatic envelope improvements since IECC adoption (post-2003) and the deep-energy-retrofit and Passive House movements. Result: rule-of-thumb sizing systematically oversizes modern construction by 25-50%. A 2015+ build at the same floor area as a 1985 home needs roughly 30-40% less cooling capacity because the envelope is dramatically better. Manual J accounts for the envelope, climate, orientation, internal gains, and occupancy explicitly — that's why the calculator above asks for those inputs. The cost of getting it wrong: oversized AC short-cycles and never controls humidity, oversized furnace produces uneven temperatures, oversized everything wastes capital cost and increases energy bills. ACCA Manual S codifies the sizing window: 90-115% of Manual J cooling for single-stage, 115-130% for variable-capacity. Anything outside that window is structurally bad practice.",
  },
  {
    q: "Block load vs room-by-room — which do I need?",
    a: "Block load (also called whole-house load) calculates total cooling and heating BTU/hr for the entire conditioned space as a single zone. Sufficient for sizing the equipment itself (compressor tonnage, furnace input). Room-by-room load calculates the same components separately for each room, producing per-room CFM requirements. Required for sizing ductwork, register/grille selection, branch-takeoff sizing, and balancing (Manual D depends on per-room CFM). Code typically requires block load minimum; room-by-room is required when ducted equipment is being designed or installed. Software like Wrightsoft Right-J does both simultaneously. The calculator on this site is a block load — it gives the equipment size; for ducted distribution you need room-by-room from a full Manual J report.",
  },
  {
    q: "What is the design condition, and where do the climate-zone temperatures come from?",
    a: "Design conditions are the 1% (cooling) and 99% (heating) outdoor dry-bulb temperatures for a specific weather station — meaning the temperature is exceeded only 1% of the hours in a typical year (cooling) or below it 99% of the time (heating). ASHRAE publishes these for ~4,500 weather stations worldwide in the Climatic Design Conditions database (Chapter 14 of the ASHRAE Handbook of Fundamentals). The IECC and ACCA Manual J reference ASHRAE's data. For very cold climates Manual J also references the 0.4% extreme cooling and 99.6% extreme heating values (used when the home will fail catastrophically at design — for example pipe freezing risk). The calculator on this site uses representative 1%/99% values for each IECC climate zone; for tight design work consult ASHRAE Climatic Design Conditions for your specific airport weather station.",
  },
  {
    q: "Do I need a blower-door test to get an accurate Manual J?",
    a: "Strictly per Manual J 8th edition methodology, yes — infiltration should be measured via blower-door pressurization (typically at 50 Pascals) and converted to natural infiltration using the LBL or ASHRAE leakage models. In practice many residential load calculations use the Manual J infiltration tables based on construction era and apparent envelope tightness (the simplified default used by the calculator on this site). The difference matters most in two cases: (1) high-performance tight construction where assumed infiltration substantially overestimates load (the calc oversizes equipment); (2) leaky retrofits where assumed infiltration underestimates actual leakage (the calc undersizes). For a new build with envelope tightness as a design goal, a blower-door test is the right input. For an existing home where construction era is known and envelope is unmodified, the Manual J infiltration tables are usually within ±10-15% of measured.",
  },
  {
    q: "What does the Manual S sequence add to Manual J?",
    a: "Manual J produces the load. Manual S converts the load into a specific equipment selection from a manufacturer's AHRI-certified rating data. The sequence: (1) Manual J cooling load determines the minimum and maximum nominal tonnage per the Manual S sizing window (90-115% for single-stage, 115-130% for variable-capacity). (2) Manual S then verifies that the AHRI-rated cooling capacity at design conditions (entering wet-bulb at the indoor coil + outdoor dry-bulb) actually meets the load. AHRI rates at 95°F/67°F entering-DB — for non-standard conditions you must use the manufacturer's expanded performance data. (3) Manual S also checks the sensible heat ratio match: the AHRI-rated equipment SHR must be at or below the Manual J load SHR for the equipment to control humidity adequately. (4) For heating: heating output × AFUE = furnace input; sized to the heating load with backup electric or aux heat strips covering the design-margin deficit on heat pumps. Manual S exists because the cooling tonnage alone isn't enough — equipment differs in how much sensible vs latent it produces, and matching matters.",
  },
  {
    q: "Is a Manual J required by code in my jurisdiction?",
    a: "In most US jurisdictions, yes. The IRC (International Residential Code), adopted as the residential building code base in most states, requires Manual J or equivalent in IRC Section M1401.3 for any space-conditioning equipment installation in a new residence. ACCA Manual J explicitly or an equivalent calculation per ASHRAE Handbook Chapter 17. State and local amendments vary — some jurisdictions also require a Manual D duct design, Manual S equipment selection, and a Manual T testing/balancing report. ENERGY STAR certified homes, RESNET HERS-rated homes, and homes pursuing Passive House certification all require full Manual J + Manual D + Manual S documentation. California Title 24 has its own load-calc methodology (California Building Energy Efficiency Standards) that supersedes Manual J for state-jurisdiction code compliance, though most CA contractors run both. Check your local code office for specific requirements.",
  },
  {
    q: "How much does a professional Manual J cost?",
    a: "Typical 2026 ranges (US residential, ballpark): $300-600 for a single-family home block load; $400-800 for a full room-by-room report; $600-1,200 for a complete Manual J + S + D package for new construction including ductwork design and equipment selection. Costs vary by software used (Wrightsoft Right-Suite, EnergyGauge, Carrier HAP, Cool Calc), engineer experience, home size and complexity, and turnaround time. Some HVAC contractors include Manual J in the equipment installation quote as a value-add; others charge separately. For a home in the 1,500-2,500 sq ft range, expect 2-4 hours of professional time at typical engineer billing rates. Note: this is a service-cost ballpark from publicly observed industry pricing; specific quotes vary substantially by region and provider. For new construction with a permit-required Manual J, the cost is built into the design budget and is a small fraction of total project cost.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Load Calculation Guide — Manual J Explained, Climate Zones to Equipment Sizing",
      description:
        "Complete Manual J 8th-edition residential load calculation methodology: 8 load components, block vs room-by-room, climate zones, envelope inputs, sensible/latent split, Manual S sequence, code requirements, software options, professional service cost.",
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
        { "@type": "Thing", name: "Manual J load calculation" },
        { "@type": "Thing", name: "HVAC equipment sizing" },
        { "@type": "Thing", name: "ACCA standards" },
        { "@type": "Thing", name: "Residential HVAC design" },
        { "@type": "Thing", name: "ASHRAE Handbook of Fundamentals" },
      ],
      keywords: [
        "hvac load calculation",
        "manual j explained",
        "manual j 8th edition",
        "residential load calculation",
        "manual s equipment selection",
        "btu calculator for house",
        "ac sizing residential",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to perform a Manual J residential load calculation",
      description: "Sequential procedure for performing a Manual J residential load calculation, from inputs to outputs.",
      totalTime: "PT2H",
      tool: [
        { "@type": "HowToTool", name: "ACCA Manual J 8th edition (ANSI/ACCA 2 Manual J — 2016)" },
        { "@type": "HowToTool", name: "ASHRAE Climatic Design Conditions for local weather station" },
        { "@type": "HowToTool", name: "Load calculation software (Wrightsoft Right-Suite, EnergyGauge, Cool Calc, Carrier HAP) or this site's interactive calculator" },
        { "@type": "HowToTool", name: "Blueprint or measured floor plan with orientations" },
        { "@type": "HowToTool", name: "Optional: blower-door test report for infiltration" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Measure the home", text: "Conditioned floor area, ceiling heights, number of stories. Note orientations (compass facing) for each exterior wall." },
        { "@type": "HowToStep", position: 2, name: "Inventory the envelope", text: "Wall area + R-value + framing, ceiling/roof area + R-value, fenestration (windows + doors) area + U-factor + SHGC by orientation, floor type + R-value." },
        { "@type": "HowToStep", position: 3, name: "Identify climate zone and design conditions", text: "Find nearest ASHRAE weather station; record 1% cooling DB + mean coincident WB, 99% heating DB. Optionally 0.4% extreme cooling and 99.6% extreme heating." },
        { "@type": "HowToStep", position: 4, name: "Estimate infiltration", text: "Blower-door test if available; otherwise Manual J Tables 5A/5B by construction era and apparent envelope tightness." },
        { "@type": "HowToStep", position: 5, name: "Set design indoor conditions and internal gains", text: "Indoor DB (typically 75°F cooling, 70°F heating); peak occupancy; equipment + lighting estimate (~2.5 BTU/hr·ft² typical)." },
        { "@type": "HowToStep", position: 6, name: "Calculate each load component", text: "Walls, windows (conduction + solar), roof/ceiling, floor, infiltration sensible and latent, people sensible and latent, equipment and lighting. Sum to total sensible + latent." },
        { "@type": "HowToStep", position: 7, name: "Compute totals, tonnage, SHR", text: "Total cooling BTU/hr = sensible + latent; divide by 12,000 for tons. SHR = sensible / total. Heating load uses same per-component method with heating ΔT and no solar/internal credit." },
        { "@type": "HowToStep", position: 8, name: "Apply Manual S to select equipment", text: "Manual S sizing window: 90-115% of cooling for single-stage, 115-130% for variable-capacity. Verify AHRI-rated SHR ≤ load SHR for humidity control. Furnace input = heating load / AFUE." },
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
        { "@type": "ListItem", position: 3, name: "HVAC Load Calculation Guide" },
      ],
    },
  ];
}

export default function HvacLoadCalculationGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Load Calculation Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Load Calculation Guide — Manual J Explained, From Climate Zones to Equipment Sizing
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A primary-source companion to our <Link href="/hvac-load-calculator/" className="underline font-semibold">interactive load calculator</Link>. This guide explains the ACCA Manual J 8th edition methodology — the IRC-referenced standard for residential HVAC sizing in the US — covering the eight load components, climate zone design conditions, envelope inputs, sensible vs latent dynamics, the Manual S equipment-selection sequence, code requirements, software tools, and DIY-vs-professional decision logic. Sourced throughout from ACCA Manual J 8th edition (ANSI/ACCA 2 Manual J — 2016), ASHRAE Handbook of Fundamentals 2021 Chapter 17, IECC 2021, and IRC 2021.
        </p>

          <div className="mt-5 rounded-xl border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>The companion calculator:</strong>{" "}
              <Link href="/hvac-load-calculator/" className="underline font-semibold text-blue-700 dark:text-blue-300">/hvac-load-calculator/</Link>{" "}
              implements a simplified Manual J using 7 inputs (floor area, stories, climate zone, construction era, window area, occupancy, equipment). Accurate within ±20% of full Manual J for typical residential. This guide is the education layer; use the calculator for actual numbers.
            </p>
          </div>
        </header>

        {/* SECTION 01 — What load calc does */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            What an HVAC load calculation actually produces
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            A residential load calculation produces four numbers: total cooling load (BTU/hr, often expressed as tons where 1 ton = 12,000 BTU/hr); cooling sensible heat ratio (SHR — the fraction of cooling capacity that goes to lowering dry-bulb temperature vs removing moisture); total heating load (BTU/hr); and design airflow (CFM = cooling load × 400 CFM/ton for standard residential, or tighter per equipment data sheet). These four numbers map directly into equipment selection per ACCA Manual S and duct system design per ACCA Manual D.
          </p>

          <KeyInsight tone="blue" title="The load calculation answers a specific question">
            What sensible + latent cooling capacity does this specific home need at the ASHRAE 1% design cooling condition? And what heating capacity does it need at the 99% design heating condition? Everything in a Manual J report exists to compute those two numbers with defensible accuracy. The companion <Link href="/hvac-load-calculator/" className="underline">load calculator</Link> produces both numbers from 7 inputs in a simplified Manual J methodology accurate within ±20% of a full report.
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Typical cooling load components — 2,000 ft² home in Zone 4A"
              orientation="horizontal"
              data={[
                { label: "Windows (solar gain)", value: 9500, sub: "BTU/hr", color: "#f59e0b" },
                { label: "Walls + ceiling conduction", value: 7200, sub: "BTU/hr", color: "#3b82f6" },
                { label: "Infiltration (sensible)", value: 4100, sub: "BTU/hr", color: "#8b5cf6" },
                { label: "Roof conduction", value: 3400, sub: "BTU/hr", color: "#10b981" },
                { label: "People (4 occupants)", value: 1200, sub: "BTU/hr", color: "#ec4899" },
                { label: "Equipment + lighting", value: 5000, sub: "BTU/hr", color: "#ef4444" },
                { label: "Latent (moisture)", value: 6800, sub: "BTU/hr", color: "#06b6d4" },
              ]}
              axisLabel="BTU/hr"
              caption="Windows and infiltration drive most of the cooling load. Envelope improvements (window upgrades, air sealing) shrink the largest segments and directly reduce required equipment tonnage."
            />
          </div>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The numbers matter because equipment is selected from AHRI-certified ratings against these specific design conditions. A 3-ton (36,000 BTU/hr) AC compressor is rated by AHRI Standard 210/240 at 95°F outdoor dry-bulb and 67°F indoor wet-bulb — those are the design conditions Manual J assumes for the &quot;A&quot; rating point. The home&apos;s actual peak cooling demand has to match the equipment&apos;s rated capacity at that design condition, or the equipment either undersizes (capacity falls short on hot days) or oversizes (short-cycles and fails to control humidity). Manual J + Manual S together exist to make that match precise.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="ASHRAE 1% design temperatures by IECC climate zone"
              orientation="vertical"
              data={[
                { label: "Zone 1A", value: 92, sub: "Miami", color: "#dc2626" },
                { label: "Zone 2A", value: 96, sub: "Houston", color: "#ef4444" },
                { label: "Zone 3A", value: 94, sub: "Atlanta", color: "#f59e0b" },
                { label: "Zone 4A", value: 91, sub: "Philadelphia", color: "#10b981" },
                { label: "Zone 5A", value: 88, sub: "Chicago", color: "#06b6d4" },
                { label: "Zone 6A", value: 85, sub: "Minneapolis", color: "#3b82f6" },
                { label: "Zone 7", value: 82, sub: "Duluth", color: "#8b5cf6" },
              ]}
              axisLabel="Cooling design DB (°F)"
              caption="Manual J uses ASHRAE 1% design temperatures — exceeded only 1% of summer hours. Equipment sized to handle these conditions covers 99% of cooling hours. Hotter zones (1A-3A) drive larger cooling tonnage; cooler zones (5A-7) have smaller cooling loads but larger heating loads."
            />
          </div>
        </section>

        {/* SECTION 02 — Rules of thumb vs Manual J */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Why &quot;500 ft² per ton&quot; is wrong (and what to do instead)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The most common HVAC sizing shortcut is the floor-area-per-ton rule of thumb: 500 ft² per ton for warm climates, 600 ft² per ton for cooler. These rules were derived from average residential construction practice in the 1960s-1970s, when typical homes had R-7 walls, R-11 attics, single-pane windows, and natural infiltration around 1.0 ACH. They have not been updated for the dramatic envelope improvements since IECC adoption (2003 baseline, increasingly stringent through 2021 editions) or the high-performance home movement (Passive House, Net Zero).
          </p>

          <ComparisonTable
            headers={["Era", "Approx. tons/1,000 ft²", "Approx. ft²/ton", "Why"]}
            rows={[
              { label: "Pre-1980 (R-7/R-11/single pane)", cells: ["2.0-2.5", "400-500", "Leaky, uninsulated — load dominated by infiltration + conduction"] },
              { label: "1980-2005 (R-13/R-30/double pane)", cells: ["1.3-1.7", "600-750", "Insulated; window solar gain dominates"] },
              { label: "2005-2015 (IECC + low-e)", cells: ["1.0-1.3", "750-1,000", "Tighter envelope; better windows"] },
              { label: "2015+ (high-perf, tight)", cells: ["0.7-1.0", "1,000-1,400", "Solar gain still significant; everything else reduced"] },
              { label: "Passive House", cells: ["0.4-0.6", "1,600-2,500", "Heating dominates; cooling load minimal"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The differences are not subtle. A 2,000 sq ft home built in 1975 might genuinely need 4 tons of cooling; the same floor area in a 2018 build often needs only 2 tons. Applying the legacy 500 ft²/ton rule to the modern home oversizes by 100%, which manifests as short-cycling, poor humidity control, and 10-25% higher energy bills than properly-sized equipment. ACCA Manual J fixes this by inputting envelope quality directly into the calculation rather than assuming it.
          </p>

          <FixCallout>
            <strong>The right move:</strong> never size HVAC by rule of thumb. Run a Manual J or use our <Link href="/hvac-load-calculator/" className="underline">load calculator</Link> for a quick estimate. Then apply Manual S to convert the load into a specific equipment selection. For new construction with a code-required permit, professional Manual J is typically required. For existing equipment replacement, even a back-of-the-envelope load calc usually justifies a smaller (and cheaper, and better-performing) equipment selection than what was originally installed.
          </FixCallout>
        </section>

        {/* SECTION 03 — Methodology */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            The Manual J methodology — what the 600-page standard actually does
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ACCA Manual J 8th edition (ANSI/ACCA 2 Manual J — 2016) is the residential load calculation standard adopted by the International Residential Code at Section M1401.3. The standard runs ~600 pages because it codifies inputs and procedures across every load component for every residence type. The methodology in compressed form:
          </p>

          <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Establish design conditions.</strong> Look up the home&apos;s nearest ASHRAE weather station; record 1% cooling dry-bulb (with mean coincident wet-bulb for humidity calc) and 99% heating dry-bulb. Indoor design typically 75°F / 50% RH cooling, 70°F heating.</li>
            <li><strong>Catalog the envelope.</strong> Each exterior wall surface measured with U-value, area, and orientation. Each window measured with U-factor, SHGC, area, orientation, and external shading. Roof and floor characterized. Doors as small windows with low SHGC.</li>
            <li><strong>Quantify infiltration.</strong> Blower-door test result if available; otherwise Manual J Tables 5A/5B based on construction era + visible envelope tightness. Convert to CFM natural infiltration using the LBL or ASHRAE leakage model.</li>
            <li><strong>Identify internal gains.</strong> Peak occupancy × 250 BTU/hr sensible + 150 BTU/hr latent per person (sedentary activity per ASHRAE Standard 55). Equipment + lighting per Manual J Table 5C or measured.</li>
            <li><strong>Compute each component.</strong> Conduction (U × A × ΔT or U × A × CLTD for surfaces with solar lag), solar gain (A × SHGC × SHGF by orientation), infiltration sensible (1.08 × CFM × ΔT) and latent (0.68 × CFM × Δgrains), internal gains, duct losses if ducts in unconditioned space.</li>
            <li><strong>Sum and apply safety factors.</strong> Total sensible + total latent = total cooling. Total heating excludes solar and internal gains (conservative). Safety factor zero for Manual J&apos;s typical methodology; Manual S applies the equipment-sizing window.</li>
            <li><strong>Produce report.</strong> Cooling load BTU/hr + tons, SHR, heating load BTU/hr, design CFM. Room-by-room version produces per-room CFM for ductwork.</li>
          </ol>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            That sequence is what the <Link href="/hvac-load-calculator/" className="underline">interactive load calculator</Link> does. The simplification: it bundles envelope inputs by construction era (rather than asking for individual U-values), uses average solar orientation, and applies typical infiltration by ACH presets. That trades fidelity for usability; the result is reliable for screening and gut-checks but not a substitute for full Manual J for permit-required new construction.
          </p>
        </section>

        {/* SECTION 04 — Eight components */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            The eight cooling-load components (with formulas)
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Manual J decomposes cooling load into eight sensible components plus three latent. Each has a specific formula and input requirements. Understanding which dominates for a particular home is what makes a load calc actionable rather than a black-box number.
          </p>

          <TechSection icon="insight" tone="blue" title="1. Walls — conduction with solar adjustment">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_walls = U × A × CLTD_walls</pre>
            <p className="mt-2 text-sm">U = wall assembly U-value (BTU/hr·ft²·°F). A = net wall area (gross wall − windows − doors). CLTD = Cooling Load Temperature Differential, approximately ΔT + 15°F for typical residential vinyl-sided framed walls per Manual J Table 4A — the +15°F adjustment captures solar heating of the wall surface that conducts into the home. Typical contribution: 15-25% of total cooling load.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="2. Windows — conduction + solar (two components)">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_window_cond = U × A × ΔT
Q_window_solar = A × SHGC × SHGF × shading_factor</pre>
            <p className="mt-2 text-sm">Conduction: window U-factor × area × outdoor-indoor temperature difference (no CLTD adjustment because glazing has minimal thermal mass). Solar: window area × SHGC (Solar Heat Gain Coefficient, fraction of incident sunlight that becomes heat) × SHGF (Solar Heat Gain Factor, BTU/hr·ft² incident solar at the orientation and design hour) × external shading factor. Solar typically dominates: a south-facing window can deliver 50-80 BTU/hr/ft² of solar load. Windows are often the largest single contributor (20-40%) to cooling load.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="3. Roof / ceiling — conduction with strong solar adjustment">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_roof = U × A × CLTD_roof</pre>
            <p className="mt-2 text-sm">U = ceiling+attic+roof assembly U-value. CLTD_roof is much higher than walls (typically ΔT + 35°F for residential composite shingle roofs) because shingles bake in direct sun and the attic above easily reaches 130-150°F on a 95°F day. Cool roofs (light-color shingles, white TPO commercial) and radiant barriers reduce CLTD_roof by 30-50%. Typical contribution: 10-20%.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="4. Floor — conduction (often negligible for slab-on-grade)">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_floor = U × A × ΔT  (for floors over unconditioned space)
Q_floor ≈ 0 (slab-on-grade in cooling mode)</pre>
            <p className="mt-2 text-sm">For raised floors over a ventilated crawlspace or basement: conduct heat with U-value × area × outdoor-indoor delta. For slab-on-grade: cooling contribution is negligible (ground temperature is typically lower than indoor cooling setpoint, so floor is a small heat-sink rather than heat-source). Typical contribution: 0-5%.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="5. Infiltration sensible — outdoor air leakage">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_infil_sens = 1.08 × CFM × ΔT
CFM = ACH × volume / 60</pre>
            <p className="mt-2 text-sm">Outdoor air leaking through envelope cracks. CFM derived from ACH (Air Changes per Hour) × interior volume / 60 minutes. ACH from blower-door test or Manual J Table 5A by construction era. Coefficient 1.08 derives from air specific heat × air density at standard conditions. Modern tight construction (≤0.3 ACH) keeps this component small; leaky old homes (0.6+ ACH) push it to 25-40% of total load.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="6. People — sensible + latent">
            <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">Q_people_sens = 250 × occupants
Q_people_lat = 150 × occupants</pre>
            <p className="mt-2 text-sm">Each occupant at sedentary activity contributes 250 BTU/hr sensible heat (body warmth radiated + convected) + 150 BTU/hr latent (respiration + perspiration). Manual J Table 5C; same coefficients in ASHRAE Standard 55 thermal comfort analysis. Activity-adjusted values for active occupants (cooking, exercising) range up to 350+50% higher. Typical residential contribution: 1,000-2,000 BTU/hr for 4-6 occupants.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="7. Equipment + lighting — internal sensible gain">
            <p className="text-sm">Refrigerators, microwaves, ovens, computers, TVs, lights — anything that consumes electricity ultimately turns into heat in the conditioned space. Rule of thumb from Manual J: 2.5 BTU/hr × floor area covers typical residential. Override for homes with large kitchens during cooking, home offices with multiple computers, indoor saunas/pools, or electric resistance heat sources. Typical residential contribution: 3,000-8,000 BTU/hr for 1,500-3,000 sq ft.</p>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="8. Duct gains/losses (if ducts in unconditioned space)">
            <p className="text-sm">If supply ducts run through an unconditioned attic, basement, or crawlspace, the conditioned air in the duct exchanges heat with the surrounding hot/cold space. The penalty depends on duct insulation R-value, duct surface area, ΔT between duct interior and surrounding space, and air velocity. Manual J Section 8 + ACCA Manual D Appendix B compute this rigorously. Typical penalty: 5-25% of net delivered capacity for ducts in conditioned space (0%), R-6 ducts in unconditioned attic (15-20%), uninsulated ducts in attic (25-35%). The simplified calculator on this site assumes ducts are in conditioned space; for ducts in attic add a 15-20% load adder.</p>
          </TechSection>
        </section>

        {/* SECTION 05 — Block vs room-by-room */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Block load vs room-by-room — which do you need?
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual J recognizes two calculation modes that produce different outputs from the same envelope data:
          </p>

          <ComparisonTable
            headers={["Method", "What it produces", "Sufficient for", "Not sufficient for"]}
            rows={[
              { label: "Block load (whole-house)", cells: ["Total cooling BTU/hr; total heating BTU/hr; equipment tonnage", "Equipment selection (compressor + furnace size)", "Ductwork sizing; per-room balancing"] },
              { label: "Room-by-room load", cells: ["Per-room cooling + heating BTU/hr; per-room design CFM", "Ductwork sizing (Manual D); register sizing; balancing", "Adds 2-4× the calculation time"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Code requirements vary: IRC Section M1401.3 requires Manual J for equipment sizing in new construction; some jurisdictions also require Manual D ductwork design (which depends on room-by-room CFM). ENERGY STAR certified homes and RESNET HERS-rated homes require both block and room-by-room. For a contractor doing a like-for-like equipment replacement on existing ductwork, block load is usually sufficient. For new construction or any new ductwork, room-by-room is required.
          </p>

          <KeyInsight tone="amber" title="The calculator on this site is a block load">
            Our <Link href="/hvac-load-calculator/" className="underline">interactive load calculator</Link> produces equipment-level cooling tonnage + heating BTU/hr from 7 inputs — block load only. For ductwork design you need per-room CFM from a full Manual J + D report. Use the calculator for gut-checking equipment sizing; commission a full Manual J for ductwork or permit-required new construction.
          </KeyInsight>
        </section>

        {/* SECTION 06 — Climate zones */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Climate zones and ASHRAE design conditions
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual J references the IECC climate zone map (eight zones, with humid &quot;A&quot; / dry &quot;B&quot; / marine &quot;C&quot; subcategories) for envelope-related requirements and ASHRAE Climatic Design Conditions (Handbook of Fundamentals Chapter 14) for the specific outdoor temperatures used in load calculation.
          </p>

          <ComparisonTable
            headers={["IECC zone", "Heating degree-day range", "1% cooling DB (typical)", "99% heating DB (typical)", "Example city"]}
            rows={[
              { label: "1 — Very Hot", cells: ["<3,000 HDD", "91-94°F", "47-50°F", "Miami, Honolulu, Key West"] },
              { label: "2 — Hot", cells: ["3,000-3,500 HDD", "92-96°F", "30-40°F", "Houston, Phoenix, New Orleans"] },
              { label: "3 — Warm", cells: ["3,500-5,000 HDD", "90-94°F", "20-30°F", "Atlanta, Dallas, Los Angeles"] },
              { label: "4 — Mixed", cells: ["5,000-7,000 HDD", "88-92°F", "10-20°F", "DC, NYC, St. Louis"] },
              { label: "5 — Cool", cells: ["7,000-9,000 HDD", "85-90°F", "0-15°F", "Chicago, Boston, Denver"] },
              { label: "6 — Cold", cells: ["9,000-13,500 HDD", "82-87°F", "-10 to 0°F", "Minneapolis, Burlington"] },
              { label: "7 — Very Cold", cells: ["13,500-18,000 HDD", "78-82°F", "-20 to -10°F", "Duluth, International Falls"] },
              { label: "8 — Subarctic", cells: ["≥18,000 HDD", "73-78°F", "-40 to -25°F", "Fairbanks, Anchorage interior"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: IECC 2021 Section C301 / R301 climate zone definitions; ASHRAE Climatic Design Conditions for ~4,500 worldwide weather stations. The values above are zone-typical; specific stations can vary ±5°F within a zone. For tight design work, use ASHRAE&apos;s station-specific data rather than zone-typical values — Wrightsoft Right-Suite, Cool Calc, and Carrier HAP all interface directly with the ASHRAE dataset.
          </p>
        </section>

        {/* SECTION 07 — Envelope */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Envelope inputs — U-values, fenestration, infiltration
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Three categories of envelope data dominate the calculation. Quality of these inputs determines quality of the output.
          </p>

          <TechSection icon="insight" tone="blue" title="Wall, roof, floor U-values">
            U-value = 1 / total assembly R-value. Calculated by summing R-values of each layer in the assembly (siding, sheathing, cavity insulation accounting for thermal bridging through framing, drywall) — the &quot;parallel path&quot; method per ASHRAE Handbook Fundamentals Chapter 27. Typical residential wall U-values: pre-1980 R-7 cavity → effective U-0.14 with framing; 2015+ R-21 cavity → effective U-0.048 with framing. The framing penalty (15-20% of effective R) matters more than most homeowners realize — a &quot;R-21 wall&quot; with thermal bridging acts like R-14 effective. Advanced framing (24&quot; OC, ladder T-walls, insulated headers) reduces the framing penalty.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Fenestration (windows + doors)">
            U-factor + SHGC are the two specs that matter. U-factor: heat transfer through the unit (lower = better). SHGC: fraction of incident solar that becomes heat in the home (lower = less cooling load; higher = more passive heating in winter). Both reported on NFRC labels for window units. Typical: pre-2000 single-pane wood U-1.10 / SHGC-0.85; 2000s double-pane low-e U-0.40 / SHGC-0.40; 2015+ triple-pane U-0.20 / SHGC-0.30. SHGC matters most for the cooling load — a 200 ft² window area at 50 BTU/hr·ft² × SHGC 0.4 = 4,000 BTU/hr; reduce SHGC to 0.2 (low-SHGC glazing) and it drops to 2,000 BTU/hr.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Infiltration — measurement vs estimation">
            Best: blower-door test at 50 Pascals (CFM50), then convert to natural ACH using the LBL leakage model or ASHRAE 119 procedure. Typical CFM50 results: leaky old construction 3,000-4,000 CFM50 (~0.8 ACHnat); 1980s-2000s typical 1,500-2,500 (~0.4 ACHnat); IECC 2009 compliant ≤7 ACH50 (~0.2-0.3 ACHnat); Passive House certified ≤0.6 ACH50 (~0.05 ACHnat). Without a blower-door test, Manual J Table 5A presets infiltration by construction era + apparent tightness — the simplified default used by the calculator on this site. Difference matters most for tight modern construction where Manual J defaults systematically overestimate infiltration load by 30-50%, causing equipment oversizing.
          </TechSection>
        </section>

        {/* SECTION 08 — Internal gains */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Internal gains and occupancy
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            People, equipment, and lighting all add heat to the conditioned space. Manual J methodology:
          </p>

          <ComparisonTable
            headers={["Source", "Sensible (BTU/hr)", "Latent (BTU/hr)", "Notes"]}
            rows={[
              { label: "Sedentary occupant", cells: ["250", "150", "ASHRAE Std 55 / Manual J Table 5C"] },
              { label: "Light office work", cells: ["275", "175", "Reading, typing"] },
              { label: "Standing, walking", cells: ["350", "225", "Light housework, cooking"] },
              { label: "Moderate activity", cells: ["475", "300", "Cleaning, gardening indoors"] },
              { label: "Lighting (LED average)", cells: ["~0.5 W/ft² × 3.412", "0", "0.5 W/ft² typical residential ⇒ ~1.7 BTU/hr/ft²"] },
              { label: "Lighting (incandescent legacy)", cells: ["~2.5 W/ft² × 3.412", "0", "Higher for older fixtures, pre-LED conversion"] },
              { label: "Refrigerator (typical)", cells: ["300-500", "0", "Heat rejected from condenser into conditioned space"] },
              { label: "Computer + monitor", cells: ["200-400", "0", "Multiple in home office push higher"] },
              { label: "Cooking — oven on", cells: ["1,500-3,000", "500-1,000", "Peak load during cooking; design for occasional"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Manual J Table 5C provides the canonical values; ASHRAE Handbook of Fundamentals Chapter 18 Table 1 provides extended values for non-residential. For typical 4-occupant residences, internal gains contribute 4,000-7,000 BTU/hr total — meaningful but rarely the dominant component. Override for atypical homes with home offices, indoor pools, or large commercial-grade kitchens.
          </p>
        </section>

        {/* SECTION 09 — Sensible vs latent */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Sensible vs latent and Sensible Heat Ratio (SHR)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Cooling load splits into two thermodynamically distinct components: sensible (dropping dry-bulb temperature) and latent (removing moisture). The ratio determines what equipment matches the home.
          </p>

          <pre className="my-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">SHR = Sensible cooling load / Total cooling load
Latent fraction = 1 − SHR</pre>

          <ComparisonTable
            headers={["Climate", "Typical load SHR", "Latent fraction", "Equipment selection implication"]}
            rows={[
              { label: "Hot/humid (Zone 1A-2A)", cells: ["0.70-0.80", "20-30%", "Equipment SHR must be ≤ load SHR; consider variable-capacity for part-load humidity control"] },
              { label: "Warm/humid (Zone 3A-4A)", cells: ["0.75-0.85", "15-25%", "Standard single-stage usually adequate; 2-stage preferred for shoulder seasons"] },
              { label: "Cool/humid (Zone 5A-6A)", cells: ["0.80-0.90", "10-20%", "Sensible dominates; latent removal during brief cooling season"] },
              { label: "Hot/dry (Zone 2B-3B)", cells: ["0.90-0.95", "5-10%", "Minimal latent load; can use evaporative cooling supplement"] },
              { label: "Cold/dry (Zone 5B-7B)", cells: ["0.90-0.95+", "<10%", "Latent essentially ignorable in cooling design"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The matching rule</strong> (per Manual S): equipment-rated SHR must be ≤ home load SHR. If the home has SHR 0.78 (humid climate) and the equipment AHRI-rated SHR is 0.82, the equipment is &quot;sensible-heavy&quot; — it will satisfy thermostat (dropping dry-bulb) before pulling enough latent, leaving the home at 65-70% RH. Symptom: 72°F indoor but feels muggy. Fix: lower the equipment&apos;s coil saturated suction temperature (smaller compressor at same airflow) OR add separate dehumidification. AHRI publishes SHR per equipment + coil combination at standard test conditions; consult the equipment&apos;s AHRI certification for your load match.
          </p>
        </section>

        {/* SECTION 10 — Manual S */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Manual S — converting load to equipment selection
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual J produces the load (BTU/hr). Manual S converts that load into a specific equipment selection from a manufacturer&apos;s AHRI-certified rating data. The sizing window per ACCA Manual S — Residential Equipment Selection (current edition):
          </p>

          <ComparisonTable
            headers={["Equipment type", "Cooling sizing window", "Why the window"]}
            rows={[
              { label: "Single-stage AC", cells: ["90-115% of Manual J cooling", "Tight window — single-stage runs at full capacity always; oversize = short cycle"] },
              { label: "Two-stage AC", cells: ["100-125%", "Two-stage runs at 60-70% on part-load; tolerates more oversizing"] },
              { label: "Variable-capacity AC (inverter)", cells: ["100-130%", "Modulates from 25-30% to 100%; widest tolerance for sizing"] },
              { label: "Heat pump cooling", cells: ["Per AC category above", "Heat pumps follow AC sizing rules in cooling mode"] },
              { label: "Heat pump heating", cells: ["Variable — supplement with electric strips", "Heat pump capacity drops at low outdoor T; size to cooling, supplement heating below balance point"] },
              { label: "Gas furnace", cells: ["≥100% of heating load / AFUE", "Furnace output = nameplate × AFUE; ensure output meets load on coldest day"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The full Manual S sequence: (1) Determine candidate equipment from cooling tonnage at the home&apos;s design conditions per AHRI Standard 210/240 expanded performance data — not the nameplate rating, which is at the 95°F/67°F standard point. (2) Verify the AHRI-rated SHR matches or beats the Manual J load SHR for humidity control. (3) Confirm airflow at design CFM matches blower curve. (4) For heating: heating output ≥ Manual J heating load at the 99% design winter temperature; for heat pumps, supplement with electric resistance strips covering the deficit between heat pump output at the &quot;balance point&quot; and the design load.
          </p>

          <FixCallout>
            <strong>Manual J alone is incomplete.</strong> A Manual J report that recommends &quot;3 tons&quot; without Manual S verification is half-done. The matching equipment must pass: AHRI capacity at the home&apos;s actual design conditions (not standard 95°F/67°F) AND SHR match for humidity AND airflow match for the duct system. A correctly sized 3-ton load could end up specifying a 3.5-ton variable-capacity unit at home design conditions while still being &quot;within Manual S window&quot; — there&apos;s no single right answer without the equipment-side data.
          </FixCallout>
        </section>

        {/* SECTION 11 — Code requirements */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Code requirements — where Manual J is required by law
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual J&apos;s legal status varies by jurisdiction, but the dominant framework is the International Residential Code (IRC):
          </p>

          <ComparisonTable
            headers={["Code / Standard", "What it requires", "Applies to"]}
            rows={[
              { label: "IRC 2021 Section M1401.3", cells: ["Sizing per ACCA Manual J or equivalent", "All residential equipment installation in IRC-adopting jurisdictions (most US states)"] },
              { label: "IECC 2021 Section R403.5.1", cells: ["Manual J + S + D for new construction", "New residential construction in IECC-adopting jurisdictions"] },
              { label: "California Title 24 (2025)", cells: ["State-specific load calc methodology (compliance software)", "California new residential construction"] },
              { label: "ENERGY STAR Single-Family Homes Program v3.2", cells: ["Manual J + S + D documentation", "ENERGY STAR certified residential new construction"] },
              { label: "RESNET HERS H2.0", cells: ["Manual J for HVAC sizing in HERS-rated homes", "RESNET HERS-rated homes (mortgage qualification, utility incentives)"] },
              { label: "ACCA Quality Installation (QI) Standard 5", cells: ["Manual J + S + D + T for QI-compliant installations", "Voluntary contractor program; some utility rebates require"] },
              { label: "Passive House (PHIUS / Passive House Institute)", cells: ["Detailed load calculation; tighter requirements than Manual J", "Passive House certified construction"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: IRC 2021 Chapter 14; IECC 2021 Chapter 4; ACCA QI Standard 5; ENERGY STAR Residential New Construction Program v3.2 Technical Requirements; RESNET HERS Standards.
          </p>
        </section>

        {/* SECTION 12 — Software */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Software tools — what professionals use
          </h2>

          <ComparisonTable
            headers={["Software", "Vendor", "Use case", "Notes"]}
            rows={[
              { label: "Wrightsoft Right-Suite", cells: ["Wrightsoft", "Full Manual J + S + D + T integrated", "Industry-standard professional package; ~$1,500-3,000 + annual subscription"] },
              { label: "EnergyGauge USA", cells: ["FSEC", "Manual J + energy modeling", "Florida/Southeast focus; HERS rating capable"] },
              { label: "Cool Calc", cells: ["Multiple", "Web-based simplified Manual J", "Lower-cost; suitable for ballpark sizing"] },
              { label: "Carrier HAP", cells: ["Carrier", "Commercial + residential load calc", "Manufacturer-aligned; free for Carrier dealers"] },
              { label: "Daikin DAQS", cells: ["Daikin", "Manual J + S aligned to Daikin equipment", "Vendor-specific; free for Daikin dealers"] },
              { label: "Manual J Express", cells: ["ACCA", "ACCA's official simplified Manual J", "Approved per Manual J 8th edition Section 17"] },
              { label: "REM/Rate", cells: ["NORESCO", "Energy modeling + Manual J", "Primarily HERS rating; load calc included"] },
              { label: "BEopt", cells: ["NREL", "Whole-building energy simulation", "Research-grade; free; not Manual J-certified"] },
              { label: "This site's load calculator", cells: ["hvacptcharts.com", "Quick block-load estimate from 7 inputs", "Educational + screening; not for permit-required Manual J"] },
            ]}
          />
        </section>

        {/* SECTION 13 — DIY vs hire */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            DIY vs hire a Manual J professional
          </h2>

          <ComparisonTable
            headers={["Scenario", "DIY (this site's calculator)", "Hire a pro (~$300-1,200)"]}
            rows={[
              { label: "Existing equipment replacement (no permit)", cells: ["✓ Sufficient for sizing gut-check", "Optional — usually overkill"] },
              { label: "New construction (permit required)", cells: ["Not sufficient", "Required by code"] },
              { label: "Major renovation with new HVAC", cells: ["✓ Initial screening", "✓ For permit-required portions"] },
              { label: "Verify contractor's proposed equipment size", cells: ["✓ Excellent use case", "Optional second opinion"] },
              { label: "ENERGY STAR / HERS / Passive House certification", cells: ["Not sufficient", "Required by program"] },
              { label: "High-performance home (tight envelope)", cells: ["May underestimate by missing tight-envelope nuance", "Strongly recommended — full Manual J handles tight construction better"] },
              { label: "Documentation for tax credit or rebate", cells: ["Most programs require professional report", "Required"] },
            ]}
          />

          <FixCallout>
            <strong>The honest rule:</strong> use our calculator and any free tool for screening, gut-checks, and DIY-curious learning. Hire a Manual J professional when (1) code requires it, (2) you&apos;re pursuing certification or rebate, (3) the home is high-performance tight construction where envelope nuance matters, or (4) the equipment proposed by your contractor seems wrong and you want an independent number to negotiate from. Cost is typically $300-800 for residential block + room-by-room, well worth it when the equipment decision affects 15-20 years of energy bills and comfort.
          </FixCallout>
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
              <strong>Standards (primary methodology sources):</strong> ACCA Manual J, Residential Load Calculation, 8th edition — codified as ANSI/ACCA 2 Manual J — 2016. ACCA Manual S, Residential Equipment Selection. ACCA Manual D, Residential Duct Systems, 3rd edition. ACCA Manual T, System Balancing and Air Distribution. ACCA Quality Installation (QI) Standard 5 — Residential HVAC.
            </p>
            <p className="mt-3">
              <strong>ASHRAE references:</strong> ASHRAE Handbook of Fundamentals 2021, Chapter 14 (Climatic Design Information), Chapter 17 (Residential Cooling and Heating Load Calculations), Chapter 18 (Nonresidential Cooling and Heating Load Calculations). ASHRAE Standard 55 (Thermal Environmental Conditions for Human Occupancy) — internal-gain coefficients. ASHRAE Standard 119 (Air Leakage Performance for Detached Single-Family Residential Buildings) — infiltration measurement. ASHRAE Climatic Design Conditions database covering ~4,500 worldwide weather stations.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Residential Code (IRC) 2021, Section M1401.3 (load calculation reference). International Energy Conservation Code (IECC) 2021, Section R403.5.1 (HVAC sizing) and Section R301 (climate zones). California Building Energy Efficiency Standards (Title 24, 2025 edition). State-specific amendments per local building code office.
            </p>
            <p className="mt-3">
              <strong>Certification programs:</strong> ENERGY STAR Single-Family New Homes Program v3.2 Technical Requirements. RESNET HERS Standards (Residential Energy Services Network Home Energy Rating System). Passive House Institute US (PHIUS) certification requirements. Passive House Institute (PHI, Germany) PHPP.
            </p>
            <p className="mt-3">
              <strong>Equipment rating:</strong> AHRI Standard 210/240 — Performance Rating of Unitary Air-Conditioning &amp; Air-Source Heat Pump Equipment. AHRI Directory of Certified Performance for residential HVAC. AHRI 1230 (Variable Refrigerant Flow) for VRF systems. AHRI 880 (Air Terminals).
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> specific equipment recommendations (depends on the home + climate + budget — work with a Manual S professional). Specific software pricing (changes frequently — check vendor sites). Code-compliance opinions for specific jurisdictions (consult local building code office). Our companion calculator at <Link href="/hvac-load-calculator/" className="underline">/hvac-load-calculator/</Link> produces approximate Manual J output; for permit-required new construction, hire a Manual J professional with full software and certification.
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
            <Link href="/hvac-load-calculator/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><Gauge className="h-4 w-4" /> HVAC Load Calculator (companion)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Interactive Manual J — 7 inputs → cooling tons + heating BTU/hr + SHR.</p>
            </Link>
            <Link href="/duct-size-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Duct Size Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Round + rectangular sizing from CFM per ACCA Manual D.</p>
            </Link>
            <Link href="/psychrometric-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Thermometer className="h-4 w-4 text-blue-600" /> Psychrometric Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Air properties for outdoor + indoor design conditions; required input for latent load.</p>
            </Link>
            <Link href="/carrier-410a-charging-chart/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Carrier R-410A Charging Chart</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Field charging — verify Manual J load at design conditions after install.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> HVAC Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees for diagnosing when equipment isn&apos;t meeting Manual J load.</p>
            </Link>
            <Link href="/refrigerant-safety-classifications/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> ASHRAE 34 Safety Classes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A2L equipment selection consideration alongside Manual J load.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Sun, Snowflake, Home, Users, AlertTriangle, ListChecks];
