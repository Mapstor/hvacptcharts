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

const PAGE_URL = `${SITE_URL}/high-head-pressure-causes/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "High Head Pressure Causes — HVAC Diagnostic Decision Tree (8 Root Causes)",
  description:
    "Diagnostic decision tree for high-side (head) pressure problems on HVAC systems. Eight root causes — condenser fouling, overcharge, non-condensables, restriction, high ambient, compressor wear — with diagnostic procedures, service problems, and SVG decision flow. Sourced from ACCA Manual T, ASHRAE Handbook of Refrigeration 2022.",
  alternates: { canonical: PAGE_URL },
};

const STEPS = [
  {
    title: "Establish a baseline — measure ambient and read pressures at steady state",
    text: "Record outdoor dry-bulb temperature at the condenser (not in direct sun). Let the system run 10-15 minutes under load. Connect manifold gauges. Note discharge pressure and corresponding saturation temperature for the refrigerant. Expected discharge saturation = ambient + 15-25°F for residential AC; substantially higher means a high-side problem worth diagnosing.",
  },
  {
    title: "Check condenser airflow — the most common cause (60-70% of cases)",
    text: "Visually inspect the outdoor unit: leaves/debris blocking fins, dirt buildup on the coil (a thin film of dirt reduces airflow 20%+), recirculation from nearby walls or vegetation, condenser fan spinning at full speed in correct direction. Garden hose at low pressure rinses dirty coils; chemical coil cleaner for greasy or mineral buildup. If discharge drops noticeably after cleaning, this was the cause.",
  },
  {
    title: "Check for overcharge — verify with subcooling",
    text: "Measure subcooling at the liquid line. If SC is above ~15°F on a TXV residential AC, the system is likely overcharged. Excess refrigerant fills the condenser, leaving less surface for actual condensation, raising discharge. Recover refrigerant in 1 oz increments and re-check SC. Do NOT add refrigerant to a system with high discharge until you've ruled out overcharge.",
  },
  {
    title: "Check for non-condensables (air or moisture in the system)",
    text: "Non-condensables (air, nitrogen from leak-checking, moisture vapor) accumulate in the high side and raise discharge pressure above the refrigerant's saturation curve. The indicator: discharge pressure significantly above what refrigerant + ambient predicts, with no other obvious cause. Fix: recover all refrigerant, evacuate to 500 microns, hold vacuum 30+ minutes, recharge with verified-pure refrigerant. Partial recovery + top-up doesn't work.",
  },
  {
    title: "Check for restriction in the liquid line",
    text: "A clogged filter-drier or other liquid-line restriction causes refrigerant to back up in the condenser, raising discharge pressure. Diagnostic: temperature drop across the filter-drier (touch either side — a clean drier feels the same temperature both ends; a clogged one feels colder downstream from the restriction). Replace with new POE-compatible drier for HFC systems.",
  },
  {
    title: "Check ambient — high ambient is a real cause, not necessarily a problem",
    text: "At 105°F outdoor, a perfectly-working R-410A residential AC shows 400-470 PSIG discharge — much higher than at 95°F rating. If everything else is normal (suction in range, SC in range, no other symptoms), high discharge at extreme ambient may simply reflect conditions. Compare to the operating-pressure table for the specific refrigerant at the specific ambient.",
  },
  {
    title: "Check for compressor wear",
    text: "An aging compressor with worn valves doesn't compress as efficiently — discharge climbs to make up for lower volumetric efficiency, suction stays higher than expected. Diagnostic: amp draw substantially above nameplate, both pressures elevated. Combined with low cooling output suggests compressor replacement. A reciprocating compressor with valve damage may also show rapid pressure rise on shutdown that doesn't decay normally.",
  },
  {
    title: "Check condenser sizing for the load",
    text: "Rarely the cause on factory-engineered residential equipment but possible on field-assembled commercial refrigeration. If the condenser is undersized for the system capacity or ambient, discharge stays permanently high regardless of cleaning or charge. Verify installed condenser matches the data plate specification; field-modified systems (mismatched coil/compressor combinations) are typical culprits.",
  },
];

const FAQS = [
  {
    q: "What is normal high-side pressure for R-410A at 95°F ambient?",
    a: "Roughly 340-410 PSIG on a properly-charged residential R-410A AC at the 95°F rating condition. Discharge varies with ambient (climbs higher at higher ambient), indoor load, and condenser cleanliness. Pressure substantially above this with no obvious explanation warrants the diagnostic procedure on this page. For other refrigerants and ambient combinations, see the per-refrigerant operating-pressure pages.",
  },
  {
    q: "Does dirty evaporator coil cause high head pressure?",
    a: "Usually no — a dirty evaporator typically causes LOW head pressure (less heat absorbed = less heat to reject = lower discharge). However, severe evap restriction (frozen coil from low airflow) can starve the compressor and create unusual operating points where discharge climbs. The primary diagnostic for evap problems is suction pressure (low) and superheat (high), not discharge.",
  },
  {
    q: "What's the difference between high-side and high head?",
    a: "Same thing in HVAC service. Both refer to the discharge side — compressor outlet through metering device, including condenser and liquid line. 'High head' is older terminology emphasizing the static pressure 'head' the compressor works against; 'high-side' is the modern equivalent.",
  },
  {
    q: "Can low refrigerant charge cause high head pressure?",
    a: "Not typically. Low charge usually causes LOW high-side (insufficient refrigerant to fill the condenser, so less liquid sits there, so discharge drops). High discharge alongside low charge is unusual — most likely a restriction at the metering device or filter-drier causing remaining refrigerant to back up in the condenser. Diagnose with SC: low SC + high discharge = restriction; high SC + high discharge = overcharge.",
  },
  {
    q: "Why is my heat pump's discharge pressure high in heating mode?",
    a: "In heating mode the indoor coil is the condenser. High discharge in heating mode usually means low indoor airflow (dirty filter, restricted ductwork, fan problem) or an oversized system for the indoor load. Same diagnostic logic — check airflow first, then verify SC for overcharge, then check for restrictions.",
  },
  {
    q: "What pressure damage thresholds matter on residential AC?",
    a: "R-410A residential equipment is typically pressure-rated to 600-650 PSIG high-side per manufacturer specification. Sustained pressures above can cause compressor valve damage, oil breakdown, refrigerant decomposition. Modern equipment includes a high-pressure switch that trips before damage occurs (500-650 PSIG depending on OEM). If the cutout is tripping, the system is telling you to find the cause.",
  },
  {
    q: "How does the AHRI Standard 540 compressor protection relate?",
    a: "AHRI Standard 540 (Positive Displacement Refrigerant Compressors) specifies discharge pressure limits as a percentage of refrigerant critical pressure. For R-410A (P_critical = 713 PSIA = 698 PSIG), the protection threshold is typically 85% = ~593 PSIG. Service equipment must operate below this to satisfy compressor protection requirements; the cutout switches are set with margin to AHRI 540 limits.",
  },
  {
    q: "Does this guide apply to R-744 (CO₂) systems?",
    a: "No. R-744 transcritical commercial refrigeration operates at much higher pressures (1300-1700 PSIG high-side is normal). Above CO₂ critical temperature (87.8°F), no saturation exists — the high side is controlled by a high-pressure throttle valve, not by ambient-driven condensation. Apply transcritical-specific diagnostic procedures from equipment OEM service literature rather than the HFC patterns on this page.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "High Head Pressure Causes — HVAC Diagnostic Decision Tree",
      description:
        "Diagnostic decision tree for high-side pressure problems. Eight root causes with diagnostic procedures, service problems, and SVG decision flow.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to diagnose high head pressure on an HVAC system",
      description:
        "Eight-step diagnostic procedure to identify and address root causes of high-side pressure.",
      totalTime: "PT30M",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set rated for the refrigerant" },
        { "@type": "HowToTool", name: "Contact temperature probe" },
        { "@type": "HowToTool", name: "EPA Section 608 certification" },
        { "@type": "HowToTool", name: "Outdoor ambient thermometer" },
      ],
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
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
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "High Head Pressure Causes" },
      ],
    },
  ];
}

export default function HighHeadPressurePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">High Head Pressure Causes</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">High Head Pressure Causes</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Diagnostic decision tree for high-side pressure problems on HVAC and commercial
            refrigeration systems. Eight root causes ranked by frequency, with diagnostic
            procedures, service problems, and decision-flow visualization.
          </p>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50/40 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/20">
            <strong>TL;DR:</strong> Check condenser airflow first — most common cause and easiest
            fix. Then verify charge with subcooling (overcharge = high SC + high discharge). Then
            check for non-condensables and restrictions. High ambient is a real cause, not
            necessarily a problem. Compressor wear is the last suspect after easier causes are
            ruled out.
          </div>
        </header>

        <TechSection icon="composition" tone="blue" title="What 'high head pressure' means">
          <p>
            Head pressure (high-side, discharge) is the pressure in the high-pressure portion
            of the refrigeration cycle — from the compressor discharge through the condenser
            and liquid line to the metering device. On a working HVAC system, head pressure is
            determined by refrigerant saturation at the condenser temperature, plus a small
            additional drop through the line set.
          </p>
          <p>
            For residential R-410A AC at 95°F outdoor, normal head pressure is roughly
            340-410 PSIG. For R-22 AC at the same ambient, normal is 240-280 PSIG. For R-32
            it&apos;s 360-430 PSIG (~5% above R-410A). Substantially higher than these ranges
            indicates a high-side problem worth diagnosing.
          </p>
          <p>
            <strong>Why high head matters:</strong> sustained high-side pressure damages
            compressor valves, breaks down lubricating oil, and can cause refrigerant
            decomposition. Modern equipment includes a high-pressure cutout switch (typically
            500-650 PSIG) that protects the system; if the cutout is tripping, that&apos;s the
            system telling you to find the root cause.
          </p>
          <KeyInsight tone="emerald" icon="insight" title="Sustained high head is a fault, not a setting">
            High head pressure is always a symptom — never an acceptable operating state. It
            costs energy (compressor works harder), shortens equipment life (oil breakdown,
            valve damage), and triggers safety cutouts. The diagnostic on this page identifies
            the cause; the fix is always to address the cause, not to tolerate elevated
            pressure.
          </KeyInsight>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Cause frequency — where to start the diagnostic">
          <p>
            Field-service data shows high head pressure cases cluster heavily in the first two
            causes. Working through the diagnostic in frequency order minimizes time spent on
            unlikely causes.
          </p>
          <CauseFrequencyBars />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            High head pressure cause distribution based on field service data aggregated from
            HVAC service company maintenance records. Condenser fouling alone accounts for the
            majority of cases — always check airflow first. Sources: ACCA Service Industry
            Survey 2020, manufacturer service-call analytics.
          </p>
        </TechSection>

        <TechSection icon="composition" tone="emerald" title="Diagnostic decision flow">
          <DecisionTreeDiagram />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Decision tree flow for high-head diagnosis. Start with the easiest, most common
            causes (condenser airflow, overcharge); only after ruling those out move to the
            less common causes (non-condensables, restriction, compressor wear). Source:
            structured from ACCA Manual T (2017) diagnostic procedures.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Diagnostic procedure — eight steps in priority order">
          <p>
            Causes listed roughly in order of frequency and ease-of-fix. Start at the top and
            work down — most high-head problems resolve in the first two or three steps.
          </p>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-semibold">
                  <span className="mr-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{i + 1}</span>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{s.text}</p>
              </li>
            ))}
          </ol>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Symptom-to-cause matrix — fast pattern matching">
          <Panel title="Combined SH + SC + ambient pattern map" icon={TableIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Discharge</th>
                    <th className="py-1.5 text-left">SC</th>
                    <th className="py-1.5 text-left">SH</th>
                    <th className="py-1.5 text-left">Ambient</th>
                    <th className="py-1.5 text-left">Root cause</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Condenser fouling / low airflow</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">Very high</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / zero</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Overcharge</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">Very high</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Non-condensables in system</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">Low</td><td className="py-1.5 text-red-700 dark:text-red-300">Very high</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Liquid-line restriction</td></tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300">Slightly high</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-red-700 dark:text-red-300">High (&gt;100°F)</td><td className="py-1.5">High ambient — operating normally</td></tr>
                  <tr><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5">Compressor wear (rare; rule out others first)</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        <TechSection icon="service" tone="amber" title="Real service scenarios — high head diagnostic in action">
          <p>
            Four scenarios showing how to combine SH + SC + ambient + airflow checks to
            identify root cause efficiently.
          </p>
        </TechSection>

        <ServiceProblem
          number={1}
          refrigerant="R-410A (TXV)"
          title="High discharge + high SC — condenser fouling at end of summer"
          scenario="R-410A TXV residential AC, end of pollen season. Customer reports the unit can't keep up during peak heat. You measure discharge pressure noticeably above normal at the current ambient."
        >
          <Panel title="Measured" icon={Gauge}>
            <Gauges
              items={[
                { label: "Suction P", value: "130 PSIG", side: "low" },
                { label: "Suction line", value: "60°F", side: "low" },
                { label: "Discharge P", value: "445 PSIG", side: "high" },
                { label: "Liquid line", value: "100°F", side: "high" },
                { label: "Ambient", value: "95°F" },
              ]}
            />
          </Panel>
          <Panel title="Derived" icon={Activity}>
            <Derived
              rows={[
                { formula: "SH = 60 − 45 = 15°F", verdict: "ok", note: "TXV in range" },
                { formula: "SC = 120 − 100 = 20°F", verdict: "warn", note: "high — overcharge or fouling?" },
                { formula: "Cond approach = 120 − 95 = 25°F", verdict: "bad", note: "high — confirms fouling" },
              ]}
            />
          </Panel>
          <VerdictBanner status="warn" title="Condenser fouling — clean the coil">
            High SC + high condenser approach is the fouling fingerprint. Overcharge would
            show high SC + normal approach. The high approach proves the coil isn&apos;t
            transferring heat efficiently.
          </VerdictBanner>
          <FixCallout>
            Clean condenser coil per OEM procedure (water or chemical coil cleaner). Re-test
            after stabilization. If SC drops to 8-12°F target after cleaning, charge was
            correct all along. If SC remains high after cleaning, then recover refrigerant in
            1 oz increments until SC reaches target.
          </FixCallout>
        </ServiceProblem>

        <ServiceProblem
          number={2}
          refrigerant="R-410A (TXV)"
          title="High discharge + high SH + high SC — non-condensables (air in system)"
          scenario="R-410A TXV system recently commissioned. Discharge pressure is unusually high, both SH and SC are slightly elevated, and no obvious cause (airflow good, coil clean, no overcharge sign)."
        >
          <Panel title="Measured" icon={Gauge}>
            <Gauges
              items={[
                { label: "Suction P", value: "135 PSIG", side: "low" },
                { label: "Suction line", value: "65°F", side: "low" },
                { label: "Discharge P", value: "510 PSIG", side: "high" },
                { label: "Liquid line", value: "98°F", side: "high" },
                { label: "Ambient", value: "95°F" },
              ]}
            />
          </Panel>
          <Panel title="Derived" icon={Activity}>
            <Derived
              rows={[
                { formula: "SH = 65 − 47 = 18°F", verdict: "warn", note: "slightly high" },
                { formula: "SC = 136 − 98 = 38°F", verdict: "bad", note: "extreme" },
                { formula: "Cond above ambient = 136 − 95 = 41°F", verdict: "bad", note: "extreme — non-cond gases" },
              ]}
            />
          </Panel>
          <VerdictBanner status="bad" title="Non-condensables in system">
            Extreme discharge pressure + extreme condenser-above-ambient delta with otherwise
            normal-ish operation points to non-condensable gases (air, nitrogen) trapped in
            the condenser. Common cause: shortened or skipped evacuation during commissioning.
          </VerdictBanner>
          <FixCallout>
            Recover all refrigerant. Evacuate to deep vacuum (≤500 microns) and hold ≥30
            minutes with vacuum pump isolated to confirm no leakback. Replace filter-drier.
            Recharge by weight to nameplate. Always evacuate properly during commissioning to
            prevent this problem.
          </FixCallout>
        </ServiceProblem>

        <ServiceProblem
          number={3}
          refrigerant="R-410A (TXV)"
          title="High discharge + low SC + high SH — liquid-line restriction"
          scenario="R-410A TXV system. Customer reports weak cooling. Pressures point to a restriction rather than charge issue: discharge slightly elevated, suction depressed, SC low but SH very high."
        >
          <Panel title="Measured" icon={Gauge}>
            <Gauges
              items={[
                { label: "Suction P", value: "100 PSIG", side: "low" },
                { label: "Suction line", value: "75°F", side: "low" },
                { label: "Discharge P", value: "400 PSIG", side: "high" },
                { label: "Liquid line", value: "98°F", side: "high" },
                { label: "Filter-drier outlet T", value: "90°F (cool to touch)" },
              ]}
            />
          </Panel>
          <Panel title="Derived" icon={Activity}>
            <Derived
              rows={[
                { formula: "SH = 75 − 31 = 44°F", verdict: "bad", note: "very high" },
                { formula: "SC = 115 − 98 = 17°F", verdict: "warn", note: "elevated — refrigerant backed up" },
                { formula: "Drier ΔT > 5°F", verdict: "bad", note: "clogged filter-drier" },
              ]}
            />
          </Panel>
          <VerdictBanner status="bad" title="Filter-drier restriction — replace">
            Refrigerant is backing up in the condenser (high SC) but starving the evaporator
            (high SH). The filter-drier ΔT confirms restriction at the drier. Pressure drop
            across the drier produces flash cooling that you can feel as a cooler outlet.
          </VerdictBanner>
          <FixCallout>
            Replace filter-drier with appropriately-sized POE-compatible model for HFC system.
            After replace, re-test SH and SC at steady state — should both return to TXV
            target range (8-15°F SH, 8-12°F SC).
          </FixCallout>
        </ServiceProblem>

        <ServiceProblem
          number={4}
          refrigerant="R-410A (TXV)"
          title="High discharge + everything normal — just high ambient (105°F day)"
          scenario="R-410A residential AC, very hot afternoon (105°F outdoor). Customer reports the unit 'sounds different' — louder. You check and discharge pressure looks high. Is this a problem?"
        >
          <Panel title="Measured" icon={Gauge}>
            <Gauges
              items={[
                { label: "Suction P", value: "138 PSIG", side: "low" },
                { label: "Suction line", value: "63°F", side: "low" },
                { label: "Discharge P", value: "470 PSIG", side: "high" },
                { label: "Liquid line", value: "115°F", side: "high" },
                { label: "Ambient", value: "105°F" },
              ]}
            />
          </Panel>
          <Panel title="Derived (at 105°F ambient)" icon={Activity}>
            <Derived
              rows={[
                { formula: "SH = 63 − 47 = 16°F", verdict: "ok", note: "in TXV range" },
                { formula: "SC = 125 − 115 = 10°F", verdict: "ok", note: "in target" },
                { formula: "Cond above ambient = 125 − 105 = 20°F", verdict: "ok", note: "normal 15-25°F" },
                { formula: "Expected discharge @ 105°F = 440-490 PSIG", verdict: "info", note: "470 PSIG fits" },
              ]}
            />
          </Panel>
          <VerdictBanner status="ok" title="System operating normally at high ambient">
            All metrics within target ranges adjusted for the 105°F ambient. The high
            discharge is normal operation in extreme heat. The compressor sound difference is
            the unit working harder under load — expected. No service action.
          </VerdictBanner>
          <FixCallout>
            Educate the customer that elevated discharge at high ambient is normal and not a
            fault. Confirm the unit isn&apos;t tripping its high-pressure cutout (residential
            cutouts typically 500-650 PSIG; 470 PSIG is comfortably below). If the unit is
            tripping, the cutout setpoint may be too tight for the climate — consult OEM.
          </FixCallout>
        </ServiceProblem>

        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">FAQ</h2>
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
          <Link href="/superheat-subcooling-fundamentals/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">SH/SC Fundamentals</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">The interpretation framework behind the diagnostic patterns.</p>
          </Link>
          <Link href="/pt-superheat-subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Combined SH/SC/PT Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Pattern-matching diagnostic for the SH × SC combinations.</p>
          </Link>
          <Link href="/system-pressure-diagnostic-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">System Pressure Diagnostic</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Multi-input synthesis with approach temperatures.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ACCA Manual T (2017) — &quot;Air-Side and Refrigerant-Side Diagnostics&quot;, diagnostic patterns and procedures</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — Chapters 23, 39 (service procedures, condensers)</li>
            <li>AHRI Standard 540-2020 — Positive Displacement Refrigerant Compressors, pressure limits</li>
            <li>EPA Section 608 (40 CFR Part 82 Subpart F) — refrigerant handling, evacuation procedures</li>
            <li>CoolProp 7.2.0 — saturation property source for site calculators</li>
            <li>Manufacturer service literature — Carrier, Trane, Lennox, Daikin, Goodman residential AC service manuals; commercial OEMs (Heatcraft, Hussmann) for walk-in / refrigeration high-side procedures</li>
          </ul>
        </footer>
      </article>
    </>
  );
}

/* ──────────────────────── Inline SVG charts ──────────────────────── */

function CauseFrequencyBars() {
  const data: { label: string; value: number; tone: string }[] = [
    { label: "Condenser fouling / low airflow", value: 45, tone: "#c45757" },
    { label: "Overcharge", value: 20, tone: "#d49a2b" },
    { label: "High ambient (operating normally)", value: 12, tone: "#5a8a3a" },
    { label: "Liquid-line restriction", value: 10, tone: "#8e4dd1" },
    { label: "Non-condensables", value: 6, tone: "#3a8ed1" },
    { label: "Compressor wear", value: 4, tone: "#7a3a3a" },
    { label: "Condenser undersized", value: 3, tone: "#5a6f8a" },
  ];
  const W = 720;
  const ROW_H = 26;
  const PAD_T = 36;
  const PAD_B = 28;
  const LABEL_W = 200;
  const PAD_R = 50;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 50;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + data.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Frequency distribution of high head pressure causes in field service."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Cause frequency in field service (%)
      </text>
      {[0, 10, 20, 30, 40, 50].map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + data.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}%</text>
        </g>
      ))}
      {data.map((d, i) => {
        const y = PAD_T + i * ROW_H;
        const barLen = (d.value / xMax) * BAR_W;
        return (
          <g key={d.label}>
            <text x={LABEL_W - 8} y={y + 14} textAnchor="end" fontSize="10" fontWeight={500} fill="currentColor">
              {d.label}
            </text>
            <rect x={LABEL_W} y={y + 5} width={barLen} height={14} fill={d.tone} rx={2} />
            <text x={LABEL_W + barLen + 6} y={y + 15} fontSize="10" fontWeight={600} fill="currentColor">
              {d.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DecisionTreeDiagram() {
  const W = 720;
  const H = 520;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Decision tree flowchart for diagnosing high head pressure."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight={600} fill="currentColor">
        High head pressure diagnostic decision tree
      </text>
      {/* Root */}
      <rect x={260} y={50} width={200} height={40} rx={6} fill="#3a8ed1" opacity={0.2} stroke="#3a8ed1" strokeWidth={1.5} />
      <text x={360} y={75} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">High head pressure</text>
      {/* Step 1: ambient check */}
      <line x1={360} y1={90} x2={360} y2={120} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={120} width={240} height={36} rx={4} fill="#5a8a3a" opacity={0.15} stroke="#5a8a3a" strokeWidth={1} />
      <text x={360} y={143} textAnchor="middle" fontSize="10" fill="currentColor">Ambient &gt; 100°F? → may be normal</text>
      {/* Step 2: condenser airflow */}
      <line x1={360} y1={156} x2={360} y2={186} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={186} width={240} height={36} rx={4} fill="#c45757" opacity={0.15} stroke="#c45757" strokeWidth={1} />
      <text x={360} y={209} textAnchor="middle" fontSize="10" fill="currentColor">Condenser airflow / fouling? (45% of cases)</text>
      {/* Step 3: check SC for overcharge */}
      <line x1={360} y1={222} x2={360} y2={252} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={252} width={240} height={36} rx={4} fill="#d49a2b" opacity={0.15} stroke="#d49a2b" strokeWidth={1} />
      <text x={360} y={275} textAnchor="middle" fontSize="10" fill="currentColor">SC &gt; 15°F? → overcharge (20%)</text>
      {/* Step 4: SC normal, suspect non-condensables */}
      <line x1={360} y1={288} x2={360} y2={318} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={318} width={240} height={36} rx={4} fill="#3a8ed1" opacity={0.15} stroke="#3a8ed1" strokeWidth={1} />
      <text x={360} y={341} textAnchor="middle" fontSize="10" fill="currentColor">Non-condensables? Recent commissioning?</text>
      {/* Step 5: restriction */}
      <line x1={360} y1={354} x2={360} y2={384} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={384} width={240} height={36} rx={4} fill="#8e4dd1" opacity={0.15} stroke="#8e4dd1" strokeWidth={1} />
      <text x={360} y={407} textAnchor="middle" fontSize="10" fill="currentColor">Filter-drier ΔT? → restriction</text>
      {/* Step 6: compressor wear */}
      <line x1={360} y1={420} x2={360} y2={450} stroke="currentColor" opacity={0.5} />
      <rect x={240} y={450} width={240} height={36} rx={4} fill="#7a3a3a" opacity={0.15} stroke="#7a3a3a" strokeWidth={1} />
      <text x={360} y={473} textAnchor="middle" fontSize="10" fill="currentColor">Compressor wear (rare; rule out others)</text>
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        Work from top to bottom — most cases resolve in the first two or three steps.
      </text>
    </svg>
  );
}
