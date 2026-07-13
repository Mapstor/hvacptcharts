import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/ac-low-side-pressure-too-high/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/ac-low-side-pressure-too-high/page.tsx");

const R410A_40F = fmtPsigBubble("r-410a", 40);
const R134A_40F = fmtPsigBubble("r-134a", 40);
const R134A_130F = fmtPsigBubble("r-134a", 130);
const R1234YF_40F = fmtPsigBubble("r-1234yf", 40);
const R1234YF_130F = fmtPsigBubble("r-1234yf", 130);

export const metadata: Metadata = pageMetadata({
  title: "AC Low Side Pressure Too High: Causes & Fixes (All Systems)",
  description:
    "AC low-side pressure too high diagnostic: overcharge, restricted airflow, TXV fault. Home + auto, R410A and R134a numbers, expected gauge signatures.",
  path: "/ac-low-side-pressure-too-high/",
});

const BRANCHES = [
  {
    title: "Overcharge (most common on residential and mobile AC)",
    signature: `Suction elevated above the saturation-plus-SH band (R-410A 40°F evap = ${R410A_40F} PSIG; R-134a auto 40°F evap = ${R134A_40F} PSIG). High subcooling (>15°F residential; >20°F auto). Amp draw slightly elevated.`,
    body: "Excess refrigerant fills the condenser, reducing effective heat-rejection area and forcing more pressure at the evaporator to move mass. Suction climbs; subcooling climbs sharply. Fix: recover in 1–2 oz increments until subcooling returns to spec (8–12°F residential; per OEM spec for automotive). Do NOT diagnose overcharge by suction pressure alone — verify with subcooling.",
  },
  {
    title: "Restricted or dirty evaporator airflow",
    signature: `Suction elevated moderately; discharge normal or slightly elevated; evaporator coil may be visibly frosted or frozen. Return-air temperature at grille is warmer than expected.`,
    body: "Reduced airflow across the evaporator means less heat absorption per pound of refrigerant. The evaporator saturation rises to match the reduced heat-transfer rate, and suction pressure climbs. Common causes: clogged filter, closed dampers, undersized return duct, blower motor issue, evaporator coil fouling. Fix: replace filter, verify blower CFM matches spec, clean coil if fouled.",
  },
  {
    title: "TXV overfeed or stuck open",
    signature: `Suction elevated significantly; superheat measured at suction line very low (<5°F) or negative; discharge may be normal or slightly low.`,
    body: "The TXV passes more refrigerant than the evaporator can boil. Coil floods, suction stays elevated, superheat drops to zero. On automotive AC with expansion valves, this is often a stuck-open valve or a failed sensing bulb. Fix: verify TXV bulb is properly attached to suction line (should be at 4–5 o'clock position, insulated); replace valve if internally failed.",
  },
  {
    title: "High indoor load (transient, not a fault)",
    signature: `Suction elevated but discharge also elevated proportionally. High indoor WB (>72°F WB, corresponding to warm humid conditions). System has just started or thermostat setpoint recently lowered.`,
    body: `High indoor sensible + latent load pushes evaporator saturation up. If discharge climbs proportionally, the system is running near the top of its envelope but not faulted — let it run 15–20 minutes to pull the load down and re-measure. This isn't a fault; it's the system doing its job.`,
  },
  {
    title: "Automotive AC — variable-displacement compressor at low speed",
    signature: `Low side sits somewhat above the ${R134A_40F} PSIG R-134a 40°F saturation reference (or ${R1234YF_40F} PSIG on R-1234yf) at idle; high side moderate. Not a fault on variable-displacement systems.`,
    body: `Variable-displacement compressors (common on 2000+ light vehicles) actively hold suction pressure at a control target somewhat below the 40°F saturation reference. At low engine RPM, displacement reduces to hold suction stable while discharge falls. A slightly elevated suction at idle is normal on variable-displacement systems — verify at highway RPM before diagnosing a fault. Realistic 95°F ambient service point: condensing runs 30–35°F above ambient, so ~125–130°F sat → R-134a ${R134A_130F} PSIG, R-1234yf ${R1234YF_130F} PSIG on the high side.`,
  },
  {
    title: "Reversing valve leak-through (heat pump only)",
    signature: `Suction elevated, discharge low; discharge line noticeably cool after the reversing valve. Poor cooling capacity in cooling mode.`,
    body: "Internal leak-through in the reversing valve short-circuits high-side gas back to the suction port. Both pressures move toward each other. Diagnostic: temperature differential at the valve — discharge port should be hot (170°F+ on R-410A). If temps are close between discharge and suction ports, the valve is internally leaking. Fix: replace reversing valve.",
  },
  {
    title: "Compressor valve leakage (aging systems)",
    signature: `Suction elevated, discharge below normal. On shutdown, high and low sides equalize within seconds (should take 3–10 minutes on healthy hermetic).`,
    body: "Worn discharge or suction reeds let high-side gas leak back to the low side during compression. Both pressures converge. Diagnostic: post-shutdown equalization time. See /high-suction-low-head-pressure/ for the full internal-leakage diagnostic tree. Fix: compressor replacement.",
  },
  {
    title: "System operating at high ambient — verify normalcy first",
    signature: `Suction elevated but head pressure also elevated. R-410A at 105°F outdoor sits closer to 45°F evap saturation (${fmtPsigBubble("r-410a", 45)} PSIG) than the 95°F reference of 40°F evap. Not a fault.`,
    body: "On a hot service day, both pressures naturally climb above 95°F rating condition values. Verify the reading against the actual ambient before diagnosing. See /what-pressure-should-410a/ for the full envelope by ambient temperature.",
  },
];

