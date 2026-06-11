import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Wrench, Flame, Zap, Wind, Thermometer, Gauge, Droplet, Eye } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-tools-equipment-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Tools & Equipment Guide — Manifolds, Vacuum Pumps, Recovery, Combustion Analyzers, Service Truck",
  description:
    "Complete HVAC technician toolkit guide: 13 tool categories (manifold gauges + micron gauges + vacuum pumps + recovery machines + leak detectors + combustion analyzers + multimeters + clamp meters + anemometers + manometers + brazing equipment + thermal imagers + PPE), specifications + AHRI 740 + AHRI 1380 + EPA 608 + OSHA requirements, A2L-compatible equipment, brand lineups (Fieldpiece, Yellow Jacket, Fluke, Robinair, Bacharach, Testo, Inficon, FLIR, TSI, Energy Conservatory, JB Industries, NAVAC), service truck outfitting tiers, DIY vs professional toolkit matrix, calibration requirements. Sourced from EPA, AHRI, ASHRAE, OSHA, and manufacturer specifications.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Tools & Equipment Guide — Complete Professional Toolkit + Selection Criteria",
    description: "13 tool categories, AHRI + EPA + OSHA specifications, A2L-compatible equipment, service truck outfitting tiers.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Tools & Equipment Guide — Professional Toolkit Reference",
    description: "13 tool categories with specifications, brand lineups, and EPA 608 + AHRI compliance.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the minimum tool list to start an HVAC service career?",
    a: "Entry-level toolkit for a residential HVAC service technician (after EPA Section 608 certification + state license): (1) Digital manifold gauges with 1/4 SAE hoses ($300-500 — Yellow Jacket, Fieldpiece, Mastercool, JB Industries). (2) Micron gauge for vacuum measurement ($150-300 — Yellow Jacket BluVac+, Fieldpiece SVG3, JB Industries). (3) 2-stage rotary vane vacuum pump 6+ CFM ($250-500 — Robinair, JB Industries, NAVAC, Yellow Jacket). (4) Recovery machine A2L-compatible ($500-1500 — Appion G5Twin, RecoverXLT, NAVAC NRDD). (5) Recovery cylinder 30-50 lb DOT-rated ($75-150). (6) Charging scale 220 lb capacity ($75-200 — Fieldpiece SRS3, Mastercool, JB). (7) True-RMS multimeter ($100-300 — Fluke 117 or 87V, Klein MM2000, Fieldpiece SC480). (8) Clamp meter ($100-300 — Fluke 376 FC, Fieldpiece SC57, Klein CL800). (9) Electronic leak detector A2L-rated ($200-600 — Inficon D-TEK Select, Bacharach H-10 PRO, Fieldpiece SRL8). (10) Combustion analyzer ($300-1500 — Bacharach Fyrite, Testo 300, Sauermann Si-CA 130). (11) Anemometer + manometer for airflow ($200-600 — Fieldpiece STA2, TSI Velocicalc, Dwyer). (12) Insulated screwdrivers + adjustable wrenches + service wrench. (13) Brazing torch + rod + flux ($200-500 — Smith, TurboTorch, Victor). (14) Nitrogen regulator + tank for purging ($150-300). (15) Hand tools (tubing cutter, swaging tool, flaring tool, tin snips, crimpers). (16) PPE (safety glasses, leather brazing gloves, electrical gloves, ladder). Total startup investment: $4,000-12,000 depending on tier. Add capability over time vs trying to outfit fully Day 1.",
  },
  {
    q: "Are my legacy tools A2L-compatible? What needs replacement?",
    a: "Most existing HVAC tools transfer to A2L work without replacement, but specific items DO need A2L-rated versions: (1) Recovery machines — A2L compatibility requires UL listing as A2L-rated. Older R-410A-only machines may need replacement; check manufacturer A2L compatibility statement. Appion G5Twin, RecoverXLT, NAVAC NRDD, JB Eliminator series include current A2L models. (2) Leak detectors — A2L-rated detectors needed; older heated-diode detectors may not respond to R-32 or R-454B. Inficon D-TEK Select, Bacharach H-10 PRO, Fieldpiece SRL8 newer models are A2L-rated. (3) Manifold gauges — most digital manifolds work with A2L refrigerants (pressure measurement is universal); analog manifolds work but verify pressure range (A2L systems use similar pressures to R-410A). (4) Vacuum pumps — universal; same pump works for any refrigerant. (5) Recovery cylinders — A2L requires UN-rated A2L-compatible cylinders; consult cylinder manufacturer + state code. (6) Charging hoses — must be rated for higher pressures (R-410A and A2Ls operate at 250+ PSIG); generic 800 PSIG hoses are typically rated for A2L use. (7) Combustion analyzers — universal; same analyzer works for any fuel-burning equipment. Check each tool's UL listing + manufacturer A2L statement before assuming compatibility.",
  },
  {
    q: "Why do I need a micron gauge — won't my manifold gauges read vacuum?",
    a: "Manifold gauges measure inches of vacuum (in.Hg) or PSIG, but the resolution at deep vacuum is essentially zero. The compound gauge needle barely moves between 28 in.Hg and 29.92 in.Hg (full vacuum at sea level). Yet the difference between 1000 microns and 500 microns vacuum is critical for proper system evacuation. Manifold gauge precision: ~1-2 in.Hg increments below 25 in.Hg. Translation: any vacuum reading below 28 in.Hg on a manifold looks the same — but actually represents 25,400 to 100,000+ microns, which is far from the AHRI 740 + ACCA QI Standard 5 target of 500 microns for refrigerant system commissioning. A digital micron gauge resolves down to single microns. The micron gauge is to vacuum measurement what the digital multimeter is to electrical measurement — orders-of-magnitude better resolution. Industry-standard models: Yellow Jacket BluVac+, Fieldpiece SVG3, JB Industries DV-22N, NAVAC NMV1, Testo 552i. Connection: T-fitting at the system access valve OR dedicated 1/4 SAE port on the vacuum hose. Best practice: micron gauge isolated by valve so vacuum-pump-side gauge readings don't contaminate system-side reading. See our commissioning guide section 5 for evacuation procedure.",
  },
  {
    q: "What multimeter should I buy?",
    a: "For HVAC service work, prioritize: (1) True-RMS for accurate measurement of variable-frequency drive (VFD) outputs in commercial systems. (2) CAT III 600V rating minimum for residential; CAT III 1000V or CAT IV for commercial. (3) Capacitance measurement (for capacitor testing — typical HVAC capacitors 5-80 µF). (4) Temperature measurement with K-type thermocouple input (some models). (5) Low-impedance (LoZ) mode to detect ghost voltages without false readings. (6) Auto-ranging for ease of use. (7) Backlight + magnetic hanger for field use. Professional models: Fluke 87V (industry workhorse, $400-500), Fluke 117 (residential focus, $200-300), Klein MM700 + MM2000 ($150-300), Fieldpiece SC480 (HVAC-specific with leakage current, $300-400). Value tier: Klein MM400 ($60-90), Fluke 101 ($50-80) — adequate for entry-level work. Avoid no-name Amazon multimeters without UL listing — accuracy is unreliable + safety ratings unverified. Calibration: NIST-traceable annual calibration recommended for warranty work; in-the-field reference verification is sufficient for routine residential.",
  },
  {
    q: "Do I need a thermal imager?",
    a: "Useful but not required for residential service; very useful for commercial diagnostics + HVAC retrofit work. Use cases: (1) Detect missing or compressed insulation in walls + ducts. (2) Locate refrigerant lines hidden in walls. (3) Identify failed insulation in window/door installations. (4) Detect overheated electrical components (motor windings, capacitors, contactors). (5) Identify wet insulation from leak (water shows thermal pattern). (6) Locate underfloor heating issues. (7) Verify uniform airflow across coils. (8) Detect air leakage paths during commissioning. Resolution matters: 80x60 minimum for HVAC (160x120 better; 320x240 best). FLIR E5, E6, E8 Pro ($400-1500) industry standard. Hikmicro B Series ($300-800) emerging value alternative. Seek Thermal CompactPRO smartphone adapter ($300-500) good for occasional use. Avoid sub-80x60 resolution — too blurry to identify HVAC-specific issues. For DIY: not typically worth the investment unless you're doing energy efficiency analysis on your own home. For professionals: depends on service mix — heat pump installer benefits more than oil-burner service tech.",
  },
  {
    q: "What's the difference between a flow hood and an anemometer?",
    a: "Both measure airflow but at different points in the system. (1) Anemometer measures velocity (FPM, feet per minute) at a specific point — typically at a register face, in a duct cross-section, or at a coil face. Velocity × duct area = CFM. Common models: rotating vane (Fieldpiece STA2 — accurate, durable); hot-wire (TSI Velocicalc 9555 — best accuracy at low velocities, can measure inside ducts via probe). (2) Flow hood / capture hood measures total airflow at a register or grille directly — air flows into a fabric hood, through a measuring chamber, out. Direct CFM reading, no math required. Industry-standard model: TSI Alnor LoFlow ($1,500-3,500), Shortridge Instruments ($3,000-5,000), Energy Conservatory TrueFlow ($1,500-2,500). When to use which: anemometer for cross-section duct traverse or coil-face velocity verification ($100-500 entry; $500-1500 professional). Flow hood for register-by-register supply + return balancing ($1,500-3,500). For most residential commissioning work, an anemometer with a register velocity multiplier is sufficient; flow hood is the next level up for HVAC contractors doing high-end commissioning work.",
  },
  {
    q: "How do I calibrate my tools, and how often?",
    a: "Calibration cadence depends on tool category + use intensity + manufacturer recommendation: (1) Combustion analyzer — annual calibration mandatory for accuracy (CO sensor drift, O2 sensor degradation). Cost: $50-200 per calibration. Manufacturers: Bacharach, Testo, Sauermann offer calibration service. (2) Refrigerant recovery scale — annually or per AHRI 700 requirement for warranty work. (3) Manifold gauges — periodic verification against known pressure source; annual calibration if used for warranty work. (4) Vacuum pump — no calibration needed; gauge for blank-off testing (verify pump reaches <100 microns when isolated). (5) Micron gauge — manufacturer-specific; many have user calibration mode against atmosphere. (6) Multimeter — annual for warranty work; use field reference (10V battery test, 1MΩ resistor) for routine verification. (7) Anemometer — annual for warranty work; field cross-check against another anemometer or known velocity source. (8) Thermal imager — annual for warranty work; verify against blackbody reference. (9) Blower door + Duct Blaster — biennial per RESNET MINHERS standards. NIST traceability is the standard — calibration certificates issued by NIST-accredited labs are legally defensible. Internal-only calibration suffices for routine field work.",
  },
  {
    q: "What's the best vacuum pump for HVAC work?",
    a: "Selection criteria more important than brand. Key specs: (1) 2-stage design for deeper vacuum (single-stage limits to ~75 microns; 2-stage achieves <50 microns and is the AHRI 740 + ACCA QI Standard 5 standard). (2) 6+ CFM displacement for residential split systems (larger systems benefit from 8-10 CFM). (3) Forced-air-cooled oil seal for long-running evacuations. (4) Oil reservoir at least 1/2 quart with sight glass for monitoring contamination. (5) Easy-drain oil fill + drain plugs. (6) 1/4 SAE + 3/8 SAE intake fittings. (7) Long-life check valve to prevent oil migration back into the system. Industry-standard manufacturers: Robinair (VacuMaster 15500 + 15600 series), JB Industries (DV-285N Eliminator, Platinum DV-29N), Yellow Jacket (BV6 + BV8), NAVAC (NRDD8 + NP4DPF + NP6DLP), Fieldpiece (VPX7 + VP85). Robinair 15500 is sometimes cited as the entry-level industry standard ($300-400 range). Higher-tier models from Fieldpiece, NAVAC include digital micron gauge integration. For commercial 5+ ton refrigeration work: 8-12 CFM pumps recommended. Oil change frequency: every 10-20 evacuations or when oil shows discoloration / moisture contamination.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Tools & Equipment Guide — Complete Professional Toolkit, Selection Criteria, and Brand Comparison",
      description:
        "Complete HVAC technician toolkit guide covering 13 categories: manifold gauges, vacuum pumps, recovery machines, leak detectors, combustion analyzers, electrical test equipment, airflow measurement, brazing equipment, thermal imagers, PPE, and service truck outfitting. Sourced from AHRI, EPA, OSHA, ASHRAE specifications.",
      proficiencyLevel: "Beginner to Advanced",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "HVAC tools" },
        { "@type": "Thing", name: "HVAC technician toolkit" },
        { "@type": "Thing", name: "Refrigeration service equipment" },
        { "@type": "Thing", name: "EPA 608 tools" },
      ],
      keywords: [
        "hvac tools",
        "hvac technician toolkit",
        "manifold gauges",
        "vacuum pump",
        "recovery machine",
        "leak detector",
        "combustion analyzer",
        "hvac multimeter",
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
        { "@type": "ListItem", position: 3, name: "HVAC Tools & Equipment Guide" },
      ],
    },
  ];
}

