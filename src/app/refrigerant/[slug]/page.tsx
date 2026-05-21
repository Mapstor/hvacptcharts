import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllSlugs, getRefrigerant, getPressureAtTempF, type Refrigerant } from "@/data/refrigerants";
import { loadRefrigerantMdx } from "@/lib/mdx";
import { buildRefrigerantSchema } from "@/lib/schema/refrigerant";
import { SITE_URL } from "@/lib/schema/shared";

import { JsonLd } from "@/components/seo/JsonLd";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { TypeChip } from "@/components/refrigerant/TypeChip";
import { RefrigerantPTCurve } from "@/components/refrigerant/RefrigerantPTCurve";
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
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

export default async function RefrigerantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRefrigerant(slug);
  if (!r) notFound();

  const mdx = loadRefrigerantMdx(slug);
  const faqs = mdx?.frontmatter.faqs ?? [];
  const schema = buildRefrigerantSchema(r, faqs);

  const at70 = getPressureAtTempF(slug, 70);

  return (
    <>
      <JsonLd graph={schema} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{r.displayName}</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{r.displayName} Pressure-Temperature Chart</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TypeChip type={r.type} />
            <SafetyClassChip safetyClass={r.safetyClass} size="md" />
            <span className="text-sm text-zinc-500">ASHRAE {r.ashraeNumber} · {r.chemicalFormula}</span>
          </div>
          {mdx?.frontmatter.introOneLiner ? (
            <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">{mdx.frontmatter.introOneLiner}</p>
          ) : null}
          {at70 ? (
            <div className="mt-5 inline-flex flex-col rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Saturation at 70°F</span>
              <span className="font-mono text-2xl font-semibold">
                {r.physical.hasSignificantGlide
                  ? `${at70.bubble.toFixed(1)} / ${at70.dew.toFixed(1)} PSIG`
                  : `${at70.bubble.toFixed(1)} PSIG`}
              </span>
              {r.physical.hasSignificantGlide ? (
                <span className="text-xs text-zinc-500">bubble / dew (glide {Math.abs(at70.bubble - at70.dew).toFixed(1)} PSI)</span>
              ) : null}
            </div>
          ) : null}
        </header>

        {/* SafetyClassChip card — the structural defense against legacy bug */}
        <section className="mb-8">
          <SafetyClassChip safetyClass={r.safetyClass} variant="card" />
        </section>

        {/* PT chart */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Saturation pressure-temperature curve</h2>
          <RefrigerantPTCurve slug={slug} />
        </section>

        {/* Properties grid */}
        <PropertiesGrid r={r} />

        {/* MDX narrative — only if present */}
        {mdx?.frontmatter.narrative.whatItIs ? (
          <section className="prose prose-zinc mb-10 dark:prose-invert max-w-none">
            <h2>What is {r.displayName}?</h2>
            {paragraphs(mdx.frontmatter.narrative.whatItIs)}
            {(mdx.frontmatter.narrative.whereItsUsed ?? []).length > 0 ? (
              <>
                <h3>Where {r.displayName} is used</h3>
                <ul>
                  {(mdx.frontmatter.narrative.whereItsUsed ?? []).map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </>
            ) : null}
            {mdx.frontmatter.narrative.phaseDownStatus ? (
              <>
                <h3>Regulatory and phase-down status</h3>
                {paragraphs(mdx.frontmatter.narrative.phaseDownStatus)}
              </>
            ) : null}
            {mdx.frontmatter.narrative.serviceNotes ? (
              <>
                <h3>Service notes</h3>
                {paragraphs(mdx.frontmatter.narrative.serviceNotes)}
              </>
            ) : null}
          </section>
        ) : null}

        {/* Glide visualization — only zeotropes */}
        {r.physical.hasSignificantGlide && r.ptChart.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Temperature glide</h2>
            <RefrigerantGlide slug={slug} />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {r.displayName} is a zeotropic blend: at constant pressure it boils across a range of temperatures rather
              than at a single point. This affects EXV sizing, charge measurement, and superheat measurement —
              measurement reference points need to be consistent.
            </p>
          </section>
        ) : null}

        {/* Cycle diagram */}
        {r.ptChart.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Operating cycle</h2>
            <RefrigerantCycle slug={slug} />
          </section>
        ) : null}

        {/* Phase-down timeline */}
        <section className="mb-10">
          <RefrigerantPhaseDown slug={slug} />
        </section>

        {/* GWP comparison */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Global warming potential, in context</h2>
          <RefrigerantGWPComparison currentSlug={slug} />
        </section>

        {/* Replaces / replaced-by cards */}
        {((r.replaces && r.replaces.length > 0) || r.replacementOptions.length > 0) ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Retrofit and replacement paths</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {r.replaces && r.replaces.length > 0 ? (
                <ReplacementCard title={`${r.displayName} replaces`} slugs={r.replaces} />
              ) : null}
              {r.replacementOptions.length > 0 ? (
                <ReplacementCard title={`Replacements for ${r.displayName}`} slugs={r.replacementOptions} />
              ) : null}
            </div>
          </section>
        ) : null}

        {/* MDX body — appears between retrofit and FAQ for custom diagrams etc. */}
        {mdx && mdx.body.length > 0 ? (
          <section className="prose prose-zinc mb-10 dark:prose-invert max-w-none">
            <MDXRemote source={mdx.body} components={mdxComponents as never} />
          </section>
        ) : null}

        {/* FAQ */}
        {faqs.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                  <summary className="cursor-pointer list-none font-semibold">
                    <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <div className="prose prose-sm prose-zinc mt-3 dark:prose-invert max-w-none">
                    {paragraphs(f.a)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* Data download links */}
        <section className="mb-10 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <h2 className="text-base font-semibold">Download this dataset</h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">CC BY 4.0 — free for any use with attribution.</p>
          <div className="mt-3 flex gap-3">
            <a href={`/data/refrigerant/${r.slug}/csv/`} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">CSV</a>
            <a href={`/data/refrigerant/${r.slug}/json/`} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">JSON</a>
          </div>
        </section>

        {/* Provenance footer */}
        <ProvenanceFooter r={r} />
      </article>
    </>
  );
}

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p, i) => <p key={i}>{p.trim()}</p>);
}

