import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";

const PAGE_URL = `${SITE_URL}/pt-chart-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "How to Read a PT Chart — HVAC Reference",
  description:
    "A field-tech guide to refrigerant pressure-temperature charts: what they show, how to read bubble vs dew columns, what temperature glide means, why some charts truncate above the critical point.",
  alternates: { canonical: PAGE_URL },
};

const FAQS = [
  {
    q: "What is a PT chart actually showing me?",
    a: "Pressure on one axis, temperature on the other. The line drawn between them is the saturation curve — the boundary between liquid and vapor phases at thermodynamic equilibrium. Picking a temperature and reading off the corresponding pressure tells you 'this refrigerant exists as both liquid and vapor at this temperature only when held at this pressure'.",
  },
  {
    q: "Why do some PT charts have two pressure columns?",
    a: "Zeotropic refrigerant blends boil and condense across a temperature range at constant pressure. The two columns are bubble (saturated-liquid) and dew (saturated-vapor) — the start and end of the phase transition. Pure refrigerants and azeotropes have a single saturation pressure per temperature, so one column suffices.",
  },
  {
    q: "Why does the R-744 (CO2) chart stop at 87°F?",
    a: "Carbon dioxide's critical point is 87.8°F. Above the critical temperature, no saturation state exists — the refrigerant becomes supercritical and the liquid/vapor distinction disappears. CO2 commercial refrigeration systems often operate transcritically (above this point on the high side); below it, the standard PT chart applies. Other refrigerants with low critical temperatures (R-13 at 84°F, R-1150 ethylene at 49°F) similarly truncate.",
  },
  {
    q: "What does temperature glide mean in practical terms?",
    a: "For a zeotropic blend, at constant pressure the refrigerant doesn't boil or condense at a single temperature — it does so across a range. R-407C at typical evaporator pressure has ~7°F glide; R-454C has ~5°F; R-455A has ~5°F. This affects EXV sizing, charge measurement, and superheat measurement. The blends have their place but require treating saturation conditions as ranges rather than points.",
  },
  {
    q: "Should I use bubble or dew for superheat math?",
    a: "Dew. Superheat is measured on the suction line where the refrigerant has fully passed through evaporation — the relevant saturation boundary is the dew temperature (the point where the last drop of liquid disappears). The site's superheat calculator uses the dew curve automatically.",
  },
  {
    q: "Should I use bubble or dew for subcooling math?",
    a: "Bubble. Subcooling is measured on the liquid line where the refrigerant is fully condensed — the relevant saturation boundary is the bubble temperature (the point where the first vapor bubble appears when boiling, or where the last vapor disappears when condensing). The subcooling calculator uses the bubble curve automatically.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "How to Read a PT Chart",
      description:
        "Field-tech reference on refrigerant pressure-temperature charts: what they show, how to read bubble vs dew columns, what temperature glide means, why some charts truncate above critical.",
      proficiencyLevel: "Beginner",
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
        { "@type": "ListItem", position: 3, name: "PT Chart Guide" },
      ],
    },
  ];
}

export default function PtChartGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">PT Chart Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How to Read a PT Chart</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            What a pressure-temperature chart shows, how to read bubble vs dew columns, what temperature glide means in
            practice, and why some charts truncate above a critical temperature.
          </p>
        </header>

        <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
          <h2>What a PT chart is</h2>
          <p>
            A pressure-temperature chart shows the saturation pressure of a refrigerant at each temperature in its
            operating range. The line drawn is the boundary between liquid and vapor phases at thermodynamic
            equilibrium. Above the line, the refrigerant is vapor (or supercritical above the critical point); below
            the line, it's subcooled liquid; on the line, it's two-phase.
          </p>
          <p>
            In service, the chart is the bridge between a gauge reading and a temperature interpretation. The manifold
            gauge reads pressure; the chart converts that to saturation temperature. The difference between actual
            line temperature and saturation temperature is superheat (suction side) or subcooling (liquid side).
          </p>

          <h2>How to read one</h2>
          <p>
            Pick a temperature on the left column. Read across to the saturation pressure on the right. Or pick a
            pressure and find the corresponding temperature.
          </p>
          <p>
            For a pure refrigerant like R-22 at 70°F: saturation pressure = 121 PSIG. That means at 121 PSIG, R-22
            exists as a liquid-vapor mixture at 70°F. Hold the pressure and add heat: still at 70°F until all the
            liquid boils. Hold the pressure and remove heat: still at 70°F until all the vapor condenses.
          </p>

          <h2>Bubble vs dew columns</h2>
          <p>
            Zeotropic blends — refrigerants whose components have different normal boiling points — show two columns:
          </p>
          <ul>
            <li><strong>Bubble</strong>: saturated liquid pressure. The pressure at which the first vapor bubble appears
              as the liquid is heated.</li>
            <li><strong>Dew</strong>: saturated vapor pressure. The pressure at which the first liquid drop forms as
              vapor is cooled.</li>
          </ul>
          <p>
            For pure refrigerants and azeotropes (R-22, R-134a, R-32, R-410A near-azeotrope, R-507A azeotrope), bubble
            and dew coincide and only one column is shown. For zeotropes like R-407C (~7°F glide), R-454C (~5°F), and
            R-455A (~5°F), the two columns differ by the temperature glide.
          </p>

          <h2>Temperature glide</h2>
          <p>
            Glide is the temperature spread between bubble and dew at the same pressure. For a zeotropic blend at
            constant pressure, the refrigerant doesn't boil at a single temperature — it boils across a range. The
            first vapor appears at bubble temperature; the last liquid disappears at dew temperature.
          </p>
          <p>This has real consequences:</p>
          <ul>
            <li><strong>Superheat measurement</strong> on the suction side uses the dew temperature as the saturation
              reference. Vapor above this temperature is superheated. Using the bubble temperature understates
              superheat by the glide.</li>
            <li><strong>Subcooling measurement</strong> on the liquid side uses the bubble temperature. Liquid below
              this temperature is subcooled. Using the dew temperature overstates subcooling by the glide.</li>
            <li><strong>Charge measurement</strong> for refrigeration systems on zeotropic blends requires careful
              attention to whether the system's specified saturation temperature is bubble, dew, or mean.</li>
          </ul>

          <h2>Critical point — why some charts truncate</h2>
          <p>
            Every pure refrigerant has a critical temperature above which the liquid/vapor distinction disappears. No
            saturation state exists; the substance is supercritical. Practical consequences:
          </p>
          <ul>
            <li>R-744 (CO2): critical at 87.8°F. PT chart stops at 87°F. Commercial CO2 refrigeration systems are
              designed for transcritical operation (above critical on the high side).</li>
            <li>R-13 (legacy CFC): critical at 83.9°F. PT chart stops at 83°F. Used historically as a cascade
              low-stage refrigerant where the high side stays below ambient.</li>
            <li>R-1150 (ethylene): critical at 48.6°F. PT chart truncates at 48°F. Used in industrial cascade systems
              where the application temperature is below this.</li>
          </ul>
          <p>
            For zeotropic blends the critical point is replaced by a critical locus — a curve along which the
            critical temperature varies with composition. The dataset's individual refrigerant pages note where this
            applies.
          </p>

          <h2>Partial vs full charts</h2>
          <p>
            A standard PT chart in this site covers -40°F to 150°F at 1°F increments — 191 data points. Refrigerants
            with low critical temperatures truncate; refrigerants modeled by CoolProp but limited to a narrower
            validity range (e.g., R-236EA stops at higher temps) also truncate. The chart shows what's physically real
            and skips what isn't, rather than extrapolating fabricated values.
          </p>
          <p>
            For the 11 manufacturer-blend refrigerants that CoolProp doesn't model (R-448A, R-450A, R-1336mzz(Z),
            etc.), PT charts come directly from the named manufacturer datasheet. Where transcription is pending the
            chart is empty and the page says so — never invented.
          </p>

          <h2>Common pitfalls</h2>
          <ul>
            <li><strong>Confusing PSIG (gauge) with PSIA (absolute).</strong> Manifold gauges read PSIG. Charts on this
              site are PSIG unless explicitly stated otherwise. PSIA = PSIG + 14.696.</li>
            <li><strong>Using a single saturation curve on a zeotrope.</strong> R-407C, R-454C, R-455A, R-448A, R-449A
              all have meaningful glide. Single-curve math introduces error equal to the glide.</li>
            <li><strong>Reading a chart that wasn't generated correctly.</strong> The previous version of this site
              shipped with PT values wrong by 2-15×, including several physically impossible values above critical
              pressure. The chart's source matters. This site's values come from CoolProp 7.2.0 (REFPROP-compatible
              Helmholtz EOS) or from named manufacturer datasheets; the source is cited on every refrigerant page.</li>
            <li><strong>Treating saturation pressure as operating pressure.</strong> A PT chart gives the saturation
              pressure at thermodynamic equilibrium. The operating pressure on a running system depends on charge,
              ambient, indoor load, superheat, and subcooling. See <Link href="/what-pressure-should-r22-be/">what should R-22 pressures be</Link>{" "}
              for the operating-pressure perspective.</li>
          </ul>
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
          <Link href="/pt-calculator/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">PT Calculator</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Look up saturation pressure or temperature for any refrigerant.</p>
          </Link>
          <Link href="/superheat-subcooling-fundamentals/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">SH/SC Fundamentals</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">How to apply PT chart values in the field.</p>
          </Link>
          <Link href="/refrigerant-pt-comparison-tool/" className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <h3 className="text-sm font-semibold">PT Comparison Tool</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Overlay 2-4 refrigerants on one chart.</p>
          </Link>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ASHRAE Handbook of Fundamentals 2021 — thermodynamic property reference</li>
            <li>CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014) — saturation property calculations</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — application context and PT tables for cross-check</li>
            <li>Manufacturer datasheets (Honeywell, Chemours, Arkema, AGC) — for the manufacturer-blend refrigerants</li>
          </ul>
        </footer>
      </article>
    </>
  );
}