export default function HvacToolsEquipmentGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Tools & Equipment Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Tools & Equipment Guide — Manifold Gauges, Vacuum Pumps, Recovery Machines, Combustion Analyzers, Leak Detectors, and Service Truck Outfitting
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            Complete HVAC technician toolkit reference covering 13 tool categories: refrigerant-side measurement (manifold gauges + micron gauges + hoses + scales), vacuum + evacuation (rotary vane pumps + core removal tools), refrigerant recovery (AHRI 740-compliant recovery machines + A2L-rated cylinders), leak detection (electronic + UV dye + ultrasonic per AHRI 1380), combustion + gas safety (combustion analyzers + CO meters + manometers), electrical (true-RMS multimeters + clamp meters + capacitance + insulated tools + LOTO), airflow + duct testing (anemometers + manometers + capture hoods + Blower Door + Duct Blaster), brazing + cutting + tubing tools, specialty diagnostics (thermal imagers + borescopes + psychrometers + IAQ meters), hand tools, safety + PPE per OSHA 1910, software + smart tool integration, and service truck outfitting tiers. Includes brand lineups from established manufacturers (Fieldpiece, Yellow Jacket, Fluke, Robinair, Bacharach, Testo, Inficon, FLIR, TSI, Energy Conservatory, JB Industries, NAVAC), selection criteria (more important than brand), A2L-compatibility notes throughout, EPA 608 + AHRI 740 + OSHA + ASHRAE specifications, and an explicit DIY-vs-pro toolkit matrix.
          </p>

          <div className="mt-5 rounded-xl border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Brand neutrality.</strong> Manufacturers and model lines named below are well-established industry references — they meet AHRI, UL, or other applicable standards. Selection criteria (accuracy, calibration cadence, A2L compatibility) matter more than brand choice. This guide lists multiple manufacturers per category to support comparison shopping; it does not endorse any single brand. Prices are expressed in approximate tier ranges since retail pricing fluctuates with supply, distributor, and promotional cycles.
            </p>
          </div>
        </header>

        {/* SECTION 01 — Toolkit framework */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            The HVAC toolkit framework — what separates HVAC from general construction
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            HVAC tools cluster into three groups based on the work performed:
          </p>

          <ComparisonTable
            headers={["Tool group", "What it does", "EPA 608 certification required?"]}
            rows={[
              { label: "Refrigerant-side tools", cells: ["Pressure, vacuum, recovery, charging, leak detection", "YES — federal law (40 CFR Part 82F) requires EPA 608 certification for any refrigerant handling. Possession is allowed but USE requires certification."] },
              { label: "Safety + airflow tools", cells: ["Combustion analysis, multimeter, anemometer, manometer, thermal imaging", "NO — these tools can be purchased + operated without certification, though their primary use is professional."] },
              { label: "Specialty + commercial", cells: ["Megohmmeter, phase rotation tester, fluke FC wireless tools, BAS interface, advanced flow hood", "Generally NO — commercial-grade tools without specific federal certification requirements (though OSHA workplace requirements apply)."] },
            ]}
          />

          <KeyInsight tone="blue" title="The toolkit hierarchy">
            Start with refrigerant-side tools + multimeter (the core 8-10 items in the FAQ). Add safety tools (combustion analyzer + leak detector) for safety + diagnostic capability. Add specialty + commercial tools as your service mix demands. Total professional toolkit cost: $4,000-15,000 depending on tier. Build incrementally — buying everything Day 1 wastes capital on tools you may not use for 6+ months.
          </KeyInsight>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For DIY/homeowner users, see Section 14 (DIY vs Professional Toolkit) — the federal EPA Section 608 requirement means homeowners cannot legally perform refrigerant-side work, even on their own equipment.
          </p>
        </section>

        {/* SECTION 02 — Manifolds + measurement */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Manifold gauges + refrigerant-side measurement
          </h2>

          <ComparisonTable
            headers={["Type", "Pros", "Cons", "Price tier", "Industry-standard manufacturers"]}
            rows={[
              { label: "Analog manifold (2-port)", cells: ["Simple; durable; mechanical; no battery", "Lower resolution; no calculations; harder to read at deep vacuum", "$50-200", "Yellow Jacket Series 41 / 42; Mastercool; Robinair"] },
              { label: "Analog manifold (4-port)", cells: ["Additional ports for vacuum + nitrogen + recovery", "Same precision limits as 2-port", "$100-300", "Yellow Jacket TITAN; CPS Pro-Set; JB Industries"] },
              { label: "Digital manifold (basic)", cells: ["Higher resolution; calculates superheat + subcooling; data logging", "Battery dependent; more delicate; calibration matters", "$200-500", "Fieldpiece SMAN360; Mastercool DMM-12; JB DSXi"] },
              { label: "Digital manifold (smart)", cells: ["Bluetooth/WiFi to phone app; supports refrigerant database; integrated micron gauge", "Higher cost; learning curve", "$500-1500", "Fieldpiece JL3 + JL2; Yellow Jacket Mantooth; CPS Black-MAX; Testo 550i + 557s"] },
              { label: "Transducer set (gauge replacement)", cells: ["Replaces manifold gauges entirely; integrates with phone app", "Total commitment to digital; can't fall back to analog reading", "$400-1500", "Fieldpiece JL3KH4 set; Testo 557s; SMAN760"] },
            ]}
          />

          <TechSection icon="insight" tone="blue" title="Hoses — the under-attended component">
            Manifold hoses are typically the failure point in a manifold-set. Specifications to look for: (1) 800 PSIG burst rating minimum for R-410A/A2L compatibility. (2) Low-loss fittings (1/4 SAE with sealing valve at the equipment end) reduce refrigerant loss during connect/disconnect (each open-flow connection loses 0.5-1 oz refrigerant; over a service career, $100s lost). (3) Color-coded (red = high-side, blue = low-side, yellow = vacuum/charge) reduces error. (4) Length matched to typical service stance — 60 inch standard, 36 inch for tight spaces. (5) Permanent gaskets, not field-replaceable, fail; replace at the first sign of leakage. Industry-standard brands: Yellow Jacket PLUS II hoses ($30-60 per set); Fieldpiece HC-3 ($25-50); CPS HP4 ($30-60); JB Industries 4-color ($30-60).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Charging scales">
            Required for any system charged by weight (the AHRI 700 / ACCA QI Standard 5 method). Specifications: (1) 220 lb capacity minimum (larger refrigerant cylinders); 440 lb for commercial work. (2) 0.1 oz resolution (smaller resolution waste; coarser misses target). (3) Stable platform (don&apos;t set on uneven surface). (4) Long battery life (LCD low-power critical for cold-day extended evacuation). (5) Optional Bluetooth for digital service tickets. Industry-standard manufacturers: Fieldpiece SRS3 ($75-150); Mastercool ($100-200); JB Industries DS-20000 ($75-150); NAVAC NRS220 ($100-200); Bacharach Refrigerant Charging Scale ($150-300).
          </TechSection>

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            See <Link href="/superheat-calculator/" className="underline">superheat calculator</Link> and <Link href="/subcooling-calculator/" className="underline">subcooling calculator</Link> for the calculations performed by smart manifolds + the math your analog manifold requires you to do by hand.
          </p>
        </section>

        {/* SECTION 03 — Vacuum + evacuation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Vacuum + evacuation tools
          </h2>

          <ComparisonTable
            headers={["Tool", "Specifications to look for", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Vacuum pump (rotary vane, 2-stage)", cells: ["6+ CFM residential; 8-10 CFM commercial; rated to &lt;50 microns; oil reservoir sight glass; 1/4 + 3/8 SAE intake; forced-air cooling", "Robinair VacuMaster 15500/15600; JB Industries DV-285N + DV-29N; Yellow Jacket BV6/BV8; NAVAC NRDD/NP4/NP6; Fieldpiece VPX7/VP85", "$250-700"] },
              { label: "Micron gauge", cells: ["Resolution 1 micron; range 5000 microns; auto-zero at atmosphere; rechargeable battery; isolation valve at the gauge", "Yellow Jacket BluVac+; Fieldpiece SVG3; JB Industries DV-22N; NAVAC NMV1; Testo 552i; Inficon Vortex", "$150-400"] },
              { label: "Vacuum hose (high-vacuum)", cells: ["1/4 SAE or 3/8 SAE; dedicated high-vacuum (low outgassing); large diameter for faster evacuation", "Yellow Jacket Plus II vacuum hose; Fieldpiece VHV3; CPS HP4-V; JB DV", "$25-60"] },
              { label: "Core removal tool", cells: ["1/4 SAE + 5/16 SAE; ball-valve for isolation; allows removing Schrader cores under pressure for faster evacuation", "Appion MGAVCT; Yellow Jacket; JB Industries", "$40-80"] },
              { label: "Vacuum gauge (manifold-style)", cells: ["Optional — for blank-off testing the vacuum pump alone (verify pump reaches deep vacuum when isolated from system)", "Mostly bundled with vacuum pump packages", "Bundled"] },
            ]}
          />

          <FixCallout>
            <strong>The micron gauge is non-negotiable.</strong> Many technicians (especially apprentice) skip the micron gauge and rely on the manifold compound gauge for vacuum measurement. This is technically possible but operationally useless. Manifold compound gauge resolution at deep vacuum: ±2 in.Hg, which translates to ±50,000 microns. AHRI 740 + ACCA QI Standard 5 evacuation target: 500 microns. Without a micron gauge, you literally cannot verify you&apos;ve met the standard. Buy the micron gauge as a non-negotiable companion to the vacuum pump.
          </FixCallout>
        </section>

        {/* SECTION 04 — Recovery */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Refrigerant recovery — AHRI 740 + EPA 608 equipment
          </h2>

          <ComparisonTable
            headers={["Tool", "Specifications to look for", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Recovery machine (oil-less, AHRI 740-rated)", cells: ["Push-pull capability for liquid recovery; AHRI 740-compliant; A2L-rated (UL-listed); auto-shutoff at recovery completion; portable", "Appion G5Twin + G5 Twin Speed; RecoverXLT2-AP; NAVAC NRDD; JB Industries Eliminator; Yellow Jacket RecoverXLT", "$500-2,500"] },
              { label: "Recovery cylinder (DOT-spec, A2L-rated)", cells: ["30 lb or 50 lb DOT 4BA-rated; A2L-rated for R-32/R-454B work; pressure relief valve; tare weight stamped", "Worthington Industries; AGS Inc.; Manchester Tank; CleanFit", "$75-200"] },
              { label: "Recovery hose set", cells: ["1/4 + 3/8 SAE; permanent oil-resistant fittings; large diameter for liquid recovery speed", "Appion Speedrecover; Yellow Jacket RecoverXLT hoses; Mastercool", "$50-150"] },
              { label: "Recovery scale", cells: ["220 lb capacity; 0.1 oz resolution; auto-shutoff trigger at fill limit", "Same as charging scales in Section 02 — most service scales work for both"] },
              { label: "Refrigerant identifier", cells: ["Identifies refrigerant in unknown cylinders (R-22 vs R-410A vs A2L); important when working with reclaim or recovered refrigerant", "Bacharach H-10 PRO RID; Fieldpiece RID01; Yellow Jacket Refrigerant Identifier", "$300-1,200"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            See <Link href="/hvac-refrigerant-recovery-guide/" className="underline">refrigerant recovery guide</Link> for the complete EPA Section 608 procedure, certification framework, and A2L safe-work practices.
          </p>
        </section>

        {/* SECTION 05 — Leak detection */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Leak detection — AHRI 1380 + EPA-compliant equipment
          </h2>

          <ComparisonTable
            headers={["Detector type", "Sensitivity", "Pros", "Cons", "Industry-standard manufacturers"]}
            rows={[
              { label: "Heated diode (electronic)", cells: ["Down to 0.1 oz/year leak rate", "Fast response; durable; AHRI 1380-compliant models available", "Sensor wear; periodic replacement needed; false positives from other compounds", "Inficon D-TEK Select; Bacharach H-10 PRO; Fieldpiece SRL8; CPS LS3000; JB Industries"] },
              { label: "Infrared (IR)", cells: ["Down to 0.05 oz/year", "Better selectivity for refrigerants vs interfering compounds; longer sensor life", "Higher cost; warm-up time", "Inficon D-TEK Stratus; Bacharach Informant 2; Fieldpiece DR82"] },
              { label: "Ultrasonic", cells: ["Detects gas escape sound, not refrigerant per se", "Works with any pressurized gas; useful for nitrogen pressure tests", "Doesn't identify refrigerant; less common in HVAC", "UE Systems Ultraprobe; SDT International"] },
              { label: "UV dye + UV lamp", cells: ["Visual confirmation after dye injection", "Inexpensive; permanent record; useful for hidden leaks", "Requires dye injection (which contaminates refrigerant); slow", "Mastercool UV dye + lamp kit; Spectronics OPTI-LUX; ROBINAIR"] },
              { label: "Soap solution + spray bottle", cells: ["Detects visible leaks (above ~1 oz/year)", "Free; works anywhere", "Slow; doesn't detect small leaks; only useful with system under pressure", "Generic soap solution or commercial leak detection spray"] },
            ]}
          />

          <KeyInsight tone="blue" title="A2L compatibility matters">
            Older heated-diode leak detectors may not respond to A2L refrigerants (R-32, R-454B). Verify A2L compatibility before relying on older detectors for new R-32 / R-454B equipment work. The Inficon D-TEK Select, Bacharach H-10 PRO, and Fieldpiece SRL8 in their current versions are A2L-rated. Bacharach Informant 2 and Inficon D-TEK Stratus IR models are A2L-rated.
          </KeyInsight>
        </section>

        {/* SECTION 06 — Combustion + gas */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Combustion analysis + gas safety
          </h2>

          <ComparisonTable
            headers={["Tool", "What it measures", "Specifications", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Combustion analyzer (basic)", cells: ["CO + O₂ + temperature + draft pressure", "CO 0-1000 ppm; O₂ 0-21%; sensor life 2-3 years; annual calibration", "Bacharach Fyrite Insight Plus; Testo 300; Sauermann Si-CA 130; Kane 425", "$300-1,500"] },
              { label: "Combustion analyzer (advanced)", cells: ["Adds NOx, CO2, efficiency calculation", "Multi-gas sensors; auto-zero; PC connectivity; printer option", "Testo 320 + 350; Bacharach Fyrite Pro; Sauermann Si-CA 230; Kane 458", "$1,500-3,000"] },
              { label: "Personal CO monitor", cells: ["CO in technician's breathing zone", "Continuous reading; audible alarm at 35 ppm + 100 ppm + 200 ppm thresholds; rechargeable", "Bacharach Personal Atmospheric Monitor; BW Technologies; Honeywell BW SOLO", "$200-600"] },
              { label: "Combustible gas leak detector", cells: ["Natural gas + propane leaks", "ppm response 5-100% LEL; tip flexibility", "Bacharach Leakator Jr; UEI CD100A; Fieldpiece SRL2; Inficon GAS-Mate", "$100-300"] },
              { label: "Manometer (digital)", cells: ["Gas pressure measurement (manifold + supply); duct static pressure", "0-60 in.w.c.; 0.01 resolution; data logging; differential capability", "Fieldpiece SDMN5; Dwyer Magnehelic; UEI EM200; Testo 510i; TSI", "$100-400"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For combustion analysis procedure + acceptance criteria, see <Link href="/hvac-maintenance-service-guide/" className="underline">maintenance guide section 9</Link> and <Link href="/hvac-safety-procedures-guide/" className="underline">safety guide section 4</Link>.
          </p>
        </section>

        {/* SECTION 07 — Electrical */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Electrical test equipment
          </h2>

          <ComparisonTable
            headers={["Tool", "Why HVAC needs it", "Specifications", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "True-RMS multimeter", cells: ["Voltage, current, resistance, capacitance, frequency, temperature", "CAT III 600V min (CAT III 1000V commercial); LoZ mode; capacitance to 100µF; backlight", "Fluke 87V (workhorse); Fluke 117 (residential); Klein MM700 + MM2000; Fieldpiece SC480", "$150-500"] },
              { label: "Clamp meter (AC + DC)", cells: ["Current measurement without breaking circuit; verifies compressor LRA + RLA", "True-RMS; 1000A AC; CAT III 600V min; inrush capture; min/max recording", "Fluke 376 FC (wireless); Fluke 902 FC; Fieldpiece SC57; Klein CL800", "$100-400"] },
              { label: "Non-contact voltage tester", cells: ["Quick verification of energized wiring without contact", "12-1000V range; LED + audible indicator; CAT IV", "Fluke 1AC + 2AC; Klein NCVT-2; Fieldpiece SC76", "$15-50"] },
              { label: "Capacitance meter (or multimeter mode)", cells: ["Verify capacitor µF rating vs nameplate (common HVAC failure)", "5-150 µF range covers HVAC capacitors", "Most multimeters include; dedicated meters from Sperry, Klein", "Bundled with multimeter"] },
              { label: "Megohmmeter (insulation tester)", cells: ["Compressor + motor winding insulation test (commercial)", "500V + 1000V + 2500V outputs; min 1MΩ - 1GΩ range", "Fluke 1587 FC; Megger MIT400; Klein ET600", "$300-1,500"] },
              { label: "Phase rotation tester (3-phase commercial)", cells: ["Determines phase rotation before connecting 3-phase motor (wrong rotation = motor damage)", "Phase indicator + voltage measurement", "Fluke T+Pro; AEMC; Greenlee", "$100-300"] },
              { label: "LOTO device set", cells: ["Lockout/Tagout per OSHA 1910.147 + NFPA 70E", "Multi-lock hasp; padlocks; warning tags; circuit breaker lockouts", "Brady; Master Lock; Klein LOTO kit", "$50-200"] },
              { label: "Insulated screwdriver set", cells: ["Electrical work above 50V per NFPA 70E", "1000V rated; flat + Phillips + Torx as needed", "Klein 1000V-rated; Wera; Wiha", "$50-200"] },
              { label: "Wire stripper + crimper", cells: ["Control wiring (24V thermostat + sensor work)", "Stranded + solid; 8-22 AWG; ergonomic", "Klein Tools; Ideal; Greenlee", "$25-100"] },
            ]}
          />
        </section>

        {/* SECTION 08 — Airflow + duct */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Airflow + duct testing
          </h2>

          <ComparisonTable
            headers={["Tool", "Use case", "Specifications", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Anemometer (vane)", cells: ["Register velocity + cross-section duct traverse", "FPM accuracy ±3%; range 30-6000 FPM; rotating vane head", "Fieldpiece STA2; Testo 425; TSI Velocicalc 9555; Extech CFM", "$150-500"] },
              { label: "Anemometer (hot-wire)", cells: ["Low-velocity inside ducts; better at <300 FPM than vane", "FPM accuracy ±3%; range 0-6000 FPM; probe tip on flexible stem", "TSI Velocicalc 9555; Testo 440; Fieldpiece AOX2", "$300-1,500"] },
              { label: "Manometer (digital, differential)", cells: ["Duct static pressure; gas manifold pressure; coil pressure drop", "0-60 in.w.c.; differential measurement; data logging", "Fieldpiece SDMN5; Dwyer Magnehelic; UEI EM200; Testo 510i", "$150-500"] },
              { label: "Capture hood / flow hood", cells: ["Register-by-register direct CFM reading; air balancing", "Replaces velocity × area math; calibrated for typical register sizes", "TSI Alnor LoFlow; Shortridge Instruments; Energy Conservatory TrueFlow", "$1,500-5,000"] },
              { label: "Blower Door (envelope leakage)", cells: ["Whole-house air leakage measurement per RESNET MINHERS + IECC R402.4.1.2", "0.5 ACH50 to 25 ACH50 range; fan + measurement set", "Energy Conservatory Minneapolis Blower Door; Retrotec US3000", "$2,500-4,500"] },
              { label: "Duct Blaster (duct leakage)", cells: ["Duct leakage measurement per RESNET MINHERS + IECC R403.3.3", "0-1,000 CFM range; fan + measurement", "Energy Conservatory Minneapolis Duct Blaster; Retrotec DucTester", "$2,000-3,500"] },
              { label: "Pitot tube + manometer", cells: ["Cross-section duct traverse + velocity pressure measurement", "Standard pitot tube; differential manometer", "Dwyer; United Sensor; Shortridge", "$200-500"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            See <Link href="/hvac-commissioning-guide/" className="underline">commissioning guide</Link> for the complete testing methodology + acceptance criteria.
          </p>
        </section>

        {/* SECTION 09 — Brazing + tubing */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Brazing, cutting + tubing tools
          </h2>

          <ComparisonTable
            headers={["Tool", "Use case", "Specifications", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Oxy-acetylene torch set", cells: ["Refrigerant line brazing; full HVAC capability", "Standard B-tank oxygen + acetylene; multi-tip; rosebud for soldering", "Smith Equipment; Victor Technologies; Harris Products; Goss", "$200-600"] },
              { label: "Air-acetylene torch (TurboTorch)", cells: ["Residential brazing; smaller + portable", "MAPP gas or acetylene; swirl-flame tip; lighter than oxyacetylene", "TurboTorch; Bernzomatic; ESAB", "$100-300"] },
              { label: "Brazing rod (silver phos-copper)", cells: ["Copper-to-copper joints; 5% or 15% silver typical", "BAg-7 (15% silver) or BCuP-5 (15% silver) per AWS A5.8", "Harris Stay-Silv; Lucas-Milhaupt; Hayward", "$30-80 per 1 lb tube"] },
              { label: "Brazing flux", cells: ["Copper-to-brass or copper-to-steel joints", "Stay-Silv #1 or BCuP-flux per AWS A5.31", "Harris Stay-Silv; Lucas-Milhaupt", "$10-30 per jar"] },
              { label: "Nitrogen regulator + tank", cells: ["Purge line during brazing (prevents oxidation scale inside refrigerant lines)", "0-3,000 PSIG regulator; flow gauge", "Smith Equipment; Victor; Western Enterprises", "$100-300"] },
              { label: "Tubing cutter (1/4-1.5 in OD)", cells: ["Clean cuts of copper refrigerant line", "Smooth-rolling wheel; deburring tip", "Imperial Tools; Ridgid; Yellow Jacket", "$15-50"] },
              { label: "Tubing flaring tool (45°)", cells: ["1/4 SAE + 1/2 SAE flare connections", "Ratcheting handle for repeatable flares", "Imperial Tools; Yellow Jacket; Mastercool", "$50-200"] },
              { label: "Swaging tool (1/4-7/8 in)", cells: ["Stub one tube into another for soldered/brazed joint", "Punch-type or hammer-type", "Imperial Tools; Mastercool; Yellow Jacket", "$50-150"] },
              { label: "Tubing bender (lever-type)", cells: ["Smooth bends of copper without kinking", "1/4 - 7/8 OD bender sizes", "Imperial Tools; Ridgid; Klein", "$50-200"] },
            ]}
          />
        </section>

        {/* SECTION 10 — Specialty */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Specialty diagnostic tools
          </h2>

          <ComparisonTable
            headers={["Tool", "Use case", "Specifications", "Industry-standard manufacturers", "Price tier"]}
            rows={[
              { label: "Thermal imager", cells: ["Refrigerant line tracing; insulation inspection; overheated electrical components; missing insulation; airflow patterns", "80x60 minimum; 160x120 typical professional; 320x240 best", "FLIR E5/E6/E8 Pro; FLIR ONE Pro; Seek Thermal CompactPRO; Hikmicro B Series", "$300-2,000"] },
              { label: "Borescope / inspection camera", cells: ["Inside furnace burners; behind walls; ducts; equipment cavities", "Articulating tip; HD camera; LED illumination; long flexible probe", "Klein Tools 8 in display; Milwaukee M-Spector; Ridgid micro CA-350", "$150-600"] },
              { label: "Refrigerant identifier", cells: ["Verify refrigerant type in unknown cylinder (reclaim, recovered)", "Identifies R-22, R-134a, R-404A, R-407C, R-410A, A2Ls; HFC, HFO, blend detection", "Bacharach H-10 PRO RID; Yellow Jacket Refrigerant Identifier; Fieldpiece RID01", "$500-1,500"] },
              { label: "Psychrometer (handheld DB + WB)", cells: ["Field measurement of indoor air DB + WB for psychrometric calculations", "Sling psychrometer (classic); digital with DB/RH/WB calculation", "Mannix; Cooper-Atkins; Extech; Fieldpiece (DB only)", "$30-200"] },
              { label: "IAQ meter (CO2 + PM + TVOC)", cells: ["Indoor air quality verification per ASHRAE 62.2 + EPA recommendations", "CO2 ppm; PM2.5 + PM10; TVOC; temperature + humidity", "Temtop M2000 2nd Gen; Awair Element + Omni; Aranet4", "$150-600"] },
              { label: "Smart manifold + transducer set", cells: ["Replaces manifold + integrates with phone app for refrigerant database, calculations, diagnostic logging", "Bluetooth/WiFi; supports all common refrigerants; data logging + service ticket export", "Fieldpiece JOB LINK system; Testo 557s; Yellow Jacket Mantooth; CPS Black-MAX", "$500-1,500"] },
              { label: "Inspection mirror + magnetic pickup", cells: ["See inside cabinets without disassembly; retrieve dropped fasteners", "Telescoping handle; lighted (some models)", "Klein Tools; Ullman; Mag-Mate", "$10-50"] },
            ]}
          />
        </section>

        {/* SECTION 11 — Hand tools */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            HVAC-specific hand tools
          </h2>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Service wrench (3/16 + 5/16 sq):</strong> opens + closes refrigerant access valves. Industry standard: Imperial 127-C, JB AC-S2.</li>
            <li><strong>Schrader valve core tool:</strong> remove + install Schrader cores under pressure. Yellow Jacket, Mastercool, Appion MGAVCT for full-pressure work.</li>
            <li><strong>Ratcheting box wrench set:</strong> tight-quarters refrigerant line work; standard SAE + metric. GearWrench, Tekton, Klein.</li>
            <li><strong>Adjustable wrenches (6, 8, 10, 12 in):</strong> general HVAC fitting work. Bahco, Klein, Channellock.</li>
            <li><strong>Pipe wrench (10 + 14 in):</strong> larger plumbing-style fittings for boiler + commercial work. Ridgid, Channellock.</li>
            <li><strong>Tin snips (left + right + straight):</strong> sheet metal ductwork; aviation snips are the industry standard. Wiss, Klein, Crescent.</li>
            <li><strong>Sheet metal hand seamer:</strong> bending + closing sheet metal. Malco, Klein.</li>
            <li><strong>Hex / Allen wrench set:</strong> set-screw fasteners on motors + blower wheels. Wera, Bondhus, Klein.</li>
            <li><strong>Insulated screwdrivers (1000V):</strong> per NFPA 70E for electrical work. Klein, Wera, Wiha.</li>
            <li><strong>Magnetic + bit drivers:</strong> sheet metal screws; multi-bit drivers from Klein, Megapro, Wiha.</li>
            <li><strong>Tape measure + level:</strong> general layout + alignment. Stanley, Klein, Empire.</li>
            <li><strong>Drill + impact driver (cordless):</strong> sheet metal screws + access panel removal. DeWalt, Milwaukee, Makita.</li>
          </ul>
        </section>

        {/* SECTION 12 — PPE */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Safety + PPE per OSHA 1910
          </h2>

          <ComparisonTable
            headers={["PPE", "OSHA citation", "Specification", "Replacement cadence"]}
            rows={[
              { label: "Safety glasses (ANSI Z87.1)", cells: ["1910.133", "Side shields; impact rating; anti-fog optional", "When scratched or damaged"] },
              { label: "Brazing gloves (leather)", cells: ["1910.252", "Leather gauntlets; heat-resistant; full-length cuffs", "When stiff or damaged"] },
              { label: "Cut-resistant gloves (sheet metal)", cells: ["1910.138", "ANSI cut level A3-A5; mechanic-style fit", "Every 3-6 months heavy use"] },
              { label: "Insulated gloves (electrical)", cells: ["1910.137", "Class 0 (1000V); Class 00 (500V); annual electrical test", "Annual electrical test required"] },
              { label: "Safety boots (steel/composite toe)", cells: ["1910.136", "ANSI Z41 + EH-rated for electrical hazard", "When sole worn or insole compromised"] },
              { label: "Hearing protection (earplugs/muffs)", cells: ["1910.95", "NRR ≥25dB; foam or moldable plugs", "Foam: per use; muffs: every 5+ years"] },
              { label: "Hard hat", cells: ["1910.135", "ANSI Z89.1 Type I or II", "Every 5 years"] },
              { label: "Fall harness + lanyard", cells: ["1910.140", "ANSI Z359; full-body harness; shock-absorbing lanyard", "When damaged; arrest device after deployment"] },
              { label: "Personal CO monitor", cells: ["1910.146 (confined space) + workplace recommendation", "Continuous; alarm at 35/100/200 ppm", "Sensor 2-3 year replacement"] },
              { label: "Arc-rated PPE (commercial electrical)", cells: ["NFPA 70E", "Calculated per incident energy; Category 1-4", "When damaged or thermal-tested limit reached"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            See <Link href="/hvac-safety-procedures-guide/" className="underline">safety procedures guide</Link> for the full OSHA 1910 framework + job hazard analysis methodology.
          </p>
        </section>

        {/* SECTION 13 — Software + smart tools */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Software + smart-tool integration
          </h2>

          <ComparisonTable
            headers={["Software / app", "Function", "Compatible with"]}
            rows={[
              { label: "Fieldpiece JOB LINK", cells: ["Phone-based app integrating Fieldpiece tools (manifold, micron gauge, anemometer, thermometer, etc.) into single dashboard + service ticket", "Fieldpiece JL-series tools"] },
              { label: "Testo Smart Probes app", cells: ["Phone-based app for Testo i-series tools (557s manifold, 550i, 510i manometer, etc.)", "Testo Smart Probes"] },
              { label: "Yellow Jacket Mantooth", cells: ["Phone app for Yellow Jacket Mantooth manifold + temperature clamps", "Yellow Jacket Mantooth system"] },
              { label: "CPS Pro-Set Bluetooth", cells: ["App for CPS digital manifolds (Black-MAX series)", "CPS Pro-Set Bluetooth tools"] },
              { label: "measureQuick", cells: ["Cross-brand HVAC commissioning + diagnostic app — accepts data from multiple tool brands; performs psychrometric + refrigerant calculations; generates commissioning reports", "Multiple brands; tool-agnostic"] },
              { label: "WrightSoft Manual J + S + D", cells: ["Industry-standard HVAC design software for ACCA Manual J load calc + Manual S sizing + Manual D duct design", "Standalone; outputs ACCA-compliant reports"] },
              { label: "CoolCalc + GreenCalc", cells: ["Web-based Manual J + S + D; simpler interface than WrightSoft", "Web app; subscription model"] },
              { label: "Job-management apps (ServiceTitan, Housecall Pro, FieldEdge)", cells: ["Service dispatch, invoicing, customer management for HVAC contractors", "Standalone with field tech app"] },
              { label: "Diagnostic flowchart apps (HVACR Coach, manufacturer-specific)", cells: ["Decision-tree assistance for technicians; some are manufacturer-specific (Lennox iComfort, etc.)", "Tablet or phone"] },
            ]}
          />
        </section>

        {/* SECTION 14 — DIY vs Pro */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            DIY vs Professional toolkit
          </h2>

          <p className="text-zinc-700 dark:text-zinc-300">
            Federal EPA Section 608 (40 CFR Part 82F) prohibits anyone without EPA 608 certification from intentionally venting refrigerant or performing refrigerant-side service. This effectively means consumers cannot perform refrigerant-side work on their own HVAC equipment without first obtaining EPA 608 certification. The boundary matters:
          </p>

          <ComparisonTable
            headers={["Task / tool", "DIY (no certification)", "Pro only (EPA 608 + license)"]}
            rows={[
              { label: "Filter change", cells: ["YES — homeowner DIY", "—"] },
              { label: "Thermostat replacement", cells: ["YES — homeowner DIY (basic models)", "Communicating thermostats — pro recommended"] },
              { label: "Outdoor condensate hose rinse", cells: ["YES — homeowner DIY", "—"] },
              { label: "Battery replacement (CO alarm, thermostat)", cells: ["YES — homeowner DIY", "—"] },
              { label: "Refrigerant pressure measurement", cells: ["NO — requires manifold + EPA 608 cert", "Required: EPA 608 + manifold + hoses"] },
              { label: "Refrigerant recovery + recharge", cells: ["NO — federal prohibition without EPA 608", "Required: EPA 608 + recovery machine + cylinder + scale"] },
              { label: "Brazing / tubing work", cells: ["NO — requires EPA 608 (recovery required first) + safety training", "Required: EPA 608 + brazing + nitrogen purge"] },
              { label: "Combustion analysis", cells: ["NO — requires combustion analyzer + interpretation training; consumer impact via professional service", "Required: combustion analyzer + ASHRAE/ANSI training"] },
              { label: "Duct cleaning", cells: ["LIMITED — home vacuum + register face cleaning OK; full duct cleaning requires professional equipment + access", "Recommended: pro for full cleaning"] },
              { label: "CO alarm + smoke alarm placement + battery", cells: ["YES — homeowner DIY per UL 2034 + IRC R315", "—"] },
              { label: "Electrical disconnect inspection", cells: ["LIMITED — visual inspection OK; any internal work requires LOTO + 1000V-rated PPE; professional recommended", "Required for any internal electrical work: LOTO + insulated tools + electrical training"] },
              { label: "Indoor air quality measurement (CO2, humidity, PM)", cells: ["YES — homeowner DIY with consumer-grade IAQ meter", "Required for ASHRAE-compliant reports: professional-grade instruments + certification"] },
            ]}
          />

          <FixCallout>
            <strong>EPA Section 608 penalty exposure for unlicensed refrigerant work:</strong> civil penalties up to $48,762 per day per violation (2024 EPA inflation-adjusted), criminal exposure for willful violations including imprisonment for severe cases. This is real federal enforcement — EPA inspectors investigate refrigerant sales records + technician licensing. If you&apos;re an HVAC homeowner doing research: complete EPA 608 certification (~$50, online or in-person) before purchasing any refrigerant-side tools. Otherwise, hire a certified contractor for any refrigerant work.
          </FixCallout>
        </section>

        {/* SECTION 15 — Service truck outfitting */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">15</span>
            Building a service truck — startup vs established outfitting
          </h2>

          <ComparisonTable
            headers={["Tier", "Investment", "What's included", "Use case"]}
            rows={[
              { label: "Apprentice / Day 1", cells: ["$1,500-2,500", "Basic manifold + 2-stage vacuum pump (6 CFM) + micron gauge + recovery machine + multimeter + clamp meter + leak detector (heated diode) + brazing torch + basic hand tools + entry-level PPE", "First 6 months of HVAC work; build with supervision"] },
              { label: "Journeyman (1-3 years)", cells: ["$5,000-8,000", "Adds: digital manifold (smart-app integration) + better recovery machine + combustion analyzer (basic) + anemometer + manometer + better leak detector (IR) + thermal imager (basic) + insulated tools + LOTO kit + better PPE", "Service tech doing 80% residential service work"] },
              { label: "Senior tech / commercial-capable (3-5 years)", cells: ["$10,000-20,000", "Adds: combustion analyzer (advanced) + IR leak detector (high-sensitivity) + insulation tester + advanced thermal imager (160x120+) + flow hood + advanced electrical (clamp meter wireless) + refrigerant identifier + advanced safety (arc-rated PPE for commercial)", "Senior tech doing commercial + complex residential work"] },
              { label: "Commissioning specialist / energy consultant", cells: ["$15,000-30,000+", "Adds: Blower Door + Duct Blaster (RESNET-certified work) + capture hood + commissioning software (measureQuick, etc.) + RESNET HERS training + Performance Path Manual J software + advanced IAQ instruments + envelope test equipment", "Commissioning + RESNET HERS rating + energy consulting work"] },
            ]}
          />

          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            For HVAC business owners managing multi-tech fleets: budget approximately $7,500-15,000 per truck for full-service residential capability; $20,000-30,000 per truck for commercial capability. Tools depreciate over 5-7 years per IRS Schedule. Many manufacturers offer fleet discount programs (Fieldpiece, Yellow Jacket, JB Industries).
          </p>
        </section>

        {/* SECTION 16 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">16</span>
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

        {/* SECTION 17 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">17</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>EPA + federal refrigerant:</strong> 40 CFR Part 82 Subpart F (EPA Section 608 — refrigerant management). 40 CFR Part 84 (AIM Act HFC phase-down). 49 CFR Part 173 (DOT — refrigerant cylinder transport).
            </p>
            <p className="mt-3">
              <strong>AHRI standards:</strong> AHRI Standard 740 (Performance of Refrigerant Recovery, Recycling, and Reclaim Equipment). AHRI Standard 1380 (Standard for Detection of Refrigerant Leaks). AHRI Standard 700 (Specifications for Fluorocarbon Refrigerants — purity standards for reclaim). AHRI Standard 210/240 (Performance Rating for HVAC Equipment). AHRI Standard 1230 (Variable Capacity Heat Pump).
            </p>
            <p className="mt-3">
              <strong>OSHA + workplace safety:</strong> 29 CFR 1910 General Industry: 1910.95 (Hearing); 1910.132-138 (PPE); 1910.133 (Eye/Face); 1910.135 (Head); 1910.136 (Foot); 1910.137 (Insulated Gloves); 1910.138 (Hand); 1910.140 (Personal Fall Protection); 1910.146 (Confined Spaces); 1910.147 (Lockout/Tagout); 1910.252 (Welding, Cutting, Brazing). NFPA 70E (Electrical Safety in the Workplace).
            </p>
            <p className="mt-3">
              <strong>ASHRAE standards:</strong> ANSI/ASHRAE Standard 15-2022 (Safety Standard for Refrigeration Systems). ANSI/ASHRAE Standard 34-2022 (Refrigerant Classifications). ANSI/ASHRAE Standard 111-2008 (Measurement, Testing, Adjusting, and Balancing of Building HVAC Systems). ANSI/ASHRAE/ACCA Standard 180-2018 (commercial HVAC maintenance). ANSI/ASHRAE Standard 90.1 + 90.2 (Energy Standards).
            </p>
            <p className="mt-3">
              <strong>ACCA standards:</strong> ACCA Standard 4 (Maintenance of Residential HVAC). ACCA QI Standard 5 (Quality Installation). ACCA Standard 9 (HVAC Quality Installation). ACCA Manual D + J + S + T (load + duct + equipment sizing + airflow balancing).
            </p>
            <p className="mt-3">
              <strong>RESNET + envelope testing:</strong> RESNET MINHERS Standards (HERS Index methodology — Blower Door + Duct Blaster requirements). RESNET ANSI/RESNET/ICC 380 (Standard for Testing Airtightness of Building Envelopes).
            </p>
            <p className="mt-3">
              <strong>UL + electrical safety:</strong> UL 1995 + UL 60335-2-40 (HVAC equipment safety; A2L provisions). UL 1995 (Heating and Cooling Equipment). NIST traceability for measurement equipment calibration.
            </p>
            <p className="mt-3">
              <strong>Manufacturer specifications consulted:</strong> Yellow Jacket Refrigeration Products; Fieldpiece Instruments; Fluke Corporation; Robinair (SPX Cooling Technologies); Mastercool; JB Industries; NAVAC; Inficon; Bacharach (a Halma Company); Testo; Sauermann (Kane Inc); CPS Products; FLIR Systems; Seek Thermal; Hikmicro; TSI Incorporated; Dwyer Instruments; UEI Test Instruments; Energy Conservatory; Retrotec; Klein Tools; Wera Werk Hermann Werner; Wiha Tools; Smith Equipment; Victor Technologies; Harris Products; Lucas-Milhaupt; Worthington Industries; AGS Inc.; Manchester Tank. (Manufacturer specifications change frequently — always verify current model specifications + A2L compatibility + UL listings on manufacturer datasheets before purchase.)
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific retail prices (fluctuate weekly; check Grainger, MSC, Carrier Enterprise, RE Michel, ABCO, Watsco for current pricing). Specific tool rankings or &quot;best of&quot; lists (subjective; depend on use case; brand-preference debates without clear right answer). Affiliate links (this site does not earn commissions on tool sales). Calibration laboratory recommendations (use NIST-traceable labs; manufacturers offer factory calibration). Tool-specific configuration guides (consult manufacturer documentation).
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related guides + calculators</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/hvac-refrigerant-recovery-guide/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><ShieldCheck className="h-4 w-4" /> Refrigerant Recovery Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">EPA Section 608 procedure + AHRI 740 recovery requirements.</p>
            </Link>
            <Link href="/hvac-safety-procedures-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Safety Procedures Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">OSHA 1910 framework + PPE + LOTO + A2L safe-work.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Tool use case + Manual T airflow + Blower Door + Duct Blaster procedures.</p>
            </Link>
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">14-point tune-up procedure + combustion analyzer use.</p>
            </Link>
            <Link href="/superheat-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Superheat Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Math your digital manifold performs automatically.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees that use the tools described here.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

void [Activity, Wrench, Zap, Thermometer, Wind, Flame, Droplet, Eye, ListChecks, FileCheck, Lookups, Panel, ServiceProblem, VerdictBanner];
