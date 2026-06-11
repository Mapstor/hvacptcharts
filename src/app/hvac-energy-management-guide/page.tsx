import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Wrench, Zap, Wind, Gauge, BarChart3, TrendingUp, LineChart, Building2, Calculator } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-energy-management-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Energy Management Guide — Auditing, Benchmarking, RCx, FDD, M&V, Building Performance Standards",
  description:
    "Complete energy management methodology for HVAC operations: ASHRAE Standard 211 audit framework (Level I/II/III), ENERGY STAR Portfolio Manager benchmarking per Standard 105, utility rate structure (kWh + kW + TOU + demand charges + ratchets), retrocommissioning + monitoring-based commissioning (MBCx), fault detection + diagnostics (FDD), measurement + verification per IPMVP (Options A/B/C/D), submetering + advanced metering, demand response programs, the rated-vs-operational performance gap, ASHRAE Standard 100 + ISO 50001 frameworks, Building Performance Standards (NYC Local Law 97, Boston BERDO, Seattle BAPS, Washington CBPS, Maryland BEPS), energy data analysis methodology. Sourced from ASHRAE, IPMVP, ENERGY STAR, ISO 50001, DOE FEMP.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Energy Management Guide — Auditing + Benchmarking + RCx + FDD + M&V + BPS",
    description: "Complete operational energy management methodology — distinct from equipment efficiency.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Energy Management Guide — Operations + Verification + Compliance",
    description: "ASHRAE audit framework, IPMVP M&V, Building Performance Standards.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the difference between energy efficiency and energy management?",
    a: "Energy efficiency = how good the equipment is (SEER2, HSPF2, AFUE2 ratings; insulation R-values; window U-factors). Energy management = how the building is operated, measured, and optimized over time. Efficiency is set at design + installation; management is an ongoing operational discipline. Examples of efficiency: choosing a 22 SEER2 heat pump over a 14 SEER2 unit; installing R-49 attic insulation vs R-30. Examples of management: setting up ENERGY STAR Portfolio Manager benchmarking; running annual retrocommissioning to find drift; implementing fault detection algorithms on building automation system; optimizing chilled water reset schedules; participating in demand response programs; tracking actual kWh use vs design budget. Why the distinction matters: a building with very efficient equipment can still have terrible energy performance if poorly operated (oversized equipment short-cycles, controls drift over time, occupants override setbacks, scheduled equipment runs 24/7 in error). The performance gap between rated efficiency and operational efficiency is typically 20-40% for commercial buildings — far larger than the equipment efficiency gain from one rating to the next. For most existing buildings, management improvements deliver more energy savings + faster payback than equipment replacement. For new buildings, both matter equally.",
  },
  {
    q: "What's an ASHRAE Standard 211 Level I, II, or III audit?",
    a: "ASHRAE Standard 211 (Standard for Commercial Building Energy Audits, 2018) defines three audit levels with increasing depth and cost: (1) Level I — Walkthrough Audit: brief survey identifying obvious energy waste + no-cost / low-cost measures. Typical cost: $0.02-0.05/sq ft. Includes utility bill analysis (12-24 months), building walkthrough, ENERGY STAR Portfolio Manager benchmarking, identification of conservation opportunities. Output: list of low-cost measures + recommendations for deeper analysis. Time: 1-3 days for a typical commercial building. (2) Level II — Energy Survey and Analysis: detailed analysis of energy-using systems + identification of measures with savings + cost estimates + simple paybacks. Typical cost: $0.05-0.20/sq ft. Includes system-by-system analysis (HVAC, lighting, envelope, plug loads), engineering calculations, ROI for each measure, owner-presentable report. Time: 2-6 weeks for typical commercial building. (3) Level III — Detailed Analysis of Capital-Intensive Modifications: building simulation modeling for capital-intensive ECMs (energy conservation measures); rigorous engineering analysis; complete cost engineering; M&V plan for verification. Typical cost: $0.20-1.00+/sq ft. Required for major capital decisions (chiller plant replacement, building envelope retrofits, control system upgrades). Time: 2-6 months. For most commercial buildings, Level II is the workhorse — sufficient detail for actionable recommendations without the cost of full simulation modeling. Level I is the starting point for portfolio-wide assessment. Level III is reserved for major capital decisions where rigorous engineering justifies the cost.",
  },
  {
    q: "How does ENERGY STAR Portfolio Manager work?",
    a: "ENERGY STAR Portfolio Manager (managed by EPA + ENERGY STAR for Buildings) is the free online tool used by 50%+ of US commercial floor space for energy benchmarking. Process: (1) Create account at portfoliomanager.energystar.gov. (2) Add building(s) with floor area + use type + operating characteristics (occupants, hours, computers, etc.). (3) Enter 12 months of utility bills (electricity, gas, steam, etc.). (4) Tool calculates Source EUI (Energy Use Intensity) in kBtu/sq ft. (5) Tool compares your building to a national database of similar buildings (controlled for size, climate, use type, occupancy). (6) Output: ENERGY STAR Score 1-100 (percentile rank of energy performance among peer buildings). Score 75+ = ENERGY STAR Certified eligible (top 25% of peers). The score is COMPARATIVE not absolute — a score of 80 means your building uses less energy than 80% of comparable buildings, but doesn't tell you exactly how much energy it uses. To certify (75+ score), professional engineer or registered architect must verify data + visit building. Certification valid 1 year; must recertify annually with updated 12-month data. Many cities + states use Portfolio Manager scores for Building Performance Standards compliance. Property classes available: office, K-12 school, hotel, hospital, warehouse, retail, multifamily, more — each with specific peer-group statistical models. ENERGY STAR Portfolio Manager Standard Methodology document explains the statistical methodology in detail.",
  },
  {
    q: "What's the difference between retrocommissioning (RCx) and continuous commissioning?",
    a: "All three are post-occupancy commissioning processes but differ in scope + cadence: (1) Retrocommissioning (RCx) is a one-time process applied to existing buildings to optimize current performance. Process: investigate current system operation, identify deficiencies + drift from design intent, implement low-cost corrections (control sequence adjustments, sensor calibration, setpoint tuning, scheduling fixes), verify improvements. Typical cost: $0.10-0.30/sq ft. Typical savings: 5-15% of HVAC energy consumption. Performed every 5-10 years on average commercial building. (2) Recommissioning (sometimes confused with RCx) is retrocommissioning on a building that was originally commissioned at construction. Different terminology, same process. (3) Continuous Commissioning (CCx) is an ongoing process of monitoring + adjusting system performance throughout building life. Requires building automation system (BAS) with detailed trending + alarm capability. Continuous oversight may include daily/weekly performance reviews, monthly tuning sessions, quarterly comprehensive analysis. Typical savings: 15-25% of HVAC energy. (4) Monitoring-Based Commissioning (MBCx) is a structured CCx approach using FDD software to automatically identify performance drift + opportunities. Software analyzes BAS trend data + flags faults; engineer reviews + addresses. Typical savings: 10-30% of HVAC energy with sustained engagement. For most existing buildings: start with RCx (one-time intervention to capture biggest opportunities); then implement MBCx (ongoing monitoring) to maintain performance. ASHRAE Guideline 0.2 + 1.5 cover commissioning process; Standard 202 covers commissioning process for existing buildings.",
  },
  {
    q: "How do utility demand charges work, and how do I reduce them?",
    a: "Commercial electricity bills typically include TWO charges based on use pattern: (1) Energy charge ($/kWh) based on total energy consumed; familiar to residential customers. (2) Demand charge ($/kW) based on PEAK demand during a measurement interval (typically 15 minutes). Demand charges typically $5-30/kW per month for commercial. The demand charge can be 30-50% of the total bill for medium-large commercial buildings. Example: 100 kW peak × $15/kW = $1,500/month demand charge regardless of when that peak occurs. Demand ratchet: many utilities use the highest peak in any month over the past 11-12 months as the billing demand for ALL months — so one bad afternoon can set bills for a year. Time-of-Use (TOU) rates add additional dimension: on-peak energy 2-5× off-peak rates; on-peak demand charges substantially higher than off-peak. Strategies to reduce demand charges: (1) Load shifting — pre-cool building before peak hours; use thermal storage; charge batteries at night. (2) Peak load monitoring — BAS or demand controller shed non-critical loads when approaching peak; common in commercial buildings. (3) Demand response participation — utility pays for reducing load during grid stress events. (4) Equipment cycling coordination — prevent multiple chillers/AC units from starting simultaneously. (5) Variable-frequency drives (VFDs) on motors — reduce inrush + allow modulation. (6) Optimize startup sequence — gradually bring equipment online vs simultaneous startup. For residential: most utilities don't charge demand for residential; only TOU rate spread between peak/off-peak. Smart thermostat can reduce TOU peak rates by pre-cooling.",
  },
  {
    q: "What's Fault Detection + Diagnostics (FDD) and is it worth implementing?",
    a: "Fault Detection + Diagnostics (FDD) is software analysis of building automation system (BAS) trend data to automatically identify equipment faults + control issues. FDD algorithms analyze: temperature setpoints vs measured values; equipment runtime vs schedule; chiller efficiency (kW/ton) vs expected; AHU outdoor air ratios; coil performance; valve operation; sensor accuracy; energy use patterns. Faults flagged include: stuck dampers, failed sensors, control loop oscillation, simultaneous heating + cooling, equipment running outside schedule, capacity issues, etc. Vendors include: CopperTree Analytics, Clockworks Analytics, Switch Automation, KGS Buildings, Tridium Niagara FDD, Honeywell Forge, Johnson Controls OpenBlue, Schneider EcoStruxure, Siemens Navigator. Costs: $0.05-0.15/sq ft annually for software + integration; engineering services for fault triage + resolution typically $0.10-0.30/sq ft annually. Typical savings: 5-15% of HVAC energy when actively managed (faults addressed within reasonable time). Common pitfall: FDD installed but flagged faults not addressed — software identifies opportunities but doesn't fix them. Resource commitment for engineering follow-up is essential. ROI evaluation: FDD pays back in 1-3 years for typical commercial building if engineering resources are committed to fault resolution. For small commercial (single building): manual review of monthly trend data may be cost-comparable to dedicated FDD software. For multi-building portfolio (3+ buildings): dedicated FDD software typically wins. ASHRAE Guideline 36 (High Performance Sequences of Operation) is the modern baseline; FDD verifies sequences are operating correctly.",
  },
  {
    q: "What's IPMVP and which Option should I use for measurement & verification?",
    a: "International Performance Measurement & Verification Protocol (IPMVP) is the global standard for measuring + verifying energy savings from efficiency projects. Published by Efficiency Valuation Organization (EVO); used by ESCOs, energy consultants, utility programs, and DOE FEMP. Four Options based on project scope + measurement approach: (1) Option A: Retrofit Isolation, Key Parameter Measurement. Measure the key variables that drive savings; estimate the rest. Example: lighting retrofit — measure wattage + operating hours; estimate baseline + post. Lowest cost; suitable for projects with predictable use patterns. (2) Option B: Retrofit Isolation, All Parameter Measurement. Continuously measure energy use of affected systems before + after. Example: chiller plant upgrade — submetering on chillers measures energy continuously. Moderate cost; suitable for major equipment changes. (3) Option C: Whole Facility. Compare whole-building utility bills before + after, with adjustment for weather + occupancy variables. Example: comprehensive energy retrofit — measure pre + post total utility bills. Lower cost; suitable for projects with savings >10% of total bill. (4) Option D: Calibrated Simulation. Use calibrated building energy model to estimate baseline; measure post-installation; compute savings as difference. Example: new construction efficiency upgrade — no baseline exists, so simulation provides counter-factual. Highest cost; suitable when no baseline available or savings are small fraction of total. Selection logic: small focused projects → Option A or B; whole-building projects with measurable savings → Option C; new construction or projects with no clean baseline → Option D. ASHRAE Guideline 14 provides complementary M&V methodology; FEMP M&V Guidelines support federal projects.",
  },
  {
    q: "What are Building Performance Standards (BPS) and which cities have them?",
    a: "Building Performance Standards (BPS) are local + state laws requiring existing buildings to meet energy performance targets, with escalating requirements over time. A response to the difficulty of regulating only new construction (which is 1-2% of building stock annually). Typical BPS structure: requires buildings above size threshold (typically 25,000-50,000 sq ft) to benchmark + report energy use annually; sets performance targets that ratchet down over time; imposes financial penalties for non-compliance or requires investment in efficiency improvements. Major US BPS programs: (1) NYC Local Law 97 (2019) — carbon caps on buildings >25,000 sq ft; first compliance period 2024-2029; penalty $268/ton CO2 over limit. (2) Boston BERDO 2.0 (Building Emissions Reduction and Disclosure Ordinance) — emissions targets for buildings 20,000+ sq ft with intermediate milestones to 2050 net zero. (3) Washington State Clean Buildings Performance Standard (CBPS) — applies to commercial buildings 50,000+ sq ft; EUI targets; compliance phased 2026-2031. (4) Maryland BEPS (Building Energy Performance Standard) — emissions targets for buildings 35,000+ sq ft; 2030 milestone. (5) Seattle Building Performance Standard — phased compliance 2026-2031. (6) Denver Energize Denver — buildings 25,000+ sq ft; performance targets. (7) Colorado Building Performance Standard (statewide) — building stock-wide emissions reduction. (8) DC BEPS — Building Energy Performance Standards for DC buildings. Many additional cities + states have proposed or enacted BPS: Chicago, Cambridge MA, Reno NV, Honolulu HI, more. Check your jurisdiction; building owners increasingly must understand local BPS requirements. Penalties for non-compliance typically substantial enough to drive investment.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Energy Management Guide — Auditing, Benchmarking, RCx, FDD, M&V, Demand Response, and Building Performance Standards",
      description:
        "Complete operational energy management methodology for HVAC: ASHRAE 211 audit framework, ENERGY STAR Portfolio Manager benchmarking, utility rate structure, retrocommissioning, fault detection, measurement & verification per IPMVP, demand response, performance gap, Building Performance Standards.",
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
        { "@type": "Thing", name: "energy management" },
        { "@type": "Thing", name: "energy auditing" },
        { "@type": "Thing", name: "ENERGY STAR Portfolio Manager" },
        { "@type": "Thing", name: "retrocommissioning" },
        { "@type": "Thing", name: "IPMVP" },
        { "@type": "Thing", name: "Building Performance Standards" },
      ],
      keywords: [
        "energy management",
        "energy audit",
        "energy star portfolio manager",
        "retrocommissioning",
        "ipmvp",
        "building performance standards",
        "demand response",
        "fault detection diagnostics",
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
        { "@type": "ListItem", position: 3, name: "HVAC Energy Management Guide" },
      ],
    },
  ];
}

