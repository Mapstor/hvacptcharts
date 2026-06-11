import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Wrench, Flame, Zap, Wind, Thermometer, Gauge, Snowflake, ArrowUpRight, Calculator } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-retrofitting-upgrades-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Retrofitting & Upgrades Guide — R-22 + A2L Transition, Heat Pump Conversion, IRA Tax Credits",
  description:
    "Complete HVAC retrofit + upgrade reference: R-22 phase-out reality (EPA Section 605/606 + retrofit chemistry honest assessment), AIM Act + R-410A → A2L manufacturing transition January 2025 (40 CFR Part 84), heat pump retrofit (fuel transition + cold climate + dual-fuel + electrical service), efficiency upgrades (SEER2/HSPF2/AFUE2 per 10 CFR Part 430), envelope-first methodology, repair vs replace decision framework (age + refrigerant + failure type + 50%/85% rule), IRA 25C/25D tax credits + HEEHRA/HOMES rebates per IRS guidance, ASHRAE 30-year equipment service life data, cost + payback framework. Sourced from EPA, IRS, ASHRAE 90.2, DOE 10 CFR Part 430, ENERGY STAR.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Retrofitting & Upgrades Guide — R-22 Phase-Out + A2L Transition + Heat Pump + IRA Credits",
    description: "R-22 retrofit reality, A2L transition, heat pump conversion, SEER2 upgrades, IRA tax credits, repair vs replace decision matrix.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Retrofitting & Upgrades Guide — Decision Matrix + IRA Credits",
    description: "Complete retrofit methodology + repair vs replace framework.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "Can I retrofit my R-410A air conditioner to R-32 or R-454B?",
    a: "Generally NO — and this is one of the most common misconceptions about the A2L refrigerant transition. R-410A equipment is classified per ASHRAE Standard 34 as A1 (non-flammable). A2L refrigerants (R-32, R-454B) are mildly flammable. Equipment safety design under UL 60335-2-40 + ASHRAE Standard 15 differs substantially: A2L equipment requires specific safety features (refrigerant leak detection systems, ventilation interlocks, charge limits based on room volume, dedicated wiring for fault detection, specific service valve design). Existing R-410A equipment was not designed, tested, or listed for A2L use. Converting it would void the UL listing, void manufacturer warranty, and create a fire/safety risk per OSHA + manufacturer specifications. Some specific equipment lines from certain manufacturers were designed as A2L-ready but most existing residential R-410A equipment is NOT A2L-convertible. The path forward for R-410A equipment: continue servicing with reclaimed R-410A (legal under EPA Section 608 indefinitely), or replace with new A2L equipment when economics warrant. Equipment manufactured before January 1, 2025 can typically be serviced with R-410A through its useful life; new equipment manufacturers were required to transition to GWP ≤700 refrigerants starting January 2025 per 40 CFR Part 84 AIM Act.",
  },
  {
    q: "Is R-22 retrofit possible? What about 'drop-in' refrigerants?",
    a: "Technically yes for R-22 systems, but 'drop-in' is misleading marketing terminology. R-22 systems can be retrofitted to alternative refrigerants — most commonly R-407C, but also R-422D (Freezone), R-422B (Forane), R-417A (Isceon), and others. The honest reality of any R-22 retrofit: (1) Oil change required: R-22 uses mineral oil; HFC retrofits require POE (polyolester) oil. Multiple oil flushes typically needed to remove residual mineral oil. (2) Expansion valve replacement: TXV calibrated for R-22 won't optimize for retrofit refrigerant; typically replaced or adjusted. Many R-22 systems used fixed orifice (capillary or piston) — replacement orifice often required. (3) Filter-drier replacement: existing R-22 drier incompatible with POE oil + new refrigerant; replacement mandatory. (4) Capacity reduction: 10-20% capacity loss typical with most retrofit refrigerants vs original R-22 design. System won't cool as well on hot days. (5) Efficiency reduction: SEER rating drops typically 5-15% from original R-22 rating. Higher operating cost. (6) Manufacturer warranty void: changing refrigerant typically voids any remaining warranty. (7) System longevity: existing components (compressor, coils) were designed for R-22 pressures/oils; retrofit shortens useful life. The honest framing: retrofitting R-22 is a maintenance bridge, not an upgrade. For systems 12+ years old, equipment replacement with modern A2L equipment + IRA tax credits typically wins economically vs retrofit + continued operation.",
  },
  {
    q: "When should I replace my HVAC equipment vs repair it?",
    a: "Decision framework based on multiple factors: (1) Equipment age vs ASHRAE service life: residential AC + heat pumps typically 14-18 years; gas furnace 18-25 years; boiler 25-35 years. At >75% of expected service life, lean toward replacement. (2) 50% rule: if repair cost exceeds 50% of replacement cost, replace. This rule is simple but conservative; many contractors use 30-40% threshold for aging equipment. (3) $5,000 rule (some advisors): repair cost > $5,000 on residential equipment = replace. (4) Failure type: compressor failure on 10+ year old equipment = strong replacement lean. Capacitor / contactor / fan motor = repair almost always. Refrigerant leak in evaporator coil = decision based on system age. Cracked heat exchanger = replacement (safety + cost). (5) Refrigerant type: R-22 system with major failure = replace (R-22 reclaim is expensive + scarce). R-410A system with minor failure = repair OK. A2L system = newer, repair more often justified. (6) Efficiency upgrade economics: replacement of 12 SEER → 18 SEER2 typically saves 25-35% on cooling energy; payback varies 4-12 years depending on climate + electricity rate. (7) IRA tax credit availability: 25C credit ($2,000 for heat pumps) effectively reduces replacement cost. (8) Comfort + reliability concerns: older equipment with frequent breakdowns may justify replacement on quality-of-life grounds even if individual repair is cheap. Get multiple quotes; require ACCA Manual J load calculation for replacement sizing (resist contractor recommendations to swap same-tonnage equipment without calc).",
  },
  {
    q: "What IRA tax credits are available for HVAC upgrades?",
    a: "The Inflation Reduction Act of 2022 created multiple HVAC-relevant incentives, all administered through the IRS with specific certification requirements: (1) Section 25C Energy Efficient Home Improvement Credit — 30% of cost up to $2,000 for heat pumps (electric or natural gas); 30% of cost up to $600 for central AC + furnace; 30% up to $1,200 annual cap on overall building envelope improvements (windows, insulation, air sealing, doors); 30% up to $600 for high-efficiency furnace/boiler. Equipment must meet ENERGY STAR Most Efficient certification (often equates to top tier products from each manufacturer). Annual reset (claim each tax year separately). (2) Section 25D Residential Clean Energy Credit — 30% of cost with NO cap for: geothermal heat pumps, solar PV, solar thermal, wind, battery storage. Steps down: 30% through 2032, 26% in 2033, 22% in 2034, expires 2035. (3) HEEHRA (High-Efficiency Electric Home Rebate Act) — point-of-sale rebates administered by states: up to $8,000 for heat pump; $1,750 for heat pump water heater; $840 for electric clothes dryer; $4,000 for electrical panel upgrade; income-restricted (up to 80% Area Median Income = full rebate; 80-150% AMI = 50% rebate; above 150% AMI = no rebate). (4) HOMES (Home Owner Managing Energy Savings) — performance-based rebates up to $4,000 for 20% energy reduction, up to $8,000 for 35% reduction. Modeled or measured. State-administered with rolling availability. To claim: keep receipts + AHRI certificate; file Form 5695 with annual tax return; consult tax professional. State availability varies significantly — check your state energy office.",
  },
  {
    q: "Should I replace my gas furnace with a heat pump?",
    a: "Strong consideration in many climates, especially with IRA incentives — but several factors determine if it's the right move: (1) Climate zone: heat pumps work well in Climate Zones 1-5 (most of the US); Cold-Climate Heat Pumps (CCHP) extend capability into Zones 6-7 with significant capacity at 5°F outdoor temperature. Climate Zone 8 (Alaska, etc.) — heat pumps still possible but backup heating critical. (2) Existing fuel cost: natural gas is typically cheaper per BTU than electricity. Heat pump operating cost vs gas furnace depends on electricity rate, gas rate, and heat pump efficiency. Many regions: heat pump operating cost = gas furnace cost or slightly higher; with IRA credit, total cost over equipment life often favors heat pump. (3) Equipment age: replacing functional gas furnace with heat pump is harder economic case than replacing failing furnace. (4) Dual-fuel option: hybrid system uses heat pump for moderate temperatures, switches to gas furnace at balance point (~30°F typical). Best of both worlds — heat pump efficiency at moderate temps, gas backup at extreme cold. (5) Electrical capacity: heat pump requires 30-50 amp circuit; many older homes have 100 amp service that may need upgrade ($1,500-4,000). HEEHRA rebate covers some panel upgrade cost. (6) Refrigerant: new heat pumps install with A2L refrigerant (R-454B or R-32 typically); existing R-410A heat pumps still serviceable. (7) Performance assessment: get Manual J load calc + Manual S equipment selection; compare HSPF2 ratings at design conditions; verify cold-climate performance (some CCHPs maintain 100% capacity at 5°F, others drop to 60%). For homes with failing gas furnace + cooling system replacement need: dual-fuel heat pump often wins. For homes with reliable functioning gas furnace: depends on long-term electrification plans + payback tolerance.",
  },
  {
    q: "How long does HVAC equipment last? When should I expect to replace?",
    a: "Per ASHRAE 2019 ASHRAE Handbook (HVAC Applications) + manufacturer service life data: (1) Residential central air conditioner: 14-18 years typical; better installations + cooler climates extend life. (2) Residential heat pump: 14-16 years typical; heat pumps work harder than AC + run year-round. (3) Gas furnace: 18-25 years typical; 80% AFUE units may outlast modern 95% AFUE due to simpler design (no condensation, no inducer fan). (4) Gas boiler: 25-35 years typical; cast iron sectional boilers can last 40+ years with maintenance. (5) Ductless mini-split: 12-18 years for outdoor unit; indoor units often longer. (6) Geothermal heat pump: 18-25 years for indoor unit; ground loop (60-100 years). (7) Commercial rooftop unit: 15-20 years typical. (8) Ductwork: 30-50 years if non-flex; flex duct 10-20 years. (9) Water heater (electric tank): 10-15 years; (gas tank): 8-12 years; tankless: 20+ years. (10) Programmable/smart thermostat: 8-15 years. Many factors extend or shorten: maintenance frequency, climate severity, installation quality (oversized equipment short-cycles + wears faster), refrigerant type (R-22 systems aging out; R-410A common; A2L just entering market), filter changes, operation in moderate range vs extreme conditions. For comparison: equipment installed 2010 reaches typical service life around 2025-2028; installed 2015 around 2030-2033.",
  },
  {
    q: "Should I upgrade my insulation + air sealing before replacing HVAC?",
    a: "Almost always yes if the home has identifiable envelope problems. The Building Performance Institute (BPI), ENERGY STAR Home Performance, and ACCA Quality Installation principles all emphasize envelope-first methodology: (1) Reducing heating + cooling load via envelope improvements means smaller equipment, lower operating cost, and improved comfort. (2) Manual J load calculation that ignores envelope improvements oversizes equipment. (3) Air sealing typically pays back in 1-5 years; insulation 3-10 years; equipment replacement 8-15 years. Envelope-first improves the equipment economic case. The envelope-first sequence: (a) Blower Door test to identify air leakage (target: <3 ACH50 for new homes; <5 ACH50 for existing homes per IECC 2021 R402.4.1.2). (b) Air sealing: typically $1,500-5,000 for whole-house; 15-40% air leakage reduction common. (c) Insulation: attic insulation (R-49 to R-60 in most climates per IECC R402.1.2) often highest ROI; wall insulation harder to retrofit. (d) Window replacement: typically lowest ROI per dollar, but improves comfort + appearance. (e) Equipment replacement: now sized to the improved-envelope load. ENERGY STAR Home Performance with ENERGY STAR program provides certified contractors + energy audits that follow this sequence. IRA 25C credit covers envelope improvements (windows up to $600/year; doors $250 each, $500 max; insulation + air sealing $1,200/year — combined annual cap on 25C overall $1,200 except heat pumps which are separate $2,000). For homes with no apparent envelope issues (recent construction, well-insulated): equipment replacement-first is reasonable. For pre-1990 homes: envelope-first nearly always wins long-term.",
  },
  {
    q: "What's a Cold-Climate Heat Pump (CCHP)?",
    a: "Cold-Climate Heat Pump (CCHP) is a category of heat pump designed to maintain heating capacity + efficiency at low outdoor temperatures (typically rated at 5°F outdoor with significant heating output, vs standard heat pumps that lose 50%+ capacity at 5°F). CCHPs achieve this through: (1) Variable-speed compressor technology that can run at multiple speeds based on load. (2) Optimized refrigerant circuit design (vapor injection / EVI) that supercharges refrigerant flow at low temperatures. (3) Larger heat exchangers + improved frost management. (4) Refrigerants optimized for low-temperature performance. The DOE Cold-Climate Heat Pump Specification (administered through ENERGY STAR Most Efficient program) defines CCHPs as products meeting specific HSPF2 + low-temperature capacity criteria. Major manufacturers with CCHP products: Mitsubishi Electric (Hyper-Heat lineup), Daikin (LV-Series), Bosch (BHP cold climate), Lennox (XP25 + select models), Carrier (Infinity 24 + 19VS Greenspeed), Trane (XV20i + select models), Bryant. CCHPs typically cost 20-40% more than standard heat pumps but maintain heating capability into Climate Zones 6-7 (parts of Climate Zone 8 with backup). For homes in cold climates (Zone 5+), CCHPs are typically the right heat pump choice; for warmer climates, standard heat pumps are adequate + lower cost. Note: backup heating still important even with CCHP — emergency electric or dual-fuel gas backup for extreme cold events.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Retrofitting & Upgrades Guide — R-22 Phase-Out, A2L Transition, Heat Pump Conversion, IRA Credits, and Repair vs Replace Decision Matrix",
      description:
        "Complete HVAC retrofit + upgrade reference covering R-22 retrofit chemistry, AIM Act + R-410A → A2L transition, heat pump conversion, SEER2 efficiency upgrades, envelope-first methodology, repair vs replace decision framework, IRA tax credits, and ASHRAE service life data.",
      proficiencyLevel: "Beginner to Advanced",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "HVAC retrofit" },
        { "@type": "Thing", name: "R-22 phase out" },
        { "@type": "Thing", name: "A2L refrigerant transition" },
        { "@type": "Thing", name: "Heat pump retrofit" },
        { "@type": "Thing", name: "IRA HVAC tax credit" },
      ],
      keywords: [
        "hvac retrofit",
        "r-22 retrofit",
        "r-410a replacement",
        "a2l transition",
        "heat pump retrofit",
        "ira tax credit hvac",
        "repair vs replace hvac",
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
        { "@type": "ListItem", position: 3, name: "HVAC Retrofitting & Upgrades Guide" },
      ],
    },
  ];
}

export default function HvacRetrofittingUpgradesGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Retrofitting & Upgrades Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Retrofitting & Upgrades Guide — R-22 Phase-Out, R-410A → A2L Transition, Heat Pump Conversion, SEER2 Efficiency, IRA Tax Credits, and Repair vs Replace Decision Matrix
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            Complete HVAC retrofit + upgrade reference covering three concurrent transitions reshaping residential and commercial HVAC: the R-22 phase-out reality (EPA Section 605/606 + honest assessment of &quot;drop-in&quot; retrofit chemistry), the AIM Act R-410A → A2L manufacturing transition that took effect January 1, 2025 (40 CFR Part 84 — and the critical fact that existing R-410A equipment is NOT A2L-convertible), and the gas-to-electric heat pump conversion driven by IRA incentives + cold-climate heat pump technology. Plus efficiency upgrade economics (SEER2/HSPF2/AFUE2 per 10 CFR Part 430), envelope-first retrofit methodology per BPI/ENERGY STAR, the complete repair-vs-replace decision framework (age + refrigerant + failure type + 50% rule), full IRA Section 25C ($2,000 heat pump credit + $1,200 envelope cap) + Section 25D (30% uncapped for geothermal) + HEEHRA point-of-sale rebates + HOMES performance rebates per IRS guidance, ASHRAE service life benchmarks for 10 equipment categories, common retrofit failures + lessons learned, and a complete cost + payback methodology framework. Sourced throughout from EPA, IRS, ASHRAE 90.2, DOE 10 CFR Part 430, AHRI, ENERGY STAR.
          </p>

          <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50/60 p-4 dark:border-amber-700/60 dark:bg-amber-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Honesty notes for consumers.</strong> Three claims commonly made by HVAC contractors that this guide will correct: (1) &quot;You need to replace your R-410A system because R-410A is being phased out.&quot; — FALSE. R-410A is legal to service existing equipment indefinitely via reclaimed refrigerant. Equipment replacement is an economic choice, not a regulatory requirement. (2) &quot;We can convert your R-410A equipment to R-32 / R-454B.&quot; — GENERALLY FALSE for residential. R-410A equipment is not safety-listed for A2L use. Equipment replacement is the only typical path. (3) &quot;R-22 drop-in retrofits work seamlessly.&quot; — MISLEADING. R-22 retrofits require oil change, expansion valve replacement, filter-drier replacement, accept 10-20% capacity reduction, void manufacturer warranty, and shorten equipment life. The honest framing: retrofit is a maintenance bridge, not an upgrade.
            </p>
          </div>
        </header>

        {/* SECTION 01 — Retrofit landscape */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The retrofit landscape — what's actually changing
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Three concurrent transitions are reshaping residential and commercial HVAC. Understanding which is regulatory, which is economic, and which is voluntary is the foundation of any retrofit decision:
          </p>

          <ComparisonTable
            headers={["Transition", "Driver", "Timeline", "Affects"]}
            rows={[
              { label: "R-22 phase-out", cells: ["EPA Section 605/606 (Clean Air Act / Montreal Protocol)", "2010: new equipment ban; 2020: production ban; reclaim ongoing", "Pre-2010 residential AC + commercial refrigeration"] },
              { label: "R-410A → A2L manufacturing", cells: ["AIM Act 40 CFR Part 84 (HFC phase-down)", "January 1, 2025: new residential AC + heat pump manufacture must use GWP ≤700", "New equipment manufacture only; existing R-410A equipment unaffected for service"] },
              { label: "Gas → electric (heat pump)", cells: ["IRA tax credits + state electrification policies + climate", "2022-ongoing: voluntary economic decision", "Aging gas furnaces + cold climates with CCHP availability"] },
              { label: "Efficiency standards (SEER2/HSPF2/AFUE2)", cells: ["DOE 10 CFR Part 430 (2023 metric transition)", "January 2023: SEER2 minimums took effect; HSPF2 + AFUE2 followed", "All new residential equipment sold in US"] },
              { label: "Envelope improvements", cells: ["IRA + IECC code + voluntary energy upgrades", "2022-ongoing: voluntary", "Pre-1990 homes; underinsulated; leaky envelopes"] },
            ]}
          />

          <KeyInsight tone="blue" title="The retrofit decision hierarchy">
            For any equipment older than ~12 years, the retrofit decision converges to: replace with new equipment (typically A2L heat pump if climate-appropriate, or A2L AC + gas furnace where gas remains cost-competitive). For equipment 8-12 years old, the decision depends on refrigerant type (R-22 = lean toward replace; R-410A = lean toward repair) and failure mode (compressor = lean replace; capacitor = repair). For equipment under 8 years: repair almost always unless catastrophic failure. The AIM Act manufacturing transition doesn&apos;t change existing equipment economics — it only affects what&apos;s available to buy as replacement.
          </KeyInsight>
        </section>

        {/* SECTION 02 — Why retrofits happen */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Why retrofits happen — the four drivers
          </h2>

          <ol className="mt-3 list-decimal space-y-3 pl-6 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Equipment failure.</strong> Compressor failure, cracked heat exchanger, evaporator coil leak, or other major component failure forces a decision: pay for major repair or replace. This is the most common retrofit trigger. ASHRAE service life data (Section 12) provides the framework for evaluating remaining useful life.
            </li>
            <li>
              <strong>Regulatory / refrigerant transition.</strong> R-22 phase-out has been the primary regulatory driver for 15+ years. AIM Act + A2L transition is the next phase but affects new equipment manufacture, not existing equipment service. Few jurisdictions have mandated equipment replacement based on refrigerant type.
            </li>
            <li>
              <strong>Efficiency upgrade economics.</strong> Replacing 12 SEER (1990s-2000s equipment) with 18+ SEER2 modern equipment typically saves 25-40% on cooling energy. Combined with IRA tax credits, the economic case for proactive replacement is strong for older equipment.
            </li>
            <li>
              <strong>Electrification + comfort + fuel transition.</strong> Replacing gas furnace + AC with heat pump system addresses electrification policy, eliminates combustion safety risks (CO, gas leaks), and provides cooling in homes that didn&apos;t previously have it. IRA 25C credit ($2,000 for heat pump) reduces this transition cost substantially.
            </li>
          </ol>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            Most retrofits are driven by a combination of these factors. A 15-year-old R-22 AC with a compressor failure simultaneously triggers all four drivers: failure forces decision, R-22 retrofit is expensive + losing capacity, modern A2L equipment is more efficient, and heat pump upgrade may now be cost-effective vs gas furnace replacement.
          </p>
        </section>

        {/* SECTION 03 — R-22 phase-out */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            R-22 phase-out — the reality + retrofit chemistry
          </h2>

          <TechSection icon="insight" tone="blue" title="What's actually banned vs allowed">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>January 1, 2010 — EPA Section 605:</strong> ban on manufacture or import of HCFC R-22 equipment. New residential AC + heat pumps must use HFC alternatives (R-410A initially).</li>
              <li><strong>January 1, 2020 — EPA Section 606:</strong> ban on production + import of virgin R-22 refrigerant. Only reclaimed/recycled R-22 legally available.</li>
              <li><strong>Ongoing:</strong> R-22 reclamation + service of existing equipment is LEGAL indefinitely. EPA Section 608 governs handling. No federal mandate to replace existing R-22 equipment.</li>
              <li><strong>R-22 price escalation:</strong> reclaimed R-22 prices have risen substantially since phase-out — multiple times pre-phaseout cost per pound. This makes R-22 system repair (especially refrigerant top-up) increasingly expensive.</li>
            </ul>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="The 'drop-in' marketing problem">
            HVAC trade media and contractor marketing have promoted &quot;drop-in&quot; R-22 retrofits using R-407C, R-422D (Freezone), R-422B (Forane), R-417A (Isceon), and similar HFC blends. The reality of any R-22 to HFC retrofit:
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Oil change required.</strong> R-22 systems use mineral oil. HFC alternatives require POE (polyolester) oil. Multiple oil flushes typically needed to remove residual mineral oil. Some &quot;drop-in&quot; refrigerants claim mineral oil compatibility but performance suffers.</li>
              <li><strong>Expansion valve / metering device adjustment.</strong> TXV calibrated for R-22 won&apos;t optimize for retrofit refrigerant. Fixed orifice (capillary or piston) often requires replacement. Capacity drops if not addressed.</li>
              <li><strong>Filter-drier replacement.</strong> Existing drier may not be compatible with new refrigerant + POE oil. Replacement mandatory.</li>
              <li><strong>Capacity reduction.</strong> Most R-22 retrofits accept 10-20% cooling capacity reduction. Hot-day performance compromised.</li>
              <li><strong>Efficiency reduction.</strong> SEER rating typically drops 5-15% from original R-22 rating. Higher operating cost.</li>
              <li><strong>Manufacturer warranty void.</strong> Changing refrigerant typically voids any remaining warranty.</li>
              <li><strong>System longevity impact.</strong> Existing components were designed for R-22 pressures + oils. Retrofit operation can shorten useful life.</li>
            </ol>
          </TechSection>

          <ComparisonTable
            headers={["R-22 retrofit option", "GWP", "Pros", "Cons", "Best for"]}
            rows={[
              { label: "R-407C", cells: ["1774", "Closest pressure/capacity match to R-22; widely available", "Significant glide (~7°F) affects TXV operation; requires POE oil", "Most common drop-in choice"] },
              { label: "R-422D (Freezone / Forane)", cells: ["2729", "Lower glide than R-407C; some claim mineral oil compatibility", "Capacity reduction 8-12%; performance penalty", "Quick retrofit where minimal modifications desired"] },
              { label: "R-422B (Forane)", cells: ["2528", "Similar profile to R-422D; widely available", "Same capacity + efficiency penalties", "Alternative to R-422D"] },
              { label: "R-417A (Isceon)", cells: ["2346", "Designed for R-22 retrofit; lower glide", "Capacity drop 10-15%; not all manufacturers approve", "Where specifically recommended by manufacturer"] },
              { label: "Equipment replacement (R-410A or A2L)", cells: ["R-410A: 2088 / R-32: 675 / R-454B: 466", "New equipment + new warranty + full capacity + better efficiency + may qualify for IRA credit", "Higher upfront cost", "Equipment 12+ years old; major failure; efficiency upgrade desired"] },
            ]}
          />

          <FixCallout>
            <strong>The honest economic case:</strong> retrofitting R-22 with an HFC alternative costs $300-800 typically. R-22 reclaim now at multiple times pre-phaseout price. After paying for the retrofit, you have an aging system with reduced capacity, lower efficiency, voided warranty, and shorter remaining life — and you may face the same equipment-replacement decision in 2-5 years. For systems 12+ years old, replacement with new A2L equipment + IRA tax credit typically wins economically vs retrofit + continued operation. The HVAC contractor recommending &quot;just retrofit it&quot; for an aging system may be underestimating the true total cost of ownership.
          </FixCallout>
        </section>

        {/* SECTION 04 — AIM Act + R-410A transition */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            AIM Act + R-410A → A2L manufacturing transition
          </h2>

          <p className="text-zinc-700 dark:text-zinc-300">
            The American Innovation and Manufacturing (AIM) Act (15 USC 7675), codified in 40 CFR Part 84, mandates HFC phase-down on this schedule:
          </p>

          <ComparisonTable
            headers={["Date", "AIM Act provision"]}
            rows={[
              { label: "2024", cells: ["HFC production + import capped at 60% of 2011-2013 baseline"] },
              { label: "January 1, 2025", cells: ["Manufacturing transition: new residential AC + heat pump equipment must use refrigerants with GWP ≤700 (R-410A at GWP 2088 fails; R-32 at 675 and R-454B at 466 pass)"] },
              { label: "2029", cells: ["HFC production capped at 30% of baseline"] },
              { label: "2034", cells: ["HFC production capped at 20% of baseline"] },
              { label: "2036", cells: ["HFC production capped at 15% of baseline"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="What the manufacturing transition means in practice">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>New residential AC + heat pumps:</strong> manufactured after January 1, 2025 must use A2L refrigerants (R-32 or R-454B typically; some commercial systems use R-454C or others). All major manufacturers have transitioned their residential lineups.</li>
              <li><strong>R-410A inventory:</strong> equipment manufactured before January 1, 2025 can continue to be sold until inventory clears (typically through 2026); after that, only A2L equipment available new.</li>
              <li><strong>R-410A refrigerant for service:</strong> production capped + declining annually. Virgin R-410A prices rising; reclaim becoming standard. R-410A remains LEGAL to service existing equipment indefinitely under EPA Section 608.</li>
              <li><strong>A2L training:</strong> EPA Section 608 certification (one-time) covers A2L recovery. Some states adding A2L-specific training requirements.</li>
              <li><strong>A2L equipment safety:</strong> per UL 60335-2-40 + ASHRAE 15, A2L equipment must include specific safety features (refrigerant leak detection, ventilation, charge limits). Different from R-410A equipment design.</li>
            </ul>
          </TechSection>

          <VerdictBanner status="warn" title="R-410A → A2L is NOT a retrofit">
            Existing R-410A equipment cannot be safely converted to R-32 or R-454B. The equipment safety design (per UL 60335-2-40 + ASHRAE Standard 15) differs substantially: A2L equipment requires refrigerant leak detection systems, ventilation interlocks, charge limits, specific service valve design, and ignition-source isolation. R-410A equipment was not designed, tested, or listed for A2L use. Converting would void UL listing, void warranty, and create fire/safety risk. The path forward for R-410A equipment: continue servicing with reclaimed R-410A through useful life, then replace with new A2L equipment when economics warrant.
          </VerdictBanner>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For the complete refrigerant transition framework, see <Link href="/refrigerant-comparison-guide/" className="underline">refrigerant comparison guide</Link>. For A2L safety, see <Link href="/refrigerant-safety-classifications/" className="underline">ASHRAE 34 classifications</Link>.
          </p>
        </section>

        {/* SECTION 05 — Heat pump retrofit */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Heat pump retrofit — fuel transition + cold climate + electrical
          </h2>

          <ComparisonTable
            headers={["Climate zone", "Heat pump strategy", "Backup heating recommendation"]}
            rows={[
              { label: "1-3 (warm, ~southern US)", cells: ["Standard heat pump adequate", "Electric resistance strip 5-10 kW typical"] },
              { label: "4 (mixed, central US)", cells: ["Standard heat pump; consider variable-speed for dual-fuel option", "Electric resistance OR existing gas furnace as backup"] },
              { label: "5 (cool, northern US)", cells: ["Cold-Climate Heat Pump (CCHP) recommended", "Existing gas furnace (dual-fuel) OR larger electric resistance backup"] },
              { label: "6 (cold)", cells: ["CCHP required for primary heating; size carefully", "Dual-fuel typically required; gas furnace at balance point (~30°F)"] },
              { label: "7 (very cold)", cells: ["CCHP only with high-efficiency unit + careful sizing", "Backup heat mandatory; gas + electric resistance both common"] },
              { label: "8 (subarctic, Alaska)", cells: ["CCHP feasible but supplemental heat critical", "Primary heat from gas/oil/wood; heat pump for shoulder seasons"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="Retrofit considerations beyond capacity sizing">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Electrical service capacity.</strong> Heat pump (especially with electric backup) requires 30-50A circuit. Many older homes have 100A service; replacement may need 200A panel upgrade ($1,500-4,000). HEEHRA covers up to $4,000 of panel upgrade for qualifying incomes.</li>
              <li><strong>Refrigerant lineset.</strong> R-410A linesets are compatible with R-454B + R-32 (similar pressures). Existing line set typically reusable if proper size for new equipment + properly evacuated. Some installations require larger line set for variable-capacity equipment.</li>
              <li><strong>Air handler / blower upgrade.</strong> Variable-capacity heat pumps require variable-speed ECM blower; old PSC blower won&apos;t match. Air handler often replaced with equipment.</li>
              <li><strong>Ductwork.</strong> Existing ductwork sized for old system airflow. Heat pump airflow per ton (CFM/ton) often different from AC + furnace; ductwork resize may be needed.</li>
              <li><strong>Thermostat.</strong> Heat pump requires dedicated heat pump thermostat (or compatible smart thermostat) with proper staging logic for compressor + backup heat.</li>
              <li><strong>Manual J load calc.</strong> Don&apos;t assume same tonnage as old system — many older systems were oversized. Right-sized heat pump may be smaller than equipment being replaced (especially with envelope improvements).</li>
            </ul>
          </TechSection>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            See <Link href="/hvac-load-calculator/" className="underline">HVAC load calculator</Link> for Manual J cooling + heating load calculation. See <Link href="/hvac-energy-efficiency-guide/" className="underline">energy efficiency guide</Link> for heat pump performance + cost economics.
          </p>
        </section>

        {/* SECTION 06 — Efficiency retrofit */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Efficiency upgrade — SEER2/HSPF2/AFUE2 + variable capacity
          </h2>

          <ComparisonTable
            headers={["Era / Era SEER", "Modern equivalent", "Typical energy savings", "Notes"]}
            rows={[
              { label: "1990s (SEER 8-10)", cells: ["18-22 SEER2", "40-55% cooling energy reduction", "Often combined with capacity downsize from oversized 1990s equipment"] },
              { label: "2000-2014 (SEER 13-14)", cells: ["18-22 SEER2", "25-40% cooling energy reduction", "Most common 'aging out' equipment category"] },
              { label: "2015-2022 (SEER 14-16)", cells: ["18-22 SEER2", "15-25% cooling energy reduction", "Smaller economic case; replace if failing"] },
              { label: "2023+ (SEER2 14-15)", cells: ["18-22 SEER2", "5-15% cooling energy reduction", "Small efficiency case; replace if failing"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            Variable-capacity heat pumps (continuously modulating compressor) provide additional benefits beyond rated efficiency improvement: better humidity control, longer runtime at low load (more even temperatures), quieter operation, and reduced cycling wear. Real-world energy savings typically exceed rated improvement for variable-capacity equipment.
          </p>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For DOE 2023 metric transition (SEER → SEER2; HSPF → HSPF2; AFUE → AFUE2), see <Link href="/hvac-energy-efficiency-guide/" className="underline">energy efficiency guide</Link>. The transition lowered the efficiency-test results vs the old standards by ~5-7% — equipment rated at the same physical performance shows lower SEER2 numbers than the old SEER ratings. This is a methodology change, not a real efficiency change.
          </p>
        </section>

        {/* SECTION 07 — Envelope retrofit */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Envelope-first retrofit methodology
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Building Performance Institute (BPI), ENERGY STAR Home Performance, and ACCA Quality Installation principles all emphasize envelope-first methodology: reduce heating + cooling load via envelope improvements before sizing equipment. The sequence:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Energy audit + Blower Door test.</strong> Quantify existing air leakage (target: &lt;5 ACH50 for existing homes; &lt;3 ACH50 for new construction per IECC R402.4.1.2). Identify thermal bridging via thermal imaging. Document existing insulation R-values.
            </li>
            <li>
              <strong>Air sealing.</strong> Caulk + foam + weatherstrip leakage paths. Targets: penetrations through walls + ceilings, attic floor at top plates, basement rim joists, around windows + doors, electrical outlets on exterior walls. Cost: $1,500-5,000 typical for whole-house; 15-40% leakage reduction. Payback: 1-5 years typically.
            </li>
            <li>
              <strong>Attic insulation.</strong> Add insulation to IECC R-49 to R-60 levels (varies by climate). Often the highest-ROI envelope improvement. Cost: $2,000-5,000 for typical attic; payback 3-8 years.
            </li>
            <li>
              <strong>Wall insulation (where feasible).</strong> Hard to retrofit in finished walls. Options: blown cellulose (low cost, modest performance), spray foam (higher cost, better performance), exterior insulation during siding replacement.
            </li>
            <li>
              <strong>Basement / crawlspace insulation.</strong> Often overlooked but high impact in cold climates. Foam board on basement walls (R-10+); spray foam in crawlspace rim joists + walls.
            </li>
            <li>
              <strong>Window replacement.</strong> Typically lowest ROI per dollar but improves comfort + aesthetics. ENERGY STAR rated; U-factor + SHGC vary by climate. Cost: $400-1,500 per window; payback 15+ years (often longer than window lifespan).
            </li>
            <li>
              <strong>Equipment replacement (after envelope work).</strong> Run new Manual J load calc with improved envelope; resize equipment accordingly. Pre-envelope equipment was likely oversized; post-envelope equipment typically smaller (lower cost; better dehumidification).
            </li>
          </ol>

          <KeyInsight tone="blue" title="Why envelope-first matters financially">
            Air sealing + attic insulation typically pay back in 2-6 years. Equipment replacement pays back 8-15 years. By doing envelope work first: (1) Equipment replacement Manual J load is lower → smaller equipment → lower cost. (2) Operating cost on new equipment is lower (less heating + cooling needed). (3) Comfort improves immediately from envelope work; equipment improvement adds capacity + efficiency on top.
          </KeyInsight>
        </section>

        {/* SECTION 08 — Repair vs Replace decision matrix */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Repair vs Replace decision framework
          </h2>

          <ComparisonTable
            headers={["Factor", "Lean repair", "Lean replace"]}
            rows={[
              { label: "Equipment age", cells: ["< 10 years", "> 15 years (or > 75% expected service life)"] },
              { label: "Refrigerant type", cells: ["R-410A (still cheap), A2L (new)", "R-22 (expensive + scarce)"] },
              { label: "Repair vs replace cost ratio", cells: ["< 30% (repair small fraction of replace)", "> 50% (repair significant fraction of replace)"] },
              { label: "Compressor failure", cells: ["—", "Major component; bad omen for system longevity"] },
              { label: "Capacitor / contactor / fan motor", cells: ["YES — cheap repair, common failure", "—"] },
              { label: "Cracked heat exchanger", cells: ["—", "Safety risk (CO); replacement mandatory regardless of cost"] },
              { label: "Refrigerant leak in evaporator coil", cells: ["If accessible + recent equipment", "If coil access difficult or aging equipment"] },
              { label: "Multiple recent failures", cells: ["—", "Pattern of failure indicates broader degradation"] },
              { label: "Comfort / capacity issues", cells: ["—", "If equipment can't meet load (oversized/undersized for actual use)"] },
              { label: "Efficiency upgrade opportunity", cells: ["—", "If new equipment SEER2 ≥18 + IRA credit available"] },
              { label: "Pre-1990 home (likely envelope opportunity)", cells: ["—", "If envelope retrofit + new equipment makes sense as bundle"] },
              { label: "Imminent system needs (cooling-only home + electrification)", cells: ["—", "If home doesn't have cooling + wants it; heat pump retrofit"] },
              { label: "Budget constraint", cells: ["YES — repair is short-term capital", "—"] },
            ]}
          />

          <FixCallout>
            <strong>Common rules of thumb (use as starting point, not absolute):</strong> (1) The 50% rule — if repair cost is &gt; 50% of replacement, replace. (2) The 100% rule — replace anything completely failed on 15+ year equipment. (3) The $5,000 rule — repair cost over $5,000 = replace on residential. (4) The remaining life rule — if expected remaining life is &lt; 5 years and repair extends it &lt; 3 years, replace. (5) The bundled-cost rule — combine refrigerant replacement, capacity upgrade, AND IRA credits when evaluating replacement.
          </FixCallout>
        </section>

        {/* SECTION 09 — IRA tax credits + rebates */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            IRA tax credits + rebates — Section 25C, 25D, HEEHRA, HOMES
          </h2>

          <ComparisonTable
            headers={["Program", "Section / source", "What's covered", "Maximum benefit", "Income limit"]}
            rows={[
              { label: "Section 25C Energy Efficient Home Improvement Credit", cells: ["IRC 25C (IRS Form 5695)", "Heat pumps (electric or gas); central AC; gas furnace; boiler; biomass stove", "$2,000 heat pump (annual); $600 each AC + furnace; $1,200 annual envelope cap; $1,200 annual non-HP equipment cap (combined)", "None (any income)"] },
              { label: "Section 25C envelope improvements", cells: ["IRC 25C (IRS Form 5695)", "Insulation, air sealing, windows, doors, energy audits", "Within $1,200 annual cap: $600 windows; $500 doors ($250 each); insulation/air sealing $1,200; energy audit $150", "None"] },
              { label: "Section 25D Residential Clean Energy Credit", cells: ["IRC 25D (IRS Form 5695)", "Geothermal heat pumps; solar PV; solar thermal; wind; battery storage", "30% of cost; NO cap; steps down: 30% through 2032, 26% in 2033, 22% in 2034", "None"] },
              { label: "HEEHRA (High-Efficiency Electric Home Rebate)", cells: ["IRA Section 50122; state-administered", "Heat pump $8,000; heat pump water heater $1,750; electric clothes dryer $840; electric panel $4,000; insulation $1,600; wiring $2,500", "$14,000 total per household", "≤80% AMI = 100% rebate; 80-150% AMI = 50% rebate; >150% AMI = 0%"] },
              { label: "HOMES (Home Owner Managing Energy Savings)", cells: ["IRA Section 50121; state-administered", "Performance-based rebates for modeled OR measured energy reduction", "$4,000 for 20% reduction; $8,000 for 35% reduction", "Increased benefits for low-income (up to $8K and $16K)"] },
            ]}
          />

          <KeyInsight tone="blue" title="How to claim the credits">
            <strong>Section 25C / 25D:</strong> file IRS Form 5695 with annual tax return; keep AHRI certificate + receipts for documentation. Credits reduce tax liability dollar-for-dollar but generally are not refundable (no refund beyond tax owed). Credits reset each tax year. <strong>HEEHRA / HOMES:</strong> state-administered point-of-sale rebates; check your state energy office for availability + how to apply (rolling rollout through 2025-2027 with state-by-state variation). For comprehensive guidance, consult a tax professional + your state energy office. ENERGY STAR website maintains current eligible equipment lists.
          </KeyInsight>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For the complete heat pump efficiency framework + IRA credit context, see <Link href="/hvac-energy-efficiency-guide/" className="underline">energy efficiency guide</Link>.
          </p>
        </section>

        {/* SECTION 10 — Cost framework */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Cost + payback methodology framework
          </h2>

          <ComparisonTable
            headers={["Retrofit type", "Equipment + install cost range", "Annual operating cost change", "Payback range"]}
            rows={[
              { label: "R-22 retrofit to HFC", cells: ["$300-800", "Increase 5-15% (lower efficiency)", "Negative ROI — bridge maintenance"] },
              { label: "R-410A AC replacement (14 SEER → 18 SEER2)", cells: ["$6,000-12,000", "Decrease 20-30%", "8-14 years"] },
              { label: "R-410A AC replacement (14 SEER → 22 SEER2 variable)", cells: ["$8,000-16,000", "Decrease 30-40%", "10-15 years"] },
              { label: "Gas furnace + AC → heat pump (entire replacement)", cells: ["$10,000-20,000", "Variable — depends on electricity vs gas rates", "8-20 years (highly regional)"] },
              { label: "Gas furnace + AC → dual-fuel heat pump", cells: ["$12,000-22,000", "Decrease 10-25%", "10-18 years"] },
              { label: "Heat pump retrofit only (existing AC + add heat pump)", cells: ["$5,000-10,000", "Variable", "Highly variable"] },
              { label: "Cold-Climate Heat Pump for cold-zone home", cells: ["$10,000-20,000+", "Decrease vs electric resistance backup; variable vs gas", "8-15 years"] },
              { label: "Geothermal heat pump (with 25D 30% credit)", cells: ["$15,000-35,000 (before 30% credit)", "Decrease 40-60%", "10-20 years"] },
              { label: "Envelope retrofit (air sealing + attic insulation)", cells: ["$3,000-8,000", "Decrease 10-25%", "2-6 years"] },
              { label: "Window replacement (typical home)", cells: ["$6,000-15,000+", "Decrease 5-10%", "15+ years (often longer than window lifespan)"] },
              { label: "Smart thermostat", cells: ["$200-400", "Decrease 3-8%", "1-3 years"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>Payback calculation:</strong> (Equipment cost + installation cost) − (IRA tax credits + state rebates) ÷ Annual operating cost savings = Payback period in years. Local factors that shift payback substantially: electricity rate ($/kWh), natural gas rate ($/therm), local climate severity, home occupancy + thermostat setpoints, equipment efficiency rating, installation quality (commissioning matters).
          </p>
        </section>

        {/* SECTION 11 — Common retrofit failures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Common retrofit failures + lessons learned
          </h2>

          <ul className="mt-3 space-y-3 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Skipping the Manual J load calc.</strong> Replacement contractor matches existing tonnage instead of calculating actual load. Result: oversized equipment that short-cycles, fails to dehumidify, wears prematurely. Solution: insist on ACCA Manual J + S for any replacement. See our <Link href="/hvac-load-calculator/" className="underline">load calculator</Link>.
            </li>
            <li>
              <strong>R-22 retrofit performed without addressing oil + expansion device.</strong> Refrigerant change alone without oil flush + TXV adjustment leads to early compressor failure + capacity reduction. Solution: hire contractor with documented R-22 retrofit experience; require written retrofit plan.
            </li>
            <li>
              <strong>Heat pump installation without backup heat capacity verification.</strong> Cold-climate retrofit installed without sufficient backup heat (electric strip + dual-fuel option); homeowner experiences uncomfortable conditions during extreme cold. Solution: verify CCHP capability at design temperature; size backup heat for emergency conditions.
            </li>
            <li>
              <strong>Equipment replacement without ductwork inspection.</strong> New equipment installed on undersized or leaky existing ductwork. Result: airflow problems, capacity reduction, efficiency loss. Solution: include Duct Blaster leakage test + duct sizing review in replacement scope. See our <Link href="/hvac-duct-design-guide/" className="underline">duct design guide</Link>.
            </li>
            <li>
              <strong>Envelope improvements without Blower Door retest.</strong> Air sealing + insulation work performed but completion not verified with Blower Door test. Without verification: contractor + homeowner don&apos;t know if work achieved expected leakage reduction. Solution: pre + post-work Blower Door testing as part of envelope retrofit scope.
            </li>
            <li>
              <strong>IRA credit documentation incomplete.</strong> Equipment installed but AHRI certificate not requested + saved; homeowner cannot claim credit at tax time. Solution: require AHRI certificate from contractor at installation + save with equipment documentation; verify ENERGY STAR Most Efficient compliance for 25C credit.
            </li>
            <li>
              <strong>Electrical service not upgraded for heat pump.</strong> Heat pump installed on 100A service that&apos;s already near capacity; nuisance trips + premature electrical fatigue. Solution: have electrician evaluate service capacity before installation; budget for 200A panel upgrade if needed (HEEHRA may cover).
            </li>
          </ul>
        </section>

        {/* SECTION 12 — Service life */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            ASHRAE equipment service life benchmarks
          </h2>

          <ComparisonTable
            headers={["Equipment type", "Typical service life", "Factors that extend / shorten"]}
            rows={[
              { label: "Residential central AC", cells: ["14-18 years", "Cool climate + good maintenance + proper sizing extends; hot climate + neglect + oversizing shortens"] },
              { label: "Residential heat pump", cells: ["14-16 years", "Year-round operation; sizing accuracy matters; cold climate adds wear"] },
              { label: "Gas furnace (80% AFUE)", cells: ["18-25 years", "Simple combustion; few moving parts; mild operating conditions"] },
              { label: "Gas furnace (90%+ AFUE condensing)", cells: ["15-22 years", "Acidic condensate + complex controls; quality of installation matters"] },
              { label: "Gas boiler (cast iron)", cells: ["25-35 years", "Many last 40+ years with maintenance; pump + circulator replacement at 15-20"] },
              { label: "Gas boiler (modern condensing)", cells: ["15-22 years", "Acidic condensate + heat exchanger wear; like condensing furnace"] },
              { label: "Ductless mini-split", cells: ["12-18 years", "Outdoor unit shorter life; indoor units often last longer — see our ductless mini-split guide"] },
              { label: "Geothermal heat pump (indoor)", cells: ["18-25 years", "Indoor unit similar to standard heat pump"] },
              { label: "Geothermal heat pump (ground loop)", cells: ["60-100 years", "Effectively permanent if installation quality is good"] },
              { label: "Commercial rooftop unit (RTU)", cells: ["15-20 years", "Heavier duty + harsher conditions; maintenance critical"] },
              { label: "Water heater (electric tank)", cells: ["10-15 years", "Anode rod replacement extends; water hardness shortens"] },
              { label: "Water heater (gas tank)", cells: ["8-12 years", "Burner + tank shorter than electric due to combustion stress"] },
              { label: "Water heater (tankless)", cells: ["20+ years", "Periodic descaling required; longer life than tank"] },
              { label: "Water heater (heat pump)", cells: ["13-15 years", "Refrigerant circuit similar to other heat pumps"] },
              { label: "Ductwork (metal)", cells: ["30-50+ years", "Permanent if not damaged; sealant + insulation may need replacement"] },
              { label: "Ductwork (flex)", cells: ["10-20 years", "Plastic + insulation degrade; replacement common at 15-25 years"] },
              { label: "Programmable / smart thermostat", cells: ["8-15 years", "Electronics lifespan; battery replacement extends some models"] },
            ]}
          />
        </section>

        {/* SECTION 13 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
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

        {/* SECTION 14 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>EPA + refrigerant regulation:</strong> 40 CFR Part 82 Subpart F (EPA Section 608 — refrigerant management). EPA Section 605 + 606 (HCFC R-22 phase-out per Clean Air Act). 40 CFR Part 84 (AIM Act HFC phase-down; signed December 2020; implementing regulations effective 2022-2036). DOE Cold-Climate Heat Pump Specification (administered through ENERGY STAR).
            </p>
            <p className="mt-3">
              <strong>IRS + tax credits:</strong> Internal Revenue Code Section 25C (Energy Efficient Home Improvement Credit — IRS Form 5695). Section 25D (Residential Clean Energy Credit — same form, separate sections). IRS Notice 2024-30 (clarifications on 25C eligibility). IRS Publication 530 (Tax Information for Homeowners).
            </p>
            <p className="mt-3">
              <strong>IRA rebate programs:</strong> Inflation Reduction Act of 2022 Section 50121 (HOMES). Section 50122 (HEEHRA). State-administered (search &quot;[state name] DOE rebate&quot; for state-specific availability + how to apply). DOE Building Technologies Office maintains program coordination.
            </p>
            <p className="mt-3">
              <strong>DOE + efficiency standards:</strong> 10 CFR Part 430 (Energy Conservation Program for Consumer Products — residential AC, heat pump, furnace minimum efficiency standards). DOE 2023 SEER2/HSPF2/AFUE2 metric transition (Final Rule). ENERGY STAR program (ENERGY STAR Most Efficient certification for 25C credit qualification).
            </p>
            <p className="mt-3">
              <strong>ASHRAE standards:</strong> ASHRAE 2019 ASHRAE Handbook (HVAC Applications) Chapter 38 (Owning and Operating Costs — service life data). ANSI/ASHRAE Standard 90.1-2022 (Commercial Energy Standard). ANSI/ASHRAE Standard 90.2-2024 (Residential Energy Standard). ANSI/ASHRAE Standard 62.2-2022 (residential ventilation — relevant to retrofit envelope work).
            </p>
            <p className="mt-3">
              <strong>Building code + envelope:</strong> International Energy Conservation Code (IECC) 2021 R402 (Envelope) + R403 (Mechanical). IECC R402.4.1.2 (Air leakage testing). RESNET MINHERS Standards (HERS Index). ENERGY STAR Single-Family New Homes v3.2 (envelope + commissioning standards).
            </p>
            <p className="mt-3">
              <strong>Industry organizations:</strong> ACCA (Air Conditioning Contractors of America) — Manuals J + S + D + T; Quality Installation Standard 5. AHRI (Air-Conditioning, Heating, and Refrigeration Institute) — equipment performance certification + AHRI Directory. BPI (Building Performance Institute) — Building Analyst + Envelope Professional certifications. ENERGY STAR Home Performance with ENERGY STAR program.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific equipment pricing or contractor quotes (highly regional; check 3 contractors minimum). State-specific HEEHRA + HOMES program details (state-by-state rollout; check state energy office). Tax-specific guidance (consult tax professional; IRS publications take precedence). Specific refrigerant pricing (changes weekly; see our <Link href="/refrigerant-prices-guide/" className="underline">refrigerant prices guide</Link> for the regulatory framework + sourcing mechanism, not spot prices). Manufacturer-specific equipment recommendations (focus on ENERGY STAR + AHRI certification, not brand).
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related guides + calculators</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><ArrowUpRight className="h-4 w-4" /> Energy Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2/AFUE2 deep dive + IRA credit framework.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Calculator className="h-4 w-4 text-blue-600" /> HVAC Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J calc — essential for retrofit equipment sizing.</p>
            </Link>
            <Link href="/refrigerant-comparison-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Snowflake className="h-4 w-4 text-blue-600" /> Refrigerant Comparison Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A1/A2L safety + GWP + retrofit compatibility framework.</p>
            </Link>
            <Link href="/refrigerant-retrofit-compatibility-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Retrofit Compatibility Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Quick lookup of refrigerant retrofit feasibility.</p>
            </Link>
            <Link href="/hvac-refrigerant-recovery-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> Refrigerant Recovery Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">EPA 608 procedure for retrofit + replacement work.</p>
            </Link>
            <Link href="/hvac-system-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> System Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Complete ACCA Manual cascade for replacement equipment design.</p>
            </Link>
            <Link href="/hvac-ductless-mini-split-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Snowflake className="h-4 w-4 text-blue-600" /> Ductless Mini-Split Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cold-climate mini-splits + A2L + multi-zone — common heat pump retrofit choice.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

void [Activity, Wrench, Zap, Thermometer, Wind, Flame, ListChecks, FileCheck, Lookups, Panel, ServiceProblem];
