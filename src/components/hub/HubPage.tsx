import Link from "next/link";
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
}

export interface HubPageProps {
  /** Path segment (no leading/trailing slash), e.g. "calculators-hub". */
  path: string;
  title: string;
  introHeadline: string;
  introBody: string;
  sections: HubSection[];
  /** Breadcrumb leaf — defaults to title. */
  breadcrumbLabel?: string;
  /** Optional crosslinks to other hubs. */
  crosslinks?: Array<{ href: string; label: string }>;
  /** ISO date for schema. */
  publishedDate: string;
}

export function HubPage({
  path,
  title,
  introHeadline,
  introBody,
  sections,
  breadcrumbLabel,
  crosslinks,
  publishedDate,
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

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-xl font-semibold">{section.heading}</h2>
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
      </article>
    </>
  );
}
