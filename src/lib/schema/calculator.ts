import type { FAQ } from "@/lib/mdx";
import { ORG, SITE_URL, WEBSITE } from "./shared";

export interface CalculatorSchemaInput {
  /** Path segment, no leading or trailing slash. e.g. "superheat-calculator". */
  path: string;
  /** Display name for Article headline + WebApplication name. */
  name: string;
  /** Article description + WebApplication description. */
  description: string;
  /** WebApplication featureList — short bullet phrases. */
  featureList: string[];
  /** ISO date for datePublished / dateModified. */
  publishedDate: string;
  faqs?: FAQ[];
  /** Breadcrumb leaf — defaults to `name`. */
  breadcrumbLabel?: string;
}

export function buildCalculatorSchema({
  path,
  name,
  description,
  featureList,
  publishedDate,
  faqs = [],
  breadcrumbLabel,
}: CalculatorSchemaInput): object[] {
  const pageUrl = `${SITE_URL}/${path}/`;
  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: name,
      description,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      datePublished: publishedDate,
      dateModified: publishedDate,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
    },
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name,
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web browser (any)",
      url: pageUrl,
      browserRequirements: "Requires JavaScript enabled",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList,
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators-hub/` },
      { "@type": "ListItem", position: 3, name: breadcrumbLabel ?? name },
    ],
  });

  return graph;
}
