import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calculator,
  Database,
  Download,
  EyeOff,
  GitCompareArrows,
  Gauge,
  Leaf,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { refrigerants, getPressureAtTempF, getRefrigerant, type Refrigerant } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { RefrigerantBrowser } from "@/components/home/RefrigerantBrowser";

const HERO_SLUGS = ["r-410a", "r-22", "r-134a", "r-32", "r-404a", "r-454b"];

export const metadata: Metadata = {
  // Homepage needs its own canonical so search engines don't dedupe to a
  // tracking-parameter variant. Title/description/og/twitter inherit from layout.
  alternates: { canonical: `${SITE_URL}/` },
};

const CHARGING_CALCULATORS = [
  { href: "/superheat-calculator/", label: "Superheat", blurb: "Suction PSIG + line °F → superheat with diagnostic context." },
  { href: "/subcooling-calculator/", label: "Subcooling", blurb: "Liquid line PSIG + °F → subcooling with overcharge / undercharge interpretation." },
  { href: "/pt-superheat-subcooling-calculator/", label: "Combined SH / SC / PT", blurb: "Both sides + pattern-matching diagnostic banner." },
  { href: "/system-pressure-diagnostic-calculator/", label: "System Pressure Diagnostic", blurb: "8-input expert system: flagged findings with evidence and ordered recommendations." },
  { href: "/refrigerant-charge-calculator/", label: "Refrigerant Charge", blurb: "Line-set length adjustment to nameplate. Per-foot oz from CoolProp liquid density." },
];

