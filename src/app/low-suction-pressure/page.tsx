import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { GaugeSignatureDiagram } from "@/components/diagrams/GaugeSignatureDiagram";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/low-suction-pressure/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/low-suction-pressure/page.tsx");

const R410A_40F = fmtPsigBubble("r-410a", 40);
const R410A_30F = fmtPsigBubble("r-410a", 30);
const R22_40F = fmtPsigBubble("r-22", 40);
const R22_30F = fmtPsigBubble("r-22", 30);

export const metadata: Metadata = pageMetadata({
  title: "Low Suction Pressure: Causes, Diagnosis & Fixes (HVAC)",
  description:
    "Low suction pressure diagnostic tree: undercharge, restrictions, low airflow, evaporator issues. R410A + R22 signatures with expected gauge readings.",
  path: "/low-suction-pressure/",
});

const BRANCHES = [
  {
    title: "Undercharge (most common cause)",
    signature: `Suction below normal band. On R-410A at 40°F evap norm ${R410A_40F} PSIG, undercharge might show 30°F evap saturation (${R410A_30F} PSIG) or lower. Superheat high (>20°F). Subcooling low or zero.`,
    body: "Insufficient refrigerant means less mass moved per cycle; the evaporator can't be filled, saturation temp drops, superheat climbs. Diagnostic: measure SH and SC together — high SH + low SC = undercharge. Fix: leak-check (EPA Section 608 required), repair leak, evacuate to 500 microns held 30 minutes, recharge to nameplate weight or to target SC.",
  },
  {
    title: "Liquid-line restriction (filter-drier, crimp, or ice)",
    signature: `Suction low, but subcooling ELEVATED at the restriction upstream, then low downstream. Sensible temperature drop across the filter-drier of 3–8°F when normal is <2°F.`,
    body: "A clogged filter-drier, kinked liquid line, or moisture forming ice inside the metering device restricts refrigerant flow to the evaporator. The condenser backs up (high SC + high head is one signature); the evaporator starves (low suction + high SH). Diagnostic: touch either side of the filter-drier — a cold spot downstream indicates restriction. Fix: replace filter-drier; if moisture, evacuate deep before recharge.",
  },
  {
    title: "Low indoor airflow (return-side)",
    signature: `Suction low, superheat elevated, evaporator saturation may drop to freezing → visible ice/frost on the coil. Return-air temperature at grille very cold if you can access it.`,
    body: "Reduced airflow across the evaporator means less heat absorption; the coil boils cold and starves. Saturation drops below 32°F → water condensing on the coil freezes → progressively worse airflow. Common causes: clogged filter, closed dampers, undersized return duct, blower motor issue. Fix: replace filter, verify blower CFM matches nameplate, defrost coil before restart if frozen.",
  },
  {
    title: "Evaporator coil fouling or blockage",
    signature: `Suction low, superheat elevated, discharge normal or slightly low. Coil visibly dirty or biofilm buildup on fins.`,
    body: "Dirt or biofilm reduces heat-transfer coefficient across the coil. Even with adequate airflow, less heat reaches the refrigerant per pound. Fix: coil cleaning (foaming coil cleaner from indoor side; hose-and-brush from outdoor side for outdoor coils). Retest after cleaning; if suction still low, look for a secondary cause.",
  },
  {
    title: "TXV underfeeding or stuck partially closed",
    signature: `Suction low, superheat significantly elevated (>25°F residential), subcooling elevated (condenser backing up). Bulb loosely attached or improperly insulated on suction line.`,
    body: "The TXV isn't passing enough refrigerant. Evaporator starves; condenser backs up. Diagnostic: verify TXV sensing bulb attachment — should be at 4–5 o'clock on the suction line just outside the evaporator, tightly clamped, insulated. If bulb is properly attached and system still under-feeds, TXV internal failure. Fix: tighten and insulate bulb; replace valve if internal.",
  },
  {
    title: "Low load / low ambient (not a fault)",
    signature: `Suction low but proportionally with load. In heating season (heat pump), or on a mild-weather service call, or with an oversized system running short cycles.`,
    body: `On a mild day (65–75°F outdoor) an R-410A residential AC may sit at 30°F evap saturation (${R410A_30F} PSIG) instead of the 95°F-day 40°F evap (${R410A_40F} PSIG). Not a fault — verify pressures are consistent with actual ambient before diagnosing. Reference the what-pressure pages for ambient-adjusted expectations.`,
  },
  {
    title: "Evaporator flooding refrigerant to accumulator — hidden low SH",
    signature: `Suction appears low; superheat measured downstream of accumulator may read normal but actual evaporator outlet is running wet.`,
    body: "Common on heat-pump systems with accumulator. TXV feeds enough refrigerant to satisfy the accumulator inlet, but the coil is starving on high circuits. Diagnostic: measure SH BEFORE the accumulator if the geometry allows, or measure evaporator air temperature drop (normal ΔT = 15–22°F; low ΔT = coil not fully doing work). Fix: check for coil circuit blockage, oil trap in an evaporator drain pan, refrigerant maldistribution.",
  },
  {
    title: "Low compressor mass flow — motor or belt issue",
    signature: `Suction low and discharge low. Amp draw well below nameplate. Compressor running but not building pressure differential.`,
    body: "On rare occasion, a compressor motor or belt issue reduces mass flow across the system. Diagnostic: motor amp draw vs FLA on nameplate. If well below, check start capacitor, run capacitor, and windings. On open-drive belted systems, check belt tension. Fix per diagnostic — capacitors are the most common failure and are inexpensive; motor rebuilds are rarely worth it on residential.",
  },
];

