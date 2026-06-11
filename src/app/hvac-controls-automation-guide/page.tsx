import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, Wind, Wrench, ListChecks, FileCheck, AlertTriangle, Thermometer, Zap, Snowflake, Sun, ShieldCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-controls-automation-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Controls & Automation Guide — Thermostats, Zoning, Building Automation, Smart Home Integration",
  description:
    "Complete residential and small-commercial HVAC controls guide: thermostat taxonomy (basic, programmable, smart, communicating), smart thermostat comparison (Ecobee, Nest, Honeywell, Mysa), heat pump balance-point + aux heat configuration, multi-zone system design, building automation systems (BAS) for commercial, communication protocols (BACnet, Modbus, KNX, Matter, Zigbee, Z-Wave), smart home integration, utility demand-response programs, commissioning, common control failures, and future trends. Sourced from ANSI/ASHRAE Standard 135 (BACnet), ASHRAE Standard 90.1, ASHRAE Guideline 36, IECC 2021 R403.1, ENERGY STAR Smart Thermostat criteria, CTA-2045 modular communications.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Controls & Automation Guide — Thermostats + Zoning + BAS + Smart Home",
    description: "Complete controls + automation methodology with primary-source citations throughout.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Controls & Automation Guide — Thermostats, Zoning, BAS",
    description: "Smart thermostat selection + heat pump config + BAS protocols.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the best smart thermostat for a heat pump in 2026?",
    a: "Depends on the heat pump type. For single-stage and two-stage heat pumps: Ecobee Smart Thermostat Enhanced or Premium, or Nest Learning Thermostat (4th generation), are the leading consumer choices — both support proper heat pump staging, balance-point configuration, and aux heat lockout. For variable-capacity (inverter) heat pumps from major brands (Carrier Infinity, Trane XV, Lennox SLP, Mitsubishi Hyper-Heat, Daikin Fit): use the manufacturer's communicating thermostat, which speaks the proprietary protocol needed to control modulation. Generic smart thermostats with these systems lose the variable-capacity benefit because they can only call for &quot;on/off&quot; rather than modulating capacity. For Mitsubishi mini-splits: Mitsubishi kumo cloud or third-party Sensibo with Mitsubishi support. For Daikin Fit/VRV: Daikin's One+ Smart Thermostat. For Mysa-compatible electric resistance: Mysa Smart Thermostat. Pricing 2026: basic smart thermostats $150-250; communicating manufacturer thermostats $300-600. Many qualify for IRA 25C tax credit when installed with qualifying equipment.",
  },
  {
    q: "How do I configure heat pump balance point and aux heat lockout?",
    a: "Balance point is the outdoor temperature below which the heat pump alone cannot meet the building's heating load — at this point auxiliary electric resistance heat (or backup gas furnace in a dual-fuel system) takes over. The thermostat must be configured to: (1) Aux heat lockout temperature — typically 30-35°F for typical cold-climate heat pump; aux heat is locked out above this temperature regardless of heat call. (2) Compressor lockout temperature — minimum outdoor temperature where heat pump can operate; below this (typically -5°F to +15°F depending on equipment), heat pump shuts off and aux heat handles. (3) Differential temperature for staging — how many degrees below setpoint trigger aux activation (typically 2°F drop below setpoint for 15-30 minutes). Wrong configuration = excessive aux heat use (heating bills 2-3× expected) OR insufficient heat at design conditions. Default thermostat settings often default to aggressive aux heat activation; verify and tune to the specific equipment's published balance point. See our energy efficiency guide for the full heat pump economics.",
  },
  {
    q: "When does zoning make sense for residential HVAC?",
    a: "Zoning is justified when the home has distinctly different load patterns by area that can't be served well by single-zone operation. Common scenarios: (1) Multi-story homes with substantial floor-to-floor load differences (upstairs hotter than downstairs in summer; opposite in winter); (2) Distinct orientations (south-facing solar-gain rooms vs north-facing constant-load rooms); (3) Wings or additions with different occupancy patterns (master bedroom suite vs general home); (4) Mixed-use spaces (home office vs living areas with different occupancy schedules). For these cases, 2-4 zone systems with motorized supply dampers + zone-specific thermostats provide per-zone temperature control. Zoning hardware cost: $1,500-4,000 for 2-3 zone retrofit. Alternative: ductless mini-split for problem zones often comparable or lower cost and simpler than retrofitting zoning into existing ductwork. For new construction, design zoning into the duct layout from the start. Avoid zoning when load is reasonably uniform (open floor plan, single story, similar orientations) — variable-capacity equipment handles modest load variation through modulation without zoning hardware.",
  },
  {
    q: "What's the difference between BACnet, Modbus, KNX, Matter, Zigbee, and Z-Wave?",
    a: "Communication protocols for HVAC control + smart home integration. (1) BACnet (ANSI/ASHRAE Standard 135-2020) — the dominant commercial BAS protocol; runs over IP, RS-485, or other physical layers; mature; complex but capable. (2) Modbus (Modbus Application Protocol Specification at modbus.org) — older industrial protocol; widely supported in HVAC equipment; simpler than BACnet but less feature-rich; runs over RS-485 (Modbus RTU) or TCP/IP (Modbus TCP). (3) KNX (KNX Association standards) — European-dominant residential automation protocol; rare in US residential; capable but more expensive than US alternatives. (4) Matter (Connectivity Standards Alliance, launched 2022) — newer cross-vendor smart-home protocol; replaces fragmented Zigbee + Z-Wave + WiFi + Thread fragmentation with unified standard; growing rapidly in residential. (5) Zigbee (Zigbee Alliance) — short-range mesh wireless; widely deployed in smart home; Matter compatible via bridges. (6) Z-Wave (Z-Wave Alliance) — short-range wireless smart-home; widely deployed; Matter-compatible. For residential HVAC controls in 2026, the practical reality: most smart thermostats use WiFi + cloud + smart-home APIs; commercial BAS uses BACnet for primary integration. Choose protocol based on what equipment + integrations you need, not abstractly.",
  },
  {
    q: "Do I need a Building Automation System (BAS) for residential?",
    a: "Almost never. BAS systems (Johnson Controls Metasys, Honeywell EBI, Schneider Electric EcoStruxure, Tridium Niagara, others) are commercial-grade automation for buildings with 10+ HVAC zones, multiple equipment types (chillers, boilers, AHUs, VAV boxes), and operational complexity requiring centralized control. Residential equivalents: smart thermostat + zoning controller + smart-home hub for whole-home integration. The exceptions where BAS could apply to residential: very large custom homes (10,000+ sq ft with multiple equipment zones); some Passive House projects with detailed monitoring requirements; demand-response participation requiring BAS integration with utility. For typical residential, smart thermostat + ductless mini-split per-zone controllers + smart-home hub (HomeKit, Google Home, Amazon Alexa, SmartThings) provides equivalent capability at a fraction of BAS cost. BAS commissioning per ASHRAE Guideline 13 is its own discipline; not appropriate for typical residential.",
  },
  {
    q: "Are utility demand-response programs worth participating in?",
    a: "Often yes, especially in regions with time-of-use electricity pricing or grid stress (California ISO, ERCOT Texas, PJM Mid-Atlantic). Demand response programs typically: (1) Send a signal to your smart thermostat or HVAC controller to reduce capacity during grid stress events (typically 4-12 events per year, lasting 2-4 hours each, in summer afternoons); (2) Pay $20-100 annual incentive plus per-event credit; (3) Sometimes integrated with utility energy efficiency programs. Participation requires compatible equipment (most smart thermostats from Ecobee, Nest, Honeywell support utility demand response). The catch: during a demand response event your HVAC reduces capacity (typically 3-5°F setpoint change for 2-4 hours), so the home gets warmer than usual during summer afternoons. Manageable for most households; uncomfortable for some. Participants can override events on a per-event basis if needed (with loss of that event's incentive). The CTA-2045 (Modular Communications Interface for Energy Management) standard provides equipment-level demand response capability beyond thermostat-only programs.",
  },
  {
    q: "How does the thermostat connect to the HVAC equipment?",
    a: "Residential HVAC thermostats use 24V control wiring (typically a multi-conductor cable to the air handler / furnace + outdoor unit). Standard wire assignments: R (24V hot), C (common — required for smart thermostats that need continuous power), W (heating), Y (cooling), G (fan), O/B (heat pump reversing valve), Aux/E (auxiliary or emergency heat). Wire count varies by equipment complexity: 4 wires (R+C+W+Y) for basic split AC + furnace; 5-7 wires for heat pumps; 8+ wires for two-stage or variable-capacity equipment. Critical wiring point: the C wire (common) is required by most smart thermostats to power their always-on display and WiFi; older homes without a C wire need to either run a new C wire from the air handler, or install a power-stealing adapter (Ecobee includes one), or use a thermostat that doesn't require C (Mysa baseboard, some others). Communicating thermostats (for variable-capacity equipment) use 2-4 wire proprietary protocols (Carrier ABCD, Trane Comfortlink, Lennox iComfort, Mitsubishi M-NET); not interchangeable.",
  },
  {
    q: "What are the most common control system failures?",
    a: "Five patterns dominate. (1) WRONG AUX HEAT CONFIGURATION on heat pumps — thermostat allows aux strips to activate at any heat call instead of below balance point. Symptom: heating bills 2-3× expected. Fix: configure aux heat lockout to balance point. (2) MISSING C WIRE for smart thermostat — thermostat works briefly then dies; or display flickers. Fix: run new C wire from air handler or install power-stealing adapter. (3) THERMOSTAT LOCATION near supply register — thermostat reads recent supply air temp not room temp; short cycles. Fix: relocate thermostat 4-6 ft from any supply register, away from direct sun. (4) PROGRAMMABLE THERMOSTAT not actually programmed — defaults to constant setpoint, no setback. Fix: configure schedule + setback temperatures. (5) ZONING SYSTEM DAMPERS not adjusted at install — all dampers default-open; system can't actually zone. Fix: zone controller commissioning + per-zone damper position verification. Beyond residential: commercial BAS programming errors are common; sequences of operation that don't match ASHRAE Guideline 36 produce energy waste and complaints. ASHRAE Guideline 36 (High-Performance Sequences of Operation for HVAC Systems) standardizes BAS programming to avoid common errors.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Controls & Automation Guide — Thermostats, Zoning, Building Automation, Smart Home Integration",
      description:
        "Complete HVAC controls methodology: thermostat taxonomy + selection, heat pump configuration, zoning, BAS, communication protocols, smart home integration, demand response, commissioning, common failures.",
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
        { "@type": "Thing", name: "HVAC controls" },
        { "@type": "Thing", name: "Smart thermostat" },
        { "@type": "Thing", name: "Building automation system" },
        { "@type": "Thing", name: "Heat pump configuration" },
        { "@type": "Thing", name: "Demand response" },
      ],
      keywords: [
        "hvac controls",
        "smart thermostat",
        "ecobee vs nest",
        "hvac zoning",
        "bacnet",
        "modbus",
        "matter smart home",
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
        { "@type": "ListItem", position: 3, name: "HVAC Controls & Automation Guide" },
      ],
    },
  ];
}

