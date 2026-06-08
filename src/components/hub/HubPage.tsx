import Link from "next/link";
import { Compass, Lightbulb, ScrollText, type LucideIcon } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

export interface HubItem {
  href: string;
  label: string;
  blurb: string;
  /** Optional small tag like "Top traffic" or "Pending" rendered as a chip. */
  tag?: string;
}

export interface HubSection {
  heading: string;
  items: HubItem[];
  /** Optional one-sentence description for the section. */
  description?: string;
}

export interface ScenarioPick {
  /** Short description of the situation, e.g. "I'm charging an R-410A residential AC". */
  situation: string;
  /** Which tool to use. */
  href: string;
  toolLabel: string;
  /** Brief reasoning. */
  reasoning: string;
}

export interface LearningPath {
  title: string;
  description: string;
  steps: { href: string; label: string }[];
}

export interface AboutSection {
  heading: string;
  body: string;
}

export interface HubFaq {
  q: string;
  a: string;
}

export interface HubPageProps {
  /** Path segment (no leading/trailing slash), e.g. "calculators-hub". */
  path: string;
  title: string;
  introHeadline: string;
  introBody: string;
  sections: HubSection[];
  /** Optional scenario-to-tool quick picks. */
  scenarios?: ScenarioPick[];
  /** Optional curated learning sequences. */
  learningPaths?: LearningPath[];
  /** Optional rich content sections (about, methodology, etc.). */
  aboutSections?: AboutSection[];
  /** Optional FAQ accordion. */
  faqs?: HubFaq[];
  /** Breadcrumb leaf — defaults to title. */
  breadcrumbLabel?: string;
  /** Optional crosslinks to other hubs. */
  crosslinks?: Array<{ href: string; label: string }>;
  /** ISO date for schema. */
  publishedDate: string;
  /** Optional sources/provenance footer text. */
  sourcesNote?: string;
}

export function HubPage({
  path,
  title,
  introHeadline,
  introBody,
  sections,
  scenarios,
  learningPaths,
  aboutSections,
  faqs,
  breadcrumbLabel,
  crosslinks,
  publishedDate,
  sourcesNote,
}: HubPageProps) {
  const pageUrl = `${SITE_URL}/${path}/`;
  const allItems = sections.flatMap((s) => s.items);

  const schemaGraph = [
    ORG,
    WEBSITE,
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collectionpage`,
      name: title,
      description: introHeadline,
      url: pageUrl,
      datePublished: publishedDate,
      dateModified: publishedDate,
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: allItems.length,
        itemListElement: allItems.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}${it.href}`,
          name: it.label,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: breadcrumbLabel ?? title },
      ],
    },
  ];

  return (
    <>
      <JsonLd graph={schemaGraph} />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{breadcrumbLabel ?? title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">{introHeadline}</p>
          {introBody ? (
            <p className="mt-3 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{introBody}</p>
          ) : null}
        </header>

        {scenarios && scenarios.length > 0 ? (
          <section className="mb-10 rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">Quick picks — what to use when</h2>
            </div>
            <p className="mb-3 text-xs text-amber-800 dark:text-amber-200">
              Scenario-driven recommendations. Pick the situation that matches your service call.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {scenarios.map((s, i) => (
                <li key={i} className="rounded-md border border-amber-200 bg-white p-3 dark:border-amber-900/40 dark:bg-zinc-950/60">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Scenario</div>
                  <div className="text-sm font-semibold">{s.situation}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Use</div>
                  <Link href={s.href} className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
                    {s.toolLabel}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{s.reasoning}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-1 text-xl font-semibold">{section.heading}</h2>
              {section.description ? (
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{section.description}</p>
              ) : (
                <div className="mb-4" />
              )}
              <ul className="grid gap-3 sm:grid-cols-2">
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="block h-full rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{it.label}</h3>
                        {it.tag ? (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{it.tag}</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{it.blurb}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {learningPaths && learningPaths.length > 0 ? (
          <section className="mt-12 rounded-xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100">Recommended learning paths</h2>
            </div>
            <p className="mb-4 text-xs text-blue-800 dark:text-blue-200">
              Curated sequences for working through these resources in order.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {learningPaths.map((path, i) => (
                <div key={i} className="rounded-md border border-blue-200 bg-white p-4 dark:border-blue-900/40 dark:bg-zinc-950/60">
                  <h3 className="text-sm font-semibold">{path.title}</h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{path.description}</p>
                  <ol className="mt-3 space-y-1.5 text-sm">
                    {path.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {j + 1}
                        </span>
                        <Link href={step.href} className="text-blue-700 hover:underline dark:text-blue-300">
                          {step.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {aboutSections && aboutSections.length > 0 ? (
          <section className="mt-12 space-y-6">
            {aboutSections.map((s, i) => (
              <article key={i} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
                <h2 className="text-lg font-semibold">{s.heading}</h2>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {s.body.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {faqs && faqs.length > 0 ? (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold">Frequently asked</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                  <summary className="cursor-pointer list-none font-semibold text-sm">
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
        ) : null}

        {crosslinks && crosslinks.length > 0 ? (
          <aside className="mt-12 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Other hubs</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {crosslinks.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-blue-700 hover:underline dark:text-blue-300">{c.label}</Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <footer className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources &amp; provenance</h2>
          </div>
          <p className="mt-2">
            {sourcesNote ?? `All saturation values and refrigerant properties come from the verified dataset: CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. Safety classifications per ANSI/ASHRAE Standard 34-2022. GWP per IPCC AR5 (2013). Operating ranges and diagnostic procedures per ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022, AHRI Standard 540-2020, and equipment manufacturer service literature.`}
          </p>
          <p className="mt-3">
            Last regenerated {publishedDate.slice(0, 10)}. All pages and data are licensed for
            free reference use; verification against equipment manufacturer literature is the
            responsibility of the user.
          </p>
        </footer>
      </article>
    </>
  );
}
