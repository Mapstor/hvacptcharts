import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks, AlertTriangle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { ChargingChartMatrix } from "@/components/calculators/ChargingChartMatrix";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/target-superheat-chart/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/target-superheat-chart/page.tsx");

export const metadata: Metadata = pageMetadata({
  title: "Target Superheat Chart: Fixed-Orifice Charging Targets (Free PDF)",
  description:
    "Target superheat chart method for fixed-orifice HVAC charging: TSH = ((3×WB) − 80 − DB) / 2. Applies to piston/orifice; TXV/EEV systems use subcooling.",
  path: "/target-superheat-chart/",
});

const FAQS = [
  {
    q: "What is a target superheat chart?",
    a: "A two-dimensional lookup table that gives the target superheat setpoint for a fixed-orifice HVAC system as a function of indoor wet-bulb (WB) and outdoor dry-bulb (DB) temperatures. The chart is the operational form of the ACCA Manual T charging formula: TSH = ((3 × WB) − 80 − DB) / 2. Techs charging fixed-orifice equipment measure WB and DB, look up the target, then add or recover refrigerant until the measured superheat at the suction line matches the target within a few degrees.",
  },
  {
    q: "Does the same chart work for R-410A, R-22, R-32, and R-454B?",
    a: "Yes — the target superheat formula is refrigerant-independent. It sets the operating point at the evaporator based on load conditions (WB) and heat-rejection conditions (DB). The refrigerant only enters when you convert measured suction pressure to saturation temperature: use the PT chart for the specific refrigerant. See the R-410A-specific and R-22-specific pages linked below for combined lookups.",
  },
  {
    q: "Why isn't this chart used for TXV or EEV systems?",
    a: "TXV and EEV metering devices actively regulate refrigerant flow to hold suction superheat near a fixed setpoint (typically 8–15°F at the TXV outlet). Superheat on those systems tells you the valve is working — it does NOT tell you the charge. On a TXV system, undercharge shows up as low subcooling on the liquid line, not as high superheat. Charge TXV / EEV systems to a subcooling target (typically 8–12°F per the OEM nameplate).",
  },
  {
    q: "Where does the (3 × WB) − 80 − DB formula come from?",
    a: "The formula is codified in ACCA Manual T (Air Distribution Basics for Residential and Small Commercial Buildings) and is the same math the major OEMs (Carrier, Trane, Lennox, Rheem) print on their fixed-orifice equipment charging labels. The bead charts on the outdoor unit's access panel are discrete-point renderings of this formula — sometimes with 1–2°F OEM adjustments for coil geometry.",
  },
  {
    q: "What happens when the target comes out below 5°F?",
    a: "Below 5°F the target becomes unreliable — a routine 1–2°F probe-error swamps the setpoint, and the operating condition is often outside the fixed-orifice envelope (low WB with high DB, or high WB with low DB). Industry charging charts blank these cells; charging in this region requires either running the system to a more central operating point (raise indoor load or wait for cooler ambient) or accepting a nameplate weight charge without SH verification.",
  },
  {
    q: "How do I measure indoor wet-bulb accurately?",
    a: "Use a digital psychrometer or a sling psychrometer at the return-air grille after the system has run for 15+ minutes at design conditions. Wet the wick with distilled water; wait for the reading to stabilize (30–60 seconds). Do not measure at the supply grille (post-conditioning) or in an unconditioned space. Some techs use a wet-bulb probe on the return duct just upstream of the coil — that's equivalent.",
  },
  {
    q: "How do I use this chart in the field?",
    a: "Steady-state the system for 10–15 minutes. Measure indoor WB at the return grille and outdoor DB (shaded, near the condenser). Look up the target superheat in the matrix above. Read the suction pressure at the manifold gauge, convert to saturation temp on the PT chart for the refrigerant, then measure the suction-line temperature and subtract. Add or recover refrigerant in small increments until measured SH matches target SH.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Target Superheat Chart — Fixed-Orifice HVAC Charging Method",
      description:
        "Refrigerant-independent target superheat lookup for fixed-orifice HVAC charging. Interactive matrix, formula derivation, applicability, and linked fluid-specific charts.",
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
        { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators-hub/` },
        { "@type": "ListItem", position: 3, name: "Target Superheat Chart" },
      ],
    },
  ];
}

export default function TargetSuperheatChartPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/calculators-hub/" className="hover:underline">Calculators</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Target Superheat Chart</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Target Superheat Chart</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Fixed-orifice / piston HVAC charging method. Target superheat is a function of indoor wet-bulb and outdoor dry-bulb — refrigerant-independent. For TXV / EEV systems, charge by subcooling instead.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in one line">
          Target Superheat (°F) = ((3 × Indoor WB in °F) − 80 − Outdoor DB in °F) / 2. Applies to fixed-orifice systems only. Below 5°F, the target is not reliable.
        </KeyInsight>

        <section className="mt-8 mb-10">
          <h2 className="mb-3 text-xl font-semibold">Interactive lookup and matrix</h2>
          <ChargingChartMatrix label="target superheat" />
        </section>

        <TechSection icon="book" tone="blue" title="Where the formula comes from">
          <p>
            The formula TSH = ((3 × WB) − 80 − DB) / 2 is codified in the Air Conditioning Contractors of America Manual T (Air Distribution Basics), and is the same math printed on the fixed-orifice charging labels of major OEMs (Carrier, Trane, Lennox, Rheem). The OEM &quot;bead charts&quot; on the outdoor unit access panel are discrete-point renderings of the formula, sometimes with 1–2°F adjustments for coil geometry.
          </p>
          <p>
            The physical meaning: at higher indoor WB (more latent + sensible load), the evaporator absorbs more heat and superheat rises for a fixed charge — so the target rises. At higher outdoor DB (harder heat rejection), the condenser saturates hotter, subcooling rises for a fixed charge, and the target superheat falls. The formula balances those two so that a properly-charged system sits at the target across the operating envelope.
          </p>
          <Panel title="Applicability" icon={ListChecks}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Fixed-orifice: piston, capillary tube, or accurator devices — the target-superheat method applies.</li>
              <li>TXV / EEV: the valve controls superheat directly. Superheat tells you the valve is working, not the charge. Charge to a subcooling target instead.</li>
              <li>Distributor + fixed-orifice: same as bare fixed-orifice; use this chart.</li>
              <li>Multi-circuit condensing units: use the chart on the coil serving the current load; measure superheat downstream of the accumulator.</li>
            </ul>
          </Panel>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="When the target reads &quot;—&quot;">
          <p>
            Cells below 5°F render as &quot;—&quot; in the matrix above. The rendered value is the mathematical output of the formula, but it&apos;s unreliable to charge by superheat when the target is that low: a 1–2°F thermometer or manifold-gauge error swamps the setpoint, and the operating condition itself (very low WB with high DB, or very high WB with low DB) is often outside the fixed-orifice envelope.
          </p>
          <Panel title="What to do when target is &quot;—&quot;" icon={AlertTriangle}>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Verify indoor WB measurement — a dry psychrometer wick reads 2–3°F low; wet it and re-read.</li>
              <li>Verify outdoor DB — measure in shade at the condenser intake, not in direct sun.</li>
              <li>Check whether the system is really fixed-orifice — many modern systems (post ~2015) are TXV even on entry-level residential AC. If so, use subcooling.</li>
              <li>If conditions are legitimately extreme (winter charging, very dry indoors), accept a nameplate weight charge without SH verification. Come back on a more moderate day to fine-tune.</li>
            </ol>
          </Panel>
        </TechSection>

        <TechSection icon="service" tone="emerald" title="How to use the chart in the field">
          <Panel title="Field procedure" icon={ListChecks}>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Steady-state the system for 10–15 minutes at design conditions (or as close as ambient allows).</li>
              <li>Measure indoor WB at the return-air grille with a digital or sling psychrometer.</li>
              <li>Measure outdoor DB in shade, near the condenser intake, 4–6 feet off the ground.</li>
              <li>Look up target superheat in the matrix above (or enter WB + DB in the interactive lookup).</li>
              <li>Read suction pressure at the manifold gauge, convert to saturation temp on the PT chart for the specific refrigerant (see linked pages below).</li>
              <li>Measure suction-line temperature at the service port with a contact probe. Subtract sat temp to get measured superheat.</li>
              <li>Add refrigerant in 1–2 oz increments if measured SH is above target (undercharge); recover in the same increments if measured SH is below target (overcharge). Re-check after 5 minutes to allow re-steadying.</li>
            </ol>
          </Panel>
        </TechSection>

        <TechSection icon="book" tone="purple" title="Fluid-specific target-superheat pages">
          <p>The universal chart above works for any fixed-orifice fluid. The per-fluid pages combine the target with a saturation-pressure quick table so you don&apos;t need a separate PT chart in hand:</p>
          <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
            <li><Link href="/r410a-superheat-chart/" className="underline">R-410A superheat chart</Link> — target matrix + R-410A saturation at 35–55°F evap.</li>
            <li><Link href="/r22-superheat-chart/" className="underline">R-22 superheat chart</Link> — target matrix + R-22 saturation at 35–55°F evap.</li>
            <li><Link href="/r410a-charging-chart/" className="underline">R-410A charging chart</Link> — both methods (subcooling for TXV, superheat for fixed-orifice) on one page.</li>
          </ul>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — computes measured superheat from suction PSIG and line temperature for any of the 49 CoolProp-modeled refrigerants.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — the corresponding tool for TXV/EEV systems that charge by subcooling instead.
            </li>
            <li>
              <Link href="/superheat-subcooling-fundamentals/" className="underline">Superheat &amp; Subcooling Fundamentals</Link>{" "}
              — theory, measurement, target values by system type, diagnostic patterns.
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
            <li>ACCA Manual T — Air Distribution Basics for Residential and Small Commercial Buildings.</li>
            <li>Carrier, Trane, Lennox, Rheem residential AC installation manuals — fixed-orifice charging bulletins.</li>
            <li>ASHRAE Handbook of Fundamentals — psychrometric calculations and load-condition definitions.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. The formula and applicability guidance are refrigerant-independent; PT-chart cross-references on the fluid-specific pages are generated from CoolProp 7.2.0.</p>
        </footer>
      </article>
    </>
  );
}
