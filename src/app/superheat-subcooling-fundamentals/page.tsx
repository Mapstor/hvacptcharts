import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";

const PAGE_URL = `${SITE_URL}/superheat-subcooling-fundamentals/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Superheat & Subcooling Fundamentals — HVAC Reference",
  description:
    "What superheat and subcooling are, how to measure them, what target values mean for different system types, and how to use the pair to diagnose charge and system issues.",
  alternates: { canonical: PAGE_URL },
};

const FAQS = [
  {
    q: "Why do I need both superheat and subcooling?",
    a: "Each one alone tells part of the story; together they pin down the system's charge state and isolate root causes. The classic patterns: high superheat + low subcooling = undercharge; low superheat + high subcooling = overcharge; both abnormal in the same direction = airflow or metering device issue.",
  },
  {
    q: "Which is the primary charging metric?",
    a: "Depends on the metering device. Fixed-orifice systems are charged by superheat (per ACCA Manual T charging chart, using indoor wet-bulb and outdoor dry-bulb). TXV systems are charged by subcooling (typically 8–12°F per manufacturer). On a TXV system the superheat hovers near the TXV setpoint regardless of charge, so superheat reads in-range even at overcharge — subcooling is the primary metric.",
  },
  {
    q: "What's the difference between total superheat and evaporator superheat?",
    a: "Total superheat is measured at the suction line near the compressor — what most charging procedures reference. Evaporator superheat is measured at the evaporator outlet, before any temperature pickup along the suction line. Total superheat is usually 2–5°F higher than evaporator superheat due to suction-line heat gain. For TXV systems, the valve controls to evaporator superheat; for fixed-orifice systems, charging charts give a total superheat target.",
  },
  {
    q: "How does temperature glide affect superheat measurement on zeotropic blends?",
    a: "Significantly. On a zeotropic blend like R-407C (~23 PSI glide at 70°F), using the bubble-curve saturation temperature for superheat math gives a value that's roughly equal to the glide too high — a system reading 30°F apparent superheat on R-407C may actually have 10°F superheat by the correct dew-curve math. The /superheat-calculator/ uses the dew curve automatically.",
  },
  {
    q: "What does negative superheat mean?",
    a: "Negative superheat means the suction line is colder than the saturation temperature at the suction pressure — liquid refrigerant is reaching the compressor (a condition called slugging or flooding). Liquid is incompressible and damages compressor valves and bearings. Stop the system and diagnose before continuing. Common causes: overcharge, stuck TXV flooding the evaporator, severely low indoor airflow.",
  },
  {
    q: "What does negative subcooling mean?",
    a: "Negative subcooling means the liquid line is hotter than the saturation temperature at the liquid pressure — vapor bubbles are forming in the liquid line (flash gas). The metering device receives a two-phase mix instead of fully-liquid refrigerant; cooling capacity drops sharply. Causes: significant undercharge, restriction at the filter-drier or expansion device, or non-condensables. The system is impaired; diagnose before adding refrigerant.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Superheat & Subcooling Fundamentals",
      description:
        "Plain-language reference on superheat and subcooling for HVAC technicians: what they are, how to measure, target values, diagnostic interpretation, with worked examples.",
      proficiencyLevel: "Beginner to Intermediate",
      dependencies: "Familiarity with the vapor-compression refrigeration cycle and manifold gauge use.",
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
        { "@type": "ListItem", position: 3, name: "Superheat & Subcooling Fundamentals" },
      ],
    },
  ];
}

export default function FundamentalsPage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Superheat & Subcooling Fundamentals</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Superheat &amp; Subcooling Fundamentals</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            What superheat and subcooling are, how to measure them in the field, what their target values mean for
            different system types, and how to use the pair together to diagnose charge and system issues.
          </p>
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50/30 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/20">
            <strong>TL;DR:</strong> Superheat tells you how thoroughly the evaporator boils the refrigerant. Subcooling
            tells you how thoroughly the condenser condenses it. Together they pin down whether a system is correctly
            charged, overcharged, undercharged, or has an airflow / metering device problem. Targets depend on the
            metering device (TXV vs fixed-orifice) and the application.
          </div>
        </header>

        <nav className="mb-10 rounded-md border border-zinc-200 bg-zinc-50/40 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30" aria-label="Table of contents">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sections</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><a href="#what" className="hover:underline">What superheat and subcooling are</a></li>
            <li><a href="#measure" className="hover:underline">How to measure in the field</a></li>
            <li><a href="#targets" className="hover:underline">Target values by system type</a></li>
            <li><a href="#patterns" className="hover:underline">Diagnostic patterns</a></li>
            <li><a href="#worked-example" className="hover:underline">Worked example — R-410A</a></li>
            <li><a href="#pitfalls" className="hover:underline">Common pitfalls</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ol>
        </nav>

        <section id="what" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>1. What superheat and subcooling are</h2>
          <p>
            <strong>Superheat</strong> is the temperature of refrigerant vapor above its saturation temperature at the
            same pressure. It's measured on the suction line. If the vapor at the suction port reads 60°F and the
            saturation temperature corresponding to the suction pressure is 45°F, superheat is 15°F.
          </p>
          <p>
            <strong>Subcooling</strong> is the temperature of liquid refrigerant below its saturation temperature at
            the same pressure. It's measured on the liquid line. If the liquid at the condenser outlet reads 100°F and
            the saturation temperature corresponding to the discharge pressure is 112°F, subcooling is 12°F.
          </p>
          <p>
            Both are non-negative in a working system. Negative superheat means liquid is reaching the compressor
            (slugging). Negative subcooling means vapor is forming in the liquid line (flash gas at the metering
            device). Both are damaging conditions.
          </p>
        </section>

        <section id="measure" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>2. How to measure in the field</h2>
          <p>For superheat:</p>
          <ol>
            <li>Connect the manifold gauge to the suction service port. Read the suction pressure in PSIG.</li>
            <li>Clamp a contact temperature probe to the suction line within 6 inches of the compressor (or per the
              equipment manufacturer's specified measurement point). Insulate the probe from ambient air.</li>
            <li>Let the system run 10-15 minutes under load to stabilize. Record the probe temperature.</li>
            <li>Convert the suction pressure to saturation temperature for the refrigerant in the system — use the{" "}
              <Link href="/pt-calculator/">PT calculator</Link>, the{" "}
              <Link href="/superheat-calculator/">superheat calculator</Link> (does the math for you), or a printed PT
              chart.</li>
            <li>Subtract saturation temperature from measured temperature. The difference is superheat.</li>
          </ol>
          <p>For subcooling — same procedure on the liquid line:</p>
          <ol>
            <li>Read the discharge (high-side) pressure from the manifold. On a single-stage system this equals the
              liquid-line pressure.</li>
            <li>Clamp a probe to the liquid line at the condenser outlet. Insulate.</li>
            <li>Convert the liquid pressure to saturation temperature.</li>
            <li>Subtract measured temperature from saturation temperature. The difference is subcooling.</li>
          </ol>
          <p>
            For zeotropic blends — R-407C, R-454C, R-455A, R-448A, R-449A — use the <em>dew</em> curve for superheat
            and the <em>bubble</em> curve for subcooling. The site's calculators handle this automatically. Doing it
            the wrong way (using a single saturation curve for both) introduces an error equal to the temperature
            glide.
          </p>
        </section>

        <section id="targets" className="mb-10">
          <h2 className="mb-3 text-2xl font-semibold">3. Target values by system type</h2>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 font-medium">System type</th>
                  <th className="px-3 py-2 font-medium">Superheat target</th>
                  <th className="px-3 py-2 font-medium">Subcooling target</th>
                  <th className="px-3 py-2 font-medium">Charged by</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">Fixed-orifice residential AC</td><td className="px-3 py-2">8–25°F (chart-based)</td><td className="px-3 py-2">8–14°F</td><td className="px-3 py-2 font-sans">Superheat (ACCA Manual T)</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">TXV residential AC</td><td className="px-3 py-2">8–15°F (often 10°F)</td><td className="px-3 py-2">8–12°F</td><td className="px-3 py-2 font-sans">Subcooling</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">EXV residential AC</td><td className="px-3 py-2">8–15°F (controlled)</td><td className="px-3 py-2">8–14°F</td><td className="px-3 py-2 font-sans">Subcooling</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">Heat pump (cooling mode)</td><td className="px-3 py-2">8–15°F</td><td className="px-3 py-2">8–15°F</td><td className="px-3 py-2 font-sans">Subcooling</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">Commercial refrigeration — medium temp</td><td className="px-3 py-2">10–20°F</td><td className="px-3 py-2">5–15°F</td><td className="px-3 py-2 font-sans">System-specific</td></tr>
                <tr className="border-t border-zinc-100 dark:border-zinc-800"><td className="px-3 py-2">Commercial refrigeration — low temp</td><td className="px-3 py-2">10–20°F at evap</td><td className="px-3 py-2">5–15°F</td><td className="px-3 py-2 font-sans">System-specific</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Sources: ACCA Manual T (fixed-orifice charging charts), ASHRAE Refrigeration Handbook 2022 (target ranges
            by application), manufacturer service literature (equipment-specific setpoints). Always defer to the
            equipment manufacturer's published charging procedure for the specific system.
          </p>
        </section>

        <section id="patterns" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>4. Diagnostic patterns</h2>
          <p>Four common patterns, each pointing at a different root cause:</p>
          <ul>
            <li><strong>High superheat + low subcooling = undercharge.</strong> Insufficient refrigerant mass to fully fill
              the condenser (low subcooling) and provide enough liquid for the evaporator (high superheat). Check for
              leaks before adding refrigerant.</li>
            <li><strong>Low superheat + high subcooling = overcharge.</strong> Too much refrigerant filling the condenser
              (high subcooling) and flooding the evaporator (low superheat). Verify condenser airflow and coil
              cleanliness first; if both are good, recover refrigerant in measured amounts.</li>
            <li><strong>High superheat + high subcooling = restriction or low evap airflow.</strong> Liquid is fully
              subcooled at the condenser but isn't reaching the evaporator (restriction at filter-drier or expansion
              device), OR airflow across the evaporator is too low to absorb the heat and complete vaporization.</li>
            <li><strong>Low superheat + low subcooling = airflow or metering device issue.</strong> Often a stuck-open
              TXV flooding the evaporator combined with poor condenser performance, or a sizing mismatch. Less common
              than the other three.</li>
          </ul>
        </section>

        <section id="worked-example" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>5. Worked example — R-410A residential AC on a 95°F day</h2>
          <p>System: TXV residential AC, 95°F outdoor, 75°F return air, R-410A.</p>
          <p>Manifold readings after 15 minutes of stable run:</p>
          <ul>
            <li>Suction pressure: 130 PSIG</li>
            <li>Discharge pressure: 380 PSIG</li>
            <li>Suction-line temperature (clamped, insulated): 60°F</li>
            <li>Liquid-line temperature: 100°F</li>
          </ul>
          <p>R-410A saturation temperature at 130 PSIG: 44.8°F. R-410A saturation temperature at 380 PSIG: 110.7°F.</p>
          <ul>
            <li><strong>Superheat</strong> = 60 − 44.8 = <strong>15.2°F</strong> (within TXV target of 8–15°F)</li>
            <li><strong>Subcooling</strong> = 110.7 − 100 = <strong>10.7°F</strong> (within TXV target of 8–12°F)</li>
          </ul>
          <p>Both values in range. Charge is correct. Skip to the next system.</p>
          <p>
            If the same system instead showed suction 110 PSIG, discharge 340 PSIG, suction line 62°F, liquid line
            98°F: superheat = 62 − 37.2 = 24.8°F (high); subcooling = 102.1 − 98 = 4.1°F (low). Classic undercharge.
            Check for leaks before adding refrigerant.
          </p>
          <p>
            The <Link href="/pt-superheat-subcooling-calculator/">combined PT/superheat/subcooling calculator</Link>{" "}
            does all this math interactively and shows the diagnostic banner.
          </p>
        </section>

        <section id="pitfalls" className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>6. Common pitfalls</h2>
          <ul>
            <li><strong>Probing without insulation.</strong> Ambient air at the probe location pulls the reading toward
              room temperature, inflating apparent superheat and depressing apparent subcooling. Always insulate.</li>
            <li><strong>Measuring before stabilization.</strong> Pressures and temperatures swing during startup and
              load changes. Wait 10–15 minutes under stable load before recording.</li>
            <li><strong>Wrong saturation curve on a zeotropic blend.</strong> Using a single bubble or dew curve for both
              superheat and subcooling on a high-glide blend like R-407C introduces a ~10–15°F error.</li>
            <li><strong>Assuming charge is the answer.</strong> Airflow, metering device condition, condenser cleanliness,
              indoor coil cleanliness, and load can all cause superheat/subcooling to read off-target. Verify those
              before adjusting charge.</li>
            <li><strong>Reading the wrong port.</strong> Suction is the low-side port at the larger insulated line.
              Discharge is the high-side port at the smaller uninsulated line. Reversed connections invert the
              diagnosis.</li>
            <li><strong>Adjusting charge on a TXV system using superheat.</strong> TXV systems hold superheat near the
              valve setpoint regardless of charge. Subcooling is the primary metric on a TXV.</li>
          </ul>
        </section>

        <section id="faq" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">7. FAQ</h2>
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
          <Link href="/superheat-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Superheat Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Suction PSIG + line °F → superheat with diagnostic banner.</p>
          </Link>
          <Link href="/subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Subcooling Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Liquid PSIG + line °F → subcooling.</p>
          </Link>
          <Link href="/pt-superheat-subcooling-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">Combined SH / SC / PT</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Both readings + pattern-matching diagnostic.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ACCA Manual T — charging procedures and target superheat ranges for fixed-orifice systems</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — application-specific target ranges</li>
            <li>ASHRAE Handbook of Fundamentals 2021 — vapor-compression cycle reference</li>
            <li>Equipment manufacturer service literature — system-specific charging setpoints</li>
          </ul>
        </footer>
      </article>
    </>
  );
}