const FAQS = [
  {
    q: "What is normal AC low-side pressure at 95°F outdoor?",
    a: `On a properly-charged system at the 95°F rating condition, suction saturation runs about 40°F: R-410A = ${R410A_40F} PSIG; R-22 = ${fmtPsigBubble("r-22", 40)} PSIG; R-134a automotive = ${R134A_40F} PSIG; R-1234yf automotive = ${R1234YF_40F} PSIG. The manifold reads slightly higher due to suction-line superheat pickup. Values above the OEM manifold band (with other symptoms matching) point to overcharge, restricted airflow, or TXV overfeed — see /what-pressure-should-410a/ (or the specific refrigerant page) for the full observed envelope.`,
  },
  {
    q: "How do I know if it's overcharge vs restricted airflow?",
    a: "Subcooling. Overcharge = high SC (>15°F residential). Restricted airflow = normal SC. Both make suction rise, but SC is the tie-breaker. If SC is high, recover refrigerant. If SC is normal but suction is high, check filter and blower.",
  },
  {
    q: "Is high low-side pressure damaging to the compressor?",
    a: "Not directly, but the underlying cause often is. Overcharge floods the crankcase with liquid refrigerant, diluting the oil and eventually damaging bearings and valves. Restricted airflow overheats the evaporator (if not frozen) and reduces oil return to the compressor. Diagnose and fix — don't just let the system run at elevated suction.",
  },
  {
    q: "Can this happen on a brand-new install?",
    a: "Yes — most commonly from overcharge (installer added refrigerant beyond nameplate weight), improper vacuum (non-condensables trapped, though these usually raise head more than low), or a defective TXV. Verify subcooling on a new install; recover to spec if overcharged.",
  },
  {
    q: "My car AC low side reads well above the saturation reference — is that bad?",
    a: `Depends on system type and RPM. Variable-displacement R-134a systems hold suction stable at a control target below the 40°F saturation reference (${R134A_40F} PSIG); readings substantially higher at idle strongly suggest overcharge. Fixed-displacement (older) R-134a systems can spike briefly at idle then settle lower after 5 minutes running. Verify with high-side: normal high-side + high low-side = overcharge; high both = high ambient or condenser airflow problem.`,
  },
  {
    q: "How does this differ from just 'low suction pressure' problems?",
    a: "Opposite direction. This page = suction ABOVE normal. Low suction pressure = suction BELOW normal (undercharge, restriction, low airflow, evaporator problems). See /low-suction-pressure/ for the reciprocal tree.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "AC Low Side Pressure Too High — Diagnostic Tree",
      description: "Eight-branch diagnostic for AC low-side pressure above normal: overcharge, restricted airflow, TXV overfeed, and variable-displacement compressor behavior on automotive. R-410A, R-134a, and R-1234yf expected values with fixes.",
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
        { "@type": "ListItem", position: 3, name: "AC Low Side Pressure Too High" },
      ],
    },
  ];
}

export default function AcLowSidePressureTooHighPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">AC Low Side Pressure Too High</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AC Low Side Pressure Too High</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Diagnostic tree covering residential HVAC and automotive AC — overcharge is the most common cause; TXV overfeed, restricted airflow, and internal leakage are the next tier.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in two sentences">
          Most commonly overcharge — confirmed by high subcooling (&gt;15°F residential, &gt;20°F automotive). If subcooling is normal, suspect restricted evaporator airflow or TXV overfeed. On R-410A residential at 40°F evap, normal suction is around {R410A_40F} PSIG at saturation; on R-134a auto, {R134A_40F} PSIG at 40°F evap.
        </KeyInsight>

        <TechSection icon="data" tone="purple" title="Diagnostic branches — 8 causes">
          <p>
            Match your measured suction and subcooling to the closest signature. Automotive-specific behavior lives in branch 5 (variable-displacement compressors). All dataset PSIG values from CoolProp 7.2.0.
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

        <TechSection icon="warning" tone="amber" title="Automotive AC — variable-displacement compressor context">
          <p>
            Modern automotive AC systems (2000+ light vehicles) use variable-displacement compressors that hold low-side pressure at a control target near the 32–35°F evaporator saturation range (${fmtPsigBubble("r-134a", 32)}–${R134A_40F} PSIG on R-134a). Fixed-displacement systems (older or truck applications) cycle the clutch to control pressure. Steady suction at idle at the saturation-reference band on a modern variable-displacement system is normal; on an older fixed-displacement system with the clutch always engaged, the same reading suggests overcharge.
          </p>
          <p>
            R-134a and R-1234yf saturation curves cross in the automotive service envelope — R-1234yf is slightly higher than R-134a at evaporator temps (R-1234yf 40°F = {R1234YF_40F} PSIG vs R-134a 40°F = {R134A_40F} PSIG), slightly lower at condenser temps (R-1234yf 130°F = {R1234YF_130F} vs R-134a 130°F = {R134A_130F} PSIG). Cross-contamination diagnostic must include a refrigerant identifier per SAE J2843 before service.
          </p>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools and reference">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — computes measured SC from liquid-line PSIG and temp; the primary overcharge fingerprint.
            </li>
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — SH near zero fingerprints TXV overfeed.
            </li>
            <li>
              <Link href="/refrigerant-charge-calculator/" className="underline">Refrigerant Charge Calculator</Link>{" "}
              — weight-based charge for new installs and post-recovery recharge.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope by ambient.
            </li>
            <li>
              <Link href="/what-pressure-should-r134a/" className="underline">What pressure should R-134a be?</Link>{" "}
              — automotive AC and chiller operating envelope.
            </li>
            <li>
              <Link href="/system-pressure-diagnostic-calculator/" className="underline">System Pressure Diagnostic Calculator</Link>{" "}
              — enter measured pressures + SH/SC and get a pattern-match diagnostic.
            </li>
            <li>
              <Link href="/low-suction-pressure/" className="underline">Low suction pressure (opposite signature)</Link>{" "}
              — for the reciprocal problem: suction BELOW normal.
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
            <li>ACCA Manual T — charging targets.</li>
            <li>SAE J2843 / J2912 — automotive AC service standards.</li>
            <li>CoolProp 7.2.0 — R-410A, R-134a, R-1234yf PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Expected pressure signatures derived at build time from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
