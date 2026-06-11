import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, BookOpen, Gauge, ListChecks, Wrench, Zap, Droplet, Thermometer, Wind } from "lucide-react";
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
import { ProcessFlow } from "@/components/svg/concepts/ProcessFlow";
import { BarChart } from "@/components/svg/concepts/BarChart";

const PAGE_URL = `${SITE_URL}/hvac-troubleshooting-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Complete HVAC Troubleshooting Guide — Decision Trees for Cooling, Heating, Airflow & Efficiency Failures",
  description:
    "Diagnostic decision trees for the 10 most common HVAC failures: no cooling, no heating, insufficient capacity, short cycling, frozen evaporator, strange noises, water leaks, high utility bills. Cause hierarchy ordered by frequency, quick DIY checks, service-level procedures, and when to escalate. Sourced from ACCA Manual T, EPA 608, ASHRAE Handbook of Refrigeration.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Troubleshooting Guide — Diagnostic Decision Trees for Common Failures",
    description:
      "Decision trees for 10 HVAC symptom categories with cause hierarchies, quick checks, service-level diagnostics, and escalation logic.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete HVAC Troubleshooting Guide — 10 Symptom Decision Trees",
    description: "Cause hierarchy + diagnostic procedure for the 10 most common HVAC failures.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the single most useful tool for HVAC troubleshooting?",
    a: "A manifold gauge set with a calibrated digital thermometer probe. Most HVAC field problems express as pressure or temperature anomalies — wrong suction PSIG, abnormal superheat, high condenser approach — and you can't diagnose any of them without reading the numbers. A $200 digital manifold (Yellow Jacket, Fieldpiece, JB Industries) plus a $50 thermistor probe covers 90% of residential service calls. Add a multimeter ($30-100), a sling psychrometer or digital hygrometer ($50), and a flashlight, and you have the full diagnostic toolkit. See our <a href=\"/pt-calculator/\" class=\"underline\">PT calculator</a>, <a href=\"/superheat-calculator/\" class=\"underline\">superheat</a>, and <a href=\"/subcooling-calculator/\" class=\"underline\">subcooling calculators</a> for converting raw manifold readings into actionable diagnostics.",
  },
  {
    q: "How do I know whether a problem is the AC, the thermostat, or the ductwork?",
    a: "Three-step localization. (1) Is the equipment running? Listen at the outdoor unit (compressor hum) and the indoor air handler (blower). If neither runs, it's electrical or thermostat. If outdoor runs but indoor doesn't (or vice versa), it's a control or contactor issue. (2) Is air moving at supply registers? If equipment runs but no airflow, it's the blower or a clogged filter. If airflow but the air is room-temperature, it's a refrigerant or coil problem. (3) Is the airflow cool but not cold enough? It's likely undersizing, undercharging, or duct losses. The decision trees below walk through this localization in detail for each symptom.",
  },
  {
    q: "When should I replace my system instead of repairing it?",
    a: "The 5,000-rule from the HVAC trade: multiply equipment age by repair cost. If the product exceeds $5,000, replace. Example: 12-year-old system needs a $500 repair → 12 × 500 = $6,000 > $5,000 → consider replacement. The rule is rough but captures the right intuition: older equipment is closer to end-of-life and more failures are likely. Specific repair-vs-replace triggers: compressor failure on R-22 equipment (R-22 is phased out and bulk refrigerant is expensive); refrigerant leak in evaporator coil (recovery + leak repair + recharge often exceeds replacement value); cracked heat exchanger (CO safety hazard, mandatory replacement). For everything else, weigh the 5,000-rule against SEER improvement (modern 16+ SEER vs 10 SEER baseline cuts cooling bills 35-50%).",
  },
  {
    q: "Why does my system work fine on mild days but struggle on hot days?",
    a: "Three causes in order of likelihood. (1) Undercharge: with low refrigerant, evaporator can't pull enough heat under high latent load. Hot day pushes both sensible AND latent load up; the marginal capacity loss from undercharge becomes the difference between meeting setpoint and falling behind. Verify with superheat (high SH = undercharge). (2) Condenser airflow problem: dirty coil, blocked condenser, recirculating air. The condenser has to dump more heat on hot days; reduced airflow becomes critical only above ambient ~90°F. (3) Undersizing: equipment was sized for milder design conditions than today's actual peak. See our <a href=\"/hvac-load-calculator/\" class=\"underline\">load calculator</a> to verify equipment sizing matches actual load.",
  },
  {
    q: "Is short cycling always a sign of trouble?",
    a: "Yes — short cycling indicates either oversizing or a control problem. Causes: (1) AC too large for the load (most common; oversized equipment satisfies setpoint before pulling latent load, then short-cycles trying to maintain). (2) Refrigerant flooding (TXV stuck open, expansion valve sensing-bulb failure). (3) Compressor overload trip (low refrigerant, capacitor failure, contactor sticking). (4) Frosted evaporator with safety shutoff. (5) Thermostat malfunction (anticipator wrong, location near a register). Each cycle of compressor start-stop adds wear and consumes ~5× steady-state running current — short cycling cuts compressor life by 30-50%. Always diagnose and fix; don't ignore.",
  },
  {
    q: "What does the warranty cover vs not cover on residential HVAC?",
    a: "Most residential HVAC parts warranties are 5-10 years on equipment (compressor, heat exchanger, indoor coil) IF registered within 90 days of installation. Labor is rarely covered beyond the first year unless you bought an extended labor plan. Refrigerant is almost never covered — a leak in the evaporator might be a covered part but the recovery + refrigerant + labor to fix it is on you. NOT covered: anything caused by improper installation (Manual J undersized, undersized ducts, missing line-set adjustment), lack of maintenance (clogged filter caused compressor overload), or homeowner damage. Read the warranty fine print before paying for the repair; sometimes the part is free and only labor charges.",
  },
  {
    q: "How do I tell if my technician is correctly diagnosing vs guessing?",
    a: "Correct diagnosis reads numbers and writes them down: suction PSIG, suction line temp, calculated superheat, high-side PSIG, liquid line temp, calculated subcooling, outdoor DB, indoor DB and WB. Guessing skips measurements and goes straight to part replacement (\"sounds like a compressor\"). Ask your tech to write the readings on the work order; reputable companies do this routinely. Verify the numbers against expected ranges: at design conditions, R-410A residential system should read suction ~125-140 PSIG, suction line temp ~60-70°F, calculated SH 8-15°F for TXV systems. Use our calculators to verify the tech's math. If a tech replaces a compressor without taking pressure readings, you're being upsold.",
  },
  {
    q: "Can I troubleshoot a heat pump the same way as a straight AC?",
    a: "Mostly yes for cooling mode — same refrigerant cycle, same diagnostic readings. In heating mode (winter), the cycle reverses: outdoor coil becomes the evaporator, indoor coil becomes the condenser. Diagnostic readings flip: you measure outdoor coil saturation as evap temp, indoor coil as cond temp. Heat pump-specific symptoms: defrost cycle problems (frost not clearing from outdoor coil), reversing valve stuck mid-cycle (lukewarm air), auxiliary heat staying on continuously (heat pump can't keep up — undercharged or undersized). The fundamental diagnostic discipline is the same: read pressures, calculate SH/SC, compare to expected ranges.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Complete HVAC Troubleshooting Guide — Decision Trees for Cooling, Heating, Airflow & Efficiency Failures",
      description:
        "Diagnostic decision trees for 10 common HVAC failures with cause hierarchies ordered by frequency, quick checks, service-level procedures, and escalation logic. Sourced from ACCA Manual T, EPA 608, ASHRAE Handbook of Refrigeration.",
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
        { "@type": "Thing", name: "HVAC troubleshooting" },
        { "@type": "Thing", name: "Air conditioner diagnosis" },
        { "@type": "Thing", name: "Heat pump diagnosis" },
        { "@type": "Thing", name: "Furnace troubleshooting" },
        { "@type": "Thing", name: "Refrigerant diagnostics" },
      ],
      keywords: [
        "hvac troubleshooting",
        "ac not cooling",
        "furnace not heating",
        "hvac short cycling",
        "frozen evaporator coil",
        "hvac diagnostic decision tree",
        "ac troubleshooting guide",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "5-step HVAC diagnostic framework",
      description: "Universal diagnostic procedure for any HVAC symptom — used to localize the failure before diving into specific symptom decision trees.",
      totalTime: "PT45M",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set" },
        { "@type": "HowToTool", name: "Digital thermistor probe (suction/liquid line temperature)" },
        { "@type": "HowToTool", name: "Multimeter (AC voltage, continuity, capacitance)" },
        { "@type": "HowToTool", name: "Sling or digital psychrometer" },
        { "@type": "HowToTool", name: "Calibrated outdoor and indoor thermometers" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Verify the symptom", text: "Get the homeowner's symptom description, then reproduce it at the equipment. Don't trust hearsay — measure the failure firsthand." },
        { "@type": "HowToStep", position: 2, name: "Localize: indoor or outdoor failure?", text: "Listen at both units. If outdoor runs but indoor doesn't, it's the blower or low-voltage control. If indoor runs but outdoor doesn't, contactor, capacitor, or high/low pressure switch trip." },
        { "@type": "HowToStep", position: 3, name: "Read steady-state pressures and temperatures", text: "Let system run 15 minutes at full load. Record suction PSIG, suction line temp, high-side PSIG, liquid line temp, outdoor DB, indoor DB and WB." },
        { "@type": "HowToStep", position: 4, name: "Convert to diagnostic metrics", text: "Calculate superheat, subcooling, condenser approach (high-side sat temp − outdoor DB). Compare each to expected ranges for the refrigerant and equipment type." },
        { "@type": "HowToStep", position: 5, name: "Root-cause from the anomaly pattern", text: "Each diagnostic-metric anomaly maps to a finite cause set. High SH + low SC = undercharge. Low SH + high SC = overcharge or restriction. Normal SH + high approach = condenser fouling. Identify, fix, verify by re-reading." },
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
        { "@type": "ListItem", position: 3, name: "HVAC Troubleshooting Guide" },
      ],
    },
  ];
}

export default function HvacTroubleshootingGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Troubleshooting Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Complete HVAC Troubleshooting Guide — Decision Trees for Cooling, Heating, Airflow &amp; Efficiency Failures
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            Ten symptom categories with cause hierarchies ordered by frequency, quick DIY checks, service-level diagnostic procedures, and escalation logic. Every diagnostic step traces back to ACCA Manual T system-balancing procedures, EPA Section 608 refrigerant handling, and ASHRAE Handbook of Refrigeration. Use the symptom that matches your problem — each section walks from observation to root cause in a deterministic decision tree.
          </p>
        </header>

        {/* SECTION 01 — Diagnostic framework */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The 5-step diagnostic framework (used for every symptom)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Random part-swapping is expensive and frequently wrong. A structured 5-step framework localizes any HVAC failure to its root cause in 30-60 minutes. Use this for every service call before consulting the symptom-specific decision trees below.
          </p>

          <ol className="mt-4 list-decimal space-y-3 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Verify the symptom firsthand.</strong> Don&apos;t troubleshoot from hearsay. Walk the equipment, listen, observe, reproduce the failure. &quot;System isn&apos;t cooling&quot; might mean &quot;blower runs but air feels lukewarm,&quot; &quot;nothing happens when thermostat calls,&quot; or &quot;runs for 5 minutes then shuts off.&quot; Each is a different problem.</li>
            <li><strong>Localize: indoor or outdoor?</strong> Listen at both units. Outdoor compressor humming + indoor blower silent = blower failure or low-voltage control issue. Indoor blower spinning + outdoor silent = contactor, capacitor, or pressure-switch trip on the condenser side. Both silent = power, thermostat, or transformer.</li>
            <li><strong>Read steady-state pressures and temperatures.</strong> Connect manifold gauges. Run system 15 minutes at full load. Record: suction PSIG, suction line temp, high-side PSIG, liquid line temp, outdoor dry-bulb, indoor dry-bulb + wet-bulb. Write them down — these are the diagnostic ground truth.</li>
            <li><strong>Convert to diagnostic metrics.</strong> Superheat (suction line temp − saturation temp), subcooling (saturation temp − liquid line temp), condenser approach (high-side saturation − outdoor DB). Use our <Link href="/superheat-calculator/" className="underline">superheat</Link>, <Link href="/subcooling-calculator/" className="underline">subcooling</Link>, and <Link href="/pt-calculator/" className="underline">PT calculators</Link>.</li>
            <li><strong>Root-cause from anomaly patterns.</strong> Each pattern maps to a small cause set. Symbols: ↑ high, ↓ low, ✓ normal. SH↑ SC↓ = undercharge. SH↓ SC↑ = overcharge or restriction. SH✓ SC✓ approach↑ = condenser fouling. SH↑ SC✓ = TXV stuck closed or expansion problem. See the symptom decision trees below for the full mapping.</li>
          </ol>

          <KeyInsight tone="blue" title="The pattern-matching shortcut">
            Once you have SH, SC, and condenser approach, the root cause is deterministic for 85% of cases. Bad part-swappers ignore this and guess; experienced techs read three numbers and know the answer within 5 minutes. Each symptom section below uses this same SH/SC/approach pattern matching.
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <ProcessFlow
              title="The 5-step diagnostic framework — work it in order"
              orientation="vertical"
              steps={[
                { number: 1, title: "Verify the symptom firsthand", description: "Walk the equipment. Don't troubleshoot from hearsay — 'not cooling' has three different meanings." },
                { number: 2, title: "Localize indoor vs outdoor", description: "Listen at both units. Outdoor humming + indoor silent = blower side. Both silent = power or thermostat." },
                { number: 3, title: "Read steady-state pressures + temps", description: "Manifold gauges, 15 min runtime, record suction + liquid PSIG + line temps + WB/DB." },
                { number: 4, title: "Convert to SH / SC / approach", description: "Superheat, subcooling, and condenser approach are the three diagnostic metrics that matter.", critical: true },
                { number: 5, title: "Pattern-match to root cause", description: "SH↑ SC↓ = undercharge. SH↓ SC↑ = overcharge or restriction. The patterns are deterministic." },
              ]}
              caption="Skipping any step costs time — but skipping step 4 (the conversion) is what turns 5-minute diagnosis into 5-hour part-swapping."
            />
          </div>
        </section>

        {/* SECTION 02 — Tools needed */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Tools you need for HVAC diagnosis
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The minimum tool kit for residential HVAC diagnosis costs ~$400-600 and covers 90% of service calls. Anything missing from this list extends diagnosis time or forces guessing.
          </p>

          <ComparisonTable
            headers={["Tool", "Use", "Why it matters", "Approx. cost"]}
            rows={[
              { label: "Digital manifold gauge set", cells: ["Suction + discharge PSIG", "Foundation of every refrigerant-side diagnosis", "$200-450"] },
              { label: "Digital thermistor probe (suction + liquid)", cells: ["Suction line + liquid line temp", "Required for SH/SC calculation", "$50-150"] },
              { label: "Multimeter (clamp + leads)", cells: ["AC voltage, continuity, capacitance, amp draw", "Electrical diagnosis (capacitor, contactor, motor)", "$30-150"] },
              { label: "Sling or digital psychrometer", cells: ["Indoor dry-bulb + wet-bulb", "Airflow + load calculations; verifies coil performance", "$50-200"] },
              { label: "Calibrated infrared thermometer", cells: ["Surface temp (coil, register, line)", "Quick condenser fin temp, register supply air temp", "$30-100"] },
              { label: "Refrigerant leak detector (electronic)", cells: ["Trace leaks", "Find leak before recovery + recharge", "$100-400"] },
              { label: "Recovery machine + scale + cylinder", cells: ["EPA-compliant refrigerant recovery", "Required for any refrigerant removal", "$300-800"] },
              { label: "Vacuum pump (2-stage, 6+ CFM)", cells: ["Evacuate system before charging", "Removes moisture and non-condensables", "$200-500"] },
              { label: "Combustion analyzer (gas systems)", cells: ["CO, O₂, draft for furnaces", "Required for gas-furnace troubleshooting; required by code in many states", "$400-1500"] },
              { label: "Manometer / static pressure probe", cells: ["External static pressure", "Diagnoses airflow restriction (filter, ducts, coil)", "$100-300"] },
            ]}
          />

          <FixCallout>
            <strong>Optional but high-value:</strong> a duct leakage tester (Duct Blaster) for whole-house leak quantification ($300-1500), and a combustion gas analyzer ($300-1500) if you work on gas furnaces. Both pay for themselves on the first major job.
          </FixCallout>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Fault patterns — SH + SC values by root cause (R-410A, typical residential cooling)"
              orientation="horizontal"
              data={[
                { label: "Normal operation", value: 10, sub: "SH ≈10 SC ≈10", color: "#10b981" },
                { label: "Undercharge", value: 25, sub: "SH↑ SC↓", color: "#dc2626" },
                { label: "Overcharge", value: 3, sub: "SH↓ SC↑", color: "#ef4444" },
                { label: "TXV stuck closed", value: 30, sub: "SH↑ SC normal", color: "#f59e0b" },
                { label: "Dirty condenser", value: 8, sub: "SH↑ SC↑ + approach↑", color: "#a855f7" },
                { label: "Restricted liquid line", value: 3, sub: "SH↓ SC↑ + liquid sub-cool", color: "#8b5cf6" },
                { label: "Low indoor airflow", value: 5, sub: "SH↓ SC↑ + evap ice", color: "#3b82f6" },
              ]}
              axisLabel="Superheat (°F)"
              caption="Each fault produces a distinctive SH signature. Normal R-410A residential cooling is ~10°F superheat. Deviations above or below this baseline immediately suggest a root cause (combined with SC + approach readings)."
            />
          </div>
        </section>

        {/* SECTION 03 — No cooling */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Symptom: No cooling at all
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            System won&apos;t produce cold air. Could be electrical (nothing runs), control (equipment runs but won&apos;t cool), or mechanical (compressor seized, refrigerant gone). Decision tree by what you observe:
          </p>

          <TechSection icon="problem" tone="amber" title="Sub-symptom: Nothing happens when thermostat calls">
            <strong>Most likely causes (in order):</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Tripped breaker</strong> at the main panel. Check both the indoor air-handler breaker and outdoor condenser breaker. Reset once; if it trips again, there&apos;s a fault.</li>
              <li><strong>Blown low-voltage fuse</strong> in the air handler (3A or 5A glass automotive-style fuse on the control board). Replace; if blows again, short in the 24V control wiring.</li>
              <li><strong>Failed transformer</strong> (24V control transformer in air handler). Test with multimeter — should read 24-27 VAC across R and C.</li>
              <li><strong>Thermostat dead or disconnected.</strong> Check display; replace batteries if applicable. Verify thermostat wires landed correctly.</li>
              <li><strong>Tripped float switch</strong> on the condensate drain pan (safety cutoff when pan fills). Find drain pan, check water level, clear blockage.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Sub-symptom: Indoor blower runs but outdoor unit silent">
            <strong>Most likely causes:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Failed contactor</strong> in outdoor unit (the relay that energizes compressor + condenser fan). Listen for &quot;click&quot; from contactor when thermostat calls. If no click, low-voltage signal isn&apos;t reaching the contactor; check Y wire continuity from indoor board to contactor.</li>
              <li><strong>Failed start capacitor</strong> on compressor or fan. Test with multimeter on capacitance setting — should match nameplate µF rating ±6%. Bulging or leaking capacitor is dead.</li>
              <li><strong>Tripped high or low pressure switch</strong> (safety device). High-pressure trip means condenser airflow restriction or overcharge; low-pressure trip means undercharge or evaporator airflow blockage.</li>
              <li><strong>Failed compressor</strong> (seized internal motor). Test compressor windings with multimeter — open winding (infinite resistance) or shorted to case = compressor replacement.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Sub-symptom: Outdoor compressor runs but no cold air at registers">
            <strong>Most likely causes:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Iced-over evaporator coil</strong> blocking airflow. Turn system off, blower fan on, wait 1-3 hours to thaw. Then diagnose why it froze (see Frozen Evaporator section below).</li>
              <li><strong>Completely empty refrigerant charge</strong> (catastrophic leak). Connect gauges — if pressures are equal and near ambient saturation pressure, system is empty. Find leak, repair, recover, evacuate, recharge.</li>
              <li><strong>Indoor blower not running</strong> (motor failure, capacitor, ECM module). Listen for blower hum or feel air at supply register.</li>
              <li><strong>Reversing valve stuck in heating mode</strong> (heat pumps only). System is moving heat the wrong direction.</li>
            </ol>
          </TechSection>
        </section>

        {/* SECTION 04 — No heating */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Symptom: No heating
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Distinguish furnace vs heat pump vs hybrid. Different diagnostic paths:
          </p>

          <TechSection icon="problem" tone="amber" title="Gas furnace — won't ignite">
            <strong>Most likely causes:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Dirty flame sensor.</strong> Pull, wipe with fine sandpaper, reinstall. Most common single cause of no-ignition on 10-year-old furnaces.</li>
              <li><strong>No gas at the valve.</strong> Check gas shutoff is open. If you have other gas appliances (water heater), verify they have gas.</li>
              <li><strong>Failed igniter</strong> (hot-surface igniter on most modern furnaces). Visually check for cracks. Test continuity — open = replace.</li>
              <li><strong>Blocked condensate drain</strong> on 90+% AFUE condensing furnace. Pressure switch won&apos;t close; furnace won&apos;t fire. Clear drain.</li>
              <li><strong>Failed control board</strong> after diagnosis above eliminates other causes. Read the diagnostic LED flash code per furnace manual.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Heat pump — runs but blows cool air in heating mode">
            <strong>Most likely causes:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Reversing valve stuck or wired wrong.</strong> Should energize on heat call (B terminal) to switch to heating. Listen for the valve sliding (audible &quot;woosh&quot; in the outdoor unit on mode change).</li>
              <li><strong>Outdoor unit frozen over.</strong> Heat pump heating mode runs outdoor coil as evaporator below freezing — it accumulates frost and must defrost periodically. If defrost cycle fails, ice builds up and capacity drops. Verify defrost cycle initiates every 30-90 minutes when frost is present.</li>
              <li><strong>Auxiliary (emergency) electric heat not energizing.</strong> When outdoor temp drops below the &quot;balance point&quot; (typically 30-40°F), heat pump alone can&apos;t keep up; aux heat strips should energize via W terminal call. Verify with multimeter or amp draw.</li>
              <li><strong>Undercharged refrigerant.</strong> Heat pump heating capacity drops sharply with low charge. Verify via SH/SC in heating mode (note: indoor coil is condenser, outdoor is evap).</li>
            </ol>
          </TechSection>
        </section>

        {/* SECTION 05 — Insufficient capacity */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Symptom: Runs but doesn&apos;t cool/heat enough (insufficient capacity)
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            System runs continuously but can&apos;t reach setpoint. Almost always one of: undercharge, airflow problem, condenser fouling, or undersized equipment.
          </p>

          <ServiceProblem
            number={1}
            title="Diagnostic procedure — insufficient cooling"
            refrigerant="any"
            scenario="System runs continuously on a 95°F design day. Indoor temperature drifts up from 72°F setpoint to 78°F. Outdoor compressor running, indoor blower running, cool air coming from supply registers but not cold enough to keep up."
          >
            <Panel title="Step 1 — Read steady-state values" icon={ListChecks}>
              <Lookups rows={[
                { input: "Suction PSIG", output: "measured", note: "compare to expected per refrigerant + indoor WB" },
                { input: "Suction line temp", output: "measured", note: "6\" from evap outlet, insulated probe" },
                { input: "Calculated SH", output: "suction line temp − sat temp", note: "TXV target 8-15°F; fixed-orifice from Carrier chart" },
                { input: "High-side PSIG", output: "measured" },
                { input: "Liquid line temp", output: "measured" },
                { input: "Calculated SC", output: "sat temp − liquid line temp", note: "target 8-12°F" },
                { input: "Condenser approach", output: "high-side sat − outdoor DB", note: "should be 15-25°F; >35°F = airflow problem" },
              ]}/>
            </Panel>
            <Panel title="Step 2 — Pattern match" icon={Gauge}>
              <ComparisonTable
                headers={["Pattern", "Root cause", "Fix"]}
                rows={[
                  { label: "SH high (15-30°F), SC low (<5°F)", cells: ["Undercharge", "Leak-check, repair, evacuate, recharge to nameplate + line set"] },
                  { label: "SH low (<5°F), SC high (15-25°F)", cells: ["Overcharge or restriction", "Recover charge in 4oz increments; if SH stays low, check liquid line filter/drier"] },
                  { label: "SH normal, SC normal, condenser approach >35°F", cells: ["Condenser fouling", "Clean coil with water + coil cleaner; verify approach drops"] },
                  { label: "SH normal, SC normal, approach normal", cells: ["Undersized equipment OR airflow short", "Check return-air CFM; verify Manual J load (use load calculator)"] },
                  { label: "SH high (>30°F), SC normal, low suction", cells: ["TXV stuck partially closed OR liquid line restriction", "Replace TXV or filter/drier"] },
                ]}
              />
            </Panel>
            <VerdictBanner status="info" title="The 5 patterns cover ~85% of insufficient-cooling calls">
              The remaining 15% are weird combinations (failing compressor, non-condensables in the system, mis-wired contactor causing low voltage to compressor, electrical phase imbalance on 3-phase). Don&apos;t chase exotic causes until you&apos;ve ruled out the five common ones.
            </VerdictBanner>
            <FixCallout>
              <strong>For high condenser approach specifically</strong>, see our <Link href="/high-head-pressure-causes/" className="underline">high head pressure diagnostic guide</Link> for the 8-root-cause decision tree.
            </FixCallout>
          </ServiceProblem>
        </section>

        {/* SECTION 06 — Short cycling */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Symptom: Short cycling (compressor on-off-on-off)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Compressor runs for short periods (3-5 minutes), shuts off, restarts shortly. Normal cycle is 10-20 minutes on, 10-20 minutes off at moderate load. Anything under 8-minute on-time qualifies as short cycling.
          </p>

          <ComparisonTable
            headers={["Cause", "How to confirm", "Fix"]}
            rows={[
              { label: "Oversized equipment (most common)", cells: ["Manual J load << equipment capacity; system pulls down setpoint in 5 minutes", "Replace with correctly-sized variable-capacity; use load calculator first"] },
              { label: "Frozen evaporator (intermittent trip)", cells: ["Iced coil; safety pressure switch trips when ice blocks airflow", "Find airflow restriction or undercharge causing the freeze (see Frozen Evap section)"] },
              { label: "Refrigerant flooding (TXV failure)", cells: ["Liquid refrigerant returning to compressor; suction line ice-cold past insulation", "Replace TXV; verify SH at expected target after"] },
              { label: "Compressor thermal overload trip", cells: ["Compressor housing very hot; runs 5 min, trips on internal overload, resets after cooling", "Often caused by low refrigerant or capacitor failure; check both"] },
              { label: "Failing capacitor", cells: ["Measured µF < 90% of nameplate; visible bulging; clicking sound from contactor", "Replace capacitor — $20-40 part"] },
              { label: "Dirty/clogged filter", cells: ["Static pressure way above blower design; blower amp draw low", "Replace filter, return to standard schedule"] },
              { label: "Thermostat located near supply register", cells: ["Thermostat reads recent supply air temp, not room temp", "Relocate thermostat away from registers and direct sun"] },
            ]}
          />

          <KeyInsight tone="amber" title="Short cycling kills compressors">
            Each compressor start consumes ~5× steady-state current and stresses the motor windings. A system that should run 20 min/cycle × 3 cycles/hr (3 starts/hr at 12,000 starts/year normal) but instead short cycles at 4 min/cycle × 8 cycles/hr (32,000 starts/year) cuts compressor service life by 30-50%. Diagnose and fix even if temporarily &quot;working.&quot;
          </KeyInsight>
        </section>

        {/* SECTION 07 — Frozen evaporator */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Symptom: Frozen evaporator coil
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Ice forms on the indoor coil. Two causes only: insufficient airflow across the coil, or insufficient refrigerant. Both result in coil surface temperature dropping below 32°F so any moisture freezes instead of draining away.
          </p>

          <TechSection icon="problem" tone="amber" title="Cause 1 — Insufficient airflow (60% of cases)">
            <strong>Sub-causes in order:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><strong>Dirty filter.</strong> Replace; if blowing-clean restores airflow, was the cause.</li>
              <li><strong>Dirty evaporator coil.</strong> Remove and clean. Algae/biological growth from poor maintenance.</li>
              <li><strong>Closed/blocked supply registers.</strong> Reduces airflow; check that homeowner hasn&apos;t closed registers in unused rooms.</li>
              <li><strong>Failed/slow blower motor.</strong> Measure actual CFM with anemometer or static pressure rise.</li>
              <li><strong>Crushed flexible duct</strong> in attic crawlspace. Visual inspection.</li>
              <li><strong>Undersized return duct</strong> — design problem, not maintenance. Use our <Link href="/duct-size-calculator/" className="underline">duct calculator</Link> to verify.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Cause 2 — Insufficient refrigerant (40% of cases)">
            <strong>What happens:</strong> With low charge, evaporator pressure drops to below normal (saturation temp drops), and the smaller refrigerant mass flow doesn&apos;t carry enough heat to keep coil surface above freezing. Diagnostic: connect manifold, read suction PSIG. If suction is significantly below normal (e.g. 90 PSIG R-410A when expected ~125 PSIG), undercharge confirmed.
            <br /><br />
            <strong>Fix:</strong> defrost the coil first (system off, blower on, wait 1-3 hours). Find and repair leak. Recover remaining charge, evacuate to 500 microns or better, recharge to nameplate weight + line-set adjustment per our <Link href="/refrigerant-charge-calculator/" className="underline">refrigerant charge calculator</Link>.
          </TechSection>

          <FixCallout>
            <strong>Don&apos;t just add refrigerant.</strong> Adding charge to a system that froze due to airflow problems creates a new failure mode (compressor flooding). And adding charge to a system that froze due to leaks puts more refrigerant into the atmosphere — find the leak first. EPA Section 608 specifically prohibits &quot;topping off&quot; without leak repair on systems above 50 lbs of refrigerant (commercial), and best practice for residential is the same.
          </FixCallout>
        </section>

        {/* SECTION 08 — Strange noises */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Symptom: Strange noises
          </h2>

          <ComparisonTable
            headers={["Sound", "Source", "Likely cause", "Action"]}
            rows={[
              { label: "Banging / loud thump on startup", cells: ["Outdoor compressor", "Liquid slugging (refrigerant migration during off cycle)", "Check crankcase heater; verify TXV sensing bulb"] },
              { label: "Squealing / belt squeak", cells: ["Indoor blower belt (older units)", "Worn or loose belt", "Replace belt; tension per manufacturer"] },
              { label: "Grinding metal-on-metal", cells: ["Blower or condenser fan", "Failed bearing in motor", "Replace motor"] },
              { label: "Hissing from refrigerant lines", cells: ["Anywhere in refrigerant path", "Active refrigerant leak (audible at ~5 PSIG escape)", "Find leak with electronic detector, repair"] },
              { label: "Whistling at supply registers", cells: ["Duct system", "Static pressure too high (undersized ducts)", "Verify duct sizing; reduce friction (larger ducts) or airflow"] },
              { label: "Loud humming at startup, then trip", cells: ["Compressor", "Hard-starting due to weak/bad start capacitor", "Replace capacitor"] },
              { label: "Rattling / vibration at outdoor unit", cells: ["Cabinet panels or loose fan", "Loose screws on cabinet; fan bearing wear", "Tighten cabinet; check fan freedom of rotation"] },
              { label: "Continuous low buzz with no compressor start", cells: ["Contactor (24V) energized but compressor won't turn", "Locked compressor (seized) or bad capacitor", "Test capacitor first; if good, compressor replacement"] },
            ]}
          />
        </section>

        {/* SECTION 09 — Water leaks */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Symptom: Water leaks
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Water around the indoor air handler or dripping from supply registers. Three categories:
          </p>
          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Clogged condensate drain</strong> (most common). Algae/biological growth blocks the trap. Water backs up into drain pan, eventually overflows. Clear with wet-vac on the drain line outlet; flush with diluted bleach to prevent regrowth.</li>
            <li><strong>Failed drain pan</strong> (older units). Rust holes in primary or secondary drain pan. Replace pan.</li>
            <li><strong>Frozen evaporator that thawed.</strong> Ice melted faster than drain could handle. See Frozen Evap section above to fix the underlying freeze cause.</li>
            <li><strong>Disconnected drain line</strong> at the unit fitting. Reattach with proper PVC cement and slope (¼&quot; per ft minimum).</li>
            <li><strong>Sweating ductwork or registers</strong> in humid weather. Cold ducts in humid unconditioned space + dew point above duct temp = surface condensation. Insulate ducts; check for air leaks in the conditioned-air supply.</li>
          </ul>
        </section>

        {/* SECTION 10 — High utility bills */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Symptom: Sky-high utility bills (efficiency drop)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Comparison metric: kWh per cooling-degree-day (CDD) for AC, therms per heating-degree-day (HDD) for furnace. Sudden 20%+ increase year-over-year at similar weather indicates a system efficiency problem.
          </p>

          <ComparisonTable
            headers={["Cause", "Symptom", "Verify", "Fix"]}
            rows={[
              { label: "Dirty condenser coil", cells: ["High discharge pressure; compressor amp draw above nameplate", "Clean coil; measure pressure drop", "Coil cleaning ($100-200 service call)"] },
              { label: "Undercharge (slow leak)", cells: ["Slowly declining capacity; gradual bill increase over 12-24 months", "Manifold reads low suction; SH high", "Find leak, recover, recharge"] },
              { label: "Duct leakage", cells: ["Hot/cold spots; bills creep up after duct work or remodeling", "Duct blaster test (target: <6% of system airflow leakage)", "Mastic-seal accessible joints"] },
              { label: "Compressor inefficiency (aging)", cells: ["12+ year old unit; capacity below rated", "AHRI rated capacity vs measured", "Replace at end of equipment life"] },
              { label: "Failed reversing valve (heat pump)", cells: ["Both AC and heat pump efficiency drop", "Internal valve leakage; reduced ΔT", "Replace reversing valve (compressor often goes too)"] },
              { label: "Auxiliary heat strips stuck on", cells: ["Heat pump runs all the time + electric strips constantly", "Aux heat ammeter shows continuous draw", "Repair thermostat staging; fix balance point"] },
            ]}
          />
        </section>

        {/* SECTION 11 — DIY vs pro */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            DIY vs professional — where to draw the line
          </h2>

          <ComparisonTable
            headers={["Task", "DIY", "Pro only", "Why"]}
            rows={[
              { label: "Filter replacement", cells: ["✓", "—", "Routine maintenance, $5 part, 5-minute job"] },
              { label: "Condensate drain cleaning", cells: ["✓", "—", "Wet-vac and bleach flush, no special tools"] },
              { label: "Condenser coil cleaning (outdoor)", cells: ["✓", "—", "Garden hose; just don't bend fins"] },
              { label: "Thermostat replacement", cells: ["✓", "Wiring questions", "5-7 wires; clear instructions on most units"] },
              { label: "Capacitor replacement", cells: ["⚠️ if comfortable with electrical", "✓", "Caps store 240V even when off — discharge first; matched µF required"] },
              { label: "Contactor replacement", cells: ["⚠️ if comfortable", "✓", "Power must be off; matched amperage rating"] },
              { label: "Refrigerant work (any kind)", cells: ["—", "✓ (EPA Section 608 required)", "Federal law; venting refrigerant is illegal + fines"] },
              { label: "Leak repair + recharge", cells: ["—", "✓", "Requires recovery machine, vacuum pump, certified tech"] },
              { label: "Compressor or coil replacement", cells: ["—", "✓", "Brazing, recovery, evacuation, charge"] },
              { label: "Furnace heat exchanger inspection", cells: ["—", "✓", "Cracked exchanger = CO leak; combustion analyzer required"] },
              { label: "Gas valve / igniter replacement", cells: ["—", "✓", "Gas + electrical + ignition control board interactions"] },
              { label: "Duct sealing (accessible)", cells: ["✓ with mastic", "✓ for whole-system", "Aerosol sealant requires pro equipment"] },
            ]}
          />

          <KeyInsight tone="amber" title="EPA Section 608 in plain English">
            Anyone who opens a refrigerant circuit, recovers refrigerant, or charges a system must hold an EPA Section 608 certification. Penalties for unlicensed refrigerant work: up to $44,539 per day per violation (40 CFR § 82.166), plus the cost of refrigerant lost to atmosphere. There&apos;s no &quot;hobbyist exemption.&quot; If a YouTube tutorial tells you to &quot;just hook up a can,&quot; that&apos;s illegal in the US.
          </KeyInsight>
        </section>

        {/* SECTION 12 — Safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Safety: refrigerant, electrical, gas
          </h2>

          <TechSection icon="problem" tone="amber" title="Refrigerant safety">
            R-410A operates at 250-500+ PSIG — high enough to cause serious injury from a hose blow-out. Always: wear safety glasses; verify hoses rated for high-side pressure; never trap liquid in a closed line; recover before brazing (recovery removes refrigerant + oil that would otherwise burn). A2L refrigerants (R-32, R-454B) are mildly flammable — no open flames, ground tools, ensure ventilation. A3 (R-290 propane) is fully flammable — specialized handling required.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Electrical safety">
            Disconnect power at the breaker AND verify with a non-contact voltage tester before touching internals. Capacitors hold 240V charge even with power off — discharge with a 20kΩ resistor or insulated screwdriver across the terminals before handling. Three-phase commercial systems have 480V potential between phases — lethal contact at any point. Lockout/tagout per OSHA 1910.147 for service work in commercial settings.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Gas safety">
            Smell gas? Don&apos;t use any electrical switch (including light switches). Evacuate, call gas utility from outside. Inside furnace: verify gas valve closed before any service. Combustion analyzer required for furnace work — undetected carbon monoxide can kill occupants overnight. Cracked heat exchangers must be replaced immediately; do not attempt to weld/repair. ANSI Z21.13 governs gas furnace heat exchanger inspection criteria.
          </TechSection>
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
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: f.a.split(/\n\s*\n/).map((p) => `<p>${p.trim()}</p>`).join("") }} />
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
              <strong>Diagnostic procedures:</strong> ACCA Manual T (System Balancing &amp; Air Distribution), ACCA Quality Maintenance Standards (QMS), ASHRAE Handbook of HVAC Applications 2023 Chapter 38 (Diagnostic Practice). Decision trees adapted from manufacturer service literature (Carrier Service Reference, Trane Service Bulletins, Lennox Diagnostic Guides).
            </p>
            <p className="mt-3">
              <strong>Refrigerant safety:</strong> EPA Section 608 (40 CFR Part 82, Subpart F). ASHRAE Standard 15 (Safety Standard for Refrigeration Systems). ASHRAE Standard 34 (Designation and Safety Classification of Refrigerants). For A2L-specific handling: AHRI Safe Refrigerant Transition guidance + manufacturer&apos;s installation instructions.
            </p>
            <p className="mt-3">
              <strong>Electrical safety:</strong> NFPA 70 (National Electrical Code). OSHA 29 CFR 1910.147 (Lockout/Tagout for commercial). For residential service: best practice is breaker-off plus verification with non-contact voltage tester before touching internals.
            </p>
            <p className="mt-3">
              <strong>Gas safety:</strong> NFPA 54 (National Fuel Gas Code) / ANSI Z223.1. ANSI Z21.13 (Gas-Fired Hot-Water Boilers — heat exchanger inspection criteria). Combustion analysis per ASHRAE Standard 103 / AHRI 1500.
            </p>
            <p className="mt-3">
              <strong>What this guide is not:</strong> a substitute for hands-on training, EPA Section 608 certification, or local code-compliance review. Refrigerant work in the US requires Section 608 certification by federal law. Many local jurisdictions require a licensed HVAC contractor for any work beyond filter replacement and visible-surface cleaning.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related tools */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Calculators and references used in this guide</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/superheat-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Superheat calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Convert suction PSIG + line °F to superheat; cornerstone of refrigerant-side diagnosis.</p>
            </Link>
            <Link href="/subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Subcooling calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Liquid line PSIG + °F → SC. TXV charging metric.</p>
            </Link>
            <Link href="/pt-superheat-subcooling-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Combined PT/SH/SC calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Both sides at once with pattern-matching diagnostic banner.</p>
            </Link>
            <Link href="/high-head-pressure-causes/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> High head pressure causes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">8-root-cause decision tree for high-side pressure problems.</p>
            </Link>
            <Link href="/carrier-410a-charging-chart/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Thermometer className="h-4 w-4 text-blue-600" /> Carrier R-410A charging chart</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Fixed-orifice target superheat by outdoor/wet-bulb.</p>
            </Link>
            <Link href="/duct-size-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> Duct size calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Verify duct sizing for airflow-related symptoms.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-blue-600" /> HVAC load calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Confirm equipment sizing matches actual building load.</p>
            </Link>
            <Link href="/superheat-subcooling-fundamentals/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> SH &amp; SC fundamentals</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Conceptual framework for what SH and SC mean.</p>
            </Link>
            <Link href="/refrigerant-charge-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Droplet className="h-4 w-4 text-blue-600" /> Refrigerant charge calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Line-set adjustment to nameplate charge after a recharge.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
