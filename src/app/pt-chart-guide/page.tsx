import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CircleAlert,
  Compass,
  Droplets,
  Eye,
  GitMerge,
  Lightbulb,
  ScrollText,
  Sparkles,
  Thermometer,
  TrendingUp,
  Waves,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { getPressureAtTempF, getRefrigerant, refrigerants } from "@/data/refrigerants";
import { RefrigerantPTCurve } from "@/components/refrigerant/RefrigerantPTCurve";

const PAGE_URL = `${SITE_URL}/pt-chart-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "How to Read a PT Chart — HVAC Reference",
  description:
    "Field-tech guide to refrigerant pressure-temperature charts: what they show, how to read bubble vs dew columns, what temperature glide means, why some charts truncate above the critical point.",
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
    a: "For a zeotropic blend, at constant pressure the refrigerant doesn't boil or condense at a single temperature — it does so across a range. R-407C at typical evaporator pressure has ~11°F glide; R-454C has ~14°F; R-455A has ~22°F. This affects EXV sizing, charge measurement, and superheat measurement. The blends have their place but require treating saturation conditions as ranges rather than points.",
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

const SECTIONS = [
  { id: "what", label: "What a PT chart is" },
  { id: "read", label: "How to read one" },
  { id: "bubble-dew", label: "Bubble vs dew" },
  { id: "glide", label: "Temperature glide" },
  { id: "critical", label: "Critical-point truncation" },
  { id: "scope", label: "Chart scope & sources" },
  { id: "pitfalls", label: "Common pitfalls" },
  { id: "faq", label: "FAQ" },
];

const GLIDE_COMPARISON_SLUGS = ["r-22", "r-134a", "r-410a", "r-407c", "r-454c", "r-455a"];

const CRITICAL_TRUNCATION = [
  {
    slug: "r-744",
    label: "R-744 (CO₂)",
    critF: 87.8,
    chartStops: "87°F",
    note: "Commercial CO₂ refrigeration runs transcritically above this point — the 'condenser' becomes a 'gas cooler'.",
  },
  {
    slug: "r-13",
    label: "R-13 (legacy CFC)",
    critF: 83.7,
    chartStops: "83°F",
    note: "Used historically as the low-stage refrigerant in cascade systems where the high side stays below ambient.",
  },
  {
    slug: "r-1150",
    label: "R-1150 (ethylene)",
    critF: 48.6,
    chartStops: "48°F",
    note: "Industrial cascade refrigerant for sub-zero process applications.",
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
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">PT Chart Guide</span>
        </nav>

        {/* Hero */}
        <header className="mb-10 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 dark:border-blue-900/40 dark:from-blue-950/30 dark:via-zinc-950 dark:to-purple-950/20 sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-900 backdrop-blur dark:border-blue-900/40 dark:bg-zinc-950/80 dark:text-blue-200">
            <BookOpen className="h-3 w-3" /> Long-form guide · 8 sections
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">How to Read a PT Chart</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            What a pressure-temperature chart shows, how to read bubble vs dew columns, what temperature glide means in
            practice, and why some charts truncate above a critical temperature.
          </p>

          <div className="mt-6 rounded-lg border border-blue-200 bg-white/70 p-4 backdrop-blur dark:border-blue-900/40 dark:bg-zinc-950/70">
            <p className="flex items-start gap-2 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>TL;DR:</strong> A PT chart maps refrigerant temperature to its saturation pressure (or back).
                Pure refrigerants get one curve. Zeotropic blends get <em>two</em> — bubble for the liquid side,
                dew for the vapor side. Use dew for superheat math, bubble for subcooling. Some refrigerants
                truncate above their critical temperature because no saturation state exists.
              </span>
            </p>
          </div>
        </header>

        {/* Table of contents */}
        <nav
          aria-label="On this page"
          className="mb-12 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Compass className="h-3.5 w-3.5" /> On this page
          </h2>
          <ol className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${s.id}`} className="text-blue-700 hover:underline dark:text-blue-300">
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 1. What a PT chart is */}
        <Section id="what" icon={<Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />} title="What a PT chart is" number="01">
          <Prose>
            <p>
              A pressure-temperature chart maps the <strong>saturation pressure</strong> of a refrigerant at each
              temperature in its operating range. The line drawn is the phase boundary between liquid and vapor at
              thermodynamic equilibrium.
            </p>
            <p>
              In service, the chart is the bridge between a <strong>gauge reading</strong> and a{" "}
              <strong>temperature interpretation</strong>. The manifold reads pressure; the chart converts that to
              saturation temperature. The difference between actual line temperature and saturation temperature is
              superheat (suction) or subcooling (liquid).
            </p>
            <p>
              The relationship is fundamental to every vapor-compression refrigeration cycle. Any point where liquid
              and vapor coexist — broadly, inside the evaporator and condenser — sits on the saturation curve.
              Knowing one (pressure or temperature) tells you the other. Outside the two-phase region the refrigerant
              is either pure liquid (above the curve at high pressure or low temperature) or pure vapor (below the
              curve at low pressure or high temperature).
            </p>
            <p>
              Modern PT data is computed from Helmholtz-energy equations of state — the same thermodynamic framework
              NIST&apos;s REFPROP uses. The values on this site come from <strong>CoolProp 7.2.0</strong> (Bell,
              Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), which implements REFPROP-compatible EOS for 122
              pure refrigerants and predefined mixtures. Manufacturer-blend PT charts (R-448A, R-450A, R-1336mzz(Z),
              etc.) come from the named manufacturer datasheets and are cross-checked against ASHRAE 34-2022
              composition specifications.
            </p>
          </Prose>

          <PhaseRegionGrid />
        </Section>

        {/* 2. How to read one */}
        <Section
          id="read"
          icon={<ScrollText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          title="How to read one"
          number="02"
        >
          <Prose>
            <p>
              Pick a temperature; read across to the corresponding saturation pressure. Or pick a pressure; find the
              corresponding temperature. The chart works in either direction.
            </p>
            <p>
              On a paper chart, find your value on one axis and trace the curve. On a digital chart (like this site&apos;s
              calculators), enter the value and the lookup is instant. For the 1°F or 1°C increments most charts use,
              interpolation between adjacent entries is linear and accurate to better than ±0.1°F for the bubble or
              dew curves; the underlying Helmholtz EOS is smooth enough that linear interpolation introduces
              negligible error.
            </p>
            <p>
              In the field, the practical use is converting <strong>manifold pressure</strong> (what you read on the
              gauge) to <strong>saturation temperature</strong> (what you compare against the line-temperature probe to
              compute superheat or subcooling). The chart isn&apos;t the answer — it&apos;s the unit conversion
              between two service measurements.
            </p>
          </Prose>

          <WorkedExample
            heading="R-22 at 70°F"
            steps={[
              { label: "Input", value: "70°F" },
              { label: "Look up", value: "R-22 PT chart" },
              { label: "Output", value: <><span className="font-bold">121.4</span> <span className="text-xs">PSIG</span></> },
            ]}
            note="At 121 PSIG, R-22 exists as a liquid-vapor mixture at 70°F. Hold pressure and add heat — temperature stays at 70°F until all the liquid boils. Hold pressure and remove heat — stays at 70°F until all the vapor condenses."
          />

          <WorkedExample
            heading="R-410A at 130 PSIG"
            steps={[
              { label: "Input", value: "130 PSIG" },
              { label: "Look up", value: "R-410A PT chart (reverse)" },
              { label: "Output", value: <><span className="font-bold">45</span> <span className="text-xs">°F saturation</span></> },
            ]}
            note="Service technician reads 130 PSIG suction on an R-410A residential AC. Saturation temperature at 130 PSIG is 45°F. If the suction line measures 60°F, superheat = 60 − 45 = 15°F (in the standard TXV target range)."
          />

          <Prose className="mt-6">
            <p>
              The bidirectional nature is what makes the PT chart the foundational reference in HVAC service. Any
              charging procedure, any diagnostic measurement, any retrofit comparison can be traced back to lookups
              on this curve.
            </p>
          </Prose>
        </Section>

        {/* 3. Bubble vs dew columns */}
        <Section
          id="bubble-dew"
          icon={<GitMerge className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Bubble vs dew columns"
          number="03"
        >
          <Prose>
            <p>
              Pure refrigerants and azeotropes give a single saturation pressure per temperature, so one column
              suffices. Zeotropic blends — refrigerants whose components have different normal boiling points — give
              two columns:
            </p>
          </Prose>

          <BubbleDewSplit />

          <h3 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Live values at 70°F — pure vs blend
          </h3>
          <GlideTable />
          <p className="mt-3 text-xs text-zinc-500">
            Values pulled live from the verified dataset (CoolProp 7.2.0). Glide column shows the bubble-minus-dew
            spread at 0°C from <code>r.physical.temperatureGlideF</code>.
          </p>
        </Section>

        {/* 4. Temperature glide */}
        <Section
          id="glide"
          icon={<Waves className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
          title="Temperature glide"
          number="04"
        >
          <Prose>
            <p>
              Glide is the spread between bubble and dew temperatures at the same pressure. For a zeotropic blend at
              constant pressure, the refrigerant doesn&apos;t boil or condense at a single temperature — it does so
              across a range. The first vapor appears at the bubble temperature; the last liquid disappears at the dew
              temperature.
            </p>
          </Prose>

          <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Practical implications
          </h3>
          <ul className="grid gap-3 sm:grid-cols-3">
            <Callout
              tone="blue"
              icon={<Droplets className="h-4 w-4" />}
              title="Superheat → use dew"
              body="Suction-line measurement. Vapor above dew temperature is superheated. Using bubble understates superheat by the glide."
            />
            <Callout
              tone="purple"
              icon={<Droplets className="h-4 w-4" />}
              title="Subcooling → use bubble"
              body="Liquid-line measurement. Liquid below bubble temperature is subcooled. Using dew overstates subcooling by the glide."
            />
            <Callout
              tone="amber"
              icon={<AlertTriangle className="h-4 w-4" />}
              title="Charge → check spec"
              body="System nameplate may specify bubble, dew, or mean saturation. Get this wrong and the charge target is off by the full glide."
            />
          </ul>
        </Section>

        {/* 5. Critical-point truncation */}
        <Section
          id="critical"
          icon={<TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />}
          title="Critical-point truncation"
          number="05"
        >
          <Prose>
            <p>
              Every pure refrigerant has a <strong>critical temperature</strong> above which the liquid/vapor
              distinction disappears. No saturation state exists; the substance is supercritical. PT charts end
              there — there&apos;s nothing physical to plot above.
            </p>
          </Prose>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {CRITICAL_TRUNCATION.map((c) => (
              <li
                key={c.slug}
                className="rounded-lg border border-red-200 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/20"
              >
                <Link href={`/refrigerant/${c.slug}/`} className="text-base font-semibold hover:underline">
                  {c.label}
                </Link>
                <div className="mt-2 font-mono text-sm">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-zinc-500">T<sub>crit</sub></span>
                    <span className="text-lg font-bold text-red-700 dark:text-red-300">{c.critF}°F</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Chart truncates at</span>
                    <span className="font-mono font-semibold">{c.chartStops}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{c.note}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Lightbulb className="h-3.5 w-3.5" /> See it in action — R-744 (CO₂)
            </p>
            <RefrigerantPTCurve slug="r-744" />
            <p className="mt-3 text-xs text-zinc-500">
              R-744&apos;s saturation curve ends at 87°F. Above critical, CO₂ systems operate transcritically — the
              high side has no condensing pressure to read off a PT chart.
            </p>
          </div>

          <Prose className="mt-5">
            <p>
              For zeotropic blends the critical point is replaced by a <strong>critical locus</strong> — a curve along
              which the critical temperature varies with composition. The dataset&apos;s individual refrigerant pages
              note where this applies.
            </p>
            <p>
              Transcritical operation matters most for R-744 (CO₂) commercial refrigeration in warm climates, where
              the gas cooler routinely runs above 87.8°F. In transcritical mode the high side has no condensing
              pressure; gas-cooler outlet pressure is controlled by a high-pressure throttle valve and gas-cooler
              outlet temperature is the meaningful service metric (target 8-10°F above ambient at design optimum).
              Other refrigerants with low critical temperatures rarely operate transcritically in HVAC because their
              equipment is sized to keep operating points below critical even at peak ambient.
            </p>
          </Prose>
        </Section>

        {/* 6. Chart scope & sources */}
        <Section
          id="scope"
          icon={<Thermometer className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          title="Chart scope &amp; sources"
          number="06"
        >
          <Prose>
            <p>
              A standard PT chart on this site covers <strong>−40°F to 150°F at 1°F increments</strong> — 191 data
              points. Refrigerants with low critical temperatures truncate; refrigerants outside CoolProp&apos;s
              validity range also truncate. The chart shows what&apos;s physically real and skips what isn&apos;t,
              rather than extrapolating fabricated values.
            </p>
            <p>
              The chart range is chosen to cover the operating envelope of common HVAC applications: residential AC
              (typical evap 40°F, cond 95-110°F), commercial refrigeration MT (15-30°F evap), commercial LT (-40°F to
              -10°F evap), heat pumps in heating mode (outdoor coil 10-25°F evap). Specialized applications
              (cryogenics below -150°F, high-temperature process refrigeration above 200°F) need refrigerants outside
              this range and are addressed on per-refrigerant pages.
            </p>
            <p>
              <strong>Source provenance.</strong> Every value on this site traces to a published source: CoolProp
              7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999) for pure refrigerants and predefined
              mixtures; ASHRAE 34-2022 for composition specifications and safety classifications; AHRI Standard 700
              for refrigerant specifications; manufacturer technical datasheets (Honeywell Solstice / Genetron,
              Chemours Opteon, Arkema Forane, AGC AMOLEA) for the 11 blends not in CoolProp&apos;s library. CoolProp
              data is REFPROP-compatible (validated against NIST&apos;s reference database) with typical accuracy
              better than ±0.5% across the operating range.
            </p>
            <p>
              Verification policy: every value is recorded in <code>data/refrigerants.json</code> (the generated data
              layer), validated against a Zod schema at build time, and cross-checked against AHRI 700 specifications
              where applicable. The previous WordPress version of this site shipped with approximately 25,000
              fabricated quantitative errors including PT values wrong by 2-15×, some above critical pressure (a
              physical impossibility), and several A2L / A3 / B2L refrigerants classified as &quot;A1
              non-flammable&quot;. The current rebuild was structured specifically to make those failure modes
              impossible: refrigerant data comes from primary sources, safety class is a Zod enum, and any value
              outside the chart range returns &quot;out of range&quot; rather than an extrapolated number.
            </p>
          </Prose>

          <Callout
            tone="emerald"
            icon={<Lightbulb className="h-4 w-4" />}
            title="Manufacturer-blend handling"
            body="For the 11 blends CoolProp doesn't model (R-448A, R-450A, R-1336mzz(Z), etc.), PT charts come directly from the named manufacturer datasheet. Where transcription is pending, the chart is empty and the page says so — never invented."
            className="mt-5"
          />
        </Section>

        {/* 7. Common pitfalls */}
        <Section
          id="pitfalls"
          icon={<CircleAlert className="h-5 w-5 text-red-600 dark:text-red-400" />}
          title="Common pitfalls"
          number="07"
        >
          <ul className="grid gap-3">
            <Pitfall
              title="PSIG vs PSIA confusion"
              body="Manifold gauges read PSIG (above atmospheric). Charts here are PSIG unless explicitly stated. PSIA = PSIG + 14.696."
            />
            <Pitfall
              title="Single curve on a zeotrope"
              body="R-407C, R-454C, R-455A, R-448A, R-449A all have meaningful glide. Single-curve math introduces error equal to the glide — up to 22°F on R-455A."
            />
            <Pitfall
              title="Fabricated source values"
              body="The previous WordPress version of this site shipped with PT values wrong by 2–15×, including several physically impossible values above critical pressure. The chart's source matters. Every value here comes from CoolProp 7.2.0 or a cited manufacturer datasheet."
              tone="red"
            />
            <Pitfall
              title="Saturation ≠ operating pressure"
              body={
                <>
                  A PT chart gives the saturation pressure at thermodynamic equilibrium. Operating pressure on a running
                  system depends on charge, ambient, load, superheat, and subcooling. See{" "}
                  <Link href="/what-pressure-should-r22/" className="underline">what should R-22 pressures be</Link>{" "}
                  for the operating-pressure perspective.
                </>
              }
            />
          </ul>
        </Section>

        {/* FAQ */}
        <Section
          id="faq"
          icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          title="FAQ"
          number="08"
        >
          <div className="mt-2 space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group rounded-lg border border-zinc-200 bg-white p-4 transition-colors open:border-blue-300 open:bg-blue-50/30 dark:border-zinc-800 dark:bg-zinc-950 dark:open:border-blue-900 dark:open:bg-blue-950/20"
              >
                <summary className="flex cursor-pointer list-none items-baseline gap-2 font-semibold">
                  <span className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
                  <span>{f.q}</span>
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none pl-5 dark:prose-invert">
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Section>

        {/* Related tools */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" /> Put it to work
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <RelatedTool
              href="/pt-calculator/"
              label="PT Calculator"
              blurb="Bidirectional T ↔ P lookup for any refrigerant in the dataset."
              accent="blue"
            />
            <RelatedTool
              href="/superheat-subcooling-fundamentals/"
              label="SH/SC Fundamentals"
              blurb="How to apply PT chart values in the field — measurement and diagnosis."
              accent="emerald"
            />
            <RelatedTool
              href="/refrigerant-pt-comparison-tool/"
              label="PT Comparison Tool"
              blurb="Overlay 2–4 refrigerants on one chart for retrofit and migration analysis."
              accent="purple"
            />
          </div>
        </section>

        {/* Sources */}
        <footer className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <ScrollText className="h-3.5 w-3.5" /> Sources
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
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

/* ──────────────── helper components ──────────────── */

function Section({
  id,
  icon,
  title,
  number,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-16">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
          {icon}
        </span>
        <div>
          <div className="text-xs font-mono text-zinc-500">{number}</div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`prose prose-zinc max-w-none dark:prose-invert ${className ?? ""}`}>{children}</div>
  );
}

function PhaseRegionGrid() {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-3">
      <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <strong className="text-sm">Above the curve</strong>
        </div>
        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          Refrigerant is vapor (or supercritical above critical point).
        </p>
      </li>
      <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <strong className="text-sm">On the curve</strong>
        </div>
        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          Two-phase: liquid and vapor coexist at thermodynamic equilibrium.
        </p>
      </li>
      <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <strong className="text-sm">Below the curve</strong>
        </div>
        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          Refrigerant is subcooled liquid.
        </p>
      </li>
    </ul>
  );
}

function WorkedExample({
  heading,
  steps,
  note,
}: {
  heading: string;
  steps: Array<{ label: string; value: React.ReactNode }>;
  note: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-950">
      <div className="border-b border-emerald-200 bg-emerald-100/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
        Worked example · {heading}
      </div>
      <div className="grid divide-zinc-200 dark:divide-zinc-800 sm:grid-cols-3 sm:divide-x">
        {steps.map((s, i) => (
          <div key={i} className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{s.label}</div>
            <div className="mt-1.5 font-mono text-xl text-zinc-900 dark:text-zinc-100">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="border-t border-emerald-200/60 bg-white/50 px-5 py-3 text-xs leading-relaxed text-zinc-700 dark:border-emerald-900/30 dark:bg-zinc-950/50 dark:text-zinc-300">
        {note}
      </p>
    </div>
  );
}

function BubbleDewSplit() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <Droplets className="h-4 w-4" />
          <h3 className="font-semibold">Bubble</h3>
        </div>
        <p className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-200">Saturated liquid pressure</p>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          The pressure at which the first vapor bubble appears as the liquid is heated.
        </p>
        <dl className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between"><dt className="text-zinc-500">Use for</dt><dd className="font-mono">Subcooling</dd></div>
          <div className="flex justify-between"><dt className="text-zinc-500">Side</dt><dd className="font-mono">Liquid line</dd></div>
        </dl>
      </div>
      <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-5 dark:border-purple-900/40 dark:bg-purple-950/20">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
          <Droplets className="h-4 w-4" />
          <h3 className="font-semibold">Dew</h3>
        </div>
        <p className="mt-1 text-sm font-medium text-purple-900 dark:text-purple-200">Saturated vapor pressure</p>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          The pressure at which the first liquid drop forms as the vapor is cooled.
        </p>
        <dl className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between"><dt className="text-zinc-500">Use for</dt><dd className="font-mono">Superheat</dd></div>
          <div className="flex justify-between"><dt className="text-zinc-500">Side</dt><dd className="font-mono">Suction line</dd></div>
        </dl>
      </div>
    </div>
  );
}

function GlideTable() {
  const rows = GLIDE_COMPARISON_SLUGS.map((slug) => {
    const r = getRefrigerant(slug);
    const p = getPressureAtTempF(slug, 70);
    if (!r || !p) return null;
    const glide = Math.abs(r.physical.temperatureGlideF);
    let type: string;
    let tone: string;
    if (glide < 0.5) {
      type = "Pure / azeotrope";
      tone = "text-emerald-700 dark:text-emerald-300";
    } else if (glide < 3) {
      type = "Near-azeotrope";
      tone = "text-amber-700 dark:text-amber-300";
    } else {
      type = "Zeotrope";
      tone = "text-red-700 dark:text-red-300";
    }
    return { r, p, glide, type, tone };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Refrigerant</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-right font-medium">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Bubble</span>
            </th>
            <th className="px-3 py-2 text-right font-medium">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Dew</span>
            </th>
            <th className="px-3 py-2 text-right font-medium">Glide</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row) => (
            <tr key={row.r.slug} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-3 py-2">
                <Link href={`/refrigerant/${row.r.slug}/`} className="font-semibold text-blue-700 hover:underline dark:text-blue-300">
                  {row.r.displayName}
                </Link>
              </td>
              <td className={`px-3 py-2 text-xs font-sans ${row.tone}`}>{row.type}</td>
              <td className="px-3 py-2 text-right">{row.p.bubble.toFixed(1)}</td>
              <td className="px-3 py-2 text-right">{row.p.dew.toFixed(1)}</td>
              <td className="px-3 py-2 text-right">{row.glide.toFixed(1)}°F</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({
  tone,
  icon,
  title,
  body,
  className,
}: {
  tone: "blue" | "purple" | "amber" | "emerald" | "red";
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  className?: string;
}) {
  const toneClasses: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/40 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200",
    purple: "border-purple-200 bg-purple-50/40 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-200",
    amber: "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200",
    emerald: "border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200",
    red: "border-red-200 bg-red-50/40 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200",
  };
  return (
    <li className={`rounded-lg border p-4 ${toneClasses[tone]} ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{body}</p>
    </li>
  );
}

function Pitfall({
  title,
  body,
  tone = "amber",
}: {
  title: string;
  body: React.ReactNode;
  tone?: "amber" | "red";
}) {
  const toneClasses =
    tone === "red"
      ? "border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20"
      : "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20";
  const iconColor = tone === "red" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
  return (
    <li className={`rounded-lg border p-4 ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{body}</p>
        </div>
      </div>
    </li>
  );
}

function RelatedTool({
  href,
  label,
  blurb,
  accent,
}: {
  href: string;
  label: string;
  blurb: string;
  accent: "blue" | "emerald" | "purple";
}) {
  const accentBar: Record<string, string> = {
    blue: "bg-blue-500 dark:bg-blue-400",
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    purple: "bg-purple-500 dark:bg-purple-400",
  };
  const accentHover: Record<string, string> = {
    blue: "hover:border-blue-300 dark:hover:border-blue-800",
    emerald: "hover:border-emerald-300 dark:hover:border-emerald-800",
    purple: "hover:border-purple-300 dark:hover:border-purple-800",
  };
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 pl-5 transition-all hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${accentHover[accent]}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100 ${accentBar[accent]}`}
      />
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{blurb}</p>
    </Link>
  );
}
