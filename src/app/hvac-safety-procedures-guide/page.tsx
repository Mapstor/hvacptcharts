import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Wrench, Flame, Zap, Wind, Thermometer, Snowflake, Droplet } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-safety-procedures-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Safety Procedures Guide — Electrical, Refrigerant, Gas, Hot Work, A2L Handling, and PPE Requirements",
  description:
    "Complete HVAC safety procedures guide: OSHA 29 CFR 1910 framework, lockout/tagout (1910.147), electrical safety + arc flash + PPE per NFPA 70E, refrigerant safety (high pressure + asphyxiation + A2L flammability per ASHRAE 15 + EPA Section 608), gas + carbon monoxide safety per NFPA 54, hot work brazing/cutting (1910.252), working at heights + ladders, permit-required confined spaces (1910.146), PPE requirements (1910.132-138), consumer safety (CO alarm placement + gas leak response), emergency procedures, training + certification. Sourced from OSHA, NFPA, ASHRAE, EPA, UL.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Safety Procedures Guide — Complete OSHA + EPA + NFPA + ASHRAE Compliance",
    description: "Electrical + refrigerant + gas + hot work + A2L + PPE + consumer safety. Sourced from OSHA, NFPA, ASHRAE, EPA throughout.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Safety Procedures Guide — OSHA + EPA + NFPA Sourced",
    description: "Complete safety methodology for HVAC service work.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "Is Lockout/Tagout (LOTO) required for HVAC service?",
    a: "Yes for commercial service work; strongly recommended for residential. OSHA 29 CFR 1910.147 (Control of Hazardous Energy / Lockout/Tagout) requires energy isolation before service on equipment that could energize unexpectedly. For commercial HVAC: technicians must perform LOTO before working on energized equipment per OSHA. For residential: not explicitly OSHA-required (homeowners aren't OSHA workers), but the same principle applies — disconnect at the breaker AND verify with non-contact voltage tester before touching internals. Capacitors hold 240V charge even after power-off; discharge with 20kΩ resistor or insulated screwdriver before handling. LOTO procedure: (1) Notify affected workers; (2) Shut off equipment normally; (3) Isolate energy at the source (breaker, disconnect); (4) Apply lock + tag to the disconnect; (5) Verify de-energization with appropriate test equipment; (6) Perform work; (7) After work, remove tools and reverse the LOTO procedure. Multi-employer commercial sites require coordinated LOTO procedures per OSHA 1910.147(f)(4).",
  },
  {
    q: "What's the OSHA permissible exposure limit (PEL) for refrigerants?",
    a: "Varies by refrigerant. OSHA 29 CFR 1910.1000 sets Permissible Exposure Limits (PELs) for occupational chemical exposure. Common HVAC refrigerants: R-22 PEL 1000 ppm (8-hour TWA); R-134a not formally PEL-regulated but typically held to 1000 ppm AEL per manufacturer; R-410A typical 1000 ppm AEL; A2L refrigerants (R-32, R-454B) similar 1000 ppm AEL range. The bigger immediate concern is OXYGEN DISPLACEMENT — refrigerants are denser than air and can accumulate in low-lying spaces (basements, equipment rooms, pits), displacing oxygen and causing asphyxiation. OSHA 29 CFR 1910.146 (Permit-Required Confined Spaces) covers spaces where this is a meaningful hazard. ASHRAE Standard 15 also specifies refrigerant concentration limits per refrigerant type for safety in occupied spaces (Refrigerant Concentration Limit, RCL). For A2L refrigerants, the additional concern is flammability concentration limits — refrigerant at certain concentrations + ignition source = fire/deflagration risk. Manufacturer SDS (Safety Data Sheet) and ASHRAE 34 provide specific limits per refrigerant.",
  },
  {
    q: "What PPE is required for HVAC service work?",
    a: "Per OSHA 29 CFR 1910 Subpart I (1910.132-138) Personal Protective Equipment requirements: (1) Safety glasses (ANSI Z87.1) — required for any service work involving high-pressure refrigerant, brazing, electrical, or projectile risk. (2) Hearing protection — required if noise exposure exceeds OSHA action level (85 dBA TWA per 1910.95). (3) Hand protection — leather/heat-resistant gloves for brazing; cut-resistant for sheet-metal handling; insulated gloves for electrical work above 50V. (4) Foot protection — steel/composite-toe boots per ANSI Z41 for jobs with falling-object hazard. (5) Respiratory protection — when refrigerant exposure could exceed PEL (rare in normal service); N95 for dusty work; SCBA for ammonia leaks. (6) High-visibility clothing — for road-side service or construction sites per ANSI 107. (7) Arc-rated PPE per NFPA 70E for electrical work above certain incident energy levels. (8) Fall protection — harness + lanyard for roof work above 4 ft per OSHA 1910.28. Specific job hazard analysis (JHA) determines PPE per task. ACCA QM Standard 6 references additional PPE requirements for commercial maintenance.",
  },
  {
    q: "What are the A2L refrigerant safe-work practices?",
    a: "A2L refrigerants (R-32, R-454B, R-454C, R-455A, R-1234yf) are mildly flammable per ASHRAE Standard 34 — auto-ignition 700-1000°F, burning velocity ≤10 cm/s. Safe-work practices per AHRI Safe Refrigerant Transition guidance + ASHRAE Standard 15 + manufacturer installation manuals: (1) UL-listed A2L-rated recovery equipment, leak detectors, and tools. (2) NO open flames during refrigerant-side service — recover refrigerant fully before any brazing or soldering work; ventilate area before introducing torch; verify atmosphere with combustible gas detector. (3) NO spark-producing electrical tools near the refrigerant circuit during work. (4) Ventilation in confined service spaces — basements, attics, equipment rooms; mechanical ventilation required for some installations per ASHRAE Standard 15. (5) Refrigerant concentration limit (RCL) per ASHRAE 15 — calculate room volume vs total refrigerant charge; large charges in small rooms may require ventilation or refrigerant relief. (6) A2L-trained technician — EPA Section 608 certification covers A2L recovery; some states are adding additional A2L-specific training. (7) Documentation — note A2L refrigerant + safety precautions on service ticket. (8) Customer education — A2L equipment requires informed homeowner awareness of cooking with open flame near indoor units (which is not typically a risk in residential, but worth noting).",
  },
  {
    q: "How do I place CO alarms correctly in my home?",
    a: "Per UL 2034 + IRC 2021 Section R315 + most state codes: install CO alarms on every habitable floor of a home with fuel-burning equipment (gas furnace, gas water heater, gas range, fireplace, attached garage). Best placement: (1) Within 10 feet of every bedroom (CO is a sleep-time hazard — occupants need alarm audible from bedrooms). (2) Within each sleeping area's hallway. (3) On every floor including basement (CO settles to lower levels in some conditions). (4) NEAR potential CO sources (gas furnace room, attached garage) but not directly above (cooking steam can cause nuisance alarms in kitchen). (5) At least 15 ft from cooking appliances to reduce nuisance alarms. (6) Following manufacturer's instructions for height — typically wall-mount at typical adult breathing height (5-6 ft). For battery-only alarms: replace batteries every 6 months (use daylight saving time changes as reminder). For hard-wired with battery backup: same battery replacement. Replace entire alarm every 5-10 years per manufacturer (CO sensors degrade over time). For commercial: NFPA 720 specifies more rigorous CO alarm requirements. Modern smart CO alarms (Nest Protect, First Alert OneLink) include WiFi + smart-home integration for remote notification.",
  },
  {
    q: "What should I do if I smell gas?",
    a: "Per ANSI Z21.13 + gas utility safety procedures: (1) DON'T use any electrical switches — including light switches, garage door openers, thermostats. Don't unplug or plug in anything. Any spark can ignite gas accumulation. (2) DON'T use phones inside the home — go outside or to a neighbor's. (3) DON'T smoke or use any open flame. (4) DON'T start vehicles inside an attached garage. (5) EVACUATE all occupants from the home. (6) LEAVE doors open behind you to vent the area. (7) Call the gas utility's emergency number FROM OUTSIDE — most utilities have 24-hour emergency response that's free for natural gas leak investigation. Call 911 if utility unreachable. (8) DON'T re-enter until the utility or fire department confirms the area is clear. Common sources of indoor gas leaks: gas range valves left partially open, water heater pilot light extinguished, gas line damage from renovation or earthquakes, gas appliance disconnections done improperly. After utility clears: have an HVAC + plumbing professional inspect for the leak source before turning gas back on.",
  },
  {
    q: "Is annual combustion analysis required for gas furnaces?",
    a: "Required by most local building codes and recommended by NFPA 54 + ANSI Z21.13 + ACCA Standard 4 + ASHRAE 180 for safety. Annual combustion analysis at the furnace flue verifies: (1) Carbon monoxide (CO) ≤100 ppm air-free — CO above this indicates incomplete combustion, possible heat exchanger crack, or insufficient draft. (2) Oxygen (O₂) ≤4% — higher indicates excess combustion air, draft problem, or gas valve underpressure. (3) Draft pressure correct per furnace specification (typically -0.02 to -0.08 in.w.c.). (4) Flame appearance uniform blue + slight yellow tip across all burners. (5) Visual heat exchanger inspection for cracks. The hazard: cracked heat exchangers can leak CO into the supply air stream, exposing occupants over days/weeks without obvious symptoms until acute exposure causes incapacitation. CO is colorless + odorless; CO alarms are required complement but combustion analysis catches problems before ambient levels trigger alarms. Equipment: combustion analyzer ($300-1,500) like Bacharach, Testo, Fyrite, Fieldpiece. See our maintenance guide section 9.",
  },
  {
    q: "What training do I need to work on HVAC equipment commercially?",
    a: "Multiple overlapping requirements depending on activity. (1) EPA Section 608 certification — required by federal law (40 CFR Part 82 Subpart F) for any refrigerant work; one-time certification, no renewal as of 2026. Type II or Universal covers high-pressure residential + commercial. See our refrigerant recovery guide for the certification framework. (2) OSHA 10 or OSHA 30 training — voluntary federal worker safety; required by some commercial sites and union contracts. (3) State HVAC licensing — varies by state; some require apprenticeship + exam + bond. Many states require commercial HVAC technicians to hold a state license. (4) NATE certification — voluntary industry credential from North American Technician Excellence; signals competence beyond state minimums. (5) Manufacturer training — for specific equipment lines (Carrier, Trane, Lennox, Mitsubishi, etc.); often required for warranty support. (6) ACCA QI Specialist — for Quality Installation contractor certification. (7) Combustion analysis training (Fyrite, Bacharach, Testo equipment manufacturer training). (8) A2L specific training (increasingly required as new equipment enters market). For HVAC business owners: also OSHA 1910 General Industry compliance training + LOTO program + written safety plan + employee safety training records.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Safety Procedures Guide — Electrical, Refrigerant, Gas, Hot Work, A2L Handling, and PPE",
      description:
        "Complete HVAC safety methodology covering OSHA framework, LOTO + arc flash + PPE, refrigerant safety (pressure + asphyxiation + A2L/A3 flammability), gas + CO safety, hot work, working at heights, confined space, consumer safety, training requirements.",
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
        { "@type": "Thing", name: "HVAC safety" },
        { "@type": "Thing", name: "OSHA HVAC compliance" },
        { "@type": "Thing", name: "Lockout/Tagout" },
        { "@type": "Thing", name: "A2L refrigerant safety" },
        { "@type": "Thing", name: "Carbon monoxide safety" },
      ],
      keywords: [
        "hvac safety",
        "osha hvac",
        "lockout tagout",
        "a2l safe handling",
        "epa 608 safety",
        "co alarm placement",
        "hvac ppe",
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
        { "@type": "ListItem", position: 3, name: "HVAC Safety Procedures Guide" },
      ],
    },
  ];
}

