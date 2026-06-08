import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { getRefrigerant, getPressureAtTempF, refrigerants } from "@/data/refrigerants";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";

const PAGE_URL = `${SITE_URL}/refrigerant-comparison-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Refrigerant Comparison Guide — Frameworks, Decisions, Trade-offs",
  description:
    "Framework for comparing HVAC refrigerants across thermodynamics, safety class, environmental impact, regulation, and field practice. Decision logic for residential AC, commercial refrigeration, chillers, and naturals.",
  alternates: { canonical: PAGE_URL },
};

const FAQS = [
  {
    q: "What's the single most important axis when comparing refrigerants?",
    a: "It depends on the decision. For new equipment specification, regulatory phase-down status often dominates — picking a refrigerant facing imminent restriction creates stranded-asset risk. For service decisions on existing equipment, lubricant compatibility and safety class compatibility with the equipment design dominate. For retrofit decisions, pressure envelope match and capacity match are critical. The 5-axis framework forces you to consider all of them, but in practice one axis is usually the binding constraint for a given decision.",
  },
  {
    q: "Why is the industry transitioning from R-410A to R-32 and R-454B?",
    a: "GWP. R-410A is GWP 2088 (IPCC AR5) and is restricted under the EPA AIM Act for new equipment beginning January 1, 2025 (with regulatory phase-down through 2036). R-32 (GWP 675) and R-454B (GWP 466) are the dominant A2L replacements. R-32 is the pure-component choice (Daikin's preference); R-454B is a R-32/R-1234yf blend (Carrier, Trane, Lennox preference). Both require A2L-rated equipment with sealed motors, charge limits, and leak-detection accommodations. Equipment built before the transition uses R-410A and continues to be serviceable with reclaimed R-410A indefinitely.",
  },
  {
    q: "Is a lower-GWP refrigerant always better?",
    a: "No — it's a multi-axis trade-off. The lowest-GWP refrigerants (hydrocarbons R-290, R-600a, R-1270 at GWP 2-3) are A3 highly flammable and charge-limited under most codes. R-744 (CO₂, GWP 1) is non-flammable but requires very-high-pressure equipment and transcritical operation in warm climates. R-1234yf (GWP 4) and R-1234ze (GWP 7) are A2L. The 'low-GWP doesn't necessarily mean drop-in' point is the foundation of the modern transition — switching refrigerants typically requires new equipment, not just new refrigerant.",
  },
  {
    q: "Should I retrofit an R-22 system or replace it?",
    a: "Depends on age, condition, and economics. For systems under 10 years with no leaks and intact compressor, retrofit to an HFC like R-422D or R-407C is reasonable — but only buys time, because those refrigerants face their own AIM Act restrictions. For systems over 15 years, multiple leaks, or with compressor concerns, full replacement with new R-32 or R-454B equipment is typically more cost-effective. New equipment is also 20-30% more efficient than R-22-era equipment, which improves the payback.",
  },
  {
    q: "Why do natural refrigerants get so much attention if they're not widely deployed?",
    a: "They're the ultimate destination if the regulatory phase-down continues to its logical conclusion. R-744 (CO₂), R-290 (propane), R-600a (isobutane), and R-717 (ammonia) all have GWP under 10 and are not subject to any phase-down. Limitations on widespread deployment: R-744 requires expensive transcritical equipment in warm climates; R-290/R-600a/R-1270 are A3 with charge limits; R-717 is B2L (mildly toxic and mildly flammable) and used primarily in industrial settings. The transition is happening but gradually — heat pumps with R-290, supermarket refrigeration with R-744 CO₂ booster, industrial chillers with R-717.",
  },
  {
    q: "What's the difference between azeotropic and zeotropic blends?",
    a: "Azeotropic blends have effectively zero temperature glide — bubble and dew points coincide at typical operating pressures. Service measurement of superheat and subcooling can be done without distinguishing bubble vs dew curves (treat like a pure refrigerant). R-410A and R-507A are near-azeotropes; R-500 and R-502 are true azeotropes (legacy). Zeotropic blends have meaningful glide (R-407C ~10°F, R-454C ~14°F, R-455A ~21°F). Service requires using the dew curve for superheat and bubble curve for subcooling. The PT calculator and related tools handle this automatically.",
  },
  {
    q: "What does ASHRAE 34 safety classification mean?",
    a: "A two-character classification: the letter (A/B) indicates chronic toxicity (A = lower, B = higher); the number (1/2L/2/3) indicates flammability (1 = non-flammable, 2L = mildly flammable with low burning velocity ≤10 cm/s, 2 = flammable, 3 = highly flammable). Common classifications: A1 (R-22, R-134a, R-410A, R-404A — non-flammable, lower toxicity); A2L (R-32, R-454B, R-1234yf — mildly flammable, lower toxicity, the modern transition class); A3 (R-290, R-600a, R-1270 — highly flammable, lower toxicity); B1 (R-123, R-245fa — non-flammable, higher toxicity); B2L (R-717 ammonia — mildly flammable, higher toxicity).",
  },
  {
    q: "How does temperature glide affect equipment selection?",
    a: "High-glide blends (>10°F) need TXV systems that can adjust to the operating-condition saturation profile; fixed-orifice systems aren't well-matched to high-glide blends. The bubble-to-dew temperature spread at the evaporator inlet creates a temperature 'profile' across the evaporator that affects heat transfer coefficient and frost behavior. Modern A2L blends like R-454C (14°F glide) and R-455A (21°F glide) are designed for TXV or EXV equipment with appropriate adjustment. R-410A (azeotrope, near-zero glide) works well with both TXV and fixed-orifice systems.",
  },
];

function pt70(slug: string) {
  const p = getPressureAtTempF(slug, 70);
  if (!p) return null;
  return p;
}

interface RowConfig {
  slug: string;
  era?: string;
}

function ComparisonRow({ slug }: { slug: string }) {
  const r = getRefrigerant(slug);
  if (!r) return null;
  const p = pt70(slug);
  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-2 font-mono">
        <Link href={`/refrigerant/${r.slug}/`} className="hover:underline">{r.displayName}</Link>
      </td>
      <td className="px-3 py-2"><SafetyClassChip safetyClass={r.safetyClass} size="sm" /></td>
      <td className="px-3 py-2 font-mono text-right">{r.environmental.gwp100Ar5 ?? "—"}</td>
      <td className="px-3 py-2 font-mono text-right">{r.environmental.odp ?? "—"}</td>
      <td className="px-3 py-2 font-mono text-right">
        {p ? (Math.abs(p.bubble - p.dew) < 0.5 ? p.bubble.toFixed(0) : `${p.bubble.toFixed(0)} / ${p.dew.toFixed(0)}`) : "—"}
      </td>
      <td className="px-3 py-2 font-mono text-right">{r.physical.temperatureGlideF ? Math.abs(r.physical.temperatureGlideF).toFixed(1) : "0.0"}</td>
      <td className="px-3 py-2 text-xs">{r.regulatoryStatus.aimActAffected ? "Affected" : r.regulatoryStatus.epaPhaseoutComplete ? "Phased out" : "—"}</td>
    </tr>
  );
}

function ComparisonTable({ title, rows, caption }: { title: string; rows: string[]; caption?: string }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 font-medium">Refrigerant</th>
              <th className="px-3 py-2 font-medium">Class</th>
              <th className="px-3 py-2 font-medium text-right">GWP</th>
              <th className="px-3 py-2 font-medium text-right">ODP</th>
              <th className="px-3 py-2 font-medium text-right">PSIG @70°F</th>
              <th className="px-3 py-2 font-medium text-right">Glide °F</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((slug) => <ComparisonRow key={slug} slug={slug} />)}
          </tbody>
        </table>
      </div>
      {caption ? <p className="mt-2 text-xs text-zinc-500">{caption}</p> : null}
    </div>
  );
}

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Refrigerant Comparison Guide",
      description:
        "Framework for comparing HVAC refrigerants across thermodynamic, safety, environmental, regulatory, and practical axes. Decision logic for new equipment, retrofit, and replacement scenarios.",
      proficiencyLevel: "Beginner to Advanced",
      dependencies: "Familiarity with vapor-compression refrigeration; helpful but not required: experience with manifold gauge service.",
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
        { "@type": "ListItem", position: 3, name: "Refrigerant Comparison Guide" },
      ],
    },
  ];
}

export default function ComparisonGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Refrigerant Comparison Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refrigerant Comparison Guide</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Framework for comparing HVAC refrigerants. Five axes of comparison — thermodynamics, safety, environmental
            impact, regulation, and practical service factors — plus decision logic for the common scenarios where you
            need to choose between refrigerants.
          </p>
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50/30 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/20">
            <strong>TL;DR:</strong> Comparing refrigerants requires looking at five axes simultaneously. Low GWP alone
            doesn&apos;t make a refrigerant suitable — flammability class, pressure envelope, lubricant compatibility,
            and equipment availability all matter. The right choice depends on the decision context: new equipment
            specification, retrofit of existing equipment, or service of installed systems each have different
            constraints.
          </div>
        </header>

        <nav className="mb-10 rounded-md border border-zinc-200 bg-zinc-50/40 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30" aria-label="Table of contents">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sections</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><a href="#axes" className="hover:underline">The five comparison axes</a></li>
            <li><a href="#thermo" className="hover:underline">Thermodynamic axis: pressure, capacity, glide</a></li>
            <li><a href="#safety" className="hover:underline">Safety axis: ASHRAE classification</a></li>
            <li><a href="#environment" className="hover:underline">Environmental axis: ODP, GWP, lifetime</a></li>
            <li><a href="#regulation" className="hover:underline">Regulatory axis: phase-out timelines</a></li>
            <li><a href="#practice" className="hover:underline">Practical axis: lubricant, cost, service</a></li>
            <li><a href="#decisions" className="hover:underline">Decision frameworks</a></li>
            <li><a href="#tables" className="hover:underline">Comparison tables by application</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ol>
        </nav>

        <section id="axes" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>1. The five comparison axes</h2>
          <p>
            Every refrigerant choice involves trade-offs across five distinct axes. A refrigerant that excels on one
            axis may be poor on another — and the binding axis depends on the decision context. For new equipment
            specification, regulatory phase-down status usually dominates. For service work on existing equipment,
            lubricant and safety-class compatibility dominate. For retrofit, pressure envelope match dominates.
          </p>
          <p>The five axes:</p>
          <ol>
            <li><strong>Thermodynamic</strong> — operating pressure envelope, volumetric capacity, temperature glide,
              critical point. These determine what equipment the refrigerant can work in and at what efficiency.</li>
            <li><strong>Safety classification</strong> — ASHRAE Standard 34 toxicity (A/B) and flammability (1/2L/2/3).
              These determine equipment design requirements and field handling practices.</li>
            <li><strong>Environmental impact</strong> — ozone-depletion potential (ODP), global warming potential
              (GWP), atmospheric lifetime. These drive regulatory phase-downs.</li>
            <li><strong>Regulatory status</strong> — Montreal Protocol (ozone), EPA AIM Act / EU F-Gas Regulation
              (climate), SNAP acceptable-use designations. These determine what&apos;s legal for new equipment and
              service.</li>
            <li><strong>Practical service factors</strong> — lubricant compatibility, equipment availability and cost,
              refrigerant cost trends, service complexity. These determine the day-to-day cost and difficulty of
              working with the refrigerant.</li>
          </ol>
        </section>

        <section id="thermo" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>2. Thermodynamic axis: pressure, capacity, glide</h2>
          <p>
            The most fundamental refrigerant property is its <strong>pressure envelope</strong> — the relationship
            between temperature and saturation pressure across the operating range. Pressure envelope determines what
            equipment design the refrigerant fits and at what efficiency.
          </p>
          <p>
            Saturation pressure at a standard reference temperature (70°F) is a useful one-number summary. Refrigerants
            sort naturally into pressure bands:
          </p>
          <ul>
            <li><strong>Very high pressure (700+ PSIG @70°F):</strong> R-744 (CO₂) at ~838 PSIG. Requires equipment
              rated for very high pressures; transcritical operation in warm climates.</li>
            <li><strong>High pressure (150-300 PSIG @70°F):</strong> R-410A (~202), R-32 (~206), R-454B (~190),
              R-404A (~149), R-507A (~153). The HFC and modern A2L workhorses.</li>
            <li><strong>Medium-high pressure (100-150 PSIG @70°F):</strong> R-22 (~121), R-454C (~141 bubble), R-290
              (~110). Includes the dominant historical residential refrigerant (R-22).</li>
            <li><strong>Medium pressure (40-100 PSIG @70°F):</strong> R-134a (~71), R-513A (~77), R-450A (~57),
              R-1234yf (~74), R-1234ze (~49). The chiller and commercial cooling range.</li>
            <li><strong>Low pressure (0-40 PSIG @70°F):</strong> R-123 (sub-atmospheric at typical chiller evap),
              R-1233zd(E) (~1.6), R-245fa (~16), R-1336mzz(Z) (sub-atmospheric). Low-pressure centrifugal chiller
              fluids.</li>
            <li><strong>Sub-atmospheric (negative PSIG @70°F):</strong> R-123, R-514A, R-1336mzz(Z). Operating with
              the suction side below atmospheric is the normal regime for these fluids in their target equipment.</li>
          </ul>
          <p>
            <strong>Temperature glide</strong> is the difference between bubble (saturated liquid) and dew (saturated
            vapor) temperatures at a given pressure. Pure refrigerants and azeotropic blends have zero glide; zeotropic
            blends have meaningful glide that requires equipment and service-procedure accommodation. High-glide blends
            (&gt;10°F) include R-407C (~10°F), R-454C (~14°F), R-455A (~22°F), R-449A (~10°F). The{" "}
            <Link href="/superheat-calculator/">superheat calculator</Link> uses the correct curve (dew for superheat,
            bubble for subcooling) automatically.
          </p>
          <p>
            <strong>Critical temperature</strong> matters for refrigerants whose critical point is near typical ambient
            temperatures. R-744 (CO₂) has critical temperature 88°F — at outdoor ambient above 88°F, CO₂ cannot
            condense and must operate transcritically. R-13 (CFC, legacy) has critical temperature 84°F, limiting it
            to cascade low-stage roles. R-23 (HFC) at 79°F similarly. Most HVAC refrigerants have critical temperature
            well above ambient (R-410A ~163°F, R-134a ~214°F, R-22 ~205°F).
          </p>
        </section>

        <section id="safety" className="mb-10">
          <h2 className="mb-3 text-2xl font-semibold">3. Safety axis: ASHRAE classification</h2>
          <p className="mb-4">
            ASHRAE Standard 34 assigns a two-character safety code to every refrigerant: a letter for chronic toxicity
            and a number/code for flammability. The grid below shows the eight possible classifications with examples.
          </p>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 font-medium">Class</th>
                  <th className="px-3 py-2 font-medium">Toxicity</th>
                  <th className="px-3 py-2 font-medium">Flammability</th>
                  <th className="px-3 py-2 font-medium">Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="A1" size="sm" /></td><td className="px-3 py-2">Lower</td><td className="px-3 py-2">Non-flammable</td><td className="px-3 py-2 font-mono text-xs">R-22, R-134a, R-410A, R-404A, R-744</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="A2L" size="sm" /></td><td className="px-3 py-2">Lower</td><td className="px-3 py-2">Mild (≤10 cm/s burning velocity)</td><td className="px-3 py-2 font-mono text-xs">R-32, R-454B, R-1234yf, R-1234ze</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="A2" size="sm" /></td><td className="px-3 py-2">Lower</td><td className="px-3 py-2">Flammable</td><td className="px-3 py-2 font-mono text-xs">R-152a, R-365mfc</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="A3" size="sm" /></td><td className="px-3 py-2">Lower</td><td className="px-3 py-2">Highly flammable</td><td className="px-3 py-2 font-mono text-xs">R-290, R-600a, R-1270</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="B1" size="sm" /></td><td className="px-3 py-2">Higher</td><td className="px-3 py-2">Non-flammable</td><td className="px-3 py-2 font-mono text-xs">R-123, R-245fa, R-514A</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="B2L" size="sm" /></td><td className="px-3 py-2">Higher</td><td className="px-3 py-2">Mild</td><td className="px-3 py-2 font-mono text-xs">R-717 (ammonia)</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="B2" size="sm" /></td><td className="px-3 py-2">Higher</td><td className="px-3 py-2">Flammable</td><td className="px-3 py-2 font-mono text-xs">(rare in HVAC)</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2"><SafetyClassChip safetyClass="B3" size="sm" /></td><td className="px-3 py-2">Higher</td><td className="px-3 py-2">Highly flammable</td><td className="px-3 py-2 font-mono text-xs">(rare in HVAC)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm">
            <strong>Why the safety class matters in practice:</strong>
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            <li><strong>A1 (most legacy and current HVAC):</strong> No special equipment design required for
              flammability; standard service procedures.</li>
            <li><strong>A2L (the modern transition class):</strong> Equipment must be A2L-rated — sealed motors,
              ignition-source isolation, leak detection where appropriate, charge limits per IEC 60335-2-40 and ASHRAE
              15. Field service uses nitrogen-purged brazing (already standard for HFC service), A2L-compatible leak
              detectors. Retrofits from A1 to A2L are generally not permitted without OEM authorization.</li>
            <li><strong>A2 (R-152a, R-365mfc):</strong> Substantially more restrictive than A2L due to faster flame
              propagation. Limited HVAC equipment uses A2.</li>
            <li><strong>A3 (hydrocarbons):</strong> Highly flammable. Charge limits typically &lt;150g for general
              applications under IEC 60335-2-40; commercial refrigeration limits per IEC 60335-2-89 allow somewhat
              larger charges in sealed equipment. Industrial refrigeration with proper engineering controls can use
              larger charges.</li>
            <li><strong>B1 (R-123, R-245fa, R-514A):</strong> Higher chronic toxicity. Machine-room ventilation and
              leak detection per ASHRAE 15. Industrial hygiene practices during service (avoid prolonged
              inhalation).</li>
            <li><strong>B2L (R-717 ammonia):</strong> Both higher toxicity AND mild flammability. Industrial-grade
              equipment with extensive engineering controls; typically not used in commercial or residential
              applications.</li>
          </ul>
        </section>

        <section id="environment" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>4. Environmental axis: ODP, GWP, atmospheric lifetime</h2>
          <p>
            Three closely-related environmental metrics drive most modern refrigerant decisions.
          </p>
          <p>
            <strong>Ozone-depletion potential (ODP)</strong> measures how effectively a molecule destroys stratospheric
            ozone, relative to R-11 (defined as ODP 1.0). CFCs have high ODP (R-11 = 1.0, R-12 = 1.0, R-13 = 1.0).
            HCFCs have low but non-zero ODP (R-22 = 0.055, R-123 = 0.02, R-124 = 0.022). HFCs and HFOs have zero ODP.
            The Montreal Protocol (1987 and subsequent amendments) phased out CFCs (US: 1996) and HCFCs (R-22 in 2020,
            R-123 in 2020, R-124 in 2015). HFCs and HFOs have no ozone concern.
          </p>
          <p>
            <strong>Global warming potential (GWP)</strong> measures the integrated radiative forcing of a molecule
            relative to CO₂ (defined as GWP 1.0) over a 100-year time horizon. GWP varies enormously across
            refrigerants: R-744 (CO₂) at 1, R-1234yf at 4, R-32 at 675, R-410A at 2088, R-404A at 3922, R-23 at 14800,
            R-c318 at 10300. The EPA AIM Act and EU F-Gas Regulation phase down HFCs based on GWP thresholds.
          </p>
          <p>
            <strong>Atmospheric lifetime</strong> is the average residence time of a molecule before atmospheric
            removal (typically OH-radical attack for HFCs). Lifetime directly drives GWP — longer lifetime means more
            cumulative warming. Most HFCs have lifetimes of 5-50 years. PFCs (perfluorocarbons like R-218, R-c318) have
            lifetimes of 2000-50000 years because their fully-fluorinated structure resists atmospheric removal. CFCs
            and HCFCs have intermediate lifetimes (R-22 ~12 years, R-13 ~640 years).
          </p>
          <p>
            The relationship: GWP ≈ (radiative efficiency per molecule) × (atmospheric lifetime), divided by CO₂&apos;s
            reference value. Refrigerants with similar radiative properties differ in GWP primarily through lifetime
            differences. This is why structural isomers can have very different GWPs — R-236ea (lifetime 11 years, GWP
            1370) versus R-236fa (lifetime 242 years, GWP 9810) are the same chemical formula with different fluorine
            arrangements producing dramatically different atmospheric behavior.
          </p>
        </section>

        <section id="regulation" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>5. Regulatory axis: phase-out timelines</h2>
          <p>
            Four regulatory frameworks govern refrigerant decisions:
          </p>
          <p>
            <strong>Montreal Protocol (1987, amended).</strong> International treaty mandating phase-out of
            ozone-depleting substances. US implementation through the Clean Air Act Section 605/606. CFC production
            banned 1996. HCFC production phase-out: R-141b banned 2003; R-22 banned 2020; R-123 banned 2020. The
            Montreal Protocol&apos;s Kigali Amendment (2016, US ratified 2022) extends to HFC phase-down.
          </p>
          <p>
            <strong>EPA AIM Act (2020, implementing Kigali Amendment).</strong> US HFC phase-down under EPA SNAP
            implementation. Targets include R-410A, R-404A, R-134a, R-407C, R-32, R-125, R-143a, R-227ea, others.
            Key dates: 2022-2024 production allocation reductions; January 1, 2025 new-equipment restrictions for
            residential AC (R-410A new equipment significantly restricted, transitioning to A2L); January 1, 2025
            similar restrictions for commercial refrigeration; January 1, 2026 additional restrictions for chillers
            and heat pumps. The phase-down continues through 2036.
          </p>
          <p>
            <strong>EU F-Gas Regulation 517/2014 (revised 2024).</strong> European HFC phase-down with quota-based
            production controls and equipment-segment GWP thresholds. 150-GWP threshold for some commercial
            refrigeration and small split AC; 750-GWP threshold for chillers; 2500-GWP threshold for centralized
            commercial refrigeration. The 2024 revision tightens schedules further through 2030.
          </p>
          <p>
            <strong>EPA SNAP (Significant New Alternatives Policy).</strong> US program listing acceptable substitutes
            for ozone-depleting substances by end-use category. SNAP listings determine which refrigerants are legally
            usable in which equipment segments. Most modern HFOs and A2L blends have SNAP acceptable-use designations
            for their target applications.
          </p>
          <p>
            <strong>What this means for decisions:</strong>
          </p>
          <ul>
            <li><strong>New residential AC equipment (US, 2025+):</strong> R-410A is restricted. R-32 and R-454B are
              the A2L replacements. R-22 is banned for new equipment.</li>
            <li><strong>New commercial refrigeration (US, 2025+):</strong> R-404A and R-507A are restricted for many
              end-use categories. R-448A, R-449A, R-454C, R-455A, R-744 are the alternatives.</li>
            <li><strong>New chillers (US, 2026+):</strong> R-134a and R-410A are restricted for many applications.
              R-450A, R-513A, R-515A, R-515B, R-1234ze(E), R-1233zd(E) are the alternatives.</li>
            <li><strong>Existing equipment (any age):</strong> Continues to be serviceable with the original
              refrigerant indefinitely under current rules. Service supply is reclaimed for phased-out refrigerants
              (R-22, R-123, etc.) — finite and shrinking.</li>
          </ul>
        </section>

        <section id="practice" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>6. Practical axis: lubricant, cost, service</h2>
          <p>
            Beyond thermodynamics and environment, day-to-day practical factors determine the actual cost and
            difficulty of working with a refrigerant.
          </p>
          <p>
            <strong>Lubricant compatibility</strong> is the most common gotcha. Mineral oil (MO) and alkylbenzene (AB)
            are compatible with CFCs and HCFCs (R-22 era). Polyolester (POE) is required for HFCs and HFOs (R-410A,
            R-134a, R-32, R-1234yf, etc.). Polyvinyl ether (PVE) is used with some HFCs in specific equipment.
            Polyalkylene glycol (PAG) is used with some HFO chillers and in mobile AC (R-134a, R-1234yf). Mixing
            incompatible lubricants causes oil breakdown and refrigerant decomposition — a hard-to-diagnose failure
            mode. The <Link href="/refrigerant-retrofit-compatibility-calculator/">retrofit compatibility calculator</Link>{" "}
            checks lubricant compatibility for any refrigerant pair.
          </p>
          <p>
            <strong>Equipment availability and cost.</strong> A1 refrigerant equipment (R-22, R-134a, R-410A, R-404A
            equipment) has been mass-produced for decades — wide availability, competitive pricing. A2L equipment
            (R-32, R-454B, R-1234yf) is becoming standard but currently carries a modest price premium and limited
            installer familiarity. A3 hydrocarbon equipment (R-290) is widely available in EU markets but more limited
            in the US. Specialty equipment (R-744 CO₂ chillers, R-717 ammonia industrial systems) has limited supplier
            base and significant capital cost premiums.
          </p>
          <p>
            <strong>Refrigerant cost trends.</strong> Reclaimed R-22 (phased out 2020) is increasingly expensive as
            supply tightens. R-410A pricing has risen sharply as AIM Act production allocations decrease through 2025.
            R-32 and R-454B carry modest premiums as a-2L blends. Hydrocarbons (R-290) are inexpensive but
            charge-limited. R-744 (CO₂) is essentially free but the equipment is expensive. R-717 (ammonia) is
            inexpensive but only deployable in industrial settings.
          </p>
          <p>
            <strong>Service complexity</strong> increases with safety class: A1 is simplest, A2L adds modest
            procedures (nitrogen-purged brazing, A2L leak detector, A2L recovery cylinders), A3 requires intrinsically
            safe equipment in the refrigerant space and explicit hydrocarbon-rated training, B1 requires industrial
            hygiene practices, B2L (ammonia) requires extensive industrial-scale safety infrastructure.
          </p>
        </section>

        <section id="decisions" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">7. Decision frameworks</h2>

          <div className="mb-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-base font-semibold">Scenario A: New residential AC equipment, 2026+</h3>
            <p className="mt-2 text-sm">
              The choice in 2026 is between R-32 (pure HFC, A2L, GWP 675) and R-454B (HFC/HFO blend, A2L, GWP 466).
              Both replace R-410A in new equipment. The decision typically follows the equipment OEM&apos;s
              standardization: Daikin favors R-32 (pure-component supply chain control); Carrier, Trane, Lennox
              favor R-454B (slightly lower GWP, blend manufactured by Honeywell/Chemours). Performance is comparable.
              R-32 has marginally higher discharge temperature (different compressor sizing); R-454B has small (~2°F)
              glide. Both are A2L — equipment design accommodations are similar.
            </p>
            <p className="mt-2 text-sm">
              <strong>Tie-breakers:</strong> equipment availability in your market, installer familiarity, OEM service
              support, refrigerant supply security.
            </p>
          </div>

          <div className="mb-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-base font-semibold">Scenario B: Existing R-22 residential AC, 2026</h3>
            <p className="mt-2 text-sm">
              <strong>Repair vs replace</strong> hinges on equipment age, leak history, and economics. Under 10 years
              with no leaks: continue on reclaimed R-22 (legal, available at premium prices). 10-15 years with
              isolated leak: repair and consider retrofit blend (R-422D, R-407C, R-438A). Over 15 years or multiple
              leaks: replace with new R-32 or R-454B equipment.
            </p>
            <p className="mt-2 text-sm">
              R-22 retrofit blends face their own AIM Act restrictions — they&apos;re a bridge, not a destination.
              Replacement with new low-GWP equipment also delivers 20-30% efficiency improvement that aids payback.
            </p>
          </div>

          <div className="mb-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-base font-semibold">Scenario C: Commercial refrigeration, R-404A path</h3>
            <p className="mt-2 text-sm">
              R-404A (GWP 3922) faces aggressive AIM Act phase-down. For new equipment: R-448A or R-449A
              (medium-GWP, A1, drop-in for R-404A retrofit), R-454C or R-455A (low-GWP, A2L), or R-744 (CO₂
              transcritical) depending on scale and capital availability. For existing R-404A equipment: R-448A and
              R-449A are mineral-oil-compatible retrofit options that buy time; R-454C and R-455A retrofits require
              A2L equipment evaluation.
            </p>
            <p className="mt-2 text-sm">
              Supermarket-scale operations have increasingly moved to R-744 CO₂ booster systems for long-term GWP
              compliance — significant capital investment but eliminates HFC phase-down risk.
            </p>
          </div>

          <div className="mb-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-base font-semibold">Scenario D: Centrifugal chiller, R-123 / R-134a transition</h3>
            <p className="mt-2 text-sm">
              R-123 was the dominant low-pressure centrifugal chiller refrigerant for decades — production banned
              2020. Replacement options: R-1233zd(E) (HFO, A1, GWP 1, near-drop-in pressure envelope), R-1224yd(Z)
              (HCFO, A1, GWP 1), R-514A (HFO blend, B1 toxicity classification, GWP 2). R-1233zd(E) leads in
              market share.
            </p>
            <p className="mt-2 text-sm">
              R-134a chillers face AIM Act restrictions for new equipment. Replacement options: R-513A (A1, GWP 631),
              R-450A (A1, GWP 605), R-515A (A1, GWP 392), R-515B (A1, GWP 287), or pure R-1234ze(E) (A2L, GWP 7).
              The A1 blends are retrofit-compatible with existing R-134a equipment; R-1234ze(E) requires new
              A2L-rated equipment.
            </p>
          </div>

          <div className="mb-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-base font-semibold">Scenario E: Heat pump for industrial process heat (80-150°C)</h3>
            <p className="mt-2 text-sm">
              High-temperature industrial heat pumps require working fluids with high-temperature stability and
              appropriate pressure envelope. R-245fa was historical workhorse for organic Rankine cycle and
              heat-pump applications; being replaced by R-1233zd(E) (A1, GWP 1) for moderate-temperature applications
              and R-1336mzz(Z) (A1, GWP 2) for high-temperature applications (up to 150°C condensing). R-1234ze(Z)
              also serves the high-temperature heat-pump range.
            </p>
            <p className="mt-2 text-sm">
              EU Heat Pump Action Plan and US IRA industrial heat-pump credits are driving rapid growth in this
              segment — equipment OEMs are still consolidating around specific refrigerant choices.
            </p>
          </div>
        </section>

        <section id="tables" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">8. Comparison tables by application</h2>

          <ComparisonTable
            title="Residential and light commercial AC"
            rows={["r-22", "r-410a", "r-32", "r-454b", "r-454c"]}
            caption="R-22 was the dominant residential AC refrigerant from 1960s-2010; R-410A took over from 2010-2024; R-32 and R-454B are the post-AIM-Act standards. R-454C is for low-temp applications."
          />

          <ComparisonTable
            title="Commercial refrigeration (R-404A path forward)"
            rows={["r-404a", "r-507a", "r-448a", "r-449a", "r-454c", "r-455a"]}
            caption="R-404A and R-507A are the high-GWP legacy refrigerants under AIM Act phase-down. R-448A and R-449A are medium-GWP A1 retrofits; R-454C and R-455A are low-GWP A2L alternatives for new equipment."
          />

          <ComparisonTable
            title="Centrifugal chillers (R-134a and R-123 transition)"
            rows={["r-123", "r-134a", "r-513a", "r-450a", "r-515b", "r-1234ze", "r-1233zd-e"]}
            caption="R-123 (banned 2020) and R-134a are the historical chiller refrigerants. R-513A and R-450A are A1 retrofits for R-134a. R-1234ze(E) and R-1233zd(E) are very-low-GWP next-generation choices (A2L and A1 respectively)."
          />

          <ComparisonTable
            title="Natural refrigerants"
            rows={["r-744", "r-717", "r-290", "r-600a", "r-1270", "r-1234yf"]}
            caption="Natural refrigerants and HFOs with very low GWP. R-1234yf (a low-GWP HFO, not strictly a 'natural') included for comparison — it's the dominant mobile AC refrigerant. Application-specific suitability: R-744 for commercial refrigeration; R-717 for industrial; R-290/R-600a/R-1270 for small commercial and EU residential heat pumps."
          />
        </section>

        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">9. FAQ</h2>
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
          <Link href="/refrigerant-pt-comparison-tool/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">PT Comparison Tool</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Overlay 2-4 refrigerants on a single PT chart for visual comparison.</p>
          </Link>
          <Link href="/refrigerant-retrofit-compatibility-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Retrofit Compatibility</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Pair-comparison decision: lubricant, safety, pressure, glide, application overlap.</p>
          </Link>
          <Link href="/refrigerant-safety-classifications/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Safety Class Index</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">All 61 refrigerants sorted by ASHRAE class with phase-down status.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>CoolProp 7.2.0 — saturation pressures, critical points, physical properties (PT values in tables)</li>
            <li>ASHRAE Standard 34-2022 — refrigerant designations, safety classifications, composition specifications</li>
            <li>IPCC AR5 (2014) — Global warming potential values (the EPA AIM Act regulatory figures)</li>
            <li>EPA AIM Act (Public Law 116-260) and EPA implementation rulemaking — HFC phase-down schedule</li>
            <li>EPA SNAP — Significant New Alternatives Policy acceptable-use designations</li>
            <li>EU F-Gas Regulation 517/2014 (revised 2024) — EU HFC phase-down framework</li>
            <li>Montreal Protocol and Kigali Amendment — international ozone and HFC regulation</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — application-specific guidance and operating ranges</li>
            <li>Manufacturer technical literature (Honeywell, Chemours, Daikin, Carrier, Trane, Johnson Controls) for product-specific data</li>
          </ul>
          <p className="mt-3">All numerical values cited in tables are computed at build time from the verified refrigerant dataset (data/refrigerants.json, generated from CoolProp). Generated {PUBLISHED.slice(0, 10)}.</p>
        </footer>
      </article>
    </>
  );
}