export default function HvacEnergyManagementGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Energy Management Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Energy Management Guide — Energy Auditing, Benchmarking, Retrocommissioning, Fault Detection, Measurement & Verification, Demand Response, and Building Performance Standards
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            Complete operational energy management methodology for HVAC operations — distinct from equipment efficiency (rated SEER2/HSPF2/AFUE2) and from controls implementation (the BAS/protocols layer). This guide covers ASHRAE Standard 211 audit framework (Level I/II/III), ENERGY STAR Portfolio Manager benchmarking per ASHRAE Standard 105 + EPA methodology, utility rate structure deep dive (kWh + kW + Time-of-Use + demand charges + ratchets), retrocommissioning (RCx) + monitoring-based commissioning (MBCx) + continuous commissioning distinctions, fault detection and diagnostics (FDD) implementation, measurement and verification per IPMVP (Options A/B/C/D) + ASHRAE Guideline 14, submetering + advanced metering infrastructure, demand response program participation, the rated-vs-operational performance gap (typically 20-40%), ASHRAE Standard 100 + ISO 50001 energy management framework structures, the rapidly growing Building Performance Standards (BPS) regulatory landscape (NYC Local Law 97, Boston BERDO 2.0, Washington Clean Buildings Performance Standard, Maryland BEPS, Seattle BPS, Denver Energize Denver, Colorado BPS, DC BEPS), energy data analysis methodology, and residential energy management. Sourced throughout from ASHRAE Standards 100/105/211, ASHRAE Guidelines 14/36, IPMVP, ENERGY STAR, ISO 50001, DOE FEMP, and primary local BPS documents.
          </p>

          <div className="mt-5 rounded-xl border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Energy efficiency vs energy management — the critical distinction.</strong> Efficiency is how good the equipment is (set at design + installation). Management is how you operate, measure, and optimize over time. A building with very efficient equipment can still have terrible energy performance if poorly operated. For most existing buildings, management improvements deliver more savings + faster payback than equipment replacement. This guide focuses on management; see our <Link href="/hvac-energy-efficiency-guide/" className="underline">energy efficiency guide</Link> for equipment ratings.
            </p>
          </div>
        </header>

        {/* SECTION 01 — Energy management framework */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The energy management framework — what's actually different from efficiency
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Energy management is a continuous operational discipline. The methodology has six interrelated activities:
          </p>

          <ComparisonTable
            headers={["Activity", "What it answers", "Primary tool / framework", "Typical cadence"]}
            rows={[
              { label: "Benchmark", cells: ["How does my building compare to peers?", "ENERGY STAR Portfolio Manager + ASHRAE Standard 105", "Annual"] },
              { label: "Audit", cells: ["Where is my building wasting energy?", "ASHRAE Standard 211 (Level I/II/III)", "Every 3-7 years for major audits; ongoing for Level I monitoring"] },
              { label: "Optimize (initial)", cells: ["How do I capture immediate savings?", "Retrocommissioning (RCx) per ASHRAE Guideline 0.2 + Standard 202", "Every 5-10 years"] },
              { label: "Monitor (ongoing)", cells: ["Is performance maintaining over time?", "Fault Detection + Diagnostics (FDD) on BAS data", "Continuous (daily / weekly review)"] },
              { label: "Verify", cells: ["Did my efficiency project actually save what was promised?", "IPMVP + ASHRAE Guideline 14", "Per project, typically 1 year post-installation"] },
              { label: "Comply", cells: ["Am I meeting local + state energy regulations?", "Local Building Performance Standards (BPS) — NYC LL97, Boston BERDO, etc.", "Annual reporting + multi-year compliance milestones"] },
            ]}
          />

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <ProcessFlow
              title="6-step energy management framework — Benchmark → Audit → Optimize → Monitor → Verify → Comply"
              orientation="horizontal"
              steps={[
                { number: 1, title: "Benchmark", description: "ENERGY STAR Portfolio Manager. EUI vs peer buildings." },
                { number: 2, title: "Audit", description: "ASHRAE 211 Level I/II/III. Identify waste." },
                { number: 3, title: "Optimize", description: "Retrocommissioning. Capture immediate savings.", critical: true },
                { number: 4, title: "Monitor", description: "FDD on BAS data. Catch drift over time." },
                { number: 5, title: "Verify", description: "IPMVP M&V. Confirm savings persist." },
                { number: 6, title: "Comply", description: "BPS reporting. NYC LL97, Boston BERDO." },
              ]}
              caption="Energy management is a continuous loop. Most commercial buildings benchmark + audit (steps 1-2) but skip retrocommissioning (step 3) — leaving the largest savings unrealized. Building Performance Standards (step 6) are forcing adoption of all 6 steps."
            />
          </div>

          <KeyInsight tone="blue" title="The performance gap is real">
            ASHRAE + DOE + multiple academic studies consistently find that commercial buildings perform 20-40% worse in operation than design intent. Causes include: controls drift over time, setback overrides by occupants, scheduling errors, sensor failures, equipment degradation, occupancy changes not reflected in operation, simultaneous heating + cooling, etc. Energy management captures these losses; energy efficiency improvements alone don&apos;t.
          </KeyInsight>
        </section>

        {/* SECTION 02 — Energy auditing */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Energy auditing — ASHRAE Standard 211
          </h2>

          <ComparisonTable
            headers={["Audit level", "Scope", "Deliverable", "Typical cost", "Typical time"]}
            rows={[
              { label: "Level I — Walkthrough", cells: ["Building walkthrough; 12-24 month utility analysis; ENERGY STAR benchmarking; low-cost / no-cost measure list", "Brief report (5-15 pages) with prioritized recommendations", "$0.02-0.05 per sq ft", "1-3 days"] },
              { label: "Level II — Energy Survey", cells: ["System-by-system analysis; engineering calculations; ROI for each measure; M&V plan", "Comprehensive report (20-50 pages) with measure-by-measure analysis", "$0.05-0.20 per sq ft", "2-6 weeks"] },
              { label: "Level III — Detailed Analysis", cells: ["Building energy modeling for capital-intensive measures; rigorous engineering analysis", "Detailed report with simulation results + cost engineering for major capital decisions", "$0.20-1.00+ per sq ft", "2-6 months"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="When to use which level">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Level I:</strong> initial assessment of any commercial building; identification of low-cost measures; portfolio-wide screening to prioritize deeper analysis.</li>
              <li><strong>Level II:</strong> the workhorse for actionable energy improvement programs; sufficient detail for capital investment decisions in the $25K-500K range; required for many utility rebate programs.</li>
              <li><strong>Level III:</strong> reserved for capital decisions over ~$500K where rigorous engineering analysis is justified (full chiller plant replacement, building envelope retrofit, major control system upgrade).</li>
            </ul>
          </TechSection>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            ASHRAE Standard 211 superseded earlier audit standards in 2018 + harmonizes US commercial energy audit terminology. Federal projects often follow DOE FEMP M&V Guidelines, which align with ASHRAE 211 + IPMVP. Many state utility commissions reference ASHRAE 211 for rebate program audit requirements.
          </p>
        </section>

        {/* SECTION 03 — Benchmarking */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Benchmarking — ENERGY STAR Portfolio Manager
          </h2>

          <TechSection icon="insight" tone="blue" title="How ENERGY STAR Portfolio Manager works">
            EPA + ENERGY STAR for Buildings program; free online tool at portfoliomanager.energystar.gov. Used by 50%+ of US commercial floor space. Process: (1) Create account + add building. (2) Enter floor area + use type + operating characteristics (occupants, hours, computers, etc.). (3) Enter 12 months of utility bills. (4) Tool calculates Source EUI (Energy Use Intensity) in kBtu/sq ft. (5) Compares to national database of similar buildings, controlled for size + climate + use type + occupancy. (6) Output: ENERGY STAR Score 1-100 (percentile rank). Score 75+ = ENERGY STAR Certified eligible (top 25% of peers).
          </TechSection>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Median Source EUI by commercial building type (ENERGY STAR Portfolio Manager)"
              orientation="horizontal"
              data={[
                { label: "Hospital", value: 250, sub: "kBtu/sf/yr", color: "#dc2626" },
                { label: "Office", value: 125, sub: "kBtu/sf/yr", color: "#f59e0b" },
                { label: "Hotel", value: 120, sub: "kBtu/sf/yr", color: "#f59e0b" },
                { label: "Retail (mall)", value: 110, sub: "kBtu/sf/yr", color: "#3b82f6" },
                { label: "K-12 School", value: 85, sub: "kBtu/sf/yr", color: "#10b981" },
                { label: "Multifamily HR", value: 75, sub: "kBtu/sf/yr", color: "#10b981" },
                { label: "Multifamily LR", value: 65, sub: "kBtu/sf/yr", color: "#10b981" },
                { label: "Warehouse", value: 45, sub: "kBtu/sf/yr", color: "#10b981" },
              ]}
              axisLabel="kBtu/sq ft/year"
              caption="Median Source EUI varies dramatically by building type. ENERGY STAR Score is percentile-based — your building scores against peers of the same type. 75+ score = top 25% of peers = ENERGY STAR Certified eligible."
            />
          </div>

          <ComparisonTable
            headers={["Building type", "Median Source EUI (kBtu/sq ft/year)", "Certification threshold"]}
            rows={[
              { label: "Office", cells: ["~125 kBtu/sq ft (national median)", "Top 25% performance"] },
              { label: "K-12 School", cells: ["~85 kBtu/sq ft", "Top 25% performance"] },
              { label: "Hospital", cells: ["~250 kBtu/sq ft (high due to 24/7 + medical equipment)", "Top 25% performance"] },
              { label: "Hotel", cells: ["~120 kBtu/sq ft", "Top 25% performance"] },
              { label: "Warehouse (unrefrigerated)", cells: ["~45 kBtu/sq ft", "Top 25% performance"] },
              { label: "Retail (mall)", cells: ["~110 kBtu/sq ft", "Top 25% performance"] },
              { label: "Multifamily (high-rise)", cells: ["~75 kBtu/sq ft", "Top 25% performance"] },
              { label: "Multifamily (low-rise)", cells: ["~65 kBtu/sq ft", "Top 25% performance"] },
            ]}
          />

          <FixCallout>
            <strong>ENERGY STAR Score is percentile-based, not absolute.</strong> Score 80 means &quot;better than 80% of peers&quot; — but if all peers are inefficient, even an 80 may be 50% worse than physical potential. Conversely, score 50 in a market with already-efficient peers may be objectively decent. Use ENERGY STAR Score as one metric among several; also track Source EUI absolute value over time + against efficiency targets. Many Building Performance Standards reference ENERGY STAR Score thresholds or EUI targets directly.
          </FixCallout>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For commercial property owners: ENERGY STAR Score below 50 = significant opportunity for energy optimization. Score 50-75 = solid mid-pack; opportunities exist but harder to find. Score 75+ = certified eligible; focus on maintaining performance + pursuing further refinement.
          </p>
        </section>

        {/* SECTION 04 — Utility rates */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Utility rate structure — kWh + kW + Time-of-Use + Demand Ratchets
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Commercial electricity bills typically include several charges that residential customers don&apos;t see. Understanding rate structure is essential because the same kWh consumption can produce very different bills depending on when it occurs:
          </p>

          <ComparisonTable
            headers={["Charge type", "What it bills", "Typical value", "Strategy to reduce"]}
            rows={[
              { label: "Energy ($/kWh)", cells: ["Total kilowatt-hours consumed", "$0.08-0.25/kWh commercial; varies by region", "Reduce total consumption via efficiency + scheduling"] },
              { label: "Demand ($/kW)", cells: ["Peak kilowatts during measurement interval (typically 15 min)", "$5-30/kW per month commercial", "Load shifting; peak shaving; demand response"] },
              { label: "Demand Ratchet", cells: ["Highest peak in prior 11-12 months applied as billing demand", "Same $/kW as demand charge but applied year-round", "Prevent one bad afternoon from setting bills for a year"] },
              { label: "Time-of-Use (TOU)", cells: ["Different $/kWh + $/kW for on-peak / off-peak / shoulder periods", "On-peak typically 2-5× off-peak", "Shift non-critical loads to off-peak hours"] },
              { label: "Power factor / kVA", cells: ["Apparent power vs real power penalty for inductive loads (motors)", "Penalty if PF < 0.9; capacitor banks correct", "Power factor correction equipment; VFDs improve PF"] },
              { label: "Fixed / customer charge", cells: ["Monthly base charge regardless of usage", "$50-500/month commercial", "Generally unavoidable"] },
              { label: "Riders / surcharges", cells: ["Various: stranded cost, renewable mandate, energy efficiency funding, environmental", "Variable; can add 10-30% to base rates", "Generally unavoidable; some have efficiency incentive funding"] },
            ]}
          />

          <KeyInsight tone="blue" title="Why demand charges + ratchets matter so much">
            Demand charges can be 30-50% of the total commercial bill for medium-large buildings. A 100 kW peak × $15/kW = $1,500/month demand charge regardless of when that peak occurs. Demand ratchet means: peak set on one hot afternoon in July sets the demand baseline for the next 11 months. Operating equipment to manage peak demand has dramatic financial impact even if total kWh isn&apos;t reduced. Many commercial buildings install demand controllers / load shedders specifically to avoid demand spikes.
          </KeyInsight>
        </section>

        {/* SECTION 05 — RCx + MBCx */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Retrocommissioning + Monitoring-Based Commissioning
          </h2>

          <ComparisonTable
            headers={["Process", "Scope", "Cost", "Savings", "Cadence"]}
            rows={[
              { label: "Initial Commissioning (Cx)", cells: ["New construction or major retrofit; verify design intent achieved", "$0.40-2.50/sq ft", "Avoids initial performance issues", "One-time at construction"] },
              { label: "Retrocommissioning (RCx)", cells: ["Existing building; identify + correct performance drift; low-cost / no-cost measures", "$0.10-0.30/sq ft", "5-15% HVAC energy reduction", "Every 5-10 years"] },
              { label: "Recommissioning (re-Cx)", cells: ["Same process as RCx but on building previously commissioned", "$0.10-0.30/sq ft", "5-15% HVAC energy reduction", "Every 5-10 years"] },
              { label: "Continuous Commissioning (CCx)", cells: ["Ongoing monitoring + adjustment throughout building life", "$0.10-0.30/sq ft annually", "15-25% HVAC energy reduction", "Continuous"] },
              { label: "Monitoring-Based Commissioning (MBCx)", cells: ["Structured CCx using FDD software to identify drift + opportunities", "$0.15-0.50/sq ft annually", "10-30% HVAC energy reduction", "Continuous"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="The RCx → MBCx progression">
            For most existing buildings, the best practice is: (1) Start with RCx — one-time intervention to capture biggest opportunities + reset baseline. (2) Implement MBCx — ongoing monitoring to maintain performance + identify new opportunities. (3) Schedule periodic re-RCx — every 5-10 years to catch slow drift not captured by FDD. RCx focuses on broad measures (control sequence improvements, sensor calibration, setpoint optimization); MBCx maintains those gains over time + catches new issues. The combined approach typically delivers 15-25% sustained HVAC energy reduction with reasonable engineering resource commitment.
          </TechSection>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            ASHRAE Guideline 0.2 (Commissioning Process for Existing Buildings) defines the formal RCx process. ASHRAE Standard 202 establishes the commissioning process for existing buildings as a standard (vs Guideline). For initial commissioning of new buildings, see ASHRAE Guideline 0 + Standard 202 + our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link>.
          </p>
        </section>

        {/* SECTION 06 — FDD */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Fault Detection + Diagnostics (FDD)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            FDD software analyzes building automation system (BAS) trend data to automatically identify equipment faults + control issues. Algorithms continuously monitor:
          </p>

          <ul className="mt-3 space-y-1 text-zinc-700 dark:text-zinc-300 list-disc pl-6">
            <li>Temperature setpoints vs measured values (control loop performance)</li>
            <li>Equipment runtime vs schedule (after-hours operation)</li>
            <li>Chiller efficiency (kW/ton) vs expected by load condition</li>
            <li>Air handler outdoor air fraction (economizer operation)</li>
            <li>Coil performance + valve operation</li>
            <li>Sensor accuracy (drift detection via cross-comparison)</li>
            <li>Energy use patterns (anomaly detection)</li>
            <li>Simultaneous heating + cooling (waste detection)</li>
            <li>Stuck dampers + failed sensors</li>
            <li>Capacity vs load (oversizing detection)</li>
          </ul>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>FDD software vendors</strong> (multi-building portfolio products): CopperTree Analytics; Clockworks Analytics; Switch Automation; KGS Buildings; Tridium Niagara FDD; Honeywell Forge; Johnson Controls OpenBlue; Schneider Electric EcoStruxure Building Operations; Siemens Navigator. Single-building options also available from BAS vendors.
          </p>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>Cost framework:</strong> $0.05-0.15/sq ft annually for software + integration; $0.10-0.30/sq ft annually for engineering services for fault triage + resolution. Total: $0.15-0.45/sq ft annually for active FDD program. <strong>Typical savings:</strong> 5-15% of HVAC energy when actively managed. <strong>ROI:</strong> 1-3 years for typical commercial building with committed engineering follow-up.
          </p>

          <FixCallout>
            <strong>The most common FDD failure mode:</strong> software installed + faults flagged, but engineering resources don&apos;t address them. Result: dashboard accumulates unaddressed faults; no energy savings achieved; project labeled &quot;failure&quot; though tool functioned correctly. Solution: commit to fault resolution resources (in-house engineer or service contract) before implementing FDD. Many ESCOs offer FDD-as-a-Service models that bundle software + engineering follow-up.
          </FixCallout>
        </section>

        {/* SECTION 07 — M&V per IPMVP */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Measurement + Verification per IPMVP
          </h2>

          <ComparisonTable
            headers={["IPMVP Option", "Measurement approach", "Best for", "Cost"]}
            rows={[
              { label: "Option A — Retrofit Isolation, Key Parameter", cells: ["Measure key variables that drive savings; estimate the rest", "Projects with predictable use patterns (lighting retrofits)", "Lowest"] },
              { label: "Option B — Retrofit Isolation, All Parameter", cells: ["Continuously measure energy use of affected systems pre + post", "Major equipment changes (chiller plant upgrade)", "Moderate"] },
              { label: "Option C — Whole Facility", cells: ["Compare whole-building utility bills pre + post with weather + occupancy adjustment", "Projects with savings >10% of total bill", "Lower"] },
              { label: "Option D — Calibrated Simulation", cells: ["Calibrated building energy model estimates baseline; measure post-installation; difference = savings", "New construction; no clean baseline; small savings", "Highest"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="M&V is estimation, not measurement">
            All M&V Options involve some level of estimation: Option A estimates the parameters not measured; Option B + C involve baseline adjustment for weather + occupancy variables; Option D entirely models the counter-factual scenario. The output is &quot;estimated savings with stated uncertainty bounds&quot; not &quot;measured savings.&quot; IPMVP requires documenting uncertainty in the M&V plan. Typical M&V uncertainty: ±10-20% on whole-building Option C; ±5-15% on submetered Options A + B. For performance contracts (ESCOs guaranteeing savings), M&V protocol + uncertainty bounds are negotiated upfront + documented in the contract.
          </TechSection>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            ASHRAE Guideline 14-2014 (Measurement of Energy, Demand, and Water Savings) provides complementary methodology aligned with IPMVP. DOE FEMP M&V Guidelines are the federal standard for federal energy savings contracts.
          </p>
        </section>

        {/* SECTION 08 — Submetering */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Submetering + Advanced Metering Infrastructure
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Submetering installs additional electrical meters below the utility main meter to monitor individual loads (HVAC, lighting, plug loads, specific tenants, EV charging, etc.). Use cases:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-6">
            <li><strong>Tenant billing.</strong> Multi-tenant buildings can bill tenants based on actual use vs square-foot allocation, encouraging conservation.</li>
            <li><strong>FDD source data.</strong> Submeter data feeds FDD algorithms; provides finer granularity than whole-building bills.</li>
            <li><strong>M&V baseline + post-installation.</strong> IPMVP Option B requires submetering of affected systems.</li>
            <li><strong>LEED EAc Optimize Energy Performance.</strong> LEED v4.1 requires submetering of HVAC + lighting + tenant loads for credit.</li>
            <li><strong>Building Performance Standards.</strong> Some BPS programs require submetering for compliance verification.</li>
            <li><strong>EV charging.</strong> Separate metering for EV charging stations enables time-of-use pricing + grid management.</li>
          </ul>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>Cost framework:</strong> $1,000-5,000 per submeter installed; $5,000-50,000+ for whole-building submetering depending on scope. Integration with BAS or standalone data acquisition systems available. <strong>Vendors:</strong> Veris Industries; PowerLogic (Schneider Electric); Continental Control Systems; Acuity Onyx; EKM Metering; Leviton Series 5000. <strong>Standards:</strong> ANSI C12 (electric meter accuracy classes); typical accuracy 0.5% for revenue-grade; 1% for monitoring-grade.
          </p>
        </section>

        {/* SECTION 09 — Demand response */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Demand response programs
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Demand response (DR) programs pay building owners + operators to reduce electrical load during grid stress events (typically hot summer afternoons). Reduces utility need for peaker plants + grid infrastructure. Three program types:
          </p>

          <ComparisonTable
            headers={["DR program type", "How it works", "Payment", "Operational impact"]}
            rows={[
              { label: "Day-ahead", cells: ["Utility notifies day before event; participant commits to load reduction at specified time", "Higher capacity payment ($/kW) for committed availability + energy payment ($/kWh) for actual reduction", "Predictable; pre-cool building or coordinate with operations"] },
              { label: "Same-day", cells: ["Utility calls event 2-4 hours ahead", "Lower capacity payment; higher energy payment per kWh reduced", "Less predictable; requires faster response"] },
              { label: "Real-time / 5-minute", cells: ["Automated response within 5 minutes of grid signal", "Highest energy payment; lower capacity", "Fully automated; requires BAS integration + pre-approved load shedding strategies"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>Common HVAC DR strategies:</strong> pre-cool building 1-2°F below normal setpoint before event; raise indoor setpoint 2-4°F during event; shut off non-critical AHUs; reduce outdoor air below normal (within ASHRAE 62.1 minimums); cycle equipment; activate thermal storage if installed. Limits: occupant comfort (typically can&apos;t exceed 80-82°F or below 65°F); equipment operating safety (some equipment can&apos;t handle sudden shutdown).
          </p>

          <KeyInsight tone="blue" title="DR is real money but requires real commitment">
            DR programs generate $5-30/kW per month in capacity payments + $0.05-0.30/kWh energy payments for reduced load. For a building with 100 kW of available reduction, this can be $5,000-50,000+ annually. But: DR programs are contractual commitments with penalties for non-performance. Don&apos;t commit to more reduction than the building can reliably deliver. Many buildings start with day-ahead programs (predictable) and migrate to real-time programs as they develop confidence in their DR response. Aggregators (EnerNOC, CPower, Voltus) bundle multiple buildings into a single DR offering, easier for buildings without dedicated energy management staff.
          </KeyInsight>
        </section>

        {/* SECTION 10 — Performance gap */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            The rated-vs-operational performance gap
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Buildings consistently underperform their design intent. Multiple studies show commercial buildings consume 20-40% more energy than design models predict. Common causes:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-6">
            <li><strong>Controls drift.</strong> Setpoints adjusted over time; schedules modified for one-time needs but never reset; sensor calibration drifts.</li>
            <li><strong>Occupant overrides.</strong> Manual overrides of setbacks (e.g., night setup raised back to occupied temperature for after-hours event, never reset).</li>
            <li><strong>Equipment degradation.</strong> Coils foul; refrigerant charge drifts; belts loosen; bearings wear; capacity declines vs new equipment ratings.</li>
            <li><strong>Simultaneous heating + cooling.</strong> One AHU heating while adjacent zone cooling, due to control sequence drift or sensor failure.</li>
            <li><strong>Plug loads creep.</strong> Computer + monitor + printer loads have grown faster than design predicted; design models often underestimated.</li>
            <li><strong>Occupancy changes.</strong> Building use changes over time (more occupants per sq ft; longer hours; more equipment) without matching HVAC adjustment.</li>
            <li><strong>Equipment oversizing.</strong> Original Manual J calculation oversized for safety margin; equipment cycles inefficiently at part load.</li>
            <li><strong>Maintenance gaps.</strong> Filter changes delayed; coils not cleaned; refrigerant leaks; bearings unlubricated.</li>
          </ul>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            Energy management (RCx + MBCx + FDD) addresses these causes systematically. Energy efficiency improvements alone don&apos;t — new equipment will degrade the same way unless ongoing monitoring is implemented.
          </p>
        </section>

        {/* SECTION 11 — Framework standards */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Framework standards — ASHRAE 100 + ISO 50001
          </h2>

          <ComparisonTable
            headers={["Standard", "Scope", "Best for"]}
            rows={[
              { label: "ASHRAE Standard 100-2018 (Energy Efficiency in Existing Buildings)", cells: ["Comprehensive standard for existing-building energy management; complements ASHRAE 90.1 + 90.2 for new construction", "Building owners + operators seeking unified standard for existing-building energy management"] },
              { label: "ASHRAE Standard 105-2014 (Standard Methods of Determining, Expressing, and Comparing Building Energy Performance)", cells: ["Defines metrics + methodology for benchmarking + comparing building energy performance", "Energy consultants + benchmarking program administrators"] },
              { label: "ISO 50001 (Energy Management Systems)", cells: ["International standard for energy management system — Plan-Do-Check-Act cycle", "Organizations seeking ISO certification of their energy management program"] },
              { label: "ISO 50002 (Energy Audits)", cells: ["International standard for energy audit methodology", "International energy auditors; companies operating in multiple countries"] },
              { label: "ASHRAE Guideline 22 (Instrumentation for Monitoring Central Chilled Water Plant Performance)", cells: ["Specific monitoring methodology for chilled water plants", "Commercial chilled water plant operators"] },
              { label: "ASHRAE Guideline 36 (High Performance Sequences of Operation for HVAC Systems)", cells: ["Standard control sequences proven to deliver energy + comfort performance", "BAS designers + retrocommissioning teams (already cited in our controls guide)"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            ISO 50001 certification is the management-system equivalent of ISO 9001 (quality) or ISO 14001 (environmental). Implementation framework: establish energy policy + objectives + targets; develop energy management plan; implement training + competency; perform monitoring + measurement; internal audits; management review; continuous improvement. Suitable for large organizations + government facilities + portfolios where systematic energy management is a corporate commitment.
          </p>
        </section>

        {/* SECTION 12 — Building Performance Standards */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Building Performance Standards — the rapidly growing regulatory frontier
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Building Performance Standards (BPS) are local + state laws requiring existing buildings above a size threshold to meet energy performance targets, with escalating requirements over time. Distinct from building codes (which apply to new construction): BPS apply to existing building stock. Driven by recognition that new construction is only 1-2% of building stock annually.
          </p>

          <ComparisonTable
            headers={["Jurisdiction", "Program", "Size threshold", "Compliance milestone", "Penalty structure"]}
            rows={[
              { label: "New York City", cells: ["Local Law 97 (2019)", "&gt; 25,000 sq ft", "2024-2029 (P1); 2030-2034 (P2); 2035-2049 (P3)", "$268/ton CO2 over limit"] },
              { label: "Boston", cells: ["BERDO 2.0 (2021)", "&gt; 20,000 sq ft", "Emissions targets to 2050 net zero", "Per-ton emissions penalty (rate set by ordinance)"] },
              { label: "Washington State", cells: ["Clean Buildings Performance Standard (CBPS)", "&gt; 50,000 sq ft commercial", "2026 (Tier 1); 2031 (Tier 2)", "$5,000 base + $1/sq ft penalty"] },
              { label: "Maryland", cells: ["BEPS (Building Energy Performance Standard)", "&gt; 35,000 sq ft", "2030 milestone; 2040 net zero target", "Emissions-based penalties"] },
              { label: "Seattle", cells: ["Building Performance Standard", "&gt; 20,000 sq ft", "Phased compliance 2026-2031", "Per-sq-ft penalties for non-compliance"] },
              { label: "Denver", cells: ["Energize Denver", "&gt; 25,000 sq ft", "Energy targets escalating to 2030", "Per-sq-ft penalties"] },
              { label: "Colorado (statewide)", cells: ["Building Performance Standard", "Phased rollout", "Building stock-wide emissions reduction targets", "Multi-tiered penalty structure"] },
              { label: "Washington DC", cells: ["BEPS", "&gt; 50,000 sq ft", "2026, 2031, 2036, 2041 milestones", "Performance-based fines"] },
              { label: "Chicago", cells: ["Energy Benchmarking + BPS proposed", "&gt; 50,000 sq ft", "Benchmarking enacted; BPS under development", "Benchmarking penalties; future BPS TBD"] },
            ]}
          />

          <KeyInsight tone="blue" title="BPS compliance methodology">
            Most BPS programs use a similar three-step compliance pattern: (1) Benchmark in ENERGY STAR Portfolio Manager. (2) Identify gap to target. (3) Implement energy improvements OR pay alternative compliance penalty (typically priced to make compliance investment more attractive than penalty). Many programs allow trading credits between buildings in a portfolio. Compliance pathways often include: prescriptive (specific equipment + measure requirements) OR performance (any combination meeting EUI target) OR carbon (any combination meeting GHG target). Real estate investment trusts (REITs), corporate building portfolios, and institutional owners (universities, hospitals) face the largest BPS compliance challenges. Building owners increasingly must integrate BPS into long-term capital planning + acquisition decisions.
          </KeyInsight>
        </section>

        {/* SECTION 13 — Energy data analysis */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Energy data analysis methodology
          </h2>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-6">
            <li><strong>Weather normalization.</strong> Compare actual energy use vs heating degree days (HDD) + cooling degree days (CDD). Identifies whether year-over-year changes are from weather vs operational changes. Heating + cooling intensity (kBtu/HDD or kBtu/CDD) is a useful normalized metric.</li>
            <li><strong>Energy signature analysis.</strong> Plot energy use vs outdoor temperature; line slope = building thermal characteristics. Inflection points reveal balance point + base load. Common technique in M&V + RCx.</li>
            <li><strong>Time-of-day profiling.</strong> Analyze interval data (15-minute or hourly) to identify schedule issues, after-hours operation, weekend setback failures.</li>
            <li><strong>End-use disaggregation.</strong> Break down total energy by end use (HVAC, lighting, plug loads, etc.) using submeter data or analytical disaggregation. ASHRAE Standard 105 provides methodology.</li>
            <li><strong>Anomaly detection.</strong> Identify days/weeks with unusual energy use; investigate causes. FDD software automates this.</li>
            <li><strong>Benchmarking.</strong> Compare normalized energy use vs peer buildings + targets. ENERGY STAR Score is one approach.</li>
            <li><strong>Trend analysis.</strong> Year-over-year + seasonal trends after weather normalization. Reveals slow drift or improvements.</li>
          </ul>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            <strong>Software tools:</strong> ENERGY STAR Portfolio Manager (free; benchmarking + reporting); EnergyCAP (utility bill management + analytics, commercial); UtilityRpt; FlowGate; Watttime; OpenEEmeter (open-source M&V engine). For smaller buildings: Excel + utility data downloads sufficient. For multi-building portfolios: dedicated software typical.
          </p>
        </section>

        {/* SECTION 14 — Residential */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Residential energy management
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Residential energy management is simpler than commercial — no demand charges, no BPS compliance, no FDD software needed. But many opportunities exist:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-6">
            <li><strong>Utility data access.</strong> Most utilities provide free online portal with daily/hourly use data. Use this to identify high-use days + understand patterns.</li>
            <li><strong>Smart meters + Green Button.</strong> Most residential meters now smart; Green Button initiative provides standardized energy data download. Apps like Power Companion, OhmConnect (CA), Sense Home Energy Monitor analyze.</li>
            <li><strong>Time-of-Use rates.</strong> Many utilities offer optional TOU rates with peak/off-peak spread. Shift dishwasher + clothes dryer + EV charging to off-peak hours.</li>
            <li><strong>Smart thermostat.</strong> Programmable + smart thermostats (Nest, Ecobee, Honeywell) provide setback + scheduling + remote control. ENERGY STAR-certified models confirm energy savings.</li>
            <li><strong>Energy audit.</strong> RESNET HERS rating + blower door test identify envelope + HVAC issues. Many utilities offer subsidized residential audits.</li>
            <li><strong>Solar PV + battery storage.</strong> IRA Section 25D 30% credit (no cap) for solar + battery storage; net metering allows excess generation to offset utility bills.</li>
            <li><strong>Whole-home electrification.</strong> Heat pump space heating + water heating + induction cooking + EV charging — reduces total energy + emissions; IRA + HEEHRA incentives support.</li>
          </ul>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For comprehensive residential efficiency + IRA credit framework, see <Link href="/hvac-energy-efficiency-guide/" className="underline">energy efficiency guide</Link> and <Link href="/hvac-retrofitting-upgrades-guide/" className="underline">retrofitting + upgrades guide</Link>.
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
              <strong>ASHRAE standards (energy management):</strong> ANSI/ASHRAE Standard 100-2018 (Energy Efficiency in Existing Buildings). ANSI/ASHRAE Standard 105-2014 (Standard Methods of Determining, Expressing, and Comparing Building Energy Performance). ANSI/ASHRAE Standard 211-2018 (Standard for Commercial Building Energy Audits). ANSI/ASHRAE Standard 202-2018 (Commissioning Process for Buildings + Systems). ANSI/ASHRAE Standard 90.1-2022 (Energy Standard for Buildings — Commercial). ANSI/ASHRAE Standard 90.2-2024 (Energy Standard for Buildings — Residential).
            </p>
            <p className="mt-3">
              <strong>ASHRAE guidelines:</strong> ANSI/ASHRAE Guideline 0-2019 (The Commissioning Process). Guideline 0.2-2015 (Commissioning Process for Existing Systems and Assemblies). Guideline 14-2014 (Measurement of Energy, Demand, and Water Savings). Guideline 22 (Instrumentation for Monitoring Central Chilled Water Plant Performance). Guideline 36-2021 (High Performance Sequences of Operation for HVAC Systems). Guideline 1.5 (Commissioning Process Documentation Templates).
            </p>
            <p className="mt-3">
              <strong>IPMVP + ISO:</strong> International Performance Measurement & Verification Protocol (IPMVP), Efficiency Valuation Organization (EVO). ISO 50001:2018 (Energy Management Systems). ISO 50002:2014 (Energy Audits). ISO 50006:2014 (Energy Performance using EnPIs).
            </p>
            <p className="mt-3">
              <strong>Federal + EPA + DOE:</strong> EPA ENERGY STAR for Buildings program (ENERGY STAR Portfolio Manager). DOE Federal Energy Management Program (FEMP) M&V Guidelines. DOE 10 CFR Part 433 (Federal Building Energy Standards). DOE Better Buildings Initiative.
            </p>
            <p className="mt-3">
              <strong>Building Performance Standards (primary sources):</strong> NYC Local Law 97 (2019) — codified in NYC Admin Code Title 28 + Title 24. Boston BERDO 2.0 (2021) — Boston Air Pollution Control Commission Regulations. Washington State Clean Buildings Performance Standard — WAC 194-50. Maryland BEPS — Climate Solutions Now Act (2022). Seattle Building Performance Standard — Seattle Office of Sustainability + Environment. Denver Energize Denver — Denver Department of Public Health & Environment. Colorado Building Performance Standard — Colorado Energy Office. DC BEPS — DOEE (Department of Energy & Environment).
            </p>
            <p className="mt-3">
              <strong>Industry resources:</strong> Institute for Market Transformation (IMT) — BPS tracker + technical resources. Building Performance Standards Coalition (BPS) — coalition of cities + states advancing BPS programs. ACEEE (American Council for an Energy-Efficient Economy) — research + state policy tracking. Urban Sustainability Directors Network (USDN). EVO (Efficiency Valuation Organization) — IPMVP custodian. AEE (Association of Energy Engineers) — Certified Energy Manager + Certified Measurement & Verification Professional credentials.
            </p>
            <p className="mt-3">
              <strong>FDD + analytics software:</strong> CopperTree Analytics; Clockworks Analytics; Switch Automation; KGS Buildings; Tridium Niagara; Honeywell Forge; Johnson Controls OpenBlue; Schneider Electric EcoStruxure Building Operations; Siemens Navigator; Lucid Building OS; EnergyCAP; OpenEEmeter (open-source M&V).
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Jurisdiction-specific BPS compliance procedures (consult your local energy office or sustainability department). Specific utility rate structures for any region (consult your utility tariff sheet). M&V protocol selection for specific projects (depends on project scope; consult IPMVP-certified professional). ISO 50001 certification process for specific organizations (consult certified ISO 50001 registrar). FDD vendor selection (depends on building portfolio scope + integration requirements).
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
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><TrendingUp className="h-4 w-4" /> Energy Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Equipment rating side: SEER2/HSPF2/AFUE2 + IRA credits.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Initial commissioning process — companion to retrocommissioning here.</p>
            </Link>
            <Link href="/hvac-controls-automation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Controls & Automation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Residential BAS implementation + protocols — the foundation FDD analyzes.</p>
            </Link>
            <Link href="/hvac-building-automation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-blue-600" /> Building Automation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Commercial BMS implementation — points list, Guideline 36, cybersecurity, RFP.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Equipment-level care — drives operational energy.</p>
            </Link>
            <Link href="/hvac-retrofitting-upgrades-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> Retrofitting & Upgrades Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">When equipment replacement makes more sense than further optimization.</p>
            </Link>
            <Link href="/hvac-system-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> System Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Design capstone — sets up the operational baseline this guide manages.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

void [Zap, Wind, Gauge, BarChart3, LineChart, Building2, Calculator, AlertTriangle, ListChecks, Lookups, Panel, ServiceProblem, VerdictBanner];