function PropertiesGrid({ r }: { r: Refrigerant }) {
  const rows: Array<{ label: string; value: React.ReactNode }> = [];
  if (r.physical.boilingPointC !== null) {
    rows.push({
      label: "Boiling point (1 atm)",
      value: <>{r.physical.boilingPointC.toFixed(1)}°C / {r.physical.boilingPointF?.toFixed(1)}°F</>,
    });
  }
  if (r.physical.critical.tempC !== null && r.physical.critical.pressurePsig !== null) {
    rows.push({
      label: "Critical point",
      value: <>{r.physical.critical.tempC.toFixed(1)}°C / {r.physical.critical.tempF?.toFixed(1)}°F at {r.physical.critical.pressurePsig.toFixed(0)} PSIG</>,
    });
  } else if (r.composition.length > 0) {
    rows.push({
      label: "Critical point",
      value: <span className="text-zinc-500">No single point (blend critical locus)</span>,
    });
  }
  if (r.physical.molarMassGPerMol !== null) {
    rows.push({
      label: "Molar mass",
      value: <>{r.physical.molarMassGPerMol.toFixed(2)} g/mol</>,
    });
  }
  rows.push({
    label: "Temperature glide",
    value: r.physical.hasSignificantGlide
      ? <>{r.physical.temperatureGlideF.toFixed(1)}°F</>
      : <span className="text-zinc-500">Negligible ({r.physical.temperatureGlideF.toFixed(2)}°F)</span>,
  });
  rows.push({
    label: "ODP",
    value: r.environmental.odp === null ? <span className="text-zinc-500">—</span> : r.environmental.odp,
  });
  rows.push({
    label: "GWP (IPCC AR5, 100-yr)",
    value: r.environmental.gwp100Ar5 === null ? <span className="text-zinc-500">—</span> : r.environmental.gwp100Ar5,
  });
  if (r.environmental.gwp100Ar6 !== null) {
    rows.push({ label: "GWP (IPCC AR6, 100-yr)", value: r.environmental.gwp100Ar6 });
  }
  if (r.environmental.atmosphericLifetimeYears !== null) {
    rows.push({ label: "Atmospheric lifetime", value: <>{r.environmental.atmosphericLifetimeYears} years</> });
  }

  return (
    <section className="mb-10 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      <h2 className="sr-only">Properties</h2>
      {rows.map((row) => (
        <div key={row.label} className="border-b border-zinc-200 py-2 dark:border-zinc-800">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">{row.label}</dt>
          <dd className="mt-0.5 font-mono text-sm">{row.value}</dd>
        </div>
      ))}
      {r.composition.length > 0 ? (
        <div className="sm:col-span-2 lg:col-span-3 border-b border-zinc-200 py-2 dark:border-zinc-800">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Composition</dt>
          <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
            {r.composition.map((c) => (
              <span key={c.component}>{c.component}: <strong>{(c.massFraction * 100).toFixed(1)}%</strong></span>
            ))}
          </dd>
        </div>
      ) : null}
      {r.lubricants.compatible.length > 0 ? (
        <div className="sm:col-span-2 lg:col-span-3 border-b border-zinc-200 py-2 dark:border-zinc-800">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Lubricant compatibility</dt>
          <dd className="mt-1 text-sm">
            <span className="font-mono">{r.lubricants.compatible.join(", ")}</span>
            {r.lubricants.incompatible.length > 0 ? (
              <span className="text-zinc-500"> (incompatible: <span className="font-mono">{r.lubricants.incompatible.join(", ")}</span>)</span>
            ) : null}
            {r.lubricants.notes ? <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{r.lubricants.notes}</p> : null}
          </dd>
        </div>
      ) : null}
    </section>
  );
}

