import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Wind, Gauge, ListChecks, AlertTriangle, FileCheck, ShieldCheck, Wrench, Layers } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/hvac-duct-design-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Duct Design Guide — Manual D Explained, System Topology to Static Pressure Budgeting",
  description:
    "Complete guide to residential and small-commercial HVAC duct design: ACCA Manual D methodology, six system topologies, sizing methods (equal-friction, static-regain, constant-velocity), total external static pressure budgeting, fitting equivalent lengths, material selection (galvanized vs flex vs duct board), SMACNA leakage classes, IECC insulation requirements, common installation failures. Sourced from ACCA Manual D 3rd edition, SMACNA HVAC Duct Construction Standards, ASHRAE Handbook of Fundamentals 2021 Chapter 21, IRC 2021, and IECC 2021.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Duct Design Guide — Manual D, System Topology, Static Pressure",
    description: "Complete Manual D methodology + 6 topologies + materials + sealing + balancing. Companion to the duct size calculator.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Duct Design Guide — Manual D Explained",
    description: "System topology, sizing methods, TESP budgeting, material selection. Companion to the duct calculator.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What is ACCA Manual D and how does it fit with Manual J?",
    a: "ACCA Manual D, Residential Duct Systems (3rd edition, current ANSI-accredited standard) is the residential duct-design counterpart to Manual J. The design cascade: Manual J produces total cooling load + heating load + room-by-room CFM requirements. Manual S converts the cooling load into a specific equipment selection with AHRI-rated capacity at the home's design conditions. Manual D takes the equipment's blower-curve external static pressure budget and the room-by-room CFM from Manual J, then sizes ductwork to deliver each room's CFM within the static budget. Manual T (System Balancing and Air Distribution) closes the loop by verifying installed airflow matches design. Skip any step and the system can't deliver its rated performance. Manual D references IRC Chapter 16 (M1601 ductwork construction) and SMACNA HVAC Duct Construction Standards for material gauges, leakage classes, and installation details. The interactive duct calculator on this site implements Manual D's equal-friction sizing method for one duct section at a time; the full Manual D process sizes every trunk and branch in the system simultaneously.",
  },
  {
    q: "How do I pick a friction rate for my duct system?",
    a: "ACCA Manual D Table 7 publishes recommended friction rates: 0.08 in.w.c. per 100 ft of duct for residential supply trunks and branches, 0.05 for residential returns, 0.10-0.20 for commercial. These targets balance duct cost (lower friction means larger ducts which cost more material and take up more space) against blower work (higher friction means smaller ducts but more pressure drop and more blower current draw and noise). Going below 0.05 oversizes ducts without comfort benefit. Going above 0.10 on residential supply pushes velocity into the audible range and forces a larger blower. The duct calculator's application preset dropdown sets these defaults; override only if you have a specific design reason (very long line runs sometimes need 0.06 in.w.c./100ft to keep total static within blower spec).",
  },
  {
    q: "What is Total External Static Pressure and why does it matter?",
    a: "Total External Static Pressure (TESP) is the total resistance the blower must overcome — outside the equipment cabinet — to deliver design airflow. Components: (1) Straight-duct friction (sum of section lengths × friction rate per 100 ft for supply + return), (2) fitting equivalent lengths (elbows, takeoffs, transitions, register losses, expressed as additional feet of straight duct at the same diameter), (3) filter pressure drop (~0.1-0.3 in.w.c. for typical residential pleated MERV 8), (4) coil pressure drop (~0.15-0.30 in.w.c. for residential A-coil), (5) grille and register losses. Sum: the equipment's published blower curve must produce design CFM at this total static. Typical residential design budget is 0.50 in.w.c. for variable-speed blowers, 0.20-0.30 for PSC blowers. Exceed the budget and airflow drops, capacity falls, comfort suffers. Manual D's primary contribution to system design is making the TESP calculation routine.",
  },
  {
    q: "Is flexible duct as good as smooth-wall galvanized?",
    a: "Functionally for short runs, yes; from a pressure-drop perspective, no. Flex duct has 1.5-2.5× the friction of smooth-wall galvanized at the same diameter and CFM (the published multipliers vary by manufacturer; Atco, Flexmaster, and Genflex all publish their own friction charts). Reasons: (1) the corrugated inner liner adds surface roughness, (2) flex is rarely installed perfectly taut so it has additional bending and compression losses, (3) sharp turns through flex add significant equivalent length. ACCA Manual D Appendix 3 publishes flex correction factors. Best practice: size flex for the manufacturer's flex-specific friction chart OR size for galvanized and upsize by one standard size when using flex. Use galvanized for long runs (over 25 ft of equivalent length); use flex for short connections, vibration isolation, and tight-cavity routing.",
  },
  {
    q: "What's the IECC insulation requirement for ducts in unconditioned space?",
    a: "IECC 2021 Section R403.3 requires supply ducts in unconditioned spaces (attic, crawlspace, garage) to be insulated to R-8 minimum; return ducts in unconditioned spaces to R-6 minimum. Ducts inside the building envelope (within conditioned space) have no insulation requirement under IECC. For colder climates (Zone 6+), some jurisdictions require R-12 supply / R-8 return. Insulation requirement matters because uninsulated ducts in 130-150°F summer attics lose 15-25% of net delivered cooling capacity to attic gains; the Manual J load calculation either accounts for that loss or assumes ducts are sealed and insulated to code minimum. The right move: put ducts in conditioned space when possible (interior soffits, dropped ceilings); when ducts must be in attic or crawlspace, seal mastic-tight and insulate to at least IECC minimum.",
  },
  {
    q: "What's the SMACNA leakage standard I should design to?",
    a: "SMACNA HVAC Air Duct Leakage Test Manual (2nd edition, 2012) defines leakage classes from CL-3 (~36 CFM/100 ft² at 1 in.w.c.) down to CL-24 (~3 CFM/100 ft²). For residential, IECC 2021 Section R403.3.5 requires duct leakage testing showing ≤4 CFM25/100 ft² of conditioned floor area for systems entirely within conditioned space, ≤8 CFM25 for systems with portions in unconditioned space. This is significantly tighter than legacy SMACNA CL-12 (12 CFM/100 ft² at 1 in.w.c.); achieving it requires mastic-sealed seams + sealed boots + properly installed flex collars. Tape alone (even UL-181 listed) eventually fails. Best practice: mastic + mesh tape on all transverse and longitudinal seams; mastic at all boot-to-drywall connections; aerosol sealant (Aeroseal) for hard-to-access leaks in retrofit applications. Energy code compliance now routinely requires Duct Blaster test results.",
  },
  {
    q: "How do I size return ducts vs supply ducts?",
    a: "At the same CFM, return ducts use lower friction (0.05 vs 0.08 in.w.c./100ft per ACCA Manual D Table 7) and lower velocity (≤600 fpm vs ≤900 fpm) for noise control. Returns often run through unconditioned attic or basement space closer to occupied rooms; lower velocity means lower whoosh. ASHRAE 33-2016 recommends ≤600 fpm for residential return paths near occupied space. Mathematically: at the same CFM, return cross-sectional area is about 25% larger than supply (which falls out from the 0.05 vs 0.08 friction-rate ratio). Also: return-grille face velocity must be lower than duct velocity — typically 300-400 fpm at the grille vs 500-600 fpm in the duct. That means grille free area is roughly 2× the duct cross-section. A 1,200 CFM return at 600 fpm duct velocity needs a 2 ft² duct cross-section; the matching grille needs ~400 in² free area (often a 24×24 with 50% net free area = ~288 in² grills, which is too small — you'd need 30×30 or two 20×20s).",
  },
  {
    q: "What's the practical limit on how far you can run flex duct?",
    a: "Manufacturer-published flex friction is calibrated for fully-extended (taut) installation. Real-world installations frequently have flex compressed in tight cavities, with extra slack to take up. Beyond about 25 ft of any individual flex run, accumulated friction (even with the manufacturer multiplier) eats into the static pressure budget faster than nominal sizing predicts. Best practice: limit individual flex runs to 25 ft; use galvanized rigid for longer runs. For boot connections to supply registers, the typical 6-10 ft flex connection works fine. For trunk-to-branch routing across an attic, use rigid galvanized to the room area then short flex (5-10 ft) into the boot. This pattern keeps total system static within the Manual D budget while preserving the installation flexibility of flex for the last connection.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Duct Design Guide — Manual D Explained, System Topology to Static Pressure Budgeting",
      description:
        "Complete residential duct design methodology: ACCA Manual D system topologies, sizing methods, total external static pressure budgeting, fitting losses, material selection, insulation, sealing, return design, common installation failures, code requirements.",
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
        { "@type": "Thing", name: "ACCA Manual D duct design" },
        { "@type": "Thing", name: "HVAC ductwork" },
        { "@type": "Thing", name: "Total external static pressure" },
        { "@type": "Thing", name: "SMACNA duct standards" },
        { "@type": "Thing", name: "Residential HVAC design" },
      ],
      keywords: [
        "hvac duct design",
        "manual d explained",
        "duct sizing guide",
        "trunk and branch duct",
        "duct static pressure",
        "duct insulation r-value",
        "smacna leakage class",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to design a residential HVAC duct system per ACCA Manual D",
      description: "Sequential procedure for designing a residential supply + return duct system from Manual J load calculation through Manual T balancing.",
      totalTime: "PT4H",
      tool: [
        { "@type": "HowToTool", name: "ACCA Manual D, Residential Duct Systems (3rd edition, ANSI/ACCA 1 Manual D)" },
        { "@type": "HowToTool", name: "ACCA Manual T, System Balancing and Air Distribution" },
        { "@type": "HowToTool", name: "ASHRAE Handbook of Fundamentals 2021 Chapter 21 (Duct Design)" },
        { "@type": "HowToTool", name: "SMACNA HVAC Duct Construction Standards" },
        { "@type": "HowToTool", name: "Manual D design software (Wrightsoft Right-D, Cool Calc, EnergyGauge) or this site's duct calculator" },
        { "@type": "HowToTool", name: "Equipment's published blower curve (AHRI 210/240 data sheet)" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Start with Manual J output", text: "Total cooling load, room-by-room CFM (cooling load / total × total system CFM), equipment selection per Manual S, equipment blower curve and external static pressure budget." },
        { "@type": "HowToStep", position: 2, name: "Choose system topology", text: "Trunk-and-branch is the residential default; radial for ranch homes with central equipment; perimeter loop for slab-on-grade in cold climates; ductless mini-split for tight homes with point-loads." },
        { "@type": "HowToStep", position: 3, name: "Pick friction rate and sizing method", text: "Equal-friction at 0.08 in.w.c./100ft for residential supply, 0.05 for return per Manual D Table 7. Static-regain only for large commercial; constant-velocity for specialty industrial." },
        { "@type": "HowToStep", position: 4, name: "Size trunks and branches", text: "Each section's required diameter = (0.0992 × Q^1.9 / friction)^(1/5.02) for round galvanized at standard air; round up to standard sheet-metal stock. Use duct calculator or Manual D worksheets." },
        { "@type": "HowToStep", position: 5, name: "Convert to rectangular if needed", text: "Huebscher equivalent diameter: D_eq = 1.30 × (a × b)^0.625 / (a + b)^0.25. Cap aspect ratio at 4:1 per Manual D — above that, friction exceeds prediction." },
        { "@type": "HowToStep", position: 6, name: "Compute Total External Static Pressure (TESP)", text: "Straight-duct friction (sections × friction rate) + fittings (equivalent length × friction rate) + filter ΔP + coil ΔP + grille losses. Confirm TESP ≤ equipment external static pressure budget at design CFM." },
        { "@type": "HowToStep", position: 7, name: "Specify materials, insulation, sealing", text: "Galvanized round/rectangular for trunk and long runs; flex for short connections under 25 ft. R-8 supply / R-6 return insulation in unconditioned spaces per IECC. Mastic-seal all seams to SMACNA CL-4 or tighter." },
        { "@type": "HowToStep", position: 8, name: "Commission and balance per Manual T", text: "After installation, measure actual CFM at each register, total airflow at the air handler, static pressure at supply + return plenums. Adjust dampers to achieve design CFM at each register within ±10%." },
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
        { "@type": "ListItem", position: 3, name: "HVAC Duct Design Guide" },
      ],
    },
  ];
}

