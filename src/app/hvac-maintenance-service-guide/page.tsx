import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, Wrench, Calendar, ListChecks, AlertTriangle, ShieldCheck, Wind, Thermometer, Filter, Zap, FileCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-maintenance-service-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Maintenance & Service Guide — Seasonal Schedule, Annual Tune-Up Checklist, Filter Strategy, ROI Math",
  description:
    "Complete HVAC maintenance guide: spring AC + fall furnace seasonal schedule, the 14-point annual professional tune-up checklist, MERV filter strategy by climate and household, refrigerant-side verification, combustion safety inspection, electrical checks (capacitors + contactors + motor amps), control system calibration, equipment-specific maintenance for heat pumps and ductless mini-splits, A2L safety considerations, service contract evaluation, and ROI math showing typical maintenance payback. Sourced from ACCA Standard 4 + Quality Maintenance Standard 6, ASHRAE Standards 180 + 62.2 + 52.2, EPA Section 608, NFPA 54, OSHA 1910.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Maintenance Guide — Seasonal Schedule + Annual Tune-Up + Filter Strategy + ROI",
    description: "ACCA Standard 4 + ASHRAE 180 sourced maintenance protocol. Seasonal checklist, professional tune-up scope, equipment-specific guidance.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Maintenance & Service Guide — Schedule + Checklist + ROI",
    description: "Seasonal schedule, 14-point tune-up checklist, filter strategy, A2L safety.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "Is annual HVAC maintenance actually worth the cost?",
    a: "For most residential systems, yes — typical residential service contract is $150-300/year and the documented efficiency + reliability benefits substantially exceed that cost. ENERGY STAR estimates that proper HVAC maintenance saves 5-20% on annual energy bills (typical residential cooling+heating bill is $1,200-2,500/year, so 5-20% = $60-500 savings annually). Beyond direct energy savings: identifying small problems early (low refrigerant, dirty coils, weak capacitors) prevents the cascade to compressor failure or coil leak that requires $1,500-3,500 of unplanned repair. Service contract typically includes 2 visits/year (spring AC + fall furnace), filter changes, capacitor + amp checks, refrigerant charge verification, combustion analysis for gas equipment. For homes with newer high-efficiency equipment (variable-capacity heat pumps especially), maintenance is more important because the precision tolerances are tighter. For older equipment near end-of-life, the math gets harder because the equipment may be due for replacement regardless of maintenance investment.",
  },
  {
    q: "What should be included in a professional HVAC tune-up?",
    a: "Per ACCA Standard 4 and ASHRAE/ACCA Standard 180, a complete residential maintenance visit should include: (1) Filter inspection + replacement if needed, (2) Outdoor coil cleaning (water + coil cleaner, fin straightening), (3) Indoor evaporator coil inspection + cleaning if needed, (4) Condensate drain inspection + flush, (5) Refrigerant charge verification via superheat/subcooling at design conditions if possible, (6) Electrical: capacitor test (μF reading vs nameplate), contactor inspection, motor amp draw vs nameplate, (7) Static pressure measurement (supply + return plenum), (8) Thermostat calibration + setpoint verification, (9) Blower motor + wheel inspection, (10) Heat pump reversing valve operation (heat pumps), (11) Combustion analysis (gas furnaces — CO ≤100 ppm, O₂ ≤4%, draft check), (12) Heat exchanger visual inspection for cracks (gas furnaces — safety critical), (13) Gas pressure verification, (14) Documentation: measured values + recommendations on a service ticket. A &quot;tune-up&quot; that takes less than 60-90 minutes per piece of equipment likely skips important items. The professional service price ($85-200/visit typical) reflects the time required to do the work correctly.",
  },
  {
    q: "How often should I change my HVAC filter?",
    a: "Depends on filter type and household conditions. Manufacturer guidelines and ASHRAE 52.2 give baseline intervals: (1) 1-inch fiberglass spun-glass filter (MERV 1-4): every 1-3 months. Cheap and high-airflow but minimal particulate capture. (2) 1-inch pleated filter (MERV 8-11): every 3 months for typical residential; every 1-2 months in homes with pets, smokers, or active construction. (3) 4-5 inch pleated filter (MERV 13-16): every 6-12 months. High capture efficiency, but require compatible filter housing. (4) Electrostatic filter (washable): rinse every 1-3 months per manufacturer. Modify by household conditions: 2-3 pets reduces interval ~50%; smokers reduces ~60%; high-pollen environments (autumn/spring) reduces 25-40%. Monitor: hold filter up to a bright light — if you can&apos;t see light through it, replace regardless of calendar. For ENERGY STAR equipment + IRA tax credit qualification, manufacturer-specified filter MERV is sometimes required.",
  },
  {
    q: "Should I sign a service contract or pay per visit?",
    a: "Service contracts (also called maintenance plans, preventive maintenance agreements, or comfort plans) typically cost $150-300/year for residential and include 2 visits annually plus 10-15% discount on repair work and priority scheduling during peak season. Per-visit pricing is typically $85-200 per tune-up visit. The math: 2 visits × $130 average = $260/year per-visit equivalent vs $200 average contract = $60/year savings, plus contract benefits (priority scheduling, repair discount). Service contract typically wins financially if you would have hired the contractor twice annually anyway. Beyond pure math: the contract creates a maintenance habit that homeowners often skip otherwise (because annual maintenance feels skippable when no problem is visible). For newer high-efficiency equipment with manufacturer warranty conditional on documented annual maintenance, the contract also preserves warranty validity. Read the contract terms carefully: some contracts have hidden exclusions (refrigerant charges separately, A2L-rated work surcharges, after-hours visits cost extra).",
  },
  {
    q: "Why does my efficiency drop year over year even with maintenance?",
    a: "Equipment efficiency degrades naturally over service life — typical residential AC loses 1-2% efficiency per year of normal operation due to: compressor wear, slight refrigerant leakage that accumulates, electrical component aging, coil corrosion (especially in coastal salt environments), and blower motor wear. Maintenance slows but does not stop this degradation. After 10 years a typical 16 SEER2 unit may operate at effective 13-14 SEER2; after 15 years, 11-13 SEER2. Beyond this, structural problems develop that justify replacement: compressor failure (5,000+ hour operation typical), heat exchanger cracking (gas furnaces, 15-20 year typical), coil leaks. The maintenance value is preventing premature failure — a properly-maintained AC lasts 15-20 years; a neglected AC fails at 8-12 years. Maintenance also catches accumulating problems before they damage other components (e.g., a weak capacitor accelerates compressor wear, leading to early compressor failure if not addressed).",
  },
  {
    q: "Are there A2L-specific maintenance considerations?",
    a: "Yes — A2L refrigerants (R-32, R-454B, R-454C, R-455A, R-1234yf) require modified service practices for safety. (1) Recovery + leak detection equipment must be UL-listed for A2L use. (2) No open flames during service — for brazing, recover refrigerant fully and ventilate the area before introducing torch. (3) Modified leak detection — electronic sniffers and soap bubbles work, but operators should follow OSHA + manufacturer A2L safe-work practices. (4) Gas detection / ventilation in confined service spaces (basements, attics, equipment closets). (5) Filter replacement and coil cleaning are similar to A1, but verify any tools used are spark-suppressed if working near the refrigerant circuit. (6) Annual maintenance documentation should note refrigerant type and any A2L-specific precautions taken. AHRI Safe Refrigerant Transition guidance, ASHRAE Standard 15, and manufacturer installation instructions cover the specifics. EPA Section 608 certification covers A2L work; some states are adding additional A2L-specific training requirements as the AIM Act transition continues.",
  },
  {
    q: "What's the most important DIY maintenance task?",
    a: "Filter replacement on the manufacturer's recommended schedule — period. A dirty filter restricts airflow, raises static pressure, drops blower CFM, degrades efficiency 5-10%, and can freeze the evaporator coil in extreme cases. The next-most-important: outdoor unit visible inspection (debris cleared around unit, no shrubs within 24&quot; of any side, coil visually clean from outside — light hose rinse if dirty). Then: condensate drain check at the air handler (water draining freely to the floor drain or condensate pump). These three DIY tasks address most of the airflow-related efficiency problems without requiring professional service. For everything beyond (refrigerant charge, electrical components, combustion safety, coil deep cleaning), hire a certified technician annually.",
  },
  {
    q: "Does maintenance reset the equipment warranty clock?",
    a: "No — but lack of maintenance can void it. Most manufacturer warranties on residential HVAC equipment (5-10 year parts; some longer on compressor) require &quot;reasonable maintenance per manufacturer specifications&quot; as a condition. Documentation of annual professional maintenance preserves the warranty. Failure to maintain — and the manufacturer can determine this from coil condition, filter loading, and electrical component condition during a warranty service call — voids parts coverage on failures attributable to neglect. Keep documentation: service receipts, filter purchase records, anything proving you maintained the equipment. Service contracts that automatically generate annual records are useful for warranty defense. For high-cost equipment (geothermal, premium variable-capacity heat pumps with $8,000-15,000 installed cost), documented maintenance is essential warranty insurance.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Maintenance & Service Guide — Seasonal Schedule, Annual Tune-Up Checklist, Filter Strategy, ROI Math",
      description:
        "Complete HVAC maintenance methodology: seasonal schedule, 14-point professional tune-up, filter strategy by MERV, refrigerant-side verification, combustion safety, controls calibration, service contracts, equipment-specific guidance, A2L safety, ROI math.",
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
        { "@type": "Thing", name: "HVAC maintenance" },
        { "@type": "Thing", name: "Preventive maintenance" },
        { "@type": "Thing", name: "Air filter replacement" },
        { "@type": "Thing", name: "HVAC tune-up" },
        { "@type": "Thing", name: "Combustion analysis" },
      ],
      keywords: [
        "hvac maintenance",
        "hvac tune-up",
        "hvac preventive maintenance",
        "hvac filter merv",
        "hvac service contract",
        "hvac annual service",
        "spring ac tune up",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "Annual residential HVAC tune-up procedure (14 points)",
      description: "The 14-point professional tune-up sequence per ACCA Standard 4 and ASHRAE/ACCA Standard 180, covering electrical, refrigerant-side, airflow, combustion, and documentation.",
      totalTime: "PT2H",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set" },
        { "@type": "HowToTool", name: "Digital thermistor probes for refrigerant lines" },
        { "@type": "HowToTool", name: "Multimeter + amp clamp" },
        { "@type": "HowToTool", name: "Manometer / digital static pressure probe" },
        { "@type": "HowToTool", name: "Combustion analyzer (for fuel-burning equipment)" },
        { "@type": "HowToTool", name: "Coil cleaning chemicals + spray bottle" },
        { "@type": "HowToTool", name: "Fin comb" },
        { "@type": "HowToTool", name: "Replacement air filter (correct size + MERV)" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Filter inspection + replacement", text: "Inspect current filter; replace if loaded. Verify replacement matches OEM specification for MERV + size + thickness." },
        { "@type": "HowToStep", position: 2, name: "Outdoor coil cleaning", text: "Clear vegetation and debris from condenser area. Rinse coil with garden hose from inside out. Apply coil cleaner for heavily fouled coils. Straighten fins as needed with a fin comb." },
        { "@type": "HowToStep", position: 3, name: "Indoor evaporator coil inspection", text: "Visual check via access panel. Clean if biological growth or particulate accumulation. Document condition for trending." },
        { "@type": "HowToStep", position: 4, name: "Condensate drain inspection and flush", text: "Verify drain is clear and flowing. Vacuum any trap accumulation. Flush with bleach solution to prevent algae regrowth. Verify float switch operation." },
        { "@type": "HowToStep", position: 5, name: "Refrigerant charge verification", text: "Connect manifold, measure suction PSIG + suction line temp + high-side PSIG + liquid line temp. Calculate SH + SC. Verify within OEM spec at current operating conditions." },
        { "@type": "HowToStep", position: 6, name: "Electrical: capacitor test", text: "Measure microfarad reading; compare to nameplate value. Replace if more than 10% off or showing visible deformation/leakage." },
        { "@type": "HowToStep", position: 7, name: "Electrical: contactor inspection", text: "Inspect contacts for pitting, burning, or contamination. Verify clean closure and proper voltage on the load side." },
        { "@type": "HowToStep", position: 8, name: "Electrical: motor amp draw verification", text: "Measure running amps on blower motor + condenser fan + compressor; compare to nameplate FLA (Full Load Amps). High amp draw signals bearing wear, capacitor weakness, or restriction." },
        { "@type": "HowToStep", position: 9, name: "Static pressure measurement", text: "Insert static probes into supply + return plenums; measure total external static pressure. Compare to equipment blower curve at design CFM." },
        { "@type": "HowToStep", position: 10, name: "Thermostat calibration + setpoint check", text: "Verify thermostat actual reading matches calibrated reference thermometer. Confirm setpoint differential, schedule, and heat pump configuration (balance point, aux heat lockout)." },
        { "@type": "HowToStep", position: 11, name: "Blower motor + wheel inspection", text: "Inspect blower wheel for dust accumulation; clean if loaded. Verify motor bearings smooth. Confirm belt tension on belt-drive blowers (rare in modern residential)." },
        { "@type": "HowToStep", position: 12, name: "Combustion analysis (gas equipment only)", text: "Combustion analyzer at flue: verify CO ≤100 ppm, O₂ ≤4%, draft pressure correct. Visual inspection of heat exchanger for cracks. Verify gas pressure at the valve." },
        { "@type": "HowToStep", position: 13, name: "Safety system testing", text: "Test high/low pressure switches, condensate float switch, gas pressure switch where applicable. Verify they shut down equipment when activated." },
        { "@type": "HowToStep", position: 14, name: "Documentation + customer communication", text: "Record all measurements on a service ticket. Flag any items outside acceptance ranges. Discuss findings with customer. Schedule any needed follow-up." },
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
        { "@type": "ListItem", position: 3, name: "HVAC Maintenance & Service Guide" },
      ],
    },
  ];
}

export default function HvacMaintenanceServiceGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Maintenance &amp; Service Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Maintenance &amp; Service Guide — Seasonal Schedule, Annual Tune-Up Checklist, Filter Strategy, and ROI Math
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            The operational counterpart to our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link> — what happens after the system has been installed and verified, across its 15-20 year service life. This guide covers the seasonal maintenance schedule (spring AC + fall furnace), the 14-point professional annual tune-up per ACCA Standard 4 and ASHRAE/ACCA Standard 180, filter strategy by MERV class and household conditions, refrigerant-side verification (SH/SC at design conditions), combustion safety inspection for gas equipment, electrical component testing (capacitor + contactor + motor amps), controls calibration, equipment-specific guidance for heat pumps and ductless mini-splits, A2L safety considerations for the new refrigerant transition, service contract evaluation, and the ROI math showing typical maintenance payback. Sourced throughout from ACCA Standard 4 + Quality Maintenance Standard 6, ASHRAE Standards 180 + 62.2 + 52.2, EPA Section 608 (40 CFR Part 82 Subpart F), NFPA 54, and OSHA 1910.
          </p>
        </header>

        {/* SECTION 01 — Why maintenance matters */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why HVAC maintenance matters (the efficiency degradation curve)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HVAC equipment degrades over its 15-20 year service life through three mechanisms: (1) accumulation of dirt, biological growth, and refrigerant-cycle contamination that slows heat transfer and raises pressures; (2) electrical and mechanical component aging (capacitors lose microfarads, contactor surfaces oxidize, blower bearings wear, motor windings lose insulation resistance); (3) refrigerant-cycle deterioration (small leaks accumulate, oil degrades, filter-driers saturate). Maintenance addresses all three categories before they cascade to capacity loss or component failure.
          </p>

          <KeyInsight tone="blue" title="The compound efficiency curve">
            Without maintenance, typical residential AC loses 5-10% efficiency in year 1 (filter loading, coil debris, slight charge loss) and roughly 1-2% additional per year thereafter. After 10 years a neglected system delivers ~70-75% of its original rated efficiency. With annual maintenance, the curve flattens substantially — typical 10-year-old well-maintained system delivers 85-90% of original efficiency. ENERGY STAR documents that proper maintenance saves 5-20% on annual HVAC energy bills relative to neglected operation. For typical residential cooling+heating costs of $1,200-2,500/year, that&apos;s $60-500 in annual savings vs the $150-300/year service contract cost.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Beyond direct efficiency, maintenance catches small problems before they cascade. A weak capacitor (10% below nameplate µF) operates the compressor at lower-than-rated starting torque; the compressor draws excess current at every start and the windings age faster. Six months later the compressor fails — a $1,500-3,500 unplanned repair, when a $25 capacitor replacement at the annual visit would have prevented it. The same pattern applies to small refrigerant leaks, dirty coils, and undersized returns; identified early, they&apos;re routine fixes. Caught only when they cause equipment failure, they&apos;re expensive emergency repairs at the worst possible time (the hottest day of the summer).
          </p>
        </section>

        {/* SECTION 02 — Maintenance hierarchy */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            The maintenance hierarchy — DIY vs contractor vs full TAB
          </h2>

          <ComparisonTable
            headers={["Maintenance level", "Performed by", "Frequency", "What's done", "Typical cost"]}
            rows={[
              { label: "Filter replacement", cells: ["Homeowner", "Monthly to quarterly per filter type", "Replace filter; check for visible loading", "$5-30 per filter"] },
              { label: "Visible inspection", cells: ["Homeowner", "Monthly during operating season", "Check outdoor unit clearance, drain operation, register obstruction", "Free"] },
              { label: "Annual tune-up (residential PM)", cells: ["EPA 608 certified technician", "1-2 visits per year (spring + fall)", "14-point checklist; coil cleaning; refrigerant verification; combustion analysis", "$85-200 per visit"] },
              { label: "Mid-life equipment recommissioning", cells: ["Commissioning agent or HERS rater", "Every 7-10 years (or after major envelope changes)", "Full re-verification of Manual J load, refrigerant charge, airflow balancing", "$400-1,000"] },
              { label: "Full Test, Adjust, Balance (TAB)", cells: ["NEBB/AABC/TABB certified TAB contractor", "After major modifications, equipment replacement, or commercial leasing", "Complete airflow measurement, balancing, documentation", "$1,500-5,000 (commercial typical)"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The hierarchy compounds: homeowner DIY activities (filter, visible inspection) cover the &quot;quick wins&quot; that don&apos;t need certification. The contractor annual PM covers the items that require tools (manifold, multimeter, combustion analyzer) and EPA Section 608 certification (anything refrigerant-side). Mid-life recommissioning catches drift that the annual PM may have missed. Full TAB is the residential rarity (typical for commercial); needed when major changes have occurred to the system or building.
          </p>
        </section>

        {/* SECTION 03 — Seasonal schedule */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Seasonal maintenance schedule
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Most residential systems benefit from two professional service visits per year: spring (AC prep before cooling season) and fall (heating prep before winter). For systems with both cooling and heating capability (heat pumps, AC + furnace combinations), the spring + fall split lets each season&apos;s equipment get attention before peak use.
          </p>

          <TechSection icon="insight" tone="blue" title="Spring AC tune-up (April-May, before cooling season)">
            <strong>Professional checklist:</strong>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Outdoor coil cleaning (winter accumulated debris)</li>
              <li>Refrigerant charge verification at design conditions (need outdoor temp 75°F+ for reliable measurement)</li>
              <li>Indoor evaporator coil inspection + cleaning</li>
              <li>Condensate drain flush (prevents algae from prior winter idle)</li>
              <li>Capacitor + contactor + amp draw checks</li>
              <li>Blower motor + wheel inspection</li>
              <li>Filter replacement</li>
              <li>Thermostat calibration</li>
              <li>Recommendation discussion with homeowner</li>
            </ul>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Fall furnace tune-up (September-October, before heating season)">
            <strong>Professional checklist (gas furnace):</strong>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Heat exchanger visual inspection for cracks (safety critical for CO containment)</li>
              <li>Combustion analyzer at the flue: CO ≤100 ppm, O₂ ≤4%, draft check</li>
              <li>Burner inspection and cleaning</li>
              <li>Gas pressure verification at the valve</li>
              <li>Pilot light or hot-surface igniter operation check</li>
              <li>Heat pump reversing valve operation (heat pumps)</li>
              <li>Aux heat strip operation (heat pumps)</li>
              <li>Capacitor + amp draw checks (electric components)</li>
              <li>Blower motor + wheel inspection</li>
              <li>Filter replacement</li>
              <li>Thermostat heating-mode calibration + balance point verification (heat pumps)</li>
            </ul>
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Monthly homeowner tasks (during operating seasons)">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Filter inspection; replace if loaded (visual: hold to bright light, if you can&apos;t see through, replace)</li>
              <li>Outdoor unit clearance check (no shrubs within 24 inches; no leaves accumulated against the coil)</li>
              <li>Indoor register check (no obstructions; all dampers in design positions)</li>
              <li>Condensate drain visual check (water draining freely, no overflow at the pan)</li>
              <li>Listen for unusual sounds (grinding, hissing, banging — see <Link href="/hvac-troubleshooting-guide/" className="underline">troubleshooting guide</Link>)</li>
            </ul>
          </TechSection>
        </section>

        {/* SECTION 04 — Filter strategy */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Filter strategy — MERV class, replacement frequency, types
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Filter selection involves three tradeoffs: particulate capture efficiency (higher = better IAQ), pressure drop (lower = better airflow + efficiency), and replacement interval (longer = less hassle but more cost per filter). ASHRAE Standard 52.2 defines the MERV (Minimum Efficiency Reporting Value) scale.
          </p>

          <ComparisonTable
            headers={["MERV", "Captures particles", "Typical use", "Initial pressure drop", "Replacement interval"]}
            rows={[
              { label: "MERV 1-4", cells: ["Pollen, dust mites, carpet fibers", "Basic residential (filter to protect equipment)", "0.05-0.10 in.w.c.", "1-3 months"] },
              { label: "MERV 5-8", cells: ["+ mold spores, hair spray, dust", "Typical residential", "0.10-0.20 in.w.c.", "3 months"] },
              { label: "MERV 9-12", cells: ["+ humidifier dust, vehicle emissions", "Higher-IAQ residential, allergy-sensitive households", "0.15-0.30 in.w.c.", "3-6 months"] },
              { label: "MERV 13-16", cells: ["+ bacteria, sneeze droplets, fine smoke", "ENERGY STAR + high-IAQ; some commercial", "0.20-0.40 in.w.c.", "6-12 months (with proper housing)"] },
              { label: "MERV 17+ / HEPA", cells: ["+ viruses, smoke particles, lab-grade", "Cleanrooms, hospitals, allergy-critical residential (with dedicated equipment)", "0.40-0.80+ in.w.c.", "6-12 months"] },
            ]}
          />

          <FixCallout>
            <strong>The MERV-vs-airflow tradeoff:</strong> upgrading filter MERV adds pressure drop to the system. A move from MERV 8 to MERV 13 typically adds 0.10-0.15 in.w.c. of TESP at design CFM. If your system was designed with 0.10 in.w.c. filter budget, MERV 13 on a 1-inch filter likely overloads the system. Fix: upgrade to 4-5 inch deep-pleated filter housing — same MERV at much lower pressure drop because the larger filter area means lower face velocity. ASHRAE 52.2 testing shows 4-inch MERV 13 has roughly the same pressure drop as 1-inch MERV 8 at typical residential airflow.
          </FixCallout>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Special filter conditions:</strong> homes with 2+ pets typically require filter replacement 50% more frequently; smokers reduce filter life ~60%; high-pollen environments (Southeast US autumn, Southwest spring) reduce interval 25-40%. For allergy-sensitive occupants, MERV 13+ is the threshold for meaningful pollen/allergen capture. For COVID-era IAQ concerns, MERV 13+ is the CDC-recommended minimum.
          </p>
        </section>

        {/* SECTION 05 — Annual tune-up */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            The 14-point annual professional tune-up
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Per ACCA Standard 4 and ASHRAE/ACCA Standard 180, a complete residential maintenance visit covers 14 checkpoints. A &quot;tune-up&quot; that takes less than 60-90 minutes per piece of equipment likely skips important items.
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Filter inspection + replacement.</strong> Document filter condition pre-replacement.</li>
            <li><strong>Outdoor coil cleaning.</strong> Garden hose + coil cleaner for fouled coils; fin straightening as needed.</li>
            <li><strong>Indoor evaporator coil inspection.</strong> Clean if biological growth or particulate accumulation visible.</li>
            <li><strong>Condensate drain inspection + flush.</strong> Vacuum trap accumulation; bleach flush to prevent algae regrowth.</li>
            <li><strong>Refrigerant charge verification.</strong> Manifold readings + SH/SC calculation at current operating conditions; compare to OEM spec.</li>
            <li><strong>Electrical: capacitor test.</strong> µF reading vs nameplate; replace if &gt;10% off or visible deformation.</li>
            <li><strong>Electrical: contactor inspection.</strong> Inspect contacts for pitting, burning, or contamination.</li>
            <li><strong>Electrical: motor amp draw.</strong> Compare to nameplate FLA on blower, condenser fan, compressor.</li>
            <li><strong>Static pressure measurement.</strong> Supply + return plenum static; verify within equipment blower curve at design CFM.</li>
            <li><strong>Thermostat calibration + setpoint check.</strong> Verify accurate temperature reading; confirm schedule + heat pump configuration.</li>
            <li><strong>Blower motor + wheel inspection.</strong> Clean blower wheel if loaded; verify smooth motor bearings.</li>
            <li><strong>Combustion analysis (gas equipment).</strong> CO ≤100 ppm, O₂ ≤4%, draft check; heat exchanger visual inspection for cracks.</li>
            <li><strong>Safety system testing.</strong> Pressure switches, float switch, gas pressure switch; verify shutdown function.</li>
            <li><strong>Documentation.</strong> All measured values on service ticket; flag items outside acceptance ranges; discuss with customer.</li>
          </ol>

          <KeyInsight tone="amber" title="What to ask your service contractor">
            &quot;Will you provide a written service ticket with measured values for all 14 checkpoints?&quot; A contractor performing complete tune-ups has these measurements routine; a contractor doing a &quot;15-minute drive-by&quot; will resist or claim measurements aren&apos;t standard. The service ticket is your record of work performed and trend baseline for future visits. Equipment manufacturers&apos; warranty claims sometimes require documented maintenance history; the service ticket is that documentation.
          </KeyInsight>
        </section>

        {/* SECTION 06 — Refrigerant verification */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Refrigerant-side: charge verification + leak detection
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Refrigerant charge drift is one of the slow-degradation patterns that maintenance catches. Even on a well-sealed system, charge can drift 1-3% per year via tiny leak paths at flares, valve cores, and Schrader fittings. Verification approach:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Run system at near-design conditions.</strong> Outdoor 75°F+ for cooling-mode verification; otherwise readings are unreliable.</li>
            <li><strong>Measure all four values.</strong> Suction PSIG, suction line temp, high-side PSIG, liquid line temp.</li>
            <li><strong>Calculate SH and SC.</strong> Use our <Link href="/superheat-calculator/" className="underline">superheat</Link> and <Link href="/subcooling-calculator/" className="underline">subcooling calculators</Link> for the math.</li>
            <li><strong>Compare to OEM target.</strong> TXV: SC 8-12°F at design. Fixed-orifice: SH per Carrier chart by outdoor + indoor WB.</li>
            <li><strong>Adjust if needed.</strong> Within ±2°F of target is acceptable; outside that, investigate (leak first, then charge).</li>
            <li><strong>Leak test if substantial drift.</strong> Electronic detector + soap bubble verification at flares, valve cores, brazed joints.</li>
          </ol>

          <FixCallout>
            <strong>The &quot;top off&quot; trap:</strong> adding refrigerant to a system showing low charge — without finding and repairing the leak — wastes refrigerant (which leaks out again) and may violate EPA Section 608 best practice (commercial systems above 50 lbs are required to be repaired before recharging). Always investigate the leak first. Slow leaks (1-2 oz/year) may be acceptable for routine top-off; faster leaks (1-2 oz/month) need repair. See our <Link href="/hvac-refrigerant-recovery-guide/" className="underline">refrigerant recovery guide</Link> for the procedural framework.
          </FixCallout>
        </section>

        {/* SECTION 07 — Outdoor unit */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Outdoor unit care
          </h2>

          <ul className="mt-3 space-y-3 text-zinc-700 dark:text-zinc-300">
            <li><strong>Clearance.</strong> Maintain 24 inches of clear space on all sides of the outdoor unit. Vegetation grows; trim quarterly. Fences, walls, and other structures should be at least 24 inches away. Restricted airflow raises head pressure, drops efficiency, and shortens compressor life.</li>
            <li><strong>Coil cleaning.</strong> Garden hose rinse from inside out (the natural direction reverses how dirt accumulates). For heavily fouled coils, apply commercial coil cleaner (acidic for aluminum coils, alkaline for copper). Annual professional cleaning is standard; coastal salt environments may need biannual.</li>
            <li><strong>Fin inspection.</strong> Aluminum fins are easily bent by hose pressure, weed-whackers, or falling debris. Use a fin comb to straighten — bent fins reduce airflow and degrade efficiency.</li>
            <li><strong>Condensate drain (heat pump in heating mode).</strong> Heat pumps produce condensate in heating mode from outdoor coil defrost. Verify drain path is clear; check for ice damming if installed in cold climate.</li>
            <li><strong>Leveling.</strong> Outdoor unit should be approximately level (±5° tolerance per most manufacturers). Settling pads can shift over years; if visibly tilted, professional service can re-level.</li>
            <li><strong>Refrigerant line insulation.</strong> Inspect the suction line insulation; replace if damaged or missing. Uninsulated suction line in summer heat can sweat heavily; in winter, frozen sections damage the line.</li>
            <li><strong>Coastal corrosion.</strong> Salt air accelerates aluminum and copper corrosion. Apply marine-grade coatings or use coated coil equipment for installations within ~1 mile of saltwater. Annual inspection should look for visible pitting or scaling.</li>
          </ul>
        </section>

        {/* SECTION 08 — Indoor coil */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Indoor evaporator coil + drain pan
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The indoor evaporator coil is the most neglected residential HVAC component. Located inside the air handler, often above a furnace where it&apos;s hard to access, it accumulates biological growth (algae, mold) from condensation + dust over years. Symptoms of fouled evaporator: musty smell from supply registers, reduced cooling capacity, frozen coil during normal operation, slow drain flow.
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Annual inspection.</strong> Open the access panel (typically at the air handler) and visually inspect the coil. Light dust accumulation is normal; thick biological growth or particulate &quot;mat&quot; requires cleaning.</li>
            <li><strong>Cleaning frequency.</strong> Light: every 3-5 years for typical residential. Heavy: every 1-2 years in homes with pets, high humidity, or chemically-intensive cleaning practices.</li>
            <li><strong>Cleaning methods.</strong> Foam coil cleaner sprayed into the coil + allowed to drip into the drain pan (do not flush — wet vac the residue if needed). For heavy fouling, professional cleaning with non-acidic coil cleaner and a high-pressure rinse.</li>
            <li><strong>Drain pan + drain line.</strong> Inspect the pan for debris and algae buildup; flush the drain line with bleach solution to kill algae. Verify float switch operates (lifts a magnet to trip the safety circuit).</li>
            <li><strong>Drain trap.</strong> Some residential systems have a P-trap in the condensate drain to prevent suction-side air leakage; verify the trap is full of water (dries out in winter idle, must be re-filled before cooling season).</li>
          </ul>

          <FixCallout>
            <strong>The musty smell indicator:</strong> if the supply air smells musty when the AC first turns on, the indoor coil has biological growth that needs cleaning. UV-C light installation (germicidal UV lamp aimed at the evaporator coil) prevents regrowth; cost $200-500 installed; lamps last 1-2 years. For severe cases, combination ozonator + UV-C; for moderate cases, a single UV-C lamp is sufficient. Don&apos;t mask the smell with chemical air fresheners — fix the source.
          </FixCallout>
        </section>

        {/* SECTION 09 — Combustion safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Combustion safety for gas + oil furnaces
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Fuel-burning equipment requires annual combustion safety verification — life-safety, not just efficiency. Carbon monoxide (CO) poisoning is the documented hazard; cracked heat exchangers can leak CO into the supply air stream and silently affect occupants over days or weeks. Combustion analyzers are required equipment for fall furnace tune-up.
          </p>

          <ComparisonTable
            headers={["Parameter", "Acceptance criterion", "What out-of-range indicates"]}
            rows={[
              { label: "CO at flue", cells: ["≤100 ppm air-free", "Higher: incomplete combustion, possible heat exchanger crack, poor draft"] },
              { label: "O₂ at flue", cells: ["≤4% for natural gas; ≤6% for propane", "Higher: excess combustion air, draft problem, gas valve underpressure"] },
              { label: "Draft pressure", cells: ["-0.02 to -0.08 in.w.c. negative", "Insufficient negative: chimney/vent obstruction, fan failure (on power-vented)"] },
              { label: "Flame appearance", cells: ["Blue + slight yellow tip; uniform across burners", "Yellow + lazy: poor air/fuel mix; sooting: combustion problem"] },
              { label: "Gas pressure (at valve, on-cycle)", cells: ["Per manufacturer spec (typically 3.5 in.w.c. for natural gas)", "Low: gas supply problem; high: regulator failure"] },
              { label: "Heat exchanger condition", cells: ["No cracks, no rust holes, no flame impingement on metal", "Crack: CO leak path; mandatory replacement"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Heat exchanger inspection</strong> per ANSI Z21.13 (and competing standards for oil) is a visual + spectroscopic procedure looking for cracks, rust-through, or flame-impingement deformation. Cracked heat exchangers are non-repairable — replacement is mandatory. Most residential gas furnaces have ~15-20 year heat exchanger service life; aggressive maintenance schedules can extend this somewhat but eventually the exchanger is replaced (or the whole furnace).
          </p>

          <FixCallout>
            <strong>CO alarms are required complement</strong>, not a substitute for combustion analysis. Per most state codes, CO alarms are required on each habitable floor of a home with fuel-burning equipment. They sound when ambient CO concentration exceeds limits (typically 70 ppm for 60-240 min, 150 ppm for 10-50 min, 400 ppm for 4-15 min per UL 2034). Combustion analysis at the flue catches problems before they raise ambient CO to alarm levels.
          </FixCallout>
        </section>

        {/* SECTION 10 — Electrical */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Electrical: capacitors, contactors, motor amp draw
          </h2>

          <ComparisonTable
            headers={["Component", "Test method", "Acceptance criterion", "Failure mode"]}
            rows={[
              { label: "Run capacitor (compressor)", cells: ["Multimeter capacitance mode", "Within 10% of nameplate µF", "Compressor hard-start; eventual compressor failure"] },
              { label: "Run capacitor (fan motor)", cells: ["Multimeter capacitance mode", "Within 10% of nameplate µF", "Fan motor stops or runs slow; overheating"] },
              { label: "Start capacitor (compressor)", cells: ["Multimeter or test charger", "Per manufacturer test procedure", "Compressor will not start under load"] },
              { label: "Contactor (compressor + fan)", cells: ["Visual + coil resistance test", "Clean contacts; coil resistance within spec", "Pitted contacts arc + weld; circuit stuck on"] },
              { label: "Hard-start kit (if installed)", cells: ["Capacitance + relay test", "Within capacitor spec; relay clicks", "Compressor will not start in low voltage"] },
              { label: "Blower motor amp draw", cells: ["Amp clamp at start + steady state", "Within nameplate FLA (Full Load Amps)", "High amps signal bearing wear, capacitor weakness"] },
              { label: "Compressor amp draw", cells: ["Amp clamp at steady-state under load", "Within nameplate RLA (Rated Load Amps)", "High amps signal high pressures, overcharge, restriction"] },
              { label: "Disconnect switch + breaker condition", cells: ["Visual inspection + load-side voltage", "No burning, corrosion, or loose connections", "Failure modes: arcing, melt-down, breaker trips"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Capacitor replacement economics:</strong> a capacitor at 90% of nameplate µF is &quot;technically passing&quot; but on the path to failure within 1-3 years. Replacement at the maintenance visit is $25-60 in parts + included labor; replacement on the emergency call after compressor failure is the cost of the capacitor PLUS the compressor ($1,500-3,500). Preventive replacement of marginal capacitors is one of the highest-value maintenance interventions.
          </p>
        </section>

        {/* SECTION 11 — Controls */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Controls + thermostat calibration
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Modern thermostats — including learning thermostats (Nest, Ecobee), variable-capacity stage-controllers, and zone control panels — all need periodic verification. Maintenance items:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Temperature accuracy.</strong> Place a calibrated reference thermometer near the thermostat; allow 15 minutes to stabilize; compare. ±1-2°F differences are normal sensor drift; greater differences need calibration or replacement.</li>
            <li><strong>Setpoint differential.</strong> Verify the deadband (typically 1-2°F) is set correctly. Too small = short-cycling; too large = comfort complaints.</li>
            <li><strong>Heat pump balance point.</strong> Outdoor temperature at which aux heat takes over should be set to the heat pump&apos;s actual balance point — typically 30-35°F for cold-climate heat pumps. Wrong setting causes excessive aux heat use (high electric bills) or insufficient heat (cold rooms).</li>
            <li><strong>Heat pump aux heat lockout.</strong> Heat pump should be primary above the balance point; aux strips should NOT be running during normal heating. Verify with amp clamp on the aux strips during a typical heat call above balance point.</li>
            <li><strong>Two-stage / variable-capacity staging.</strong> For multi-stage equipment, verify the thermostat is staging the equipment correctly — primary stage runs at moderate load, secondary stage activates at high load.</li>
            <li><strong>Dehumidification mode (if applicable).</strong> Some modern thermostats have a dehumidification mode that runs the AC longer at part-load to improve latent removal. Verify configuration matches climate.</li>
            <li><strong>Schedule + setback.</strong> Setback of 5-10°F when home is unoccupied saves 5-15% annually. Verify schedule reflects current occupancy pattern.</li>
            <li><strong>WiFi connectivity (smart thermostats).</strong> Verify connection is stable; firmware updated; remote app functioning.</li>
          </ul>
        </section>

        {/* SECTION 12 — Service contracts */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Service contracts — what to look for
          </h2>

          <ComparisonTable
            headers={["Service contract element", "Typical inclusion", "What to verify"]}
            rows={[
              { label: "Number of visits per year", cells: ["2 (spring + fall)", "Verify both seasons are scheduled; ask for documentation"] },
              { label: "Tune-up scope", cells: ["14-point checklist (varies by contractor)", "Ask for written scope of work; compare to ACCA Standard 4"] },
              { label: "Filter included", cells: ["Sometimes; verify size + MERV", "Often a $5-30 line item; confirm what's in the price"] },
              { label: "Refrigerant included", cells: ["Usually NOT", "Refrigerant beyond a top-off is typically extra ($30-50/lb)"] },
              { label: "Priority emergency scheduling", cells: ["Typically yes", "How quickly do they guarantee response? 24h, 48h, week?"] },
              { label: "Repair work discount", cells: ["10-15% typical", "Applies to labor or parts? Excluded items?"] },
              { label: "Equipment age limit", cells: ["Some contracts limit by equipment age", "Older equipment may require separate plans"] },
              { label: "A2L refrigerant surcharge", cells: ["Increasing common", "If you have R-32 or R-454B equipment, ask explicitly"] },
              { label: "After-hours visits", cells: ["Usually surcharged", "Confirm rate and what counts as after-hours"] },
              { label: "Cancellation policy", cells: ["Varies", "Some require annual commitment; others month-to-month"] },
            ]}
          />

          <FixCallout>
            <strong>Service contract math:</strong> typical $200/year contract vs $130/visit × 2 = $260/year per-visit = $60/year savings, plus 10-15% repair discount that pays back if you have a repair (you usually will over 5+ years). The contract typically wins for households planning to maintain their equipment consistently; per-visit pricing wins if you&apos;re unlikely to actually schedule the spring + fall visits otherwise.
          </FixCallout>
        </section>

        {/* SECTION 13 — Equipment specific */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Equipment-specific maintenance
          </h2>

          <TechSection icon="insight" tone="blue" title="Heat pumps (vs straight AC)">
            Additional items beyond AC checklist: (1) Reversing valve operation — verify smooth changeover between heating and cooling modes; listen for the audible &quot;wooosh&quot; on mode change. (2) Defrost cycle — initiate via manual defrost or wait for natural cycle; verify outdoor coil defrosts within 10 minutes, then returns to heating. (3) Heat pump heating-mode efficiency — verify SH/SC in heating mode (indoor coil becomes condenser, outdoor coil becomes evaporator; readings are at different ports). (4) Aux heat strip operation — verify strips activate only when heat pump alone cannot meet load (below balance point); excess strip use signals thermostat misconfiguration or heat pump capacity loss.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Ductless mini-splits">
            Different maintenance approach due to no ductwork: (1) Indoor head unit air filter — typically removable, washable, every 1-3 months. (2) Indoor coil — accessible by removing front cover; can be cleaned with foam cleaner. (3) Outdoor unit — same as split AC outdoor unit. (4) Refrigerant lines — inspect for damage, insulation condition. (5) Drain line — gravity drain to outside; verify free flow. (6) Indoor head fan blade — clean accumulated dust on fan blades; affects efficiency and noise. Mini-splits often need MORE attention to indoor heads because they&apos;re visually prominent and accumulate dust where occupants see it.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Geothermal heat pumps (ground-source)">
            Distinct from air-source: (1) Loop fluid (water + propylene glycol or methanol mix in cold climates) — verify proper antifreeze concentration; replenish if leaks reduce fluid volume. (2) Loop circulating pump operation — verify flow rate within manufacturer spec; monitor amp draw. (3) Heat exchanger fouling (water-to-refrigerant) — can develop scale or biological growth; chemical cleaning every 5-7 years typical. (4) Refrigerant side same as air-source. (5) Loop pressure — open-loop systems require water-quality monitoring; closed-loop systems require pressure verification. Geothermal maintenance cost is typically higher than air-source ($300-500/year) but equipment life is longer (25+ years for ground loops).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Boilers (hydronic heating)">
            Different system entirely: (1) Annual combustion analysis same as gas furnace. (2) Loop water quality — pH 7-9, minimal hardness, inhibitor concentration per boiler manufacturer. (3) Expansion tank pressure check. (4) Pressure relief valve test. (5) Boiler descaling for hard-water installations every 5-10 years. (6) Circulating pump operation and amp draw. (7) Heat distribution (radiators or baseboard) cleaning. (8) Air bleed at radiators each fall before heating season. Boiler maintenance is more critical than air handler maintenance because boilers can develop dangerous failure modes (pressure relief valve fails closed; expansion tank waterlogs causing relief valve discharge).
          </TechSection>
        </section>

        {/* SECTION 14 — A2L safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            A2L safety in routine maintenance
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            A2L refrigerants (R-32, R-454B, R-454C, R-455A, R-1234yf) require modified service practices for safety per ASHRAE Standard 15 and manufacturer installation manuals. For maintenance specifically:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Recovery equipment must be UL-listed for A2L.</strong> Older A1-only equipment is not legal for A2L work.</li>
            <li><strong>No open flames during refrigerant-side service.</strong> For any brazing or soldering work, fully recover refrigerant first; ventilate the work area; verify no A2L atmosphere present before introducing torch.</li>
            <li><strong>Leak detection.</strong> Same tools as A1 (electronic sniffer + soap bubble verification), but leak repair priority is higher because A2L flammability creates risk if leaks accumulate in conditioned space.</li>
            <li><strong>Ventilation in confined service spaces.</strong> Basements, equipment closets, attics — provide mechanical ventilation during service. ASHRAE Standard 15 specifies minimum ventilation rates.</li>
            <li><strong>Tools and equipment.</strong> Avoid sparks from electric tools near the refrigerant circuit during work. Some shops require spark-suppressed tools for A2L work.</li>
            <li><strong>Documentation.</strong> Service ticket should note refrigerant type, any A2L-specific precautions, and certification of A2L-trained technician.</li>
          </ul>

          <FixCallout>
            <strong>For existing A1 equipment</strong> (R-22, R-410A): no A2L safety practices required; standard maintenance applies. For NEW equipment installed under AIM Act transition (post-2025): A2L procedures are mandatory regardless of refrigerant. Ask your service contractor if they have A2L training and equipment before scheduling work on R-32 or R-454B equipment. See our <Link href="/hvac-refrigerant-recovery-guide/" className="underline">refrigerant recovery guide</Link> for full A2L procedural details.
          </FixCallout>
        </section>

        {/* SECTION 15 — Common mistakes */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">15</span>
            Common maintenance mistakes
          </h2>

          <TechSection icon="problem" tone="amber" title="Mistake 1 — Skipping the annual professional service">
            The single most common maintenance failure. Homeowner reasons: &quot;It&apos;s running fine&quot;; &quot;The contractor charges too much&quot;; &quot;I changed the filter, that&apos;s enough.&quot; Reality: without professional inspection, slow-degrading problems (capacitor weakness, refrigerant drift, contactor wear, coil fouling, control miscalibration) accumulate and eventually cascade to expensive failures. Skipping maintenance for 3-5 years typically results in unexpected $1,500-3,500 emergency repair vs $400-600 of avoided maintenance cost over the same period.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mistake 2 — Overdue filter replacement">
            Filter loading is the most direct, immediate, reversible efficiency degradation. A filter at 6 months past replacement interval can have 50-100% higher pressure drop than new, reducing blower CFM by 10-20% and equipment delivered capacity by similar amount. Sym ptom: comfort declines without obvious cause; energy bills creep up. Fix: replace filter monthly during peak season for typical residential; quarterly otherwise.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mistake 3 — DIY refrigerant work without EPA 608 certification">
            Adding refrigerant from a &quot;DIY kit&quot; from an auto-parts store is illegal (EPA Section 608 prohibits anyone without certification from charging refrigerant). It also typically introduces wrong refrigerant, contaminates the system, and voids manufacturer warranty. The economically rational decision: hire a certified technician. The cost of professional refrigerant work is small compared to compressor damage from contaminated refrigerant. See our <Link href="/hvac-refrigerant-recovery-guide/" className="underline">refrigerant recovery guide</Link> for the EPA 608 framework.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mistake 4 — Closing supply registers in unused rooms">
            Closing supply registers seems intuitive (&quot;why heat/cool an unused room?&quot;), but pressurizes the duct system, increases TESP, reduces blower CFM, and can cause flow imbalance + noise. Per ACCA Manual T, closing more than 20% of supply registers significantly disrupts system performance. Better strategy: install zone controls (with dampers and a multi-zone thermostat) or accept that unused-room conditioning is a small fraction of total system load.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mistake 5 — Topping off refrigerant without leak repair">
            Adding refrigerant without finding and repairing the leak wastes refrigerant (which leaks out again), violates EPA Section 608 best practice for commercial systems, and contributes to greenhouse gas emissions. The right move: leak detection (electronic sniffer + soap bubble) → repair → recover and recharge to nameplate weight. See our <Link href="/hvac-troubleshooting-guide/" className="underline">troubleshooting guide</Link> for the leak-detection procedure.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mistake 6 — Using a higher-MERV filter without checking system compatibility">
            Upgrading from MERV 8 to MERV 13 in a 1-inch filter slot adds 0.10-0.15 in.w.c. of TESP. If the system was designed for MERV 8 budget, MERV 13 may overload it. Symptom: blower CFM drops, efficiency degrades, indoor coil may freeze. Fix: upgrade to 4-5 inch deep-pleated filter housing — same MERV at much lower pressure drop because the larger filter has lower face velocity.
          </TechSection>
        </section>

        {/* SECTION 16 — ROI */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">16</span>
            Maintenance ROI math
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The financial case for residential HVAC maintenance is straightforward when the numbers are laid out:
          </p>

          <ComparisonTable
            headers={["Annual cost (typical residential)", "Without maintenance", "With professional maintenance"]}
            rows={[
              { label: "Annual service contract", cells: ["$0", "$200"] },
              { label: "Filter replacement (homeowner-managed)", cells: ["$60 (estimated; often skipped)", "$60"] },
              { label: "Annual energy bill (cooling + heating)", cells: ["$1,800 baseline", "$1,500 (15% savings from efficiency preservation)"] },
              { label: "Avg annualized cost of unexpected repairs", cells: ["$300 (catastrophic failures more common)", "$150 (minor issues caught early)"] },
              { label: "Equipment replacement cycle (annualized)", cells: ["$800 (12-year typical neglected lifespan)", "$600 (16-year typical maintained lifespan)"] },
              { label: "TOTAL annual cost", cells: ["~$2,960", "~$2,510"] },
              { label: "Difference", cells: ["", "$450/year savings"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Numbers are illustrative typical residential — exact savings vary by climate, equipment age, energy prices, and system condition. Service contracts pay back within 1-3 years for most households; faster for older equipment with more failure risk; slower for newer high-efficiency equipment with less degradation potential.
          </p>

          <KeyInsight tone="blue" title="The non-financial argument">
            Beyond the math: maintained equipment fails less catastrophically. A neglected AC failing on a 95°F July afternoon is a very different experience from a maintained AC running smoothly. Comfort, reliability, and the absence of emergency-repair stress have value beyond the dollar math. For older residents, families with young children, or anyone with health conditions affected by heat or cold, system reliability is non-negotiable — annual maintenance is the cost of reliability.
          </KeyInsight>
        </section>

        {/* SECTION 17 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">17</span>
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

        {/* SECTION 18 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">18</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>ACCA Standards:</strong> ACCA Standard 4 — Maintenance of Residential HVAC Systems. ACCA Quality Maintenance Standard 6 (commercial QM). ACCA Manual T, System Balancing and Air Distribution. ACCA QI Standard 5 (Residential HVAC Quality Installation).
            </p>
            <p className="mt-3">
              <strong>ASHRAE Standards:</strong> ANSI/ASHRAE/ACCA Standard 180-2018, Standard Practice for the Inspection and Maintenance of Commercial HVAC Systems (jointly published with ACCA). ANSI/ASHRAE Standard 62.2-2022, Ventilation and Acceptable Indoor Air Quality for Low-Rise Residential. ANSI/ASHRAE Standard 52.2-2017, Method of Testing General Ventilation Air-Cleaning Devices for Removal Efficiency by Particle Size (MERV ratings).
            </p>
            <p className="mt-3">
              <strong>Refrigerant + safety:</strong> EPA Section 608 (40 CFR Part 82 Subpart F) — refrigerant handling during maintenance. AHRI Standard 700-2019 (refrigerant purity for reclamation). AHRI Standard 740 (recovery equipment). ASHRAE Standard 15 — Safety Standard for Refrigeration Systems (covers A2L handling). ASHRAE Standard 34 — Refrigerant Designation and Safety Classification.
            </p>
            <p className="mt-3">
              <strong>Combustion safety:</strong> NFPA 54, National Fuel Gas Code. ANSI Z21.13 (gas-fired hot-water boilers) including heat exchanger inspection criteria. ANSI Z83.8 (gas-fired duct furnaces). UL 2034 (CO alarm performance). Carbon monoxide exposure limits per OSHA 29 CFR 1910.1000.
            </p>
            <p className="mt-3">
              <strong>Electrical safety:</strong> NFPA 70, National Electrical Code. OSHA 29 CFR 1910 General Industry Safety standards. OSHA 29 CFR 1910.147 Lockout/Tagout for commercial service work.
            </p>
            <p className="mt-3">
              <strong>Equipment standards:</strong> AHRI Standard 210/240 (Performance Rating of Unitary AC + Heat Pump). AHRI Standard 1380 (Variable-Capacity Heat Pump Test Method). AHRI Standard 880 (Air Terminals). AHRI Standard 1230 (VRF systems). DOE 10 CFR Part 430 (federal appliance efficiency standards).
            </p>
            <p className="mt-3">
              <strong>Research + best practices:</strong> ENERGY STAR maintenance guidance for certified equipment. DOE Building America Solution Center maintenance protocols. DOE Better Buildings Program. NIST + Lawrence Berkeley National Laboratory residential HVAC efficiency studies. CDC indoor air quality guidance (filtration during respiratory illness season).
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> equipment-specific maintenance procedures (vary by manufacturer — consult the equipment installation/maintenance manual). Specific contractor recommendations (use the ACCA contractor directory at accaservice.com; HERS rater directory at resnet.us; NATE certified technician directory at natex.org). Specific filter brand recommendations (focus on the MERV rating + size; brand is secondary).
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
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Initial verification companion — commissioning at install, maintenance ongoing.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic decision trees when maintenance identifies a problem.</p>
            </Link>
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Energy Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2 + how maintenance affects realized efficiency.</p>
            </Link>
            <Link href="/hvac-refrigerant-recovery-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Recovery Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">EPA Section 608 + A2L safety for maintenance work.</p>
            </Link>
            <Link href="/superheat-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Thermometer className="h-4 w-4 text-blue-600" /> Superheat Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Refrigerant-side verification at annual service visit.</p>
            </Link>
            <Link href="/subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Subcooling Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">TXV charge verification.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Calendar, ListChecks, ShieldCheck, Wind, Filter, Zap, Lookups, Panel, ServiceProblem, VerdictBanner];
