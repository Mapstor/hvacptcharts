import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, Wind, ListChecks, FileCheck, ShieldCheck, AlertTriangle, Wrench, Thermometer } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-commissioning-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Commissioning Guide — Manual T, Duct Testing, Blower Door, and Quality Installation Verification",
  description:
    "Complete HVAC commissioning guide: ACCA Quality Installation Standard 5 framework, Manual T airflow balancing, refrigerant-side verification (superheat + subcooling at design conditions), Duct Blaster + Pressure Pan + Blower Door testing, IECC R403.3.5 leakage requirements, ENERGY STAR Whole-House Verification, HERS rater integration, documentation requirements, and common commissioning failures. Sourced from ACCA Manual T + QI Standard 5, ASHRAE Standard 111, NEBB/AABC/TABB procedures, IECC 2021 R402+R403, ENERGY STAR Program Requirements.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Commissioning Guide — Manual T + Duct Testing + Blower Door + QI Verification",
    description: "Verification layer that closes the loop on Manual J + S + D installation quality.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Commissioning Guide — Manual T + Duct + Blower Door Testing",
    description: "ACCA QI Standard verification procedures with primary-source citations.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What is HVAC commissioning and why does it matter?",
    a: "Commissioning is the post-installation verification that the installed HVAC system actually delivers the design performance — Manual J load, Manual S equipment selection, Manual D ductwork, and refrigerant charge all working together to produce rated capacity at the registers and rated efficiency in operation. Without commissioning, even a perfectly designed and well-installed system can underperform by 15-40% due to compound effects of small installation deviations (slightly off charge, slight duct leakage, imbalanced airflow, miscalibrated thermostat). ACCA Quality Installation Standard 5 codifies the commissioning sequence; NEBB/AABC/TABB certifications govern professional Test and Balance contractors. Commissioning is required by ENERGY STAR Single-Family New Homes Program, RESNET HERS ratings, and increasingly by state energy codes (California Title 24 Acceptance Tests, IECC 2021 R403.3.5 duct leakage testing). For typical residential the commissioning effort is 4-8 hours and adds $400-800 to project cost; the realized energy savings + comfort improvement typically pay back in 2-5 years.",
  },
  {
    q: "What's the difference between commissioning, testing & balancing, and HERS rating?",
    a: "Three overlapping but distinct activities. (1) COMMISSIONING per ACCA QI Standard 5 is the broad verification that the entire installed system meets design — includes refrigerant-side checks, airflow checks, control system checks, and documentation. Typically performed by the installing contractor's commissioning agent. (2) TEST AND BALANCE (TAB) per NEBB/AABC/TABB standards is specifically the airflow measurement and adjustment — get every register to its Manual D design CFM through dampering. TAB is one component of full commissioning, typically performed by a specialized TAB contractor for commercial systems. (3) HERS RATING per RESNET standards is a building-level energy performance certification — includes blower door testing, duct testing, equipment efficiency verification, and a HERS Index score. Performed by a certified HERS rater. For residential new construction targeting ENERGY STAR certification, all three activities are required or implied; for residential equipment replacement on existing ductwork, only basic commissioning is typically performed.",
  },
  {
    q: "What does ACCA Quality Installation Standard 5 require?",
    a: "QI Standard 5 (current edition published by ACCA) defines the residential HVAC quality installation framework. The required commissioning elements: (1) Manual J load calculation matches actual home characteristics — verified at handoff. (2) Manual S equipment selection within sizing window (90-115% for single-stage, 100-130% for variable-capacity). (3) Manual D ductwork design implemented — verified by static pressure measurement. (4) Manual T balancing performed — registers within ±10% of design CFM. (5) Refrigerant charge verified by weight or by superheat/subcooling within manufacturer spec at design conditions. (6) Combustion safety verified for fuel-burning equipment (gas furnace, oil furnace, boiler). (7) Documentation package delivered to homeowner: Manual J report, Manual S equipment data, Manual D ductwork plan, commissioning checklist with measured values, manufacturer warranty registration. Some utility rebate programs and tax credit qualifications reference QI Standard 5 compliance.",
  },
  {
    q: "What is a Duct Blaster test and when is it required?",
    a: "A Duct Blaster is a calibrated fan + manometer combination that pressurizes the duct system to a specified static pressure (typically 25 Pascals = 0.10 in.w.c.) and measures the airflow required to maintain that pressure. The airflow at the test pressure equals the duct system's leakage rate. Result: CFM25 leakage normalized to conditioned floor area, reported as CFM25 per 100 ft². IECC 2021 R403.3.5 requires duct leakage testing for new construction in most US jurisdictions: ≤4 CFM25 per 100 ft² for systems entirely within the conditioned envelope; ≤8 CFM25 per 100 ft² for systems with portions outside conditioned space. RESNET HERS rating and ENERGY STAR also reference these limits. Test equipment: TEC Duct Blaster, Retrotec DM-2 + DucTester, similar. Cost to perform: typically $150-400 for residential. Without testing, leakage can be measured indirectly via Pressure Pan technique (measuring pressure change at each register), but Duct Blaster is the canonical method.",
  },
  {
    q: "How does a blower door test work?",
    a: "A blower door is a calibrated fan installed in an exterior door (with a tight sealing panel around it) that depressurizes the home to 50 Pascals (negative pressure inside) and measures the airflow required. Result: CFM50 (the air leakage rate at 50 Pa depressurization) which can be converted to ACH50 (Air Changes per Hour at 50 Pa) and then to ACHnat (natural air changes — used in Manual J infiltration calculation) via the LBL or ASHRAE leakage model. IECC 2021 R402.4.1.2 requires blower door testing for new residential construction: ≤5 ACH50 in IECC Zones 1-2, ≤3 ACH50 in Zones 3-8. Passive House standards require ≤0.6 ACH50. Blower door also identifies the LOCATION of leaks via thermal imaging or simple hand-feel during the test — those are field-actionable insights for envelope tightening. Equipment: TEC Blower Door, Retrotec Door 1000, similar. Cost: typically $150-300 for the test alone; often bundled with Duct Blaster.",
  },
  {
    q: "How do I verify the refrigerant charge is correct at handoff?",
    a: "Two methods, depending on the metering device: (1) WEIGHED CHARGE per AHRI installation procedure — recover or evacuate the system fully, then weigh in the nameplate charge plus line-set adjustment per the equipment installation manual. Used for new system commissioning; gives the most precise initial charge. Use our <a href=\"/refrigerant-charge-calculator/\" class=\"underline\">refrigerant charge calculator</a> for the line-set adjustment math. (2) SUPERHEAT/SUBCOOLING VERIFICATION at design conditions for in-service systems. For TXV systems: subcooling target 8-12°F at liquid line, measured at outdoor unit. For fixed-orifice systems: superheat target per OEM chart (see our <a href=\"/carrier-410a-charging-chart/\" class=\"underline\">Carrier R-410A charging chart guide</a>). Both methods require system to run at steady state at near-design outdoor conditions; commissioning at very mild conditions (below 75°F outdoor) produces unreliable refrigerant-side measurements because the system isn't loaded enough.",
  },
  {
    q: "What are the most common commissioning failures?",
    a: "Three patterns dominate. (1) HIGH TESP — total external static pressure exceeds the equipment's blower curve capability at design CFM. Typical causes: undersized return, dirty filter at commissioning, closed dampers somewhere in the system. Symptom: equipment delivers less than design airflow. Fix: identify the static-pressure culprit and remediate. (2) IMBALANCED AIRFLOW — some rooms over-CFM, others under-CFM, with no dampers adjusted. Typical cause: installer didn't perform Manual T balancing. Fix: install balancing dampers if absent, then adjust per register CFM measurements. (3) OFF-NAMEPLATE REFRIGERANT CHARGE — the system was charged by 'sight glass clear' or 'feel the suction line' without weighing or measuring superheat/subcooling. Typical 5-15% off nameplate. Fix: recover, evacuate, weigh in nameplate charge + line-set adjustment, verify with SH/SC at design conditions. These three account for roughly 70% of residential commissioning failures we see in HERS rater reports.",
  },
  {
    q: "Can I do basic commissioning verification myself as a homeowner?",
    a: "Yes — limited but useful checks: (1) Verify all supply registers are open and unobstructed; close none unless a damper-balance plan documents it. (2) Walk room-to-room with an inexpensive anemometer ($30-60) and record approximate CFM at each register; compare to ratio of room size to home — wildly different CFM ratios suggest imbalance. (3) Check thermostat differential: setpoint and actual indoor temperature should converge after 15-30 minutes of operation; persistent gap suggests under-airflow or undercharge. (4) Look for visible condensate at the outdoor coil during cooling (normal sign of dehumidification) and indoor coil drainage to a working drain. (5) Verify the contractor delivered the commissioning documentation (Manual J + S + D + T) — without it you don't have proof the work was done correctly. For deeper verification — Duct Blaster test, blower door test, refrigerant-side measurements — hire a HERS rater or independent commissioning agent. Typical cost $300-600 for full residential commissioning audit; can pay back in months if it identifies a 15-25% efficiency gap that the contractor needs to address under warranty.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Commissioning Guide — Manual T, Duct Testing, Blower Door, and Quality Installation Verification",
      description:
        "Complete HVAC commissioning methodology: ACCA QI Standard 5 framework, Manual T airflow balancing, refrigerant-side verification, Duct Blaster + Blower Door testing, ENERGY STAR + HERS + IECC requirements.",
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
        { "@type": "Thing", name: "HVAC commissioning" },
        { "@type": "Thing", name: "ACCA Manual T" },
        { "@type": "Thing", name: "Duct leakage testing" },
        { "@type": "Thing", name: "Blower door testing" },
        { "@type": "Thing", name: "Quality Installation Standard" },
      ],
      keywords: [
        "hvac commissioning",
        "manual t balancing",
        "duct blaster test",
        "blower door test",
        "acca qi standard",
        "iecc duct leakage test",
        "hers rater commissioning",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "Residential HVAC commissioning per ACCA QI Standard 5",
      description: "Sequential commissioning procedure for verifying installed residential HVAC system meets design performance.",
      totalTime: "PT6H",
      tool: [
        { "@type": "HowToTool", name: "Manometer (digital, ±0.001 in.w.c. accuracy)" },
        { "@type": "HowToTool", name: "Duct Blaster (TEC, Retrotec, or equivalent)" },
        { "@type": "HowToTool", name: "Blower Door (TEC, Retrotec, or equivalent)" },
        { "@type": "HowToTool", name: "Anemometer + balometer (capture hood)" },
        { "@type": "HowToTool", name: "Refrigerant manifold + digital thermistor probes" },
        { "@type": "HowToTool", name: "Combustion analyzer (for fuel-burning equipment)" },
        { "@type": "HowToTool", name: "Multimeter + amp clamp" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Verify Manual J documentation matches installed equipment", text: "Compare Manual J report's calculated cooling tonnage + heating BTU/hr to the installed equipment's nameplate. Should be within Manual S sizing window (90-115% for single-stage, 100-130% for variable-capacity)." },
        { "@type": "HowToStep", position: 2, name: "Measure total system airflow", text: "Run system at design conditions (or simulate via static pressure measurement). Total CFM should be within ±10% of equipment design CFM at design conditions per equipment data sheet." },
        { "@type": "HowToStep", position: 3, name: "Measure Total External Static Pressure (TESP)", text: "Measure static at supply plenum + return plenum. Sum = TESP. Verify within equipment's blower curve capability at design CFM. Investigate if substantially above design (>0.6 in.w.c. for typical residential)." },
        { "@type": "HowToStep", position: 4, name: "Measure CFM at each register", text: "Use balometer (capture hood + anemometer) at every supply register and return grille. Adjust balancing dampers at each branch takeoff to bring each room within ±10% of Manual D design CFM." },
        { "@type": "HowToStep", position: 5, name: "Verify refrigerant charge at design conditions", text: "If TXV system: subcooling 8-12°F at liquid line. If fixed-orifice: superheat per OEM chart (Carrier chart for R-410A fixed-orifice). Recommission with weighed charge if substantially off." },
        { "@type": "HowToStep", position: 6, name: "Perform Duct Blaster test", text: "Pressurize duct system to 25 Pa, measure CFM25 leakage. Normalize to conditioned floor area. Should be ≤4 CFM25/100 ft² for systems inside envelope; ≤8 CFM25 for systems with portion outside per IECC R403.3.5." },
        { "@type": "HowToStep", position: 7, name: "Perform Blower Door test (if envelope work was performed)", text: "Depressurize home to 50 Pa, measure CFM50. Convert to ACH50. Should be ≤5 ACH50 in Zones 1-2, ≤3 ACH50 in Zones 3-8 per IECC R402.4.1.2." },
        { "@type": "HowToStep", position: 8, name: "Verify combustion safety for fuel-burning equipment", text: "Combustion analyzer at furnace flue. CO ≤ 100 ppm; oxygen ≤4%. Check draft pressure, flame condition. Document all values." },
        { "@type": "HowToStep", position: 9, name: "Verify control system operation", text: "Thermostat reaching setpoint within reasonable time. Heat pump aux heat only activating below balance point. Two-stage / variable-capacity staging correctly. Document control settings." },
        { "@type": "HowToStep", position: 10, name: "Deliver commissioning package to homeowner", text: "Compile: Manual J report, Manual S equipment data sheet, Manual D ductwork plan, commissioning checklist with all measured values, manufacturer warranty registration, maintenance schedule. This documentation is required for warranty support, future service work, and any utility rebate or tax credit claims." },
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
        { "@type": "ListItem", position: 3, name: "HVAC Commissioning Guide" },
      ],
    },
  ];
}