export default function HvacControlsAutomationGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Controls &amp; Automation Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Controls &amp; Automation Guide — Thermostats, Zoning, Building Automation, Smart Home Integration
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            The controls + automation companion to our <Link href="/hvac-system-design-guide/" className="underline">system design guide</Link> — Step 7 of the design cascade gets a complete deep-dive here. Covers: thermostat taxonomy (basic programmable through communicating), smart thermostat comparison (Ecobee, Nest, Honeywell, manufacturer communicating), heat pump-specific configuration (balance point + aux heat lockout), multi-zone system design + hardware, building automation systems (BAS) for commercial, communication protocols (BACnet, Modbus, KNX, Matter, Zigbee, Z-Wave), smart-home integration, utility demand-response programs, wiring + installation considerations, commissioning, common control failures, and future trends. Sourced from ANSI/ASHRAE Standard 135 (BACnet), ASHRAE Standard 90.1, ASHRAE Guideline 36, IECC 2021 R403.1, ENERGY STAR Smart Thermostat criteria, and CTA-2045 modular communications interface.
          </p>
        </header>

        {/* SECTION 01 — Why controls matter */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why controls matter — the realized-efficiency multiplier
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Equipment efficiency (SEER2, HSPF2, AFUE) is rated under specific test conditions assuming proper control. In actual operation, the control system determines whether the equipment delivers near rated efficiency or 30-50% less. Misconfigured controls — wrong heat pump balance point, aux heat strips activating unnecessarily, zoning dampers stuck open, programmable thermostat in &quot;hold&quot; instead of schedule — silently degrade realized efficiency for the equipment&apos;s 15-20 year service life. The same equipment with correct controls vs sloppy controls produces dramatically different bills.
          </p>

          <KeyInsight tone="blue" title="The aux heat configuration failure">
            One specific example: a 9 HSPF2 cold-climate heat pump installed with thermostat configured to activate aux electric resistance heat on EVERY heat call (default for some thermostats) operates more like a 4-5 HSPF2 system in practice because the aux strips (COP 1.0) dominate the heating energy consumption. Same equipment, same install, wrong control = roughly 2× the expected heating bills. The fix is a 5-minute thermostat configuration change. The cost of getting it wrong: 15-20 years of doubled heating bills until a homeowner or technician investigates.
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Thermostat capability tiers — features by class"
              orientation="vertical"
              data={[
                { label: "Mechanical", value: 1, sub: "set + go", color: "#71717a" },
                { label: "Digital (non-prog)", value: 2, sub: "+ display", color: "#3b82f6" },
                { label: "Programmable", value: 4, sub: "+ schedule", color: "#06b6d4" },
                { label: "Smart (WiFi)", value: 8, sub: "+ app + learning", color: "#10b981" },
                { label: "Communicating", value: 10, sub: "+ OEM proprietary", color: "#f59e0b" },
              ]}
              axisLabel="Feature capability score"
              caption="Smart thermostats (Ecobee, Nest, Honeywell T-series) offer 4-8× the capability of programmable models for similar price ($150-300). Communicating thermostats (OEM proprietary) integrate deeply with variable-capacity equipment but lock-in to manufacturer ecosystem."
            />
          </div>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Beyond efficiency: controls determine comfort (temperature accuracy, humidity management, zone coordination), reliability (proper staging, safety lockouts, equipment protection), and operational visibility (monitoring, alarms, energy reports). For commercial systems, controls also determine demand response capability and code compliance with ASHRAE Standard 90.1 automatic-controls requirements.
          </p>
        </section>

        {/* SECTION 02 — Thermostat taxonomy */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Thermostat taxonomy — five categories
          </h2>

          <ComparisonTable
            headers={["Category", "Examples", "Best for", "Typical cost"]}
            rows={[
              { label: "Basic non-programmable", cells: ["Manual dial thermostats", "Rental properties; minimal-feature applications; backup systems", "$20-50"] },
              { label: "Programmable", cells: ["Honeywell RTH8580, basic Lux models", "Fixed-schedule households; budget-conscious; minimum code compliance per IECC R403.1", "$50-150"] },
              { label: "Smart (WiFi + learning)", cells: ["Nest Learning, Ecobee Premium, Honeywell T9, Mysa", "Most residential; smart-home integration; remote control; energy reports", "$150-300"] },
              { label: "Communicating proprietary", cells: ["Carrier Infinity, Trane XL, Lennox iComfort, Mitsubishi kumo, Daikin One+", "Variable-capacity heat pumps and AC; manufacturer ecosystem integration", "$300-600"] },
              { label: "BAS controller (commercial)", cells: ["Johnson Controls Metasys, Honeywell EBI, Schneider Electric, Tridium Niagara", "Commercial buildings 10+ zones; BACnet integration; centralized control", "$5,000-100,000+ system"] },
            ]}
          />

          <FixCallout>
            <strong>Match thermostat to equipment:</strong> single-stage equipment works with any thermostat; two-stage equipment needs smart thermostat with 2-stage support; variable-capacity equipment typically requires the manufacturer&apos;s communicating thermostat for proper modulation control. Using a generic smart thermostat with a communicating variable-capacity system loses the variable-capacity efficiency benefit because the thermostat can only call for on/off rather than modulating capacity.
          </FixCallout>
        </section>

        {/* SECTION 03 — Smart thermostat comparison */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Smart thermostat comparison (2026)
          </h2>

          <ComparisonTable
            headers={["Thermostat", "Vendor", "Key features", "Best for", "ENERGY STAR cert"]}
            rows={[
              { label: "Ecobee Smart Thermostat Premium", cells: ["Ecobee (Generac)", "Built-in air-quality sensor; remote room sensors; Spotify/Alexa built-in; demand response", "Multi-room temp accuracy; high-touch users", "Yes"] },
              { label: "Ecobee Smart Thermostat Enhanced", cells: ["Ecobee", "Remote room sensors; demand response; smart-home integration", "Budget Ecobee option; whole-home accuracy", "Yes"] },
              { label: "Nest Learning Thermostat (4th gen)", cells: ["Google", "Learning algorithm; Google Home integration; presence detection", "Set-it-and-forget-it; Google Home users", "Yes"] },
              { label: "Nest Thermostat (Budget)", cells: ["Google", "Basic smart; lower cost than Learning", "Budget smart upgrade; basic Google integration", "Yes"] },
              { label: "Honeywell Home T9 / T10 Pro", cells: ["Resideo (Honeywell)", "Remote room sensors; HomeKit + Google + Alexa; geofencing", "Multi-room control; smart-home agnostic", "Yes"] },
              { label: "Mysa Smart Thermostat", cells: ["Mysa", "Designed for electric baseboard + radiant; HomeKit + Alexa", "Electric resistance heat; baseboard retrofits", "Yes"] },
              { label: "Sensibo Sky / Air", cells: ["Sensibo", "Aftermarket controller for ductless mini-split via IR; geofencing", "Mini-splits not natively WiFi-enabled", "—"] },
              { label: "Lux Kono Smart", cells: ["Lux", "Budget smart with HomeKit support; interchangeable faceplates", "Cost-conscious smart upgrade", "Yes"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: ENERGY STAR Certified Smart Thermostats list (energystar.gov/products/certified-products/detail/smart_thermostats). Vendor specifications current as of 2026 product lines; refer to vendor sites for latest hardware revisions and pricing.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="HVAC communication protocols — adoption + use case"
              orientation="horizontal"
              data={[
                { label: "BACnet/IP (commercial)", value: 90, sub: "% commercial BMS", color: "#3b82f6" },
                { label: "Modbus (industrial)", value: 70, sub: "% industrial", color: "#06b6d4" },
                { label: "Matter (residential smart)", value: 40, sub: "% new smart homes", color: "#10b981" },
                { label: "Zigbee", value: 35, sub: "% smart sensors", color: "#f59e0b" },
                { label: "Z-Wave", value: 25, sub: "% smart home hubs", color: "#ef4444" },
                { label: "Thread (Matter base)", value: 30, sub: "% growing", color: "#10b981" },
                { label: "OEM proprietary", value: 60, sub: "% communicating HVAC", color: "#a855f7" },
              ]}
              axisLabel="% market adoption (est.)"
              caption="Commercial = BACnet dominant. Residential smart home = Matter + Zigbee fragmenting. OEM proprietary protocols (Carrier Infinity, Trane ComfortLink, Lennox iComfort) lock communication into manufacturer ecosystem for full variable-capacity control."
            />
          </div>

          <KeyInsight tone="blue" title="The IRA 25C tax credit on smart thermostats">
            Smart thermostats themselves don&apos;t typically qualify for IRA 25C tax credit as standalone purchases. However, when installed as part of a qualifying heat pump or HVAC equipment upgrade, the cost can be included in the credit calculation. ENERGY STAR certification is typically required. Check current IRS Form 5695 instructions and state-specific HEEHRA programs for eligibility details.
          </KeyInsight>
        </section>

        {/* SECTION 04 — Heat pump config */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Heat pump-specific configuration
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Heat pumps add three critical configuration parameters beyond AC/furnace controls. Getting these wrong substantially degrades realized efficiency:
          </p>

          <ComparisonTable
            headers={["Parameter", "What it controls", "Typical value", "Failure mode if wrong"]}
            rows={[
              { label: "Balance point", cells: ["Outdoor temp below which heat pump capacity is insufficient", "30-35°F (cold-climate HP); 35-45°F (standard HP)", "Too high: heat pump under-utilized; too low: heat pump can't keep up at design"] },
              { label: "Aux heat lockout (above)", cells: ["Outdoor temp ABOVE which aux electric strips locked out", "30-40°F typical (slightly above balance point)", "If aux always active: 2-3× heating bills (aux COP 1.0 vs HP COP 3.0+)"] },
              { label: "Compressor lockout (below)", cells: ["Outdoor temp BELOW which heat pump turns off (aux only)", "-5°F to +15°F (depends on equipment)", "If too high: heat pump unused below limit; if too low: equipment damage from low-temp operation"] },
              { label: "Aux heat differential", cells: ["Indoor temp drop below setpoint before aux activates", "2°F drop for 15-30 min typical", "Too aggressive: aux runs unnecessarily; too lax: aux can't catch up on cold mornings"] },
              { label: "Defrost cycle interval", cells: ["How often outdoor coil defrosts (heating mode)", "30-90 min in cold/humid; on-demand in modern equipment", "Too rare: ice accumulates; too frequent: efficiency drops"] },
              { label: "Dehumidify mode (cooling)", cells: ["Lower fan speed for more latent removal", "Activate when RH &gt; 55% sustained", "Without dehumidify mode: AC short-cycles and humidity climbs"] },
            ]}
          />

          <FixCallout>
            <strong>How to verify aux heat configuration:</strong> on a moderately cold day (outdoor temp around 40°F), put the thermostat in heating mode and trigger a heat call. Use an amp clamp on the aux heat strip wiring. Aux heat should NOT energize at 40°F outdoor if balance point is 30-35°F. If amps appear on the aux circuit, the lockout is mis-configured or absent. Fix in thermostat settings — most smart thermostats expose this in &quot;equipment&quot; or &quot;installer settings.&quot;
          </FixCallout>
        </section>

        {/* SECTION 05 — Zoning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Multi-zone system design + hardware
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Zoning splits a single HVAC system into independently-controlled zones (typically 2-4 for residential). Hardware:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Zone controller</strong> ($300-800): the central brain that receives thermostat calls from each zone and operates dampers + equipment.</li>
            <li><strong>Motorized supply dampers</strong> ($100-300 per damper): installed in supply ductwork at the trunk-to-branch takeoff for each zone. Default open; close on command.</li>
            <li><strong>Thermostat per zone</strong> ($150-400 each): controls its zone&apos;s setpoint; communicates with zone controller.</li>
            <li><strong>Bypass damper</strong> ($100-300): relieves excess static pressure when only one zone is calling. Some designs use barometric relief instead.</li>
            <li><strong>Static pressure switch</strong> (optional, $50-150): prevents equipment from operating when static exceeds blower curve limit.</li>
          </ul>

          <ComparisonTable
            headers={["Zone configuration", "Typical residential cost (2-zone retrofit)", "Use case"]}
            rows={[
              { label: "2-zone (upstairs / downstairs)", cells: ["$1,500-3,000", "Two-story homes with floor-to-floor load variation"] },
              { label: "3-zone (upstairs + downstairs + bonus room)", cells: ["$2,000-4,000", "Two-story with distinct bonus or master suite"] },
              { label: "4-zone (north/south/east/west)", cells: ["$3,000-5,500", "Distinct orientations; large homes"] },
              { label: "Ductless mini-split (per zone)", cells: ["$1,500-3,500 per indoor head", "Often cost-competitive vs ducted zoning; simpler"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Sizing consideration for zoned systems:</strong> when one zone is calling and others closed, the equipment delivers all its airflow to a fraction of the total ductwork. This raises TESP and can damage blower or cause noise. Solution: variable-capacity equipment that modulates down to single-zone capacity; OR bypass damper that relieves excess pressure when single-zone calls; OR minimum-airflow constraint that requires equipment to deliver to at least 50% of zones simultaneously. Discuss with HVAC contractor; for retrofit zoning on existing single-stage equipment, bypass damper is most common.
          </p>
        </section>

        {/* SECTION 06 — BAS */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Building Automation Systems (BAS) for commercial
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            BAS systems are commercial-grade automation for buildings with multiple HVAC equipment types, many zones, and operational complexity. Major vendors:
          </p>

          <ComparisonTable
            headers={["Vendor", "Product line", "Typical building size", "Notes"]}
            rows={[
              { label: "Johnson Controls", cells: ["Metasys; Facility Explorer", "Small to very large", "Largest installed base in US"] },
              { label: "Honeywell", cells: ["Niagara N4; Enterprise Buildings Integrator (EBI)", "Mid to very large", "Strong in airports + hospitals"] },
              { label: "Schneider Electric", cells: ["EcoStruxure Building Operation", "Mid to very large", "Integration with EcoStruxure power management"] },
              { label: "Siemens", cells: ["Desigo CC", "Large + complex", "Strong in pharma + research labs"] },
              { label: "Trane", cells: ["Tracer SC+", "Mid to large", "OEM-integrated solution for Trane equipment-heavy buildings"] },
              { label: "Carrier (Automated Logic)", cells: ["WebCTRL", "Small to large", "Tridium Niagara-based; flexible"] },
              { label: "Tridium Niagara framework", cells: ["Niagara Framework", "Any size", "Vendor-agnostic platform; many integrators build on it"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            BAS programming follows ASHRAE Guideline 36 (High-Performance Sequences of Operation for HVAC Systems) for standardized control sequences that avoid common errors. Sequences cover: VAV terminal control, chiller plant sequencing, boiler plant sequencing, air handler economizer logic, ventilation control, demand-response integration, and energy-monitoring + diagnostics. Compliance with Guideline 36 is a marker of high-quality BAS programming; deviation often indicates legacy controls or vendor-specific approaches.
          </p>
        </section>

        {/* SECTION 07 — Protocols */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Communication protocols
          </h2>

          <ComparisonTable
            headers={["Protocol", "Primary use", "Standard / source", "Status"]}
            rows={[
              { label: "BACnet", cells: ["Commercial BAS interoperability", "ANSI/ASHRAE Standard 135-2020", "Dominant commercial protocol"] },
              { label: "Modbus", cells: ["Industrial + HVAC equipment integration", "Modbus.org Application Protocol Spec", "Widely supported; older but durable"] },
              { label: "KNX", cells: ["European residential automation", "KNX Association ISO/IEC 14543-3", "Common in Europe; rare in US residential"] },
              { label: "Matter", cells: ["Cross-vendor smart home unified protocol", "Connectivity Standards Alliance (launched 2022)", "Growing rapidly; replaces fragmented Zigbee/Z-Wave/WiFi"] },
              { label: "Zigbee", cells: ["Short-range mesh wireless for smart home", "Zigbee Alliance", "Widely deployed; Matter compatible via bridges"] },
              { label: "Z-Wave", cells: ["Short-range wireless for smart home", "Z-Wave Alliance", "Widely deployed; Matter compatible"] },
              { label: "Thread", cells: ["Low-power mesh for IoT / smart home", "Thread Group", "Increasingly common; Matter native"] },
              { label: "LonWorks / LonTalk", cells: ["Legacy commercial BAS", "ISO/IEC 14908", "Legacy installed base; less new install"] },
              { label: "CTA-2045 (CEA-2045)", cells: ["Modular Communications Interface for Energy Management", "Consumer Technology Association", "Demand response standard; required by some utilities for grid-interactive equipment"] },
              { label: "OPC UA", cells: ["Industrial + cross-platform automation", "OPC Foundation", "Industrial-grade; some BAS integration"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For residential smart-home in 2026: Matter is the unifying trend, replacing fragmented Zigbee + Z-Wave + WiFi + Thread silos with cross-vendor compatibility. Most new smart thermostats support Matter natively or via bridge. For commercial BAS: BACnet IP is the standard for new installation; Modbus is common for HVAC equipment integration with BAS systems.
          </p>
        </section>

        {/* SECTION 08 — Smart home integration */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Smart home integration
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Major smart home platforms + HVAC compatibility:
          </p>

          <ComparisonTable
            headers={["Platform", "Owner", "HVAC integration", "Notes"]}
            rows={[
              { label: "Amazon Alexa", cells: ["Amazon", "Voice control via skill; routine automation", "Largest user base; most thermostat brands compatible"] },
              { label: "Google Home / Nest", cells: ["Google", "Native Nest thermostat; voice control for other brands", "Strong with Google Nest Learning Thermostat"] },
              { label: "Apple HomeKit", cells: ["Apple", "HomeKit-certified thermostats only (Ecobee, Honeywell T9/T10, Mysa)", "Premium privacy; smaller compatible thermostat set"] },
              { label: "Samsung SmartThings", cells: ["Samsung", "Hub-based; works with WiFi + Zigbee + Z-Wave thermostats", "Strong with Samsung appliance ecosystem"] },
              { label: "IFTTT", cells: ["IFTTT", "Trigger-based automation across many platforms", "Bridges otherwise-incompatible systems"] },
              { label: "Home Assistant", cells: ["Open source", "Wide HVAC integration (Mitsubishi, Daikin, Carrier, etc.)", "Self-hosted; technical users; comprehensive"] },
              { label: "Matter (cross-platform)", cells: ["Connectivity Standards Alliance", "Native cross-vendor smart-home protocol", "Growing rapidly; cross-vendor compatibility"] },
            ]}
          />

          <FixCallout>
            <strong>Integration use cases:</strong> setpoint adjustments via voice; geofencing (auto setback when away); occupancy-based scheduling; integration with smart lock for setpoint changes when door opens; integration with energy monitoring for whole-home dashboard; automated alerts on equipment failures. Avoid over-integration: trigger chains with 5+ dependencies often produce unexpected behavior and are hard to debug.
          </FixCallout>
        </section>

        {/* SECTION 09 — Demand response */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Utility demand response programs
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Demand response (DR) programs pay homeowners for allowing the utility to reduce HVAC capacity during grid stress events. Typical structure:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Event frequency:</strong> 4-12 events per year, usually summer afternoons (highest grid stress).</li>
            <li><strong>Event duration:</strong> 2-4 hours typical.</li>
            <li><strong>Event impact:</strong> setpoint adjusted 3-5°F (warmer in summer) for the event duration.</li>
            <li><strong>Compensation:</strong> $20-100 annual enrollment incentive plus per-event credit (typically $1-5 per event).</li>
            <li><strong>Override option:</strong> participants can override events on a per-event basis (typically with loss of that event&apos;s incentive).</li>
            <li><strong>Required equipment:</strong> smart thermostat with utility demand-response capability (most current Ecobee, Nest, Honeywell models). CTA-2045 enables equipment-level DR beyond thermostat.</li>
          </ul>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Major US programs include: Texas (ERCOT-region utilities like Oncor, CenterPoint); California (CAISO-region utilities like PG&amp;E, SCE, SDG&amp;E with Critical Peak Pricing + Smart Climate programs); New England ISO + PJM regions (various utilities). State-specific availability — check your utility&apos;s smart thermostat or demand response program page.
          </p>
        </section>

        {/* SECTION 10 — Wiring */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Wiring + installation considerations
          </h2>

          <ComparisonTable
            headers={["Wire / terminal", "Function", "Required for"]}
            rows={[
              { label: "R (red)", cells: ["24V hot from transformer", "All thermostats"] },
              { label: "C (common)", cells: ["24V return — provides continuous power to smart thermostat", "Smart thermostats with displays / WiFi; some basic do not need"] },
              { label: "W (white)", cells: ["Heating call (1st stage gas / electric heat)", "Heating equipment"] },
              { label: "W2 / Aux / E", cells: ["Auxiliary or 2nd-stage heat / emergency heat", "Two-stage heat or heat pump with aux"] },
              { label: "Y (yellow)", cells: ["Cooling call (1st stage)", "Cooling equipment + heat pumps"] },
              { label: "Y2", cells: ["2nd stage cooling", "Two-stage cooling"] },
              { label: "G (green)", cells: ["Fan/blower call", "All equipment with separate fan control"] },
              { label: "O (orange) / B (blue)", cells: ["Heat pump reversing valve (energized in cooling [O] or heating [B] depending on equipment)", "Heat pumps"] },
              { label: "Proprietary 2-4 wire", cells: ["Communicating protocol (Carrier ABCD, Trane Comfortlink, Lennox iComfort)", "Variable-capacity equipment requiring communicating thermostat"] },
            ]}
          />

          <KeyInsight tone="amber" title="The C-wire problem">
            Older homes without a C wire (common in 1980s-90s construction) need to power smart thermostats somehow. Options: (1) Run a new C wire from the air handler — best long-term solution. (2) Install a Power Extender Kit (Ecobee includes one; Venstar, Lux, others sell) — uses fan wire as alternative C. (3) Choose a thermostat that doesn&apos;t require C (Mysa baseboard) — limited to specific models. (4) Use a battery-powered thermostat — limited smart features. For a $200-300 investment in the C-wire-required smart thermostat, running new control wire is usually worth the time.
          </KeyInsight>
        </section>

        {/* SECTION 11 — Commissioning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Commissioning + programming
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Controls commissioning is part of the broader HVAC commissioning process (see our <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link>). Specific items:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Verify wiring + power.</strong> All thermostat wires terminated correctly; C wire functional (or alternate power source); air handler power on; outdoor unit disconnect on.</li>
            <li><strong>Verify equipment type recognition.</strong> Thermostat configured for the correct equipment type (heat pump vs straight AC, single-stage vs multi-stage, variable-capacity vs PSC blower).</li>
            <li><strong>Set balance point + aux heat lockout (heat pumps).</strong> Per equipment manufacturer specification; typically 30-35°F balance point for cold-climate HP.</li>
            <li><strong>Set compressor lockout (heat pumps).</strong> Outdoor temperature below which heat pump can&apos;t operate; below this, aux heat only.</li>
            <li><strong>Set staging differential.</strong> Multi-stage equipment: temperature drop below setpoint that triggers next stage activation.</li>
            <li><strong>Configure dehumidify mode (if applicable).</strong> RH threshold above which AC runs at lower fan speed for more latent removal.</li>
            <li><strong>Set schedule + setbacks.</strong> Daily schedule with appropriate setback temperatures during unoccupied or sleep periods.</li>
            <li><strong>Configure smart-home + utility integration.</strong> WiFi setup, smart-home platform pairing, demand response enrollment if available.</li>
            <li><strong>Verify zone controller commissioning (if zoned).</strong> Each zone&apos;s thermostat properly communicating; dampers operating correctly; bypass damper functional.</li>
            <li><strong>Document configuration.</strong> Save all settings to commissioning record; provide to homeowner.</li>
          </ol>

          <FixCallout>
            <strong>The most common commissioning failure</strong> is &quot;defaults left in place&quot; — installer powers up the thermostat, performs a basic heat/cool test, and walks away without setting balance point, schedule, or smart-home integration. Symptom: thermostat &quot;works&quot; (turns equipment on and off) but at default settings that produce suboptimal efficiency and comfort. Fix: explicit commissioning checklist that requires installer to set + verify every relevant parameter.
          </FixCallout>
        </section>

        {/* SECTION 12 — Common failures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Common control system failures
          </h2>

          <TechSection icon="problem" tone="amber" title="Failure 1 — Aux heat strips active at all heating temperatures">
            Heat pump installed; thermostat aux heat lockout not configured. Aux activates on every heat call regardless of outdoor temperature. Heating bills 2-3× expected. Fix: configure thermostat aux heat lockout to balance point (typically 30-35°F for cold-climate HP). 5-minute fix; saves $400-1,200/year.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 2 — Missing C wire for smart thermostat">
            Smart thermostat installed in older home without C wire. Thermostat dies after few hours (battery drained); display flickers; WiFi connection drops. Fix: run new C wire from air handler (preferred); install power extender kit; or switch to thermostat that doesn&apos;t need C.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 3 — Thermostat near supply register">
            Thermostat located adjacent to a supply register reads recent supply air temp rather than room temp. Symptom: thermostat reads &quot;satisfied&quot; quickly; system short cycles; actual room temp drifts wider than thermostat reading suggests. Fix: relocate thermostat 4-6 ft from any register, away from direct sun, on interior wall.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 4 — Programmable thermostat in 'Hold'">
            Programmable thermostat configured with schedule + setback, but user pressed &quot;Hold&quot; button thinking it would temporarily override — actually disabled the schedule permanently. Symptom: no setback occurs; energy bills higher than expected. Fix: press &quot;Run Schedule&quot; or equivalent to re-enable the program. Educate user on the difference between hold (permanent override) and temporary hold (until next scheduled change).
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 5 — Zoning dampers stuck open">
            Multi-zone system installed but commissioned with all dampers default-open and never adjusted. Symptom: no actual zoning happens; all zones get same airflow regardless of demand. Fix: zone controller commissioning; per-zone damper position verification; ensure controller is actually responding to per-zone calls.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 6 — Variable-capacity equipment with non-communicating thermostat">
            Carrier Infinity / Trane XV / Lennox SLP / Mitsubishi Hyper-Heat installed with generic Ecobee or Nest thermostat. Equipment can only operate at full capacity (on/off) because thermostat doesn&apos;t send modulation signals. Lost the variable-capacity efficiency benefit. Fix: install manufacturer&apos;s communicating thermostat (Infinity, ComfortLink II, iComfort, kumo, etc.).
          </TechSection>
        </section>

        {/* SECTION 13 — Future trends */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Future trends — AI, Matter, grid-interactive HVAC
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Three trends shaping HVAC controls through 2030:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Matter as the unifying smart-home protocol.</strong> Launched 2022 by Connectivity Standards Alliance; replaces fragmented Zigbee + Z-Wave + WiFi + Thread silos with cross-vendor compatibility. Most new smart thermostats add Matter support; existing devices add Matter via bridges. By 2027 expect Matter to be the default residential HVAC + smart home protocol.</li>
            <li><strong>AI-driven HVAC control.</strong> Beyond &quot;learning&quot; thermostats (Nest 2011) toward sophisticated AI models that incorporate weather forecasts, occupancy patterns, electricity pricing, and grid demand to optimize HVAC operation in real-time. Major utilities are deploying AI-based demand response that produces meaningful peak shaving without occupant discomfort. By 2030 expect AI optimization to be a standard feature on premium smart thermostats.</li>
            <li><strong>Grid-interactive HVAC (CTA-2045 + similar).</strong> HVAC equipment that responds directly to utility signals beyond thermostat-only programs. CTA-2045 (Modular Communications Interface for Energy Management) provides equipment-level demand response. As renewable energy penetration grows, HVAC&apos;s role in grid flexibility becomes more valuable — homeowners may receive substantial credits for allowing utility-managed HVAC operation during grid stress.</li>
          </ul>
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
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
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
              <strong>ASHRAE Standards:</strong> ANSI/ASHRAE Standard 135-2020, BACnet — A Data Communication Protocol for Building Automation and Control Networks. ASHRAE Standard 90.1-2022 — Energy Standard for Buildings (automatic controls requirements). ASHRAE Guideline 13-2020, Specifying Building Automation Systems. ASHRAE Guideline 36-2021, High-Performance Sequences of Operation for HVAC Systems.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Energy Conservation Code (IECC) 2021, Section R403.1 (thermostat requirements). California Title 24 Part 6 — Joint Appendix 5 (thermostat compliance). ASHRAE 90.1 commercial controls requirements.
            </p>
            <p className="mt-3">
              <strong>Protocol standards:</strong> Modbus Application Protocol Specification V1.1b3 (Modbus.org). KNX Association ISO/IEC 14543-3 (KNX standards). Matter specification (Connectivity Standards Alliance, launched 2022). Zigbee Alliance specification. Z-Wave Alliance specification. Thread Group specification. LonWorks / LonTalk ISO/IEC 14908. OPC Foundation OPC UA specification.
            </p>
            <p className="mt-3">
              <strong>Demand response standards:</strong> CTA-2045 (formerly CEA-2045), Modular Communications Interface for Energy Management — Consumer Technology Association. OpenADR (Open Automated Demand Response) Alliance specifications. EPA ENERGY STAR Smart Thermostat criteria.
            </p>
            <p className="mt-3">
              <strong>Equipment + product standards:</strong> ENERGY STAR Smart Thermostats Program Requirements (energystar.gov). AHRI Guideline 14 (Industrial Buildings) for commercial controls. UL 60730 (Automatic Electrical Controls for Household and Similar Use). NIST Cybersecurity Framework for connected device security.
            </p>
            <p className="mt-3">
              <strong>Major vendor documentation:</strong> Manufacturer installation manuals for Ecobee, Nest (Google), Honeywell Home (Resideo), Carrier (Infinity), Trane (XL/Comfortlink), Lennox (iComfort/SLP), Mitsubishi Electric (kumo cloud, m-NET), Daikin (One+), Mysa, Sensibo, Johnson Controls (Metasys), Honeywell (EBI), Schneider Electric (EcoStruxure), Tridium (Niagara Framework), Trane (Tracer SC+), Carrier (Automated Logic WebCTRL).
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific contractor recommendations (use ACCA contractor directory at accaservice.com; HERS rater directory at resnet.us; NATE certified technician directory at natex.org). Specific product pricing (changes annually; check vendor sites + ENERGY STAR Most Efficient list). Specific demand response program enrollment details (varies by utility; check your utility&apos;s smart thermostat or DR program page). Commercial BAS specification + integration (consult professional engineer with controls experience; complex projects use specifier + integrator separately).
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
            <Link href="/hvac-system-design-guide/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><BookOpen className="h-4 w-4" /> System Design Guide (parent)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Controls is Step 7 in the design cascade — full context here.</p>
            </Link>
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Sun className="h-4 w-4 text-blue-600" /> Energy Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2 + heat pump economics; controls configuration affects realized SEER.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Verify thermostat + zoning + balance point at install.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Annual thermostat calibration + control verification.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Diagnostic decision trees including thermostat-related problems.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J — informs control + zoning decisions.</p>
            </Link>
            <Link href="/hvac-building-automation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Building Automation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Commercial BMS deep dive — Guideline 36 + cybersecurity + RFP methodology.</p>
            </Link>
            <Link href="/hvac-energy-management-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Energy Management Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Operational management of BAS — FDD, M&V, RCx, Building Performance Standards.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Activity, Wind, ListChecks, Thermometer, Zap, Snowflake, ShieldCheck, Lookups, Panel, ServiceProblem, VerdictBanner];