export default function HvacSafetyProceduresGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Safety Procedures Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Safety Procedures Guide — Electrical, Refrigerant, Gas, Hot Work, A2L Handling, and PPE Requirements
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            Complete safety procedures reference for HVAC service work: OSHA 29 CFR 1910 framework, lockout/tagout per 1910.147, electrical safety + arc flash + PPE per NFPA 70E, refrigerant safety covering high pressure + asphyxiation + A2L/A3 flammability per ASHRAE Standard 15 + EPA Section 608, gas + carbon monoxide safety per NFPA 54, hot work brazing/cutting per 1910.252, working at heights + ladders per 1910.27/28, permit-required confined spaces per 1910.146, complete PPE requirements per 1910.132-138, consumer-facing safety (CO alarm placement per UL 2034, gas leak response, electrical disconnect procedures), emergency response procedures, and training + certification requirements (EPA 608, state licensing, NATE, A2L-specific). Sourced throughout from OSHA, NFPA, ASHRAE, EPA, and UL primary documents.
          </p>

          <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50/60 p-4 dark:border-amber-700/60 dark:bg-amber-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Educational reference, not substitute for training.</strong> This guide summarizes published OSHA, EPA, NFPA, and ASHRAE safety requirements but does not replace certified safety training. For HVAC technicians: complete EPA Section 608 certification (federal law); pursue NATE certification + manufacturer-specific training. For HVAC business owners: maintain OSHA-compliant written safety program per 29 CFR 1910 + training records. For consumers: follow alarm manufacturer instructions, utility emergency procedures, and call qualified professionals — don&apos;t attempt work covered in the &quot;professional only&quot; sections below.
            </p>
          </div>
        </header>

        {/* SECTION 01 — Safety framework */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The HVAC safety framework — OSHA, NFPA, ASHRAE, EPA
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HVAC service work intersects multiple regulatory frameworks. Understanding which standard applies to which hazard is the foundation of compliant safe-work practice:
          </p>

          <ComparisonTable
            headers={["Hazard category", "Primary standard", "Authority", "Applies to"]}
            rows={[
              { label: "Worker safety (general industry)", cells: ["OSHA 29 CFR 1910", "Federal OSHA", "All commercial HVAC service"] },
              { label: "Worker safety (construction)", cells: ["OSHA 29 CFR 1926", "Federal OSHA", "HVAC install on construction sites"] },
              { label: "Lockout/Tagout", cells: ["OSHA 29 CFR 1910.147", "Federal OSHA", "Commercial service of energized equipment"] },
              { label: "Electrical safety in workplace", cells: ["NFPA 70E + OSHA 1910 Subpart S", "NFPA + OSHA", "Commercial electrical work"] },
              { label: "Electrical installation (NEC)", cells: ["NFPA 70 (National Electrical Code)", "NFPA", "Installation conforming to building code"] },
              { label: "Gas safety + combustion", cells: ["NFPA 54 (National Fuel Gas Code)", "NFPA", "Gas equipment installation + service"] },
              { label: "Refrigerant safety (US federal)", cells: ["EPA Section 608 (40 CFR Part 82F)", "Federal EPA", "All refrigerant handling"] },
              { label: "Refrigeration system safety", cells: ["ASHRAE Standard 15", "ASHRAE / IIAR", "Refrigeration system design + operation"] },
              { label: "Refrigerant classification (safety)", cells: ["ASHRAE Standard 34", "ASHRAE", "All refrigerant identification + handling"] },
              { label: "Hot work (brazing, welding, cutting)", cells: ["OSHA 29 CFR 1910.252 + NFPA 51B", "OSHA + NFPA", "All flame-based work"] },
              { label: "Working at heights", cells: ["OSHA 29 CFR 1910.27 + 1910.28", "Federal OSHA", "Rooftop service, ladders, scaffolding"] },
              { label: "Confined space entry", cells: ["OSHA 29 CFR 1910.146", "Federal OSHA", "Permit-required confined space service"] },
              { label: "PPE requirements", cells: ["OSHA 29 CFR 1910.132-138", "Federal OSHA", "All service work — type per JHA"] },
              { label: "CO alarms", cells: ["UL 2034 + IRC R315", "UL + ICC", "Residential gas-burning equipment areas"] },
              { label: "Hazard communication", cells: ["OSHA 29 CFR 1910.1200", "Federal OSHA", "Chemical handling + Safety Data Sheets"] },
            ]}
          />

          <KeyInsight tone="blue" title="The compliance reality">
            Most HVAC technicians focus on EPA Section 608 (because it's directly cited in federal refrigerant law with substantial penalties) and the most obvious physical hazards (electrical shock, high-pressure refrigerant). The under-attended areas: hot work permits for brazing in commercial settings (often skipped, OSHA-required), confined space entry permits for service in attics or basements where oxygen displacement is possible (often skipped, OSHA-required), and combustion analysis for gas equipment (often skipped, ANSI Z21.13 + NFPA 54 referenced). For HVAC business owners, maintaining a written safety program per OSHA 1910 + employee training records is the foundation of compliance.
          </KeyInsight>
        </section>

        {/* SECTION 02 — Electrical safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Electrical safety — LOTO, arc flash, PPE
          </h2>

          <TechSection icon="problem" tone="amber" title="Lockout/Tagout (LOTO) per OSHA 29 CFR 1910.147">
            <strong>Required procedure for any commercial work on equipment that could energize unexpectedly:</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Notify all affected workers + equipment users.</li>
              <li>Shut off equipment via normal stopping procedure (thermostat off; user-controlled disconnect).</li>
              <li>Isolate energy at the source — the disconnect switch at the equipment AND the breaker at the main panel.</li>
              <li>Apply lockout device (padlock + multi-lock hasp if multiple workers); attach warning tag with worker name + date.</li>
              <li>Verify de-energization — test with non-contact voltage tester or multimeter at the equipment terminals. Cycle equipment controls to confirm no response.</li>
              <li>Discharge stored energy — capacitors retain charge for minutes after power-off; use 20kΩ resistor or insulated screwdriver across terminals to discharge.</li>
              <li>Perform service work.</li>
              <li>After work: remove tools, account for all workers, remove lockout devices in reverse order of application.</li>
              <li>Notify workers + equipment users that equipment is being re-energized.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Arc flash + electrical PPE per NFPA 70E">
            For commercial work near energized equipment above 50V, NFPA 70E (Standard for Electrical Safety in the Workplace) defines arc flash protection requirements. Hazard categories 0-4 based on calculated incident energy (cal/cm²); PPE level scales with category. Typical HVAC: most residential service work is Category 0-1 (cotton long-sleeve + safety glasses). Commercial work on switchgear above 480V may require Category 2-4 (arc-rated coveralls + face shield + insulated gloves). For typical residential disconnect work: insulated screwdriver + safety glasses sufficient. For service work on energized commercial equipment: full NFPA 70E PPE per arc flash boundary calculation. Most HVAC business owners hire a qualified electrician for any work at switchgear above 480V.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Common electrical hazards">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Capacitor shock:</strong> capacitors store 240V for minutes after power-off. Discharge before handling. Two people have died in recent years from capacitor shock during HVAC service.</li>
              <li><strong>3-phase commercial:</strong> 480V phase-to-phase = lethal. Use insulated tools. Verify single-phase vs 3-phase before working.</li>
              <li><strong>Ground fault:</strong> equipment grounding is required by NEC; ground faults cause shock. Verify ground continuity during service.</li>
              <li><strong>Wet conditions:</strong> never work on energized equipment with wet hands or in standing water. Use GFCI protection on temporary cords.</li>
              <li><strong>Working alone:</strong> commercial service in remote locations — have check-in procedure; some employers require buddy system for high-voltage work.</li>
            </ul>
          </TechSection>
        </section>

        {/* SECTION 03 — Refrigerant safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Refrigerant safety — pressure, asphyxiation, A2L/A3 flammability
          </h2>

          <ComparisonTable
            headers={["Hazard", "Safety class affected", "Mechanism", "Mitigation"]}
            rows={[
              { label: "High-pressure rupture", cells: ["All refrigerants", "Liquid + high pressure (R-410A 250-500 PSIG; R-744 1000-1500 PSIG) — hose blow-out causes projectile + cryogenic burn from rapid expansion", "Pressure-rated hoses; safety glasses; never trap liquid in a closed line"] },
              { label: "Frostbite from rapid expansion", cells: ["All refrigerants", "Liquid refrigerant at high pressure rapidly evaporates upon release, dropping temperature to -40°F+ — instant frostbite of skin", "Don't release liquid refrigerant onto skin; gloves during line work"] },
              { label: "Oxygen displacement / asphyxiation", cells: ["All refrigerants (especially heavy ones — R-744, R-1234yf)", "Refrigerant denser than air accumulates in low spaces (basements, equipment pits); displaces oxygen to suffocation level", "Ventilation in confined spaces; oxygen monitor for service in pits; ASHRAE 15 Refrigerant Concentration Limit calculation"] },
              { label: "Flammability (A2L mild)", cells: ["A2L: R-32, R-454B, R-454C, R-455A, R-1234yf, R-1234ze", "Auto-ignition 700-1000°F; burning velocity ≤10 cm/s; significant accumulation + ignition source = deflagration", "UL-listed A2L equipment; no open flames during refrigerant work; ventilation; A2L-trained technicians"] },
              { label: "Flammability (A3 full)", cells: ["A3: R-290, R-600a, R-1270 (hydrocarbons)", "Fully flammable; no upper concentration limit", "Specialized A3 equipment; IEC 60335-2-89 charge limits (typically &lt;150 g residential); A3-trained technicians"] },
              { label: "Toxicity (B class)", cells: ["B: R-717 (ammonia), R-123 (some), others", "Toxic effects from inhalation; acute exposure causes respiratory inflammation; chronic exposure damages organs", "Industrial-grade ventilation; SCBA for ammonia leaks; OSHA PEL compliance + manufacturer SDS"] },
              { label: "Stratospheric ozone depletion", cells: ["CFCs + HCFCs (legacy)", "Damages stratospheric ozone layer; Montreal Protocol phase-out", "EPA Section 608 recovery mandatory; reclaim/destruction only legal disposition"] },
              { label: "Climate forcing (high GWP)", cells: ["HFCs (R-410A, R-404A, etc.)", "100-3,900 GWP100; AIM Act phase-down regulates", "EPA Section 608 + AIM Act compliance; reclamation; transition to A2L/HFOs/naturals"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For full procedural detail on A2L safe work, see our <Link href="/hvac-refrigerant-recovery-guide/" className="underline">refrigerant recovery guide</Link>. For refrigerant safety classification, see <Link href="/refrigerant-safety-classifications/" className="underline">ASHRAE 34 classifications</Link>.
          </p>
        </section>

        {/* SECTION 04 — Gas + CO safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Gas + carbon monoxide safety
          </h2>

          <TechSection icon="problem" tone="amber" title="Natural gas + propane leak response">
            <strong>If you smell gas (or your CO alarm sounds):</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>DO NOT use any electrical switch (light switch, garage door, thermostat) — sparks can ignite gas accumulation.</li>
              <li>DO NOT use cell phone inside — go outside first.</li>
              <li>DO NOT smoke or use any open flame.</li>
              <li>EVACUATE all occupants from the building.</li>
              <li>LEAVE doors open behind you to vent the area.</li>
              <li>Call gas utility&apos;s 24-hour emergency number FROM OUTSIDE (most utilities respond free for natural gas leak investigation). Call 911 if utility unreachable.</li>
              <li>DO NOT re-enter until utility or fire department confirms area is safe.</li>
              <li>After clearance: have HVAC + plumbing professional investigate leak source before reopening gas line.</li>
            </ol>
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Carbon monoxide (CO) — the silent killer">
            CO is colorless, odorless, tasteless gas produced by incomplete combustion of any fuel. CO poisoning symptoms: headache, dizziness, confusion, nausea, fatigue (mimics flu). Acute high exposure causes unconsciousness + death. Chronic low exposure causes cognitive symptoms easily attributed to other causes — many CO poisonings are misdiagnosed.
            <br /><br />
            <strong>Sources in residential:</strong> cracked heat exchanger in gas furnace (CO leaks into supply air); attached garage with car idling; gas water heater backdrafting; gas range without proper exhaust; fireplace with poor draft.
            <br /><br />
            <strong>Mitigation:</strong> CO alarms required on every habitable floor per UL 2034 + IRC R315. Annual combustion analysis at furnace (CO ≤100 ppm at flue per ASHRAE 180). Heat exchanger inspection per ANSI Z21.13. Never operate vehicles in attached garages. Never use unvented fuel-burning equipment indoors (kerosene heaters, gas grills, etc.).
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Combustion analysis at the flue (annual maintenance)">
            Per ASHRAE/ACCA Standard 180 + ANSI Z21.13 + NFPA 54: annual combustion analyzer measurement at the furnace flue verifies safety. Acceptance criteria: CO ≤100 ppm air-free; O₂ ≤4%; draft -0.02 to -0.08 in.w.c. negative; flame uniform blue. CO above 100 ppm indicates incomplete combustion, possible heat exchanger crack (mandatory replacement), or insufficient draft. See our <Link href="/hvac-maintenance-service-guide/" className="underline">maintenance guide</Link> Section 9.
          </TechSection>
        </section>

        {/* SECTION 05 — Hot work */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Hot work — brazing, soldering, cutting per OSHA 1910.252
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HVAC service involves frequent brazing for refrigerant line work + soldering for control wiring + occasional cutting. OSHA 29 CFR 1910.252 (Welding, Cutting, and Brazing) + NFPA 51B (Standard for Fire Prevention During Welding, Cutting, and Other Hot Work) define required procedures.
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Hot work permit (commercial sites).</strong> Many commercial properties require a written hot work permit before any flame-based work. Some HVAC contractors maintain blanket permits with regular customers; others require per-job permits.</li>
            <li><strong>Fire watch (commercial / per permit).</strong> Designated person observes for 30+ minutes after hot work completion to detect smoldering ignition.</li>
            <li><strong>Combustible clearance.</strong> Move combustibles within 35 ft of hot work area OR cover with fire-resistant blankets. Common HVAC oversight: not protecting insulation, lumber, or cardboard near brazing area.</li>
            <li><strong>A2L refrigerant clearance.</strong> For A2L refrigerant systems (R-32, R-454B): fully recover refrigerant before brazing; ventilate area; verify no A2L atmosphere with combustible gas detector. NEVER braze with A2L refrigerant in the lines.</li>
            <li><strong>Fire extinguisher present.</strong> Class ABC dry chemical (5 lb minimum) within reach. Some hot work specifications require multiple extinguishers for larger jobs.</li>
            <li><strong>Eye protection.</strong> Brazing shade #5 minimum welding lens; appropriate for the work intensity.</li>
            <li><strong>Hand + body protection.</strong> Leather brazing gloves; long-sleeve cotton or flame-resistant shirt; no synthetic fabrics (melt onto skin).</li>
            <li><strong>Ventilation for flux fumes.</strong> Some brazing fluxes produce toxic fumes (cadmium-containing alloys); use mechanical ventilation or respiratory protection per OSHA 1910.252(c).</li>
            <li><strong>Nitrogen purge during brazing.</strong> Flow nitrogen through refrigerant lines during brazing to prevent oxidation scale from forming inside the line (which would later contaminate the refrigerant + clog the filter-drier). Industry best practice; not OSHA-required but professional standard.</li>
          </ol>

          <FixCallout>
            <strong>The A2L brazing risk:</strong> for new A2L equipment (R-32, R-454B and others), brazing with refrigerant in the lines creates fire/explosion risk. The procedure becomes: recover refrigerant fully; evacuate to verify no refrigerant remaining; ventilate; verify with combustible gas detector; perform brazing; pressure-test with nitrogen; evacuate; recharge with new refrigerant. Adds 30-60 minutes to typical service vs A1 refrigerant work, but eliminates the safety risk.
          </FixCallout>
        </section>

        {/* SECTION 06 — Working at heights */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Working at heights — ladders, roofs, fall protection
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HVAC commonly involves rooftop equipment service + attic-mounted equipment + 8+ ft access for furnaces and air handlers in elevated locations. OSHA 29 CFR 1910.27 (Scaffolds and Rope Descent Systems) + 1910.28 (Duty to Have Fall Protection) define worker protection requirements.
          </p>

          <ComparisonTable
            headers={["Activity", "Fall protection threshold", "Required protection"]}
            rows={[
              { label: "General industry working surfaces", cells: ["4 ft height per OSHA 1910.28", "Guardrails, safety nets, or personal fall arrest system"] },
              { label: "Construction work", cells: ["6 ft height per OSHA 1926.501", "Guardrails, safety nets, or personal fall arrest system"] },
              { label: "Ladder use", cells: ["Per 1910.23", "Ladder inspection; 3-point contact; weight rating compliance; portable ladder extends 3 ft above landing"] },
              { label: "Rooftop equipment service", cells: ["4 ft for general industry; 6 ft for construction", "Anchor point + harness + lanyard typical; OR guardrails on roof edges"] },
              { label: "Attic / crawlspace access", cells: ["Per 1910.146 confined space if applicable", "Ventilation; light; safe access; PPE per JHA"] },
            ]}
          />

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Ladder inspection.</strong> Visually inspect before each use: no cracked rails, broken rungs, missing feet, paint that could hide defects.</li>
            <li><strong>Ladder placement.</strong> 1:4 angle for extension ladders (1 ft out from wall for every 4 ft up). On stable ground or pad. Three-point contact during climbing (two hands + one foot, or two feet + one hand). Extension ladders 3 ft above landing point.</li>
            <li><strong>Roof anchor points.</strong> For rooftop work where falls are possible, install permanent anchor points (or use existing roof structure rated for fall arrest); attach 6 ft shock-absorbing lanyard.</li>
            <li><strong>Weather considerations.</strong> Wind, rain, ice, snow on roofs creates substantial slip + fall risk. Reschedule non-emergency work to safer conditions.</li>
          </ul>
        </section>

        {/* SECTION 07 — Confined space */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Confined space entry — OSHA 1910.146
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            OSHA 29 CFR 1910.146 defines &quot;permit-required confined space&quot; (PRCS): large enough for worker to enter; limited means of entry/exit; not designed for continuous occupancy; AND contains/could contain hazardous atmosphere, engulfment material, or recognized serious hazard. HVAC examples: equipment rooms below grade; mechanical equipment pits; large attics with limited ventilation; vault-style boiler rooms.
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>PRCS entry procedure (commercial):</strong>
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li>Hazard evaluation before entry — identify atmospheric, engulfment, or other hazards.</li>
            <li>Test atmosphere — oxygen (19.5-23.5%), combustible gas (&lt;10% LEL), toxic gas (per substance — refrigerant, ammonia, CO if combustion-related).</li>
            <li>Ventilation if needed — mechanical ventilation to keep atmosphere safe during entry.</li>
            <li>Entry permit — written documentation including atmospheric test results, ventilation plan, isolation of hazards, rescue plan.</li>
            <li>Attendant outside — observes the entrant; in continuous communication; ready to summon rescue.</li>
            <li>Rescue plan — non-entry rescue preferred (lifelines + retrieval system); entry rescue requires trained team.</li>
            <li>Continuous monitoring — atmospheric conditions monitored throughout entry.</li>
            <li>Cancel permit when work complete + space evacuated.</li>
          </ol>

          <FixCallout>
            <strong>Common PRCS oversight in residential:</strong> attic crawlspaces with refrigerant equipment + limited ventilation can technically qualify as PRCS if refrigerant could leak in significant quantity. The atmospheric hazard from refrigerant displacement in a confined attic during equipment work is real but rarely formally treated. Best practice: ventilate before entry; have helper outside; carry portable CO + combustible gas detector. For commercial work explicitly meeting PRCS criteria, the OSHA-required permit procedure applies.
          </FixCallout>
        </section>

        {/* SECTION 08 — PPE */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            PPE requirements per OSHA 1910.132-138
          </h2>

          <ComparisonTable
            headers={["PPE type", "OSHA citation", "When required", "Selection criteria"]}
            rows={[
              { label: "Eye + face protection", cells: ["1910.133", "Brazing, electrical work, high-pressure refrigerant, projectile hazard", "ANSI Z87.1 safety glasses; shade #5 brazing lens for brazing"] },
              { label: "Hearing protection", cells: ["1910.95", "Noise exposure exceeding 85 dBA TWA action level", "NRR-rated earplugs or earmuffs; sound level meter to verify"] },
              { label: "Head protection", cells: ["1910.135", "Falling-object hazard or low overhead clearance", "ANSI Z89.1 hardhat Type I or II"] },
              { label: "Hand protection", cells: ["1910.138", "Cut, burn, chemical, or electrical hazard", "Leather for sheet metal; heat-resistant for brazing; insulated for electrical"] },
              { label: "Foot protection", cells: ["1910.136", "Foot-impact, slip, or electrical hazard", "ANSI Z41 safety boots; EH-rated for electrical work"] },
              { label: "Respiratory protection", cells: ["1910.134", "Air contaminant above PEL; oxygen below 19.5%", "Respirator fit testing required; medical clearance; written program"] },
              { label: "High-visibility clothing", cells: ["1910 + ANSI 107", "Road-side work, construction sites, low-light", "ANSI 107 Class 2 or 3 per hazard"] },
              { label: "Arc-rated PPE", cells: ["NFPA 70E", "Electrical work above arc flash threshold", "Calculated per incident energy; Category 0-4 PPE"] },
              { label: "Fall protection harness", cells: ["1910.140", "Work above 4 ft general industry, 6 ft construction", "ANSI Z359; full body harness with shock-absorbing lanyard"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>Job Hazard Analysis (JHA):</strong> the OSHA-required process of identifying hazards present in a specific job + selecting appropriate PPE. JHA documentation is required by OSHA for commercial work + is a best practice for any HVAC contractor. Template JHAs are available from ACCA + NATE for common HVAC tasks.
          </p>
        </section>

        {/* SECTION 09 — Consumer safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Consumer safety — what homeowners should know
          </h2>

          <TechSection icon="insight" tone="blue" title="CO alarm placement (UL 2034 + IRC R315)">
            Install on every habitable floor; within 10 ft of every bedroom; in hallway near sleeping areas; on every floor including basement. At least 15 ft from cooking appliances to reduce nuisance alarms. Wall-mount at typical adult breathing height (5-6 ft). Replace battery every 6 months (use daylight saving time changes as reminder). Replace entire alarm every 5-10 years per manufacturer. Smart CO alarms (Nest Protect, First Alert OneLink) include WiFi + smart-home integration for remote notification.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="When to call a professional vs DIY">
            DIY safe: filter replacement; outdoor coil hose rinse; condensate drain check; thermostat replacement (basic); register obstruction check. Professional only: any refrigerant work (federal EPA Section 608 requirement); electrical work beyond changing a thermostat; gas equipment service; combustion analysis; heat exchanger inspection; A2L refrigerant systems. See our maintenance guide for the full DIY-vs-pro matrix.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Electrical disconnect before HVAC service">
            Before opening any HVAC equipment cover, disconnect power at the BREAKER (main electrical panel) AND verify zero voltage with a non-contact voltage tester. Don&apos;t rely on the equipment&apos;s own disconnect switch — it may not be open even if the lever appears off. Capacitors hold 240V for minutes after power-off; if you must handle internals, discharge with a 20kΩ resistor or insulated screwdriver across the capacitor terminals.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Gas leak response (covered in Section 04 above)">
            If you smell gas: don&apos;t use any electrical switch, evacuate the home, leave doors open, call gas utility from outside. Don&apos;t reenter until cleared. CO alarm: if it sounds, evacuate, call 911 + fire department from outside, don&apos;t reenter until cleared.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="A2L refrigerant safety in your home">
            New residential HVAC equipment installed after January 2025 typically uses A2L refrigerants (R-32, R-454B). These are mildly flammable per ASHRAE 34. For homeowners: no impact on normal HVAC operation; equipment is designed and tested for safe use with A2L. Best practice: don&apos;t do refrigerant-side work yourself (federal EPA Section 608 requirement); ensure service contractors are A2L-trained; respond to refrigerant leak indications (musty smell from supply registers, ice formation on indoor coil) by shutting off equipment + calling service. New A2L equipment may have refrigerant leak detectors as part of safety system.
          </TechSection>
        </section>

        {/* SECTION 10 — Emergency procedures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Emergency response procedures
          </h2>

          <ComparisonTable
            headers={["Emergency", "Immediate action", "Authorities to contact"]}
            rows={[
              { label: "Gas leak (smelled or detected)", cells: ["Don't use electrical switches; evacuate; leave doors open", "Gas utility 24-hour emergency line; 911 if utility unreachable"] },
              { label: "CO alarm sounding", cells: ["Evacuate; ventilate by opening doors; medical attention if symptomatic", "Fire department; gas utility for source identification"] },
              { label: "Refrigerant major leak (commercial)", cells: ["Evacuate area; ventilate; oxygen monitor before reentry", "EPA Section 608 reportable for large releases; fire department for A2L involvement"] },
              { label: "Electrical shock injury", cells: ["Don't touch victim if still in contact with source; turn off power first; perform CPR if needed", "911; manage workplace per OSHA injury reporting"] },
              { label: "Brazing fire", cells: ["Class ABC extinguisher; evacuate if uncontrolled", "911; fire department"] },
              { label: "Worker falls from height", cells: ["Don't move victim if back/neck injury suspected; stabilize", "911; OSHA-reportable per 1904.39 if hospitalization > 24h"] },
              { label: "A2L deflagration / explosion", cells: ["Evacuate; ventilate; secure area", "911; fire department; EPA notification for refrigerant release"] },
              { label: "Carbon monoxide poisoning symptoms", cells: ["Fresh air immediately; symptomatic worker needs medical evaluation", "911; physician evaluation"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>OSHA injury reporting requirements (29 CFR 1904.39):</strong> employer must report to OSHA within 8 hours: any work-related fatality. Within 24 hours: any work-related in-patient hospitalization, amputation, or loss of an eye. HVAC business owners should maintain OSHA Form 300 (Log of Work-Related Injuries and Illnesses) per 1904.7 for any covered injury.
          </p>
        </section>

        {/* SECTION 11 — Training */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Training + certification requirements
          </h2>

          <ComparisonTable
            headers={["Training / certification", "Required by", "Renewal", "Cost"]}
            rows={[
              { label: "EPA Section 608", cells: ["Federal law (40 CFR Part 82F) for any refrigerant work", "One-time (as of 2026)", "$25-50 exam fee"] },
              { label: "State HVAC license", cells: ["State regulation (varies by state)", "Annual or biennial typically", "Varies by state"] },
              { label: "OSHA 10 / OSHA 30", cells: ["Voluntary; some commercial sites require", "Once issued (no expiration), refresher recommended", "$50-200 course fee"] },
              { label: "NATE certification", cells: ["Voluntary industry credential", "Every 2 years", "$100-300 per specialty"] },
              { label: "ACCA QI Specialist", cells: ["Voluntary; required for QI installation work", "Per ACCA", "$200-500"] },
              { label: "Manufacturer training", cells: ["Required for specific equipment lines + warranty", "Varies by manufacturer", "Often free for dealers"] },
              { label: "Combustion analyzer training", cells: ["Voluntary; equipment-specific", "Per manufacturer", "$100-500"] },
              { label: "A2L safe-work training", cells: ["Increasingly required by states as new equipment enters market", "Per program", "$50-300"] },
              { label: "First aid + CPR", cells: ["OSHA-recommended for HVAC technicians", "Every 2 years", "$50-100"] },
              { label: "Forklift / lift operator", cells: ["OSHA-required (29 CFR 1910.178) for commercial use", "Every 3 years (refresher) + after incident", "Per training provider"] },
            ]}
          />
        </section>

        {/* SECTION 12 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
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

        {/* SECTION 13 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>OSHA standards:</strong> 29 CFR 1910 Subpart General Industry: 1910.146 (Permit-Required Confined Spaces); 1910.147 (Lockout/Tagout); 1910.252 (Welding, Cutting, and Brazing); 1910.269 (Electric Power Generation); 1910.27 + 1910.28 (Walking-Working Surfaces / Fall Protection); 1910.132-138 (Personal Protective Equipment); 1910.95 (Occupational Noise); 1910.1000 (Air Contaminants); 1910.1200 (Hazard Communication); 1910.178 (Powered Industrial Trucks). 29 CFR 1926 Construction Industry standards. 29 CFR 1904 (Recordkeeping). All available at osha.gov/laws-regs/regulations.
            </p>
            <p className="mt-3">
              <strong>NFPA standards:</strong> NFPA 70 (National Electrical Code 2023). NFPA 70E (Standard for Electrical Safety in the Workplace 2024). NFPA 54 (National Fuel Gas Code 2024) / ANSI Z223.1. NFPA 56 (Standard for Fire and Explosion Prevention During Cleaning and Purging of Flammable Gas Piping Systems). NFPA 51B (Standard for Fire Prevention During Welding, Cutting, and Other Hot Work). NFPA 720 (Standard for the Installation of Carbon Monoxide Detection and Warning Equipment).
            </p>
            <p className="mt-3">
              <strong>ASHRAE standards:</strong> ANSI/ASHRAE Standard 15-2022 (Safety Standard for Refrigeration Systems). ANSI/ASHRAE Standard 34-2022 (Designation and Safety Classification of Refrigerants). ANSI/ASHRAE/ACCA Standard 180-2018 (commercial HVAC maintenance, including combustion analysis). ASHRAE Standard 62.2 (residential ventilation — relevant to A2L equipment room ventilation).
            </p>
            <p className="mt-3">
              <strong>EPA + refrigerant:</strong> 40 CFR Part 82 Subpart F (EPA Section 608 — refrigerant management). 40 CFR Part 84 (AIM Act HFC phase-down). 40 CFR Part 173 (DOT — refrigerant cylinder transport). EPA Indoor Air Quality programs (CO + radon).
            </p>
            <p className="mt-3">
              <strong>Codes + standards:</strong> International Residential Code (IRC) 2021 Section R315 (CO alarms). International Mechanical Code (IMC) 2021. International Fuel Gas Code (IFGC) 2021. UL 2034 (Single and Multiple Station Carbon Monoxide Alarms). UL 1995 + UL 60335-2-40 (HVAC equipment safety; A2L provisions). ANSI Z21.13 (gas-fired hot-water boilers — heat exchanger inspection criteria). ANSI Z83.8 (gas-fired duct furnaces).
            </p>
            <p className="mt-3">
              <strong>Industry organizations + training:</strong> ACCA (Air Conditioning Contractors of America) Standards 4 + QI 5 + QM 6. NATE (North American Technician Excellence) certification. Mainstream Engineering EPA 608 training. ESCO Institute EPA 608 training. RSES (Refrigeration Service Engineers Society). AHRI (Air-Conditioning, Heating, and Refrigeration Institute) Safe Refrigerant Transition guidance. IAPMO / IPC inspection.
            </p>
            <p className="mt-3">
              <strong>Government safety resources:</strong> CDC carbon monoxide poisoning prevention. NIOSH (National Institute for Occupational Safety and Health) refrigerant exposure guidelines. CPSC (Consumer Product Safety Commission) HVAC safety bulletins. State labor + occupational safety departments (state-specific).
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific OSHA citation case law (consult OSHA legal counsel or OSHA inspector for site-specific compliance questions). Industry-specific Job Hazard Analysis templates (use ACCA QI templates or develop site-specific). Specific PPE vendor recommendations (focus on ANSI/UL certifications; many brands meet standards). State-specific HVAC licensing requirements (consult state contractor licensing board). For HVAC technicians: complete EPA Section 608 + state license + manufacturer training before commercial work; pursue NATE for industry recognition.
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
            <Link href="/hvac-refrigerant-recovery-guide/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><ShieldCheck className="h-4 w-4" /> Refrigerant Recovery Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">EPA Section 608 + A2L safe-work deep dive.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Combustion analysis + electrical safety in routine service.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees including CO + gas leak diagnosis.</p>
            </Link>
            <Link href="/hvac-indoor-air-quality-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wind className="h-4 w-4 text-blue-600" /> IAQ Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">CO alarm placement + radon + biological IAQ safety.</p>
            </Link>
            <Link href="/refrigerant-safety-classifications/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Flame className="h-4 w-4 text-blue-600" /> ASHRAE 34 Classifications</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A1/A2L/A2/A3/B safety classes for all 61 refrigerants.</p>
            </Link>
            <Link href="/hvac-system-design-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> System Design Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Capstone design guide including code compliance overview.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Activity, Wrench, Zap, Thermometer, Snowflake, Droplet, ListChecks, FileCheck, Lookups, Panel, ServiceProblem, VerdictBanner];
