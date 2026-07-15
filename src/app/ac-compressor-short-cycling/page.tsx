import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";
import { CycleTimelineDiagram } from "@/components/diagrams/CycleTimelineDiagram";
import { OilFoamMechanismDiagram } from "@/components/diagrams/OilFoamMechanismDiagram";

const PAGE_URL = `${SITE_URL}/ac-compressor-short-cycling/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/ac-compressor-short-cycling/page.tsx");

const R410A_40F = fmtPsigBubble("r-410a", 40);
const R410A_120F = fmtPsigBubble("r-410a", 120);
const R410A_130F = fmtPsigBubble("r-410a", 130);
const R134A_30F = fmtPsigBubble("r-134a", 30);
const R134A_130F = fmtPsigBubble("r-134a", 130);
const R1234YF_30F = fmtPsigBubble("r-1234yf", 30);
const R1234YF_130F = fmtPsigBubble("r-1234yf", 130);

/**
 * Named source references used both in the visible page footer and in the
 * TechArticle citation[] JSON-LD payload. Single source of truth so the
 * schema and the rendered list can never drift. url === null means "cite by
 * name only" (S7 rule — Manual S is paywalled; naming without linking is
 * the honest form).
 */
const SOURCES = [
  {
    name: "Copeland Application Engineering Bulletin AE17-1262 R2 (June 2024) — Compressor Short Cycling: An Unrecognized Problem",
    publisher: "Copeland (Emerson Climate Technologies)",
    url: "https://webapps.copeland.com/online-product-information/Publication/LaunchPDF?Index=aeb&PDF=AE17-1262_R2.pdf",
  },
  {
    name: "Copeland Knowledge Base — scroll compressor minimum run time",
    publisher: "Copeland",
    url: "https://copeland.custhelp.com/app/answers/detail/a_id/3662/",
  },
  {
    name: "Copeland AE Bulletin AE4-1491 R2 (September 2024) — Digital Scroll Compressor",
    publisher: "Copeland",
    url: "https://webapps.copeland.com/online-product-information/Publication/LaunchPDF?Index=AEB&PDF=1491",
  },
  {
    name: "Copeland AE Bulletin AE4-1388 R2 (February 2025) — Crankcase Heater",
    publisher: "Copeland",
    url: "https://webapps.copeland.com/online-product-information/Publication/LaunchPDF?Index=AEB&PDF=1388",
  },
  {
    name: "Honeywell Home Support — thermostat cycle rate (CPH)",
    publisher: "Honeywell / Resideo",
    url: "https://www.honeywellhome.com/blogs/support/wi-fi-7-day-programmable-thermostat-install-7",
  },
  {
    name: "Counterman — A/C switches and clutch operation",
    publisher: "Counterman",
    url: "https://www.counterman.com/a-c-switches-and-clutch-operation/",
  },
  {
    name: "ACCA Manual S — Residential Equipment Selection; ENERGY STAR sizing guidance",
    publisher: "Air Conditioning Contractors of America / U.S. EPA ENERGY STAR",
    url: null,
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: "AC Compressor Short Cycling: Causes & Fixes (Home + Car)",
  description:
    "AC compressor short cycling: normal is ~3 cycles/hour at 50% load; Copeland's 3-minute scroll minimum is the floor. Causes, oil-loss mechanism, fixes.",
  path: "/ac-compressor-short-cycling/",
});

const BRANCHES = [
  {
    title: "High-pressure switch tripping (residential and automotive)",
    signature: `Compressor runs 30 seconds to 2 minutes, then stops. Discharge pressure spikes to the OEM high-pressure cutout (varies by manufacturer; see equipment nameplate) just before shutoff. Restart occurs after 3–5 minutes when pressure decays.`,
    body: `The high-pressure switch trips to protect the compressor from over-pressure. Causes: dirty or blocked condenser coil, condenser fan failure, overcharge, non-condensables. Fix: diagnose why discharge is elevated. At 120°F condenser saturation, R-410A discharge sat = ${R410A_120F} PSIG; at 130°F sat = ${R410A_130F} PSIG. If discharge is climbing past those into the OEM cutout range, address root cause before the switch fails.`,
  },
  {
    title: "Low-pressure switch tripping — undercharge, airflow starvation, or a close-differential setting",
    signature: `Compressor runs 2–10 minutes, then stops on low-pressure cutout (setpoint varies by manufacturer; see equipment nameplate — for R-410A residential the cutout typically corresponds to a suction saturation below 5°F). Restart after warm-up as low-side pressures rise.`,
    body: "Undercharge or restricted return airflow drops evaporator saturation below the low-pressure switch setpoint. Compressor stops to protect against dead-heading. Automotive: expansion valve stuck closed, evaporator frozen, restricted receiver-drier. Copeland's AE17-1262 R2 also calls out close-differential (low-pressure) control settings as a common cycling cause: a cutout/cut-in band too narrow around the setpoint cycles the compressor rapidly on a correctly-charged system, so check the switch or control differential before diagnosing charge. Fix: verify the differential first (cheap and non-invasive), then evaporator airflow, then charge with SH/SC. Repair leak (EPA Section 608 required) if undercharged.",
  },
  {
    title: "Thermostat differential too narrow, wrong CPH, or a listed control-side cause",
    signature: `Compressor cycles every 2–5 minutes regardless of load. Both pressures normal when running. Thermostat clicks audible at each cycle.`,
    body: "Cycle rate is set by the thermostat's cycles-per-hour (CPH) parameter — Honeywell's CPH convention is the maximum cycles per hour at 50% load. Recommended default: 3 CPH for high-efficiency systems (typical forced-air heat runs closer to 5 CPH). A CPH set aggressively above the recommended default is the cheapest fix on this page — check it first before touching refrigerant. Discharge-air thermostat control on packaged/rooftop equipment, multizone hot/cold-deck control, automatic-reset high-pressure controls, and compressor motor-plug reversal tests are all documented control-side cycling causes worth ruling in or out on non-residential equipment. Older mercury-bulb thermostats can develop stuck-contact issues that cycle without a real setpoint crossing. Fix: adjust CPH / differential to the OEM default; replace failed bulb-type thermostats.",
  },
  {
    title: "Contactor chattering or motor start relay failure",
    signature: `Rapid on/off cycling (multiple times per minute) audible at outdoor unit. Contactor visibly buzzing; sometimes visible arcing.`,
    body: "Failed contactor coil or worn contact surfaces cause the contactor to bounce open/closed rapidly, cycling the compressor. On automotive AC, the clutch relay can develop a similar chatter. Fix: replace contactor (or automotive relay). This can burn out the compressor motor quickly — service urgently.",
  },
  {
    title: "Oversized equipment for the load (residential mostly)",
    signature: `Cycles every 5–10 minutes even at design conditions. Pressures normal when running. Runs briefly, satisfies stat, shuts off, load rises fast.`,
    body: "A cooling load too small for the equipment capacity satisfies the setpoint in under 5 minutes, then shuts off. Common on residential AC installed to Manual J assumptions of a wet-basement design that doesn't materialize. Oversized equipment satisfies the thermostat before it can wring latent load out of the return air, so this branch also breaks humidity control — not just compressor life. That framing is codified in ACCA Manual S sizing limits and ENERGY STAR sizing guidance (cited by name; both restrict how far above Manual J load the installed capacity may sit). Fix: check ACCA Manual J calculation vs installed equipment — sizing errors of 30–50% oversized are the common finding. On new installs, downsize; on existing, variable-capacity replacement or a supply-air reset that lengthens on-cycles is the path.",
  },
  {
    title: "Automotive: variable-displacement compressor at low load",
    signature: `Not a fault. Compressor clutch cycles briefly at cabin-satisfied setpoint or at very low cabin load. Passenger complaint of intermittent cold.`,
    body: `Modern variable-displacement compressors reduce displacement to zero rather than cycling — but pre-2015 systems and some fixed-displacement models still cycle the clutch. Cycling every 20–30 seconds at very low cabin load is normal. Cycling every 3–5 seconds is a fault (see branches 1, 2, 4). R-134a auto: normal discharge at 130°F cond = ${R134A_130F} PSIG; R-1234yf equivalent = ${R1234YF_130F} PSIG. Compare to your measured values before assuming a fault.`,
  },
  {
    title: "Refrigerant migration or liquid slugging on start",
    signature: `Compressor starts, runs 10–30 seconds, then shuts off with an audible knock or vibration. Restart same pattern. Common on cold-weather starts or after long off periods.`,
    body: "Liquid refrigerant migrating to the compressor crankcase during the off cycle floods the compressor on start. Slugging protection or internal overload trips the compressor. Fix: verify crankcase heater operation. Copeland's AE4-1388 R2 (Feb 2025) sets the field rule for heater energization above documented refrigerant-charge limits — the heater must be powered a minimum of 12 hours before first start (also required after any long power outage or extended off period) to boil the migrated refrigerant out of the crankcase oil before the compressor sees load. Also check for oil-return issues, and consider a suction-line accumulator or a liquid-line solenoid for systems that repeatedly migrate.",
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
  {
    q: "How many times per hour should AC cycle?",
    a: "About 3 cycles per hour on a high-efficiency residential system at 50% cooling load — that is the recommended default from Honeywell's cycle-rate (CPH) convention. Typical forced-air heat runs closer to 5 CPH. Cycling substantially above the CPH default, or on-times below the compressor manufacturer's stated minimum (3 minutes on Copeland scrolls), is short cycling and warrants investigation.",
  },
  {
    q: "Is it normal for a car AC compressor to cycle on and off?",
    a: "Yes on cycling-clutch orifice-tube (CCOT) systems — the clutch cycles by design via a low-pressure switch mounted on the accumulator or the suction line, which opens at the evaporator-freeze saturation line to prevent coil icing. Counterman documents that cutout point. Systems with variable-displacement compressors run continuously instead. Rapid clutch cycling (every few seconds) on a CCOT system usually means undercharge tripping the low-pressure cutout early — leak-check and correct the charge per EPA Section 609.",
  },
  {
    q: "What is the minimum run time for a compressor?",
    a: "For Copeland scroll compressors, 3 minutes from startup to shutdown is the recommended minimum run time (long line sets may require a qualification test). Below that, oil pumped out during startup can't return to the crankcase before the next stop — that mechanism is what makes short cycling a leading compressor-failure mode. Anti-short-cycle timers on many controllers default to a 2-minute off delay as protection against rapid re-cycling.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "AC Compressor Short Cycling — Causes, Oil-Loss Mechanism, and Fixes",
      description: "Primary-source-grounded diagnostic tree for AC compressor short cycling: Honeywell cycle-rate convention, Copeland scroll minimum run time, Copeland's oil-foam mechanism (AE17-1262 R2), crankcase heater rule (AE4-1388 R2), and CCOT low-pressure-switch physics tied to dataset saturation values.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      citation: SOURCES.map((s) => ({
        "@type": "CreativeWork",
        name: s.name,
        publisher: s.publisher,
        ...(s.url ? { url: s.url } : {}),
      })),
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
          A compressor at 50% cooling load normally cycles about 3 times per hour on a high-efficiency residential system — that is the Honeywell cycle-rate convention, not a fault. Below that — cycles every few minutes, or run times under Copeland&apos;s 3-minute scroll minimum — is short cycling, and it kills compressors through oil loss, not wear.
        </KeyInsight>

        <CycleTimelineDiagram normalCph={3} shortCycleSeconds={90} minRunMinutes={3} />

        <TechSection icon="book" tone="blue" title="What counts as short cycling? (Normal cycle rates vs a problem)">
          <p>
            &quot;Cycle rate&quot; is a thermostat setting expressed in cycles per hour (CPH) — Honeywell&apos;s convention defines it as the maximum number of system cycles per hour with the load at 50%. The recommended default is 3 CPH for high-efficiency residential systems; typical forced-air heat sits closer to 5 CPH. So an AC compressor cycling roughly every 20 minutes on a partial-load day is by design, not a symptom.
          </p>
          <p>
            The lower bound comes from the compressor manufacturer. Copeland&apos;s knowledge base sets the minimum run time from startup to shutdown for a scroll compressor at 3 minutes. Long line sets may require a qualification test to confirm oil return, but 3 minutes is the design floor. Below that, oil pumped out during startup doesn&apos;t make it back before the next shutdown — the mechanism §3 walks through.
          </p>
          <p>
            Anti-short-cycle timers protect against the same failure mode. Copeland&apos;s digital scroll controllers (per AE4-1491 R2, Sept 2024) ship with a built-in 2-minute anti-short-cycle timer as the industry convention — a delay between compressor stops and restarts that prevents rapid re-cycling from control faults or transient load spikes.
          </p>
          <p>
            Short cycling begins when either bound is crossed: cycle count materially above the CPH default (aggressive thermostat setting, oversized equipment, close-differential control), or on-time below the compressor manufacturer&apos;s minimum run (safety-switch trip, control chatter, migration slug). Either pattern breaks oil return; the residential-versus-commercial diagnostic tree below sorts the causes.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Why short cycling destroys compressors (the oil-foam mechanism)">
          <p>
            Copeland&apos;s Application Engineering Bulletin AE17-1262 R2 (June 2024) — titled &quot;Compressor Short Cycling: An Unrecognized Problem&quot; — describes the physical mechanism in blunt terms. Each start rapidly drops suction and crankcase pressure. As pressure falls, the saturation temperature of the oil-refrigerant mixture in the crankcase falls with it. The refrigerant dissolved in the oil then flashes into foam and vapor, and a large share of the crankcase oil is pumped out of the compressor with the discharge gas.
          </p>
          <OilFoamMechanismDiagram />
          <p>
            Adequate run time reverses the loss: as the system stabilizes and mass flow settles, oil migrates back through the suction line to the crankcase. Short runs strand oil in the evaporator, suction line, receiver, and any accumulator or oil trap the geometry has. Repeated over days to weeks, the crankcase runs dry.
          </p>
          <p>
            The consequence is what makes this failure hard to catch. The compressor eventually fails as a motor burn or a bearing / lubrication failure. Because the short cycling itself is almost never found during teardown, the root cause goes undiagnosed, the replacement compressor is installed into the same operating condition, and it fails the same way. That is why the bulletin frames short cycling as &quot;the unrecognized problem&quot; — most in-warranty rebuilds are treating the symptom, not the cause.
          </p>
        </TechSection>

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

        <TechSection icon="warning" tone="amber" title="Automotive short cycling — CCOT cycles by design, at the evaporator freeze line">
          <p>
            Cycling-clutch orifice-tube (CCOT) systems cycle the compressor clutch <strong>by design</strong> via a low-pressure switch mounted on the accumulator or the suction line. That is the intended control mode; it is not short cycling. Counterman&apos;s coverage of A/C switches and clutch operation documents the low-pressure cutout as opening in the low-20s PSIG range on R-134a to protect lubrication and prevent evaporator icing, with a matching cut-in a few PSIG higher.
          </p>
          <p>
            The physics behind that cutout setpoint is directly readable from our own PT dataset. On R-134a, a suction saturation temperature of 30°F is {R134A_30F} PSIG (from CoolProp 7.2.0 via the site&apos;s dataset). On R-1234yf, the same 30°F sat is {R1234YF_30F} PSIG. The evaporator surface starts icing whenever the coil-air-side surface drops below 32°F, so the low-pressure switch is set right at (or slightly below) that saturation line — opening the clutch briefly lets the coil rewarm and drain condensate, then closing again once the accumulator warms enough to bring suction back up. That is why the switch lives in that band and not somewhere arbitrary.
          </p>
          <p>
            Fault patterns split cleanly. Steady 20–40 second cycles at low cabin load on a CCOT system are the design point. Rapid 5–15 second clutch cycling on the same system usually means the LP switch is tripping earlier and earlier — undercharge is the leading cause (leak-check per EPA Section 609). Systems with variable-displacement compressors run the compressor continuously instead and modulate stroke; frequent clutch cycling on those is a fault (typically ECU-flagged) rather than the intended behavior.
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Full high-side reference for automotive AC on a hot day: R-134a discharge at 130°F condensing sat = {R134A_130F} PSIG; R-1234yf equivalent = {R1234YF_130F} PSIG.
          </p>
        </TechSection>

        <TechSection icon="service" tone="emerald" title="Three worked service scenarios">
          <p>Each scenario is a compressed on-page walkthrough: symptom, diagnostic decision, next tool. Numbers on this page are dataset-derived; setpoints (CPH, minimum run time, anti-short-cycle delay) come from the sources listed at the bottom of the page.</p>
          <div className="mt-4 space-y-4">
            <Panel title="Scenario A — Residential R-410A cycling every 90 seconds on a mild day" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  70°F outdoor, indoor thermostat calling for cooling but the compressor is on for ~90 seconds then off for ~2 minutes. Manifold reads normal for the ambient when running; suction and discharge are both close to what would be expected at the load. Nothing else looks wrong.
                </p>
                <p>
                  This is a CPH / oversizing pattern (branches 3 and 5). Runtime under the 3-minute scroll floor doesn&apos;t leave the coil enough time to reach steady-state before the setpoint is satisfied. First check: the thermostat&apos;s CPH parameter — an aggressive CPH set well above the 3 CPH default for high-efficiency systems is the cheapest fix, and it takes 60 seconds in the installer menu. If CPH is at the default and the pattern persists, run a load calculation against installed capacity; oversized equipment satisfies the room before it can dehumidify, and short cycling is the symptom.
                </p>
                <p>
                  Next: <Link href="/superheat-calculator/" className="underline">superheat calculator</Link> to rule charge out before touching sizing, then §Branch 5 for the load-vs-capacity path.
                </p>
              </div>
            </Panel>

            <Panel title="Scenario B — Cycling on the low-pressure switch, suction well below expected" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  Compressor runs a couple of minutes, drops out on the low-pressure cutout, restarts a few minutes later, and repeats. At 40°F evaporator saturation an R-410A residential AC would show suction near {R410A_40F} PSIG at the coil (from the dataset). Measured suction is materially below that, with high superheat.
                </p>
                <p>
                  This is the undercharge / restriction fingerprint (branch 2). Runtime under the 3-minute scroll floor is doing double damage — the LP switch is protecting against dead-heading, but repeat trips are stranding oil in the system per §3. Before adding refrigerant: verify with SH and SC (undercharge = high SH + low SC; restriction upstream of the metering device = high SH + high SC + a cold spot at the filter-drier). Also check that the LP cutout differential isn&apos;t set unusually close — a common cycling cause on correctly-charged systems.
                </p>
                <p>
                  Next: <Link href="/low-suction-pressure/" className="underline">low suction pressure diagnostic tree</Link>, then <Link href="/refrigerant-charge-calculator/" className="underline">refrigerant charge calculator</Link>. Repair leak per EPA Section 608 before recharging.
                </p>
              </div>
            </Panel>

            <Panel title="Scenario C — Car AC clutch clicking every ~10 seconds on a 95°F day" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  Vehicle is a CCOT-type light truck or older sedan. Ambient 95°F, cabin AC on max cold, compressor clutch engaging and disengaging every ~10 seconds. The clutch normally cycles on this platform, but not this fast.
                </p>
                <p>
                  This is the CCOT low-pressure cutout tripping early — almost always undercharge on this pattern. On R-134a the switch sits at the evaporator-freeze saturation line ({R134A_30F} PSIG corresponds to 30°F sat, roughly the coil-ice threshold). Undercharge drops suction below that faster after each engagement, so the switch keeps opening earlier and earlier. If the vehicle is R-1234yf, the same physics with {R1234YF_30F} PSIG at 30°F sat.
                </p>
                <p>
                  Diagnostic: refrigerant identifier first (SAE J2843 required on R-1234yf systems to prevent cross-contamination); then leak-check, evacuate, and recharge by weight per the underhood label. Next tool: <Link href="/what-pressure-should-r134a/" className="underline">what pressure should R-134a be?</Link> (or the R-1234yf page) for the full operating envelope.
                </p>
              </div>
            </Panel>
          </div>
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
            {SOURCES.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-words">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
            <li>CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999) — PT chart values behind every dataset number on this page.</li>
            <li>EPA 40 CFR Part 82 Subpart F (Section 608) — leak-repair and recovery certification cited in scenario B; EPA Section 609 — motor-vehicle A/C service cited in scenario C and in the automotive FAQ.</li>
            <li>SAE J2843 — automotive R-1234yf service standard (refrigerant identifier requirement cited in scenario C).</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Facts on this page are paraphrased from the linked sources; direct sentences are not reproduced. PSIG values render through the site&apos;s pressure-format helpers so a dataset regeneration updates the prose automatically.</p>
        </footer>
      </article>
    </>
  );
}
