import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, Wind, Wrench, ListChecks, FileCheck, AlertTriangle, Thermometer, Droplet, Snowflake, Sun, Zap, ShieldCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-system-design-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC System Design Guide — Complete Manual J → S → D → T Process from Load to Commissioning",
  description:
    "Complete residential HVAC system design methodology: the full ACCA design cascade (Manual J load calculation → Manual S equipment selection → Manual D ductwork → Manual T commissioning), refrigerant selection under AIM Act, distribution-type choice (ducted vs ductless vs hybrid), ASHRAE 62.2 ventilation integration, zoning + controls, IAQ integration, code compliance, and the design decision matrices that determine the right system for a specific home. Sourced from ACCA Manuals J + S + D + T + QI 5, ASHRAE Handbook of Fundamentals 2021, ASHRAE Standards 62.2 + 90.2 + 111, AHRI Standards 210/240, IRC 2021, IECC 2021, EPA AIM Act + Section 608.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC System Design Guide — Manual J → S → D → T Complete Process",
    description: "Complete design cascade with cross-reference to all calculators and component guides.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC System Design Guide — Complete Design Cascade",
    description: "The full ACCA Manual J → S → D → T process. Capstone reference for residential HVAC design.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the right order to design a residential HVAC system?",
    a: "The ACCA design cascade: (1) Manual J load calculation — produces total cooling tonnage + heating BTU/hr + room-by-room CFM from envelope + climate + occupancy. (2) Manual S equipment selection — converts Manual J load into a specific AHRI-rated equipment selection within the 90-130% sizing window. (3) Manual D ductwork design — sizes ducts to deliver per-room CFM at the equipment's blower curve external static budget. (4) ASHRAE 62.2 ventilation integration — adds mechanical ventilation to meet 62.2 rates, typically via ERV or HRV. (5) Controls + zoning design — thermostat selection, balance points for heat pumps, zoning if applicable. (6) Manual T commissioning + balancing — measures the installed system against design intent and adjusts to match. Skipping any step compromises the others — Manual D depends on Manual J per-room CFM; Manual S equipment selection depends on Manual J load; commissioning verifies all of the above. See our dedicated guides for each step.",
  },
  {
    q: "Heat pump or gas furnace for new construction in 2026?",
    a: "Heat pump usually wins in IECC Zones 1-5 with current 2026 economics. Five factors drive the decision: (1) electricity price per kWh in your area (below $0.15/kWh strongly favors heat pump); (2) natural gas price per therm (below $1.00 favors gas; above $1.50 favors heat pump); (3) climate zone severity (Zones 1-4: heat pump wins by big margin; Zones 5-6: heat pump wins with cold-climate equipment; Zones 7-8: hybrid often optimal); (4) equipment cost vs IRA 25C tax credit (30% credit up to $2,000 for cold-climate heat pumps substantially improves payback); (5) home envelope quality (tighter homes need smaller equipment, where heat pump equipment scale is well-developed). See our energy efficiency guide for the full decision framework + climate matrix. For typical new construction in moderate-to-cold climates with normal envelope quality, a properly-sized variable-capacity cold-climate heat pump installed per ACCA Quality Installation Standard 5 is usually the right answer in 2026.",
  },
  {
    q: "Should I choose a ducted central system or ductless mini-splits?",
    a: "Tradeoff depends on the home's geometry and renovation cost. DUCTED central system: best for homes with existing accessible ductwork or new construction where ductwork can be installed in conditioned space; single equipment unit; central filtration covers entire home; HVAC blower handles airflow distribution; cheaper per ton for larger homes. DUCTLESS mini-split: best for homes without ductwork or where retrofitting ducts is impractical (older homes, additions, garages converted to living space, attic bonus rooms); eliminates duct losses entirely (which can be 25-40% of equipment capacity in poorly-installed ducted systems); per-zone temperature control without zoning hardware; quiet; works well in tight construction; higher upfront cost per zone. HYBRID: ducted for most of the home + ductless for problem zones (bonus room, basement, garage conversion) — often the optimal residential solution for complex homes. For new construction in 2026, ducted central with properly-sized variable-capacity heat pump remains the default; ductless deserves consideration for older homes and additions.",
  },
  {
    q: "How does refrigerant selection affect HVAC system design?",
    a: "Substantially — refrigerant choice cascades through equipment availability, regulatory exposure, safety class requirements, and total cost of ownership. Under the AIM Act (40 CFR Part 84) and EPA Technology Transitions Final Rule (October 2023), new residential AC and heat pump equipment must use refrigerants with GWP below 700 effective January 1, 2025. The A2L replacements (R-32, R-454B, R-454C, R-455A) are the new equipment baseline. Implications: (1) Equipment is A2L-rated with associated installation safety procedures; (2) Service contractors need A2L training and equipment; (3) Refrigerant supply economics favor the new chemistries (legacy R-410A allowance-constrained); (4) Some equipment uses dramatically different refrigerant chemistries (R-32 is pure HFC with low GWP; R-454B is HFC/HFO blend at GWP 466); (5) Future-proofing: choosing equipment compatible with the dominant new-equipment refrigerants makes service economics cleaner over 15-20 year equipment life. See our refrigerant prices guide and recovery guide for the regulatory framework.",
  },
  {
    q: "Do I need zoning?",
    a: "Maybe — depends on home characteristics. Single-zone is sufficient when: (1) Home is relatively uniform in load (similar orientations, similar occupancy patterns, no extreme room-to-room variations); (2) Open floor plan with good air circulation between rooms; (3) Single-story or compact two-story; (4) Equipment has variable-capacity operation that handles modest load variations through modulation. Zoning is justified when: (1) Multi-story with distinct heating/cooling needs by floor (upstairs vs basement); (2) Distinctly different orientations (south-facing solar gain heavy area + north-facing constant load area); (3) Different occupancy patterns (master bedroom suite vs general home); (4) Large additions or wings with different design conditions. Zoning hardware: typically 2-4 zones for residential; thermostat per zone; motorized dampers in supply ductwork; zone controller integrates. Cost: $1,500-4,000 for 2-3 zone retrofit; ductless mini-split per zone often comparable or lower cost. For new construction, design zoning into the duct layout from the start.",
  },
  {
    q: "What's the right way to integrate ventilation into HVAC design?",
    a: "ASHRAE 62.2 mechanical ventilation is increasingly required (IRC 2021 Section M1505 in most jurisdictions). The integration question is whether to: (1) Run a standalone ERV/HRV with its own ductwork — completely independent of HVAC; simplest install for retrofits. (2) Connect ERV/HRV supply to HVAC return plenum — leverages HVAC ductwork for distribution; outdoor air is conditioned with the rest before delivery. (3) Full HVAC ductwork integration — most efficient but most complex to commission. For new construction, integrate at the design stage rather than retrofit later. The ERV/HRV adds 80-200 CFM of conditioned outdoor air to the building load; account for this in Manual J load calculation (some Manual J software has explicit ventilation-load input). See our mechanical ventilation guide for the full design decision framework.",
  },
  {
    q: "What's the right thermostat for a properly designed HVAC system?",
    a: "Depends on equipment type. Single-stage equipment: basic programmable thermostat is sufficient ($50-150). Two-stage equipment: smart thermostat with two-stage support (Ecobee, Nest, Honeywell — $200-300) handles staging logic. Variable-capacity equipment: usually requires the manufacturer's proprietary communicating thermostat ($300-600) for proper modulation control; some equipment supports third-party communicating thermostats. Heat pumps: need balance-point configuration (the temperature below which aux heat takes over) — many smart thermostats handle this; manufacturer thermostats are typically pre-configured. Multi-zone systems: zone controller with thermostat per zone. Smart thermostats add IRA 25C tax credit eligibility in some cases when installed alongside qualifying equipment; they also provide remote monitoring + energy reports. Avoid: oversold WiFi thermostats with features that don't add value (occupancy detection that mis-fires, geofencing that produces erratic setpoint changes, learning algorithms that override user preferences).",
  },
  {
    q: "What's the most common HVAC design failure?",
    a: "Oversizing — by a wide margin. The 'rule of thumb' approach (500 ft²/ton or similar) systematically oversizes equipment for modern construction because the rules were derived from 1960s-1970s envelope quality. A 2,000 ft² 2018 build typically needs 2-2.5 tons; rule of thumb says 4 tons; oversizing produces short-cycling, humidity problems, and 10-25% higher energy bills than properly-sized equipment. The fix is the ACCA design cascade — Manual J calculation → Manual S window verification → Manual D ductwork. Oversizing compounds: oversized equipment with undersized return (also common) produces dramatic short-cycling and humidity failures. The remediation is straightforward: do the calculation before specifying equipment. The cost of getting it wrong: 15-20 years of suboptimal comfort + bills, until the next equipment replacement. See our load calculation guide for Manual J methodology and our load calculator for a 7-input quick estimate.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC System Design Guide — Complete Manual J → S → D → T Process from Load to Commissioning",
      description:
        "Complete residential HVAC system design methodology: the full ACCA design cascade, equipment selection, refrigerant choice under AIM Act, distribution type, ductwork design, ventilation integration, zoning + controls, IAQ integration, commissioning, code compliance, decision matrices.",
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
        { "@type": "Thing", name: "HVAC system design" },
        { "@type": "Thing", name: "ACCA design cascade" },
        { "@type": "Thing", name: "Residential HVAC engineering" },
        { "@type": "Thing", name: "Heat pump vs furnace" },
        { "@type": "Thing", name: "Ducted vs ductless" },
      ],
      keywords: [
        "hvac system design",
        "residential hvac design",
        "manual j manual d manual s",
        "acca design cascade",
        "hvac design process",
        "heat pump design",
        "duct design",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "Complete residential HVAC system design process",
      description: "Sequential 9-step procedure for designing a residential HVAC system from home characterization through commissioning.",
      totalTime: "PT8H",
      tool: [
        { "@type": "HowToTool", name: "Manual J load calculation software (Wrightsoft Right-J, EnergyGauge, Cool Calc, Carrier HAP) or interactive load calculator" },
        { "@type": "HowToTool", name: "Manual D duct sizing software or interactive duct calculator" },
        { "@type": "HowToTool", name: "ASHRAE Handbook of Fundamentals 2021" },
        { "@type": "HowToTool", name: "Manufacturer equipment data sheets (AHRI-certified)" },
        { "@type": "HowToTool", name: "Climatic Design Conditions data for local weather station" },
        { "@type": "HowToTool", name: "Commissioning equipment (manometer, balometer, blower door, Duct Blaster)" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Characterize the home", text: "Measure conditioned floor area, identify orientation, document envelope (walls, windows, roof, infiltration), record occupancy + internal gains, identify ASHRAE climate station for design conditions." },
        { "@type": "HowToStep", position: 2, name: "Manual J load calculation", text: "Compute total cooling BTU/hr + tonnage + sensible/latent split + room-by-room CFM. Heating BTU/hr at 99% design temperature. Use Manual J 8th edition methodology or our interactive load calculator for ±20% estimate." },
        { "@type": "HowToStep", position: 3, name: "Manual S equipment selection", text: "Select AHRI-certified equipment within Manual S sizing window (90-115% single-stage, 100-130% variable-capacity). Verify SHR match for humidity control. Account for refrigerant under AIM Act (A2L for new equipment GWP<700)." },
        { "@type": "HowToStep", position: 4, name: "Distribution-type decision", text: "Ducted central, ductless mini-split, or hybrid. Driven by envelope, existing infrastructure, complexity of home, budget." },
        { "@type": "HowToStep", position: 5, name: "Manual D ductwork design", text: "If ducted: size trunks + branches per equal-friction (0.08 in.w.c./100ft supply, 0.05 return). Verify TESP within equipment blower curve. Specify materials + insulation per IECC + SMACNA leakage class." },
        { "@type": "HowToStep", position: 6, name: "ASHRAE 62.2 ventilation integration", text: "Calculate ventilation rate per 62.2 formula. Select strategy (exhaust-only, supply-only, balanced, ERV/HRV) based on climate + envelope tightness. Integrate ductwork with HVAC." },
        { "@type": "HowToStep", position: 7, name: "Controls + zoning design", text: "Select thermostat type per equipment compatibility (single-stage / two-stage / variable-capacity / communicating). Decide zoning by load variation. Heat pump balance point + aux heat lockout." },
        { "@type": "HowToStep", position: 8, name: "IAQ integration", text: "Filter strategy (MERV class + housing size); humidity control (if dehumidification needed beyond AC capability); CO + radon considerations." },
        { "@type": "HowToStep", position: 9, name: "Manual T commissioning + documentation", text: "After install: verify per-register CFM, TESP, refrigerant charge, combustion safety, control operation. Deliver commissioning package per ACCA QI Standard 5." },
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
        { "@type": "ListItem", position: 3, name: "HVAC System Design Guide" },
      ],
    },
  ];
}

