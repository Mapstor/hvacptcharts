import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  Download,
  Droplets,
  FileCode,
  FileText,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  Globe2,
  Info,
  Leaf,
  Lightbulb,
  ListChecks,
  MapPin,
  Recycle,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Table as TableIcon,
  Thermometer,
  Waves,
} from "lucide-react";

import { getAllSlugs, getRefrigerant, getPressureAtTempF, type Refrigerant } from "@/data/refrigerants";
import { getPrimaryGroupForSlug } from "@/data/comparison-groups";
import { loadRefrigerantMdx } from "@/lib/mdx";
import { findComparisonsForRefrigerant, type ComparisonSummary } from "@/lib/mdx-comparison";
import { findWhatPressureForRefrigerant } from "@/lib/mdx-what-pressure";
import { buildRefrigerantSchema } from "@/lib/schema/refrigerant";
import { SITE_URL } from "@/lib/schema/shared";

import { JsonLd } from "@/components/seo/JsonLd";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { RefrigerantPTCurve } from "@/components/refrigerant/RefrigerantPTCurve";
import { PTDataTable } from "@/components/refrigerant/PTDataTable";
import { QuickPTLookup } from "@/components/refrigerant/QuickPTLookup";
import { RefrigerantCycle } from "@/components/refrigerant/RefrigerantCycle";
import { RefrigerantPhaseDown } from "@/components/refrigerant/RefrigerantPhaseDown";
import { RefrigerantGlide } from "@/components/refrigerant/RefrigerantGlide";
import { RefrigerantGWPComparison } from "@/components/refrigerant/RefrigerantGWPComparison";
import { mdxComponents } from "@/components/refrigerant/mdx-components";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRefrigerant(slug);
  if (!r) return { title: "Refrigerant not found" };
  const mdx = loadRefrigerantMdx(slug);
  const title = mdx?.frontmatter.metaTitle ?? `${r.displayName} PT Chart, Properties & Operating Pressures`;
  const description =
    mdx?.frontmatter.metaDescription ??
    `Verified saturation pressure-temperature data for ${r.displayName} from -40°F to 150°F. ASHRAE safety class ${r.safetyClass}. Generated from ${r.dataSource.ptChartSource}.`;
  const canonical = `${SITE_URL}/refrigerant/${r.slug}/`;
  return {
    title,
    description,
    alternates: { canonical },
    // Explicitly include images: when openGraph is set per-page, Next.js
    // does NOT merge with layout defaults, so the auto-detected
    // /opengraph-image must be referenced explicitly here.
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}