export default function HvacDuctDesignGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">HVAC Duct Design Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Duct Design Guide — Manual D Explained, From System Topology to Static Pressure Budgeting
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A primary-source companion to our <Link href="/duct-size-calculator/" className="underline font-semibold">interactive duct size calculator</Link>. This guide covers the ACCA Manual D residential duct-design methodology end-to-end: system topology choice, the three sizing methods, Total External Static Pressure budgeting, fitting equivalent lengths, material selection (galvanized vs flex vs duct board), IECC insulation requirements, SMACNA leakage classes, return duct sizing, common installation failures, code requirements, and the Manual T commissioning + balancing sequence. Sourced throughout from ACCA Manual D 3rd edition, ASHRAE Handbook of Fundamentals 2021 Chapter 21, SMACNA HVAC Duct Construction Standards, IRC 2021, and IECC 2021.
          </p>

          <div className="mt-5 rounded-xl border-2 border-blue-300 bg-blue-50/60 p-4 dark:border-blue-700/60 dark:bg-blue-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>The companion calculator:</strong>{" "}
              <Link href="/duct-size-calculator/" className="underline font-semibold text-blue-700 dark:text-blue-300">/duct-size-calculator/</Link>{" "}
              implements ACCA Manual D equal-friction sizing for one duct section at a time — enter CFM + friction rate (or pick an application preset), get standard round diameter, velocity, actual friction, and Huebscher rectangular equivalents. This guide is the education layer covering the broader system design context that the calculator can&apos;t.
            </p>
          </div>
        </header>

        {/* SECTION 01 — What duct design accomplishes */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            What duct design actually accomplishes
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            A residential HVAC duct system has one job: deliver the design CFM each room needs (per Manual J), at acceptable noise levels, with total external static pressure within the blower&apos;s capability at design CFM. Get that right and the equipment delivers its rated capacity, every room hits setpoint, and the system runs quietly. Get it wrong — undersized return, oversized trunk with no balance, leaky ducts in unconditioned attic — and 15-40% of equipment capacity disappears between the blower and the supply registers.
          </p>

          <KeyInsight tone="blue" title="The cost of getting duct design wrong">
            NIST and Lawrence Berkeley National Laboratory studies document that residential duct systems commonly lose 25-40% of net delivered capacity to a combination of leakage, undersizing, and uninsulated ducts in unconditioned space. The numbers compound: a 3-ton AC commissioned on the wrong ductwork can deliver only 2 tons of effective capacity at the registers — the homeowner experiences a system that doesn&apos;t keep up, the contractor adds more cooling tonnage, and the cycle repeats. ACCA Manual D published in 1991 specifically because the trade had been improvising duct sizing for decades and getting it wrong consistently.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The structural argument: equipment efficiency (SEER, AFUE) is rated at the equipment&apos;s nameplate airflow with zero duct losses. Real installations always have non-zero duct losses; correctly designed ducts limit those losses to a few percent. Carelessly designed ducts can compound to 30-50% effective efficiency loss — the homeowner is paying full SEER price for half SEER performance. Manual D&apos;s rigorous methodology cuts that gap to single-digit percent, which is the difference between equipment hitting its rated cost-per-BTU and not.
          </p>
        </section>

        {/* SECTION 02 — Manual D in the cascade */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            Manual D&apos;s place in the design cascade
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Residential HVAC design follows a four-step ACCA cascade. Each step produces inputs the next step needs:
          </p>

          <ComparisonTable
            headers={["Step", "Standard", "Input", "Output"]}
            rows={[
              { label: "1. Load calculation", cells: ["Manual J 8th ed.", "Envelope + climate + occupancy", "Total cooling tonnage; heating BTU/hr; room-by-room CFM"] },
              { label: "2. Equipment selection", cells: ["Manual S", "Manual J load + AHRI 210/240 ratings", "Specific equipment (compressor + coil + furnace) and blower curve"] },
              { label: "3. Duct design", cells: ["Manual D 3rd ed. (THIS GUIDE)", "Room CFM + equipment blower TESP budget", "Duct sizing, layout, materials, insulation, sealing spec"] },
              { label: "4. Commissioning + balancing", cells: ["Manual T", "Installed system", "Measured airflow per register; dampers adjusted to design"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Manual D depends on Manual J for the room-by-room CFM (you can&apos;t size branches without knowing what each room needs) and on Manual S for the blower&apos;s external static pressure capability (you can&apos;t budget TESP without knowing the blower&apos;s limit). Skip Manual J and you guess at room CFM, which guarantees ductwork that&apos;s wrong somewhere. Skip Manual S and you size to the wrong blower budget. The cascade exists for a reason.
          </p>

          <FixCallout>
            <strong>The most common shortcut:</strong> running Manual J only to get a tonnage, then doing duct sizing &quot;by feel.&quot; This produces a system where the equipment is correctly sized but the air distribution can&apos;t deliver the design CFM to every room, so individual rooms run hot or cold. Manual D is required (by IRC reference for permit-required new construction) for the same reason Manual J is — the calculation is the only way to get it right consistently.
          </FixCallout>
        </section>

        {/* SECTION 03 — Topologies */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Six system topologies — when each makes sense
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual D recognizes six basic supply-side layouts. Each has structural advantages for specific home geometries and equipment choices:
          </p>

          <TechSection icon="insight" tone="blue" title="1. Trunk-and-branch (most common)">
            One large main trunk runs from the air handler the length of the home; smaller branches takeoff perpendicular to feed individual rooms or zones. Pros: simple to design and balance; easy to retrofit additional branches; well-understood failure modes. Cons: trunk-and-branch can be more material than radial when the trunk is long. Typical use: most ducted residential single-story and two-story homes; ~70% of US residential ductwork.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="2. Extended (or reducing) plenum">
            Trunk-and-branch with a long trunk that progressively reduces in size as branches takeoff (the trunk &quot;reduces&quot; from 14&quot; at the air handler to 8&quot; at the far end as CFM in the trunk falls). Pros: matches Manual D friction-rate philosophy precisely; trunk velocity stays approximately constant; uses less material than a constant-size trunk. Cons: more design effort; harder to retrofit additional branches without re-sizing. Typical use: well-designed new construction with careful attention to airflow optimization.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="3. Radial">
            Individual branches radiate from a central plenum at the air handler; no trunk per se. Pros: shorter individual duct runs; easier when air handler is centrally located. Cons: many penetrations through the equipment plenum; central equipment must be physically central to the home for radial to work. Typical use: ranch homes with centrally-located equipment; small commercial spaces.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="4. Perimeter loop (slab-on-grade cold climates)">
            A continuous duct loop runs around the perimeter of the home embedded in (or under) the slab. Supply branches drop from the loop to floor registers along exterior walls. Equipment is connected at one or two points to the loop. Pros: floor-register supply at exterior walls combats cold floors and downdraft from windows; works well with slab-on-grade construction. Cons: complex to install correctly; difficult to retrofit; expensive; vulnerable to slab moisture issues. Typical use: cold-climate slab-on-grade new construction (Zones 5-7).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="5. Trunk-and-branch with auxiliary equipment">
            Combination layout: main trunk-and-branch for primary supply, plus auxiliary smaller equipment (mini-split, dedicated dehumidifier, supplemental returns) handling specific zones. Pros: addresses zones that the main system can&apos;t serve well; handles point-load problems (basement, bonus room, sunroom). Cons: multiple pieces of equipment to maintain. Typical use: complex homes with additions, basements, or zones with very different load characteristics.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="6. Ductless mini-split (no traditional ducts)">
            Refrigerant lines run directly from outdoor compressor to individual indoor head units in each conditioned zone. No supply or return ductwork. Pros: eliminates duct losses entirely (often 25-40% of equipment capacity in conventional systems); precise per-zone temperature control; quiet; works well in tight construction. Cons: indoor head units visible in each room; higher upfront cost per zone; refrigerant line runs limited (typically 25-100 ft); cooling and heating from the same head unit can compromise comfort in transitional weather. Typical use: high-performance tight construction; additions; spaces where ductwork installation is impractical; conversion of unconditioned spaces.
          </TechSection>
        </section>

        {/* SECTION 04 — Sizing methods */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Three sizing methods — equal-friction, static-regain, constant-velocity
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ACCA Manual D and ASHRAE Handbook of Fundamentals Chapter 21 recognize three primary duct sizing methodologies:
          </p>

          <ComparisonTable
            headers={["Method", "Mechanism", "When used", "Pros / cons"]}
            rows={[
              { label: "Equal-friction", cells: ["Friction rate held constant across all sections", "Most residential + small commercial low-pressure systems", "Simple arithmetic; predictable TESP; doesn't naturally balance flow without dampers"] },
              { label: "Static-regain", cells: ["Velocity-pressure changes used to recover static pressure at branches", "Large commercial + medium-pressure VAV systems", "Self-balancing; tight pressure budgeting; requires iterative design software"] },
              { label: "Constant-velocity", cells: ["Velocity held constant; sections sized accordingly", "Specialty: paint booths, fume hoods, industrial conveying", "Maintains transport velocity for particulates; inefficient for general HVAC"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For residential, equal-friction is the standard. The duct calculator on this site implements equal-friction sizing per the ASHRAE friction equation for galvanized round at standard air density:
          </p>

          <pre className="my-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">{`ΔP/100ft = 0.0307 × (V/100)^1.9 / D^1.22

V (velocity, fpm) = 576 × Q / (π × D²)  [Q in CFM, D in inches]

Closed-form diameter solve:
D = (0.0992 × Q^1.9 / friction_target)^(1/5.02)`}</pre>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            That equation is the heart of every equal-friction sizing decision. The calculator does the round-up to standard sheet-metal stock automatically. For most residential supply trunks the answer comes out 12&quot;, 14&quot;, or 16&quot;; for branches, 6&quot;, 7&quot;, or 8&quot;; for returns, one or two standard sizes larger than the supply at the same CFM.
          </p>

          <KeyInsight tone="amber" title="When equal-friction stops being good enough">
            Equal-friction works well for systems where every branch is roughly the same length. When some branches are much longer than others (3-story homes, wings, additions), equal-friction sizes the shorter branches to deliver more CFM than needed (because they have less total friction), requiring damper balancing to throttle them down. For systems with 4× or greater range in branch length, static-regain produces better natural balance. ACCA Manual D recommends switching to static-regain only for systems where the cost of balancing dampers exceeds the additional design effort — typically meaningful only for large commercial.
          </KeyInsight>
        </section>

        {/* SECTION 05 — TESP */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Total External Static Pressure (TESP) budgeting
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Every duct system has a Total External Static Pressure — the sum of all the pressure drops the blower must overcome outside the equipment cabinet. The blower&apos;s published curve (in the AHRI 210/240 data sheet for the equipment) shows what airflow the blower can produce against any given TESP. The job of duct design is to keep TESP at or below the budget the equipment can support at design CFM.
          </p>

          <ComparisonTable
            headers={["Component", "Typical residential range (in.w.c.)", "Notes"]}
            rows={[
              { label: "Supply trunk friction", cells: ["0.04-0.10", "Section length × friction rate / 100; typically 50-80 ft of trunk"] },
              { label: "Supply branch friction", cells: ["0.02-0.04", "Each branch contributes independently to the worst-case path"] },
              { label: "Return duct friction", cells: ["0.03-0.06", "Generally lower than supply due to 0.05 vs 0.08 friction target"] },
              { label: "Fitting equivalent length", cells: ["0.05-0.15", "Sum of elbow/takeoff/transition equivalent lengths × friction rate"] },
              { label: "Filter pressure drop", cells: ["0.10-0.30", "Clean MERV 8 ≈ 0.10; loaded MERV 13 ≈ 0.30; design for loaded"] },
              { label: "Cooling coil ΔP (wet)", cells: ["0.15-0.30", "Manufacturer's published wet-coil pressure drop at design CFM"] },
              { label: "Supply registers", cells: ["0.03-0.06", "Per Manual D Table 9; high-end stamped registers higher"] },
              { label: "Return grilles", cells: ["0.02-0.05", "Low-velocity face design minimizes return grille loss"] },
              { label: "TOTAL (typical residential design)", cells: ["0.40-0.80", "Variable-speed blowers handle up to 0.80 at design CFM"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The blower curve from the equipment&apos;s AHRI 210/240 data sheet shows the airflow vs static-pressure relationship. Look up the design CFM on the curve and read off the maximum allowable TESP — that&apos;s the budget. Sum your duct system&apos;s pressure drops and verify they fit under it. If they don&apos;t, you have three choices: increase trunk/branch diameters to reduce friction, choose larger registers/grilles to reduce terminal losses, or accept a smaller design CFM (which means less capacity to each room).
          </p>

          <FixCallout>
            <strong>The most common TESP failure</strong> is the filter. A clean pleated MERV 8 measures 0.10 in.w.c. at design CFM; a 6-month-old pleated MERV 13 in heavy use measures 0.35 in.w.c. The 0.25 in.w.c. difference is 30-50% of typical TESP budget. Design TESP for a loaded filter (use the manufacturer&apos;s maximum-loading published value), then enforce filter replacement intervals. The homeowner doesn&apos;t need to know about TESP; they just need to change the filter on schedule. The educated technician confirms the loaded-filter assumption in the design and flags filter ΔP changes during seasonal service visits.
          </FixCallout>
        </section>

        {/* SECTION 06 — Fittings */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Fitting equivalent lengths (the missing piece of total static)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Straight-duct friction is the visible component of TESP. Fitting losses are the invisible one — every elbow, takeoff, transition, and reducer adds resistance equivalent to some length of straight duct at the same diameter. ACCA Manual D Appendix 3 and SMACNA Table 4-1 tabulate equivalent lengths for common fittings. Selected values:
          </p>

          <ComparisonTable
            headers={["Fitting", "Description", "Equivalent length (ft)"]}
            rows={[
              { label: "90° smooth elbow", cells: ["Long-radius (R/D ≥ 1.5)", "15-25 ft"] },
              { label: "90° mitered elbow", cells: ["Sharp 90° with turning vanes", "30-50 ft"] },
              { label: "45° elbow", cells: ["Half-bend, smooth radius", "8-12 ft"] },
              { label: "Wye takeoff (45°)", cells: ["Branch into trunk at 45°", "10-15 ft"] },
              { label: "Tee takeoff (90°)", cells: ["Branch into trunk at 90° — minimize use", "30-60 ft"] },
              { label: "Boot takeoff with damper", cells: ["Branch with balancing damper", "15-25 ft"] },
              { label: "Square-to-round transition", cells: ["Trunk to round branch", "5-10 ft"] },
              { label: "Round-to-round reducer", cells: ["Diameter change in trunk", "3-8 ft"] },
              { label: "1\" thick MERV 8 filter (clean)", cells: ["~0.10 in.w.c. ΔP at design CFM", "25-50 ft equiv. at 0.08 friction"] },
              { label: "Wet cooling coil", cells: ["Per manufacturer's data sheet", "60-120 ft equiv. at 0.08 friction"] },
              { label: "Supply register (stamped face)", cells: ["50% net free area, design face vel", "10-20 ft equiv."] },
              { label: "Return grille (high-cap)", cells: ["60% net free area, low face vel", "5-15 ft equiv."] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Practical example: a 50 ft supply trunk run with 2 long-radius 90° elbows, 4 wye takeoffs, a square-to-round transition, a clean MERV 8 filter, and a wet coil. Total equivalent length:
          </p>

          <pre className="my-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950">{`50 ft (straight)
+ 2 × 20 ft (elbows)        = 40 ft
+ 4 × 12 ft (wye takeoffs)  = 48 ft
+ 1 × 8 ft (transition)     = 8 ft
+ 1 × 35 ft (filter equiv)  = 35 ft
+ 1 × 80 ft (coil equiv)    = 80 ft
─────────────────────────────────
Total equivalent length:   261 ft

Trunk static @ 0.08 friction:
261 × 0.08 / 100 = 0.21 in.w.c.`}</pre>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            That&apos;s just the supply trunk; the return adds another 100-150 ft of equivalent length. Total system TESP lands around 0.40-0.50 in.w.c., well within the budget of a typical residential variable-speed blower (typical budget 0.50-0.80). Skip fitting losses in TESP math and you under-budget by 0.15-0.25 in.w.c. — enough to push the design over the blower&apos;s capability and starve the system of airflow.
          </p>
        </section>

        {/* SECTION 07 — Materials */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Material selection — galvanized vs flex vs duct board vs lined
          </h2>

          <ComparisonTable
            headers={["Material", "Friction multiplier vs galvanized", "Cost (relative)", "Best use case"]}
            rows={[
              { label: "Galvanized smooth round/rect", cells: ["1.0× (baseline)", "100%", "Trunk + long runs; preferred everywhere material cost isn't critical"] },
              { label: "Spiral galvanized round", cells: ["1.05-1.1×", "120%", "Exposed application where aesthetics matter; commercial"] },
              { label: "Flex duct (extended taut)", cells: ["1.5-2.0×", "30-50%", "Short connections to boots; vibration isolation; tight cavity routing"] },
              { label: "Flex duct (sagging/compressed)", cells: ["2.0-3.0×+", "(installation defect)", "Avoid; recover by re-tensioning"] },
              { label: "Fiberglass duct board", cells: ["1.1-1.3×", "60-80%", "Residential trunk where on-site fabrication is preferred; some sound attenuation"] },
              { label: "Lined sheet metal", cells: ["1.3-1.5×", "150%", "Noise-sensitive applications (supply within bedroom zone)"] },
              { label: "Internally-insulated flex", cells: ["1.5-2.0× (similar to bare flex)", "120%", "Replaces external insulation + flex with single product; thermal performance similar"] },
              { label: "Aluminum flex (more expensive)", cells: ["1.4-1.8×", "120%", "Light-duty applications; corrosion resistance vs galvanized"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Source for friction multipliers: ACCA Manual D Appendix 5; ASHRAE Handbook of Fundamentals 2021 Chapter 21; manufacturer-published friction charts (Atco, Flexmaster, Genflex for flex; CertainTeed, Owens Corning for duct board). Manufacturer&apos;s specific values are slightly different but the relative ranking is consistent.
          </p>

          <KeyInsight tone="blue" title="Practical material strategy">
            For residential new construction: galvanized rigid for the supply trunk and any branch run over 15 ft; short flex (5-10 ft) connections at each boot for vibration isolation and cavity-fitting flexibility. Reverse for returns — solid rigid construction throughout, with no flex except at the air-handler connection. For commercial: galvanized or spiral throughout; lined sheet metal in supply runs near occupied space if noise control matters; rigid duct board for trunk where on-site fabrication is cost-effective. Avoid: long runs of flex (over 25 ft), boots without rigid transition, flex installed compressed against framing.
          </KeyInsight>
        </section>

        {/* SECTION 08 — Insulation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Insulation requirements (IECC + IRC)
          </h2>

          <ComparisonTable
            headers={["Location", "Supply insulation", "Return insulation", "Code reference"]}
            rows={[
              { label: "Inside conditioned envelope", cells: ["None required", "None required", "IECC R403.3 exemption"] },
              { label: "Unconditioned attic, crawlspace, garage (Zones 1-5)", cells: ["R-8 minimum", "R-6 minimum", "IECC 2021 R403.3"] },
              { label: "Unconditioned attic (Zones 6-8)", cells: ["R-12 (some jurisdictions)", "R-8 (some jurisdictions)", "Local amendments to IECC"] },
              { label: "Exterior duct (above-roof)", cells: ["R-12 + weatherproof jacket", "R-8 + weatherproof jacket", "IRC M1601.1.4; jurisdictional"] },
              { label: "Duct in unconditioned space (commercial)", cells: ["R-8 minimum", "R-6 minimum", "ASHRAE 90.1 Table 6.8.2"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Insulation matters because uninsulated ducts in 130-150°F summer attics lose 15-25% of net delivered cooling capacity to attic gains. IECC R-8 minimum cuts that to 4-7%; pushing to R-12 cuts it further but with diminishing returns. The right move: locate ducts inside the conditioned envelope when possible (sealed attics with conditioned air, interior soffits, dropped ceilings), eliminating duct losses entirely. When ducts must go in attic or crawlspace, seal mastic-tight and insulate to at least IECC minimum; consider R-12 in Zones 5-7.
          </p>

          <FixCallout>
            <strong>Inside vs outside the envelope:</strong> the BIGGEST efficiency gain in residential duct design is moving the ducts inside the conditioned envelope. A sealed-attic home (closed-cell foam on the underside of the roof deck, attic is conditioned space) has duct losses near zero because the &quot;duct in attic&quot; isn&apos;t in unconditioned space anymore. ENERGY STAR Home v3.2 awards credit for this configuration. Costs more upfront; pays back through dramatically reduced duct losses over 15-20 year equipment life.
          </FixCallout>
        </section>

        {/* SECTION 09 — Sealing */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Sealing standards — SMACNA classes and the IECC duct leakage requirement
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Duct leakage is measured in CFM at a specific test pressure (typically 25 Pa or 1 in.w.c.). SMACNA HVAC Air Duct Leakage Test Manual (2nd edition 2012) defines leakage classes; IECC 2021 Section R403.3.5 requires post-installation testing for residential code compliance.
          </p>

          <ComparisonTable
            headers={["Class", "Leakage at 1 in.w.c.", "Achievable with", "Notes"]}
            rows={[
              { label: "SMACNA CL-3", cells: ["36 CFM/100 ft²", "Standard taped construction", "Legacy commercial baseline; not code compliant"] },
              { label: "SMACNA CL-6", cells: ["12 CFM/100 ft²", "Mastic on most seams + tape", "Older residential standard"] },
              { label: "SMACNA CL-12", cells: ["6 CFM/100 ft²", "Mastic + mesh on all seams", "Improved tight construction"] },
              { label: "SMACNA CL-24", cells: ["3 CFM/100 ft²", "Mastic + mesh + boot seal + aerosol", "High-performance new construction"] },
              { label: "IECC 2021 R403.3.5 (CZ-2A)", cells: ["≤4 CFM25/100 ft² conditioned area", "Per code testing requirement", "All inside envelope OR ≤8 if any outside"] },
              { label: "IECC 2021 R403.3.5 (CZ-3 through 8)", cells: ["Same: ≤4 inside / ≤8 with portion outside", "Per code testing requirement", "Stricter than CL-12 for residential"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The practical methods to achieve modern leakage targets: (1) <strong>Mastic + fiberglass mesh tape</strong> on every transverse and longitudinal seam — the bottom-tier reliable approach. (2) <strong>UL-181 listed metal tape</strong> alone — initially seals but ages out, not recommended for new work. (3) <strong>Aerosol duct sealing</strong> (Aeroseal and competitors) — pumps liquid sealant through ducts under pressure; sealant accumulates at leaks. Highly effective for retrofitting older systems; expensive but typically pays back in 2-5 years on energy savings. (4) <strong>Foam-gasket connection systems</strong> from manufacturers like CleanFit and Fast Flange — engineered alternatives to mastic.
          </p>

          <FixCallout>
            <strong>Why tape alone fails:</strong> adhesive tapes (even UL-181 listed) lose seal strength as temperature cycles and substrate flexes. After 5-10 years tape typically delaminates from one or both surfaces and leakage rises. Mastic doesn&apos;t age the same way — it remains a flexible, adherent seal for the equipment&apos;s service life. For new construction targeting code compliance and longevity, mastic + mesh is the safer choice.
          </FixCallout>
        </section>

        {/* SECTION 10 — Returns */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Return duct design — what's different from supply
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Return ducts have three structural differences from supplies: lower friction target (0.05 vs 0.08 in.w.c./100ft per Manual D Table 7), lower velocity limit (≤600 fpm vs ≤900 fpm), and noise sensitivity (return paths often run closer to occupied bedrooms). Practical implications:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>One size larger at the same CFM.</strong> A 1,200 CFM supply trunk needs 14&quot; round at 0.08 friction; the same CFM return needs 16&quot; round at 0.05 friction (one full standard size up). This is by design — lower velocity = quieter.</li>
            <li><strong>Lower face velocity at the grille.</strong> Supply registers typically run 500-600 fpm face velocity (the design balances throw distance against noise); return grilles run 300-400 fpm. That means return grille gross area is roughly 2× the duct cross-section. A 1,200 CFM return needs 2 ft² duct area = 288 in², but needs ~600 in² gross grille area (the 50% net free area of typical stamped grilles).</li>
            <li><strong>Filter location matters.</strong> Most residential systems put the filter at the return-air drop into the air handler. That means the filter ΔP is part of the return-side static budget. Some designs use a filter rack at each return grille (multiple smaller filters); this distributes filter pressure drop but adds maintenance overhead.</li>
            <li><strong>Central return vs distributed returns.</strong> Central return (single large return grille in a hallway): cheapest but requires transfer grilles (or undercut doors) to circulate air from individual bedrooms. Distributed returns (one return per bedroom or zone): better air mixing and quieter; more material and labor cost.</li>
            <li><strong>Return air pathways.</strong> When using central returns, bedrooms need air pathways back to the central return. Door undercuts of 1&quot; for typical residential bedrooms; for larger CFM, transfer grilles in walls or above doors. Without pathways, closing a bedroom door pressurizes the room and reduces airflow to that room; under-cut or transfer grille resolves it.</li>
          </ul>
        </section>

        {/* SECTION 11 — Common failures */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Common installation failures (and how to avoid them)
          </h2>

          <TechSection icon="problem" tone="amber" title="Failure 1 — Undersized return (the #1 issue)">
            Designer sizes return for the supply&apos;s 0.08 friction target instead of 0.05. The return ends up smaller than the supply at the same CFM, return velocity exceeds 600 fpm, and the homeowner hears whoosh whenever the system runs. Worse, undersized returns starve the blower of air, dropping system airflow 10-20% below design and degrading capacity. Fix: design returns at 0.05 friction; verify return grille area meets the face-velocity target.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 2 — Flex installed compressed against framing">
            Flex squashed against joists or studs sees friction multipliers of 2.5-3.5× rather than the manufacturer&apos;s rated 1.5-2.0×. Symptom: rooms with flex-served registers underperform; the system delivers maybe 60-70% of design CFM to those rooms. Fix: install flex with deliberate tension (cleaner cross-section), use rigid duct for any run that can&apos;t be tensioned, support flex with strapping every 4-6 ft to prevent sag.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 3 — Trunk-to-branch connection without takeoff fitting">
            Branches connected directly to the trunk with a hole through sheet metal (no proper takeoff fitting like a saddle or wye) create dramatic flow disruption — the trunk velocity profile across the branch opening is highly non-uniform, and effective CFM to the branch falls 30-50% below what straight-duct math predicts. Fix: use SMACNA-detailed takeoff fittings — saddle for boot connections, wye for major branches, with proper 5-degree minimum transition angle.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 4 — Skipping fitting equivalent lengths in TESP math">
            Designer computes straight-duct friction but forgets elbows, takeoffs, and filter equivalent lengths. TESP design under-budgets by 0.15-0.25 in.w.c. — enough to push the actual TESP over the blower&apos;s capability. Symptom: system delivers 15-25% less CFM than design; capacity matches; rooms run warm. Fix: always include fitting equivalent lengths in TESP. Add 50-100% of straight-duct length as fitting allowance for typical residential layouts; do explicit math for complex layouts.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 5 — Trunk-and-branch with no balancing dampers">
            Equal-friction sizing produces a system where every branch runs at approximately the right friction rate, but small differences in branch length still leave some branches over-delivering CFM and others under-delivering. Manual T balancing dampers at each takeoff allow technicians to throttle the over-delivered branches. Skip the dampers and the system can&apos;t be balanced; the homeowner experiences hot/cold rooms regardless of equipment quality. Fix: install balancing dampers (manual or motorized) at every branch takeoff. Document the design CFM per room so future technicians can re-balance after duct modifications.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 6 — Ducts in unconditioned attic without proper insulation or seal">
            The classic failure: ducts in 130-150°F summer attic, insulated to legacy R-4.2 (or uninsulated under R-22 vintage), with tape-only seals that have failed after 10 years. Result: 25-40% capacity loss to attic gains and leakage. Fix: seal ducts to mastic-tight per SMACNA CL-24 (or CL-12 minimum), insulate to IECC R-8 (R-12 in Zones 6+), or — better — convert the attic to conditioned space.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 7 — Wrong register / grille selection">
            Stamped supply registers with 30% net free area at design CFM produce velocity well above noise targets at the face. Return grilles too small in cross-section restrict airflow and create whoosh. The catalog spec sheet matters; using whatever stock the supply house has on hand is a common mistake. Fix: specify supply registers with 40-50% net free area and 500-600 fpm face velocity at design CFM; specify return grilles with 50-60% net free area and 300-400 fpm face velocity.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Failure 8 — Filter selected without considering pressure drop">
            High-MERV filters (MERV 11-13) installed on systems designed for MERV 8 add 0.10-0.20 in.w.c. of ΔP at design CFM. That eats into the TESP budget and reduces system airflow. Symptom: capacity falls; rooms run warm. Fix: when upgrading filter MERV, recompute TESP and verify it&apos;s within blower capability. If not, upsize the filter housing (more area = lower face velocity = lower ΔP at the same loading) or accept the airflow penalty.
          </TechSection>
        </section>

        {/* SECTION 12 — Code */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            Code requirements
          </h2>

          <ComparisonTable
            headers={["Code / Standard", "What it requires", "Applies to"]}
            rows={[
              { label: "IRC 2021 Section M1601", cells: ["Duct construction (gauges, sealing, supports)", "All residential ductwork installation"] },
              { label: "IRC 2021 Section M1601.4", cells: ["Sealing per SMACNA standards", "All residential ductwork"] },
              { label: "IECC 2021 Section R403.3", cells: ["Duct insulation R-8 supply / R-6 return in unconditioned space", "New construction; major renovations"] },
              { label: "IECC 2021 Section R403.3.5", cells: ["Duct leakage testing required; ≤4 CFM25/100 ft² inside envelope", "New residential construction"] },
              { label: "IMC 2021", cells: ["Commercial duct construction and design", "Non-residential ductwork"] },
              { label: "NFPA 90A", cells: ["Air-handling systems > 2,000 CFM; smoke dampers, fire dampers", "Commercial + multi-family"] },
              { label: "ASHRAE 90.1 (commercial)", cells: ["Energy-efficient duct design + insulation", "Commercial new construction"] },
              { label: "ACCA Quality Installation Standard 5", cells: ["Manual J + S + D + T documentation", "Voluntary; required by some utility rebates"] },
              { label: "ENERGY STAR Single-Family New Homes v3.2", cells: ["Full Manual J + D + S + T per Whole-House Verification", "ENERGY STAR certified construction"] },
              { label: "California Title 24 (2025)", cells: ["State-specific HVAC compliance + testing", "California new residential"] },
            ]}
          />
        </section>

        {/* SECTION 13 — Commissioning */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Commissioning and balancing — ACCA Manual T
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Manual D ends with a designed duct system; Manual T verifies the installed system delivers what was designed. The commissioning sequence:
          </p>

          <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Measure total system airflow at the air handler</strong> with an anemometer or by static-pressure cross-reference to the blower curve. Should be within ±10% of equipment design CFM at design conditions.</li>
            <li><strong>Measure supply CFM at each register</strong> with a balometer (anemometer with capture hood). Sum across all supply registers should equal total system airflow within ±10%; differential is supply duct leakage.</li>
            <li><strong>Compare per-register CFM to Manual D design CFM for each room.</strong> Adjust balancing dampers to bring each room within ±10% of design.</li>
            <li><strong>Measure return CFM at each return grille</strong> similarly. Return CFM should match supply CFM (or supply minus design ventilation makeup).</li>
            <li><strong>Measure static pressure at supply + return plenums.</strong> Total external static should match the design TESP within ±15%. Significant deviation indicates installation problem (sealing leak, wrong material, undersized somewhere).</li>
            <li><strong>Duct leakage test per IECC R403.3.5</strong> with a Duct Blaster (calibrated fan + manometer). Total CFM25 leakage / conditioned floor area ≤ 4 CFM25/100 ft² for systems inside envelope, ≤ 8 for systems with portions outside.</li>
            <li><strong>Document everything</strong> on a commissioning report. Required by some certification programs (ENERGY STAR, HERS); good practice always.</li>
          </ol>

          <FixCallout>
            <strong>Commissioning is where most residential duct work fails.</strong> Designed-to-Manual-D systems frequently get installed without final balancing, dampers all wide open, and the homeowner gets a system that delivers wildly different CFM to each room. Manual T balancing — even just measuring and adjusting balancing dampers — recovers 70-80% of the per-room CFM accuracy. For new construction with permit-required commissioning, this happens routinely; for replacement equipment on existing ductwork, it&apos;s often skipped. If your contractor doesn&apos;t plan to balance, ask why.
          </FixCallout>
        </section>

        {/* SECTION 14 — DIY vs hire */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            DIY vs hire a duct designer
          </h2>

          <ComparisonTable
            headers={["Scenario", "DIY (this site's calculator)", "Hire a pro"]}
            rows={[
              { label: "Sizing one new branch addition", cells: ["✓ Sufficient", "Optional"] },
              { label: "Replacing equipment on existing ductwork", cells: ["✓ Verify ducts can handle new equipment CFM", "Optional"] },
              { label: "New construction (permit-required)", cells: ["Not sufficient", "Required"] },
              { label: "Major renovation with new ductwork", cells: ["Initial planning OK", "Required for permit"] },
              { label: "Commissioning + balancing", cells: ["DIY measurement with anemometer OK", "Pro for documentation requirements"] },
              { label: "Duct leakage test (IECC compliance)", cells: ["Equipment rental possible", "Pro with Duct Blaster equipment + reporting"] },
              { label: "Static pressure diagnosis on underperforming system", cells: ["Basic test OK with manometer", "Pro for full system audit"] },
            ]}
          />
        </section>

        {/* SECTION 15 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">15</span>
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

        {/* SECTION 16 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">16</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>ACCA Standards (primary methodology):</strong> ACCA Manual D, Residential Duct Systems, 3rd edition (ANSI-accredited). ACCA Manual J, Residential Load Calculation, 8th edition. ACCA Manual S, Residential Equipment Selection. ACCA Manual T, System Balancing and Air Distribution. ACCA Quality Installation Standard 5 (Residential HVAC).
            </p>
            <p className="mt-3">
              <strong>ASHRAE references:</strong> ASHRAE Handbook of Fundamentals 2021, Chapter 21 (Duct Design — friction equations, fitting losses, sizing methods, materials). Chapter 14 (Climatic Design Information). ASHRAE Standard 152 (Method of Test for Determining the Design and Seasonal Efficiencies of Residential Thermal Distribution Systems). ASHRAE 90.1 (Energy Standard for Buildings Except Low-Rise Residential Buildings — commercial duct insulation + sealing).
            </p>
            <p className="mt-3">
              <strong>SMACNA standards:</strong> SMACNA HVAC Duct Construction Standards — Metal &amp; Flexible, 3rd edition (2005). SMACNA HVAC Air Duct Leakage Test Manual, 2nd edition (2012). SMACNA Duct Liner Application Standard. SMACNA Round Industrial Duct Construction Standards.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Residential Code (IRC) 2021 Chapter 16 — Mechanical Code; Section M1601 (Ductwork construction) and M1601.4 (Sealing). International Energy Conservation Code (IECC) 2021 Section R403.3 (Duct insulation) and R403.3.5 (Duct leakage testing). International Mechanical Code (IMC) 2021 (commercial). California Title 24 (state-specific compliance).
            </p>
            <p className="mt-3">
              <strong>Fire and safety:</strong> NFPA 90A — Standard for the Installation of Air-Conditioning and Ventilating Systems. NFPA 90B — Standard for the Installation of Warm Air Heating and Air-Conditioning Systems. UL-181 (Duct Materials and Air Connectors).
            </p>
            <p className="mt-3">
              <strong>Equipment + air terminal standards:</strong> AHRI Standard 210/240 — Performance Rating of Unitary Air-Conditioning &amp; Air-Source Heat Pump Equipment (includes blower curves). AHRI Standard 880 — Performance Rating of Air Terminals. AHRI Standard 1300 — VAV Boxes.
            </p>
            <p className="mt-3">
              <strong>Certification programs:</strong> ENERGY STAR Single-Family New Homes Program v3.2 Technical Requirements (Duct Distribution System and Whole-House Verification sections). RESNET HERS Standards. PHIUS Passive House Standards.
            </p>
            <p className="mt-3">
              <strong>Research references:</strong> NIST and Lawrence Berkeley National Laboratory residential duct system efficiency studies (publicly available at energy.gov and lbl.gov). DOE Building America Solution Center duct design and sealing best practices.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> specific manufacturer product recommendations (varies by region and price tier — consult local supply houses). Specific software pricing (changes frequently — check vendor sites). Code-compliance opinions for specific jurisdictions (consult local building code office). Our companion calculator at <Link href="/duct-size-calculator/" className="underline">/duct-size-calculator/</Link> implements Manual D equal-friction sizing for one duct section at a time; for full system design hire a Manual D professional with full software, certification, and balancing capability.
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
            <Link href="/duct-size-calculator/" className="block rounded-xl border-2 border-blue-300 p-4 hover:bg-blue-50 dark:border-blue-700/60 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300"><Wind className="h-4 w-4" /> Duct Size Calculator (companion)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Interactive equal-friction sizing per Manual D. Round + Huebscher rectangular equivalents.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> HVAC Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Quick Manual J — total tonnage + heating BTU/hr that feeds duct CFM design.</p>
            </Link>
            <Link href="/hvac-load-calculation-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> HVAC Load Calculation Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manual J explainer — companion to the load calculator; produces CFM for duct design.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> HVAC Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees for airflow problems (frozen evap, undersized return, undersized duct).</p>
            </Link>
            <Link href="/high-head-pressure-causes/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> High Head Pressure Causes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Dirty/undersized condenser airflow is a top cause — duct system condition matters.</p>
            </Link>
            <Link href="/carrier-410a-charging-chart/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Carrier R-410A Charging Chart</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Field charging — verify after ductwork is delivering design CFM.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [ShieldCheck, Wrench, Layers, ListChecks, Lookups, Panel, ServiceProblem, VerdictBanner];