export default function HvacSystemDesignGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC System Design Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC System Design Guide — Complete Manual J → S → D → T Process from Load to Commissioning
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            The design capstone — pulls together every other guide on this site into a single end-to-end process. This guide covers the complete ACCA design cascade (Manual J load calculation → Manual S equipment selection → Manual D ductwork → Manual T commissioning), refrigerant selection under AIM Act phase-down, distribution-type choice (ducted vs ductless vs hybrid), ASHRAE 62.2 ventilation integration, controls + zoning design, IAQ integration, code compliance, and the design decision matrices that determine the right system for a specific home. Each step references the dedicated companion guide for deep detail. Sourced from ACCA Manuals J + S + D + T + QI 5, ASHRAE Handbook of Fundamentals 2021, ASHRAE Standards 62.2 + 90.2 + 111, AHRI Standards 210/240, IRC 2021, IECC 2021, EPA AIM Act + Section 608.
          </p>
        </header>

        {/* SECTION 01 — Design cascade overview */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The ACCA design cascade — what depends on what
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Residential HVAC design follows a deterministic sequence: each step produces inputs the next step requires. Skip any step and the downstream design becomes guesswork. The ACCA cascade:
          </p>

          <ComparisonTable
            headers={["Step", "Standard", "Inputs", "Outputs", "Companion guide"]}
            rows={[
              { label: "1. Load calculation", cells: ["Manual J 8th ed.", "Envelope + climate + occupancy", "Cooling tons + heating BTU/hr + room CFM", "Load calculation guide + calculator"] },
              { label: "2. Equipment selection", cells: ["Manual S", "Manual J load + AHRI ratings + refrigerant choice", "Specific equipment + blower curve TESP budget", "Energy efficiency guide"] },
              { label: "3. Distribution decision", cells: ["Design judgment", "Equipment selection + home geometry", "Ducted / ductless / hybrid choice", "(Decision matrix in this guide)"] },
              { label: "4. Ductwork design", cells: ["Manual D 3rd ed.", "Room CFM + blower TESP budget", "Duct sizing + materials + sealing spec", "Duct design guide + calculator"] },
              { label: "5. Ventilation integration", cells: ["ASHRAE 62.2-2022", "Home tightness + occupancy + climate", "Ventilation strategy + ERV/HRV selection", "Mechanical ventilation guide"] },
              { label: "6. Controls + zoning", cells: ["Manufacturer + ACCA judgment", "Equipment type + zoning needs", "Thermostat + zone controller + balance point", "(Covered in this guide)"] },
              { label: "7. IAQ integration", cells: ["ASHRAE 62.2 + 52.2 + manufacturer", "IAQ goals + envelope + occupancy", "Filter strategy + humidity control + radon mitigation", "IAQ guide"] },
              { label: "8. Commissioning + balancing", cells: ["Manual T + ACCA QI 5", "Installed system", "Measured airflow per register + TESP + refrigerant charge", "Commissioning guide"] },
            ]}
          />

          <KeyInsight tone="blue" title="Why the order matters">
            Manual D depends on Manual J for room-by-room CFM (you can&apos;t size ductwork without knowing what each room needs). Manual S depends on Manual J for tonnage (you can&apos;t select equipment without knowing the load). Ventilation integration depends on equipment selection (for ductwork integration patterns). Controls depend on equipment type. Commissioning verifies everything against design. The cascade exists for a reason — out-of-sequence design produces internal inconsistencies that show up as system underperformance for the equipment&apos;s 15-20 year service life.
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <ProcessFlow
              title="ACCA design cascade — J → S → D → T (then commissioning)"
              orientation="horizontal"
              steps={[
                { number: "J", title: "Load calculation", description: "Manual J: heating + cooling at design conditions." },
                { number: "S", title: "Equipment selection", description: "Manual S: capacity match within 90-115% window.", critical: true },
                { number: "D", title: "Ductwork design", description: "Manual D: equal-friction, TESP budget, CFM per room." },
                { number: "T", title: "Airflow balancing", description: "Manual T: test + adjust per-room CFM at commissioning." },
                { number: "✓", title: "Commission", description: "Verify against design intent per QI Std 5." },
              ]}
              caption="The ACCA design cascade — each step depends on the previous. Skipping J leads to oversized equipment. Skipping D leads to airflow problems. Skipping T leaves the system at default fan speed. Each skip compounds into the 25-40% performance gap NIST documents."
            />
          </div>
        </section>

        {/* SECTION 02 — Pre-design */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Pre-design — home characterization + climate analysis
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Before any calculation, characterize the home and its climate:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Conditioned floor area + ceiling heights + stories.</strong> Measured directly; appraisal SF as starting point.</li>
            <li><strong>Envelope inventory.</strong> Each exterior wall surface — U-value (or insulation R-value + framing), orientation. Each window — U-factor + SHGC + area + orientation + shading. Roof + floor assemblies.</li>
            <li><strong>Infiltration.</strong> Blower-door test result (CFM50 → ACHnat via LBL or ASHRAE 119 model) if available; otherwise Manual J Table 5A by construction era + apparent tightness.</li>
            <li><strong>Climate station.</strong> Identify nearest ASHRAE Climatic Design Conditions weather station; record 1% cooling DB + mean coincident WB, 99% heating DB. Optional 0.4% extreme cooling / 99.6% extreme heating for stress-test sizing.</li>
            <li><strong>Occupancy.</strong> Peak occupants (not typical — design for the day with the most people present).</li>
            <li><strong>Internal gains.</strong> Equipment + lighting baseline; modify for kitchens with heavy cooking, home offices with multiple computers, indoor pools, etc.</li>
            <li><strong>Climate goals.</strong> Indoor design conditions (75°F / 50% RH cooling, 70°F heating typical residential).</li>
          </ol>

          <FixCallout>
            <strong>Why pre-design matters:</strong> Manual J&apos;s output is only as good as its inputs. A casual &quot;guesstimate&quot; envelope description produces a casual load calculation, which produces a casual equipment selection, which produces a casual system. Spend the time on home characterization — it&apos;s the foundation everything else builds on.
          </FixCallout>
        </section>

        {/* SECTION 03 — Step 1: Load calculation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Step 1 — Manual J load calculation
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual J computes the home&apos;s peak cooling load (BTU/hr → tonnage) and peak heating load (BTU/hr) at design conditions. Eight cooling-load components: walls, windows (conduction + solar), roof, floor, infiltration sensible, infiltration latent, people, equipment + lighting. Three heating-load components: conduction through envelope, infiltration sensible, no solar or internal gains credit (conservative).
          </p>

          <KeyInsight tone="blue" title="Outputs needed for downstream steps">
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><strong>Total cooling load (BTU/hr → tons)</strong> — input to Manual S equipment selection</li>
              <li><strong>Sensible Heat Ratio (SHR)</strong> — must match equipment SHR for humidity control</li>
              <li><strong>Heating load (BTU/hr)</strong> — input to furnace sizing or heat pump aux heat sizing</li>
              <li><strong>Room-by-room CFM</strong> — input to Manual D ductwork design</li>
              <li><strong>Design CFM total</strong> — for blower selection + ductwork TESP calculation</li>
            </ul>
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Manual S equipment sizing window — 3-ton cooling load example"
              orientation="horizontal"
              data={[
                { label: "Undersized (under 90%)", value: 2.5, sub: "tons", color: "#dc2626" },
                { label: "Manual S minimum (90%)", value: 2.7, sub: "tons", color: "#10b981" },
                { label: "Calculated load", value: 3.0, sub: "tons", color: "#16a34a", emphasis: true },
                { label: "Manual S maximum (115%)", value: 3.45, sub: "tons", color: "#10b981" },
                { label: "Oversized (over 115%)", value: 4.0, sub: "tons", color: "#dc2626" },
              ]}
              axisLabel="Equipment cooling capacity (tons)"
              caption="Manual S requires equipment capacity to fall within 90-115% of calculated load. Smaller = capacity falls short on design days. Larger = short-cycling, poor dehumidification, accelerated wear. The window is narrow on purpose — a 4-ton AC on a 3-ton load is the most common Manual S violation in residential."
            />
          </div>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For quick screening + verification, use our interactive <Link href="/hvac-load-calculator/" className="underline">load calculator</Link> (7-input simplified Manual J accurate ±20%). For permit-required new construction, hire a professional with full Manual J software (Wrightsoft Right-J, EnergyGauge, Carrier HAP, Cool Calc) — see our <Link href="/hvac-load-calculation-guide/" className="underline">load calculation guide</Link> for the deep methodology.
          </p>
        </section>

        {/* SECTION 04 — Step 2: Equipment selection */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Step 2 — Manual S equipment selection
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual S converts the Manual J cooling tonnage into a specific equipment selection within the sizing window. The four key checks:
          </p>

          <ComparisonTable
            headers={["Check", "Acceptance criterion", "Why it matters"]}
            rows={[
              { label: "Cooling tonnage sizing window", cells: ["90-115% Manual J for single-stage; 100-125% two-stage; 100-130% variable-capacity", "Oversized = short-cycling; undersized = capacity falls short"] },
              { label: "AHRI capacity at HOME design conditions", cells: ["Equipment capacity at the home's actual outdoor + indoor design temps ≥ Manual J load", "AHRI standard rating is 95°F/67°F; need expanded performance data for non-standard conditions"] },
              { label: "Equipment SHR ≤ load SHR", cells: ["Match equipment SHR to home's sensible-vs-latent split", "Sensible-heavy equipment can't control humidity in humid climates"] },
              { label: "Airflow match", cells: ["Equipment design CFM matches Manual J design CFM at acceptable TESP", "Mismatched airflow = duct system can't deliver design CFM"] },
              { label: "Heating capacity at 99% design temp", cells: ["Heat pump output at design temp + aux heat ≥ Manual J heating; OR furnace BTU/hr / AFUE ≥ Manual J heating", "Insufficient heating capacity at design conditions = can't keep up on coldest day"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The decision: <Link href="/hvac-energy-efficiency-guide/" className="underline">heat pump vs gas furnace</Link>, single-stage vs two-stage vs variable-capacity, A1 vs A2L refrigerant. All of these are Manual S choices within the framework of meeting the Manual J load.
          </p>
        </section>

        {/* SECTION 05 — Refrigerant choice */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Step 3 — Refrigerant choice under AIM Act
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EPA&apos;s Technology Transitions Final Rule (October 2023, 40 CFR Part 84 Subpart B) prohibits new residential AC and heat pump equipment with refrigerant GWP &gt;700 effective January 1, 2025. This regulatory shift makes A2L refrigerants the new equipment baseline:
          </p>

          <ComparisonTable
            headers={["Refrigerant", "Type", "GWP", "ASHRAE 34 class", "New equipment status (US, 2026)"]}
            rows={[
              { label: "R-410A", cells: ["HFC blend", "2088", "A1", "New equipment sales restricted; service supply via allowance-constrained virgin + reclaim"] },
              { label: "R-32", cells: ["HFC pure", "675", "A2L", "New equipment allowed; growing market share"] },
              { label: "R-454B", cells: ["HFC/HFO blend", "466", "A2L", "New equipment allowed; primary R-410A replacement"] },
              { label: "R-454C", cells: ["HFC/HFO blend", "148", "A2L", "New equipment allowed; commercial refrigeration focus"] },
              { label: "R-455A", cells: ["HFC/HFO blend", "148", "A2L", "New equipment allowed; some HVAC applications"] },
              { label: "R-1234yf", cells: ["HFO", "&lt;1", "A2L", "Mobile AC standard; some stationary applications"] },
              { label: "R-744 (CO₂)", cells: ["Natural", "1", "A1", "Commercial refrigeration; emerging heat pump applications"] },
              { label: "R-290 (propane)", cells: ["Natural", "3", "A3", "Small appliances; commercial refrigeration; emerging mini-split applications"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For new residential equipment in 2026, the practical choice is R-32 or R-454B for split AC and heat pumps. Both are A2L (mildly flammable per ASHRAE 34), which adds installation and service safety procedures (UL-listed A2L equipment, no open flames during service, ventilation requirements). For service of existing R-410A equipment, R-410A remains available via the AIM Act allowance system + reclamation supply. See our <Link href="/refrigerant-prices-guide/" className="underline">refrigerant prices guide</Link> for the regulatory mechanism + <Link href="/refrigerant-safety-classifications/" className="underline">safety classifications</Link> for A2L handling requirements.
          </p>
        </section>

        {/* SECTION 06 — Distribution decision */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Step 4 — Distribution decision (ducted vs ductless vs hybrid)
          </h2>

          <ComparisonTable
            headers={["Distribution", "Pros", "Cons", "Best for"]}
            rows={[
              { label: "Ducted central", cells: ["Single equipment unit; central filtration; whole-home conditioning; cheaper per ton for larger homes", "Duct losses (15-40% if poorly installed); requires substantial ductwork install or existing ducts", "New construction with conditioned-space ducts; homes with existing accessible ductwork; large homes"] },
              { label: "Ductless mini-split", cells: ["Zero duct losses; per-zone control; quiet; works in tight construction; eliminates retrofit ductwork", "Multiple indoor head units visible; higher cost per zone; not whole-home filtration", "Older homes without ductwork; additions; converted spaces; high-performance tight construction"] },
              { label: "Hybrid (ducted + ductless)", cells: ["Best of both — main spaces ducted; problem zones (bonus room, basement) handled by mini-split", "Two systems to maintain; more equipment to inventory + service", "Complex homes with additions or distinct zones; renovations of non-uniform spaces"] },
              { label: "VRF (Variable Refrigerant Flow)", cells: ["Per-zone control + central refrigerant + simultaneous heating/cooling capability", "Commercial-grade cost; complex install; specialized service technicians", "Light commercial; high-end multi-zone residential; mixed-use spaces"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For typical residential 2026: ducted central with variable-capacity cold-climate heat pump remains the default for new construction in climate zones with both substantial heating and cooling loads. Ductless deserves consideration for: older homes without ductwork; additions and converted spaces; problem zones the central system can&apos;t serve well (bonus rooms, basements, sunrooms). Hybrid combines both — typically the optimal residential solution for complex homes with mixed envelope quality.
          </p>
        </section>

        {/* SECTION 07 — Step 4: Duct design */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Step 5 — Manual D ductwork design (if ducted)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            For ducted systems, Manual D produces a ductwork design that delivers each room&apos;s Manual J CFM within the equipment&apos;s blower curve TESP budget. The key decisions:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>System topology.</strong> Trunk-and-branch (most common residential), extended/reducing plenum (optimized), radial (compact homes with central equipment), perimeter loop (cold-climate slab-on-grade).</li>
            <li><strong>Sizing method.</strong> Equal-friction at 0.08 in.w.c./100 ft (residential supply) per ACCA Manual D Table 7; 0.05 for return.</li>
            <li><strong>Material.</strong> Galvanized rigid for trunks + long runs; flex for short connections (under 25 ft) at boots.</li>
            <li><strong>Insulation.</strong> R-8 supply / R-6 return minimum in unconditioned space per IECC R403.3.</li>
            <li><strong>Sealing.</strong> Mastic + mesh on all seams per SMACNA CL-12 minimum; ≤4 CFM25/100 ft² conditioned floor area per IECC R403.3.5.</li>
            <li><strong>Total External Static Pressure budget.</strong> Sum all friction + fitting losses + filter ΔP + coil ΔP + grille losses; verify within blower curve at design CFM.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Use our interactive <Link href="/duct-size-calculator/" className="underline">duct size calculator</Link> for equal-friction sizing per section; consult our <Link href="/hvac-duct-design-guide/" className="underline">duct design guide</Link> for the full Manual D methodology + topology selection + TESP budgeting.
          </p>
        </section>

        {/* SECTION 08 — Step 5: Ventilation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Step 6 — ASHRAE 62.2 mechanical ventilation
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            For tight modern construction (≤3 ACH50 per IECC R402.4.1.2), natural infiltration is insufficient for IAQ. ASHRAE 62.2 requires mechanical ventilation at a rate of 7.5 CFM × (bedrooms + 1) + 0.03 × floor area in ft². The integration decision:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Strategy:</strong> exhaust-only (cheapest), supply-only (positive pressure), balanced (neutral pressure), balanced with ERV/HRV (energy recovery).</li>
            <li><strong>For new construction in Zones 4+:</strong> ERV or HRV is typically the optimal choice — recovers 60-80% of ventilation energy and preserves indoor humidity.</li>
            <li><strong>Climate-specific:</strong> ERV for Zones 1-5; HRV for Zones 6-8 (very dry winter air would over-humidify through ERV moisture transfer).</li>
            <li><strong>Ductwork integration:</strong> standalone (own ductwork), supply-to-HVAC-return (most common), full HVAC integration (most efficient but complex).</li>
            <li><strong>Sizing:</strong> per the 62.2 formula for total CFM; add local exhaust per 62.2 (kitchen 100 CFM intermittent; baths 50 CFM intermittent each).</li>
            <li><strong>Make-up air:</strong> required by IRC M1503.4 for range hoods 400+ CFM.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            See our <Link href="/hvac-mechanical-ventilation-guide/" className="underline">mechanical ventilation guide</Link> for the full ERV vs HRV selection methodology + climate strategy + commissioning procedures.
          </p>
        </section>

        {/* SECTION 09 — Step 7: Controls */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Step 7 — Controls + zoning design
          </h2>

          <ComparisonTable
            headers={["Equipment type", "Thermostat type", "Typical cost", "Notes"]}
            rows={[
              { label: "Single-stage AC + furnace", cells: ["Basic programmable", "$50-150", "Most existing residential; simple compatibility"] },
              { label: "Two-stage equipment", cells: ["Smart thermostat with 2-stage support", "$200-300", "Ecobee, Nest, Honeywell — handles staging logic"] },
              { label: "Variable-capacity / inverter", cells: ["Manufacturer's communicating thermostat", "$300-600", "Often required for proper modulation; some 3rd-party compatible"] },
              { label: "Heat pump (any type)", cells: ["Thermostat with heat pump support + balance-point config", "$150-600", "Balance point + aux heat lockout settings critical for efficiency"] },
              { label: "Multi-zone system", cells: ["Zone controller + thermostat per zone", "$200-600 per zone", "Motorized dampers; zone controller integrates"] },
              { label: "Ductless mini-split", cells: ["Wall-mounted controller per indoor head unit", "Included", "Some support WiFi + smart-home integration"] },
              { label: "Geothermal heat pump", cells: ["Manufacturer's thermostat (often communicating)", "$300-500", "Loop temperature monitoring often included"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Zoning decision:</strong> single-zone for uniform-load homes; multi-zone (2-4 zones typical residential) for multi-story homes, distinctly different orientations, or wings with different occupancy patterns. Zoning cost: $1,500-4,000 for 2-3 zone retrofit; for new construction, design zoning into ductwork layout from the start. For homes where zoning needs are dominant in 1-2 problem zones, ductless mini-split per zone is often comparable in cost and simpler.
          </p>
        </section>

        {/* SECTION 10 — IAQ integration */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Step 8 — IAQ integration
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            IAQ integrates throughout the design rather than as a single post-installation add-on. Key design considerations:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Filter strategy.</strong> MERV 13 minimum for IAQ-sensitive households; 4-5 inch deep-pleated filter housing for low pressure drop. Design filter housing into HVAC equipment selection from the start.</li>
            <li><strong>Humidity control.</strong> Variable-capacity equipment for latent control; supplemental dehumidifier ($1,500-3,000 installed) for hot/humid climates; winter humidification ($400-800 installed) for very cold/dry climates.</li>
            <li><strong>Radon (if applicable).</strong> Pre-construction radon test or sub-slab depressurization rough-in during foundation work; mitigation if elevated.</li>
            <li><strong>UV-C disinfection.</strong> Optional coil-mounted UV-C lamps ($200-500 installed) to prevent biological growth on indoor coil; particularly valuable in humid climates.</li>
            <li><strong>Source control.</strong> Specify low-VOC materials throughout construction; eliminate gas appliances where electrification is viable; vent range hoods outside.</li>
            <li><strong>Combustion safety.</strong> CO alarms per IRC R315; combustion analysis at commissioning if fuel-burning equipment installed.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            See our <Link href="/hvac-indoor-air-quality-guide/" className="underline">IAQ guide</Link> for the EPA three-pillar strategy (source control → ventilation → filtration) + detailed pollutant categories + radon/mold/CO life safety.
          </p>
        </section>

        {/* SECTION 11 — Commissioning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Step 9 — Commissioning + documentation
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual T commissioning verifies the installed system delivers the designed performance. The 14-point ACCA QI Standard 5 commissioning sequence includes: filter inspection, coil cleaning, refrigerant charge verification (SH/SC at design conditions), TESP measurement, per-register CFM measurement + balancing, combustion analysis for gas equipment, control system verification, IECC R402 envelope blower-door test, IECC R403.3.5 duct leakage Duct Blaster test. The commissioning package handed to the homeowner includes Manual J report, Manual S equipment data, Manual D ductwork plan, commissioning checklist with measured values, warranty registration, and maintenance schedule.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            See our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link> for the full Manual T + QI Standard 5 commissioning sequence and our <Link href="/hvac-maintenance-service-guide/" className="underline">maintenance guide</Link> for the ongoing maintenance schedule that preserves the commissioned performance.
          </p>
        </section>

        {/* SECTION 12 — Decision matrices */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Design decision matrices (the major choices)
          </h2>

          <ComparisonTable
            headers={["Decision", "When to choose A", "When to choose B"]}
            rows={[
              { label: "Heat pump vs gas furnace", cells: ["Electricity &lt;$0.15/kWh; Zones 1-5; want IRA tax credit", "Gas &lt;$1.00/therm; Zones 7-8 with reliability concerns"] },
              { label: "Single-stage vs variable-capacity", cells: ["Mild climate + short cooling season + budget tight", "Hot/humid climate + long season + 7+ year ownership"] },
              { label: "Ducted vs ductless", cells: ["New construction + accessible ductwork space + whole-home filtration goal", "No existing ducts + retrofit + per-zone control desired"] },
              { label: "ERV vs HRV", cells: ["Zones 1-5 + humid climate", "Zones 6-8 + very dry winter outdoor air"] },
              { label: "Single zone vs multi-zone", cells: ["Uniform load + open plan + compact home", "Multi-story + distinct orientations + different occupancy patterns"] },
              { label: "MERV 8 vs MERV 13+ filtration", cells: ["No IAQ-sensitive occupants + tight budget", "Asthma/allergies/COVID concerns; ENERGY STAR; post-2020 standard"] },
              { label: "R-32 vs R-454B (new equipment)", cells: ["OEM preference; Daikin tends R-32", "OEM preference; Carrier/Trane tend R-454B"] },
              { label: "Communicating thermostat vs standard", cells: ["Variable-capacity equipment requiring proprietary controls", "Single-stage or 2-stage equipment with standard 24V thermostat"] },
              { label: "Whole-home dehumidifier vs nothing", cells: ["Hot/humid climate where AC sizing alone can't control RH", "Mild climate where AC produces adequate latent removal"] },
            ]}
          />
        </section>

        {/* SECTION 13 — Common failures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Common HVAC design failures
          </h2>

          <TechSection icon="problem" tone="amber" title="Failure 1 — Oversizing equipment by rule of thumb">
            Skipping Manual J in favor of &quot;500 ft²/ton&quot; or similar. Produces 25-50% oversizing in modern construction, short-cycling, humidity problems, 10-25% higher bills. Fix: run Manual J + Manual S per the ACCA cascade. Use our <Link href="/hvac-load-calculator/" className="underline">load calculator</Link> for screening + verification.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 2 — Undersized return ductwork">
            Designer sizes return at supply&apos;s 0.08 friction target instead of 0.05. Return ends up smaller than supply at same CFM; return velocity exceeds 600 fpm; audible whoosh; blower starved of air; system airflow drops 10-20%. Fix: Manual D return sizing at 0.05 friction.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 3 — Wrong equipment SHR for climate">
            Single-stage AC with high rated SHR (sensible-heavy) installed in hot/humid climate. Equipment satisfies thermostat (sensible cooling) before pulling enough latent; indoor RH climbs to 65-75% even at 72°F setpoint. Fix: variable-capacity equipment with appropriate SHR match; or supplemental dehumidifier.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 4 — Heat pump aux heat strips left active">
            Heat pump installed but thermostat configured so aux electric resistance strips activate on every heat call regardless of outdoor temperature. Heating energy bills 2-3× expected because aux heat (COP 1.0) dominates instead of heat pump (COP 2.5-4.0). Fix: thermostat balance-point configuration; aux heat lockout above balance point.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 5 — Ducts in unconditioned attic without proper seal + insulation">
            R-22 vintage ducts in 130-150°F summer attic, taped seams (now failed), legacy R-4.2 insulation. 25-40% capacity loss to attic gains + leakage. Fix: mastic-seal to SMACNA CL-24; insulate to IECC R-8 minimum; consider sealed/conditioned attic.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 6 — Skipping ASHRAE 62.2 ventilation in tight construction">
            New construction with ≤3 ACH50 envelope tightness and no mechanical ventilation. Indoor CO₂ exceeds 1,500 ppm during occupied hours; VOCs accumulate from materials + products; humidity control becomes problematic. Fix: ASHRAE 62.2 mechanical ventilation per IRC M1505; ERV preferred for new construction in most climates.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 7 — Skipping commissioning + documentation">
            System installed but never commissioned. Per-register CFM unmeasured; refrigerant charge unverified; TESP unknown; controls unverified. Symptoms: hot/cold rooms; humidity problems; high bills. Often discovered only after homeowner has lived with the system for years. Fix: ACCA QI Standard 5 commissioning + documentation package handoff. See our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link>.
          </TechSection>
        </section>

        {/* SECTION 14 — Code compliance */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Code compliance overview
          </h2>

          <ComparisonTable
            headers={["Code / Standard", "What it requires", "Applies to"]}
            rows={[
              { label: "IRC 2021 Section M1401.3", cells: ["Sizing per ACCA Manual J or equivalent", "All residential equipment installation"] },
              { label: "IRC 2021 Section M1505", cells: ["Mechanical ventilation per ASHRAE 62.2", "New residential construction"] },
              { label: "IRC 2021 Chapter 16", cells: ["Ductwork construction + sealing", "All residential ductwork"] },
              { label: "IRC 2021 Section R315", cells: ["CO alarms in homes with fuel-burning equipment", "All residential"] },
              { label: "IECC 2021 R402.4.1.2", cells: ["Envelope blower door test (≤5 ACH50 Z1-2, ≤3 ACH50 Z3-8)", "New residential construction"] },
              { label: "IECC 2021 R403.3 + R403.3.5", cells: ["Duct insulation + leakage testing (≤4 CFM25/100ft² inside; ≤8 outside)", "New residential construction"] },
              { label: "IECC 2021 R403.6", cells: ["Mechanical ventilation fan efficiency limits", "New residential construction"] },
              { label: "EPA 40 CFR Part 84", cells: ["AIM Act HFC phase-down; new equipment must use refrigerant GWP &lt;700", "New AC + heat pump equipment Jan 1, 2025+"] },
              { label: "EPA 40 CFR Part 82 Subpart F", cells: ["EPA Section 608 refrigerant handling", "Any refrigerant work; Type II certification required for residential HVAC"] },
              { label: "California Title 24 Part 6", cells: ["State-specific energy code + HERS compliance", "California new construction"] },
              { label: "NFPA 54", cells: ["National Fuel Gas Code (gas furnace + water heater)", "Fuel-burning equipment"] },
              { label: "ACCA Quality Installation Std 5", cells: ["Voluntary — full design cascade + commissioning + documentation", "ACCA-credentialed contractors; some utility rebates"] },
            ]}
          />
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
              <strong>ACCA Standards (primary design methodology):</strong> ACCA Manual J 8th edition (ANSI/ACCA 2 Manual J — 2016). ACCA Manual S Residential Equipment Selection. ACCA Manual D Residential Duct Systems 3rd ed. ACCA Manual T System Balancing and Air Distribution. ACCA Manual N (commercial load calculation). ACCA Quality Installation Standard 5 — Residential HVAC.
            </p>
            <p className="mt-3">
              <strong>ASHRAE references:</strong> ASHRAE Handbook of Fundamentals 2021 (all chapters relevant). ANSI/ASHRAE/ACCA Standard 180 — commercial maintenance. ANSI/ASHRAE Standard 62.2-2022 (residential ventilation). ANSI/ASHRAE Standard 62.1-2022 (commercial ventilation). ANSI/ASHRAE Standard 90.1-2022 (commercial energy). ANSI/ASHRAE Standard 90.2 (residential energy). ANSI/ASHRAE Standard 111-2022 (TAB measurement). ASHRAE Standard 15 (refrigeration safety) + 34 (refrigerant safety classification).
            </p>
            <p className="mt-3">
              <strong>AHRI standards:</strong> AHRI Standard 210/240 — Performance Rating of Unitary AC + Heat Pump Equipment (with 2023 SEER2/HSPF2 update). AHRI Standard 1380 — Variable-Capacity Heat Pump testing. AHRI Standard 1060 — ERV/HRV testing. AHRI Standard 700-2019 — Refrigerant Specifications. AHRI Standard 740 — Recovery Equipment Performance. AHRI Standard 880 — Air Terminals.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Residential Code (IRC) 2021. International Energy Conservation Code (IECC) 2021. International Mechanical Code (IMC) 2021. California Title 24 Part 6 (state-specific). State and local jurisdictional amendments.
            </p>
            <p className="mt-3">
              <strong>EPA + federal:</strong> EPA Section 608 (40 CFR Part 82 Subpart F) — refrigerant handling. AIM Act (40 CFR Part 84) — HFC phase-down. EPA Technology Transitions Final Rule (October 2023) — new equipment GWP limits. EPA ENERGY STAR Single-Family New Homes Program v3.2.
            </p>
            <p className="mt-3">
              <strong>Certification programs:</strong> ENERGY STAR. RESNET HERS Standards. Passive House Institute US (PHIUS). Passive House Institute (PHI, Germany). NEEP Cold Climate Heat Pump Specification. ACCA Quality Installation contractor credential.
            </p>
            <p className="mt-3">
              <strong>Tax credits + rebates:</strong> Inflation Reduction Act of 2022 (Public Law 117-169). IRC Section 25C + 25D. HEEHRA + HOMES Rebate Programs. State-specific utility rebates.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific manufacturer recommendations (depends on local availability, contractor relationships, refrigerant transition timing). Specific software pricing (changes annually — check vendor sites). State-specific code amendments (consult local building department). Specific contractor referrals (use ACCA contractor directory at accaservice.com; HERS rater directory at resnet.us; NATE certified technician directory at natex.org). For complete design work on permit-required new construction, hire a Manual J + S + D professional with full software credentials.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related — the full cluster */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">The complete HVAC design + operation cluster</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/hvac-load-calculator/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><Gauge className="h-4 w-4" /> Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Quick Manual J — Step 1.</p>
            </Link>
            <Link href="/duct-size-calculator/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><Wind className="h-4 w-4" /> Duct Size Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual D equal-friction — Step 5.</p>
            </Link>
            <Link href="/psychrometric-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Droplet className="h-4 w-4 text-blue-600" /> Psychrometric Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Air properties for design conditions.</p>
            </Link>
            <Link href="/carrier-410a-charging-chart/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Carrier R-410A Chart</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Field charging reference.</p>
            </Link>
            <Link href="/hvac-load-calculation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Load Calculation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J explainer.</p>
            </Link>
            <Link href="/hvac-duct-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Duct Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual D explainer.</p>
            </Link>
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Sun className="h-4 w-4 text-blue-600" /> Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2 + heat pump economics.</p>
            </Link>
            <Link href="/hvac-mechanical-ventilation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Ventilation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ASHRAE 62.2 + ERV/HRV.</p>
            </Link>
            <Link href="/hvac-indoor-air-quality-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> IAQ Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pollutants + filtration + radon/mold.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual T verification — Step 9.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">14-point annual tune-up.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic decision trees.</p>
            </Link>
            <Link href="/hvac-refrigerant-recovery-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> Refrigerant Recovery Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">EPA Section 608 + A2L safety.</p>
            </Link>
            <Link href="/refrigerant-prices-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Snowflake className="h-4 w-4 text-blue-600" /> Refrigerant Prices Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">AIM Act + EU F-Gas economics.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Thermometer, Zap, ListChecks, Lookups, Panel, ServiceProblem, VerdictBanner];
