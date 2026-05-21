import { Suspense } from "react";
import Link from "next/link";
import { refrigerants, getPressureAtTempF, getRefrigerant, type Refrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { RefrigerantBrowser } from "@/components/home/RefrigerantBrowser";

const HERO_SLUGS = ["r-410a", "r-22", "r-134a", "r-32", "r-404a", "r-454b"];

const CALCULATORS = [
  { href: "/superheat-calculator/", label: "Superheat", blurb: "Suction PSIG + line °F → superheat with diagnostic context. The site's most-referenced calculator." },
  { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional T ↔ P lookup for 50+ refrigerants." },
  { href: "/subcooling-calculator/", label: "Subcooling", blurb: "Liquid line PSIG + °F → subcooling with overcharge / undercharge interpretation." },
  { href: "/pt-superheat-subcooling-calculator/", label: "Combined SH / SC / PT", blurb: "Both sides + pattern-matching diagnostic banner." },
  { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison", blurb: "Overlay 2-4 refrigerants on one chart." },
  { href: "/saturation-properties-calculator/", label: "Saturation Properties", blurb: "Bubble + dew + glide at a chosen temperature." },
];

const HUB_LINKS = [
  { href: "/pt-charts-tools-hub/", label: "All PT charts & tools" },
  { href: "/calculators-hub/", label: "All calculators" },
  { href: "/guides-hub/", label: "All guides" },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/#collectionpage`,
      name: "HVAC PT Charts — Verified Pressure-Temperature Data for 61 Refrigerants",
      description:
        "Field reference for HVAC professionals: saturation pressure-temperature charts, superheat / subcooling / charge calculators, retrofit and comparison tools, safety classifications, and GWP rankings.",
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntity: {
        "@type": "ItemList",
        name: "Most-referenced refrigerant PT charts",
        itemListElement: HERO_SLUGS.map((slug, i) => {
          const r = getRefrigerant(slug);
          return r
            ? {
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/refrigerant/${r.slug}/`,
                name: r.displayName,
              }
            : null;
        }).filter(Boolean),
      },
    },
  ];
}

export default function HomePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <main>
        {/* Hero */}
        <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">HVAC Pressure-Temperature Charts</h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-700 dark:text-zinc-300">
              Verified saturation PT data for {refrigerants.length} refrigerants. Calculators for superheat, subcooling,
              and pressure lookup. Built on CoolProp 7.2.0 and manufacturer datasheets — every number cited, no
              fabricated values, no template-swap copy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pt-charts-tools-hub/" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Browse PT charts
              </Link>
              <Link href="/superheat-calculator/" className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
                Open superheat calculator
              </Link>
            </div>
          </div>
        </section>

        {/* Hero PT cards — computed from the data layer */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold">Quick reference — most-used refrigerants at 70°F</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Saturation pressure at 70°F. Click any card for the full chart, properties, and retrofit guidance.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HERO_SLUGS.map((slug) => {
              const r = getRefrigerant(slug);
              if (!r) return null;
              return <HeroPTCard key={slug} r={r} />;
            })}
          </ul>
        </section>

        {/* Find a refrigerant — searchable browser */}
        <section className="border-y border-zinc-200 bg-zinc-50/40 py-12 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-semibold">Find a refrigerant</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              All {refrigerants.length} refrigerants in the dataset. Filter by type, safety class, GWP bucket, or search
              by name / trade name / chemistry.
            </p>
            <div className="mt-6">
              <Suspense fallback={<div className="h-32 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />}>
                <RefrigerantBrowser />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Calculators */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold">Calculators</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            6 PT-dependent calculators, all built on the same verified saturation dataset. Imperial and metric units.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATORS.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="block h-full rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
                  <h3 className="font-semibold">{c.label}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{c.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href="/calculators-hub/" className="text-blue-700 hover:underline dark:text-blue-300">All calculators →</Link>
          </p>
        </section>

        {/* About-this-site / provenance */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold">About this site</h2>
          <div className="prose prose-zinc mt-4 max-w-none dark:prose-invert">
            <p>
              HVAC PT Charts provides verified saturation pressure-temperature data for {refrigerants.length}{" "}
              refrigerants. Values are sourced from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS) or transcribed
              from named manufacturer datasheets — Honeywell, Chemours, Arkema, AGC — for blends CoolProp doesn&apos;t
              model. Every refrigerant page footer cites its data source.
            </p>
            <p>
              All calculator math uses this same dataset. Every page, every number, one source of truth. Safety
              classifications (A1 / A2L / A3 / B1 / B2L) come from a Zod-validated enum on the refrigerant record;
              it&apos;s impossible to render the wrong class even on pages with no editorial content yet. GWP values
              are IPCC AR5 100-year (the figure EPA uses for the AIM Act), with AR6 values shown where they differ
              meaningfully.
            </p>
            <p>
              No advertising, no user tracking beyond aggregate page-view analytics, no sign-up required. The full
              PT dataset for every refrigerant is downloadable as CSV or JSON under CC BY 4.0.
            </p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-3 text-sm">
            {HUB_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

function HeroPTCard({ r }: { r: Refrigerant }) {
  const p = getPressureAtTempF(r.slug, 70);
  return (
    <li>
      <Link href={`/refrigerant/${r.slug}/`} className="block h-full rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{r.displayName}</h3>
          <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <TypeChip type={r.type} className="!text-xs !px-2 !py-0.5" />
        </div>
        <div className="mt-3 font-mono">
          {p ? (
            r.physical.hasSignificantGlide ? (
              <>
                <span className="text-xl font-bold">{p.bubble.toFixed(1)} / {p.dew.toFixed(1)}</span>
                <span className="ml-1 text-xs text-zinc-500">PSIG bub/dew @ 70°F</span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold">{p.bubble.toFixed(1)}</span>
                <span className="ml-1 text-xs text-zinc-500">PSIG @ 70°F</span>
              </>
            )
          ) : (
            <span className="text-xs text-zinc-500">PT data pending</span>
          )}
        </div>
      </Link>
    </li>
  );
}
