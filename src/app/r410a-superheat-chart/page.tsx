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

const SLUG = "r-410a";
const PAGE_URL = `${SITE_URL}/r410a-superheat-chart/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/r410a-superheat-chart/page.tsx");

// Evap-range quick-lookup temperatures (°F). All values pulled through
// fmtPsigBubble at render time; no PSIG literals in this source.
const EVAP_TEMPS_F = [35, 40, 45, 50, 55];

const SOURCES: readonly { name: string; publisher: string; url: string | null }[] = [
  {
    name: "Bryan Orr, \"What Should My Superheat Be?\" — HVAC School",
    publisher: "HVAC School",
    url: "http://www.hvacrschool.com/what-should-my-superheat-be/",
  },
  {
    name: "\"Target Superheat\" — AC Service Tech",
    publisher: "AC Service Tech",
    url: "https://www.acservicetech.com/posts/target-superheat",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "R410A Superheat Chart: Target Superheat By WB & Outdoor Temp",
  description:
    "R410A target superheat chart for fixed-orifice systems. Indoor wet-bulb 50–75°F rows × outdoor 65–115°F cols; standard formula, 8.5°F at 64WB/95DB.",
  path: "/r410a-superheat-chart/",
});

const FAQS = [
  {
    q: "What is the target superheat for a fixed-orifice R-410A system?",
    a: "It depends on indoor wet-bulb and outdoor dry-bulb. Use the formula TSH = ((3 × WB) − 80 − DB) / 2. At the design point of 64°F indoor WB and 95°F outdoor DB, target superheat is 8.5°F. Look up other combinations in the interactive matrix above.",
  },
  {
    q: "How do I read R-410A suction pressure at the evaporator?",
    a: "Connect the manifold to the low-side service port and read pressure in PSIG after 10–15 minutes of steady operation. Convert to evaporator saturation temperature using the R-410A quick table on this page (or the interactive PT calculator). The saturation temp is what the coil is boiling at; the suction-line temp minus that is superheat.",
  },
  {
    q: "Does R-410A have temperature glide that affects superheat measurement?",
    a: "R-410A is a near-azeotrope with ~0.7°F glide — small enough that most techs treat it as a single-curve fluid for service purposes. The bubble and dew saturation curves are essentially the same. This differs from R-407C or R-454C, where the ~11°F and ~29°F glide requires using the dew curve at the evaporator outlet.",
  },
  {
    q: "Should I use this chart if my R-410A system has a TXV?",
    a: "No. TXV systems regulate superheat to a fixed setpoint (typically 8–15°F) regardless of ambient. Superheat on a TXV system tells you the valve is working — it does not tell you the charge state. Charge TXV / EEV R-410A systems by subcooling (typically 8–12°F per the OEM nameplate). See the R-410A Charging Chart for the subcooling method.",
  },
  {
    q: "What is normal R-410A suction pressure at 95°F outdoor?",
    a: `On a properly-charged residential R-410A system at the 95°F rating condition, the evaporator runs around 40°F saturation (${fmtPsigBubble(SLUG, 40)} PSIG). Actual manifold suction reads slightly higher after superheat pickup on the line between the coil and the service port. See /what-pressure-should-410a/ for the full operating envelope with the OEM-observed manifold band.`,
  },
  {
    q: "The measured superheat is far from the target — what do I do?",
    a: "First verify measurement: WB, DB, suction pressure, and line-temp probe placement. Then add or recover in small increments (1–2 oz at a time on residential systems), giving 5 minutes between adjustments to re-steady. Persistently high SH with low subcooling = undercharge. Persistently low SH with high SC = overcharge. Neither pattern matches = check indoor airflow and metering-device installation before touching charge.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "R-410A Superheat Chart — Target Superheat for Fixed-Orifice AC",
      description:
        "R-410A target superheat lookup by indoor wet-bulb and outdoor dry-bulb, with matching R-410A saturation quick table. Interactive matrix, print PDF, and diagnostic guidance.",
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
        { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators-hub/` },
        { "@type": "ListItem", position: 3, name: "R-410A Superheat Chart" },
      ],
    },
  ];
}