function ReplacementCard({ title, slugs }: { title: string; slugs: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
      <ul className="mt-2 space-y-1">
        {slugs.map((s) => {
          const target = getRefrigerant(s);
          if (!target) {
            return <li key={s} className="text-sm text-zinc-500">{s} (not in dataset)</li>;
          }
          return (
            <li key={s} className="text-sm">
              <Link href={`/refrigerant/${target.slug}/`} className="text-blue-700 hover:underline dark:text-blue-300">
                {target.displayName}
              </Link>
              <span className="text-zinc-500"> · {target.safetyClass}, GWP {target.environmental.gwp100Ar5 ?? "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProvenanceFooter({ r }: { r: Refrigerant }) {
  const generated = r.dataSource.ptChartGeneratedAt.slice(0, 10);
  return (
    <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Data sources & provenance</h2>
      <dl className="mt-2 space-y-1">
        <div><dt className="inline font-semibold">PT chart:</dt> <dd className="inline">{r.dataSource.ptChartSource}</dd></div>
        {r.dataSource.ptChartVerifiedAgainst.length > 0 ? (
          <div>
            <dt className="inline font-semibold">Cross-checked against:</dt>{" "}
            <dd className="inline">{r.dataSource.ptChartVerifiedAgainst.join("; ")}.</dd>
          </div>
        ) : null}
        <div><dt className="inline font-semibold">Properties:</dt> <dd className="inline">{r.dataSource.propertiesSource}</dd></div>
        <div><dt className="inline font-semibold">GWP:</dt> <dd className="inline">{r.dataSource.gwpSource}</dd></div>
        <div><dt className="inline font-semibold">Generated:</dt> <dd className="inline">{generated}</dd></div>
      </dl>
      <p className="mt-3">
        This page is provided as a reference. Always verify pressure values against the equipment data plate and
        manufacturer service literature before charging or troubleshooting a specific system. Saturation pressure
        differs from operating pressure; see <Link href="/superheat-subcooling-fundamentals/" className="underline">superheat &amp; subcooling fundamentals</Link>.
      </p>
    </footer>
  );
}