const FAQS = [
  {
    q: "What is normal suction pressure for R-410A at 40°F evaporator?",
    a: `R-410A saturation at 40°F is ${R410A_40F} PSIG. Manifold reads slightly higher at the service port due to suction-line superheat pickup on a properly-charged residential AC at 95°F outdoor. Values well below that with high superheat point to undercharge or restriction. See /what-pressure-should-410a/ for the full observed envelope and OEM suction band.`,
  },
  {
    q: "What is normal suction pressure for R-22 at 40°F evaporator?",
    a: `R-22 saturation at 40°F = ${R22_40F} PSIG. Manifold reads slightly higher due to suction-line SH pickup on a properly-charged R-22 residential AC at 95°F outdoor. Values below the saturation reference with high SH suggests undercharge; readings near ${R22_30F} PSIG (30°F sat) or lower indicate significant undercharge or restriction. See /what-pressure-should-r22/ for the full observed envelope.`,
  },
  {
    q: "How do I tell undercharge from a restriction?",
    a: "Subcooling. Undercharge: low SC (0–5°F). Restriction upstream of the metering device: high SC (>15°F) with cold spot downstream of the restriction. Both cause low suction and high superheat; SC is the tie-breaker.",
  },
  {
    q: "Should I add refrigerant if suction is low?",
    a: "Only after verifying (a) it's an undercharge, not a restriction or airflow issue, (b) a leak has been located and repaired (EPA Section 608 prohibits topping-off a leaking system), and (c) the system has been evacuated properly. Adding refrigerant to a leaking system violates Section 608 and doesn't fix the underlying problem — you'll be back in 2–4 weeks.",
  },
  {
    q: "How is low suction pressure different from 'high suction low head'?",
    a: "This page = suction BELOW normal (any cause). /high-suction-low-head-pressure/ = the specific combined signature where suction is ABOVE normal and head is BELOW normal (internal leakage patterns). If you have low suction, use this page. If suction is elevated with low head, use the other page.",
  },
  {
    q: "Can a frozen evaporator coil cause low suction pressure?",
    a: "Yes — and it's often the visible symptom of the underlying cause (usually low airflow or undercharge). Ice on the coil reduces airflow further, driving suction pressure even lower, which drops saturation temperature further, freezing more. Fix: identify the root cause (airflow or undercharge), thaw the coil completely (2–4 hours with system off, indoor fan on), then correct the root cause before restarting cooling.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Low Suction Pressure — HVAC Diagnostic Tree",
      description: "Eight-branch diagnostic for low suction pressure: undercharge, liquid-line restriction, low airflow, evaporator fouling, TXV under-feed, low load, and reduced compressor mass flow. R-410A and R-22 expected values.",
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
        { "@type": "ListItem", position: 3, name: "Low Suction Pressure" },
      ],
    },
  ];
}

export default function LowSuctionPressurePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Low Suction Pressure</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Low Suction Pressure</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Broad diagnostic tree for suction below normal, regardless of head. Undercharge is the most common cause; restrictions, airflow issues, and TXV under-feed follow. This page covers low-suction patterns broadly — the specific high-suction/low-head signature has its own tree.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in two sentences">
          Low suction usually means undercharge (fingerprint: high SH + low SC), restriction (fingerprint: high SH + high SC + cold-spot downstream of filter-drier), or reduced airflow (fingerprint: high SH + frozen coil). On R-410A, saturation at 40°F evap is {R410A_40F} PSIG; sustained readings well below that with high SH warrant working through the 8 branches below.
        </KeyInsight>

        <GaugeSignatureDiagram
          slug="r-410a"
          normalEvapTempF={40}
          normalCondTempF={105}
          faultLow="down"
          faultHigh="normal-to-down"
          faultLabel="Low suction with slightly depressed head — undercharge / restriction / low-airflow family"
        />

        <TechSection icon="warning" tone="amber" title="Scope — read before diagnosing">
          <p>This page treats low suction pressure broadly, regardless of what head is doing. Two adjacent problems live on separate pages:</p>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
            <li><Link href="/high-suction-low-head-pressure/" className="underline">High suction low head pressure</Link> — specific combined signature (internal leakage, TXV overfeed, belt slip).</li>
            <li><Link href="/ac-low-side-pressure-too-high/" className="underline">AC low side pressure too high</Link> — opposite signature (suction ABOVE normal).</li>
          </ul>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Diagnostic branches — 8 causes">
          <p>
            Order roughly by frequency: undercharge first, then restriction, then airflow. Match your measurements to the closest signature. All PSIG values from the R-410A and R-22 dataset (CoolProp 7.2.0).
          </p>
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

        <TechSection icon="book" tone="emerald" title="Related tools and reference">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — high SH is the primary undercharge and restriction fingerprint.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — SC tie-breaker: low = undercharge; high = restriction.
            </li>
            <li>
              <Link href="/refrigerant-charge-calculator/" className="underline">Refrigerant Charge Calculator</Link>{" "}
              — weight-based post-recovery recharge.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope by ambient.
            </li>
            <li>
              <Link href="/what-pressure-should-r22/" className="underline">What pressure should R-22 be?</Link>{" "}
              — R-22 operating envelope with reclaimed-supply diagnostic context.
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
            <li>ACCA Manual T — charging targets and SH/SC diagnostic framework.</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — TXV behavior and evaporator design.</li>
            <li>EPA 40 CFR Part 82 Subpart F — Section 608 leak-repair requirements before recharge.</li>
            <li>CoolProp 7.2.0 — R-410A and R-22 PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Expected pressure signatures derived at build time from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
