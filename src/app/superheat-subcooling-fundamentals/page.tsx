import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";
import {
  ComparisonTable,
  Derived,
  FixCallout,
  Gauges,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";

const PAGE_URL = `${SITE_URL}/superheat-subcooling-fundamentals/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Superheat & Subcooling Fundamentals — HVAC Reference Guide",
  description:
    "Complete reference on superheat and subcooling for HVAC technicians: what they are, how to measure them, target values by system type, diagnostic patterns with worked examples, and common pitfalls. Sourced from ACCA Manual T, ASHRAE Handbook of Refrigeration 2022, and AHRI Standard 540.",
  alternates: { canonical: PAGE_URL },
};

const FAQS = [
  {
    q: "Why do I need both superheat and subcooling?",
    a: "Each one alone tells half the story; together they pin down the system's charge state and isolate root causes. The classic patterns: high superheat + low subcooling = undercharge; low superheat + high subcooling = overcharge; both abnormal in the same direction = airflow or metering device issue. No single measurement gives you these patterns — you need both.",
  },
  {
    q: "Which is the primary charging metric?",
    a: "Depends on the metering device. Fixed-orifice systems are charged by superheat (per ACCA Manual T charging chart, indexed on indoor wet-bulb and outdoor dry-bulb). TXV / EEV systems are charged by subcooling (typically 8-12°F per OEM nameplate). On a TXV system the superheat hovers near the TXV setpoint regardless of charge, so superheat reads in-range even at overcharge — subcooling is the primary metric.",
  },
  {
    q: "What's the difference between total superheat and evaporator superheat?",
    a: "Total superheat is measured at the suction line near the compressor — what most charging procedures reference. Evaporator superheat is measured at the evaporator outlet, before any temperature pickup along the suction line. Total is usually 2-5°F higher than evaporator due to suction-line heat gain. ACCA Manual T charging charts target Total SH; TXV setpoints control to Evaporator SH.",
  },
  {
    q: "How does temperature glide affect superheat measurement on zeotropic blends?",
    a: "Significantly. On R-407C (~11°F glide) using the bubble curve gives a value that's ~11°F too high; on R-454C (~14°F glide) the error is ~14°F; on R-455A (~22°F) it's ~22°F. The site's calculators use the dew curve at suction pressure for SH automatically. Always verify your PT chart software does the right curve for the right side.",
  },
  {
    q: "What does negative superheat mean?",
    a: "Liquid refrigerant is reaching the compressor (slugging or flooding). Liquid is incompressible and damages compressor valves and bearings. Stop the system and diagnose before continuing. Common causes: overcharge, stuck-open TXV flooding the evaporator, severely low indoor airflow keeping the evap cold enough to flood.",
  },
  {
    q: "What does negative subcooling mean?",
    a: "Vapor bubbles are forming in the liquid line (flash gas). The metering device receives a two-phase mix instead of fully-liquid refrigerant; cooling capacity drops sharply. Causes: significant undercharge, restriction at filter-drier or expansion device, or non-condensables. The system is impaired; diagnose before adding refrigerant under EPA Section 608.",
  },
  {
    q: "What's the AHRI 540 minimum return-gas superheat?",
    a: "AHRI Standard 540 (Positive Displacement Refrigerant Compressors) specifies minimum return-gas superheat at the compressor suction: 20°F for hermetic compressors and 30°F for semi-hermetic compressors. These are compressor-protection minimums, not service-charging targets. A residential split system charged to 10°F TXV SH at the line measurement point still satisfies AHRI 540 because suction-line pickup adds further superheat between the line probe and the compressor crankcase.",
  },
  {
    q: "How do approach temperatures relate to SH and SC?",
    a: "Condenser approach = T_sat_discharge − T_ambient (15-25°F normal residential). Evaporator approach = T_return_air − T_sat_suction (20-40°F normal residential). They give a third dimension beyond SH and SC: a condenser-fouling case shows high SC AND high condenser approach (distinguishing it from overcharge which shows high SC + normal approach). The system pressure diagnostic calculator uses approach temperatures alongside SH/SC for richer fingerprint matching.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Superheat & Subcooling Fundamentals",
      description:
        "Complete plain-language reference on superheat and subcooling for HVAC technicians: what they are, how to measure, target values, diagnostic interpretation, with worked examples and SVG diagrams.",
      proficiencyLevel: "Beginner to Intermediate",
      dependencies: "Familiarity with the vapor-compression refrigeration cycle and manifold gauge use.",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
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
        { "@type": "ListItem", position: 3, name: "Superheat & Subcooling Fundamentals" },
      ],
    },
  ];
}

export default function FundamentalsPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Superheat & Subcooling Fundamentals</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Superheat &amp; Subcooling Fundamentals</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Complete reference for HVAC technicians: what superheat and subcooling are, how to
            measure them in the field, what their target values mean for different system types,
            and how to use the pair together to diagnose charge and system issues.
          </p>
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50/30 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/20">
            <strong>TL;DR:</strong> Superheat tells you how thoroughly the evaporator boils the
            refrigerant. Subcooling tells you how thoroughly the condenser condenses it. Together
            they pin down whether a system is correctly charged, overcharged, undercharged, or has
            an airflow / metering device problem. Targets depend on the metering device
            (TXV vs fixed-orifice) and the application.
          </div>
        </header>

        <nav className="mb-10 rounded-md border border-zinc-200 bg-zinc-50/40 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30" aria-label="Table of contents">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sections</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><a href="#what" className="hover:underline">What superheat and subcooling are</a></li>
            <li><a href="#measure" className="hover:underline">How to measure in the field</a></li>
            <li><a href="#targets" className="hover:underline">Target values by system type</a></li>
            <li><a href="#patterns" className="hover:underline">Diagnostic patterns</a></li>
            <li><a href="#scenarios" className="hover:underline">Worked service scenarios</a></li>
            <li><a href="#pitfalls" className="hover:underline">Common pitfalls</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ol>
        </nav>

        <section id="what" className="mb-10">
          <TechSection icon="thermometer" tone="blue" title="1. What superheat and subcooling are">
            <p>
              <strong>Superheat</strong> is the temperature of refrigerant vapor above its
              saturation temperature at the same pressure. It is measured on the suction line.
              If the vapor at the suction port reads 60°F and the saturation temperature
              corresponding to the suction pressure is 45°F, superheat = 60 − 45 = 15°F.
            </p>
            <p>
              <strong>Subcooling</strong> is the temperature of liquid refrigerant below its
              saturation temperature at the same pressure. It is measured on the liquid line.
              If the liquid at the condenser outlet reads 100°F and the saturation temperature
              corresponding to the discharge pressure is 112°F, subcooling = 112 − 100 = 12°F.
            </p>
            <p>
              Both are non-negative on a working system. Negative superheat means liquid is
              reaching the compressor (slugging); negative subcooling means vapor is forming in
              the liquid line (flash gas at the metering device). Both are damaging conditions
              that require immediate diagnosis.
            </p>
            <PtSaturationDiagram />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Superheat and subcooling on the PT diagram: vapor superheats above the saturation
              curve (suction-side measurement), liquid subcools below the saturation curve
              (condenser-side measurement). Source: ASHRAE Handbook of Refrigeration 2022
              Ch. 1 (vapor-compression cycle).
            </p>
          </TechSection>
        </section>

        <section id="measure" className="mb-10">
          <TechSection icon="gauge" tone="purple" title="2. How to measure superheat and subcooling in the field">
            <p><strong>For superheat:</strong></p>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Connect the manifold gauge to the suction service port. Read suction pressure in PSIG.</li>
              <li>Clamp a contact temperature probe to the suction line within 6 inches of the compressor (or per the equipment OEM&apos;s specified measurement point). Insulate the probe from ambient air.</li>
              <li>Let the system run 10-15 minutes under load to stabilize. Record the probe temperature.</li>
              <li>Convert the suction pressure to saturation temperature for the refrigerant in the system — use the <Link href="/pt-calculator/" className="underline">PT calculator</Link>, the <Link href="/superheat-calculator/" className="underline">superheat calculator</Link> (does the math), or a printed PT chart.</li>
              <li>Subtract saturation T from measured T. The difference is superheat.</li>
            </ol>
            <p><strong>For subcooling — same procedure on the liquid line:</strong></p>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Read the discharge (high-side) pressure from the manifold.</li>
              <li>Clamp a probe to the liquid line at the condenser outlet (the smaller, uninsulated copper line). Insulate.</li>
              <li>Convert the liquid pressure to saturation temperature.</li>
              <li>Subtract measured T from saturation T. The difference is subcooling.</li>
            </ol>
            <p>
              For zeotropic blends — R-407C, R-454C, R-455A, R-448A, R-449A — use the <em>dew</em>
              curve for superheat and the <em>bubble</em> curve for subcooling. The site&apos;s
              calculators handle this automatically. Using a single curve for both introduces an
              error equal to the temperature glide (11-22°F depending on blend).
            </p>
          </TechSection>
        </section>

        <section id="targets" className="mb-10">
          <TechSection icon="data" tone="emerald" title="3. Target values by system type">
            <Panel title="Target SH and SC by system type" icon={TableIcon}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                      <th className="py-1.5 text-left">System type</th>
                      <th className="py-1.5 text-right">Target SH</th>
                      <th className="py-1.5 text-right">Target SC</th>
                      <th className="py-1.5 text-left">Charged by</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Fixed-orifice residential AC</td><td className="py-1.5 text-right font-mono tabular-nums">5-25°F</td><td className="py-1.5 text-right font-mono tabular-nums">informational</td><td className="py-1.5 text-xs">SH (ACCA Manual T chart)</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">TXV residential AC</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-right font-mono tabular-nums">8-12°F</td><td className="py-1.5 text-xs">SC (OEM nameplate)</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">EEV residential AC</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-right font-mono tabular-nums">5-12°F</td><td className="py-1.5 text-xs">SC + EEV diagnostic</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Heat pump (cooling mode)</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">SC</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Heat pump (heating mode)</td><td className="py-1.5 text-right font-mono tabular-nums">10-20°F</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">SC at indoor coil</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in cooler MT (TXV)</td><td className="py-1.5 text-right font-mono tabular-nums">6-12°F</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">SC</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in freezer LT (TXV)</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">SC</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Centrifugal chiller</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F at evap</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F at cond</td><td className="py-1.5 text-xs">OEM-specific</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Mobile AC (R-1234yf, R-134a)</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-right font-mono tabular-nums">5-10°F</td><td className="py-1.5 text-xs">By weight (SAE J639)</td></tr>
                    <tr><td className="py-1.5">Hermetic compressor min (AHRI 540)</td><td className="py-1.5 text-right font-mono tabular-nums">≥20°F</td><td className="py-1.5 text-right font-mono tabular-nums">—</td><td className="py-1.5 text-xs">Protection floor</td></tr>
                  </tbody>
                </table>
              </div>
            </Panel>
            <TargetRangeBars />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Target SH (blue) and SC (purple) ranges by application. Compressor minimums (AHRI
              540) are protection thresholds at the compressor inlet, typically higher than
              service-line targets due to suction-line pickup. Source: ACCA Manual T (2017),
              ASHRAE Handbook of Refrigeration 2022 Ch. 23, AHRI Standard 540-2020, OEM service
              literature.
            </p>
          </TechSection>
        </section>

        <section id="patterns" className="mb-10">
          <TechSection icon="warning" tone="amber" title="4. Diagnostic patterns — what each combination means">
            <p>
              Four common SH × SC patterns, each pointing to a different root cause family.
              These are the foundation of refrigerant-side diagnostic work and underpin the
              eight-pattern matrix used in the combined diagnostic calculator.
            </p>
            <Panel title="Four-pattern SH × SC matrix" icon={TableIcon}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                      <th className="py-1.5 text-left">SH</th>
                      <th className="py-1.5 text-left">SC</th>
                      <th className="py-1.5 text-left">Root cause</th>
                      <th className="py-1.5 text-left">Verification step</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Properly charged</td><td className="py-1.5 text-xs">No action — document baseline</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / Neg</td><td className="py-1.5">Undercharge</td><td className="py-1.5 text-xs">Leak search → repair → recharge by weight</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">Low / Zero</td><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5">Overcharge</td><td className="py-1.5 text-xs">Verify condenser airflow → recover in increments</td></tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5">Restriction OR low evap airflow</td><td className="py-1.5 text-xs">Filter-drier check, evap airflow, TXV inspect</td></tr>
                    <tr><td className="py-1.5 text-amber-700 dark:text-amber-300">Low</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Low</td><td className="py-1.5">TXV stuck open OR sizing mismatch</td><td className="py-1.5 text-xs">TXV diagnosis, sensing bulb inspection</td></tr>
                  </tbody>
                </table>
              </div>
            </Panel>
            <DiagnosticMatrix />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The four-pattern matrix visualized in the SH × SC plane. Each quadrant
              corresponds to a different root cause family. The center region (8-15°F SH
              and 8-12°F SC for TXV residential) is the &quot;properly charged&quot; window.
              Source: ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022 Ch. 23.
            </p>
          </TechSection>
        </section>

        <section id="scenarios" className="mb-10">
          <TechSection icon="service" tone="amber" title="5. Worked service scenarios">
            <p>
              Five field scenarios showing how SH and SC together drive service decisions.
              Each maps measured readings to a diagnostic verdict and specific service action.
            </p>
          </TechSection>

          <ServiceProblem
            number={1}
            refrigerant="R-410A (TXV)"
            title="Properly-charged R-410A residential AC"
            scenario="3-ton R-410A TXV residential AC, 95°F outdoor, 75°F return air, 63°F indoor WB. System has been running 15 minutes at steady state."
          >
            <Panel title="Measured" icon={Gauge}>
              <Gauges
                items={[
                  { label: "Suction P", value: "130 PSIG", side: "low" },
                  { label: "Suction line", value: "60°F", side: "low" },
                  { label: "Discharge P", value: "380 PSIG", side: "high" },
                  { label: "Liquid line", value: "100°F", side: "high" },
                ]}
              />
            </Panel>
            <Panel title="Saturation lookup (R-410A)" icon={CalcIcon}>
              <Lookups
                rows={[
                  { input: "130 PSIG", output: "45°F sat", note: "evap saturation" },
                  { input: "380 PSIG", output: "111°F sat", note: "cond saturation" },
                ]}
              />
            </Panel>
            <Panel title="Derived" icon={Activity}>
              <Derived
                rows={[
                  { formula: "Superheat = 60°F − 45°F = 15°F", verdict: "ok", note: "in 8-15°F TXV target" },
                  { formula: "Subcooling = 111°F − 100°F = 11°F", verdict: "ok", note: "in 8-12°F TXV target" },
                ]}
              />
            </Panel>
            <VerdictBanner status="ok" title="Properly charged — no service action">
              Both SH and SC inside target ranges; system is operating correctly. Document
              baseline values for future comparison and sign off.
            </VerdictBanner>
          </ServiceProblem>

          <ServiceProblem
            number={2}
            refrigerant="R-410A (TXV)"
            title="Undercharge fingerprint — high SH + low SC"
            scenario="Same R-410A TXV system, six months later. Customer reports weak cooling on a 95°F day. You take readings to confirm what's going on."
          >
            <Panel title="Measured" icon={Gauge}>
              <Gauges
                items={[
                  { label: "Suction P", value: "100 PSIG", side: "low" },
                  { label: "Suction line", value: "70°F", side: "low" },
                  { label: "Discharge P", value: "320 PSIG", side: "high" },
                  { label: "Liquid line", value: "108°F", side: "high" },
                ]}
              />
            </Panel>
            <Panel title="Derived" icon={Activity}>
              <Derived
                rows={[
                  { formula: "Superheat = 70°F − 31°F = 39°F", verdict: "bad", note: "very high (target 8-15°F)" },
                  { formula: "Subcooling = 99°F − 108°F = −9°F", verdict: "bad", note: "negative — flash gas" },
                ]}
              />
            </Panel>
            <VerdictBanner status="bad" title="Undercharge — leak somewhere in the system">
              High SH + negative SC is the textbook undercharge fingerprint. Refrigerant has
              leaked out since commissioning. Both pressures depressed below normal for
              ambient.
            </VerdictBanner>
            <FixCallout>
              Find and repair the leak per EPA Section 608, then evacuate to 500 microns and
              charge by weight to nameplate. Don&apos;t add refrigerant without leak repair.
            </FixCallout>
          </ServiceProblem>

          <ServiceProblem
            number={3}
            refrigerant="R-410A (TXV)"
            title="Overcharge fingerprint — low SH + high SC"
            scenario="R-410A TXV system after a service add by a previous tech. The compressor is running noticeably louder and the customer's electric bill is up."
          >
            <Panel title="Measured" icon={Gauge}>
              <Gauges
                items={[
                  { label: "Suction P", value: "160 PSIG", side: "low" },
                  { label: "Suction line", value: "55°F", side: "low" },
                  { label: "Discharge P", value: "480 PSIG", side: "high" },
                  { label: "Liquid line", value: "90°F", side: "high" },
                ]}
              />
            </Panel>
            <Panel title="Derived" icon={Activity}>
              <Derived
                rows={[
                  { formula: "Superheat = 55°F − 55°F = 0°F", verdict: "bad", note: "zero — slugging risk" },
                  { formula: "Subcooling = 130°F − 90°F = 40°F", verdict: "bad", note: "very high — overcharge" },
                ]}
              />
            </Panel>
            <VerdictBanner status="bad" title="Overcharge — liquid is reaching the compressor">
              Zero SH + 40°F SC is the classic overcharge fingerprint. Excess refrigerant
              backs up in the condenser (high SC) and saturated liquid reaches the compressor
              (zero SH); the noise is hydraulic events from incompressible liquid.
            </VerdictBanner>
            <FixCallout>
              Recover refrigerant in 1 oz increments using a recovery / charging scale.
              Re-test SH and SC after each. Stop when SH = 8-15°F and SC = 8-12°F. If SH
              stays low after recovery, suspect TXV stuck open.
            </FixCallout>
          </ServiceProblem>

          <ServiceProblem
            number={4}
            refrigerant="R-410A (TXV)"
            title="Restriction — high SH + high SC"
            scenario="R-410A TXV system. Customer reports the AC isn't cooling as well as last summer. SH is high but SC is also high — not the typical undercharge pattern."
          >
            <Panel title="Measured" icon={Gauge}>
              <Gauges
                items={[
                  { label: "Suction P", value: "100 PSIG", side: "low" },
                  { label: "Suction line", value: "75°F", side: "low" },
                  { label: "Discharge P", value: "400 PSIG", side: "high" },
                  { label: "Liquid line", value: "98°F", side: "high" },
                ]}
              />
            </Panel>
            <Panel title="Derived" icon={Activity}>
              <Derived
                rows={[
                  { formula: "Superheat = 75°F − 31°F = 44°F", verdict: "bad", note: "very high" },
                  { formula: "Subcooling = 115°F − 98°F = 17°F", verdict: "warn", note: "high — refrigerant trapped" },
                ]}
              />
            </Panel>
            <VerdictBanner status="warn" title="Liquid-line restriction">
              High SH + high SC = restriction in the liquid line (clogged filter-drier, TXV
              stuck partly closed, kinked line). Refrigerant is in the system (high SC proves
              the condenser is filling) but can&apos;t reach the evaporator (high SH from
              evap starvation).
            </VerdictBanner>
            <FixCallout>
              Check filter-drier outlet temperature — significant drop across the drier
              (e.g., 10°F colder than inlet) confirms restriction. Replace drier. If symptoms
              persist, inspect TXV operation and check line set for kinks. Don&apos;t add
              refrigerant — it won&apos;t fix a restriction.
            </FixCallout>
          </ServiceProblem>

          <ServiceProblem
            number={5}
            refrigerant="R-454C (LT walk-in)"
            title="R-454C low-temp walk-in — dew curve for SH, bubble for SC"
            scenario="R-454C low-temp walk-in freezer (-20°F evap target, 95°F ambient). R-454C is zeotropic with ~14°F glide — curve selection critical."
          >
            <Panel title="Measured" icon={Gauge}>
              <Gauges
                items={[
                  { label: "Suction P", value: "7 PSIG", side: "low" },
                  { label: "Suction line", value: "5°F", side: "low" },
                  { label: "Discharge P", value: "200 PSIG", side: "high" },
                  { label: "Liquid line", value: "82°F", side: "high" },
                ]}
              />
            </Panel>
            <Panel title="Saturation lookup (R-454C zeotropic)" icon={CalcIcon}>
              <Lookups
                rows={[
                  { input: "7 PSIG dew", output: "−20°F", note: "USE for SH" },
                  { input: "7 PSIG bubble", output: "−34°F", note: "wrong for SH" },
                  { input: "200 PSIG bubble", output: "88°F", note: "USE for SC" },
                  { input: "200 PSIG dew", output: "74°F", note: "wrong for SC" },
                ]}
              />
            </Panel>
            <Panel title="Derived (correct curves)" icon={Activity}>
              <Derived
                rows={[
                  { formula: "SH (dew) = 5°F − (−20°F) = 25°F", verdict: "warn", note: "high end LT range 8-15°F" },
                  { formula: "SC (bubble) = 88°F − 82°F = 6°F", verdict: "ok", note: "in 5-15°F LT range" },
                ]}
              />
            </Panel>
            <VerdictBanner status="warn" title="Slightly elevated SH — investigate TXV / charge">
              Correctly calculated using dew for SH and bubble for SC. SH is high end of the
              target range; SC is fine. Likely TXV slightly over-throttling, or slight
              undercharge. Wrong-curve calculation would have shown SH = 39°F (false alarm)
              and SC = −8°F (false alarm).
            </VerdictBanner>
            <FixCallout>
              For zeotropic blends always verify curve selection in PT chart software. The
              dew curve at suction pressure for superheat; bubble curve at discharge pressure
              for subcooling. The site&apos;s calculators handle this automatically.
            </FixCallout>
          </ServiceProblem>
        </section>

        <section id="pitfalls" className="mb-10">
          <TechSection icon="warning" tone="amber" title="6. Common pitfalls">
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>
                <strong>Probing without insulation.</strong> Ambient air at the probe location
                pulls the reading toward room temperature — inflates apparent SH, depresses
                apparent SC. Always insulate the probe.
              </li>
              <li>
                <strong>Measuring before stabilization.</strong> Pressures and temperatures swing
                during startup and load changes. Wait 10-20 minutes under stable load before
                recording values.
              </li>
              <li>
                <strong>Wrong saturation curve on zeotropic blend.</strong> Using a single bubble
                or dew curve for both SH and SC on R-407C / R-454C / R-455A introduces an error
                equal to the glide (11-22°F) — enough to invalidate charging decisions.
              </li>
              <li>
                <strong>Assuming charge is the answer.</strong> Airflow, metering device
                condition, condenser cleanliness, indoor coil cleanliness, and load can all
                cause SH/SC to read off-target. Verify those before adjusting charge.
              </li>
              <li>
                <strong>Reading the wrong port.</strong> Suction is the LOW-side port on the
                larger insulated line. Discharge is the HIGH-side port on the smaller
                uninsulated line. Reversed connections invert the diagnosis entirely.
              </li>
              <li>
                <strong>Adjusting charge on a TXV using superheat.</strong> TXV systems hold SH
                near the valve setpoint regardless of charge. Subcooling is the primary metric
                on TXV / EEV systems.
              </li>
              <li>
                <strong>Confusing total vs evaporator superheat.</strong> Total SH (at
                compressor inlet, what charging procedures use) is 2-5°F higher than evap SH
                (what TXV bulb senses). ACCA Manual T targets are total SH.
              </li>
            </ol>
          </TechSection>
        </section>

        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">7. FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                  {f.q}
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          <Link href="/superheat-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Superheat Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Suction PSIG + line °F → SH with diagnostic banner.</p>
          </Link>
          <Link href="/subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Subcooling Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Liquid PSIG + line °F → SC.</p>
          </Link>
          <Link href="/pt-superheat-subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Combined SH / SC / PT</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Both readings + eight-pattern diagnostic matrix.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ACCA Manual T (2017) — &quot;Air-Side and Refrigerant-Side Diagnostics&quot;, target SH ranges and charging procedures</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — Chapters 1, 23 (vapor-compression cycle, service procedures)</li>
            <li>ASHRAE Handbook of Fundamentals 2021 — vapor-compression cycle thermodynamics</li>
            <li>AHRI Standard 540-2020 — Positive Displacement Refrigerant Compressors, minimum return-gas SH</li>
            <li>EPA Section 608 (40 CFR Part 82 Subpart F) — refrigerant handling, leak repair requirements</li>
            <li>CoolProp 7.2.0 (Bell et al. 2014, doi:10.1021/ie4033999) — saturation property source for site calculators</li>
            <li>Equipment manufacturer service literature — Carrier, Trane, Lennox, Daikin, Goodman charging procedures</li>
          </ul>
        </footer>
      </article>
    </>
  );
}

/* ──────────────────────── Inline SVG diagrams ──────────────────────── */

function PtSaturationDiagram() {
  const W = 720;
  const H = 320;
  const PAD_L = 60;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 60;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Pressure-temperature diagram showing superheat above the saturation curve and subcooling below it, with labeled regions."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight={600} fill="currentColor">
        Superheat and subcooling on the PT diagram
      </text>
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <text x={PAD_L + PLOT_W / 2} y={H - 24} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">
        Temperature →
      </text>
      <text x={20} y={PAD_T + PLOT_H / 2} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor" transform={`rotate(-90 20 ${PAD_T + PLOT_H / 2})`}>
        Pressure →
      </text>
      {/* saturation curve */}
      <path
        d={`M ${PAD_L + 60} ${PAD_T + PLOT_H - 20} Q ${PAD_L + 250} ${PAD_T + PLOT_H - 100} ${PAD_L + 460} ${PAD_T + 30}`}
        fill="none"
        stroke="#8e4dd1"
        strokeWidth={2.5}
      />
      {/* liquid region */}
      <text x={PAD_L + 130} y={PAD_T + 80} textAnchor="middle" fontSize="11" fontWeight={500} fill="#3a8ed1">
        LIQUID
      </text>
      <text x={PAD_L + 130} y={PAD_T + 94} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        (above saturation curve)
      </text>
      {/* vapor region */}
      <text x={PAD_L + 420} y={PAD_T + PLOT_H - 50} textAnchor="middle" fontSize="11" fontWeight={500} fill="#5a8a3a">
        VAPOR
      </text>
      <text x={PAD_L + 420} y={PAD_T + PLOT_H - 36} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        (below saturation curve)
      </text>
      {/* saturation point at suction side (~ left/middle) */}
      <circle cx={PAD_L + 200} cy={PAD_T + PLOT_H - 80} r={4} fill="#3a8ed1" />
      <text x={PAD_L + 210} y={PAD_T + PLOT_H - 76} fontSize="10" fontWeight={600} fill="#3a8ed1">
        suction sat
      </text>
      {/* actual suction line temp (offset right = superheated) */}
      <circle cx={PAD_L + 260} cy={PAD_T + PLOT_H - 80} r={4} fill="#5a8a3a" />
      <line x1={PAD_L + 200} y1={PAD_T + PLOT_H - 80} x2={PAD_L + 260} y2={PAD_T + PLOT_H - 80} stroke="#5a8a3a" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={PAD_L + 230} y={PAD_T + PLOT_H - 60} textAnchor="middle" fontSize="10" fontWeight={600} fill="#5a8a3a">
        SUPERHEAT
      </text>
      {/* saturation point at liquid side (right of curve, higher P) */}
      <circle cx={PAD_L + 420} cy={PAD_T + 60} r={4} fill="#c45757" />
      <text x={PAD_L + 360} y={PAD_T + 64} fontSize="10" fontWeight={600} fill="#c45757">
        discharge sat
      </text>
      {/* actual liquid line temp (offset left = subcooled) */}
      <circle cx={PAD_L + 360} cy={PAD_T + 60} r={4} fill="#3a8ed1" />
      <line x1={PAD_L + 360} y1={PAD_T + 60} x2={PAD_L + 420} y2={PAD_T + 60} stroke="#3a8ed1" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={PAD_L + 390} y={PAD_T + 80} textAnchor="middle" fontSize="10" fontWeight={600} fill="#3a8ed1">
        SUBCOOLING
      </text>
    </svg>
  );
}

function TargetRangeBars() {
  const apps: { label: string; sh: [number, number]; sc: [number, number] | null }[] = [
    { label: "Residential TXV", sh: [8, 15], sc: [8, 12] },
    { label: "Residential FXO", sh: [5, 25], sc: null },
    { label: "Heat pump cooling", sh: [8, 15], sc: [8, 15] },
    { label: "Heat pump heating", sh: [10, 20], sc: [8, 15] },
    { label: "Walk-in MT", sh: [6, 12], sc: [5, 15] },
    { label: "Walk-in LT", sh: [8, 15], sc: [5, 15] },
    { label: "Chiller", sh: [2, 5], sc: [2, 5] },
    { label: "Mobile AC", sh: [5, 15], sc: [5, 10] },
  ];
  const W = 720;
  const ROW_H = 32;
  const PAD_T = 40;
  const PAD_B = 28;
  const LABEL_W = 140;
  const PAD_R = 50;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 30;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + apps.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Target SH (blue) and SC (purple) ranges by HVAC application."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Target SH (blue) and SC (purple) by application (°F)
      </text>
      {[0, 5, 10, 15, 20, 25, 30].map((t) => (
        <g key={`tick-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + apps.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      {apps.map((a, i) => {
        const y = PAD_T + i * ROW_H;
        return (
          <g key={a.label}>
            <text x={LABEL_W - 8} y={y + 18} textAnchor="end" fontSize="10" fontWeight={500} fill="currentColor">
              {a.label}
            </text>
            <rect x={xScale(a.sh[0])} y={y + 4} width={xScale(a.sh[1]) - xScale(a.sh[0])} height={10} fill="#3a8ed1" rx={2} />
            <text x={xScale(a.sh[1]) + 4} y={y + 12} fontSize="9" fontWeight={500} fill="#3a8ed1">SH</text>
            {a.sc ? (
              <>
                <rect x={xScale(a.sc[0])} y={y + 18} width={xScale(a.sc[1]) - xScale(a.sc[0])} height={10} fill="#8e4dd1" rx={2} />
                <text x={xScale(a.sc[1]) + 4} y={y + 26} fontSize="9" fontWeight={500} fill="#8e4dd1">SC</text>
              </>
            ) : (
              <text x={LABEL_W + 8} y={y + 26} fontSize="9" fill="currentColor" opacity={0.5} fontStyle="italic">
                SC informational on fixed-orifice
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DiagnosticMatrix() {
  const W = 600;
  const H = 380;
  const PAD_L = 70;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 60;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  const xScale = (v: number) => PAD_L + (v / 40) * PLOT_W;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v + 10) / 50) * PLOT_H;

  const patterns = [
    { label: "Properly charged", sh: 12, sc: 10, fill: "#5a8a3a" },
    { label: "Undercharge", sh: 35, sc: -5, fill: "#c45757" },
    { label: "Overcharge", sh: 2, sc: 30, fill: "#c45757" },
    { label: "Restriction", sh: 35, sc: 20, fill: "#d49a2b" },
    { label: "TXV stuck open", sh: 3, sc: 2, fill: "#d49a2b" },
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="SH × SC diagnostic pattern matrix with target zone and four common fault patterns marked."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        SH × SC diagnostic pattern matrix
      </text>
      <rect x={xScale(8)} y={yScale(12)} width={xScale(15) - xScale(8)} height={yScale(8) - yScale(12)} fill="#5a8a3a" opacity={0.15} stroke="#5a8a3a" strokeDasharray="4 2" strokeWidth={1.5} />
      <text x={xScale(11.5)} y={yScale(10) - 4} textAnchor="middle" fontSize="9" fill="#5a8a3a" fontWeight={600}>
        Target zone
      </text>
      {[0, 10, 20, 30, 40].map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T} x2={xScale(t)} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>{t}</text>
        </g>
      ))}
      {[-10, 0, 10, 20, 30, 40].map((t) => (
        <g key={`gy-${t}`}>
          <line x1={PAD_L} y1={yScale(t)} x2={PAD_L + PLOT_W} y2={yScale(t)} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={PAD_L - 8} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>{t}</text>
        </g>
      ))}
      <line x1={PAD_L} y1={yScale(0)} x2={PAD_L + PLOT_W} y2={yScale(0)} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <text x={PAD_L + PLOT_W / 2} y={H - 18} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">Superheat (°F)</text>
      <text x={14} y={PAD_T + PLOT_H / 2} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor" transform={`rotate(-90 14 ${PAD_T + PLOT_H / 2})`}>Subcooling (°F)</text>
      {patterns.map((p) => (
        <g key={p.label}>
          <circle cx={xScale(p.sh)} cy={yScale(p.sc)} r={10} fill={p.fill} opacity={0.7} stroke="white" strokeWidth={1.5} />
          <text x={xScale(p.sh)} y={yScale(p.sc) + 22} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.8}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
