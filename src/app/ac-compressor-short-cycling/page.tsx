import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/ac-compressor-short-cycling/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/ac-compressor-short-cycling/page.tsx");

const R410A_120F = fmtPsigBubble("r-410a", 120);
const R410A_130F = fmtPsigBubble("r-410a", 130);
const R134A_130F = fmtPsigBubble("r-134a", 130);
const R1234YF_130F = fmtPsigBubble("r-1234yf", 130);

export const metadata: Metadata = pageMetadata({
  title: "AC Compressor Short Cycling: Causes & Fixes (Home + Car)",
  description:
    "AC compressor short cycling causes: overcharge, low charge, dirty filter, high-pressure trip. Residential + automotive with diagnostic steps and fixes.",
  path: "/ac-compressor-short-cycling/",
});

const BRANCHES = [
  {
    title: "High-pressure switch tripping (residential and automotive)",
    signature: `Compressor runs 30 seconds to 2 minutes, then stops. Discharge pressure spikes to the OEM high-pressure cutout (varies by manufacturer; see equipment nameplate) just before shutoff. Restart occurs after 3–5 minutes when pressure decays.`,
    body: `The high-pressure switch trips to protect the compressor from over-pressure. Causes: dirty or blocked condenser coil, condenser fan failure, overcharge, non-condensables. Fix: diagnose why discharge is elevated. At 120°F condenser saturation, R-410A discharge sat = ${R410A_120F} PSIG; at 130°F sat = ${R410A_130F} PSIG. If discharge is climbing past those into the OEM cutout range, address root cause before the switch fails.`,
  },
  {
    title: "Low-pressure switch tripping — undercharge or airflow starvation",
    signature: `Compressor runs 2–10 minutes, then stops on low-pressure cutout (setpoint varies by manufacturer; see equipment nameplate — for R-410A residential the cutout typically corresponds to a suction saturation below 5°F). Restart after warm-up as low-side pressures rise.`,
    body: "Undercharge or restricted return airflow drops evaporator saturation below the low-pressure switch setpoint. Compressor stops to protect against dead-heading. Automotive: expansion valve stuck closed, evaporator frozen, restricted receiver-drier. Fix: check evaporator airflow, then verify charge with SH/SC. Repair leak (Section 608 required) if undercharged.",
  },
  {
    title: "Thermostat differential too narrow or short-cycling itself",
    signature: `Compressor cycles every 2–5 minutes regardless of load. Both pressures normal when running. Thermostat clicks audible at each cycle.`,
    body: "Thermostat differential (deadband) less than 1°F causes rapid cycling. Older mercury-bulb thermostats can develop stuck-contact issues that cycle without a real setpoint crossing. On digital thermostats, incorrect anticipator setting or 'Comfort/Precision' mode can cause aggressive cycling. Fix: increase differential to 1.5–2°F on programmable thermostats; replace failed thermostat if bulb-type.",
  },
  {
    title: "Contactor chattering or motor start relay failure",
    signature: `Rapid on/off cycling (multiple times per minute) audible at outdoor unit. Contactor visibly buzzing; sometimes visible arcing.`,
    body: "Failed contactor coil or worn contact surfaces cause the contactor to bounce open/closed rapidly, cycling the compressor. On automotive AC, the clutch relay can develop a similar chatter. Fix: replace contactor (or automotive relay). This can burn out the compressor motor quickly — service urgently.",
  },
  {
    title: "Oversized equipment for the load (residential mostly)",
    signature: `Cycles every 5–10 minutes even at design conditions. Pressures normal when running. Runs briefly, satisfies stat, shuts off, load rises fast.`,
    body: "A cooling load too small for the equipment capacity satisfies the setpoint in under 5 minutes, then shuts off. Common on residential AC installed to Manual J assumptions of a wet-basement design that doesn't materialize. Result: poor humidity removal (short runs don't wring water out of air), compressor wear from frequent starts. Fix: check ACCA Manual J calculation vs installed equipment size — often reveals the sizing error was 30–50% oversized. On new installs, downsize; on existing, add variable-capacity replacement or restrict setpoint changes.",
  },
  {
    title: "Automotive: variable-displacement compressor at low load",
    signature: `Not a fault. Compressor clutch cycles briefly at cabin-satisfied setpoint or at very low cabin load. Passenger complaint of intermittent cold.`,
    body: `Modern variable-displacement compressors reduce displacement to zero rather than cycling — but pre-2015 systems and some fixed-displacement models still cycle the clutch. Cycling every 20–30 seconds at very low cabin load is normal. Cycling every 3–5 seconds is a fault (see branches 1, 2, 4). R-134a auto: normal discharge at 130°F cond = ${R134A_130F} PSIG; R-1234yf equivalent = ${R1234YF_130F} PSIG. Compare to your measured values before assuming a fault.`,
  },
  {
    title: "Refrigerant migration or liquid slugging on start",
    signature: `Compressor starts, runs 10–30 seconds, then shuts off with an audible knock or vibration. Restart same pattern. Common on cold-weather starts.`,
    body: "Liquid refrigerant migrating to the compressor crankcase during off-cycle floods the compressor on start. Slugging protection trips the compressor. Fix: verify crankcase heater operation, check for oil-return issues, consider adding a suction-line accumulator or a liquid-line solenoid.",
  },
  {
    title: "Automotive: refrigerant identifier or system-fault code",
    signature: `Modern vehicles (2010+) shut off the AC compressor if the ECU detects a fault: low refrigerant, high pressure, wrong refrigerant, or an engine-management priority (cooling engine takes precedence over cabin AC).`,
    body: "Automotive AC compressors are often ECU-controlled. Short cycling on a modern vehicle can be a diagnostic-trouble-code condition rather than a mechanical fault. Fix: scan for DTCs; use an OEM-approved scan tool. R-1234yf vehicles require an identifier per SAE J2843 before service to prevent cross-contamination.",
  },
];

