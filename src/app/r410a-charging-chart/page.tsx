import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Gauge, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { ChargingChartMatrix } from "@/components/calculators/ChargingChartMatrix";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const SLUG = "r-410a";
const PAGE_URL = `${SITE_URL}/r410a-charging-chart/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/r410a-charging-chart/page.tsx");

// Liquid-line saturation temperatures for the subcooling method.
const COND_TEMPS_F = [95, 100, 105, 110, 115, 120, 125, 130];

const SOURCES: readonly { name: string; publisher: string; url: string | null }[] = [
  {
    name: "Bryan Orr, \"What Should My Superheat Be?\" — HVAC School",
    publisher: "HVAC School",
    url: "http://www.hvacrschool.com/what-should-my-superheat-be/",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "R410A Charging Chart: Subcooling & Superheat Targets (Free)",
  description:
    "R410A charging chart with two-method structure: TXV/EEV target 8–12°F subcooling; fixed-orifice uses target superheat matrix. Free printable, no signup.",
  path: "/r410a-charging-chart/",
});

const FAQS = [
  {
    q: "Which R-410A charging method do I use — superheat or subcooling?",
    a: "Depends on the metering device. Fixed-orifice / piston / capillary tube systems: charge by target superheat (indexed on indoor WB × outdoor DB). TXV / EEV systems: charge by subcooling (typically 8–12°F per the OEM nameplate). Check the indoor coil label — most R-410A systems built after ~2015 are TXV.",
  },
  {
    q: "What is the target subcooling for a TXV R-410A residential AC?",
    a: "General target is 8–12°F liquid-line subcooling under steady-state conditions. The OEM nameplate governs — some manufacturers spec 10°F ±2°F; some spec a range that varies with outdoor DB. Always cross-check against the specific equipment's charging label. Sub-8°F usually indicates undercharge; over-15°F usually indicates overcharge (or a restricted metering device).",
  },
  {
    q: "Can I charge an R-410A system without knowing the metering device?",
    a: "No. The two methods give opposite answers on the same system. On a TXV: measured superheat will hover near the valve setpoint regardless of charge — following the superheat chart tells you nothing useful, and you can walk away from an undercharged system with normal-looking SH readings. On a fixed-orifice: measured subcooling swings wildly with load — the subcooling method gives you unstable readings. Identify the metering device first.",
  },
  {
    q: "What R-410A liquid-line pressure should I see on a hot day?",
    a: `Condenser saturation typically runs 20–30°F above outdoor ambient — so on a 95°F day expect ~115–125°F saturation (${fmtPsigBubble(SLUG, 120)} PSIG at 120°F). Subcooling is measured as saturation temperature at the discharge minus the actual liquid-line temperature entering the metering device.`,
  },
  {
    q: "Does the Carrier bead chart differ from this superheat matrix?",
    a: "The Carrier chart uses discrete cells (6 WB rows × 6 outdoor DB cols) with rounded target values that generally match the (3×WB − 80 − DB)/2 formula within ±2°F. Manufacturer-tuned adjustments account for coil geometry. See /carrier-410a-charging-chart/ for the Carrier-specific version with the interactive service-bulletin lookup.",
  },
  {
    q: "Are Goodman, Trane, Lennox, and Rheem R-410A charging charts different?",
    a: "Structurally identical: 2D lookup (WB × DB) yielding target superheat for fixed-orifice; single or DB-indexed subcooling target for TXV. Individual cell values differ by ±1–2°F because each OEM tunes to their equipment. Charts are model-specific — always check the sticker inside the outdoor unit's access panel for your specific model. Do not use a Carrier chart on a Rheem unit at the ±2°F precision level; use the OEM chart for your equipment.",
  },
  {
    q: "How much refrigerant should I add if I'm below target subcooling?",
    a: "Add in 1–2 oz increments for residential systems (roughly ¼ oz per pound of installed charge). Wait 5–10 minutes after each addition for the system to re-steady. Measure again. Do not add refrigerant in large increments — you can overshoot and end up recovering. Use a calibrated charging scale, not a sight glass or gauge feel.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "R-410A Charging Chart — Subcooling and Superheat Targets",
      description:
        "R-410A charging by method: TXV/EEV subcooling target with liquid-line quick table, and fixed-orifice superheat matrix. Brand chart guidance and OEM-nameplate discipline.",
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
        { "@type": "ListItem", position: 3, name: "R-410A Charging Chart" },
      ],
    },
  ];
}

export default function R410aChargingChartPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/calculators-hub/" className="hover:underline">Calculators</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">R-410A Charging Chart</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">R410A Charging Chart</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Two methods, one page: charge TXV / EEV systems by subcooling (8–12°F general target, OEM nameplate governs); charge fixed-orifice systems by target superheat. Identify the metering device before choosing a method.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in one line">
          TXV/EEV → subcooling 8–12°F on the liquid line. Fixed-orifice → target superheat by WB × DB. Wrong method on wrong system = wrong charge.
        </KeyInsight>

        <section id="subcooling-chart" className="mt-8 mb-10">
          <h2 className="mb-3 text-xl font-semibold">Method 1 — Subcooling (TXV / EEV)</h2>
          <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
            On TXV or EEV systems, the metering device regulates superheat to a fixed setpoint. Superheat tells you the valve is working, not the charge. Charge to a subcooling target read on the liquid line: liquid-line saturation temperature (from discharge PSIG) minus actual liquid-line temperature entering the metering device.
          </p>
          <Panel title="R-410A liquid-line PSIG at typical condenser saturation temps" icon={Gauge}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="py-1.5 text-left">Condensing temp</th>
                    <th className="py-1.5 text-right">PSIG (bubble)</th>
                  </tr>
                </thead>
                <tbody>
                  {COND_TEMPS_F.map((t) => (
                    <tr key={t} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                      <td className="py-1.5 text-left">{t}°F</td>
                      <td className="py-1.5 text-right">{fmtPsigBubble(SLUG, t)} PSIG</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            <strong>Nameplate governs.</strong> General 8–12°F target is a starting point — the equipment&apos;s OEM charging label supersedes it, and some manufacturers spec a DB-indexed target (e.g. 8°F at 65°F outdoor, 12°F at 105°F outdoor). Never charge past the label spec. HVAC School frames the underlying rule mechanically: on TXV / EEV metering the valve throttles to hold SH near its adjustment setpoint, so SH tells you the valve is working, not the charge — subcooling is the charging indicator, and the OEM&apos;s SC target governs what &quot;charged correctly&quot; means for that equipment.
          </p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            The 95°F outdoor DB reference in the table above is the AHRI Standard 210/240 cooling rating condition, which is why residential AC subcooling targets and OEM charging charts center on the same anchor. If you&apos;re charging on a day materially warmer or cooler than 95°F outdoor, the target may shift by DB per the OEM&apos;s chart; always cross-check the equipment label for DB-adjusted targets.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Method 2 — Target superheat (fixed-orifice / piston)</h2>
          <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
            On fixed-orifice systems (piston, capillary), the metering device doesn&apos;t regulate — charge sets superheat directly. HVAC School&apos;s rule is that on fixed-orifice equipment SH IS the charging indicator: add refrigerant, SH falls; remove refrigerant, SH rises. That&apos;s why the target-superheat method applies here and only here. Look up target SH by indoor WB and outdoor DB, then match measured SH at the suction line.
          </p>
          <ChargingChartMatrix
            label="R-410A target superheat (fixed-orifice)"
            wbRows={[54, 58, 62, 66, 70, 74]}
            dbCols={[65, 75, 85, 95, 105, 115]}
          />
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Compact matrix (6 × 6). The full 14 × 13 matrix lives on the <Link href="/r410a-superheat-chart/" className="underline">R-410A Superheat Chart</Link> page.
          </p>
        </section>

        <TechSection icon="insight" tone="blue" title="Weight-based charging — the primary method, SH / SC verifies">
          <p>
            Weight is the primary charging method for a new install or a post-recovery recharge. Post-vacuum, charge to nameplate weight with a calibrated scale, then verify by measuring SC (TXV / EEV) or SH (fixed-orifice) at steady state. On residential AC the two should land close to the OEM target if the charge is right — if they don&apos;t, something else is going on (measurement error, system fault, or the wrong nameplate). Don&apos;t charge to gauge feel or sight glass alone; both are unreliable indicators that routinely land systems overcharged.
          </p>
          <p>
            Overcharge correction on either method requires refrigerant recovery under EPA Section 608 certification — recover into an evacuated cylinder, don&apos;t vent, and don&apos;t attempt to &quot;burn off&quot; excess by running the system without cooling load.
          </p>
        </TechSection>

        <TechSection icon="service" tone="emerald" title="Field procedure — either method">
          <Panel title="Charge-verification steps" icon={ListChecks}>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Identify the metering device — inspect the indoor coil label. TXV/EEV → subcooling. Fixed-orifice / piston → superheat.</li>
              <li>Steady-state the system for 10–15 minutes at design or near-design conditions.</li>
              <li>Measure indoor WB (return grille), outdoor DB (shaded, near condenser).</li>
              <li>Read gauges: suction PSIG (low side) and discharge PSIG (high side).</li>
              <li>Read line temperatures: suction line and liquid line, with contact probes on clean, insulated copper 6 inches from the service port.</li>
              <li>Convert pressures to saturation temperatures with the tables above (or the interactive PT calculator).</li>
              <li>Compute measured SH (suction) and SC (liquid). Compare to targets.</li>
              <li>Add or recover in 1–2 oz increments. Re-steady 5 minutes between increments. Iterate until measured matches target within ±2°F.</li>
            </ol>
          </Panel>
        </TechSection>

        <TechSection icon="book" tone="purple" title="Brand-specific charging charts">
          <p>The universal chart above covers the R-410A charging method. Individual OEMs (Carrier, Trane, Lennox, Rheem, Goodman) publish charts with cell values tuned to their equipment. Always use the chart printed on the outdoor unit&apos;s access panel for your specific model; the universal chart is for reference, not for final charge decisions on a specific unit.</p>
          <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
            <li>
              <Link href="/carrier-410a-charging-chart/" className="underline">Carrier R-410A charging chart</Link>{" "}
              — the widely-referenced Carrier service-bulletin chart with the interactive lookup.
            </li>
            <li><strong>Goodman:</strong> Goodman publishes model-specific charging tables in their installation manuals; there is no single &quot;Goodman R-410A chart&quot;. Check the sticker inside the outdoor unit access panel.</li>
            <li><strong>Trane:</strong> Trane splits by high-efficiency (XV, XR series) and standard-efficiency lines with distinct charts; use the model-specific chart from the installation manual.</li>
            <li><strong>Lennox:</strong> Lennox publishes single-chart references in the outdoor unit install manual for their piston-metering lines.</li>
            <li><strong>Rheem / Ruud:</strong> Rheem uses OEM-tuned tables in the model-specific service documents.</li>
          </ul>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/r410a-superheat-chart/" className="underline">R-410A Superheat Chart</Link>{" "}
              — full 14 × 13 target-superheat matrix + R-410A evap quick table.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — computes measured SC from liquid-line PSIG and temperature.
            </li>
            <li>
              <Link href="/refrigerant-charge-calculator/" className="underline">Refrigerant Charge Calculator</Link>{" "}
              — weight-based charge for new installs (post-vacuum charge to nameplate weight).
            </li>
            <li>
              <Link href="/carrier-410a-charging-chart/" className="underline">Carrier R-410A Charging Chart</Link>{" "}
              — Carrier-specific bead chart with interactive lookup.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope.
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
            <li>OEM (Carrier / Trane / Lennox / Goodman / Rheem) residential AC installation manuals — subcooling and superheat targets.</li>
            <li>AHRI Standard 210/240 — 95°F outdoor dry-bulb cooling rating condition.</li>
            <li>EPA 40 CFR Part 82 Subpart F — Section 608 recovery certification.</li>
            <li>CoolProp 7.2.0 — R-410A PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Facts on this page are paraphrased from the linked sources; direct sentences are not reproduced. All PSIG values derived at build from the dataset.</p>
        </footer>
      </article>
    </>
  );
}
