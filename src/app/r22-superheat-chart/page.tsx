import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Gauge } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { ChargingChartMatrix } from "@/components/calculators/ChargingChartMatrix";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const SLUG = "r-22";
const PAGE_URL = `${SITE_URL}/r22-superheat-chart/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/r22-superheat-chart/page.tsx");

const EVAP_TEMPS_F = [35, 40, 45, 50, 55];

export const metadata: Metadata = pageMetadata({
  title: "R22 Superheat Chart: Target Superheat By WB & Outdoor Temp",
  description:
    "R22 target superheat chart for fixed-orifice AC systems: wet-bulb 50–75°F rows × outdoor 65–115°F cols. Industry TSH formula, printable PDF, 15 min.",
  path: "/r22-superheat-chart/",
});

const FAQS = [
  {
    q: "What is the target superheat for a fixed-orifice R-22 system?",
    a: "It depends on indoor wet-bulb and outdoor dry-bulb. Use TSH = ((3 × WB) − 80 − DB) / 2. At the 64°F indoor WB / 95°F outdoor DB design point, target superheat is 8.5°F. Look up other combinations in the interactive matrix above.",
  },
  {
    q: "Is the target-superheat formula the same for R-22 and R-410A?",
    a: "Yes. The formula sets the operating point based on load conditions (WB) and heat rejection (DB); the refrigerant enters only when you convert measured suction pressure to saturation temperature. The R-22 and R-410A charts have the same target values in the same cells — only the PT-chart conversion differs.",
  },
  {
    q: "Where do I still find R-22 fixed-orifice equipment in service?",
    a: "R-22 residential AC production ended in 2010; virgin R-22 production stopped in January 2020 under the EPA HCFC phase-out. Equipment installed 1990–2010 is still widely in service and legal to maintain with reclaimed R-22. Most of that equipment uses fixed-orifice metering (piston or capillary tube), so the target-superheat method still applies during service.",
  },
  {
    q: "What is normal R-22 suction pressure at 95°F outdoor?",
    a: `On a properly-charged R-22 residential AC at the 95°F rating condition, evaporator saturation runs around 40°F (${fmtPsigBubble(SLUG, 40)} PSIG). Manifold reads slightly higher due to superheat pickup on the suction line. See /what-pressure-should-r22/ for the full envelope and OEM-observed manifold band.`,
  },
  {
    q: "Can I use this chart for an R-22 system retrofitted to R-407C or R-422D?",
    a: "The target-superheat method still applies (retrofit blends don't change the fixed-orifice charging approach), but the suction-pressure to saturation-temperature conversion uses the retrofit refrigerant's PT curve. R-407C is zeotropic with ~11°F glide — use the dew curve at the evaporator outlet. R-422D is a near-azeotrope — single curve is adequate.",
  },
  {
    q: "Reclaimed R-22 is expensive. Is it worth troubleshooting to superheat target rather than just swapping the system?",
    a: "Depends on remaining equipment life and reclaim cost in your market. Reclaimed R-22 typically runs $50–150/lb (2024–2026 residential service market). A residential AC with a ~4 lb charge and 5+ years of expected life is worth diagnosing and correcting to target. A 20+ year-old system with a leaking coil is often better replaced with new equipment; superheat-charge the new one instead.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "R-22 Superheat Chart — Target Superheat for Fixed-Orifice AC",
      description:
        "R-22 target superheat lookup by indoor wet-bulb and outdoor dry-bulb, with matching R-22 saturation quick table. Interactive matrix and print PDF.",
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
        { "@type": "ListItem", position: 3, name: "R-22 Superheat Chart" },
      ],
    },
  ];
}

export default function R22SuperheatChartPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/calculators-hub/" className="hover:underline">Calculators</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">R-22 Superheat Chart</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">R22 Superheat Chart</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Target superheat for fixed-orifice R-22 residential AC. Same formula as R-410A; R-22 pressures are substantially lower across the envelope.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in one line">
          Target SH = ((3 × Indoor WB) − 80 − Outdoor DB) / 2. Same formula as any fixed-orifice fluid. At 64°F WB / 95°F DB the target is 8.5°F.
        </KeyInsight>

        <section className="mt-8 mb-10">
          <h2 className="mb-3 text-xl font-semibold">Interactive lookup and matrix</h2>
          <ChargingChartMatrix label="R-22 target superheat" />
        </section>

        <TechSection icon="data" tone="purple" title="R-22 saturation quick table (evaporator range)">
          <p>
            R-22 saturation pressures at typical evaporator conditions. Values from CoolProp 7.2.0. R-22 is a pure HCFC — no glide, single curve.
          </p>
          <Panel title="R-22 PSIG at 35–55°F saturation" icon={Gauge}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Saturation temp</th>
                    <th className="py-1.5 text-right">PSIG</th>
                  </tr>
                </thead>
                <tbody>
                  {EVAP_TEMPS_F.map((t) => (
                    <tr key={t} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                      <td className="py-1.5 text-left">{t}°F</td>
                      <td className="py-1.5 text-right">{fmtPsigBubble(SLUG, t)} PSIG</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TechSection>

        <TechSection icon="gauge" tone="emerald" title="Reading your gauges">
          <p>
            On a properly-charged R-22 residential AC at 95°F outdoor with 64°F indoor WB, the evaporator runs around 40°F saturation ({fmtPsigBubble(SLUG, 40)} PSIG). The manifold reads slightly higher after superheat pickup on the suction line. Measured suction-line temperature minus 40°F is your measured superheat; match against the 8.5°F target from the matrix.
          </p>
          <p>
            R-22 saturation pressures are about 60% of R-410A across the envelope — different absolute PSIG values but the same target-superheat math. If you&apos;re used to R-410A numbers and switch to an R-22 service call, adjust your gauge-reading habits, not the target.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="When target renders as &quot;—&quot;">
          <p>
            Cells below 5°F blank because charging by superheat is unreliable at those setpoints. If you land in a blanked cell, verify WB and DB measurements first (dry wick = 2–3°F low; sun on the DB probe = 5–10°F high), then confirm the equipment is fixed-orifice.
          </p>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — measured SH from suction PSIG and line temp.
            </li>
            <li>
              <Link href="/refrigerant/r-22/" className="underline">R-22 reference page</Link>{" "}
              — full PT chart, properties, phase-down context.
            </li>
            <li>
              <Link href="/what-pressure-should-r22/" className="underline">What pressure should R-22 be?</Link>{" "}
              — full residential AC operating envelope.
            </li>
            <li>
              <Link href="/target-superheat-chart/" className="underline">Target Superheat Chart (universal)</Link>{" "}
              — the formula and applicability, refrigerant-independent.
            </li>
            <li>
              <Link href="/r-22-vs-r-410a/" className="underline">R-22 vs R-410A comparison</Link>{" "}
              — pressure envelope, lubricant, and retrofit differences.
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
            <li>ACCA Manual T — the target-superheat formula.</li>
            <li>OEM (Carrier / Trane / Lennox / Rheem) residential AC installation manuals.</li>
            <li>CoolProp 7.2.0 — R-22 PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. PSIG values derived at build from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
