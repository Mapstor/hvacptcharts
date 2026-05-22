import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";

const PAGE_URL = `${SITE_URL}/high-head-pressure-causes/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "High Head Pressure Causes — HVAC Diagnostic Decision Tree",
  description:
    "Diagnostic decision tree for high-side (head) pressure problems on HVAC systems: 8 root causes, how to diagnose each, what to fix in what order. Covers residential AC, heat pumps, and commercial refrigeration.",
  alternates: { canonical: PAGE_URL },
};

const STEPS = [
  {
    title: "Establish a baseline — measure ambient and read pressures at steady state",
    text: "Record outdoor dry-bulb temperature at the condenser (not in direct sun). Let the system run for 10-15 minutes under load. Connect manifold gauges to both service ports. Note the discharge pressure and the saturation temperature it corresponds to for the refrigerant in the system. The expected discharge saturation temperature is typically ambient + 20-30°F for residential AC; substantially higher means there's a high-side problem worth diagnosing.",
  },
  {
    title: "Check condenser airflow — the most common cause",
    text: "Visually inspect the outdoor unit. Look for: leaves/debris blocking the bottom or fins; dirt buildup on the coil surface (a thin film of dirt can reduce airflow 20%+); recirculation from nearby walls or vegetation; condenser fan spinning at full speed and pushing air in the correct direction. A garden hose at low pressure can rinse a dirty coil; chemical coil cleaner is needed for greasy or mineral buildup. If discharge pressure drops noticeably after cleaning, this was the cause.",
  },
  {
    title: "Check for overcharge — verify with subcooling",
    text: "Measure subcooling at the liquid line. If subcooling is above ~15°F (TXV system, residential AC), the system is likely overcharged. Excess refrigerant fills the condenser, leaving less surface area for actual condensation, which raises discharge pressure. Recover refrigerant in measured amounts and re-check subcooling. Do NOT add refrigerant to a system with high discharge until you've ruled out overcharge.",
  },
  {
    title: "Check for non-condensables (air or moisture in the system)",
    text: "Non-condensables (air, nitrogen from leak-checking, moisture vapor) accumulate in the high side and raise discharge pressure above the refrigerant's saturation curve. The diagnostic indicator: discharge pressure significantly above what the refrigerant + ambient predicts, with no other obvious cause. The fix: recover all refrigerant, evacuate to 500 microns, hold vacuum 30+ minutes to verify dryness, recharge with virgin or reclaimed refrigerant. Half-measures don't work — partial recovery and top-up leaves the non-condensables in the system.",
  },
  {
    title: "Check for restriction in the liquid line",
    text: "A clogged filter-drier or other liquid-line restriction causes refrigerant to back up in the condenser, raising discharge pressure. Diagnostic: temperature drop across the filter-drier (touch it on either side — a clean drier should feel the same temperature on both sides; a clogged one feels colder downstream from the restriction). Replace the filter-drier with a new POE-compatible model if the system uses HFC; standard for HCFC.",
  },
  {
    title: "Check ambient — high ambient is a real cause, not necessarily a problem",
    text: "At 105°F outdoor ambient, even a perfectly-working R-410A residential AC system will show discharge pressures around 400-470 PSIG — much higher than at the 95°F rating condition. If the system is otherwise normal (suction in range, subcooling in range, no other symptoms), high discharge at extreme ambient may simply reflect the conditions. Compare to the operating-pressure range table for the specific refrigerant at the specific ambient.",
  },
  {
    title: "Check for compressor wear",
    text: "An aging compressor with worn valves or rings doesn't compress as efficiently — discharge pressure climbs to make up for the lower volumetric efficiency, while suction pressure stays higher than expected. Diagnostic: amp draw substantially above nameplate, with both pressures elevated. Combined with low cooling output, this suggests compressor replacement. A reciprocating compressor with valve damage may also show rapid pressure rise on shutdown that doesn't decay normally.",
  },
  {
    title: "Check condenser sizing for the load",
    text: "Rarely the cause on factory-engineered residential AC equipment, but possible on field-assembled commercial refrigeration or modified installations. If the condenser is undersized for the system capacity or operating ambient, discharge pressure will be permanently high regardless of cleaning or charge. Check the equipment data plate and verify the installed condenser matches the specification. Field-modified systems (mismatched coil/compressor combinations) are the typical culprits.",
  },
];

const FAQS = [
  {
    q: "What is normal high-side pressure for R-410A at 95°F ambient?",
    a: "Roughly 340-410 PSIG on a properly-charged residential R-410A AC system at the 95°F rating condition. Discharge pressure varies with ambient (climbs at higher ambient), indoor load, and condenser cleanliness. See the operating-pressure table at /what-pressure-should-410a-be/ for the full range. Pressure substantially above this range with no obvious explanation warrants the diagnostic procedure on this page.",
  },
  {
    q: "Does dirty evaporator coil cause high head pressure?",
    a: "Usually no — a dirty evaporator typically causes LOW head pressure (less heat absorbed = less heat to reject = lower discharge). However, severe evaporator restriction (frozen coil from low airflow) can starve the compressor of suction-side refrigerant and create unusual operating points where discharge climbs. The primary diagnostic for evaporator problems is suction pressure (low) and superheat (high), not discharge pressure.",
  },
  {
    q: "What's the difference between high-side and high head?",
    a: "Same thing in HVAC service parlance. Both refer to the discharge side of the refrigeration cycle — between the compressor outlet and the metering device, including the condenser and liquid line. 'High head' is older terminology that emphasized the static pressure 'head' the compressor was working against; 'high-side' is the modern equivalent.",
  },
  {
    q: "Can low refrigerant charge cause high head pressure?",
    a: "Not typically. Low charge usually causes LOW high-side pressure (insufficient refrigerant to fill the condenser, so less liquid sits in the condenser, so discharge pressure drops). High discharge alongside low charge is unusual and suggests something else is going on — most likely a restriction at the metering device or filter-drier that's causing whatever refrigerant remains to back up in the condenser. Diagnose with subcooling: low subcooling + high discharge points to restriction; high subcooling + high discharge points to overcharge.",
  },
  {
    q: "Why is my heat pump's discharge pressure high in heating mode?",
    a: "In heating mode the indoor coil is the condenser. High discharge in heating mode usually means low indoor airflow (dirty filter, restricted ductwork, fan problem) or an oversized system for the indoor load. The same diagnostic logic applies — check airflow first, then verify subcooling for overcharge, then check for restrictions.",
  },
  {
    q: "What pressure damage thresholds matter on residential AC?",
    a: "R-410A residential AC equipment is typically pressure-rated to 600-650 PSIG high-side per manufacturer specification. Discharge pressures sustained above this can cause compressor valve damage, oil breakdown, and refrigerant decomposition. Modern equipment includes a high-pressure switch that trips before damage occurs (typically at 500-650 PSIG depending on the OEM). If a high-pressure switch is tripping, the system is telling you to find the cause before continued operation.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "High Head Pressure Causes — HVAC Diagnostic Decision Tree",
      description:
        "Diagnostic decision tree for high-side (head) pressure problems on HVAC systems. Eight root causes with diagnostic procedures and fix-order priorities.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to diagnose high head pressure on an HVAC system",
      description:
        "Eight-step diagnostic procedure to identify and address root causes of high-side pressure on residential and commercial HVAC systems.",
      totalTime: "PT30M",
      tool: [
        { "@type": "HowToTool", name: "Refrigerant manifold gauge set rated for the refrigerant" },
        { "@type": "HowToTool", name: "Contact temperature probe" },
        { "@type": "HowToTool", name: "EPA Section 608 certification" },
        { "@type": "HowToTool", name: "Outdoor ambient thermometer" },
      ],
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
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
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "High Head Pressure Causes" },
      ],
    },
  ];
}

export default function HighHeadPressurePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">High Head Pressure Causes</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">High Head Pressure Causes</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Diagnostic decision tree for high-side pressure problems on HVAC and commercial refrigeration systems.
            Eight root causes, how to diagnose each, what to fix in what order.
          </p>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50/40 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/20">
            <strong>TL;DR:</strong> Check condenser airflow first — it&apos;s the most common cause and easiest to fix.
            Then verify charge with subcooling (overcharge = high subcooling + high discharge). Then check for
            non-condensables and restrictions. High ambient is a real cause, not a problem. Compressor wear is the
            last suspect after the easier causes are ruled out.
          </div>
        </header>

        <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>What &quot;high head pressure&quot; means</h2>
          <p>
            Head pressure (high-side pressure, discharge pressure) is the pressure in the high-pressure portion of the
            refrigeration cycle — from the compressor discharge through the condenser and liquid line to the metering
            device. On a working HVAC system the head pressure is determined by the refrigerant saturation at the
            condenser temperature, plus a small additional pressure drop through the line set.
          </p>
          <p>
            For residential R-410A AC at 95°F outdoor ambient, normal head pressure is roughly 340-410 PSIG. For
            residential R-22 AC at the same ambient, normal is 240-280 PSIG. Substantially higher than these ranges
            indicates a high-side problem worth diagnosing.
          </p>
          <p>
            <strong>Why high head matters:</strong> sustained high-side pressure damages compressor valves, breaks
            down lubricating oil, and can cause refrigerant decomposition. Modern equipment includes a high-pressure
            cutout switch (typically 500-650 PSIG) that protects the system; if the cutout is tripping, that&apos;s the
            system telling you to find the root cause.
          </p>
        </section>

        <section id="diagnostic" className="mb-10">
          <h2 className="mb-3 text-2xl font-semibold">Diagnostic procedure — fix in this order</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Causes are listed roughly in order of frequency and ease-of-fix. Start at the top and work down — most
            high-head problems resolve in the first two or three steps.
          </p>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="font-semibold">
                  <span className="mr-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{i + 1}</span>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>Common patterns by symptom combination</h2>
          <p>The fastest way to narrow the cause is to combine head pressure with subcooling and suction reading:</p>
          <ul>
            <li><strong>High discharge + high subcooling + normal suction</strong>: overcharge or condenser airflow problem. Check airflow first; if airflow is good, recover refrigerant.</li>
            <li><strong>High discharge + low subcooling + low suction</strong>: liquid-line restriction (often a clogged filter-drier). Refrigerant is backing up in the condenser. Check the filter-drier and replace if cold downstream.</li>
            <li><strong>High discharge + normal subcooling + normal suction</strong>: non-condensables in the system. Recover, evacuate to 500 microns held 30+ minutes, recharge with verified-pure refrigerant.</li>
            <li><strong>High discharge + high suction + high amp draw</strong>: compressor wear or inefficiency. Less common; rule out the other causes first.</li>
            <li><strong>High discharge + everything else normal + high ambient</strong>: just high ambient. Compare to the operating-range table for the specific refrigerant at the specific ambient.</li>
          </ul>

          <h2>When to stop and call a professional</h2>
          <p>
            If the system has tripped its high-pressure cutout switch repeatedly and the cause isn&apos;t obvious after
            the first three diagnostic steps, or if the discharge pressure is climbing above 500 PSIG and not
            stabilizing, stop and call an HVAC professional. Continuing to run a system with sustained high
            discharge causes compressor damage; replacement compressors cost orders of magnitude more than a diagnostic
            service call.
          </p>
          <p>
            On commercial refrigeration with R-744 (CO₂) transcritical systems, high-side pressures of 1300-1700
            PSIG are normal — not a high-head problem. Apply transcritical-specific diagnostic procedures rather than
            the HFC patterns above; consult the equipment OEM service literature.
          </p>
        </section>

        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">FAQ</h2>
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
          <Link href="/superheat-subcooling-fundamentals/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">SH/SC Fundamentals</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">The interpretation framework behind the diagnostic patterns.</p>
          </Link>
          <Link href="/pt-superheat-subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Combined SH / SC / PT Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Pattern-matching diagnostic banner for the SH + SC combinations.</p>
          </Link>
          <Link href="/what-pressure-should-410a-be/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">R-410A operating pressures</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Reference ranges by ambient temperature.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ACCA Manual T — charging procedures and diagnostic patterns</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — refrigeration cycle reference</li>
            <li>ASHRAE Handbook of Fundamentals 2021 — thermodynamic property reference</li>
            <li>Equipment manufacturer service literature for residential AC, heat pumps, and commercial refrigeration</li>
            <li>EPA Section 608 program documentation — recovery and evacuation procedures</li>
          </ul>
        </footer>
      </article>
    </>
  );
}
