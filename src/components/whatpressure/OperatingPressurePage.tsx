import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { AHRI_GUIDELINE_N_CITATION, ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { contentDates, UpdatedLine } from "@/lib/content-dates";
import { getRefrigerant } from "@/data/refrigerants";
import { loadOperating } from "@/lib/mdx-operating";
import { buildOperatingData, fill, methodParagraphs, type RenderedSection } from "@/lib/operating-page-data";
import {
  AHRI_1250_URL,
  AHRI_210_240_URL,
  COOLER_COIL_F,
  EM_DASH,
  FREEZER_COIL_F,
  GAP_NOTE,
  type Band,
} from "@/data/operating-pressures";

/* ─────────────────────────── inline markdown ─────────────────────────── */

// Minimal renderer: **bold**, *em*, [label](href). No raw HTML.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) nodes.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2]) nodes.push(<em key={k++}>{m[2]}</em>);
    else if (m[3] && m[4]) {
      const href = m[4];
      const internal = href.startsWith("/");
      nodes.push(
        internal ? (
          <Link key={k++} href={href} className="underline">{m[3]}</Link>
        ) : (
          <a key={k++} href={href} className="underline" rel="noopener">{m[3]}</a>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Strip markdown markup for schema string values. */
function stripMd(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function paragraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

/* ─────────────────────────── pressure table ─────────────────────────── */

interface OpCol {
  header: string;
  align?: "left" | "right";
}
interface OpCell {
  /** Primary display text. */
  main: string;
  /** Muted secondary line (e.g. kPa, °C). */
  sub?: string;
  /** Machine-readable psig string for the gate (module output). */
  psig?: string;
  /** Machine-readable kPa string for the gate. */
  kpa?: string;
  left?: boolean;
}

/**
 * Contained, horizontally-scrollable table. Wrapped in data-src="dataset" so
 * verify-numeric-consistency trusts these dataset-computed numbers; the
 * verify-operating-pages gate is the authority on them, reading data-psig /
 * data-kpa attributes.
 */
function OpTable({
  caption,
  source,
  columns,
  rows,
  chart,
  sectionKind,
}: {
  caption: string;
  source?: ReactNode;
  columns: OpCol[];
  rows: OpCell[][];
  chart?: boolean;
  sectionKind?: string;
}) {
  const hasGap = rows.some((r) => r.some((c) => c.psig === EM_DASH));
  return (
    <figure className="my-5" data-src="dataset">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm" data-op-table={chart ? "chart" : "table"} data-op-section={sectionKind}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
              {columns.map((c, i) => (
                <th key={i} className={`px-3 py-2 ${c.align === "left" || i === 0 ? "text-left" : "text-right"}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, ri) => (
              <tr key={ri} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                {cells.map((cell, ci) => (
                  <td
                    key={ci}
                    data-psig={cell.psig}
                    data-kpa={cell.kpa}
                    className={`px-3 py-2 ${cell.left || ci === 0 ? "text-left font-medium" : "text-right font-mono tabular-nums"}`}
                  >
                    <span>{cell.main}</span>
                    {cell.sub ? (
                      <span className="block text-[11px] font-normal text-zinc-500">{cell.sub}</span>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-1.5 text-xs text-zinc-500">
        {caption}
        {source ? <> — {source}</> : null}
        {hasGap ? <span className="block">{EM_DASH} {GAP_NOTE}</span> : null}
      </figcaption>
    </figure>
  );
}

const fahr = (f: number, c: string) => ({ main: `${f}°F`, sub: `${c}°C`, left: true });
const pcell = (b: Band): OpCell => ({ main: `${b.psigStr} psig`, sub: `${b.kpaStr} kPa`, psig: b.psigStr, kpa: b.kpaStr });

/* ─────────────────────────── section renderer ─────────────────────────── */

function SectionBody({ body }: { body?: string }) {
  if (!body) return null;
  return (
    <div data-src="dataset">
      {paragraphs(body).map((p, i) => (
        <p key={i} className="mt-3 text-zinc-700 dark:text-zinc-300">{renderInline(p)}</p>
      ))}
    </div>
  );
}

function renderSection(sec: RenderedSection, coolprop: string): ReactNode {
  const heading = (
    <h2 className="mb-3 mt-10 text-2xl font-semibold tracking-tight">{sec.h2}</h2>
  );
  const note = sec.note ? (
    <p className="mt-2 text-sm text-zinc-500" data-src="dataset">{renderInline(sec.note)}</p>
  ) : null;

  const coolpropSource = `Computed from the ${coolprop} pressure–temperature dataset.`;

  if (sec.residentialChart) {
    const { low, rows } = sec.residentialChart;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
chart
          caption="Operating pressure by outdoor temperature (65–115°F)"
          source={coolpropSource}
          columns={[{ header: "Outdoor" }, { header: "Low side (psig / kPa)" }, { header: "High side (psig / kPa)" }]}
          rows={rows.map((r) => [
            { ...fahr(r.outdoorF, r.outdoorC) },
            pcell(low),
            pcell(r.band),
          ])}
        />
        <p className="mt-1 text-sm text-zinc-500" data-src="dataset">
          The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.
        </p>
        {note}
      </section>
    );
  }

  if (sec.headChart) {
    const { rows } = sec.headChart;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
chart
          caption="Head (discharge) pressure by outdoor temperature (65–115°F)"
          source={coolpropSource}
          columns={[{ header: "Outdoor" }, { header: "Head (psig / kPa)" }]}
          rows={rows.map((r) => [{ ...fahr(r.outdoorF, r.outdoorC) }, pcell(r.band)])}
        />
        {note}
      </section>
    );
  }

  if (sec.applicationSuction) {
    const { cooler, freezer } = sec.applicationSuction;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="Suction pressure by application (AHRI 1250-2020 walk-in coil temperatures)"
          source={<a href={AHRI_1250_URL} className="underline" rel="noopener">AHRI 1250-2020, Tables 16 and 17</a>}
          columns={[{ header: "Application" }, { header: "Suction (psig / kPa)" }]}
          rows={[
            [{ main: `Walk-in cooler (${COOLER_COIL_F}°F coil)`, left: true }, pcell(cooler)],
            [{ main: `Walk-in freezer (${FREEZER_COIL_F}°F coil)`, left: true }, pcell(freezer)],
          ]}
        />
        {note}
      </section>
    );
  }

  if (sec.standing) {
    const { rows, mode } = sec.standing;
    const label = mode === "range" ? "Standing (dew–bubble, psig / kPa)" : "Standing (psig / kPa)";
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="Standing pressure with the system off and equalized"
          source={coolpropSource}
          columns={[{ header: "Off temperature" }, { header: label }]}
          rows={rows.map((r) => [
            { ...fahr(r.tempF, r.tempC) },
            { main: `${r.psigStr} psig`, sub: `${r.kpaStr} kPa`, psig: r.psigStr, kpa: r.kpaStr },
          ])}
        />
        {note}
      </section>
    );
  }

  if (sec.comparisonAnchor) {
    const { rows } = sec.comparisonAnchor;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="Side by side at 95°F outdoors"
          source={coolpropSource}
          columns={[{ header: "Refrigerant" }, { header: "Low side (psig / kPa)" }, { header: "High side (psig / kPa)" }]}
          rows={rows.map((row) => [
            { main: row.name, left: true },
            pcell(row.low),
            pcell(row.high),
          ])}
        />
        {note}
      </section>
    );
  }

  if (sec.comparisonChart) {
    const c = sec.comparisonChart;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
chart
          caption={`${c.selfName} vs ${c.otherName} high side by outdoor temperature (65–115°F)`}
          source={coolpropSource}
          columns={[
            { header: "Outdoor" },
            { header: `${c.selfName} high (psig / kPa)` },
            { header: `${c.otherName} high (psig / kPa)` },
          ]}
          rows={c.rows.map((r) => [{ ...fahr(r.outdoorF, r.outdoorC) }, pcell(r.self), pcell(r.other)])}
        />
        <p className="mt-1 text-sm text-zinc-500" data-src="dataset">
          Low side (following a 38–45°F indoor coil): {c.selfName} {c.selfLow.psigStr} psig vs {c.otherName} {c.otherLow.psigStr} psig.
        </p>
        {note}
      </section>
    );
  }

  if (sec.co2Suction) {
    const { cooler, freezer } = sec.co2Suction;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="CO₂ suction pressure by application (AHRI 1250-2020 walk-in coil temperatures)"
          source={<a href={AHRI_1250_URL} className="underline" rel="noopener">AHRI 1250-2020, Tables 16 and 17</a>}
          columns={[{ header: "Application" }, { header: "Suction (psig / kPa)" }]}
          rows={[
            [{ main: `Walk-in cooler (${COOLER_COIL_F}°F coil)`, left: true }, pcell(cooler)],
            [{ main: `Walk-in freezer (${FREEZER_COIL_F}°F coil)`, left: true }, pcell(freezer)],
          ]}
        />
        {note}
      </section>
    );
  }

  if (sec.co2HighSide) {
    const { rows, critical } = sec.co2HighSide;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="Subcritical high-side (condensing) pressure, 40–85°F"
          source={coolpropSource}
          columns={[{ header: "Condensing temperature" }, { header: "High side (psig / kPa)" }]}
          rows={rows.map((r) => [
            { ...fahr(r.tempF, r.tempC) },
            { main: `${r.cell.psigStr} psig`, sub: `${r.cell.kpaStr} kPa`, psig: r.cell.psigStr, kpa: r.cell.kpaStr },
          ])}
        />
        {critical ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400" data-src="dataset">
            Critical point (from the dataset): {critical.tempFStr} / {critical.psigStr} psig. Above {critical.tempFStr} there is no saturation pressure — operation is transcritical and the high-pressure control valve, not a saturation temperature, sets the gas-cooler pressure. There is no single &ldquo;normal&rdquo; transcritical number.
          </p>
        ) : null}
        {note}
      </section>
    );
  }

  if (sec.co2Standstill) {
    const { rows } = sec.co2Standstill;
    return (
      <section key={sec.h2}>
        {heading}
        <SectionBody body={sec.body} />
        <OpTable
          sectionKind={sec.kind}
caption="Standstill (system off) saturation pressure, 65–85°F"
          source={coolpropSource}
          columns={[{ header: "Off temperature" }, { header: "Standstill (psig / kPa)" }]}
          rows={rows.map((r) => [
            { ...fahr(r.tempF, r.tempC) },
            { main: `${r.cell.psigStr} psig`, sub: `${r.cell.kpaStr} kPa`, psig: r.cell.psigStr, kpa: r.cell.kpaStr },
          ])}
        />
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Above the critical temperature the fluid is supercritical, so there is no standstill saturation pressure to read.
        </p>
        {note}
      </section>
    );
  }

  // prose
  return (
    <section key={sec.h2}>
      {heading}
      <SectionBody body={sec.body} />
      {note}
    </section>
  );
}

/* ─────────────────────────── schema ─────────────────────────── */

function buildSchema(pageUrl: string, fm: ReturnType<typeof loadOperating>, slug: string, id: string, faqs: { q: string; a: string }[]) {
  const d = contentDates(`/what-pressure-should-${id}/`);
  const front = fm!.frontmatter;
  const r = getRefrigerant(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: any[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: front.h1,
      description: front.introOneLiner,
      datePublished: d.published,
      dateModified: d.updated,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: pageUrl,
      about: r ? { "@id": `${SITE_URL}/refrigerant/${slug}/#refrigerant` } : undefined,
      citation: [AHRI_GUIDELINE_N_CITATION],
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "PT Charts & Tools", item: `${SITE_URL}/pt-charts-tools-hub/` },
        { "@type": "ListItem", position: 3, name: front.h1 },
      ],
    },
  ];
  return graph;
}

/* ─────────────────────────── metadata ─────────────────────────── */

export function buildOperatingMetadata(id: string): Metadata {
  const path = `/what-pressure-should-${id}/`;
  const loaded = loadOperating(id);
  if (!loaded) {
    return pageMetadata({ title: `What Pressure Should ${id.toUpperCase()} Be?`, description: "Operating pressure reference.", path });
  }
  const fm = loaded.frontmatter;
  const { slots } = buildOperatingData(fm);
  return pageMetadata({
    title: fm.metaTitle,
    description: fill(fm.metaDescription, slots),
    path,
  });
}

/* ─────────────────────────── page ─────────────────────────── */

export function OperatingPressurePage({ id }: { id: string }) {
  const loaded = loadOperating(id);
  if (!loaded) notFound();
  const fm = loaded.frontmatter;
  const slug = fm.refrigerantSlug;
  const r = getRefrigerant(slug);
  if (!r) notFound();

  const data = buildOperatingData(fm);
  const pageUrl = `${SITE_URL}/what-pressure-should-${id}/`;
  const answer = fill(fm.answerBlock, data.slots);
  const filledFaqs = fm.faqs.map((f) => ({ q: f.q, a: stripMd(fill(f.a, data.slots)) }));
  const schema = buildSchema(pageUrl, loaded, slug, id, filledFaqs);

  const method = fm.methodNote ? fill(fm.methodNote, data.slots) : null;

  return (
    <>
      <JsonLd graph={schema} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts &amp; Tools</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{fm.h1}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{fm.h1}</h1>
          <UpdatedLine route={`/what-pressure-should-${id}/`} />
          <p className="mt-3 text-sm text-zinc-500">
            <Link href={`/refrigerant/${slug}/`} className="underline">{r.displayName}</Link>{" "}
            <SafetyClassChip safetyClass={r.safetyClass} />
          </p>
        </header>

        {/* intro */}
        <div className="text-lg text-zinc-700 dark:text-zinc-300">
          {fm.intro.map((p, i) => (
            <p key={i} className={i === 0 ? "" : "mt-4"}>{renderInline(p)}</p>
          ))}
        </div>

        {/* answer block */}
        <div
          className="mt-5 rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-700/60 dark:bg-emerald-900/20"
          data-src="dataset"
          data-answer-block
        >
          <p className="text-zinc-800 dark:text-zinc-200">{renderInline(answer)}</p>
        </div>

        {/* sections */}
        {data.sections.map((sec) => (
          <Fragment key={sec.h2}>{renderSection(sec, data.coolpropSource)}</Fragment>
        ))}

        {/* FAQ */}
        <section>
          <h2 className="mb-3 mt-10 text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {fm.faqs.map((f, i) => (
              <details key={i} className="group py-3">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <div className="mt-2 text-zinc-700 dark:text-zinc-300" data-src="dataset">
                  {paragraphs(fill(f.a, data.slots)).map((p, j) => (
                    <p key={j} className={j === 0 ? "" : "mt-2"}>{renderInline(p)}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* method */}
        <section>
          <h2 className="mb-3 mt-10 text-2xl font-semibold tracking-tight">How these numbers are calculated</h2>
          <div className="text-zinc-700 dark:text-zinc-300">
            {methodParagraphs(data.kind, data.coolpropSource, r.displayName).map((p, i) => (
              <p key={i} className={i === 0 ? "" : "mt-3"}>{p}</p>
            ))}
            {method ? <p className="mt-3">{renderInline(method)}</p> : null}
            <p className="mt-3">
              Sources: {data.coolpropSource}; AHRI 210/240-2023 (
              <a href={AHRI_210_240_URL} className="underline" rel="noopener">rating conditions</a>) and AHRI 1250-2020 (
              <a href={AHRI_1250_URL} className="underline" rel="noopener">walk-in ratings</a>). Your equipment maker&apos;s
              charging chart or the unit data plate overrides these reference values for that specific system.
            </p>
          </div>
        </section>

        {/* related links */}
        <section>
          <h2 className="mb-3 mt-10 text-2xl font-semibold tracking-tight">Related</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {fm.links.map((l, i) => (
              <li key={i}>
                <Link href={l.href} className="underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