const LOOKUP_CALCULATORS = [
  { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional T ↔ P lookup for 50+ refrigerants." },
  { href: "/saturation-properties-calculator/", label: "Saturation Properties", blurb: "Bubble + dew + glide at a chosen temperature." },
  { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison", blurb: "Overlay 2-4 refrigerants on one chart." },
  { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "Pair decision matrix: lubricant, safety, pressure, glide, application overlap." },
];

const FEATURED_COMPARISONS = [
  { href: "/r-22-vs-r-410a/", label: "R-22 vs R-410A", blurb: "Homeowner replacement decision — why retrofit isn't a drop-in." },
  { href: "/r-32-vs-r-454b/", label: "R-32 vs R-454B", blurb: "The two leading R-410A replacements — decided largely by OEM preference." },
  { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B", blurb: "Direct A2L replacement for new equipment installs." },
  { href: "/r-22-vs-r-32/", label: "R-22 vs R-32", blurb: "Legacy HCFC vs modern A2L — full replacement only." },
  { href: "/r-134a-vs-r-513a/", label: "R-134a vs R-513A", blurb: "Chiller drop-in: 56% GWP reduction, same A1, same POE oil." },
  { href: "/r-744-vs-r-290/", label: "R-744 vs R-290", blurb: "CO₂ transcritical vs propane A3 charge-limited — the natural refrigerant choice." },
];

const FEATURED_GUIDES = [
  { href: "/refrigerant-comparison-guide/", label: "Refrigerant Comparison Guide", blurb: "Framework for choosing between refrigerants across 5 axes — thermo, safety, environment, regulation, practical." },
  { href: "/superheat-subcooling-fundamentals/", label: "Superheat & Subcooling Fundamentals", blurb: "What they are, how to measure, target values, the 4 diagnostic patterns." },
  { href: "/pt-chart-guide/", label: "How to Read a PT Chart", blurb: "Bubble vs dew, glide, critical point truncation, common pitfalls." },
  { href: "/high-head-pressure-causes/", label: "High Head Pressure Causes", blurb: "Diagnostic decision tree for high-side pressure problems." },
];

const FEATURED_PRESSURE_PAGES = [
  { href: "/what-pressure-should-r22/", label: "R-22 pressures" },
  { href: "/what-pressure-should-410a/", label: "R-410A pressures" },
  { href: "/what-pressure-should-r32/", label: "R-32 pressures" },
  { href: "/what-pressure-should-r454b/", label: "R-454B pressures" },
  { href: "/what-pressure-should-r134a/", label: "R-134a pressures" },
  { href: "/what-pressure-should-r1234yf/", label: "R-1234yf pressures (mobile A/C)" },
  { href: "/what-pressure-should-r407c/", label: "R-407C pressures" },
  { href: "/what-pressure-should-r404a/", label: "R-404A pressures" },
  { href: "/what-pressure-should-r454c/", label: "R-454C pressures" },
  { href: "/what-pressure-should-r744/", label: "R-744 (CO₂) pressures" },
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
        <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-blue-50 via-zinc-50 to-amber-50/40 dark:border-zinc-800 dark:from-blue-950/20 dark:via-zinc-950 dark:to-amber-950/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/80 px-2.5 py-0.5 text-xs font-medium text-blue-900 backdrop-blur dark:border-blue-900/40 dark:bg-zinc-950/80 dark:text-blue-200">
              <Sparkles className="h-3 w-3" /> Verified field reference for HVAC professionals
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              HVAC <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">Pressure-Temperature</span> Charts
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-snug text-zinc-700 dark:text-zinc-300 sm:text-lg">
              Verified saturation data for {refrigerants.length} refrigerants — every value sourced and cited.
              9 calculators, 13 pair comparisons, 4 long-form guides. No signup, no paywall, CC BY 4.0.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                href="/pt-charts-tools-hub/"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Browse PT charts <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/superheat-calculator/"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Open superheat calculator
              </Link>
              <ul className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-1"><Database className="h-3 w-3 text-blue-600 dark:text-blue-400" /> CoolProp 7.2.0</li>
                <li className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Zod-validated</li>
                <li className="flex items-center gap-1"><EyeOff className="h-3 w-3 text-purple-600 dark:text-purple-400" /> No signup</li>
                <li className="flex items-center gap-1"><Download className="h-3 w-3 text-amber-600 dark:text-amber-400" /> CC BY 4.0</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Hero PT cards — computed from the data layer */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            icon={<Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title="Quick reference — most-used refrigerants at 70°F"
            sub="Saturation pressure at 70°F. Click any card for the full chart, properties, and retrofit guidance."
          />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HERO_SLUGS.map((slug) => {
              const r = getRefrigerant(slug);
              if (!r) return null;
              return <HeroPTCard key={slug} r={r} />;
            })}
          </ul>
        </section>

        {/* Find a refrigerant — searchable browser */}
        <section className="border-y border-zinc-200 bg-zinc-50/60 py-14 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              icon={<ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              title="Find a refrigerant"
              sub={`All ${refrigerants.length} refrigerants in the dataset. Filter by type, safety class, GWP bucket, or search by name / trade name / chemistry.`}
            />
            <div className="mt-7">
              <Suspense fallback={<div className="h-32 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />}>
                <RefrigerantBrowser />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Calculators — 9 total, grouped */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            icon={<Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title="Calculators"
            sub="9 calculators built on the verified dataset. Bubble vs dew handled automatically for zeotropic blends. Imperial and metric units."
          />

          <GroupHeading label="Charging and diagnostic" />
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHARGING_CALCULATORS.map((c) => <ToolCard key={c.href} {...c} accent="blue" />)}
          </ul>

          <GroupHeading label="Lookup and reference" className="mt-8" />
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LOOKUP_CALCULATORS.map((c) => <ToolCard key={c.href} {...c} accent="purple" />)}
          </ul>

          <p className="mt-7 text-sm">
            <Link href="/calculators-hub/" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline dark:text-blue-300">
              All calculators <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </section>

        {/* Refrigerant comparisons */}
        <section className="border-y border-zinc-200 bg-gradient-to-b from-amber-50/30 to-zinc-50/60 py-14 dark:border-zinc-800 dark:from-amber-950/10 dark:to-zinc-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              icon={<GitCompareArrows className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              title="Refrigerant comparisons"
              sub="Direct pair comparisons for the most-asked decisions. 13 pair pages total covering residential, commercial refrigeration, chillers, and naturals."
            />
            <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_COMPARISONS.map((c) => <ToolCard key={c.href} {...c} accent="amber" />)}
            </ul>
            <p className="mt-7 text-sm">
              <Link href="/refrigerant-comparison-guide/" className="inline-flex items-center gap-1 font-medium text-amber-700 hover:underline dark:text-amber-300">
                Refrigerant comparison guide — the framework behind these decisions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </section>

        {/* Operating pressures */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            icon={<Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
            title="Operating pressure references"
            sub="Typical suction and discharge pressures by ambient temperature, with diagnostic procedure. For field-troubleshooting reference."
          />
          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PRESSURE_PAGES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3.5 py-2.5 text-sm transition-all hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-sky-800 dark:hover:bg-sky-950/20"
                >
                  <span>What should <span className="font-semibold">{p.label}</span> be?</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Long-form guides */}
        <section className="border-y border-zinc-200 bg-gradient-to-b from-emerald-50/30 to-zinc-50/60 py-14 dark:border-zinc-800 dark:from-emerald-950/10 dark:to-zinc-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              icon={<BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              title="Long-form guides"
              sub="Conceptual references for the methods behind the calculators and the decisions behind the comparisons."
            />
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FEATURED_GUIDES.map((g) => <ToolCard key={g.href} {...g} accent="emerald" />)}
            </ul>
          </div>
        </section>

        {/* About-this-site / provenance — icon grid, NO walls of text */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            icon={<ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            title="About this site"
            sub="Six guarantees behind every number on every page."
          />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Database className="h-5 w-5" />}
              accent="blue"
              title="Verified data"
              body="CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS), plus named manufacturer datasheets (Honeywell, Chemours, Arkema, AGC) for blends CoolProp doesn't model."
            />
            <FeatureCard
              icon={<GitCompareArrows className="h-5 w-5" />}
              accent="emerald"
              title="One source of truth"
              body="Every chart, every calculator, every comparison reads from the same Zod-validated refrigerant record. No copies, no drift."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              accent="amber"
              title="Structural safety class"
              body="A1 / A2L / A3 / B1 / B2L comes from a typed enum — impossible to mislabel R-32 as A1 even on pages without editorial content yet."
            />
            <FeatureCard
              icon={<Leaf className="h-5 w-5" />}
              accent="green"
              title="IPCC AR5 GWP"
              body="The figure EPA uses for the AIM Act 700-GWP threshold. AR6 values shown where they differ meaningfully."
            />
            <FeatureCard
              icon={<EyeOff className="h-5 w-5" />}
              accent="purple"
              title="No signup, no paywall"
              body="Open access to every chart, calculator, and dataset. Site is ad-supported via Raptive — no email gates, no popups, no required accounts."
            />
            <FeatureCard
              icon={<Download className="h-5 w-5" />}
              accent="sky"
              title="Downloadable dataset"
              body="Full PT data for every refrigerant available as CSV or JSON under CC BY 4.0. Free for any use with attribution."
            />
          </ul>
          <ul className="mt-8 flex flex-wrap gap-3 text-sm">
            {HUB_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3.5 py-2 font-medium transition-all hover:border-zinc-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  {l.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

function SectionHeading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">{icon}</span>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{sub}</p>
    </div>
  );
}

function GroupHeading({ label, className }: { label: string; className?: string }) {
  return (
    <h3 className={`text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className ?? "mt-6"}`}>
      {label}
    </h3>
  );
}

type Accent = "blue" | "amber" | "emerald" | "purple" | "sky" | "green";

const ACCENT_BAR: Record<Accent, string> = {
  blue: "bg-blue-500 dark:bg-blue-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  purple: "bg-purple-500 dark:bg-purple-400",
  sky: "bg-sky-500 dark:bg-sky-400",
  green: "bg-green-500 dark:bg-green-400",
};

const ACCENT_HOVER: Record<Accent, string> = {
  blue: "hover:border-blue-300 dark:hover:border-blue-800",
  amber: "hover:border-amber-300 dark:hover:border-amber-800",
  emerald: "hover:border-emerald-300 dark:hover:border-emerald-800",
  purple: "hover:border-purple-300 dark:hover:border-purple-800",
  sky: "hover:border-sky-300 dark:hover:border-sky-800",
  green: "hover:border-green-300 dark:hover:border-green-800",
};

const ACCENT_ICON_BG: Record<Accent, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  green: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
};

function ToolCard({ href, label, blurb, accent }: { href: string; label: string; blurb: string; accent: Accent }) {
  return (
    <li>
      <Link
        href={href}
        className={`group relative block h-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 pl-5 transition-all hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${ACCENT_HOVER[accent]}`}
      >
        <span aria-hidden className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100 ${ACCENT_BAR[accent]}`} />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{label}</h3>
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{blurb}</p>
      </Link>
    </li>
  );
}

function FeatureCard({ icon, title, body, accent }: { icon: React.ReactNode; title: string; body: string; accent: Accent }) {
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${ACCENT_ICON_BG[accent]}`}>{icon}</span>
      <h3 className="mt-3.5 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
    </li>
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