export default function R410aSuperheatChartPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/calculators-hub/" className="hover:underline">Calculators</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">R-410A Superheat Chart</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">R410A Superheat Chart</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Target superheat for fixed-orifice R-410A residential AC. Look up target by indoor WB × outdoor DB, then match against measured superheat at the suction line.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in one line">
          Target SH = ((3 × Indoor WB) − 80 − Outdoor DB) / 2. At 64°F WB / 95°F DB the target is 8.5°F. Fixed-orifice only — TXV systems charge by subcooling.
        </KeyInsight>

        <section className="mt-8 mb-10">
          <h2 className="mb-3 text-xl font-semibold">Interactive lookup and matrix</h2>
          <ChargingChartMatrix label="R-410A target superheat" />
        </section>

        <TechSection icon="data" tone="purple" title="R-410A saturation quick table (evaporator range)">
          <p>
            Convert suction pressure to evaporator saturation temperature (or vice versa) at typical AC evap conditions. Values from CoolProp 7.2.0.
          </p>
          <Panel title="R-410A bubble-point PSIG at 35–55°F" icon={Gauge}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Saturation temp</th>
                    <th className="py-1.5 text-right">PSIG (bubble)</th>
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

        <TechSection icon="book" tone="blue" title="Where this R-410A chart comes from — the short version">
          <p>
            The R-410A target values in the matrix above come from the same formula used for every fixed-orifice residential refrigerant — the R-410A specialization is just that we pair the target with an R-410A saturation quick table so you don&apos;t need a separate PT chart in hand. The formula itself, TSH = ((3 × WB) − 80 − DB) / 2, has a looser history than &quot;spec&quot; suggests: its precise origin was never recorded, and it survives because it&apos;s close enough in the heart of the chart where most residential charging happens.
          </p>
          <p>
            The best account is recounted by HVAC School, who put the question to Wayne Pendergast, keeper of several published versions of the chart. The story traces to Carrier: a residential AC charged perfectly by weight on the lab bench, then run across a matrix of indoor and outdoor conditions with resulting superheat plotted at each point. That empirical plot — not a derived equation — is the ancestor of every target superheat chart in the trade, including this R-410A one. Treat as an industry account, not audited history. The formula came later; HVAC School describes it as &quot;likely reverse engineered&quot; from the chart. AC Service Tech&apos;s coverage concurs that the formula &quot;may not match exactly&quot; the chart it approximates: the small discrepancies near the middle widen substantially toward the corners, enough that the formula stops being trustworthy exactly where charging is most delicate.
          </p>
          <p>
            That&apos;s why this page blanks target cells below 5°F. The sub-5°F corners are where published charts themselves go blank and where the formula&apos;s fit is least trustworthy — charging by superheat simply isn&apos;t reliable there. The universal <Link href="/target-superheat-chart/" className="underline">target superheat chart page</Link> carries the full origin account.
          </p>
        </TechSection>

        <TechSection icon="book" tone="purple" title="Fixed-orifice only — the mechanism behind the rule">
          <p>
            The chart applies to fixed-orifice R-410A metering (pistons, capillary tubes) and to nothing else. The mechanism is clean: on a fixed-orifice system, superheat is what the charge produces — add refrigerant and SH falls, remove and SH rises, so SH IS the charging indicator. On an R-410A TXV or EEV system, the valve actively holds SH near a fixed setpoint by throttling; SH tells you the valve is working, not the charge. HVAC School&apos;s fixed-orifice-only rule reduces to that distinction: charge a system whose SH responds to charge by SH, and one whose SC responds to charge by SC. For the TXV / EEV side of R-410A charging, see the <Link href="/r410a-charging-chart/" className="underline">R-410A charging chart</Link>.
          </p>
        </TechSection>

        <TechSection icon="gauge" tone="emerald" title="Reading your gauges">
          <p>
            On a properly-charged R-410A residential AC at the 95°F rating condition with 64°F indoor WB, the evaporator runs around 40°F saturation ({fmtPsigBubble(SLUG, 40)} PSIG). The manifold at the low-side service port reads slightly higher than this due to superheat pickup on the suction line between the coil and the port. Measured suction-line temperature minus 40°F is your measured superheat; match against the 8.5°F target from the matrix.
          </p>
          <p>
            At a warmer 105°F outdoor day the condenser saturation climbs into the 115–120°F range ({fmtPsigBubble(SLUG, 120)} PSIG), the evaporator can hold at ~40°F saturation with adequate airflow, and the target superheat drops (target at 64°F WB / 105°F DB = 3.5°F — see the &quot;—&quot; footnote if the matrix blanks a cell). Charge decisions still follow the same procedure; the SH target just shifts.
          </p>
          <p>
            The 95°F outdoor DB reference isn&apos;t arbitrary — it&apos;s the AHRI Standard 210/240 cooling rating condition, which is why residential AC specs and OEM charging charts center on the same anchor. If you&apos;re charging on a day materially warmer or cooler than 95°F outdoor, the target shifts along the DB axis but the matrix accounts for it directly. If your climate parks you chronically at sub-5°F targets (dry-air regions with warm outdoor DB), AC Service Tech&apos;s guidance is to consider a TXV conversion or an accumulator on the suction line — either restores enough operating margin to charge with confidence.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="When target renders as &quot;—&quot;">
          <p>
            Cells below 5°F blank out because charging by superheat becomes unreliable there — normal probe error swamps the target. If your operating point falls in a blanked cell, verify the measurements first (dry psychrometer wick, sun-shaded DB probe), then check that the system is actually fixed-orifice. Many modern R-410A residential AC units built after 2015 are TXV and should be charged by subcooling instead.
          </p>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — measured SH from suction PSIG and line temp for R-410A and any other refrigerant.
            </li>
            <li>
              <Link href="/refrigerant/r-410a/" className="underline">R-410A reference page</Link>{" "}
              — full PT chart, properties, GWP, lubricant, retrofit context.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope with head + suction ranges.
            </li>
            <li>
              <Link href="/r410a-charging-chart/" className="underline">R410A Charging Chart</Link>{" "}
              — two-method charging: TXV/EEV by subcooling, fixed-orifice by superheat.
            </li>
            <li>
              <Link href="/target-superheat-chart/" className="underline">Target Superheat Chart (universal)</Link>{" "}
              — the underlying formula and applicability, refrigerant-independent.
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
            <li>ACCA technician charging references (name-only).</li>
            <li>Carrier, Trane, Lennox, Rheem residential AC installation manuals — R-410A fixed-orifice charging bulletins.</li>
            <li>AHRI Standard 210/240 — 95°F outdoor dry-bulb cooling rating condition.</li>
            <li>CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014) — R-410A PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. The provenance section paraphrases HVAC School&apos;s recounted account and AC Service Tech&apos;s edge-behavior characterization; direct sentences are not reproduced. Every PSIG value on this page is derived at build time from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