const FAQS = [
  {
    q: "What is 'short cycling' in HVAC?",
    a: "The compressor turning on and off in cycles too short to satisfy the load or too short to be normal operation. On residential AC, cycles under 5 minutes on/5 minutes off are usually short cycling; on automotive AC (variable displacement), continuous run is normal and any cycling under 20 seconds is a fault.",
  },
  {
    q: "Is short cycling damaging to the compressor?",
    a: "Yes. Each start draws high inrush current (5–8× normal running amps), heats motor windings, and stresses valves. Refrigerant migrates to the crankcase during off cycles, then floods on restart. Extended short cycling can shorten a compressor's life from 15+ years to 2–3 years. Diagnose and fix promptly.",
  },
  {
    q: "How do I know if my thermostat is causing the short cycling?",
    a: "Disable the thermostat's auto-cycle for a test period and manually control the fan and cooling. If the compressor runs normally under manual control, the thermostat is the issue. Digital thermostats with anticipator or precision settings can be reset; older bulb-type thermostats usually need replacement.",
  },
  {
    q: "Can low refrigerant cause short cycling?",
    a: "Yes — undercharge trips the low-pressure switch when suction drops below the cutout. Compressor stops, low side warms, pressures rise, compressor restarts. Fix by identifying the leak and repairing (EPA Section 608 required) before recharging.",
  },
  {
    q: "My car AC compressor clutch clicks every 20 seconds. Fault?",
    a: "Depends on the system. Fixed-displacement clutch cycling every 20–30 seconds at low load is normal — the clutch cycles to control evaporator temp. On modern variable-displacement compressors (2000+) it's more often a fault; the compressor should modulate displacement rather than clutch cycle. Check refrigerant charge and low-side pressure first.",
  },
  {
    q: "What discharge pressure trips the residential R-410A high-pressure switch?",
    a: `Cutout setpoint varies by manufacturer — check the equipment nameplate. As a saturation reference, R-410A at 130°F condenser sat = ${R410A_130F} PSIG; at 140°F sat = ${fmtPsigBubble("r-410a", 140)} PSIG. If pressure is climbing toward the OEM cutout under load, address root cause (dirty condenser, fan failure, overcharge, non-condensables) before the switch cycles the compressor.`,
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "AC Compressor Short Cycling — Causes and Fixes",
      description: "Eight-branch diagnostic for AC compressor short cycling: high/low pressure switch trips, thermostat differential, contactor chatter, oversizing, and automotive-specific patterns.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "AC Compressor Short Cycling" },
      ],
    },
  ];
}

export default function AcCompressorShortCyclingPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">AC Compressor Short Cycling</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AC Compressor Short Cycling</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Diagnostic tree for compressor cycles too short for normal operation. Covers residential (thermostat, contactor, sizing) and automotive (clutch chatter, ECU faults, variable-displacement behavior).
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in two sentences">
          Short cycling most often traces to a safety switch trip (high or low pressure), a control issue (thermostat differential, contactor chatter), or oversized equipment. Automotive short cycling patterns differ — variable-displacement compressors modulate rather than cycle in normal operation.
        </KeyInsight>

        <TechSection icon="data" tone="purple" title="Diagnostic branches — 8 causes">
          <p>Ordered roughly by frequency. Time the on-cycle and off-cycle durations before diagnosing — that pattern alone narrows the tree substantially.</p>
          <div className="mt-4 space-y-4">
            {BRANCHES.map((b, i) => (
              <Panel key={i} title={`${i + 1}. ${b.title}`} icon={ListChecks}>
                <div className="text-sm space-y-2">
                  <p><strong>Signature:</strong> {b.signature}</p>
                  <p>{b.body}</p>
                </div>
              </Panel>
            ))}
          </div>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Automotive short cycling context">
          <p>
            Automotive AC compressors differ substantially between fixed-displacement (older, truck) and variable-displacement (modern light vehicles). Fixed-displacement systems normally cycle the clutch to control evaporator temp; variable-displacement systems normally run continuously and modulate displacement. Match cycling behavior to system type before diagnosing:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
            <li>Fixed-displacement: 20–40 second clutch cycles at low cabin load = normal.</li>
            <li>Variable-displacement: continuous run at low cabin load = normal; any cycling under 5 seconds = fault.</li>
            <li>Modern (2010+) light vehicles are almost all variable-displacement; older trucks and some economy vehicles are fixed.</li>
          </ul>
          <p className="mt-3 text-sm">Full automotive AC operating envelopes: R-134a discharge at 130°F cond sat = {R134A_130F} PSIG; R-1234yf equivalent = {R1234YF_130F} PSIG.</p>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools and reference">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/refrigerant-charge-calculator/" className="underline">Refrigerant Charge Calculator</Link>{" "}
              — verify weight-based charge before diagnosing pressure-switch trips.
            </li>
            <li>
              <Link href="/high-head-pressure-causes/" className="underline">High head pressure causes</Link>{" "}
              — diagnose the discharge climb that triggers high-pressure cutout.
            </li>
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — confirm undercharge fingerprint (high SH) before adding refrigerant.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope for comparison against cutout values.
            </li>
            <li>
              <Link href="/system-pressure-diagnostic-calculator/" className="underline">System Pressure Diagnostic Calculator</Link>{" "}
              — pattern-match diagnostic across the SH × SC quadrants.
            </li>
          </ul>
        </TechSection>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
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

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"><BookOpen className="mr-1 inline h-3.5 w-3.5" />Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ACCA Manual J — load calculation basis for right-sizing HVAC equipment.</li>
            <li>SAE J2843 — automotive AC service standards.</li>
            <li>OEM equipment installation manuals — pressure switch cutout ranges.</li>
            <li>CoolProp 7.2.0 — refrigerant PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Cutout-range references derived from OEM literature; PT values from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