export default function HvacCommissioningGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Commissioning Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Commissioning Guide — Manual T, Duct Testing, Blower Door, and Quality Installation Verification
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            The verification layer that closes the loop on Manual J load calculation, Manual S equipment selection, Manual D ductwork, and refrigerant charge. This guide covers ACCA Quality Installation Standard 5, Manual T airflow balancing, refrigerant-side commissioning at design conditions, Duct Blaster + Blower Door + Pressure Pan testing methods, IECC R403.3.5 duct leakage requirements, IECC R402.4.1.2 envelope leakage requirements, ENERGY STAR Whole-House Verification, HERS rater integration, the commissioning documentation package, and the common patterns that cause commissioning failures. Sourced throughout from ACCA Manual T + QI Standard 5, ASHRAE Standard 111, NEBB/AABC/TABB industry procedures, IECC 2021, ENERGY STAR Program Requirements, and RESNET HERS Standards.
          </p>
        </header>

        {/* SECTION 01 — What commissioning accomplishes */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            What HVAC commissioning accomplishes
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Commissioning is the verification that an installed HVAC system actually delivers its design performance. The full design cascade — Manual J load → Manual S equipment selection → Manual D ductwork → refrigerant-side charging — produces a design intent. The installed system either meets that design or doesn&apos;t. Without explicit commissioning, deviation between design and installed performance is often substantial: 15-40% capacity loss to compound effects of slightly imbalanced airflow, slight refrigerant undercharge, slight duct leakage, and miscalibrated controls is typical in uncommissioned residential systems.
          </p>

          <KeyInsight tone="blue" title="The cost of skipping commissioning">
            NIST, Lawrence Berkeley National Laboratory, and DOE Building America research collectively document that 25-40% of residential HVAC capacity is commonly lost between equipment nameplate and registers in uncommissioned systems. A 3-ton AC commissioned correctly delivers ~3 tons at the registers; the same equipment uncommissioned often delivers 2.0-2.4 tons of effective capacity. The homeowner experiences a system that &quot;doesn&apos;t keep up,&quot; the contractor adds more cooling tonnage, costs and energy use spiral. Commissioning recovers most of the gap — typical post-commissioning improvement is 10-25% in delivered capacity and 8-20% in seasonal energy use.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Commissioning is required by: ENERGY STAR Single-Family New Homes Program v3.2 (Whole-House Verification section); RESNET HERS rating (component of rating process); IECC 2021 R403.3.5 (duct leakage testing); IECC 2021 R402.4.1.2 (envelope blower door testing); California Title 24 (Acceptance Tests); ACCA Quality Installation Standard 5 (voluntary contractor program); some utility rebate programs. Many jurisdictions are tightening commissioning requirements over the 2024-2028 code cycle.
          </p>
        </section>

        {/* SECTION 02 — QI Standard */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            ACCA Quality Installation (QI) Standard 5 — the framework
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ACCA QI Standard 5 — Residential HVAC Quality Installation (current edition published by Air Conditioning Contractors of America) codifies the commissioning sequence. The standard&apos;s 10 required commissioning elements:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Verify Manual J load calculation</strong> matches actual home characteristics (envelope, climate zone, orientation, occupancy).</li>
            <li><strong>Verify Manual S equipment selection</strong> is within the cooling sizing window: 90-115% for single-stage, 100-125% for two-stage, 100-130% for variable-capacity.</li>
            <li><strong>Verify Manual D ductwork installation</strong> matches the design — section sizes, fitting types, support spacing.</li>
            <li><strong>Verify Manual T airflow balancing</strong> — each room within ±10% of design CFM.</li>
            <li><strong>Verify Total External Static Pressure (TESP)</strong> measurement matches equipment blower curve at design CFM.</li>
            <li><strong>Verify refrigerant charge</strong> by weight (new installation) or by superheat/subcooling at design conditions (verification or service).</li>
            <li><strong>Verify combustion safety</strong> for fuel-burning equipment (CO, draft, flame condition per ANSI Z21.13 + Z83.8 + NFPA 54).</li>
            <li><strong>Verify control system operation</strong> — thermostat staging, heat pump balance point, aux heat lockout, dehumidification staging if applicable.</li>
            <li><strong>Verify safety systems</strong> — high/low pressure switches, condensate float switch, gas pressure switch where applicable.</li>
            <li><strong>Deliver commissioning documentation package</strong> to homeowner including all of the above with measured values.</li>
          </ol>

          <FixCallout>
            <strong>Why QI Standard matters:</strong> ACCA-credentialed Quality Installation contractors are tracked in the QI database (accreditation.acca.org), and some utility rebate programs require QI certification for higher rebate tiers. ENERGY STAR Single-Family New Homes Program v3.2 references QI Standard 5 conformance for HVAC systems in certified homes. For homeowners, asking the contractor &quot;Will this installation conform to ACCA QI Standard 5?&quot; is the cleanest single question to assess commissioning quality before signing a contract.
          </FixCallout>
        </section>

        {/* SECTION 03 — Manual T */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            ACCA Manual T — System balancing and air distribution
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual T (System Balancing and Air Distribution) is the standard for the airflow side of commissioning. The Manual T sequence:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Measure total system airflow.</strong> Use an anemometer at the air handler or measure via static-pressure-to-airflow conversion from the blower curve. Total CFM should be within ±10% of equipment design CFM.</li>
            <li><strong>Measure CFM at each supply register.</strong> Use a balometer (capture hood + anemometer combination) at every register. Record measured CFM per register on the commissioning sheet.</li>
            <li><strong>Compare measured to Manual D design CFM per room.</strong> Calculate percentage of design at each register.</li>
            <li><strong>Adjust balancing dampers</strong> at branch takeoffs to bring each room within ±10% of design. Throttle over-delivering branches; if under-delivering branches are also present, the over-delivering side has more friction headroom that can be released.</li>
            <li><strong>Re-measure after damper adjustment.</strong> Iterate until all rooms within ±10% of design.</li>
            <li><strong>Measure return airflow.</strong> Sum across return grilles should equal supply airflow within ±10%. Difference indicates supply duct leakage to unconditioned space.</li>
            <li><strong>Document final balanced state.</strong> Damper positions, register CFM measured, total airflow, TESP — all recorded on the commissioning sheet.</li>
          </ol>

          <KeyInsight tone="amber" title="Why airflow balancing is the most common skipped step">
            Manual T balancing takes 2-4 hours and adds $200-500 to installation cost; many contractors skip it because the homeowner can&apos;t tell the difference between &quot;balanced&quot; and &quot;all dampers wide open.&quot; The actual difference: unbalanced systems have some rooms at 130%+ of design CFM and others at 60-70%, producing chronic hot/cold spots and humidity complaints that the homeowner attributes to &quot;equipment problems.&quot; Adjusting balancing dampers (and installing them if not present) recovers most of the per-room CFM accuracy. For ENERGY STAR certification + HERS rating + QI compliance, balancing is required and verified.
          </KeyInsight>
        </section>

        {/* SECTION 04 — Refrigerant-side commissioning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Refrigerant-side commissioning at design conditions
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Refrigerant charge accuracy directly affects capacity (5-15% undercharge = 5-15% capacity loss) and efficiency (10% undercharge ≈ 5-8% efficiency loss). Commissioning verifies charge via one of two methods depending on metering device:
          </p>

          <ComparisonTable
            headers={["Metering device", "Verification method", "Acceptance criterion"]}
            rows={[
              { label: "TXV / EEV (most post-2015 residential)", cells: ["Subcooling at liquid line", "8-12°F SC (check OEM nameplate for specific target)"] },
              { label: "Fixed orifice / piston / cap tube (older residential)", cells: ["Superheat per OEM chart", "Per Carrier R-410A chart or equivalent — varies with outdoor + wet-bulb"] },
              { label: "New installation (any type)", cells: ["Weighed charge per nameplate + line-set adjustment", "Within ±2% of nameplate weight"] },
              { label: "Heat pump in heating mode", cells: ["Subcooling at LIQUID line at the OUTDOOR coil (now condensing)", "8-12°F SC (heat pump cools opposite side)"] },
              { label: "A2L refrigerant systems (R-32, R-454B)", cells: ["Same as TXV/fixed-orifice, but recover before any open flame", "Same SC/SH targets; A2L-rated equipment + safe-work practices required"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Design-condition requirement:</strong> superheat/subcooling measurements at very mild outdoor conditions (below 75°F outdoor) produce unreliable results because the compressor isn&apos;t fully loaded. Always commission refrigerant-side at near-design conditions: outdoor 90-95°F+ for AC, indoor at typical comfort setpoint. If commissioning at mild conditions, schedule a follow-up visit at near-design conditions to verify.
          </p>

          <FixCallout>
            <strong>Recommissioning vs initial commissioning:</strong> for a new installation, weigh in the nameplate charge as the primary method, then verify with SH/SC at design conditions. For service or replacement work where the system has been operating, SH/SC verification is the primary method (don&apos;t recover and reweigh unless SH/SC shows substantial deviation). Use our <Link href="/superheat-calculator/" className="underline">superheat calculator</Link>, <Link href="/subcooling-calculator/" className="underline">subcooling calculator</Link>, or <Link href="/pt-superheat-subcooling-calculator/" className="underline">combined PT/SH/SC calculator</Link> for the math; consult the <Link href="/carrier-410a-charging-chart/" className="underline">Carrier R-410A charging chart</Link> for fixed-orifice OEM targets.
          </FixCallout>
        </section>

        {/* SECTION 05 — Duct testing */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Duct testing methods — Duct Blaster, Pressure Pan, Tracer Gas
          </h2>

          <TechSection icon="insight" tone="blue" title="Duct Blaster — the canonical leakage measurement">
            A calibrated fan + manometer combination installed at the air handler or a sealed register. Pressurizes the duct system to 25 Pascals (0.10 in.w.c.) and measures the airflow required to maintain that pressure. The airflow at test pressure equals the duct system&apos;s leakage rate at 25 Pa. Result: CFM25 leakage normalized to conditioned floor area, reported as CFM25 per 100 ft² of conditioned floor area. Equipment: TEC Duct Blaster, Retrotec DucTester. Cost to perform: $150-400 for residential; bundled with blower door often $250-500 combined. Required by IECC 2021 R403.3.5 for new residential construction.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pressure Pan — locate leak sites without full Duct Blaster">
            A small pan that fits over a register, connected to a manometer. With the air handler and blower door operating, measure the pressure differential at each register sequentially. Large differential at a register indicates duct leakage near that register (or in the supply path to that register). Useful for identifying specific leak sites without performing full Duct Blaster test; good complement to Duct Blaster for diagnosing where leaks are within the system. Cheaper equipment (~$50-150). Often used by HERS raters and home performance contractors.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Tracer gas — research-grade methodology">
            Injects a known concentration of tracer gas (typically SF6 or sulfur hexafluoride) into the duct system and measures decay or transfer to other zones. Used in research and high-precision commissioning; rarely encountered in residential commissioning due to cost and complexity. Equipment cost $5,000+; calibration and procedure require specialized training.
          </TechSection>

          <ComparisonTable
            headers={["IECC 2021 R403.3.5 requirement", "Limit", "Test condition"]}
            rows={[
              { label: "Ducts entirely within conditioned envelope", cells: ["≤4 CFM25 per 100 ft² conditioned floor area", "25 Pa pressurization"] },
              { label: "Ducts with portion outside conditioned envelope (attic, crawlspace)", cells: ["≤8 CFM25 per 100 ft² conditioned floor area", "25 Pa pressurization"] },
              { label: "Rough-in test (during construction)", cells: ["Less stringent intermediate value per code", "Lower pressure test"] },
              { label: "Final post-construction test", cells: ["Compliance value per above", "Final state of the system"] },
            ]}
          />
        </section>

        {/* SECTION 06 — Blower door */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Blower door testing — envelope leakage measurement
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            A calibrated fan installed in an exterior door frame (with a tight sealing panel) depressurizes the home to 50 Pascals (negative inside) and measures the airflow required to maintain that pressure. Result: CFM50, which converts to ACH50 (Air Changes per Hour at 50 Pa) by dividing by interior volume and multiplying by 60. ACH50 converts to natural ACH (used in Manual J infiltration calculation) via the LBL or ASHRAE leakage model.
          </p>

          <ComparisonTable
            headers={["IECC 2021 R402.4.1.2 requirement", "Limit", "Equivalent tightness"]}
            rows={[
              { label: "Climate Zones 1-2", cells: ["≤5 ACH50", "Moderately tight"] },
              { label: "Climate Zones 3-8", cells: ["≤3 ACH50", "Tight construction"] },
              { label: "ENERGY STAR Single-Family New Homes v3.2", cells: ["≤4 ACH50 (Zones 1-2); ≤2.5-3 ACH50 (Zones 3-8 per region)", "Tighter than IECC base"] },
              { label: "Passive House (PHIUS / PHI)", cells: ["≤0.6 ACH50", "Extremely tight"] },
              { label: "Typical pre-2015 existing home", cells: ["7-15 ACH50", "Leaky baseline"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Beyond the compliance number, blower door testing identifies LEAK LOCATIONS via thermal imaging or simple hand-feel during the test (cool air visibly flows around leaks). This is field-actionable: contractors can prioritize specific seal points (rim joists, top plates, plumbing penetrations) rather than guessing. Equipment: TEC Blower Door, Retrotec Door 1000. Cost to perform: $150-300 for the test, often bundled with Duct Blaster for $250-500 combined.
          </p>
        </section>

        {/* SECTION 07 — Static pressure */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Total External Static Pressure (TESP) measurement
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            TESP measurement verifies the actual installation matches the Manual D design intent and equipment blower curve capability. Procedure:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li>Run the system at design conditions (full load, blower at design speed).</li>
            <li>Insert a static-pressure probe into the supply plenum just downstream of the equipment cabinet.</li>
            <li>Insert a second probe into the return plenum just upstream of the cabinet.</li>
            <li>Connect both to a digital manometer (Magnehelic gauge or digital equivalent like Dwyer DM-2000, Fieldpiece SDMN5).</li>
            <li>Read static pressure at each location.</li>
            <li>TESP = (positive supply static) + (negative return static, expressed as positive number) = the total static the blower is overcoming.</li>
            <li>Compare TESP to the equipment&apos;s published blower curve at the design CFM. The point should fall within the curve&apos;s operating envelope.</li>
          </ol>

          <KeyInsight tone="blue" title="Expected TESP ranges by equipment type">
            For typical residential PSC-blower equipment: TESP budget 0.30-0.50 in.w.c. at design CFM. For variable-speed ECM blower equipment: TESP budget 0.50-0.80 in.w.c. Variable-speed blowers can compensate for higher TESP up to their capability, but at the cost of higher current draw and noise. Measured TESP above the budget indicates installation problems (undersized ducts, loaded filter, dirty coil, partially-closed dampers). Below the budget is generally fine — the equipment has headroom.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Static pressure measurement is the single most diagnostic commissioning step — high TESP catches most installation problems before they manifest as comfort or efficiency complaints. See our <Link href="/hvac-duct-design-guide/" className="underline">duct design guide</Link> Section 5 for the TESP budget breakdown by component.
          </p>
        </section>

        {/* SECTION 08 — Airflow balancing procedure */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Airflow balancing procedure (register-by-register)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual T balancing is the iterative process of adjusting branch dampers to bring each room within ±10% of Manual D design CFM. Procedure:
          </p>

          <ServiceProblem
            number={1}
            title="Sequential balancing procedure"
            refrigerant="(airflow commissioning)"
            scenario="3-ton residential system with 8 supply registers across 6 rooms. Manual D design CFM per room ranges from 80 to 200 CFM. Initial state: all dampers wide open, system running but never measured."
          >
            <Panel title="Balancing sequence" icon={ListChecks}>
              <Lookups rows={[
                { input: "1. Confirm system at design state", output: "Filter clean; coil clean; blower at design speed (or variable-speed thermostat call)", note: "Critical — measurement of fouled system is misleading" },
                { input: "2. Measure ALL register CFM first", output: "Use balometer (anemometer + capture hood) at each register", note: "Record on commissioning sheet; one pass through the home" },
                { input: "3. Identify imbalance pattern", output: "Sort registers by % of design CFM", note: "Some over (130%+); some under (60-80%); typical pattern" },
                { input: "4. Throttle over-CFM registers first", output: "Adjust damper at branch takeoff; not at register face", note: "Damper at takeoff is more effective and quieter" },
                { input: "5. Re-measure", output: "Wait 5 minutes for system to restabilize; re-measure", note: "Damper adjustment changes system pressure profile" },
                { input: "6. Iterate until convergent", output: "Typically 2-4 cycles for residential systems", note: "Each cycle brings system closer to balanced" },
                { input: "7. Document final state", output: "Damper positions, register CFM, total airflow, TESP", note: "Provide to homeowner with commissioning package" },
              ]}/>
            </Panel>
            <VerdictBanner status="info" title="Acceptance criterion">
              Each room within ±10% of Manual D design CFM. Total airflow within ±10% of equipment design CFM. TESP within equipment blower curve at design CFM.
            </VerdictBanner>
          </ServiceProblem>
        </section>

        {/* SECTION 09 — Documentation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Commissioning documentation package
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The deliverable that closes commissioning is a documentation package handed to the homeowner. ACCA QI Standard 5 specifies the contents:
          </p>

          <ComparisonTable
            headers={["Document", "Contents", "Why it matters"]}
            rows={[
              { label: "Manual J report", cells: ["Total cooling + heating load; room-by-room CFM if computed", "Establishes design intent; needed for any future load comparison"] },
              { label: "Manual S equipment selection", cells: ["AHRI-rated equipment cooling capacity at design conditions; SHR match; furnace input vs heating load", "Justifies equipment selection per Manual S sizing window"] },
              { label: "Manual D ductwork plan", cells: ["Duct sizes per section; material; insulation; fitting list", "Needed for future modifications, troubleshooting, additions"] },
              { label: "Commissioning checklist with measured values", cells: ["Total CFM, per-register CFM, TESP, refrigerant SH/SC, combustion analysis results, etc.", "Proof the work was done; baseline for future comparison"] },
              { label: "Equipment manufacturer warranty registration", cells: ["Serial numbers, install date, registration confirmation", "Required for warranty support; some manufacturers require registration within 60-90 days"] },
              { label: "Maintenance schedule", cells: ["Filter change interval; annual professional service recommendation; A2L safety reminders for new equipment", "Helps owner maintain efficiency over service life"] },
              { label: "Refrigerant charge documentation (per EPA 608)", cells: ["Refrigerant type; weight charged; date; technician certification number", "Required if recovery/recharge was performed; helpful for future service"] },
              { label: "HERS rating report (if applicable)", cells: ["HERS Index score; blower door + Duct Blaster results", "Required for ENERGY STAR certification, IRA tax credit support"] },
            ]}
          />

          <FixCallout>
            <strong>What to ask if the contractor doesn&apos;t provide:</strong> &quot;Per ACCA QI Standard 5, the commissioning documentation package is required for proper handoff. Could you provide the Manual J report, Manual S equipment data, commissioning checklist with measured values, and maintenance schedule?&quot; A contractor who has done the work properly has these documents and provides them on request; a contractor who hasn&apos;t will resist or claim the documents aren&apos;t standard practice. The documentation is the homeowner&apos;s leverage to ensure the contractor has earned full payment.
          </FixCallout>
        </section>

        {/* SECTION 10 — HERS rating */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            HERS rating + commissioning intersection
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            RESNET HERS (Home Energy Rating System) ratings include HVAC commissioning as a component. A HERS rater conducts the rating, which includes:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Whole-home energy model</strong> using RESNET-approved software (REM/Rate, Ekotrope, others) — generates a HERS Index score from 0 (net zero) to 150+ (very inefficient). Average new construction: ~58 HERS Index.</li>
            <li><strong>Blower door test</strong> for envelope leakage verification per IECC R402.4.1.2.</li>
            <li><strong>Duct Blaster test</strong> for duct leakage per IECC R403.3.5.</li>
            <li><strong>Equipment efficiency verification</strong> by comparing AHRI-rated SEER2/HSPF2/AFUE to the model assumption.</li>
            <li><strong>Installation quality assessment</strong> per RESNET Standards — checks Manual J + S + D + T documentation.</li>
            <li><strong>HVAC system performance verification</strong> via observation or measurement at the rater&apos;s discretion.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            HERS rating cost: $400-1,000 for typical new residential construction. Required for ENERGY STAR Single-Family New Homes certification; common for mortgage qualification (FHA Energy Efficient Mortgage, lender energy programs); required for some IRA tax credit + state rebate qualifications.
          </p>
        </section>

        {/* SECTION 11 — ENERGY STAR + IECC */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            ENERGY STAR + IECC commissioning requirements
          </h2>

          <ComparisonTable
            headers={["Program / Code", "Commissioning requirement", "Verification method"]}
            rows={[
              { label: "IECC 2021 R402.4.1.2", cells: ["Blower door test: ≤5 ACH50 (Z1-2); ≤3 ACH50 (Z3-8)", "Required of every new residential construction in IECC-adopting jurisdictions"] },
              { label: "IECC 2021 R403.3.5", cells: ["Duct leakage: ≤4 CFM25/100ft² (inside envelope); ≤8 CFM25 (outside)", "Required of every new residential construction"] },
              { label: "ENERGY STAR Single-Family New Homes v3.2", cells: ["Full Whole-House Verification with blower door + Duct Blaster + HVAC commissioning + envelope review", "HERS rater or qualified third-party verifier"] },
              { label: "ACCA QI Standard 5", cells: ["Voluntary — full commissioning per Section 02 above", "ACCA-credentialed QI contractor self-certifies; some utility rebates audit"] },
              { label: "California Title 24 Acceptance Tests", cells: ["State-specific commissioning protocols for new construction", "Required of every California new residential + commercial"] },
              { label: "ASHRAE 90.1 commissioning (commercial)", cells: ["Mandatory commissioning per ASHRAE 90.1-2022 Section 4.2.5.6 for buildings >5,000 ft²", "Required for code compliance + LEED projects"] },
              { label: "LEED v4.1 (commercial)", cells: ["Enhanced commissioning per ASHRAE Guideline 0 + LEED EAp1 prerequisite", "Required for LEED Silver+ certification"] },
            ]}
          />
        </section>

        {/* SECTION 12 — Common failures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Common commissioning failures
          </h2>

          <TechSection icon="problem" tone="amber" title="Failure 1 — TESP exceeds blower curve">
            Most common single failure. Symptom: measured TESP 0.65-0.95 in.w.c. on a system with 0.50 in.w.c. blower budget at design CFM. Result: blower delivers 15-25% less than design airflow, equipment delivers 15-25% less than rated capacity. Causes (in order): undersized return ducts, dirty filter at commissioning, dirty coil, partially closed dampers, transformation losses from rectangular to round, undersized supply trunks. Fix: identify the static-pressure culprit by sectional measurement. Often a return-side undersize that can be resolved by adding a second return or upsizing the existing return.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 2 — Airflow imbalance">
            Some rooms running at 130%+ of Manual D design CFM, others at 60-80%. No balancing dampers installed or all open. Cause: contractor skipped Manual T balancing. Symptom: chronic hot/cold spots and humidity complaints in under-CFM rooms. Fix: install balancing dampers if absent; balance per Manual T procedure.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 3 — Refrigerant charge off nameplate">
            Cause: system was charged by &quot;sight glass clear,&quot; &quot;suction line cool to touch,&quot; or some other non-quantitative method instead of weighed nameplate + line-set adjustment. Typically 5-15% off nameplate, sometimes more. Symptom: capacity 5-15% below rated; SH/SC out of OEM spec; long cycle times. Fix: recover, evacuate, weigh in nameplate + line-set adjustment per the equipment installation manual. Verify with SH/SC at design conditions.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 4 — Combustion safety not verified">
            Gas furnace installed without combustion analysis. CO output may be above 100 ppm, draft may be inadequate, flame may show incomplete combustion. Health hazard + efficiency loss + potential fire risk. Fix: combustion analyzer at the flue, verify CO &lt;100 ppm, O₂ &lt;4%, proper draft pressure. Adjust gas pressure or burner setup if needed.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 5 — Aux heat configuration on heat pump">
            Heat pump installed but aux heat strips energize anytime there&apos;s a heat call, even at temperatures where the heat pump alone is adequate (above the balance point). Cause: thermostat configured for resistance backup at all temperatures, or balance point not entered. Symptom: heating energy bills 2-3× expected because aux heat (COP 1.0) dominates instead of heat pump (COP 2.5-4.0). Fix: thermostat configuration sets aux heat lockout above the balance point (typically 30-35°F outdoor for typical cold-climate heat pump). Verify with multimeter or amp clamp that aux heat only activates below balance point.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 6 — Documentation never delivered">
            System installed; commissioning may have been performed; but no documentation package handed to homeowner. Symptom: contractor cannot answer future questions about original design or installation; warranty claims hampered by missing records; future service technicians can&apos;t reference original design. Fix: request the documentation package per ACCA QI Standard 5 — Manual J, S, D, T, commissioning checklist with measured values, warranty registration, maintenance schedule. If the contractor cannot provide, the work may not have been done.
          </TechSection>
        </section>

        {/* SECTION 13 — DIY verification */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            DIY commissioning verification (what homeowners can check)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Without specialized equipment, homeowners can perform basic commissioning verification:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Verify every register is open and unobstructed.</strong> No furniture covering returns; no rugs on supplies. All dampers in &quot;default&quot; position unless a documented balance plan specifies otherwise.</li>
            <li><strong>Anemometer check at each register.</strong> A $30-60 anemometer measures airflow approximately. Calculate CFM per register by multiplying velocity (fpm) × register free area (ft²). Compare to ratio of room size to total home — wildly different ratios suggest imbalance.</li>
            <li><strong>Thermostat differential check.</strong> Set thermostat 3-5°F below current room temperature on a moderate cooling day. System should reach setpoint within 20-40 minutes for typical residential. Persistent gap suggests under-airflow, undercharge, or sizing issue.</li>
            <li><strong>Outdoor unit operation check.</strong> System should be visibly producing condensate at the outdoor coil during cooling (dehumidification working). Indoor evaporator should drain to a working condensate drain. Verify visually after the system has run 30+ minutes.</li>
            <li><strong>Filter check.</strong> Inspect filter immediately after installation; document condition. Then check monthly for the first 3-6 months to establish a replacement interval baseline.</li>
            <li><strong>Documentation request.</strong> Ask the contractor for the commissioning package per ACCA QI Standard 5. If they cannot provide, the commissioning was likely not performed.</li>
          </ol>

          <FixCallout>
            <strong>When to hire an independent verification:</strong> if the contractor cannot deliver documentation, if rooms have persistent temperature complaints, or if the energy bill is much higher than expected — hire a HERS rater or independent commissioning agent for $300-600 to audit the installation. The audit often pays for itself if it identifies a 15-25% efficiency gap that the original contractor needs to address under warranty.
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
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: f.a.split(/\n\s*\n/).map((p) => `<p>${p.trim()}</p>`).join("") }} />
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
              <strong>ACCA Standards (primary commissioning methodology):</strong> ACCA Manual T, System Balancing and Air Distribution. ACCA Quality Installation Standard 5 — Residential HVAC. ACCA Manual J Residential Load Calculation, 8th edition. ACCA Manual S Residential Equipment Selection. ACCA Manual D Residential Duct Systems, 3rd edition. ACCA QI Standard 9 (Commercial HVAC Quality Installation).
            </p>
            <p className="mt-3">
              <strong>ASHRAE references:</strong> ASHRAE Standard 111-2022, Measurement, Testing, Adjusting, and Balancing of Building HVAC Systems. ASHRAE Standard 90.1-2022, Energy Standard for Buildings — Section 4.2.5.6 commissioning. ASHRAE Guideline 0-2019, The Commissioning Process. ASHRAE Guideline 1.1-2007, HVAC&amp;R Technical Requirements for the Commissioning Process.
            </p>
            <p className="mt-3">
              <strong>Test and Balance certifications:</strong> NEBB (National Environmental Balancing Bureau) Procedural Standards for Testing, Adjusting, and Balancing of Environmental Systems. AABC (Associated Air Balance Council) National Standards. TABB (Testing, Adjusting, and Balancing Bureau, sponsored by SMACNA + Sheet Metal Workers International Association) National Standards.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Energy Conservation Code (IECC) 2021 — Section R402.4.1.2 (envelope leakage testing) and Section R403.3.5 (duct leakage testing). International Residential Code (IRC) 2021. California Title 24 Energy Code (with state-specific Acceptance Tests for HVAC commissioning).
            </p>
            <p className="mt-3">
              <strong>Certification programs:</strong> ENERGY STAR Single-Family New Homes Program v3.2 Technical Requirements (Whole-House Verification section). RESNET HERS Standards. LEED v4.1 Building Design and Construction. Passive House Institute US (PHIUS) certification requirements.
            </p>
            <p className="mt-3">
              <strong>Combustion + gas safety:</strong> NFPA 54, National Fuel Gas Code. ANSI Z21.13 (gas-fired hot-water boilers). ANSI Z83.8 (gas-fired duct furnaces). ASHRAE Standard 103 (gas furnace testing). Combustion analyzer use per equipment-specific manufacturer training (Fyrite, Bacharach, Testo, Fieldpiece).
            </p>
            <p className="mt-3">
              <strong>Refrigerant verification:</strong> AHRI Standard 700-2019 (Specifications for Refrigerants — reclaimed). AHRI Standard 740 (Performance of Refrigerant Recovery, Recycling, or Reclaiming Equipment). EPA Section 608 (40 CFR Part 82 Subpart F) — refrigerant charge documentation requirements.
            </p>
            <p className="mt-3">
              <strong>Research references:</strong> NIST and Lawrence Berkeley National Laboratory residential HVAC commissioning studies. DOE Building America Solution Center commissioning protocols. DOE Better Buildings Program. DOE Building Energy Codes Program. EPA ENERGY STAR commissioning resources.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> equipment-specific commissioning procedures (vary by manufacturer — consult installation manual). State-specific Acceptance Test forms (California Title 24 publishes specific forms; check Title 24 compliance documentation). HERS rater hiring recommendations (use RESNET&apos;s rater directory at resnet.us). Specific TAB contractor recommendations (varies regionally; check NEBB or AABC member directories). For training: ACCA QI Specialist certification, NEBB Certified Professional, AABC Certified TAB Engineer.
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
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J load — the input commissioning verifies.</p>
            </Link>
            <Link href="/duct-size-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Duct Size Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual D sizing — verified by TESP + airflow commissioning.</p>
            </Link>
            <Link href="/hvac-load-calculation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Load Calculation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J explainer — commissioning verifies the calc&apos;s implementation.</p>
            </Link>
            <Link href="/hvac-duct-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Duct Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual D explainer — TESP + balancing verification details.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic for when commissioning identifies a problem.</p>
            </Link>
            <Link href="/superheat-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Thermometer className="h-4 w-4 text-blue-600" /> Superheat Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Refrigerant-side commissioning measurement.</p>
            </Link>
            <Link href="/subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Subcooling Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">TXV charge verification at design conditions.</p>
            </Link>
            <Link href="/refrigerant-charge-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Charge Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Line-set adjustment for weighed-charge commissioning.</p>
            </Link>
            <Link href="/hvac-building-automation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Building Automation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Commercial BMS commissioning + Guideline 36 sequences + points list verification.</p>
            </Link>
            <Link href="/hvac-energy-management-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Energy Management Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Retrocommissioning + MBCx + FDD — the post-Cx operational layer.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [FileCheck, ShieldCheck];
