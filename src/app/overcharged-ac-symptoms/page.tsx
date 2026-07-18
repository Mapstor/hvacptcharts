import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { GaugeSignatureDiagram } from "@/components/diagrams/GaugeSignatureDiagram";
import { FloodedCondenserDiagram } from "@/components/diagrams/FloodedCondenserDiagram";
import { Panel } from "@/components/calculators/shared/ServiceProblem";

const PAGE_URL = `${SITE_URL}/overcharged-ac-symptoms/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/overcharged-ac-symptoms/page.tsx");

const R410A_130F = fmtPsigBubble("r-410a", 130);
const R410A_120F = fmtPsigBubble("r-410a", 120);
const R134A_130F = fmtPsigBubble("r-134a", 130);
const R1234YF_130F = fmtPsigBubble("r-1234yf", 130);

const SOURCES: readonly { name: string; publisher: string; url: string | null }[] = [
  {
    name: "Sporlan (Parker) Bulletin 10-11 — Thermostatic Expansion Valves: Installing and Servicing (June 2011)",
    publisher: "Parker Hannifin / Sporlan Division",
    url: "https://www.parker.com/content/dam/Parker-com/Literature/Sporlan/Sporlan-pdf-files/Sporlan-pdf-010/10-11.pdf",
  },
  {
    name: "Bryan Orr, \"What Should My Superheat Be?\" — HVAC School",
    publisher: "HVAC School",
    url: "http://www.hvacrschool.com/what-should-my-superheat-be/",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Overcharged AC Symptoms: 8 Signs Of Too Much Refrigerant",
  description:
    "Overcharged AC symptoms: high head pressure, high subcooling above 12°F, elevated compressor amps, oil dilution. 8 signs with diagnostic procedure.",
  path: "/overcharged-ac-symptoms/",
});

// Sign count assertion — if this array length ever drifts, the "8 Signs"
// count in the title becomes wrong. Assert at build; a mismatch throws.
const SIGNS = [
  {
    title: "High discharge pressure (head pressure) — the primary signature",
    body: `Excess refrigerant fills the condenser, reducing the surface area available for actual heat rejection. Discharge climbs. On R-410A residential at 95°F outdoor with a proper charge, discharge saturation runs 115–120°F (${R410A_120F} PSIG). Overcharged, discharge saturation may reach 130°F or higher (${R410A_130F} PSIG). Automotive R-134a at 95°F ambient: expected condensing ~130°F (${R134A_130F} PSIG); overcharged runs progressively higher — see /what-pressure-should-r134a/ for the observed automotive envelope.`,
  },
  {
    title: "High subcooling — the definitive diagnostic",
    body: "Subcooling (saturation temp at condensing minus liquid line temp) is the tie-breaker between overcharge and other high-head causes. Normal SC on a TXV residential AC: 8–12°F. Overcharge: >15°F, often 20°F+. Excess refrigerant sits liquid in the condenser bottom, subcooling further before entering the metering device. If SC is high AND head is high, overcharge is confirmed. The reservoir physics behind that SC number matters for the diagnosis. On a TXV system, the valve throttles to hold superheat at its adjustment setpoint regardless of charge — so a moderate overcharge doesn't immediately show up on the evaporator side. The excess refrigerant has nowhere to boil (the evaporator load hasn't changed), so it stacks up as liquid in the condenser bottom and receiver. SC rises because more of the condenser sits full of liquid, sensibly cooling below saturation. Sporlan Bulletin 10-11's discussion of TEV response covers exactly this reservoir behavior: the valve absorbs charge deviation up to the point where the receiver is full, then the condensing pressure and SC both climb sharply — the \"sudden overcharge\" fingerprint techs see on the manifold is often the tail end of a slow drift.",
  },
  {
    title: "Elevated compressor amp draw",
    body: "Higher discharge pressure means more compressor work per pound moved. Motor amps typically climb 5–15% above nameplate FLA under overcharge. Combined with high head pressure, this is a strong indicator. A digital clamp meter at the outdoor unit takes 30 seconds to check.",
  },
  {
    title: "Poor cooling despite the system running continuously",
    body: "Counter-intuitively, an overcharged system often cools less effectively — the flooded condenser rejects less heat, so evaporator load isn't fully carried away, indoor temp barely drops from setpoint. Homeowner complaint is often 'AC running all day, house still 78°F'.",
  },
  {
    title: "Liquid refrigerant returning to compressor (flooded suction)",
    body: "In severe overcharge, liquid refrigerant reaches the compressor crankcase. Symptoms: cold or frost on the suction line at the compressor inlet, oil foam visible through sight glass (if equipped), oil dilution reducing lubrication. Prolonged operation in this state damages compressor bearings and valves.",
  },
  {
    title: "Low measured superheat",
    body: "On a fixed-orifice system, overcharge floods the evaporator and pushes measured superheat below target — sometimes to zero or negative. TXV systems maintain superheat regardless of charge, so this sign only applies to fixed-orifice equipment. Combined with high SC on a fixed-orifice system, overcharge is confirmed.",
  },
  {
    title: "Compressor knocking, slugging, or unusual sounds on startup",
    body: "Liquid refrigerant in the crankcase during off-cycle floods the compressor at start. On start, the pump-out pushes liquid through the discharge valves — audible knock or vibration for the first few seconds. Chronic overcharge conditions this into every startup, wearing valves and bearings quickly.",
  },
  {
    title: "High-pressure safety switch tripping under load",
    body: `The high-pressure switch trips to protect the compressor when discharge exceeds design limits (OEM-specific cutout — check the equipment nameplate). As saturation references: R-410A at 140°F cond sat = ${fmtPsigBubble("r-410a", 140)} PSIG; R-134a auto at 150°F cond sat = ${fmtPsigBubble("r-134a", 150)} PSIG. Overcharge combined with high ambient or dirty condenser can push discharge into cutout range. Repeated cutouts under normal conditions are a definitive high-charge indicator.`,
  },
];

// Build-time assertion: title says "8 Signs" — array must have 8 entries.
if (SIGNS.length !== 8) {
  throw new Error(
    `overcharged-ac-symptoms: title says "8 Signs" but SIGNS array has ${SIGNS.length} entries. ` +
      `Update the title/description to match the actual count, or add/remove signs to hit 8.`,
  );
}

const FAQS = [
  {
    q: "What is the most reliable sign of an overcharged AC?",
    a: "High subcooling. Subcooling is the tie-breaker between overcharge and other high-head-pressure causes. Overcharge: SC >15°F on a TXV residential AC (typical spec is 8–12°F). Combined with high discharge pressure, high SC confirms overcharge. Do NOT diagnose overcharge from discharge alone — dirty condenser and non-condensables also raise discharge but with different SC signatures.",
  },
  {
    q: "How much extra refrigerant makes an AC overcharged?",
    a: "Even 5–10% over nameplate weight starts causing measurable SC elevation. On a typical residential AC with a 4-lb nameplate charge, 5 oz over spec (7%) is enough to push SC from 10°F to 15°F+ and drive discharge saturation up by several °F above the ambient reference. This is why weight-based charging with a calibrated scale matters — gauge-feel charging routinely overshoots.",
  },
  {
    q: "Can I fix an overcharged AC myself?",
    a: "Recovering refrigerant requires EPA Section 608 certification (federal law under 40 CFR Part 82). If you're EPA-certified, recover in 1–2 oz increments back to target SC using a calibrated scale. If you're not, a certified technician can correct it in under an hour.",
  },
  {
    q: "How is overcharge different from a dirty condenser (both raise head pressure)?",
    a: "Subcooling and cleanliness. Overcharge: SC very high (>15°F); condenser visually clean. Dirty condenser: SC normal (~10°F); coil visibly dirty. Both raise head, but SC and visual inspection separate the causes. Sometimes both apply — clean the coil first, then verify SC.",
  },
  {
    q: "Does overcharge damage the compressor?",
    a: "Yes, chronically. Flooded suction leads to oil dilution; liquid entering the discharge valves damages reeds; elevated head pressure stresses valve plates and bearings. Short-term overcharge (hours) is recoverable; sustained overcharge (weeks/months) shortens compressor life materially.",
  },
  {
    q: "How do I verify SC is high — what's the procedure?",
    a: "Steady-state the system 10–15 minutes. Read discharge pressure at the manifold, convert to saturation temperature using the PT chart for the refrigerant. Measure liquid-line temperature at the filter-drier outlet (or as close to the metering device as accessible) with a contact temperature probe. SC = saturation temp − line temp. Compare to nameplate spec (typically 8–12°F on TXV residential).",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Overcharged AC Symptoms — 8 Signs of Too Much Refrigerant",
      description: "Eight-signature diagnostic for overcharged AC: high head, high subcooling, elevated amps, poor cooling, flooded suction, low SH, compressor knocking, high-pressure switch trips.",
      proficiencyLevel: "Beginner",
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
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "Overcharged AC Symptoms" },
      ],
    },
  ];
}

export default function OverchargedAcSymptomsPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Overcharged AC Symptoms</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Overcharged AC Symptoms</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            8 signs of an AC with too much refrigerant. High subcooling is the definitive fingerprint — high discharge pressure with normal SC points to a different cause. Applies to residential and automotive AC.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in two sentences">
          The primary fingerprint is high subcooling (&gt;15°F on a TXV residential AC vs 8–12°F normal), combined with elevated discharge pressure. On R-410A residential at 130°F condensing sat = {R410A_130F} PSIG; overcharged systems climb toward that. Discharge alone can be raised by dirty condensers or non-condensables — SC is the tie-breaker.
        </KeyInsight>

        <GaugeSignatureDiagram
          slug="r-410a"
          normalEvapTempF={40}
          normalCondTempF={105}
          faultLow="up"
          faultHigh="up"
          faultLabel="Both sides elevated — overcharge signature"
        />

        <TechSection icon="data" tone="purple" title="8 signs of overcharge">
          <p>
            The signs vary in reliability. Signs 1 and 2 (high head + high SC together) are the definitive combined fingerprint. Signs 3–8 confirm but can also result from other issues; don&apos;t diagnose overcharge from any single sign in isolation.
          </p>
          <div className="mt-4 space-y-4">
            {SIGNS.map((s, i) => (
              <Panel key={i} title={`${i + 1}. ${s.title}`} icon={ListChecks}>
                <div className="text-sm">
                  <p>{s.body}</p>
                </div>
              </Panel>
            ))}
          </div>
          <FloodedCondenserDiagram />
        </TechSection>

        <TechSection icon="service" tone="emerald" title="Diagnostic procedure">
          <Panel title="Verify overcharge in the field" icon={ListChecks}>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Steady-state the system for 10–15 minutes at design or near-design conditions.</li>
              <li>Read discharge and suction pressures at the manifold. Compare to expected values for actual ambient (see linked what-pressure page for your refrigerant).</li>
              <li>Measure liquid-line temperature at the filter-drier outlet with a contact probe.</li>
              <li>Convert discharge PSIG to condensing saturation temperature using the PT chart for the refrigerant.</li>
              <li>Compute subcooling: SC = condensing sat temp − liquid-line temp.</li>
              <li>If SC &gt; 15°F (residential TXV) or &gt; 20°F (automotive), overcharge is confirmed.</li>
              <li>Recover refrigerant in 1–2 oz increments; wait 5 min between increments for re-steady. Re-measure SC. Repeat until SC returns to spec.</li>
              <li>Verify SH after correcting SC — a properly-charged system reads both SC and SH near spec.</li>
            </ol>
          </Panel>
        </TechSection>

        <TechSection icon="warning" tone="purple" title="Fixed-orifice vs TXV — the most misdiagnosed thing about overcharge">
          <p>
            HVAC School frames the fixed-orifice-vs-TXV distinction as the single most misdiagnosed part of overcharge diagnosis, and the reason is mechanical. The two metering styles respond to added refrigerant in fundamentally different ways, and the diagnostic fingerprint on the manifold is different in each case.
          </p>
          <p>
            On a fixed-orifice system (piston, capillary tube), the metering device passes whatever the pressure differential lets through — it doesn&apos;t regulate. Overcharge slams both gauges up: suction climbs because the coil floods, head climbs because the condenser fills, and superheat drops because on fixed-orifice equipment the charge itself sets the operating SH. All three symptoms present within minutes of the added mass, and the diagnosis reads clearly on the gauges alone.
          </p>
          <p>
            On a TXV or EEV system, the valve actively holds SH near its adjustment setpoint by throttling — so overcharge doesn&apos;t touch SH the way it does on fixed-orifice. Suction can look near-normal for hours because the valve compensates on the low side. Head does rise (the excess refrigerant still fills the condenser), but a moderate head rise can be mistaken for a hot-day operating point rather than an overcharge signature. Subcooling is the only reliable early indicator on TXV: SC climbs as the receiver fills, and once it&apos;s past nameplate spec (8–12°F) the system is overcharged even if suction hasn&apos;t moved yet. The reservoir behavior detailed in Sign 2 above is why SC leads the other symptoms on a TXV system.
          </p>
        </TechSection>

        <TechSection icon="insight" tone="blue" title="Why SC blows out nonlinearly with overcharge weight">
          <p>
            The relationship between charge weight and measured SC isn&apos;t linear. Small overcharges (a few ounces above nameplate) buffer through the receiver with SC changing only 1–3°F. Once the receiver is at capacity, additional refrigerant has nowhere to sit as vapor and no reservoir to hide in — every additional ounce shows up as backing up the condenser tube volume, and SC climbs several °F per ounce added. This is why FAQ 2&apos;s number (5 oz over on a 4-lb nameplate → SC drift from 10°F to 15°F+) reads as such a large SC change for such a small weight change: the 5-oz point is past the receiver&apos;s buffer capacity, on the steep part of the curve.
          </p>
          <p>
            The diagnostic implication is directional. If you measure SC = 12°F on an unfamiliar system with unknown charge history, you don&apos;t yet know if you&apos;re 5 oz under a well-charged setup or 3 oz over an under-designed one — the curve is nearly flat there. If you measure SC = 20°F, the system is definitely on the steep part of the curve past the receiver buffer, and even a small recovery (1–2 oz) will move SC noticeably. That&apos;s why the recovery procedure on this page is recover-then-remeasure in 1–2 oz increments rather than &quot;recover N ounces and call it done&quot; — the response curve is where the diagnostic power lives.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Automotive AC context">
          <p>
            Automotive R-134a and R-1234yf systems use similar diagnostics but different charging methods. Cars charge by nameplate weight (per the under-hood label), not by SC target. Overcharge symptoms are the same — high side well above expected, low side slightly elevated. Realistic 95°F-ambient service point: R-134a condensing at ~130°F sat = {R134A_130F} PSIG; R-1234yf equivalent = {R1234YF_130F} PSIG. Modern variable-displacement compressors mask suction-side symptoms because they modulate to hold low-side stable — high-side pressure is the main indicator on those systems.
          </p>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools and reference">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/refrigerant-charge-calculator/" className="underline">Refrigerant Charge Calculator</Link>{" "}
              — weight-based charge calculation for new installs and post-recovery recharge.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — compute measured SC from liquid-line PSIG and temperature.
            </li>
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — verify the low-SH secondary fingerprint on fixed-orifice systems.
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope for comparison against measured discharge.
            </li>
            <li>
              <Link href="/high-head-pressure-causes/" className="underline">High head pressure causes</Link>{" "}
              — broader head-pressure diagnostic including causes other than overcharge.
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
            <li>ACCA Manual T — subcooling target charging methodology.</li>
            <li>EPA 40 CFR Part 82 Subpart F — Section 608 recovery certification.</li>
            <li>SAE J2843 — automotive AC service standards.</li>
            <li>CoolProp 7.2.0 — R-410A, R-134a, R-1234yf PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Facts on this page are paraphrased from the linked sources; direct sentences are not reproduced. PSIG values render through the site&apos;s pressure-format helpers so a dataset regeneration updates the prose automatically.</p>
        </footer>
      </article>
    </>
  );
}