export default async function RefrigerantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRefrigerant(slug);
  if (!r) notFound();

  const mdx = loadRefrigerantMdx(slug);
  const faqs = mdx?.frontmatter.faqs ?? [];
  const schema = buildRefrigerantSchema(r, faqs);

  // Quick-lookup strip — service-relevant temperatures spanning evaporator
  // (low side AC, refrigeration), comfort/test, and condensing conditions.
  const at70 = getPressureAtTempF(slug, 70);
  const QUICK_TEMPS_F = [32, 45, 70, 75, 80, 95];

  const whatPressureId = findWhatPressureForRefrigerant(slug);
  const pairs = findComparisonsForRefrigerant(slug);

  return (
    <>
      <JsonLd graph={schema} />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{r.displayName}</span>
        </nav>

        {/* ───────────────────────────── HERO ───────────────────────────── */}
        <header className="mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:border-blue-900/40 dark:from-blue-950/30 dark:via-zinc-950 dark:to-purple-950/20">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-blue-900/80 dark:text-blue-200/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/70 px-2.5 py-1 backdrop-blur dark:border-blue-900/40 dark:bg-zinc-950/70">
                <FlaskConical className="h-3 w-3" /> Refrigerant
              </span>
              <span className="font-mono text-zinc-500">ASHRAE {r.ashraeNumber}</span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {r.displayName}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SafetyClassChip safetyClass={r.safetyClass} size="md" />
              <TypeChip type={r.type} />
              {r.regulatoryStatus.aimActAffected && !r.regulatoryStatus.epaPhaseoutComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                  <AlertTriangle className="h-3 w-3" /> AIM Act phase-down
                </span>
              ) : null}
              {r.regulatoryStatus.epaPhaseoutComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
                  <ShieldAlert className="h-3 w-3" /> Production banned {r.regulatoryStatus.epaPhaseoutDate ? `· ${r.regulatoryStatus.epaPhaseoutDate.slice(0, 4)}` : ""}
                </span>
              ) : null}
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white/80 px-3 py-1.5 text-sm font-mono backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/80">
              <Atom className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-zinc-700 dark:text-zinc-300">{r.chemicalFormula}</span>
            </div>

            {mdx?.frontmatter.introOneLiner ? (
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                {mdx.frontmatter.introOneLiner}
              </p>
            ) : null}

            {/* Stats strip — 4 derived from data layer, always present */}
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox
                icon={<Gauge className="h-4 w-4" />}
                label="Saturation @ 70°F"
                value={
                  at70
                    ? r.physical.hasSignificantGlide
                      ? `${at70.bubble.toFixed(1)} / ${at70.dew.toFixed(1)}`
                      : at70.bubble.toFixed(1)
                    : null
                }
                unit="PSIG"
                tone="blue"
              />
              <StatBox
                icon={<Leaf className="h-4 w-4" />}
                label="GWP (IPCC AR5)"
                value={r.environmental.gwp100Ar5 !== null ? String(r.environmental.gwp100Ar5) : null}
                unit="100-yr"
                tone={
                  r.environmental.gwp100Ar5 === null
                    ? "neutral"
                    : r.environmental.gwp100Ar5 < 150
                    ? "emerald"
                    : r.environmental.gwp100Ar5 < 700
                    ? "amber"
                    : "red"
                }
              />
              <StatBox
                icon={<Waves className="h-4 w-4" />}
                label="Temperature glide"
                value={
                  r.physical.hasSignificantGlide
                    ? Math.abs(r.physical.temperatureGlideF).toFixed(1)
                    : "≈0"
                }
                unit="°F"
                tone={r.physical.hasSignificantGlide ? "purple" : "neutral"}
              />
              <StatBox
                icon={<Thermometer className="h-4 w-4" />}
                label="Boiling point"
                value={r.physical.boilingPointF !== null ? r.physical.boilingPointF.toFixed(1) : null}
                unit="°F"
                tone="sky"
              />
            </div>

            {/* Authored key stats (sourced) — only if MDX provides them */}
            {mdx?.frontmatter.keyStats && mdx.frontmatter.keyStats.length > 0 ? (
              <div className="mt-3 rounded-lg border border-zinc-200 bg-white/70 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <ScrollText className="h-3 w-3" /> Sourced facts
                </div>
                <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {mdx.frontmatter.keyStats.map((k, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2 border-b border-zinc-100 pb-1 dark:border-zinc-900">
                      <dt className="text-xs text-zinc-600 dark:text-zinc-400">{k.label}</dt>
                      <dd className="flex items-baseline gap-1 text-right">
                        <span className="font-mono text-sm font-semibold">{k.value}</span>
                        {k.unit ? <span className="text-[10px] text-zinc-500">{k.unit}</span> : null}
                        {k.sourceId ? (
                          <a
                            href={`#src-${k.sourceId}`}
                            className="text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                            aria-label={`Source: ${k.sourceId}`}
                          >
                            [src]
                          </a>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {/* Quick actions */}
            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href={`/pt-calculator/?refrigerant=${slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Calculator className="h-3.5 w-3.5" /> {r.displayName} PT calculator
              </Link>
              {whatPressureId ? (
                <Link
                  href={`/what-pressure-should-${whatPressureId}/`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <Activity className="h-3.5 w-3.5" /> Operating pressures
                </Link>
              ) : null}
              <Link
                href={`/superheat-calculator/?refrigerant=${slug}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <Droplets className="h-3.5 w-3.5" /> Superheat
              </Link>
            </div>
          </div>
        </header>

        {/* ───────────────── Safety class detail card ───────────────── */}
        <section className="mb-10">
          <SafetyClassChip safetyClass={r.safetyClass} variant="card" />
        </section>

        {/* ───────────────── PT chart ───────────────── */}
        {r.ptChart.length > 0 ? (
          <Section
            id="pt-chart"
            icon={<Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title="Saturation pressure-temperature curve"
            number="01"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <RefrigerantPTCurve slug={slug} />

              {/* Inline mini calculator */}
              <div className="mt-5">
                <QuickPTLookup
                  displayName={r.displayName}
                  slug={slug}
                  ptChart={r.ptChart}
                  hasGlide={r.physical.hasSignificantGlide}
                />
              </div>

              {/* Quick lookups strip — 6 service-relevant temperatures */}
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Common service temperatures
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {QUICK_TEMPS_F.map((t) => (
                    <QuickLookup
                      key={t}
                      tempF={t}
                      p={getPressureAtTempF(slug, t)}
                      hasGlide={r.physical.hasSignificantGlide}
                      role={QUICK_TEMP_LABELS[t]}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Saturation values from {r.dataSource.ptChartSource}. Operating pressure on a running system differs —
              {whatPressureId ? (
                <>
                  {" "}see <Link href={`/what-pressure-should-${whatPressureId}/`} className="underline">what {r.displayName} operating pressures should be</Link>.
                </>
              ) : (
                <> see the operating-pressure references for in-use values.</>
              )}
            </p>
          </Section>
        ) : (
          <Section
            id="pt-chart"
            icon={<Gauge className="h-5 w-5 text-zinc-500" />}
            title="Saturation pressure-temperature curve"
            number="01"
          >
            <NoPtChartNotice
              status={r.dataSource.dataStatus}
              ptChartSource={r.dataSource.ptChartSource}
              primarySources={r.dataSource.primarySources}
              displayName={r.displayName}
            />
          </Section>
        )}

        {/* ───────────────── Complete PT data table ───────────────── */}
        {r.ptChart.length > 0 ? (
          <Section
            id="pt-table"
            icon={<TableIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title={`${r.displayName} PT chart PDF — printable saturation table`}
            number="02"
          >
            <p className="mb-3 text-sm text-zinc-700 dark:text-zinc-300">
              Looking for the <strong>{r.displayName} PT chart PDF</strong>{" "}
              for shop reference? The complete pressure-temperature saturation table is
              below — every 1° increment from −40°F to 150°F (or to the refrigerant&apos;s
              critical temperature). Use the <strong>Print / Save as PDF</strong> button in
              the table header to download a clean, table-only PDF (the rest of the page is
              hidden from the print output). Important service temperatures (normal boiling
              point, freezing point of water, residential AC evap and condenser targets) are
              tinted and tagged in the table for at-a-glance shop reference.
            </p>
            <PTDataTable
              displayName={r.displayName}
              ptChart={r.ptChart}
              hasGlide={r.physical.hasSignificantGlide}
              applicationGroup={getPrimaryGroupForSlug(slug)}
            />
            <p className="mt-3 text-xs text-zinc-500">
              Full saturation values at 1° increments — toggle between °F / PSIG and °C / kPa.
              Use <strong>Print / Save as PDF</strong> for laminated shop reference, or
              download the CSV / JSON below for use in other tools. {r.displayName} PT chart
              data: CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS) or manufacturer
              datasheet, validated against AHRI Standard 700-2019.
            </p>
          </Section>
        ) : null}

        {/* ───────────────── Identity card ───────────────── */}
        <Section
          id="identity"
          icon={<FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="At a glance"
          number="03"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <IdentityCard
              icon={<Atom className="h-4 w-4" />}
              label="Chemistry"
              tone="purple"
            >
              <div className="font-mono text-sm">{r.chemicalFormula}</div>
              <div className="mt-1 text-xs text-zinc-500">{r.chemicalName}</div>
            </IdentityCard>

            <IdentityCard
              icon={<Droplets className="h-4 w-4" />}
              label="Lubricant compatibility"
              tone="blue"
            >
              <div className="flex flex-wrap gap-1.5">
                {r.lubricants.compatible.map((l) => (
                  <span key={l} className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {l}
                  </span>
                ))}
                {r.lubricants.incompatible.map((l) => (
                  <span key={l} className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-500 line-through dark:bg-zinc-900 dark:text-zinc-500">
                    {l}
                  </span>
                ))}
              </div>
              {r.lubricants.notes ? (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{r.lubricants.notes}</p>
              ) : null}
            </IdentityCard>

            {r.composition.length > 0 ? (
              <IdentityCard
                icon={<GitCompareArrows className="h-4 w-4" />}
                label="Blend composition"
                tone="amber"
                colSpan={2}
              >
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {r.composition.map((c) => (
                    <li key={c.component} className="flex items-baseline justify-between rounded-md bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-900">
                      <span className="font-mono text-sm">{c.component}</span>
                      <span className="font-mono text-sm font-semibold">{(c.massFraction * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </IdentityCard>
            ) : null}

            {r.tradeNames.length > 0 ? (
              <IdentityCard
                icon={<FileText className="h-4 w-4" />}
                label="Trade names"
                tone="sky"
                colSpan={2}
              >
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {r.tradeNames.map((t, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold">{t.name}</span>
                      <span className="ml-1.5 text-xs text-zinc-500">{t.manufacturer}</span>
                    </li>
                  ))}
                </ul>
              </IdentityCard>
            ) : null}

            {r.applications.length > 0 ? (
              <IdentityCard
                icon={<MapPin className="h-4 w-4" />}
                label="Common applications"
                tone="emerald"
                colSpan={2}
              >
                <ul className="grid gap-1.5">
                  {r.applications.slice(0, 5).map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </IdentityCard>
            ) : null}
          </div>
        </Section>

        {/* ───────────────── Properties ───────────────── */}
        <Section
          id="properties"
          icon={<ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          title="Properties"
          number="04"
        >
          <PropertiesGrid r={r} />
        </Section>

        {/* ───────────────── MDX narrative ───────────────── */}
        {mdx?.frontmatter.narrative.whatItIs ? (
          <Section
            id="what-it-is"
            icon={<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title={`What is ${r.displayName}?`}
            number="05"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                {paragraphs(mdx.frontmatter.narrative.whatItIs)}
              </div>
            </div>

            {(mdx.frontmatter.narrative.whereItsUsed ?? []).length > 0 ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                  <MapPin className="h-3.5 w-3.5" /> Where {r.displayName} is used
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(mdx.frontmatter.narrative.whereItsUsed ?? []).map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {mdx.frontmatter.narrative.phaseDownStatus ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                  <Recycle className="h-3.5 w-3.5" /> Regulatory &amp; phase-down status
                </h3>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {paragraphs(mdx.frontmatter.narrative.phaseDownStatus)}
                </div>
              </div>
            ) : null}

            {mdx.frontmatter.narrative.serviceNotes ? (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-200">
                  <Lightbulb className="h-3.5 w-3.5" /> Service notes
                </h3>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {paragraphs(mdx.frontmatter.narrative.serviceNotes)}
                </div>
              </div>
            ) : null}
          </Section>
        ) : null}

        {/* ───────────────── Glide visualization ───────────────── */}
        {r.physical.hasSignificantGlide && r.ptChart.length > 0 ? (
          <Section
            id="glide"
            icon={<Waves className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            title="Temperature glide"
            number="06"
          >
            <div className="rounded-xl border border-purple-200 bg-white p-5 dark:border-purple-900/40 dark:bg-zinc-950">
              <RefrigerantGlide slug={slug} />
            </div>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {r.displayName} is a zeotropic blend: at constant pressure it boils across a temperature range rather
              than at a single point. This affects EXV sizing, charge measurement, and superheat measurement. Use the
              <strong> dew curve for superheat</strong>, <strong>bubble curve for subcooling</strong>.
            </p>
          </Section>
        ) : null}

        {/* ───────────────── Cycle diagram ───────────────── */}
        {r.ptChart.length > 0 ? (
          <Section
            id="cycle"
            icon={<Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
            title="Operating cycle"
            number="07"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <RefrigerantCycle slug={slug} />
            </div>
          </Section>
        ) : null}

        {/* ───────────────── Phase-down timeline ───────────────── */}
        <Section
          id="phasedown"
          icon={<Recycle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          title="Phase-down timeline"
          number="08"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <RefrigerantPhaseDown slug={slug} />
          </div>
        </Section>

        {/* ───────────────── GWP comparison ───────────────── */}
        <Section
          id="gwp"
          icon={<Globe2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          title="Global warming potential, in context"
          number="09"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <RefrigerantGWPComparison currentSlug={slug} />
          </div>
        </Section>

        {/* ───────────────── Retrofit paths ───────────────── */}
        {((r.replaces && r.replaces.length > 0) || r.replacementOptions.length > 0) ? (
          <Section
            id="retrofit"
            icon={<GitCompareArrows className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            title="Retrofit and replacement paths"
            number="10"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {r.replaces && r.replaces.length > 0 ? (
                <ReplacementCard title={`${r.displayName} replaces`} slugs={r.replaces} direction="from" />
              ) : null}
              {r.replacementOptions.length > 0 ? (
                <ReplacementCard title={`Replacements for ${r.displayName}`} slugs={r.replacementOptions} direction="to" />
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* ───────────────── Related resources ───────────────── */}
        <RelatedResources slug={r.slug} displayName={r.displayName} pairs={pairs} whatPressureId={whatPressureId} />

        {/* ───────────────── MDX body ───────────────── */}
        {mdx && mdx.body.length > 0 ? (
          <section className="prose prose-zinc mb-10 max-w-none dark:prose-invert">
            <MDXRemote source={mdx.body} components={mdxComponents as never} />
          </section>
        ) : null}

        {/* ───────────────── FAQ ───────────────── */}
        {faqs.length > 0 ? (
          <Section
            id="faq"
            icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            title="Frequently asked"
            number="11"
          >
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-zinc-200 bg-white p-4 transition-colors open:border-blue-300 open:bg-blue-50/30 dark:border-zinc-800 dark:bg-zinc-950 dark:open:border-blue-900 dark:open:bg-blue-950/20"
                >
                  <summary className="flex cursor-pointer list-none items-baseline gap-2 font-semibold">
                    <span className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
                    <span>{f.q}</span>
                  </summary>
                  <div className="prose prose-sm prose-zinc mt-3 max-w-none pl-5 dark:prose-invert">
                    {paragraphs(f.a)}
                  </div>
                </details>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ───────────────── Data download ───────────────── */}
        <section className="mb-10 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-950">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Download className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Download this dataset</h2>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  Full PT chart for {r.displayName} · CC BY 4.0 · attribute the source
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`/data/refrigerant/${r.slug}/csv/`}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
              >
                <FileText className="h-3.5 w-3.5" /> CSV
              </a>
              <a
                href={`/data/refrigerant/${r.slug}/json/`}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
              >
                <FileCode className="h-3.5 w-3.5" /> JSON
              </a>
            </div>
          </div>
        </section>

        {/* ───────────────── Sources & citations ───────────────── */}
        {mdx?.frontmatter.sources && mdx.frontmatter.sources.length > 0 ? (
          <Section
            id="sources"
            icon={<ScrollText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />}
            title="Sources & citations"
            number="13"
          >
            <ol className="grid gap-2 text-xs">
              {mdx.frontmatter.sources.map((s, i) => (
                <li
                  key={s.id}
                  id={`src-${s.id}`}
                  className="flex gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="shrink-0 font-mono text-zinc-400">[{i + 1}]</span>
                  <div className="min-w-0">
                    <div className="text-sm">{s.label}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-zinc-500">
                      {s.date ? <span>{s.date}</span> : null}
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="nofollow noopener" className="break-all underline">
                          {s.url}
                        </a>
                      ) : null}
                      {s.note ? <span>{s.note}</span> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {/* ───────────────── Provenance footer ───────────────── */}
        <ProvenanceFooter r={r} />
      </article>
    </>
  );
}

/* ────────────────────── helper components ────────────────────── */

function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>);
}

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

type StatTone = "blue" | "purple" | "emerald" | "amber" | "red" | "sky" | "neutral";

const STAT_TONE: Record<StatTone, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

function StatBox({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit: string;
  tone: StatTone;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${STAT_TONE[tone]}`}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5">
        {value !== null ? (
          <>
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
            <span className="text-xs text-zinc-500">{unit}</span>
          </>
        ) : (
          <span className="text-sm text-zinc-400">—</span>
        )}
      </div>
    </div>
  );
}

const QUICK_TEMP_LABELS: Record<number, string> = {
  32: "Freezing",
  45: "Heat-pump heat",
  70: "Standard",
  75: "Test ref",
  80: "Warm",
  95: "Summer peak",
};

function QuickLookup({
  tempF,
  p,
  hasGlide,
  role,
}: {
  tempF: number;
  p: { bubble: number; dew: number } | null;
  hasGlide: boolean;
  role?: string;
}) {
  return (
    <div className="rounded-md bg-zinc-50 px-2.5 py-1.5 text-center dark:bg-zinc-900">
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-mono text-xs font-bold">{tempF}</span>
        <span className="text-[10px] text-zinc-500">°F</span>
      </div>
      {p ? (
        <div className="mt-0.5 font-mono text-xs font-semibold leading-tight">
          {hasGlide ? `${p.bubble.toFixed(0)} / ${p.dew.toFixed(0)}` : p.bubble.toFixed(0)}
          <span className="ml-0.5 text-[9px] font-normal text-zinc-500">PSIG</span>
        </div>
      ) : (
        <div className="mt-0.5 text-[10px] text-zinc-400">—</div>
      )}
      {role ? <div className="mt-0.5 text-[9px] uppercase tracking-wider text-zinc-400">{role}</div> : null}
    </div>
  );
}

const IDENTITY_TONE: Record<StatTone, string> = {
  blue: "border-blue-200 dark:border-blue-900/40",
  purple: "border-purple-200 dark:border-purple-900/40",
  emerald: "border-emerald-200 dark:border-emerald-900/40",
  amber: "border-amber-200 dark:border-amber-900/40",
  red: "border-red-200 dark:border-red-900/40",
  sky: "border-sky-200 dark:border-sky-900/40",
  neutral: "border-zinc-200 dark:border-zinc-800",
};

function IdentityCard({
  icon,
  label,
  children,
  tone,
  colSpan,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone: StatTone;
  colSpan?: number;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 dark:bg-zinc-950 ${IDENTITY_TONE[tone]} ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${STAT_TONE[tone]}`}>{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PropertiesGrid({ r }: { r: Refrigerant }) {
  const rows: Array<{ icon: React.ReactNode; label: string; value: React.ReactNode; tone: StatTone }> = [];

  if (r.physical.boilingPointC !== null) {
    rows.push({
      icon: <Thermometer className="h-3.5 w-3.5" />,
      label: "Boiling point (1 atm)",
      value: <>{r.physical.boilingPointC.toFixed(1)}°C / {r.physical.boilingPointF?.toFixed(1)}°F</>,
      tone: "sky",
    });
  }
  if (r.physical.critical.tempC !== null && r.physical.critical.pressurePsig !== null) {
    rows.push({
      icon: <TrendingPoint />,
      label: "Critical point",
      value: <>{r.physical.critical.tempF?.toFixed(1)}°F at {r.physical.critical.pressurePsig.toFixed(0)} PSIG</>,
      tone: "red",
    });
  } else if (r.composition.length > 0) {
    rows.push({
      icon: <TrendingPoint />,
      label: "Critical point",
      value: <span className="text-zinc-500">No single point — blend critical locus</span>,
      tone: "neutral",
    });
  }
  if (r.physical.molarMassGPerMol !== null) {
    rows.push({
      icon: <Atom className="h-3.5 w-3.5" />,
      label: "Molar mass",
      value: <>{r.physical.molarMassGPerMol.toFixed(2)} g/mol</>,
      tone: "purple",
    });
  }
  rows.push({
    icon: <Waves className="h-3.5 w-3.5" />,
    label: "Temperature glide",
    value: r.physical.hasSignificantGlide
      ? <>{Math.abs(r.physical.temperatureGlideF).toFixed(1)}°F</>
      : <span className="text-zinc-500">Negligible ({r.physical.temperatureGlideF.toFixed(2)}°F)</span>,
    tone: r.physical.hasSignificantGlide ? "purple" : "neutral",
  });
  rows.push({
    icon: <Globe2 className="h-3.5 w-3.5" />,
    label: "ODP",
    value: r.environmental.odp === null ? <span className="text-zinc-500">—</span> : r.environmental.odp,
    tone: r.environmental.odp && r.environmental.odp > 0 ? "red" : "emerald",
  });
  rows.push({
    icon: <Leaf className="h-3.5 w-3.5" />,
    label: "GWP (AR5, 100-yr)",
    value: r.environmental.gwp100Ar5 === null ? <span className="text-zinc-500">—</span> : r.environmental.gwp100Ar5,
    tone:
      r.environmental.gwp100Ar5 === null
        ? "neutral"
        : r.environmental.gwp100Ar5 < 150
        ? "emerald"
        : r.environmental.gwp100Ar5 < 700
        ? "amber"
        : "red",
  });
  if (r.environmental.gwp100Ar6 !== null) {
    rows.push({
      icon: <Leaf className="h-3.5 w-3.5" />,
      label: "GWP (AR6, 100-yr)",
      value: r.environmental.gwp100Ar6,
      tone: "neutral",
    });
  }
  if (r.environmental.atmosphericLifetimeYears !== null) {
    rows.push({
      icon: <Recycle className="h-3.5 w-3.5" />,
      label: "Atmospheric lifetime",
      value: <>{r.environmental.atmosphericLifetimeYears} years</>,
      tone: "neutral",
    });
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${STAT_TONE[row.tone]}`}>{row.icon}</span>
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{row.label}</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{row.value}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TrendingPoint() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 14 L8 8 L10 10 L14 4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ReplacementCard({
  title,
  slugs,
  direction,
}: {
  title: string;
  slugs: string[];
  direction: "from" | "to";
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        {direction === "from" ? <Recycle className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {slugs.map((s) => {
          const target = getRefrigerant(s);
          if (!target) {
            return <li key={s} className="text-sm text-zinc-500">{s} (not in dataset)</li>;
          }
          return (
            <li key={s}>
              <Link
                href={`/refrigerant/${target.slug}/`}
                className="flex items-baseline justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm transition-colors hover:bg-amber-100/40 dark:bg-zinc-950 dark:hover:bg-amber-950/40"
              >
                <span className="font-semibold text-blue-700 dark:text-blue-300">{target.displayName}</span>
                <span className="text-xs text-zinc-500">
                  {target.safetyClass} · GWP {target.environmental.gwp100Ar5 ?? "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RelatedResources({
  slug,
  displayName,
  pairs,
  whatPressureId,
}: {
  slug: string;
  displayName: string;
  pairs: ComparisonSummary[];
  whatPressureId: string | null;
}) {
  return (
    <Section
      id="related"
      icon={<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
      title={`More on ${displayName}`}
      number="12"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {pairs.length > 0 ? (
          <ResourceGroup
            icon={<GitCompareArrows className="h-4 w-4" />}
            label="Pair comparisons"
            tone="amber"
          >
            {pairs.map((p) => (
              <ResourceLink
                key={p.slug}
                href={`/${p.slug}/`}
                label={labelForPair(p, slug, displayName)}
              />
            ))}
          </ResourceGroup>
        ) : null}

        {whatPressureId ? (
          <ResourceGroup
            icon={<Activity className="h-4 w-4" />}
            label="Operating pressures"
            tone="sky"
          >
            <ResourceLink
              href={`/what-pressure-should-${whatPressureId}/`}
              label={`What should ${displayName} pressures be?`}
              sub="Ranges by ambient + diagnostic procedure"
            />
          </ResourceGroup>
        ) : null}

        <ResourceGroup icon={<Calculator className="h-4 w-4" />} label="Calculators" tone="blue">
          <ResourceLink href={`/pt-calculator/?refrigerant=${slug}`} label={`${displayName} PT calculator`} />
          <ResourceLink href={`/superheat-calculator/?refrigerant=${slug}`} label={`${displayName} superheat`} />
          <ResourceLink href={`/subcooling-calculator/?refrigerant=${slug}`} label={`${displayName} subcooling`} />
          <ResourceLink href="/refrigerant-retrofit-compatibility-calculator/" label="Retrofit compatibility" />
        </ResourceGroup>

        <ResourceGroup icon={<BookOpen className="h-4 w-4" />} label="Guides" tone="emerald">
          <ResourceLink
            href="/refrigerant-comparison-guide/"
            label="Refrigerant comparison guide"
            sub="5-axis framework"
          />
          <ResourceLink href="/superheat-subcooling-fundamentals/" label="SH/SC fundamentals" />
        </ResourceGroup>
      </div>
    </Section>
  );
}

function ResourceGroup({
  icon,
  label,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone: StatTone;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 dark:bg-zinc-950 ${IDENTITY_TONE[tone]}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${STAT_TONE[tone]}`}>{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{label}</h3>
      </div>
      <ul className="mt-3 space-y-1.5">{children}</ul>
    </div>
  );
}

function ResourceLink({ href, label, sub }: { href: string; label: string; sub?: string }) {
  return (
    <li>
      <Link href={href} className="group flex items-baseline justify-between gap-2 text-sm">
        <div className="min-w-0 flex-1">
          <span className="text-blue-700 group-hover:underline dark:text-blue-300">{label}</span>
          {sub ? <span className="block text-xs text-zinc-500">{sub}</span> : null}
        </div>
        <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function labelForPair(p: ComparisonSummary, currentSlug: string, currentDisplayName: string): string {
  const partnerSlug = p.refrigerantA === currentSlug ? p.refrigerantB : p.refrigerantA;
  const partner = getRefrigerant(partnerSlug);
  const partnerName = partner ? partner.displayName : partnerSlug;
  return `${currentDisplayName} vs ${partnerName}`;
}

function ProvenanceFooter({ r }: { r: Refrigerant }) {
  const generated = r.dataSource.ptChartGeneratedAt.slice(0, 10);
  return (
    <footer className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        <ScrollText className="h-3.5 w-3.5" /> Data sources &amp; provenance
      </h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-zinc-700 dark:text-zinc-300">PT chart</dt>
          <dd>{r.dataSource.ptChartSource}</dd>
        </div>
        {r.dataSource.ptChartVerifiedAgainst.length > 0 ? (
          <div>
            <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Cross-checked against</dt>
            <dd>{r.dataSource.ptChartVerifiedAgainst.join("; ")}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Properties</dt>
          <dd>{r.dataSource.propertiesSource}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-700 dark:text-zinc-300">GWP</dt>
          <dd>{r.dataSource.gwpSource}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Generated</dt>
          <dd>{generated}</dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        Reference material. Always verify pressure values against the equipment data plate and manufacturer service
        literature before charging or troubleshooting a specific system. Saturation pressure differs from operating
        pressure — see{" "}
        <Link href="/superheat-subcooling-fundamentals/" className="underline">
          superheat &amp; subcooling fundamentals
        </Link>
        .
      </p>
    </footer>
  );
}

interface NoPtChartNoticeProps {
  status: Refrigerant["dataSource"]["dataStatus"];
  ptChartSource: string;
  primarySources?: Refrigerant["dataSource"]["primarySources"];
  displayName: string;
}

function NoPtChartNotice({ status, ptChartSource, primarySources, displayName }: NoPtChartNoticeProps) {
  let title: string;
  let body: React.ReactNode;
  let tone: "amber" | "red" | "zinc";

  switch (status) {
    case "published-eos-not-in-build":
      tone = "amber";
      title = "No PT chart in this build — published primary source exists";
      body = (
        <>
          A published Helmholtz equation of state exists for {displayName} (cited below), but
          is not implemented in this site&apos;s CoolProp 7.2.0 WASM build. The site never
          fabricates values to fill gaps; values would need to be computed by transcribing the
          published Wagner-form ancillary equation coefficients into the dataset. For service
          work, refer directly to the cited primary source.
        </>
      );
      break;
    case "manufacturer-datasheet-published":
      tone = "amber";
      title = "No PT chart in this build — see manufacturer datasheet";
      body = (
        <>
          {displayName} has a published PT chart in its manufacturer&apos;s technical
          datasheet (linked below). The chart has not been transcribed into this site&apos;s
          dataset. For service work, use the manufacturer&apos;s published PT chart directly
          — link below.
        </>
      );
      break;
    case "historical-retired-refrigerant":
      tone = "zinc";
      title = "Retired refrigerant — no current commercial PT chart";
      body = (
        <>
          {displayName} is no longer in commercial service (Montreal Protocol /
          regional phaseouts). Historical PT data exists in archived ASHRAE Handbook
          editions but is not maintained in this site&apos;s current dataset. This page
          remains for historical and identification reference.
        </>
      );
      break;
    case "no-commercial-data-published":
      tone = "red";
      title = "No commercial PT chart published for this refrigerant";
      body = (
        <>
          No published commercial PT chart exists for {displayName}. The
          site never fabricates values. See the citation below for the closest related
          commercial refrigerant where applicable.
        </>
      );
      break;
    default:
      tone = "amber";
      title = "PT chart not available in this build";
      body = (
        <>
          PT data is not available for {displayName} in this build. The site never
          fabricates values to fill gaps. Refer to the primary source below.
        </>
      );
  }

  const toneClasses = {
    amber: "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200",
    red: "border-red-200 bg-red-50/40 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200",
    zinc: "border-zinc-200 bg-zinc-50/60 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300",
  };

  return (
    <div className={`rounded-xl border p-5 text-sm ${toneClasses[tone]}`}>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-3">
          <p>
            <strong>{title}.</strong> {body}
          </p>
          <div className="rounded-md bg-white/60 p-3 text-xs dark:bg-zinc-950/40">
            <div className="font-semibold uppercase tracking-wider text-[10px] opacity-70">
              Source of record
            </div>
            <div className="mt-1">{ptChartSource}</div>
          </div>
          {primarySources && primarySources.length > 0 ? (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-2">
                Primary sources for this refrigerant
              </div>
              <ul className="space-y-2">
                {primarySources.map((s, i) => (
                  <li key={i} className="rounded-md bg-white/60 p-3 text-xs dark:bg-zinc-950/40">
                    <div className="font-semibold opacity-80">{s.type}</div>
                    <div className="mt-1">{s.citation}</div>
                    {s.scope ? (
                      <div className="mt-1 italic opacity-80">{s.scope}</div>
                    ) : null}
                    {s.url ? (
                      <Link
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block break-all text-blue-700 hover:underline dark:text-blue-300"
                      >
                        {s.url}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
